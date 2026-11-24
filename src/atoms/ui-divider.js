const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      flex-shrink: 0;
    }

    :host([hidden]) {
      display: none;
    }

    :host([orientation="vertical"]) {
      display: inline-flex;
      align-self: stretch;
    }

    .line {
      width: 100%;
      height: 0;
      border: 0;
      border-block-start: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      margin: 0;
    }

    :host([orientation="vertical"]) .line {
      width: 0;
      height: auto;
      min-height: 1.25rem;
      border-block-start: 0;
      border-inline-start: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
    }
  </style>
  <div class="line" part="divider" role="separator" aria-orientation="horizontal"></div>
`;

/**
 * Hairline separator Atom supporting horizontal and vertical orientations.
 */
export class UiDivider extends HTMLElement {
  static observedAttributes = ['orientation'];

  #line;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#line = shadow.querySelector('.line');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#line) return;
    const vertical = this.getAttribute('orientation') === 'vertical';
    this.#line.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
  }
}

if (!customElements.get('ui-divider')) {
  customElements.define('ui-divider', UiDivider);
}
