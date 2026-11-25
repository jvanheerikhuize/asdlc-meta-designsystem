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
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
      line-height: var(--leading-normal, 1.5);
      color: var(--color-fg, #ededed);
      background: var(--color-surface, #111116);
      border: 1px solid color-mix(in srgb, var(--color-border-hover, rgba(255, 255, 255, 0.22)) 75%, transparent);
      border-radius: var(--radius-md, 0.5rem);
      padding: 0 var(--ui-input-padding-end, var(--space-3, 0.75rem)) 0 var(--ui-input-padding-start, var(--space-3, 0.75rem));
      height: 2.25rem;
      transition:
        border-color var(--duration-fast, 120ms) var(--ease-standard, ease),
        box-shadow var(--duration-fast, 120ms) var(--ease-standard, ease);
    }

    input::placeholder {
      color: var(--color-fg-muted, #8e8e98);
    }

    input:hover:not(:disabled) {
      border-color: var(--color-border-hover, rgba(255, 255, 255, 0.22));
    }

    input:focus-visible {
      outline: 2px solid var(--color-focus-ring, #f43f5e);
      outline-offset: 2px;
      border-color: var(--color-focus-ring, #f43f5e);
    }

    :host([invalid]) input {
      border-color: var(--color-danger, #f87171);
    }

    :host([disabled]) input {
      opacity: 0.55;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      input {
        transition: none;
      }
    }
  </style>
  <input part="input" />
`;

/**
 * Submits a form the way Enter in a native text input does: through its first submit control,
 * and not at all while that control is inactive.
 */
export function submitImplicitly(form) {
  if (!form) return;
  const submitter = [...form.elements].find((el) => (el.localName === 'ui-button'
    ? el.getAttribute('type') === 'submit'
    : el.type === 'submit' && el.matches('button, input')));
  if (submitter && (submitter.matches(':disabled') || submitter.hasAttribute('disabled') || submitter.hasAttribute('busy'))) return;
  if (submitter && submitter.localName !== 'ui-button') form.requestSubmit(submitter);
  else form.requestSubmit();
}

/**
 * Text input Atom encapsulating native <input> with reactive value,
 * invalid/disabled/readonly states, and ui-input / ui-change events.
 */
export class UiInput extends HTMLElement {
  static observedAttributes = [
    'type', 'value', 'placeholder', 'disabled', 'readonly', 'required', 'invalid', 'name', 'maxlength', 'aria-label',
  ];
  static formAssociated = true;

  #input;
  #internals;
  #formDisabled = false;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#input = shadow.querySelector('input');
    this.#internals = this.attachInternals();

    this.#input.addEventListener('input', () => {
      this.#syncForm();
      this.dispatchEvent(new CustomEvent('ui-input', {
        bubbles: true,
        composed: true,
        detail: { value: this.#input.value },
      }));
    });

    this.#input.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('ui-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.#input.value },
      }));
    });

    // keypress, not keydown: it does not fire when the page already handled (prevented) the keydown.
    this.#input.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' && !event.isComposing) submitImplicitly(this.#internals.form);
    });
  }

  formDisabledCallback(disabled) {
    this.#formDisabled = disabled;
    this.#sync();
  }

  formResetCallback() {
    this.#input.value = this.getAttribute('value') ?? '';
    this.#syncForm();
  }

  /** The form that owns this input, if any. */
  get form() {
    return this.#internals.form;
  }

  get validity() {
    return this.#input.validity;
  }

  get willValidate() {
    return this.#input.willValidate;
  }

  get validationMessage() {
    return this.#input.validationMessage;
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    if (name === 'value' && this.#input && this.#input.value !== (newVal ?? '')) {
      this.#input.value = newVal ?? '';
      this.#syncForm();
      return;
    }
    this.#sync();
  }

  get value() {
    return this.#input ? this.#input.value : (this.getAttribute('value') ?? '');
  }

  set value(val) {
    const next = val == null ? '' : String(val);
    if (this.#input) {
      this.#input.value = next;
      this.#syncForm();
    }
    this.setAttribute('value', next);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  get invalid() {
    return this.hasAttribute('invalid');
  }

  set invalid(val) {
    this.toggleAttribute('invalid', Boolean(val));
  }

  #sync() {
    if (!this.#input) return;
    this.#input.type = this.getAttribute('type') || 'text';
    this.#input.placeholder = this.getAttribute('placeholder') || '';
    this.#input.name = this.getAttribute('name') || '';
    this.#input.disabled = this.disabled || this.#formDisabled;
    this.#input.readOnly = this.hasAttribute('readonly');
    this.#input.required = this.hasAttribute('required');
    this.#input.setAttribute('aria-invalid', String(this.invalid));
    if (this.hasAttribute('value') && this.#input.value !== this.getAttribute('value')) {
      this.#input.value = this.getAttribute('value') ?? '';
    }
    const maxLength = this.getAttribute('maxlength');
    if (maxLength === null) {
      this.#input.removeAttribute('maxlength');
    } else {
      this.#input.setAttribute('maxlength', maxLength);
    }
    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) {
      this.#input.setAttribute('aria-label', ariaLabel);
    } else {
      this.#input.removeAttribute('aria-label');
    }
    this.#syncForm();
  }

  #syncForm() {
    this.#internals.setFormValue(this.#input.value);
    if (this.#input.willValidate && !this.#input.validity.valid) {
      this.#internals.setValidity(this.#input.validity, this.#input.validationMessage, this.#input);
    } else {
      this.#internals.setValidity({});
    }
  }
}

if (!customElements.get('ui-input')) {
  customElements.define('ui-input', UiInput);
}
