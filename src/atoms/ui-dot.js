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
      width: 0.625rem;
      height: 0.625rem;
      border-radius: var(--radius-full, 9999px);
      background: var(--color-fg-muted, #8e8e98);
    }

    :host([status="done"]) .dot { background: var(--color-success, #10b981); }
    :host([status="wait"]) .dot { background: var(--color-warning, #f59e0b); }
    :host([status="bad"]) .dot { background: var(--color-danger, #f87171); }
    :host([status="info"]) .dot { background: var(--color-info, #38bdf8); }
    :host([status="off"]) .dot { background: var(--color-border-hover, rgba(255, 255, 255, 0.22)); }
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
