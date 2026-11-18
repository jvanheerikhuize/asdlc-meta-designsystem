const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--space-6, 1.5rem);
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4, 1rem);
      flex-wrap: wrap;
    }
  </style>
  <section part="hero">
    <slot name="hero"></slot>
  </section>
  <section class="toolbar" part="toolbar">
    <slot name="toolbar"></slot>
  </section>
  <section part="grid">
    <slot name="grid"></slot>
  </section>
  <slot name="modal"></slot>
`;

/**
 * Catalog browser layout Template arranging hero, toolbar, grid, and modal slots.
 */
export class CatalogLayout extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('catalog-layout')) {
  customElements.define('catalog-layout', CatalogLayout);
}
