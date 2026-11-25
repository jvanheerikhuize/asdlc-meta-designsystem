const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    div {
      position: absolute;
      width: var(--border-width);
      height: var(--border-width);
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  </style>
  <div part="live" aria-live="polite" aria-atomic="true"></div>
`;

/**
 * Announcement Atom: an invisible live region.
 */
export class UiLive extends HTMLElement {
  static observedAttributes = ['assertive'];

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

  /** Announces a message, also when it equals the previous one. */
  announce(message) {
    const el = this.shadowRoot.querySelector('div');
    el.textContent = '';
    requestAnimationFrame(() => { el.textContent = message; });
  }

  #sync() {
    this.shadowRoot.querySelector('div').setAttribute('aria-live', this.hasAttribute('assertive') ? 'assertive' : 'polite');
  }
}

if (!customElements.get('ui-live')) {
  customElements.define('ui-live', UiLive);
}
