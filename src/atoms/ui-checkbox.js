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
      gap: var(--space-2);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      line-height: var(--leading-normal);
      color: var(--color-fg);
      cursor: pointer;
      user-select: none;
    }

    input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      margin: 0;
      width: var(--size-checkbox);
      height: var(--size-checkbox);
      flex-shrink: 0;
      border-radius: var(--radius-sm);
      border: var(--border-width) solid var(--color-border-hover);
      background: var(--color-surface);
      display: grid;
      place-content: center;
      cursor: pointer;
      transition:
        background-color var(--duration-fast) var(--ease-standard),
        border-color var(--duration-fast) var(--ease-standard);
    }

    input[type="checkbox"]::after {
      content: '';
      width: var(--size-checkmark);
      height: var(--size-checkmark);
      transform: scale(0);
      background: var(--color-accent-fg);
      clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
      transition: transform var(--duration-fast) var(--ease-standard);
    }

    input[type="checkbox"]:checked {
      background: var(--color-accent);
      border-color: var(--color-accent);
    }

    input[type="checkbox"]:checked::after {
      transform: scale(1);
    }

    input[type="checkbox"]:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    :host([disabled]) label,
    :host([disabled]) input[type="checkbox"] {
      opacity: var(--opacity-disabled);
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
