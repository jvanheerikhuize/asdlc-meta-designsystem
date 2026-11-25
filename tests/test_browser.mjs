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

async function until(cdp, expression, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await cdp.eval(expression).catch(() => false)) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise((resolve) => child.once('exit', resolve));
  child.kill('SIGKILL');
  await exited;
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
    await until(cdp, `document.querySelector('ui-code-block')?.shadowRoot && document.querySelectorAll('ui-chip').length >= 5`);
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
    await until(cdp, `location.pathname === '/' && document.readyState === 'complete' && ['ui-table', 'workspace-layout'].every((t) => document.querySelector(t)?.shadowRoot)`);
    // The token fonts are actually loaded, not only named (REQ-0002)
    await until(cdp, `['Geist', 'Geist Mono', 'Bricolage Grotesque'].every((family) =>
      [...document.fonts].some((f) => f.status === 'loaded' && f.family.replace(/"/g, '') === family))`);
    const showcase = await cdp.eval(`(() => {
      const tags = [
        'ui-button', 'ui-input', 'ui-label', 'ui-badge', 'ui-icon', 'ui-skeleton',
        'ui-chip', 'ui-progress', 'ui-textarea', 'ui-select', 'ui-dot', 'ui-checkbox', 'ui-slider', 'ui-switch', 'ui-tooltip', 'ui-surface', 'ui-divider',
        'ui-field', 'ui-search-bar', 'ui-media-card', 'ui-stat-tile', 'ui-callout', 'ui-code-block', 'ui-toolbar', 'ui-tabs', 'ui-panel-header', 'ui-empty-state', 'ui-theme-toggle',
        'ui-navbar', 'ui-modal', 'ui-catalog-grid', 'ui-popover', 'ui-drawer', 'ui-toast', 'ui-table',
        'page-shell', 'catalog-layout', 'detail-layout', 'workspace-layout',
      ];
      const defined = tags.every((t) => Boolean(customElements.get(t)));
      const shadows = tags.every((t) => Boolean(document.querySelector(t)?.shadowRoot));
      const backHref = document.querySelector('[data-testid="back-to-dashboard"]')?.getAttribute('href');
      const bgDark = getComputedStyle(document.body).backgroundColor;
      return { defined, shadows, backHref, bgDark };
    })()`);
    assert.equal(showcase.defined, true, 'All 39 components must be defined');
    assert.equal(showcase.shadows, true, 'All 39 components must have Shadow DOM');
    assert.equal(showcase.backHref, './specs/');
    assert.equal(showcase.bgDark, 'rgb(8, 8, 11)', 'Dark default --color-bg should be #08080b');


    // 2b. Visual consistency assertions: 36px control height parity, dark color-scheme, non-overlapping detail-layout, zero horizontal pre overflow
    const visualConsistency = await cdp.eval(`(() => {
      const rootScheme = getComputedStyle(document.documentElement).colorScheme;
      const btnMd = document.querySelector('#catalog-search').shadowRoot.querySelector('.submit').getBoundingClientRect().height;
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

    // Loading and empty states, and template responsiveness (REQ-0005)
    const states = await cdp.eval(`(async () => {
      const host = document.createElement('div');
      host.innerHTML = '<ui-table><table><tbody><tr><td>x</td></tr></tbody></table></ui-table><page-shell></page-shell><page-shell><p slot="footer">f</p></page-shell>';
      document.body.append(host);
      await new Promise((r) => setTimeout(r, 50));
      const table = host.querySelector('ui-table');
      const seen = () => ['.scroll', 'ui-skeleton', 'ui-empty-state'].map((q) => table.shadowRoot.querySelector(q).getBoundingClientRect().height > 0);
      const plain = seen();
      table.setAttribute('empty', '');
      table.setAttribute('empty-text', 'None');
      const empty = seen();
      const text = table.shadowRoot.querySelector('ui-empty-state').shadowRoot.querySelector('.text').textContent;
      table.setAttribute('loading', '');
      const loading = seen();
      const footers = [...host.querySelectorAll('page-shell')].map((el) => el.shadowRoot.querySelector('footer').getBoundingClientRect().height > 0);
      host.remove();
      const toggle = document.querySelector('[data-id="ui-theme-toggle"] ui-theme-toggle');
      const themes = [];
      toggle.addEventListener('ui-theme-change', (e) => themes.push(e.detail.theme));
      for (let i = 0; i < 2; i += 1) toggle.shadowRoot.querySelector('ui-button').shadowRoot.querySelector('button').click();
      return { plain, empty, text, loading, footers, themes };
    })()`);
    assert.deepEqual(states, {
      plain: [true, false, false], empty: [false, false, true], text: 'None', loading: [false, true, false],
      footers: [false, true], themes: ['light', 'dark'],
    });

    // 3. Verify ui-navbar theme toggle propagates across Shadow DOM (ASM-0001, REQ-0002)
    const lightBg = await cdp.eval(`(() => {
      document.getElementById('navbar').shadowRoot.getElementById('theme-btn').shadowRoot.querySelector('ui-button').shadowRoot.querySelector('button').click();
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
      sb.shadowRoot.querySelector('.submit').shadowRoot.querySelector('button').click();
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
      sb.shadowRoot.querySelector('.submit').shadowRoot.querySelector('button').click();

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

    // Values set before connection are shown and stay readable after edits (REQ-0004)
    const fields = await cdp.eval(`['ui-field', 'ui-search-bar'].map((tag) => {
      const run = (init) => {
        const el = document.createElement(tag);
        init(el);
        document.body.append(el);
        const native = el.shadowRoot.querySelector('ui-input').shadowRoot.querySelector('input');
        const shown = native.value;
        native.value = 'edited';
        native.dispatchEvent(new Event('input', { bubbles: true }));
        const read = el.value;
        el.remove();
        return shown + '>' + read;
      };
      return [run((el) => el.setAttribute('value', 'before')), run((el) => { el.value = 'before'; })];
    })`);
    assert.deepEqual(fields, [['before>edited', 'before>edited'], ['before>edited', 'before>edited']]);

    // Tooltips are not clipped by a toolbar and stay in the viewport (REQ-0003)
    const tips = await cdp.eval(`['top', 'bottom', 'left', 'right'].flatMap((placement) => ['0', 'calc(100% - 4rem)'].map((left) => {
      const bar = document.createElement('ui-toolbar');
      bar.style.cssText = 'position:fixed;top:0;left:' + left;
      bar.innerHTML = '<ui-tooltip text="A fairly long tooltip label" placement="' + placement + '"><ui-button aria-label="x">x</ui-button></ui-tooltip>';
      document.body.append(bar);
      const tip = bar.firstChild;
      const bubble = tip.shadowRoot.querySelector('.bubble');
      tip.show();
      const r = bubble.getBoundingClientRect();
      const hit = tip.shadowRoot.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === bubble;
      const inside = r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
      tip.hide();
      const closed = !bubble.matches(':popover-open');
      bar.remove();
      return hit && inside && closed;
    }))`);
    assert.deepEqual(tips, Array(8).fill(true), 'Tooltip bubbles must be visible and inside the viewport');

    // Menu state reaches the focusable control (REQ-0003)
    const menu = await cdp.eval(`(() => {
      const el = document.createElement('ui-button');
      el.setAttribute('aria-haspopup', 'menu');
      el.setAttribute('aria-expanded', 'false');
      document.body.append(el);
      const inner = el.shadowRoot.querySelector('button');
      const first = inner.getAttribute('aria-haspopup') + inner.getAttribute('aria-expanded');
      el.setAttribute('aria-expanded', 'true');
      const second = inner.getAttribute('aria-expanded');
      el.removeAttribute('aria-expanded');
      const third = inner.hasAttribute('aria-expanded');
      el.remove();
      return [first, second, third];
    })()`);
    assert.deepEqual(menu, ['menufalse', 'true', false]);

    // Form participation (REQ-0003, REQ-0004)
    const press = async (key, code, text) => {
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: code, text });
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: code });
    };
    await cdp.eval(`(() => {
      const form = document.createElement('form');
      form.id = 'form-test';
      form.innerHTML = '<fieldset><ui-input name="a" required aria-label="a"></ui-input><ui-field name="b" label="b" value="two"></ui-field>'
        + '<ui-button type="submit">Go</ui-button><ui-button type="reset">Reset</ui-button><ui-button>Plain</ui-button></fieldset>';
      window.submits = [];
      form.addEventListener('submit', (e) => { e.preventDefault(); window.submits.push([...new FormData(form)].join(';')); });
      document.body.append(form);
      form.querySelector('ui-input').focus();
    })()`);
    const inner = (n) => `document.querySelectorAll('#form-test ui-button')[${n}].shadowRoot.querySelector('button')`;
    await press('Enter', 13, '\r');
    await cdp.eval(`${inner(0)}.click()`);
    assert.deepEqual(await cdp.eval(`window.submits`), [], 'An invalid form must not submit');
    await cdp.eval(`document.querySelector('#form-test ui-input').focus()`);
    await cdp.send('Input.insertText', { text: 'one' });
    await press('Enter', 13, '\r');
    await cdp.eval(`${inner(0)}.click()`);
    await cdp.eval(`${inner(2)}.click()`);
    await cdp.eval(`document.querySelector('#form-test ui-field').focus()`);
    await press('Enter', 13, '\r');
    assert.deepEqual(await cdp.eval(`window.submits`), Array(3).fill('a,one;b,two'), 'Enter and submit each submit once; plain buttons do not');
    await cdp.eval(`(() => { document.querySelector('#form-test ui-field').addEventListener('keydown', (e) => e.preventDefault(), { once: true }); window.submits = []; })()`);
    await press('Enter', 13, '\r');
    await cdp.eval(`document.querySelector('#form-test ui-button').setAttribute('busy', '')`);
    await press('Enter', 13, '\r');
    assert.deepEqual(await cdp.eval(`window.submits`), [], 'A prevented keydown or inactive submit button must not submit');
    const after = await cdp.eval(`(() => {
      const form = document.getElementById('form-test');
      form.querySelector('ui-field').shadowRoot.querySelector('ui-input').value = 'changed';
      ${inner(1)}.click();
      const reset = [form.querySelector('ui-input').value, form.querySelector('ui-field').value];
      form.querySelector('fieldset').disabled = true;
      const off = [form.querySelector('ui-input').shadowRoot.querySelector('input').disabled,
        form.querySelector('ui-field').shadowRoot.querySelector('ui-input').shadowRoot.querySelector('input').disabled, ${inner(0)}.disabled];
      const data = [...new FormData(form)].length;
      form.remove();
      return { reset, off, data };
    })()`);
    assert.deepEqual(after, { reset: ['', 'two'], off: [true, true, true], data: 0 });

    // Clearable search (REQ-0004)
    await cdp.eval(`(() => {
      const bar = document.createElement('ui-search-bar');
      bar.id = 'clear-test';
      for (const a of ['compact', 'clearable']) bar.setAttribute(a, '');
      bar.value = 'abc';
      window.inputs = [];
      window.escapes = 0;
      window.presses = 0;
      bar.addEventListener('ui-input', (e) => window.inputs.push(e.detail.value));
      bar.addEventListener('ui-press', () => { window.presses += 1; });
      bar.addEventListener('keydown', () => { window.escapes += 1; });
      document.body.append(bar);
      bar.shadowRoot.querySelector('.clear').shadowRoot.querySelector('button').click();
    })()`);
    const clearState = `(() => { const b = document.getElementById('clear-test'); return [b.value, b.shadowRoot.querySelector('.clear').hidden,
      document.activeElement === b && b.shadowRoot.activeElement?.localName, window.inputs.join('|'), window.escapes, window.presses]; })()`;
    assert.deepEqual(await cdp.eval(clearState), ['', true, 'ui-input', '', 0, 0]);
    assert.equal(await cdp.eval(`window.inputs.length`), 1, 'Clearing is reported once');
    await cdp.send('Input.insertText', { text: 'x' });
    assert.deepEqual((await cdp.eval(clearState)).slice(0, 2), ['x', false]);
    await press('Escape', 27);
    assert.deepEqual(await cdp.eval(clearState), ['', true, 'ui-input', '|x|', 0, 0]);
    await press('Escape', 27);
    assert.equal(await cdp.eval(`window.escapes`), 1, 'Escape in an empty search reaches the page');
    await cdp.eval(`document.getElementById('clear-test').remove()`);

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
    if (cdp) {
      // A clean shutdown lets Chrome's child processes finish writing the profile.
      const exited = new Promise((resolve) => chrome.once('exit', resolve));
      cdp.send('Browser.close').catch(() => {});
      await Promise.race([exited, new Promise((r) => setTimeout(r, 3000))]);
      cdp.close();
    }
    await Promise.all([stop(chrome), stop(server)]);
    try {
      rmSync(userDataDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    } catch (err) {
      // Chrome's child processes may still write here. An error thrown in finally would replace the test result.
      console.warn(`Could not remove ${userDataDir}: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
