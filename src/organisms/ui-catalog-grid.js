import '../atoms/ui-skeleton.js';
import '../molecules/ui-empty-state.js';

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
      grid-template-columns: repeat(auto-fill, minmax(var(--layout-card-min), 1fr));
      gap: var(--space-4);
    }

    .items[hidden],
    .skeletons[hidden] {
      display: none;
    }
  </style>
  <div class="grid skeletons" part="skeletons" hidden>
    <ui-skeleton variant="rect" height="var(--size-skeleton-card)"></ui-skeleton>
    <ui-skeleton variant="rect" height="var(--size-skeleton-card)"></ui-skeleton>
    <ui-skeleton variant="rect" height="var(--size-skeleton-card)"></ui-skeleton>
  </div>
  <div class="grid items" part="grid">
    <slot></slot>
  </div>
  <ui-empty-state class="empty" part="empty" hidden></ui-empty-state>
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
    this.#empty.setAttribute('text', this.getAttribute('empty-text') || 'No matching items.');
  }
}

if (!customElements.get('ui-catalog-grid')) {
  customElements.define('ui-catalog-grid', UiCatalogGrid);
}
