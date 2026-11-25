const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    fieldset {
      margin: 0;
      padding: 0;
      border: 0;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--stack-sm);
    }

    legend {
      padding: 0;
      margin-bottom: var(--stack-sm);
      font: var(--type-label);
      color: var(--color-fg);
    }
  </style>
  <fieldset part="fieldset">
    <legend part="legend"></legend>
    <slot></slot>
  </fieldset>
`;

/**
 * Group Atom: a native fieldset with a legend.
 */
export class UiFieldset extends HTMLElement {
  static observedAttributes = ['legend', 'kind'];

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
    const fieldset = this.shadowRoot.querySelector('fieldset');
    const legend = this.shadowRoot.querySelector('legend');
    legend.textContent = this.getAttribute('legend') || '';
    legend.hidden = !this.hasAttribute('legend');
    if (this.getAttribute('kind') === 'radio') fieldset.setAttribute('role', 'radiogroup');
    else fieldset.removeAttribute('role');
  }
}

if (!customElements.get('ui-fieldset')) {
  customElements.define('ui-fieldset', UiFieldset);
}
