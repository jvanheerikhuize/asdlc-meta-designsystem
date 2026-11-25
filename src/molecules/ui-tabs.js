import '../atoms/ui-surface.js';
import '../atoms/ui-button.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      font-family: var(--font-sans);
    }

    :host([hidden]) {
      display: none;
    }

    ui-surface {
      width: fit-content;
      max-width: 100%;
    }

    :host([full-width]) ui-surface {
      width: 100%;
    }

    .tablist {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      overflow-x: auto;
      scrollbar-width: none;
    }

    .panel {
      color: var(--color-fg);
      font-size: var(--text-sm);
      line-height: var(--leading-normal);
    }
  </style>
  <ui-surface variant="elevated" padding="xs" radius="lg">
    <div class="tablist" part="tablist" role="tablist"></div>
  </ui-surface>
  <div class="panel" part="panel" role="tabpanel">
    <slot id="active-slot"></slot>
  </div>
`;

/**
 * Accessible WAI-ARIA tablist Molecule composing <ui-surface> (shared bar chrome
 * with <ui-toolbar>) and <ui-button> Atoms.
 */
export class UiTabs extends HTMLElement {
  static observedAttributes = ['tabs', 'value', 'aria-label'];

  #tablist;
  #panel;
  #slot;
  #parsedTabs = [];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#tablist = shadow.querySelector('.tablist');
    this.#panel = shadow.querySelector('.panel');
    this.#slot = shadow.getElementById('active-slot');

    this.#tablist.addEventListener('keydown', (event) => this.#onKeyDown(event));
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    this.#render();
  }

  get value() {
    return this.getAttribute('value') || (this.#parsedTabs[0]?.id ?? '');
  }

  set value(val) {
    if (val == null) this.removeAttribute('value');
    else this.setAttribute('value', String(val));
  }

  selectTab(id, focusTab = false) {
    if (!id || id === this.getAttribute('value')) return;
    this.setAttribute('value', id);
    if (focusTab) {
      const btn = this.#tablist.querySelector(`ui-button[data-tab-id="${CSS.escape(id)}"]`);
      btn?.focus();
    }
    this.dispatchEvent(new CustomEvent('ui-change', {
      bubbles: true,
      composed: true,
      detail: { value: id },
    }));
  }

  #parseTabs() {
    const raw = this.getAttribute('tabs');
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.map((item) => (
        typeof item === 'string'
          ? { id: item, label: item }
          : { id: String(item.id), label: String(item.label ?? item.id) }
      ));
    } catch {
      return [];
    }
  }

  #onKeyDown(event) {
    const buttons = Array.from(this.#tablist.querySelectorAll('ui-button[role="tab"]'));
    if (!buttons.length) return;
    const idx = Math.max(0, buttons.findIndex((b) => b === event.target));
    let next = -1;
    if (event.key === 'ArrowRight') next = (idx + 1) % buttons.length;
    else if (event.key === 'ArrowLeft') next = (idx - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    if (next < 0) return;

    event.preventDefault();
    const nextId = buttons[next].dataset.tabId;
    this.selectTab(nextId, true);
  }

  #render() {
    if (!this.#tablist) return;
    this.#parsedTabs = this.#parseTabs();
    this.#tablist.setAttribute('aria-label', this.getAttribute('aria-label') || 'Section tabs');

    const activeId = this.#parsedTabs.some((t) => t.id === this.getAttribute('value'))
      ? this.getAttribute('value')
      : (this.#parsedTabs[0]?.id ?? '');

    this.#tablist.innerHTML = '';
    for (const tab of this.#parsedTabs) {
      const selected = tab.id === activeId;
      const btn = document.createElement('ui-button');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('part', 'tab');
      btn.setAttribute('variant', selected ? 'surface' : 'ghost');
      btn.setAttribute('size', 'sm');
      btn.id = `tab-${tab.id}`;
      btn.dataset.tabId = tab.id;
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      btn.tabIndex = selected ? 0 : -1;
      btn.textContent = tab.label;
      btn.addEventListener('ui-press', () => this.selectTab(tab.id, false));
      this.#tablist.appendChild(btn);
    }

    if (activeId) {
      this.#panel.setAttribute('aria-labelledby', `tab-${activeId}`);
      const hasNamedSlotContent = Boolean(this.querySelector(`[slot="${CSS.escape(activeId)}"]`));
      if (hasNamedSlotContent) this.#slot.setAttribute('name', activeId);
      else this.#slot.removeAttribute('name');
    } else {
      this.#panel.removeAttribute('aria-labelledby');
      this.#slot.removeAttribute('name');
    }
  }
}

if (!customElements.get('ui-tabs')) {
  customElements.define('ui-tabs', UiTabs);
}
