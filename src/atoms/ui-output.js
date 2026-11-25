const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    output {
      font: var(--type-body-strong);
      font-variant-numeric: var(--numeric-tabular);
      color: var(--color-fg);
    }

    :host([variant="stat"]) output {
      font: var(--type-stat);
    }
  </style>
  <output part="output"><slot></slot></output>
`;

/**
 * Result Atom: a native output that announces changes.
 */
export class UiOutput extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-output')) {
  customElements.define('ui-output', UiOutput);
}
