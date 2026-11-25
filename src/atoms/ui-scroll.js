const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .scroll {
      max-height: 100%;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--color-border-hover) transparent;
    }

    :host {
      min-height: 0;
    }

    :host([axis="x"]) .scroll {
      overflow: auto hidden;
      overscroll-behavior: contain auto;
    }

    :host([axis="both"]) .scroll {
      overflow: auto;
    }

    .scroll:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }
  </style>
  <div class="scroll" part="scroll" role="region"><slot></slot></div>
`;

/**
 * Scroll area Atom that is a keyboard stop only while it overflows.
 */
export class UiScroll extends HTMLElement {
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

  attributeChangedCallback() {
    this.#sync();
  }

  connectedCallback() {
    this.#sync();
    this.#observe();
  }

  disconnectedCallback() {
    this.#observer.disconnect();
  }

  #observe() {
    this.#observer.disconnect();
    if (!this.isConnected) return;
    this.#observer.observe(this.#scroll);
    // Flattened, so content passed on through an outer slot counts too.
    for (const el of this.#slot.assignedElements({ flatten: true })) this.#observer.observe(el);
  }

  #syncFocusable() {
    const { scrollWidth, clientWidth, scrollHeight, clientHeight } = this.#scroll;
    if (scrollWidth > clientWidth || scrollHeight > clientHeight) this.#scroll.setAttribute('tabindex', '0');
    else this.#scroll.removeAttribute('tabindex');
  }

  #sync() {
    this.#scroll.setAttribute('aria-label', this.getAttribute('aria-label') || 'Scrollable');
  }
}

if (!customElements.get('ui-scroll')) {
  customElements.define('ui-scroll', UiScroll);
}
