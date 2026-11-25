const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    span {
      display: inline-grid;
      place-items: center;
      box-sizing: border-box;
      min-width: var(--space-5);
      height: var(--space-5);
      padding: 0 var(--space-1-5);
      font: var(--type-caption);
      font-weight: var(--weight-semibold);
      font-variant-numeric: var(--numeric-tabular);
      border-radius: var(--radius-full);
      background: var(--color-accent);
      color: var(--color-accent-fg);
    }

    span[hidden] {
      display: none;
    }

    :host([variant="neutral"]) span {
      background: var(--color-neutral);
      color: var(--color-neutral-fg);
    }

    :host([variant="danger"]) span {
      background: var(--color-danger);
      color: var(--color-danger-fg);
    }
  </style>
  <span part="counter"></span>
`;

/**
 * Count badge Atom.
 */
export class UiCounter extends HTMLElement {
  static observedAttributes = ['value', 'max', 'label', 'show-zero'];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const el = this.shadowRoot.querySelector('span');
    const value = parseInt(this.getAttribute('value'), 10) || 0;
    const max = parseInt(this.getAttribute('max'), 10) || 99;
    el.textContent = value > max ? `${max}+` : String(value);
    el.hidden = value === 0 && !this.hasAttribute('show-zero');
    const label = this.getAttribute('label');
    if (label) {
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', `${value} ${label}`);
    } else {
      el.removeAttribute('role');
      el.removeAttribute('aria-label');
    }
  }
}

if (!customElements.get('ui-counter')) {
  customElements.define('ui-counter', UiCounter);
}
