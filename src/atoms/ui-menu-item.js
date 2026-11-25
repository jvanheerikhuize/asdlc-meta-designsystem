const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    button {
      all: unset;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--cluster-sm);
      width: 100%;
      min-height: var(--control-sm);
      padding: var(--space-1) var(--space-3);
      font: var(--type-small);
      color: var(--color-fg);
      border-radius: var(--radius-sm);
      cursor: var(--cursor-interactive);
    }

    button:hover:not(:disabled) {
      background: var(--color-card-hover);
    }

    button:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    button[aria-checked="true"] {
      background: var(--color-selected);
    }

    :host([variant="danger"]) button {
      color: var(--color-danger);
    }

    button:disabled {
      opacity: var(--opacity-disabled);
      cursor: var(--cursor-disabled);
    }
  </style>
  <button part="item" type="button" role="menuitem"><slot></slot></button>
`;

/**
 * Menu item Atom.
 */
export class UiMenuItem extends HTMLElement {
  static observedAttributes = ['disabled', 'checked'];

  #button;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#button = shadow.querySelector('button');
    this.#button.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ui-press', { bubbles: true, composed: true, detail: null }));
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    this.#button.disabled = this.hasAttribute('disabled');
    const checked = this.getAttribute('checked');
    this.#button.setAttribute('role', checked === null ? 'menuitem' : 'menuitemcheckbox');
    if (checked === null) this.#button.removeAttribute('aria-checked');
    else this.#button.setAttribute('aria-checked', String(checked !== 'false'));
  }
}

if (!customElements.get('ui-menu-item')) {
  customElements.define('ui-menu-item', UiMenuItem);
}
