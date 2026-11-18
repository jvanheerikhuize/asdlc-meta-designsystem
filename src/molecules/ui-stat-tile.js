import '../atoms/ui-dot.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .tile {
      background: var(--color-card, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      border-radius: var(--radius-lg, 0.75rem);
      padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
      display: flex;
      flex-direction: column;
      gap: var(--space-1, 0.25rem);
    }

    .val {
      font-family: var(--font-display, system-ui, sans-serif);
      font-size: var(--text-2xl, 1.875rem);
      font-weight: 700;
      line-height: 1.15;
      color: var(--color-fg, #ededed);
    }

    .label-row {
      display: flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-xs, 0.75rem);
      color: var(--color-fg-secondary, #a1a1aa);
    }

    :host([variant="accent"]) .val { color: var(--color-accent, #f43f5e); }
    :host([variant="success"]) .val { color: var(--color-success, #10b981); }
    :host([variant="warning"]) .val { color: var(--color-warning, #f59e0b); }
    :host([variant="danger"]) .val { color: var(--color-danger, #f87171); }
  </style>
  <div class="tile" part="tile">
    <strong class="val" part="value"></strong>
    <div class="label-row">
      <ui-dot part="dot" hidden></ui-dot>
      <span class="lbl" part="label"></span>
    </div>
  </div>
`;

/**
 * KPI metric tile Molecule displaying a prominent value, label, and optional status dot.
 */
export class UiStatTile extends HTMLElement {
  static observedAttributes = ['value', 'label', 'status', 'variant'];

  #val;
  #lbl;
  #dot;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#val = shadow.querySelector('.val');
    this.#lbl = shadow.querySelector('.lbl');
    this.#dot = shadow.querySelector('ui-dot');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#val || !this.#lbl || !this.#dot) return;
    this.#val.textContent = this.getAttribute('value') || '0';
    this.#lbl.textContent = this.getAttribute('label') || '';
    const status = this.getAttribute('status');
    if (status) {
      this.#dot.setAttribute('status', status);
      this.#dot.hidden = false;
    } else {
      this.#dot.hidden = true;
    }
  }
}

if (!customElements.get('ui-stat-tile')) {
  customElements.define('ui-stat-tile', UiStatTile);
}
