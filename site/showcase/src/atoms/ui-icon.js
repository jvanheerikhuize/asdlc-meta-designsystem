const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4m0-4h.01"/>',
  'arrow-right': '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  'arrow-left': '<path d="M19 12H5m6-6-6 6 6 6"/>',
  sparkles: '<path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z"/><path d="M5 18l.8 1.8L7.6 20l-1.8.8L5 22l-.8-1.2L2.4 20l1.8-.2L5 18Z"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
};

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      color: currentColor;
    }

    :host([hidden]) {
      display: none;
    }

    svg {
      display: block;
      width: var(--_icon-size, 1rem);
      height: var(--_icon-size, 1rem);
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    :host([size="sm"]) svg { --_icon-size: 0.875rem; }
    :host([size="md"]) svg { --_icon-size: 1rem; }
    :host([size="lg"]) svg { --_icon-size: 1.375rem; }
  </style>
  <svg part="icon" viewBox="0 0 24 24" aria-hidden="true"></svg>
`;

/**
 * Vector icon Atom rendering built-in crisp SVG strokes with accessible
 * decorative (aria-hidden) or labelled (role="img") semantics.
 */
export class UiIcon extends HTMLElement {
  static observedAttributes = ['name', 'size', 'label'];

  #svg;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#svg = shadow.querySelector('svg');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  static get names() {
    return Object.keys(ICONS);
  }

  #sync() {
    if (!this.#svg) return;
    const name = this.getAttribute('name') || 'sparkles';
    this.#svg.innerHTML = ICONS[name] || ICONS.sparkles;

    const label = this.getAttribute('label');
    if (label) {
      this.#svg.setAttribute('role', 'img');
      this.#svg.setAttribute('aria-label', label);
      this.#svg.removeAttribute('aria-hidden');
    } else {
      this.#svg.removeAttribute('role');
      this.#svg.removeAttribute('aria-label');
      this.#svg.setAttribute('aria-hidden', 'true');
    }
  }
}

if (!customElements.get('ui-icon')) {
  customElements.define('ui-icon', UiIcon);
}
