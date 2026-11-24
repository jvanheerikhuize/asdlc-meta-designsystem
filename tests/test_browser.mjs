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
    await waitForJson(`http://127.0.0.1:${PORT}/specs/data/index.json`);
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

    // 1. Verify bolted-on Spec Dashboard (/specs/) across routes, font stack, radial glow, and link back to ../ (REQ-0007)
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/specs/` });
    for (let i = 0; i < 50; i += 1) {
      if (await cdp.eval(`Boolean(document.querySelector('h1')?.textContent)`)) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    const dash = await cdp.eval(`(() => ({
      title: document.title,
      h1: document.querySelector('h1')?.textContent,
      showcaseHref: document.querySelector('a[href="../"]')?.getAttribute('href'),
      fontFamily: getComputedStyle(document.body).fontFamily,
      bgImage: getComputedStyle(document.body).backgroundImage,
      statTiles: document.querySelectorAll('ui-stat-tile').length,
      callouts: document.querySelectorAll('ui-callout').length,
      progressBars: document.querySelectorAll('ui-progress').length,
    }))()`);
    assert.equal(dash.h1, 'Dashboard');
    assert.equal(dash.showcaseHref, '../');
    assert.equal(dash.fontFamily.includes('Geist'), true, `Expected Geist in fontFamily, got ${dash.fontFamily}`);
    assert.equal(dash.bgImage.includes('radial-gradient'), true, 'Expected radial glow on dashboard body');
    assert.equal(dash.statTiles, 4);
    assert.equal(dash.callouts >= 1, true);

    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/specs/#/capture/requirement` });
    await new Promise((r) => setTimeout(r, 400));
    const cap = await cdp.eval(`(() => ({
      chips: document.querySelectorAll('ui-chip').length,
      checkboxes: document.querySelectorAll('ui-checkbox').length,
      codeBlocks: document.querySelectorAll('ui-code-block').length,
    }))()`);
    assert.equal(cap.chips, 5);
    assert.equal(cap.checkboxes >= 1, true);
    assert.equal(cap.codeBlocks, 1);

    // 2. Verify Primary Showcase (/) and link to ./specs/ (REQ-0007)
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
    await new Promise((r) => setTimeout(r, 600));
    const showcase = await cdp.eval(`(() => {
      const tags = [
        'ui-button', 'ui-input', 'ui-label', 'ui-badge', 'ui-icon', 'ui-skeleton',
        'ui-chip', 'ui-progress', 'ui-textarea', 'ui-select', 'ui-dot', 'ui-checkbox', 'ui-slider', 'ui-switch', 'ui-tooltip', 'ui-surface', 'ui-divider',
        'ui-field', 'ui-search-bar', 'ui-media-card', 'ui-stat-tile', 'ui-callout', 'ui-code-block', 'ui-toolbar', 'ui-tabs', 'ui-panel-header',
        'ui-navbar', 'ui-modal', 'ui-catalog-grid', 'ui-popover', 'ui-drawer', 'ui-toast', 'ui-table',
        'page-shell', 'catalog-layout', 'detail-layout', 'workspace-layout',
      ];
      const defined = tags.every((t) => Boolean(customElements.get(t)));
      const shadows = tags.every((t) => Boolean(document.querySelector(t)?.shadowRoot));
      const backHref = document.querySelector('[data-testid="back-to-dashboard"]')?.getAttribute('href');
      const bgDark = getComputedStyle(document.body).backgroundColor;
      return { defined, shadows, backHref, bgDark };
    })()`);
    assert.equal(showcase.defined, true, 'All 37 components must be defined');
    assert.equal(showcase.shadows, true, 'All 37 components must have Shadow DOM');
    assert.equal(showcase.backHref, './specs/');
    assert.equal(showcase.bgDark, 'rgb(8, 8, 11)', 'Dark default --color-bg should be #08080b');


    // 2b. Visual consistency assertions: 36px control height parity, dark color-scheme, non-overlapping detail-layout, zero horizontal pre overflow
    const visualConsistency = await cdp.eval(`(() => {
      const rootScheme = getComputedStyle(document.documentElement).colorScheme;
      const btnMd = document.querySelector('#catalog-search').shadowRoot.querySelector('ui-button').getBoundingClientRect().height;
      const inputMd = document.querySelector('ui-input').getBoundingClientRect().height;
      const selectMd = document.querySelector('ui-select').getBoundingClientRect().height;
      const selectChevron = Boolean(document.querySelector('ui-select').shadowRoot.querySelector('svg.chevron'));

      const dl = document.querySelector('detail-layout');
      const mainRect = dl.shadowRoot.querySelector('.main').getBoundingClientRect();
      const asideRect = dl.shadowRoot.querySelector('.aside').getBoundingClientRect();
      const detailNoOverlap = (asideRect.top >= mainRect.bottom - 1) || (asideRect.left >= mainRect.right - 1);

      const overflowingPres = Array.from(document.querySelectorAll('.specimen pre')).filter(p => p.scrollWidth > p.clientWidth + 1).length;
      return { rootScheme, btnMd: Math.round(btnMd), inputMd: Math.round(inputMd), selectMd: Math.round(selectMd), selectChevron, detailNoOverlap, overflowingPres };
    })()`);
    assert.equal(visualConsistency.rootScheme, 'dark', 'Dark default :root must report colorScheme=dark so native scrollbars/popups match');
    assert.equal(visualConsistency.btnMd, 36, 'Medium button height must be 36px');
    assert.equal(visualConsistency.inputMd, 36, 'Input height must match medium button (36px)');
    assert.equal(visualConsistency.selectMd, 36, 'Select height must match input and medium button (36px)');
    assert.equal(visualConsistency.selectChevron, true, 'ui-select must render custom chevron icon');
    assert.equal(visualConsistency.detailNoOverlap, true, 'detail-layout main and aside columns must never overlap');
    assert.equal(visualConsistency.overflowingPres, 0, 'Specimen code previews must wrap cleanly without horizontal scrollbars');

    // 2c. Toggle button state is owned by the view; text input enforces its maximum length (REQ-0003)
    const toggle = await cdp.eval(`(() => {
      const host = document.createElement('ui-button');
      host.setAttribute('variant', 'secondary');
      document.body.append(host);
      const btn = host.shadowRoot.querySelector('button');
      const plain = btn.getAttribute('aria-pressed');
      host.setAttribute('aria-pressed', 'false');
      const offBg = getComputedStyle(btn).borderColor;
      btn.click();
      const afterClick = btn.getAttribute('aria-pressed');
      host.setAttribute('aria-pressed', 'true');
      btn.getAnimations().forEach((a) => a.finish());
      const on = btn.getAttribute('aria-pressed');
      const onBg = getComputedStyle(btn).borderColor;
      host.remove();
      const input = document.createElement('ui-input');
      input.id = 'max-probe';
      input.setAttribute('maxlength', '5');
      document.body.prepend(input);
      input.focus();
      return { plain, afterClick, on, styled: offBg !== onBg };
    })()`);
    assert.deepEqual(toggle, { plain: null, afterClick: 'false', on: 'true', styled: true });
    await cdp.send('Input.insertText', { text: 'abcdefgh' });
    const limited = await cdp.eval(`(() => {
      const el = document.getElementById('max-probe');
      const value = el.value;
      el.remove();
      return value;
    })()`);
    assert.equal(limited, 'abcde', 'ui-input must not accept text past maxlength');

    // 2d. Data table scrolls inside its own labelled region and is a keyboard stop only then (REQ-0005)
    const table = await cdp.eval(`(async () => {
      const host = document.createElement('ui-table');
      host.setAttribute('aria-label', 'Probe');
      host.innerHTML = '<table><thead><tr><th scope="col">A</th></tr></thead><tbody><tr><td>b</td></tr></tbody></table>';
      document.body.prepend(host);
      const scroll = host.shadowRoot.querySelector('[part="scroll"]');
      const settle = () => new Promise((r) => setTimeout(r, 200));
      await settle();
      const narrow = scroll.getAttribute('tabindex');
      const pageBefore = document.documentElement.scrollWidth;
      host.querySelector('td').textContent = 'x'.repeat(2000);
      await settle();
      const out = {
        narrow, wide: scroll.getAttribute('tabindex'), role: scroll.getAttribute('role'), label: scroll.getAttribute('aria-label'),
        scrolls: scroll.scrollWidth > scroll.clientWidth, pageGrew: document.documentElement.scrollWidth > pageBefore,
        padded: getComputedStyle(host.querySelector('td')).paddingLeft !== '1px',
      };
      host.remove();
      return out;
    })()`);
    assert.deepEqual(table, { narrow: null, wide: '0', role: 'region', label: 'Probe', scrolls: true, pageGrew: false, padded: true });

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

    // 4. Verify ui-search-bar filters #specimen-grid on button click (REQ-0004)
    const searchCheck = await cdp.eval(`(() => {
      const sb = document.getElementById('catalog-search');
      const innerInput = sb.shadowRoot.querySelector('ui-input').shadowRoot.querySelector('input');
      innerInput.value = '<ui-modal>';
      innerInput.dispatchEvent(new Event('input', { bubbles: true }));
      sb.shadowRoot.querySelector('ui-button').shadowRoot.querySelector('button').click();
      const visible = Array.from(document.querySelectorAll('#specimen-grid .specimen')).filter((el) => !el.hidden);
      return {
        countText: document.getElementById('catalog-count').textContent,
        visibleIds: visible.map((el) => el.dataset.id),
      };
    })()`);
    assert.equal(searchCheck.countText, '1 component');
    assert.deepEqual(searchCheck.visibleIds, ['ui-modal']);


    // 5b. Verify new workspace primitives (ui-switch, ui-tabs, ui-popover, ui-drawer, ui-toolbar, ui-toast)
    const primitivesCheck = await cdp.eval(`(() => {
      // Clear catalog filter so all specimens are visible
      const sb = document.getElementById('catalog-search');
      const innerInput = sb.shadowRoot.querySelector('ui-input').shadowRoot.querySelector('input');
      innerInput.value = '';
      innerInput.dispatchEvent(new Event('input', { bubbles: true }));
      sb.shadowRoot.querySelector('ui-button').shadowRoot.querySelector('button').click();

      const sw = document.getElementById('demo-switch');
      const swBefore = sw.checked;
      sw.shadowRoot.querySelector('button').click();
      const swAfter = sw.checked;

      const tabs = document.getElementById('demo-tabs');
      tabs.shadowRoot.querySelector('ui-button[data-tab-id="surfaces"]').shadowRoot.querySelector('button').click();
      const activeTab = tabs.value;

      const pop = document.getElementById('demo-popover');
      pop.openPopover();
      const popOpen = pop.hasAttribute('open');
      pop.closePopover();
      const popClosed = !pop.hasAttribute('open');

      const drawer = document.getElementById('demo-drawer');
      const drawerInitial = drawer.hasAttribute('open');
      drawer.close('test');
      const drawerClosed = !drawer.hasAttribute('open');
      drawer.show();
      const drawerReopened = drawer.hasAttribute('open');

      const toast = document.getElementById('demo-toast');
      toast.dismiss('test');
      const toastDismissed = !toast.hasAttribute('open');

      return { swBefore, swAfter, activeTab, popOpen, popClosed, drawerInitial, drawerClosed, drawerReopened, toastDismissed };
    })()`);
    assert.equal(primitivesCheck.swBefore, true);
    assert.equal(primitivesCheck.swAfter, false);
    assert.equal(primitivesCheck.activeTab, 'surfaces');
    assert.equal(primitivesCheck.popOpen, true);
    assert.equal(primitivesCheck.popClosed, true);
    assert.equal(primitivesCheck.drawerInitial, true);
    assert.equal(primitivesCheck.drawerClosed, true);
    assert.equal(primitivesCheck.drawerReopened, true);
    assert.equal(primitivesCheck.toastDismissed, true);

    // 5. Verify Inspect Contract opens ui-modal, closes on Close button, and restores focus (REQ-0005)
    await cdp.send('Page.bringToFront');
    const modalOpened = await cdp.eval(`(() => {
      const btn = document.querySelector('.inspect-btn[data-component="ui-modal"]');
      btn.shadowRoot.querySelector('button').click();
      const modal = document.getElementById('detail-modal');
      return modal.hasAttribute('open') && modal.shadowRoot.querySelector('dialog').open;
    })()`);
    assert.equal(modalOpened, true, 'Modal must open when Inspect Contract is clicked');

    await cdp.eval(`document.getElementById('modal-done-btn').shadowRoot.querySelector('button').click()`);
    await new Promise((r) => setTimeout(r, 50));
    const modalClosed = await cdp.eval(`(() => {
      const modal = document.getElementById('detail-modal');
      return {
        closed: !modal.hasAttribute('open') && !modal.shadowRoot.querySelector('dialog').open,
        focusedComponent: document.activeElement?.dataset?.component,
        activeTag: document.activeElement?.tagName,
      };
    })()`);
    assert.equal(modalClosed.closed, true, 'Modal must close when Close button is pressed');
    assert.equal(modalClosed.focusedComponent, 'ui-modal', `Focus must restore to triggering Inspect button (got ${modalClosed.activeTag})`);

    // 6. Verify ui-button disabled/busy suppression and ARIA states (REQ-0003)
    const btnCheck = await cdp.eval(`(() => {
      let blockedPressed = 0;
      const dis = document.getElementById('btn-disabled');
      const busy = document.getElementById('btn-busy');
      dis.addEventListener('ui-press', () => { blockedPressed += 1; });
      busy.addEventListener('ui-press', () => { blockedPressed += 1; });
      dis.shadowRoot.querySelector('button').click();
      busy.shadowRoot.querySelector('button').click();
      return {
        blockedPressed,
        disAria: dis.shadowRoot.querySelector('button').getAttribute('aria-disabled'),
        busyAria: busy.shadowRoot.querySelector('button').getAttribute('aria-busy'),
      };
    })()`);
    assert.equal(btnCheck.blockedPressed, 0, 'Disabled and busy buttons must suppress ui-press');
    assert.equal(btnCheck.disAria, 'true');
    assert.equal(btnCheck.busyAria, 'true');

    // 7. Verify prefers-reduced-motion suppresses skeleton shimmer (REQ-0002)
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
