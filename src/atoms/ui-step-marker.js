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
      display: grid;
      place-items: center;
      box-sizing: border-box;
      width: var(--icon-xl);
      height: var(--icon-xl);
      border-radius: var(--radius-full);
      border: var(--border-width-strong) solid var(--color-border-control);
      font: var(--type-caption);
      font-weight: var(--weight-semibold);
      color: var(--color-fg-secondary);
    }

    :host([state="current"]) span {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    :host([state="done"]) span {
      border-color: var(--color-success);
      background: var(--color-success);
      color: var(--color-success-fg);
    }

    :host([state="error"]) span {
      border-color: var(--color-danger);
      background: var(--color-danger);
      color: var(--color-danger-fg);
    }
  </style>
  <span part="marker" role="img"></span>
`;

/**
 * Numbered step marker Atom.
 */
export class UiStepMarker extends HTMLElement {
  static observedAttributes = ['number', 'state', 'label'];

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
    const el = this.shadowRoot.querySelector('span');
    const number = this.getAttribute('number') || '1';
    const state = this.getAttribute('state') || 'todo';
    el.textContent = { done: '✓', error: '!' }[state] ?? number;
    el.setAttribute('aria-label', `${this.getAttribute('label') || `Step ${number}`}, ${state}`);
  }
}

if (!customElements.get('ui-step-marker')) {
  customElements.define('ui-step-marker', UiStepMarker);
}
