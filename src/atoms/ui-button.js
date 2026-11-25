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

    button {
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      font-family: var(--font-sans);
      font-weight: var(--weight-semibold);
      line-height: var(--leading-none);
      border-radius: var(--radius-md);
      border: var(--border-width) solid transparent;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      transition:
        background-color var(--duration-fast) var(--ease-standard),
        border-color var(--duration-fast) var(--ease-standard),
        color var(--duration-fast) var(--ease-standard),
        opacity var(--duration-fast) var(--ease-standard);
    }

    /* Sizes */
    :host([size="sm"]) button {
      font-size: var(--text-xs);
      padding: var(--space-1) var(--space-3);
      min-height: var(--control-sm);
    }

    :host(:not([size])) button,
    :host([size="md"]) button {
      font-size: var(--text-sm);
      padding: var(--space-2) var(--space-4);
      min-height: var(--control-md);
    }

    :host([size="lg"]) button {
      font-size: var(--text-md);
      padding: var(--space-3) var(--space-5);
      min-height: var(--control-lg);
    }

    /* Variants */
    :host(:not([variant])) button,
    :host([variant="primary"]) button {
      background: var(--color-accent);
      color: var(--color-accent-fg);
    }

    :host(:not([variant])) button:hover:not(:disabled):not([aria-busy="true"]),
    :host([variant="primary"]) button:hover:not(:disabled):not([aria-busy="true"]) {
      background: var(--color-accent-hover);
    }

    :host([variant="secondary"]) button {
      background: var(--color-card);
      color: var(--color-fg);
      border-color: var(--color-border);
    }

    :host([variant="secondary"]) button:hover:not(:disabled):not([aria-busy="true"]) {
      background: var(--color-card-hover);
      border-color: var(--color-border-hover);
    }

    :host([variant="ghost"]) button {
      background: transparent;
      color: var(--color-fg-secondary);
    }

    :host([variant="ghost"]) button:hover:not(:disabled):not([aria-busy="true"]) {
      background: var(--color-card);
      color: var(--color-fg);
    }

    :host([variant="surface"]) button {
      background: var(--color-surface);
      color: var(--color-fg);
      border-color: var(--color-border-hover);
      box-shadow: var(--shadow-sm);
    }

    :host([variant="danger"]) button {
      background: var(--color-danger);
      color: var(--color-danger-fg);
    }

    /* Toggle button that is on */
    :host([aria-pressed="true"]:not([variant="danger"])) button {
      background: color-mix(in srgb, var(--color-accent) 18%, transparent);
      border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
      color: var(--color-fg);
    }

    :host([aria-pressed="true"]:not([variant="danger"])) button:hover:not(:disabled):not([aria-busy="true"]) {
      background: color-mix(in srgb, var(--color-accent) 28%, transparent);
    }

    /* Focus ring */
    button:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    /* Disabled & busy states */
    :host([disabled]) button,
    :host([busy]) button {
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }

    .spinner {
      display: none;
      width: 0.875em;
      height: 0.875em;
      border: var(--border-width-strong) solid currentColor;
      border-right-color: transparent;
      border-radius: var(--radius-full);
      animation: ui-spin var(--duration-spin) linear infinite;
    }

    :host([busy]) .spinner {
      display: inline-block;
    }

    @keyframes ui-spin {
      to { transform: rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition: none;
      }
      .spinner {
        animation: none;
        border-right-color: currentColor;
        opacity: var(--opacity-muted);
      }
    }
  </style>
  <button part="button" type="button">
    <span class="spinner" aria-hidden="true"></span>
    <slot></slot>
  </button>
`;

/**
 * Interactive button Atom encapsulating native <button> with variant, size,
 * disabled, and busy state handling.
 */
export class UiButton extends HTMLElement {
  static observedAttributes = ['disabled', 'busy', 'type', 'variant', 'size', 'aria-label', 'aria-pressed', 'aria-expanded', 'aria-haspopup'];
  static formAssociated = true;

  #btn;
  #internals;
  #formDisabled = false;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#btn = shadow.querySelector('button');
    this.#internals = this.attachInternals();

    this.#btn.addEventListener('click', (event) => {
      if (this.disabled || this.#formDisabled || this.busy) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      this.dispatchEvent(new CustomEvent('ui-press', {
        bubbles: true,
        composed: true,
        detail: { variant: this.variant },
      }));
      // The inner button is outside the form's tree, so it cannot submit by itself.
      const type = this.getAttribute('type');
      if (type === 'submit') this.#internals.form?.requestSubmit();
      if (type === 'reset') this.#internals.form?.reset();
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  formDisabledCallback(disabled) {
    this.#formDisabled = disabled;
    this.#sync();
  }

  /** The form that owns this button, if any. */
  get form() {
    return this.#internals.form;
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  get busy() {
    return this.hasAttribute('busy');
  }

  set busy(val) {
    this.toggleAttribute('busy', Boolean(val));
  }

  get variant() {
    return this.getAttribute('variant') || 'primary';
  }

  set variant(val) {
    this.setAttribute('variant', val);
  }

  #sync() {
    if (!this.#btn) return;
    const isDisabled = this.disabled || this.#formDisabled;
    const isBusy = this.busy;
    this.#btn.type = this.getAttribute('type') || 'button';
    this.#btn.disabled = isDisabled;
    this.#btn.setAttribute('aria-disabled', String(isDisabled || isBusy));
    this.#btn.setAttribute('aria-busy', String(isBusy));
    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) {
      this.#btn.setAttribute('aria-label', ariaLabel);
    } else {
      this.#btn.removeAttribute('aria-label');
    }
    for (const name of ['aria-expanded', 'aria-haspopup']) {
      const value = this.getAttribute(name);
      if (value === null) this.#btn.removeAttribute(name);
      else this.#btn.setAttribute(name, value);
    }
    const pressed = this.getAttribute('aria-pressed');
    if (pressed === null) {
      this.#btn.removeAttribute('aria-pressed');
    } else {
      this.#btn.setAttribute('aria-pressed', String(pressed === 'true'));
    }
  }
}

if (!customElements.get('ui-button')) {
  customElements.define('ui-button', UiButton);
}
