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
      grid-template-columns: minmax(0, 1fr) 300px;
      gap: var(--space-6, 1.5rem);
      align-items: start;
    }

    @media (max-width: 820px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
  <div class="grid" part="grid">
    <div class="main" part="main">
      <slot></slot>
    </div>
    <aside class="aside" part="aside">
      <slot name="aside"></slot>
    </aside>
  </div>
`;

/**
 * Two-column detail Template pairing primary prose/content with a metadata sidebar.
 */
export class DetailLayout extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('detail-layout')) {
  customElements.define('detail-layout', DetailLayout);
}
