const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    blockquote {
      margin: 0;
      padding-inline-start: var(--inset-md);
      border-inline-start: var(--line-accent);
      font: var(--type-quote);
      color: var(--color-fg);
    }

    .source {
      display: block;
      margin-top: var(--stack-sm);
      font: var(--type-caption);
      color: var(--color-fg-muted);
    }

    .source[hidden] {
      display: none;
    }
  </style>
  <blockquote part="quote">
    <slot></slot>
    <cite class="source" part="source" hidden></cite>
  </blockquote>
`;

/**
 * Quotation Atom with an optional source.
 */
export class UiQuote extends HTMLElement {
  static observedAttributes = ['cite', 'source'];

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
    const source = this.shadowRoot.querySelector('.source');
    source.textContent = this.getAttribute('source') || '';
    source.hidden = !this.hasAttribute('source');
    const quote = this.shadowRoot.querySelector('blockquote');
    if (this.hasAttribute('cite')) quote.cite = this.getAttribute('cite');
    else quote.removeAttribute('cite');
  }
}

if (!customElements.get('ui-quote')) {
  customElements.define('ui-quote', UiQuote);
}
