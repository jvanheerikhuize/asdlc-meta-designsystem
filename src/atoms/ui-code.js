const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }

    code {
      font: var(--type-code);
      padding: 0 var(--space-1);
      border-radius: var(--radius-sm);
      border: var(--line-subtle);
      background: var(--color-code-bg);
      color: var(--color-code-fg);
      overflow-wrap: anywhere;
    }

    :host([variant="block"]:not([hidden])) {
      display: block;
      white-space: normal;
    }

    :host([variant="block"]) code {
      display: block;
      padding: 0;
      border: 0;
      background: none;
      font: var(--type-code-small);
      color: var(--color-fg-secondary);
      white-space: pre-wrap;
      overflow-wrap: normal;
    }

    :host([tone="accent"]) code {
      color: var(--color-code-keyword);
    }
  </style>
  <code part="code"><slot></slot></code>
`;

/**
 * Code Atom, inline or as a block.
 */
export class UiCode extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-code')) {
  customElements.define('ui-code', UiCode);
}
