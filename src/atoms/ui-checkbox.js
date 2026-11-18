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

    label {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2, 0.5rem);
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
      line-height: var(--leading-normal, 1.5);
      color: var(--color-fg, #ededed);
      cursor: pointer;
      user-select: none;
    }

    input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      margin: 0;
      width: 1.05rem;
      height: 1.05rem;
      flex-shrink: 0;
      border-radius: var(--radius-sm, 0.375rem);
      border: 1px solid var(--color-border-hover, rgba(255, 255, 255, 0.22));
      background: var(--color-surface, #111116);
      display: grid;
      place-content: center;
      cursor: pointer;
      transition:
        background-color var(--duration-fast, 120ms) var(--ease-standard, ease),
        border-color var(--duration-fast, 120ms) var(--ease-standard, ease);
    }

    input[type="checkbox"]::after {
      content: '';
      width: 0.55rem;
      height: 0.55rem;
      transform: scale(0);
      background: var(--color-accent-fg, #08080b);
      clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
      transition: transform var(--duration-fast, 120ms) var(--ease-standard, ease);
    }

    input[type="checkbox"]:checked {
      background: var(--color-accent, #f43f5e);
      border-color: var(--color-accent, #f43f5e);
    }

    input[type="checkbox"]:checked::after {
      transform: scale(1);
    }

    input[type="checkbox"]:focus-visible {
      outline: 2px solid var(--color-focus-ring, #f43f5e);
      outline-offset: 2px;
    }

    :host([disabled]) label,
    :host([disabled]) input[type="checkbox"] {
      opacity: 0.55;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      input[type="checkbox"],
      input[type="checkbox"]::after {
        transition: none;
      }
    }
  </style>
  <label part="label">
    <input part="checkbox" type="checkbox" />
    <slot></slot>
  </label>
`;

/**
 * Checkbox Atom encapsulating native <input type="checkbox"> with checked/disabled/indeterminate states.
 */
export class UiCheckbox extends HTMLElement {
  static observedAttributes = ['checked', 'disabled', 'indeterminate', 'name', 'value', 'aria-label'];

  #input;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#input = shadow.querySelector('input');

    this.#input.addEventListener('change', () => {
      this.checked = this.#input.checked;
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
    if (!this.#input) return;
    this.#input.checked = this.checked;
    this.#input.disabled = this.disabled;
    this.#input.indeterminate = this.hasAttribute('indeterminate');
    this.#input.name = this.getAttribute('name') || '';
    this.#input.value = this.value;
    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) this.#input.setAttribute('aria-label', ariaLabel);
    else this.#input.removeAttribute('aria-label');
  }
}

if (!customElements.get('ui-checkbox')) {
  customElements.define('ui-checkbox', UiCheckbox);
}
