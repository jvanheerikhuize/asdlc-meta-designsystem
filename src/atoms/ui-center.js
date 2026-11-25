const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .center {
      box-sizing: border-box;
      width: 100%;
      max-width: var(--measure-prose);
      margin-inline: auto;
      padding-inline: var(--gutter);
    }

    :host([width="form"]) .center {
      max-width: var(--layout-form);
    }

    :host([width="content"]) .center {
      max-width: var(--layout-content);
    }

    :host([width="full"]) .center {
      max-width: none;
    }
  </style>
  <div class="center" part="center"><slot></slot></div>
`;

/**
 * Centering layout Atom with a readable or page width.
 */
export class UiCenter extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-center')) {
  customElements.define('ui-center', UiCenter);
}
