const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    :host([hidden]) {
      display: none;
    }

    .wrap {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      line-height: var(--leading-normal);
      color: var(--color-fg);
      cursor: pointer;
      user-select: none;
    }

    button {
      position: relative;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      width: var(--switch-width);
      height: var(--switch-height);
      padding: var(--space-0-5);
      margin: 0;
      border-radius: var(--radius-full);
      border: var(--border-width) solid var(--color-border-hover);
      background: var(--color-card-hover);
      cursor: pointer;
      flex-shrink: 0;
      transition:
        background-color var(--duration-fast) var(--ease-standard),
        border-color var(--duration-fast) var(--ease-standard);
    }

    :host([size="sm"]) button {
      width: var(--switch-width-sm);
      height: var(--switch-height-sm);
    }

    .thumb {
      width: var(--size-thumb);
      height: var(--size-thumb);
      border-radius: var(--radius-full);
      background: var(--color-thumb);
      box-shadow: var(--shadow-thumb);
      transform: translateX(0);
      transition:
        transform var(--duration-fast) var(--ease-standard),
        background-color var(--duration-fast) var(--ease-standard);
    }

    :host([size="sm"]) .thumb {
      width: var(--size-thumb-sm);
      height: var(--size-thumb-sm);
    }

    button[aria-checked="true"] {
      background: var(--color-accent);
      border-color: var(--color-accent);
    }

    button[aria-checked="true"] .thumb {
      transform: translateX(var(--switch-travel));
      background: var(--color-thumb);
    }

    :host([size="sm"]) button[aria-checked="true"] .thumb {
      transform: translateX(var(--switch-travel-sm));
    }

    button:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    :host([disabled]) .wrap,
    :host([disabled]) button {
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      button,
      .thumb {
        transition: none;
      }
    }
  </style>
  <span class="wrap" part="label">
    <button part="switch" type="button" role="switch" aria-checked="false">
      <span class="thumb" part="thumb" aria-hidden="true"></span>
    </button>
    <span class="text"><slot></slot></span>
  </span>
`;

/**
 * Boolean toggle switch Atom exposing role="switch" and aria-checked semantics.
 */
export class UiSwitch extends HTMLElement {
  static observedAttributes = ['checked', 'disabled', 'size', 'name', 'value', 'aria-label'];

  #btn;
  #wrap;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#btn = shadow.querySelector('button');
    this.#wrap = shadow.querySelector('.wrap');

    this.#wrap.addEventListener('click', (event) => {
      if (this.disabled) {
        event.preventDefault();
        return;
      }
      this.checked = !this.checked;
      this.dispatchEvent(new CustomEvent('ui-change', {
        bubbles: true,
        composed: true,
        detail: { checked: this.checked, value: this.value },
      }));
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get checked() {
    return this.hasAttribute('checked');
  }

  set checked(val) {
    this.toggleAttribute('checked', Boolean(val));
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  get value() {
    return this.getAttribute('value') || 'on';
  }

  set value(val) {
    this.setAttribute('value', val == null ? 'on' : String(val));
  }

  #sync() {
    if (!this.#btn) return;
    this.#btn.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    if (this.disabled) {
      this.#btn.setAttribute('aria-disabled', 'true');
    } else {
      this.#btn.removeAttribute('aria-disabled');
    }
    const ariaLabel = this.getAttribute('aria-label') || this.textContent?.trim() || 'Toggle';
    this.#btn.setAttribute('aria-label', ariaLabel);
  }
}

if (!customElements.get('ui-switch')) {
  customElements.define('ui-switch', UiSwitch);
}
