const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    input {
      appearance: none;
      box-sizing: border-box;
      width: var(--control-md);
      height: var(--control-md);
      padding: var(--space-1);
      border: var(--border-width) solid var(--color-border-field);
      border-radius: var(--radius-control);
      background: var(--color-surface);
      cursor: var(--cursor-interactive);
    }

    input::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    input::-webkit-color-swatch {
      border: 0;
      border-radius: var(--radius-xs);
    }

    input::-moz-color-swatch {
      border: 0;
      border-radius: var(--radius-xs);
    }

    input:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    input:disabled {
      opacity: var(--opacity-disabled);
      cursor: var(--cursor-disabled);
    }
  </style>
  <input part="input" type="color" />
`;

/**
 * Color picker Atom.
 */
export class UiColorInput extends HTMLElement {
  static observedAttributes = ['value', 'disabled', 'name', 'aria-label'];
  static formAssociated = true;

  #input;
  #internals = this.attachInternals();
  #formDisabled = false;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#input = shadow.querySelector('input');
    this.#input.addEventListener('input', () => {
      this.#syncForm();
      this.dispatchEvent(new CustomEvent('ui-input', { bubbles: true, composed: true, detail: { value: this.value } }));
    });
    this.#input.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('ui-change', { bubbles: true, composed: true, detail: { value: this.value } }));
    });
  }

  connectedCallback() {
    this.#sync();
  }

  formDisabledCallback(disabled) {
    this.#formDisabled = disabled;
    this.#sync();
  }

  get form() {
    return this.#internals.form;
  }

  attributeChangedCallback(name) {
    if (name === 'value') this.#input.value = this.getAttribute('value') ?? '';
    this.#sync();
  }

  formResetCallback() {
    this.#input.value = this.getAttribute('value') ?? '#000000';
    this.#syncForm();
  }

  get value() {
    return this.#input.value;
  }

  set value(val) {
    this.#input.value = val == null ? '' : String(val);
    this.#syncForm();
  }

  get validity() {
    return this.#input.validity;
  }

  #syncForm() {
    this.#internals.setFormValue(this.#input.value);
    if (this.#input.willValidate && !this.#input.validity.valid) {
      this.#internals.setValidity(this.#input.validity, this.#input.validationMessage, this.#input);
    } else {
      this.#internals.setValidity({});
    }
  }

  #sync() {
    for (const name of ['aria-label']) {
      if (this.hasAttribute(name)) this.#input.setAttribute(name, this.getAttribute(name));
      else this.#input.removeAttribute(name);
    }
    this.#input.disabled = this.hasAttribute('disabled') || this.#formDisabled;
    this.#syncForm();
  }
}

if (!customElements.get('ui-color-input')) {
  customElements.define('ui-color-input', UiColorInput);
}
