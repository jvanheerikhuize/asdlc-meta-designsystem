const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      min-width: 0;
      color: var(--color-fg, #ededed);
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
    }

    :host([hidden]) {
      display: none;
    }

    .scroll {
      overflow-x: auto;
      border-radius: var(--radius-sm, 0.375rem);
    }

    .scroll:focus-visible {
      outline: 2px solid var(--color-focus-ring, #fb7185);
      outline-offset: 2px;
    }
  </style>
  <div class="scroll" part="scroll" role="region"><slot></slot></div>
`;

// Cells stay in the owning document so native table semantics and queries keep working.
const CELLS = new CSSStyleSheet();
CELLS.replaceSync(`
  ui-table > table { width: 100%; border-collapse: collapse; }
  ui-table > table :is(th, td) {
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    border-block-end: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
    text-align: start;
    white-space: nowrap;
  }
  ui-table > table th { color: var(--color-fg-secondary, #a1a1aa); font-weight: 500; }
  ui-table > table caption { padding-block-end: var(--space-2, 0.5rem); text-align: start; color: var(--color-fg-secondary, #a1a1aa); }
`);

/**
 * Data table Organism: styles a slotted native <table> and scrolls it inside a labelled region.
 */
export class UiTable extends HTMLElement {
  static observedAttributes = ['aria-label'];

  #scroll;
  #slot;
  #observer = new ResizeObserver(() => this.#syncFocusable());

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#scroll = shadow.querySelector('.scroll');
    this.#slot = shadow.querySelector('slot');
    this.#slot.addEventListener('slotchange', () => this.#observe());
  }

  connectedCallback() {
    const root = this.getRootNode();
    if (root.adoptedStyleSheets && !root.adoptedStyleSheets.includes(CELLS)) root.adoptedStyleSheets.push(CELLS);
    this.#syncLabel();
    this.#observe();
  }

  disconnectedCallback() {
    this.#observer.disconnect();
  }

  attributeChangedCallback() {
    this.#syncLabel();
  }

  #observe() {
    this.#observer.disconnect();
    if (!this.isConnected) return;
    this.#observer.observe(this.#scroll);
    for (const el of this.#slot.assignedElements()) this.#observer.observe(el);
  }

  #syncLabel() {
    this.#scroll.setAttribute('aria-label', this.getAttribute('aria-label') || 'Table');
  }

  // A region that does not scroll must not be an extra keyboard stop.
  #syncFocusable() {
    if (this.#scroll.scrollWidth > this.#scroll.clientWidth) this.#scroll.setAttribute('tabindex', '0');
    else this.#scroll.removeAttribute('tabindex');
  }
}

if (!customElements.get('ui-table')) {
  customElements.define('ui-table', UiTable);
}
