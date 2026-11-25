const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
    }

    :host([hidden]) {
      display: none;
    }

    .dot {
      display: inline-block;
      width: var(--size-dot);
      height: var(--size-dot);
      border-radius: var(--radius-full);
      background: var(--color-fg-muted);
    }

    :host([status="done"]) .dot { background: var(--color-success); }
    :host([status="wait"]) .dot { background: var(--color-warning); }
    :host([status="bad"]) .dot { background: var(--color-danger); }
    :host([status="info"]) .dot { background: var(--color-info); }
    :host([status="off"]) .dot { background: var(--color-border-hover); }
  </style>
  <span class="dot" part="dot" aria-hidden="true"></span>
`;

/**
 * Semantic status dot Atom (`done`, `wait`, `bad`, `info`, `off`).
 */
export class UiDot extends HTMLElement {
  static observedAttributes = ['status', 'label'];

  #dot;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#dot = shadow.querySelector('.dot');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#dot) return;
    const label = this.getAttribute('label');
    if (label) {
      this.#dot.setAttribute('role', 'img');
      this.#dot.setAttribute('aria-label', label);
      this.#dot.removeAttribute('aria-hidden');
    } else {
      this.#dot.removeAttribute('role');
      this.#dot.removeAttribute('aria-label');
      this.#dot.setAttribute('aria-hidden', 'true');
    }
  }
}

if (!customElements.get('ui-dot')) {
  customElements.define('ui-dot', UiDot);
}
