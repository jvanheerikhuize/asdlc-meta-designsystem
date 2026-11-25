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
      position: fixed;
      inset: 0;
      z-index: var(--z-overlay);
      background: var(--color-overlay);
    }

    :host([contained]) div {
      position: absolute;
      z-index: var(--z-raised);
    }

    :host([tone="soft"]) div {
      background: var(--color-scrim-soft);
    }

    :host([tone="media"]) div {
      background: var(--gradient-media-scrim);
    }
  </style>
  <div part="scrim" aria-hidden="true"></div>
`;

/**
 * Overlay Atom that dims what is behind it.
 */
export class UiScrim extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-scrim')) {
  customElements.define('ui-scrim', UiScrim);
}
