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

    :host([tone="accent"]) code {
      color: var(--color-code-keyword);
    }
  </style>
  <code part="code"><slot></slot></code>
`;

/**
 * Inline code Atom.
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
