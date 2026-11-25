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
      width: 100%;
      font: var(--type-small);
      color: var(--color-fg-secondary);
      border-radius: var(--radius-control);
    }

    input::file-selector-button {
      height: var(--control-md);
      margin-inline-end: var(--space-3);
      padding: var(--pad-control-md);
      font: var(--type-button);
      color: var(--color-fg);
      background: var(--color-card);
      border: var(--line-default);
      border-radius: var(--radius-control);
      cursor: var(--cursor-interactive);
    }

    input:hover:not(:disabled)::file-selector-button {
      background: var(--color-card-hover);
      border-color: var(--color-border-hover);
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
  <input part="input" type="file" />
`;

/**
 * File picker Atom.
 */
export class UiFileInput extends HTMLElement {
  static observedAttributes = ['accept', 'multiple', 'disabled', 'required', 'name', 'aria-label'];
  static formAssociated = true;

  #input;
  #internals = this.attachInternals();
  #formDisabled = false;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#input = shadow.querySelector('input');
    this.#input.addEventListener('change', () => {
      this.#syncForm();
      this.dispatchEvent(new CustomEvent('ui-change', { bubbles: true, composed: true, detail: { files: [...this.#input.files] } }));
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

  get form() {
    return this.#internals.form;
  }

  formResetCallback() {
    this.#input.value = '';
    this.#syncForm();
  }

  get files() {
    return this.#input.files;
  }

  #syncForm() {
    const name = this.getAttribute('name');
    const data = new FormData();
    if (name) for (const file of this.#input.files) data.append(name, file);
    this.#internals.setFormValue(data);
    if (this.#input.willValidate && !this.#input.validity.valid) {
      this.#internals.setValidity(this.#input.validity, this.#input.validationMessage, this.#input);
    } else {
      this.#internals.setValidity({});
    }
  }

  #sync() {
    for (const name of ['accept', 'aria-label']) {
      if (this.hasAttribute(name)) this.#input.setAttribute(name, this.getAttribute(name));
      else this.#input.removeAttribute(name);
    }
    this.#input.multiple = this.hasAttribute('multiple');
    this.#input.required = this.hasAttribute('required');
    this.#input.disabled = this.hasAttribute('disabled') || this.#formDisabled;
    this.#syncForm();
  }
}

if (!customElements.get('ui-file-input')) {
  customElements.define('ui-file-input', UiFileInput);
}
