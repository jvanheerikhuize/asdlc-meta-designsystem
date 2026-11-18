import '../atoms/ui-skeleton.js';

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
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--space-4, 1rem);
    }

    .empty {
      padding: var(--space-8, 2rem);
      text-align: center;
      border-radius: var(--radius-lg, 0.75rem);
      border: 1px dashed var(--color-border, rgba(255, 255, 255, 0.08));
      color: var(--color-fg-muted, #8e8e98);
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
    }

    .empty[hidden],
    .skeletons[hidden] {
      display: none;
    }
  </style>
  <div class="grid skeletons" part="skeletons" hidden>
    <ui-skeleton variant="rect" height="9rem"></ui-skeleton>
    <ui-skeleton variant="rect" height="9rem"></ui-skeleton>
    <ui-skeleton variant="rect" height="9rem"></ui-skeleton>
  </div>
  <div class="grid items" part="grid">
    <slot></slot>
  </div>
  <div class="empty" part="empty" hidden></div>
`;

/**
 * Responsive catalog grid Organism with loading skeleton and empty-state support.
 */
export class UiCatalogGrid extends HTMLElement {
  static observedAttributes = ['loading', 'empty-text', 'empty'];

  #skeletons;
  #items;
  #empty;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#skeletons = shadow.querySelector('.skeletons');
    this.#items = shadow.querySelector('.items');
    this.#empty = shadow.querySelector('.empty');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#skeletons || !this.#items || !this.#empty) return;
    const isLoading = this.hasAttribute('loading');
    const isEmpty = this.hasAttribute('empty');

    this.#skeletons.hidden = !isLoading;
    this.#items.hidden = isLoading || isEmpty;
    this.#empty.hidden = isLoading || !isEmpty;
    this.#empty.textContent = this.getAttribute('empty-text') || 'No matching items.';
  }
}

if (!customElements.get('ui-catalog-grid')) {
  customElements.define('ui-catalog-grid', UiCatalogGrid);
}
