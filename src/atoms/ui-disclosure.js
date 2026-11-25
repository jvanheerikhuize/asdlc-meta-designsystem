const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    details {
      border: var(--line-default);
      border-radius: var(--radius-card);
      background: var(--color-card);
      color: var(--color-fg);
    }

    summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--cluster-sm);
      padding: var(--inset-sm) var(--inset-md);
      font: var(--type-label);
      cursor: var(--cursor-interactive);
      list-style: none;
      border-radius: inherit;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary:hover {
      background: var(--color-card-hover);
    }

    summary:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    summary::after {
      content: '';
      width: var(--space-2);
      height: var(--space-2);
      border-inline-end: var(--border-width-strong) solid currentColor;
      border-block-end: var(--border-width-strong) solid currentColor;
      rotate: 45deg;
      transition: var(--transition-transform);
    }

    details[open] summary::after {
      rotate: 225deg;
    }

    .body {
      padding: var(--inset-sm) var(--inset-md) var(--inset-md);
      font: var(--type-small);
    }
  </style>
  <details part="details">
    <summary part="summary"></summary>
    <div class="body" part="body"><slot></slot></div>
  </details>
`;

/**
 * Disclosure Atom: a native details element.
 */
export class UiDisclosure extends HTMLElement {
  static observedAttributes = ['summary', 'open'];

  #details;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#details = shadow.querySelector('details');
    this.#details.addEventListener('toggle', () => {
      if (this.#details.open === this.hasAttribute('open')) return;
      this.toggleAttribute('open', this.#details.open);
      this.dispatchEvent(new CustomEvent('ui-toggle', { bubbles: true, composed: true, detail: { open: this.#details.open } }));
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    this.#details.open = this.hasAttribute('open');
    this.shadowRoot.querySelector('summary').textContent = this.getAttribute('summary') || 'Details';
  }
}

if (!customElements.get('ui-disclosure')) {
  customElements.define('ui-disclosure', UiDisclosure);
}
