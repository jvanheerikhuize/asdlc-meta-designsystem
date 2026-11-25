const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .stack {
      display: flex;
      flex-direction: column;
      gap: var(--stack-md);
      min-width: 0;
    }

    :host([gap="none"]) .stack {
      gap: 0;
    }

    :host([gap="xs"]) .stack {
      gap: var(--stack-xs);
    }

    :host([gap="sm"]) .stack {
      gap: var(--stack-sm);
    }

    :host([gap="lg"]) .stack {
      gap: var(--stack-lg);
    }

    :host([gap="xl"]) .stack {
      gap: var(--stack-xl);
    }

    :host([align="start"]) .stack {
      align-items: flex-start;
    }

    :host([align="center"]) .stack {
      align-items: center;
    }

    :host([align="end"]) .stack {
      align-items: flex-end;
    }
  </style>
  <div class="stack" part="stack"><slot></slot></div>
`;

/**
 * Vertical layout Atom with even spacing.
 */
export class UiStack extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-stack')) {
  customElements.define('ui-stack', UiStack);
}
