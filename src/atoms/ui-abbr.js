const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }

    abbr {
      text-decoration: underline dotted;
      text-underline-offset: var(--underline-offset);
      cursor: var(--cursor-help);
    }
  </style>
  <abbr part="abbr"><slot></slot></abbr>
`;

/**
 * Abbreviation Atom that names its full form.
 */
export class UiAbbr extends HTMLElement {
  static observedAttributes = ['full'];

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
    this.shadowRoot.querySelector('abbr').title = this.getAttribute('full') || '';
  }
}

if (!customElements.get('ui-abbr')) {
  customElements.define('ui-abbr', UiAbbr);
}
