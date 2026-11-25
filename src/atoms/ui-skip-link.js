const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    a {
      position: fixed;
      inset-block-start: var(--space-3);
      inset-inline-start: var(--space-3);
      z-index: var(--z-max);
      padding: var(--inset-sm) var(--inset-md);
      font: var(--type-label);
      color: var(--color-fg-inverse);
      background: var(--color-surface-inverse);
      border-radius: var(--radius-control);
    }

    a:not(:focus) {
      clip-path: inset(50%);
    }

    a:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }
  </style>
  <a part="link"><slot>Skip to content</slot></a>
`;

/**
 * Skip link Atom, visible only while focused.
 */
export class UiSkipLink extends HTMLElement {
  static observedAttributes = ['target'];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    shadow.querySelector('a').addEventListener('click', (event) => {
      const target = this.getRootNode().querySelector(this.#target());
      if (!target) return;
      event.preventDefault();
      if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView();
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  // Only an id on this page.
  #target() {
    return `#${CSS.escape((this.getAttribute('target') || '#main').replace(/^#/, ''))}`;
  }

  #sync() {
    this.shadowRoot.querySelector('a').setAttribute('href', `#${(this.getAttribute('target') || '#main').replace(/^#/, '')}`);
  }
}

if (!customElements.get('ui-skip-link')) {
  customElements.define('ui-skip-link', UiSkipLink);
}
