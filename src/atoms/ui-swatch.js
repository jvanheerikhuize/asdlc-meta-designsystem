const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    .swatch {
      width: var(--icon-md);
      height: var(--icon-md);
      box-sizing: border-box;
      border: var(--line-default);
      border-radius: var(--radius-xs);
      background: var(--_color, var(--color-fg-muted));
    }

    :host([size="sm"]) .swatch {
      width: var(--icon-xs);
      height: var(--icon-xs);
    }

    :host([size="lg"]) .swatch {
      width: var(--control-md);
      height: var(--control-md);
      border-radius: var(--radius-sm);
    }

    :host([shape="round"]) .swatch {
      border-radius: var(--radius-full);
    }

    :host([shape="line"]) .swatch {
      height: var(--border-width-accent);
      border: 0;
      border-radius: var(--radius-full);
    }
  </style>
  <div class="swatch" part="swatch"></div>
`;

/**
 * Color swatch or legend key Atom.
 */
export class UiSwatch extends HTMLElement {
  static observedAttributes = ['color', 'label'];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const el = this.shadowRoot.querySelector('.swatch');
    const color = this.getAttribute('color');
    if (color) el.style.setProperty('--_color', color);
    else el.style.removeProperty('--_color');
    const label = this.getAttribute('label');
    if (label) {
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', label);
      el.removeAttribute('aria-hidden');
    } else {
      el.removeAttribute('role');
      el.removeAttribute('aria-label');
      el.setAttribute('aria-hidden', 'true');
    }
  }
}

if (!customElements.get('ui-swatch')) {
  customElements.define('ui-swatch', UiSwatch);
}
