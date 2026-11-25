const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    p {
      margin: 0;
      font: var(--type-caption);
      color: var(--color-fg-muted);
    }

    :host([tone="error"]) p {
      color: var(--color-danger);
    }

    :host([tone="success"]) p {
      color: var(--color-success);
    }

    :host([tone="warning"]) p {
      color: var(--color-warning);
    }
  </style>
  <p part="hint"><slot></slot></p>
`;

/**
 * Help or validation text Atom for a control.
 */
export class UiHint extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-hint')) {
  customElements.define('ui-hint', UiHint);
}
