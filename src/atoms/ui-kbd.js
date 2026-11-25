const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    kbd {
      display: inline-block;
      min-width: var(--space-5);
      box-sizing: border-box;
      padding: 0 var(--space-1-5);
      font: var(--type-caption);
      font-family: var(--font-mono);
      text-align: center;
      border: var(--line-strong);
      border-bottom-width: var(--border-width-strong);
      border-radius: var(--radius-sm);
      background: var(--color-surface-elevated);
      color: var(--color-fg);
    }

    :host([size="sm"]) kbd {
      font-size: var(--text-2xs);
      padding: 0 var(--space-1);
    }
  </style>
  <kbd part="key"><slot></slot></kbd>
`;

/**
 * Keyboard key Atom.
 */
export class UiKbd extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-kbd')) {
  customElements.define('ui-kbd', UiKbd);
}
