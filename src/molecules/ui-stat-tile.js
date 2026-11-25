import '../atoms/ui-surface.js';
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

    .inner {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .val {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      line-height: var(--leading-snug);
      color: var(--color-fg);
    }

    .label-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      color: var(--color-fg-secondary);
    }

    :host([variant="accent"]) .val { color: var(--color-accent); }
    :host([variant="success"]) .val { color: var(--color-success); }
    :host([variant="warning"]) .val { color: var(--color-warning); }
    :host([variant="danger"]) .val { color: var(--color-danger); }
  </style>
  <ui-surface part="tile" variant="card" padding="md" radius="lg">
    <div class="inner">
      <strong class="val" part="value"></strong>
      <div class="label-row">
        <ui-dot part="dot" hidden></ui-dot>
        <span class="lbl" part="label"></span>
      </div>
    </div>
  </ui-surface>
`;

/**
 * KPI metric tile Molecule composing <ui-surface> and <ui-dot>.
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
