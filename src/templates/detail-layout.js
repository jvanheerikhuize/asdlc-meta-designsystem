const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      container-type: inline-size;
    }

    :host([hidden]) {
      display: none;
    }

    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) var(--layout-aside);
      gap: var(--space-6);
      align-items: start;
    }

    @container (max-width: 640px) {
      .grid {
        grid-template-columns: 1fr;
        gap: var(--space-3);
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
 * Two-column detail Template pairing primary prose/content with a metadata sidebar,
 * collapsing cleanly via container query in narrow containers.
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
