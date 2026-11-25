const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    :host([grow]) {
      flex: 1;
    }

    .space {
      width: var(--space-4);
      height: var(--space-4);
    }

    :host([size="xs"]) .space {
      width: var(--space-1);
      height: var(--space-1);
    }

    :host([size="sm"]) .space {
      width: var(--space-2);
      height: var(--space-2);
    }

    :host([size="lg"]) .space {
      width: var(--space-6);
      height: var(--space-6);
    }

    :host([size="xl"]) .space {
      width: var(--space-10);
      height: var(--space-10);
    }
  </style>
  <div class="space" part="space" aria-hidden="true"></div>
`;

/**
 * Empty space Atom: a fixed step, or all remaining space.
 */
export class UiSpacer extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-spacer')) {
  customElements.define('ui-spacer', UiSpacer);
}
