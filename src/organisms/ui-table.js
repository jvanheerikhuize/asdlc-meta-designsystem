import '../atoms/ui-scroll.js';
import '../atoms/ui-skeleton.js';
import '../molecules/ui-empty-state.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      min-width: 0;
      color: var(--color-fg);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
    }

    :host([hidden]) {
      display: none;
    }

    ui-scroll::part(scroll) {
      border-radius: var(--radius-sm);
    }

    ui-skeleton[hidden] {
      display: none;
    }

  </style>
  <ui-scroll class="scroll" exportparts="scroll" axis="x"><slot></slot></ui-scroll>
  <ui-skeleton part="skeleton" variant="text" lines="4" hidden></ui-skeleton>
  <ui-empty-state part="empty" hidden></ui-empty-state>
`;

// Cells stay in the owning document so native table semantics and queries keep working.
const CELLS = new CSSStyleSheet();
CELLS.replaceSync(`
  ui-table > table { width: 100%; border-collapse: collapse; }
  ui-table > table :is(th, td) {
    padding: var(--space-2) var(--space-3);
    border-block-end: var(--border-width) solid var(--color-border);
    text-align: start;
    white-space: nowrap;
  }
  ui-table > table th { color: var(--color-fg-secondary); font-weight: var(--weight-medium); }
  ui-table > table caption { padding-block-end: var(--space-2); text-align: start; color: var(--color-fg-secondary); }
`);

/**
 * Data table Organism: styles a slotted native <table> and scrolls it in a labelled <ui-scroll>,
 * or shows a loading placeholder or an empty message in its place.
 */
export class UiTable extends HTMLElement {
  static observedAttributes = ['aria-label', 'loading', 'empty', 'empty-text'];

  #scroll;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#scroll = shadow.querySelector('.scroll');
  }

  connectedCallback() {
    const root = this.getRootNode();
    if (root.adoptedStyleSheets && !root.adoptedStyleSheets.includes(CELLS)) root.adoptedStyleSheets.push(CELLS);
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const loading = this.hasAttribute('loading');
    const empty = !loading && this.hasAttribute('empty');
    const emptyState = this.shadowRoot.querySelector('ui-empty-state');
    this.#scroll.setAttribute('aria-label', this.getAttribute('aria-label') || 'Table');
    this.#scroll.hidden = loading || empty;
    this.shadowRoot.querySelector('ui-skeleton').hidden = !loading;
    emptyState.hidden = !empty;
    emptyState.setAttribute('text', this.getAttribute('empty-text') || 'No rows.');
  }
}

if (!customElements.get('ui-table')) {
  customElements.define('ui-table', UiTable);
}
