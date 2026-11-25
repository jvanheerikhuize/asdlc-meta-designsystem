const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    .spinner {
      width: var(--size-spinner);
      height: var(--size-spinner);
      box-sizing: border-box;
      border: var(--border-width-strong) solid var(--color-border-hover);
      border-top-color: var(--color-accent);
      border-radius: var(--radius-full);
      animation: spin var(--duration-spin) var(--ease-linear) infinite;
    }

    :host([size="sm"]) .spinner {
      width: var(--icon-sm);
      height: var(--icon-sm);
    }

    :host([size="lg"]) .spinner {
      width: var(--icon-2xl);
      height: var(--icon-2xl);
      border-width: var(--border-width-accent);
    }

    @keyframes spin { to { rotate: 360deg; } }

    @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
  </style>
  <div class="spinner" part="spinner" role="status"></div>
`;

/**
 * Loading spinner Atom.
 */
export class UiSpinner extends HTMLElement {
  static observedAttributes = ['label'];

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
    this.shadowRoot.querySelector('.spinner').setAttribute('aria-label', this.getAttribute('label') || 'Loading');
  }
}

if (!customElements.get('ui-spinner')) {
  customElements.define('ui-spinner', UiSpinner);
}
