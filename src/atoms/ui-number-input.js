const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    input {
      box-sizing: border-box;
      width: 100%;
      height: var(--control-md);
      padding: 0 var(--space-3);
      font: var(--type-small);
      color: var(--color-fg);
      background: var(--color-surface);
      border: var(--border-width) solid var(--color-border-field);
      border-radius: var(--radius-control);
      transition: var(--transition-colors);
    }

    input:hover:not(:disabled) {
      border-color: var(--color-border-hover);
    }

    input:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
      border-color: var(--color-focus-ring);
    }

    :host([invalid]) input {
      border-color: var(--color-danger);
    }

    input:disabled {
      opacity: var(--opacity-disabled);
      cursor: var(--cursor-disabled);
    }

    input {
      font-variant-numeric: var(--numeric-tabular);
    }
  </style>
  <input part="input" type="number" inputmode="decimal" />
`;

/**
 * Number input Atom with minimum, maximum and step.
 */
export class UiNumberInput extends HTMLElement {
  static observedAttributes = ['value', 'min', 'max', 'step', 'placeholder', 'disabled', 'readonly', 'required', 'invalid', 'name', 'aria-label'];
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
    this.#input.value = this.getAttribute('value') ?? '';
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

  get valueAsNumber() {
    return this.#input.valueAsNumber;
  }

  #sync() {
    for (const name of ['min', 'max', 'step', 'placeholder', 'aria-label']) {
      if (this.hasAttribute(name)) this.#input.setAttribute(name, this.getAttribute(name));
      else this.#input.removeAttribute(name);
    }
    this.#input.disabled = this.hasAttribute('disabled') || this.#formDisabled;
    this.#input.readOnly = this.hasAttribute('readonly');
    this.#input.required = this.hasAttribute('required');
    this.#input.setAttribute('aria-invalid', String(this.hasAttribute('invalid')));
    this.#syncForm();
  }
}

if (!customElements.get('ui-number-input')) {
  customElements.define('ui-number-input', UiNumberInput);
}
