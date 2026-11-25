const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    span {
      display: block;
      width: var(--space-3);
      height: var(--space-2);
      background: var(--color-surface-elevated);
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
    }

    :host([tone="inverse"]) span {
      background: var(--color-surface-inverse);
    }

    :host([tone="accent"]) span {
      background: var(--color-accent);
    }

    :host([direction="down"]) span {
      clip-path: polygon(0 0, 100% 0, 50% 100%);
    }

    :host([direction="left"]) span {
      width: var(--space-2);
      height: var(--space-3);
      clip-path: polygon(0 50%, 100% 0, 100% 100%);
    }

    :host([direction="right"]) span {
      width: var(--space-2);
      height: var(--space-3);
      clip-path: polygon(0 0, 100% 50%, 0 100%);
    }
  </style>
  <span part="arrow" aria-hidden="true"></span>
`;

/**
 * Pointer triangle Atom for bubbles and panels.
 */
export class UiArrow extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-arrow')) {
  customElements.define('ui-arrow', UiArrow);
}
