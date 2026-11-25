import '../atoms/ui-surface.js';
import '../atoms/ui-dot.js';
import '../atoms/ui-text.js';

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

    .label-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

  </style>
  <ui-surface part="tile" variant="card" padding="md" radius="lg">
    <div class="inner">
      <ui-text class="val" exportparts="text: value" variant="stat"></ui-text>
      <div class="label-row">
        <ui-dot part="dot" hidden></ui-dot>
        <ui-text class="lbl" exportparts="text: label" variant="caption" tone="secondary"></ui-text>
      </div>
    </div>
  </ui-surface>
`;

/**
 * KPI metric tile Molecule composing <ui-surface>, <ui-dot> and <ui-text>.
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
    this.#val.setAttribute('tone', this.getAttribute('variant')?.replace('neutral', 'default') || 'default');
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
