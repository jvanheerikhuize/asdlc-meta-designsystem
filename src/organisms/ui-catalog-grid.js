import '../atoms/ui-grid.js';
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
  </style>
  <ui-grid class="skeletons" exportparts="grid: skeletons" min="card" hidden>
    <ui-skeleton variant="rect" height="var(--size-skeleton-card)"></ui-skeleton>
    <ui-skeleton variant="rect" height="var(--size-skeleton-card)"></ui-skeleton>
    <ui-skeleton variant="rect" height="var(--size-skeleton-card)"></ui-skeleton>
  </ui-grid>
  <ui-grid class="items" exportparts="grid" min="card">
    <slot></slot>
  </ui-grid>
  <ui-empty-state class="empty" part="empty" hidden></ui-empty-state>
`;

/**
 * Responsive catalog grid Organism composing <ui-grid>, with loading skeleton and empty-state support.
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
