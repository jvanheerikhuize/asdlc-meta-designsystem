const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .cluster {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--cluster-sm);
      min-width: 0;
    }

    :host([gap="none"]) .cluster {
      gap: 0;
    }

    :host([gap="xs"]) .cluster {
      gap: var(--cluster-xs);
    }

    :host([gap="md"]) .cluster {
      gap: var(--cluster-md);
    }

    :host([gap="lg"]) .cluster {
      gap: var(--cluster-lg);
    }

    :host([justify="center"]) .cluster {
      justify-content: center;
    }

    :host([justify="end"]) .cluster {
      justify-content: flex-end;
    }

    :host([justify="between"]) .cluster {
      justify-content: space-between;
    }

    :host([align="start"]) .cluster {
      align-items: flex-start;
    }

    :host([align="end"]) .cluster {
      align-items: flex-end;
    }

    :host([align="baseline"]) .cluster {
      align-items: baseline;
    }

    :host([nowrap]) .cluster {
      flex-wrap: nowrap;
    }
  </style>
  <div class="cluster" part="cluster"><slot></slot></div>
`;

/**
 * Horizontal layout Atom that wraps.
 */
export class UiCluster extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-cluster')) {
  customElements.define('ui-cluster', UiCluster);
}
