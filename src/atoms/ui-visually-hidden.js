const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }

    span {
      position: absolute;
      width: var(--border-width);
      height: var(--border-width);
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  </style>
  <span part="text"><slot></slot></span>
`;

/**
 * Text Atom for assistive technology only.
 */
export class UiVisuallyHidden extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-visually-hidden')) {
  customElements.define('ui-visually-hidden', UiVisuallyHidden);
}
