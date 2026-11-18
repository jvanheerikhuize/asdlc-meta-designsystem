/**
 * Headless Chrome CDP end-to-end verification for SPC-0001.
 * Verifies ASM-0001, ASM-0002, REQ-0002, REQ-0003, REQ-0007.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/usr/bin/google-chrome-stable';
const PORT = 8779;

async function waitForJson(url, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class CdpClient {
  #ws;
  #id = 0;
  #pending = new Map();
  consoleErrors = [];
  pageErrors = [];

  constructor(wsUrl) {
    this.#ws = new WebSocket(wsUrl);
    this.#ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.#pending.has(msg.id)) {
        const { resolve, reject } = this.#pending.get(msg.id);
        this.#pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        this.consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
      } else if (msg.method === 'Runtime.exceptionThrown') {
        this.pageErrors.push(msg.params.exceptionDetails.text);
      }
    });
  }

  async ready() {
    if (this.#ws.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.#ws.addEventListener('open', resolve, { once: true });
      this.#ws.addEventListener('error', reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = ++this.#id;
    this.#ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.#pending.set(id, { resolve, reject }));
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval threw: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  close() {
    this.#ws.close();
  }
}

async function main() {
  const userDataDir = mkdtempSync(join(tmpdir(), 'asdlc-ds-chrome-'));
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', join(ROOT, 'site')], {
    stdio: 'ignore',
  });
  let chrome;
  let cdp;

  try {
    await waitForJson(`http://127.0.0.1:${PORT}/data/index.json`);
    const cdpPort = 9229;
    chrome = spawn(CHROME, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ], { stdio: 'ignore' });

    const targets = await waitForJson(`http://127.0.0.1:${cdpPort}/json`);
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // 1. Verify Spec Dashboard (/) and link to ./showcase/ (REQ-0007)
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
    await new Promise((r) => setTimeout(r, 600));
    const dash = await cdp.eval(`(() => ({
      title: document.title,
      showcaseHref: document.querySelector('a[href="./showcase/"]')?.getAttribute('href'),
    }))()`);
    assert.equal(dash.showcaseHref, './showcase/');

    // 2. Verify Showcase (/showcase/) and link back to ../ (REQ-0007)
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/showcase/` });
    await new Promise((r) => setTimeout(r, 600));
    const showcase = await cdp.eval(`(() => {
      const tags = [
        'ui-button', 'ui-input', 'ui-label', 'ui-badge', 'ui-icon', 'ui-skeleton',
        'ui-field', 'ui-search-bar', 'ui-media-card',
        'ui-navbar', 'ui-modal', 'ui-catalog-grid',
        'page-shell', 'catalog-layout',
      ];
      const defined = tags.every((t) => Boolean(customElements.get(t)));
      const shadows = tags.every((t) => Boolean(document.querySelector(t)?.shadowRoot));
      const backHref = document.querySelector('[data-testid="back-to-dashboard"]')?.getAttribute('href');
      const bgDark = getComputedStyle(document.body).backgroundColor;
      return { defined, shadows, backHref, bgDark };
    })()`);
    assert.equal(showcase.defined, true, 'All 14 components must be defined');
    assert.equal(showcase.shadows, true, 'All 14 components must have Shadow DOM');
    assert.equal(showcase.backHref, '../');
    assert.equal(showcase.bgDark, 'rgb(8, 8, 11)', 'Dark default --color-bg should be #08080b');

    // 3. Verify ui-navbar theme toggle propagates across Shadow DOM (ASM-0001, REQ-0002)
    const lightBg = await cdp.eval(`(() => {
      document.getElementById('navbar').shadowRoot.getElementById('theme-btn').shadowRoot.querySelector('button').click();
      return {
        attr: document.documentElement.getAttribute('data-theme'),
        bgLight: getComputedStyle(document.body).backgroundColor,
      };
    })()`);
    assert.equal(lightBg.attr, 'light');
    assert.equal(lightBg.bgLight, 'rgb(250, 250, 250)', 'Light --color-bg should be #fafafa');

    // 4. Verify ui-search-bar filters ui-catalog-grid on Enter / button click (REQ-0004)
    const searchCheck = await cdp.eval(`(() => {
      const sb = document.getElementById('catalog-search');
      const innerInput = sb.shadowRoot.querySelector('ui-input').shadowRoot.querySelector('input');
      innerInput.value = 'ui-modal';
      innerInput.dispatchEvent(new Event('input', { bubbles: true }));
      sb.shadowRoot.querySelector('ui-button').shadowRoot.querySelector('button').click();
      const visibleCards = Array.from(document.querySelectorAll('#catalog-grid ui-media-card')).filter((c) => !c.hidden);
      return {
        countText: document.getElementById('catalog-count').textContent,
        visibleIds: visibleCards.map((c) => c.getAttribute('card-id')),
      };
    })()`);
    assert.equal(searchCheck.countText, '1 component');
    assert.deepEqual(searchCheck.visibleIds, ['ui-modal']);

    // 5. Verify ui-modal opens from ui-media-card, closes on Done button, and restores focus (REQ-0005)
    await cdp.send('Page.bringToFront');
    const modalOpened = await cdp.eval(`(() => {
      const card = document.querySelector('#catalog-grid ui-media-card[card-id="ui-modal"]');
      card.shadowRoot.querySelector('button.card').click();
      const modal = document.getElementById('detail-modal');
      return modal.hasAttribute('open') && modal.shadowRoot.querySelector('dialog').open;
    })()`);
    assert.equal(modalOpened, true, 'Modal must open when card is activated');

    await cdp.eval(`document.getElementById('modal-done-btn').shadowRoot.querySelector('button').click()`);
    await new Promise((r) => setTimeout(r, 50));
    const modalClosed = await cdp.eval(`(() => {
      const modal = document.getElementById('detail-modal');
      return {
        closed: !modal.hasAttribute('open') && !modal.shadowRoot.querySelector('dialog').open,
        focusedId: document.activeElement?.getAttribute('card-id'),
        activeTag: document.activeElement?.tagName,
      };
    })()`);
    assert.equal(modalClosed.closed, true, 'Modal must close when Done button is pressed');
    assert.equal(modalClosed.focusedId, 'ui-modal', `Focus must restore to triggering card (got ${modalClosed.activeTag})`);

    // 6. Verify ui-button disabled/busy suppression and active click (REQ-0003)
    const btnCheck = await cdp.eval(`(() => {
      const out = document.getElementById('press-output');
      document.getElementById('btn-disabled').shadowRoot.querySelector('button').click();
      document.getElementById('btn-busy').shadowRoot.querySelector('button').click();
      const afterBlocked = out.textContent;
      document.getElementById('btn-primary').shadowRoot.querySelector('button').click();
      const afterAllowed = out.textContent;
      return { afterBlocked, afterAllowed };
    })()`);
    assert.equal(btnCheck.afterBlocked, 'Presses: 0', 'Disabled and busy buttons must suppress activation');
    assert.equal(btnCheck.afterAllowed, 'Presses: 1 (primary)', 'Primary button must emit ui-press');

    // 7. Verify ui-input event emission (REQ-0003)
    const inputVal = await cdp.eval(`(() => {
      const el = document.getElementById('demo-input');
      const inner = el.shadowRoot.querySelector('input');
      inner.value = 'lumen-token';
      inner.dispatchEvent(new Event('input', { bubbles: true }));
      return document.getElementById('input-output').textContent;
    })()`);
    assert.equal(inputVal, 'Value: lumen-token');

    // 8. Verify prefers-reduced-motion suppresses skeleton shimmer (REQ-0002)
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    const reduced = await cdp.eval(`(() => {
      const sk = document.querySelector('ui-skeleton');
      const bone = sk.shadowRoot.querySelector('.bone');
      const afterStyle = getComputedStyle(bone, '::after');
      return { display: afterStyle.display, animationName: afterStyle.animationName };
    })()`);
    assert.equal(reduced.display, 'none', 'Shimmer ::after must be hidden under prefers-reduced-motion: reduce');

    assert.deepEqual(cdp.consoleErrors, [], `Console errors: ${cdp.consoleErrors.join('; ')}`);
    assert.deepEqual(cdp.pageErrors, [], `Page errors: ${cdp.pageErrors.join('; ')}`);
    console.log('ALL_BROWSER_CHECKS_PASSED');
  } finally {
    if (cdp) cdp.close();
    if (chrome) chrome.kill('SIGKILL');
    server.kill('SIGKILL');
    rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
