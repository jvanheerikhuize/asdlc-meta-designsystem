const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    label {
      display: inline-flex;
      align-items: baseline;
      gap: var(--space-1);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      line-height: var(--leading-tight);
      color: var(--color-fg);
      text-box: trim-both cap alphabetic;
    }

    :host([size="sm"]) label {
      font-size: var(--text-xs);
      color: var(--color-fg-secondary);
    }

    .req {
      display: none;
      color: var(--color-accent);
      font-weight: var(--weight-semibold);
    }

    :host([required]) .req {
      display: inline;
    }
  </style>
  <label part="label">
    <slot></slot>
    <span class="req" aria-hidden="true">*</span>
  </label>
`;

/**
 * Form label Atom with optical cap-height alignment and optional required marker.
 */
export class UiLabel extends HTMLElement {
  static observedAttributes = ['for', 'required', 'size'];

  #label;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#label = shadow.querySelector('label');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#label) return;
    const htmlFor = this.getAttribute('for');
    if (htmlFor) {
      this.#label.setAttribute('for', htmlFor);
    } else {
      this.#label.removeAttribute('for');
    }
  }
}

if (!customElements.get('ui-label')) {
  customElements.define('ui-label', UiLabel);
}
