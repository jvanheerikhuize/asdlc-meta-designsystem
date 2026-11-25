const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    .marker {
      position: relative;
      display: grid;
      place-items: center;
      width: var(--size-marker);
      height: var(--size-marker);
      color: var(--color-accent-fg);
      font: var(--type-caption);
      font-weight: var(--weight-bold);
    }

    .marker::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--_marker, var(--color-accent));
      border: var(--border-width-strong) solid var(--color-bg);
      border-radius: var(--radius-full) var(--radius-full) 0 var(--radius-full);
      rotate: 45deg;
      box-shadow: var(--shadow-sm);
    }

    .text {
      position: relative;
    }

    :host([variant="info"]) .marker {
      --_marker: var(--color-info);
      color: var(--color-info-fg);
    }

    :host([variant="success"]) .marker {
      --_marker: var(--color-success);
      color: var(--color-success-fg);
    }

    :host([variant="warning"]) .marker {
      --_marker: var(--color-warning);
      color: var(--color-warning-fg);
    }

    :host([variant="danger"]) .marker {
      --_marker: var(--color-danger);
      color: var(--color-danger-fg);
    }

    :host([variant="neutral"]) .marker {
      --_marker: var(--color-neutral);
      color: var(--color-neutral-fg);
    }

    :host([selected]) .marker {
      scale: var(--scale-pop);
    }
  </style>
  <span class="marker" part="marker" role="img"><span class="text"><slot></slot></span></span>
`;

/**
 * Map marker Atom.
 */
export class UiMarker extends HTMLElement {
  static observedAttributes = ['label'];

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
    this.shadowRoot.querySelector('.marker').setAttribute('aria-label', this.getAttribute('label') || this.textContent.trim() || 'Marker');
  }
}

if (!customElements.get('ui-marker')) {
  customElements.define('ui-marker', UiMarker);
}
