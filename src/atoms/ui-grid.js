const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(var(--layout-column-min), 100%), 1fr));
      gap: var(--stack-md);
    }

    :host([gap="none"]) .grid {
      gap: 0;
    }

    :host([gap="xs"]) .grid {
      gap: var(--stack-xs);
    }

    :host([gap="sm"]) .grid {
      gap: var(--stack-sm);
    }

    :host([gap="lg"]) .grid {
      gap: var(--stack-lg);
    }

    :host([gap="xl"]) .grid {
      gap: var(--stack-xl);
    }

    :host([min="xs"]) .grid {
      grid-template-columns: repeat(auto-fill, minmax(min(var(--size-thumbnail-lg), 100%), 1fr));
    }

    :host([min="md"]) .grid {
      grid-template-columns: repeat(auto-fill, minmax(min(var(--panel-sheet), 100%), 1fr));
    }

    :host([min="lg"]) .grid {
      grid-template-columns: repeat(auto-fill, minmax(min(var(--panel-menu-max), 100%), 1fr));
    }
  </style>
  <div class="grid" part="grid"><slot></slot></div>
`;

/**
 * Grid layout Atom with as many columns as fit.
 */
export class UiGrid extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-grid')) {
  customElements.define('ui-grid', UiGrid);
}
