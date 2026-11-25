import '../atoms/ui-label.js';
import '../atoms/ui-input.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--space-2, 0.5rem);
    }

    :host([hidden]) {
      display: none;
    }

    .hint {
      margin: 0;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-xs, 0.75rem);
      line-height: var(--leading-normal, 1.5);
      color: var(--color-fg-muted, #8e8e98);
    }

    :host([invalid]) .hint {
      color: var(--color-danger, #f87171);
    }

    .hint[hidden] {
      display: none;
    }
  </style>
  <ui-label part="label"></ui-label>
  <ui-input part="input"></ui-input>
  <p class="hint" part="hint" id="field-hint" hidden></p>
`;

/**
 * Form field Molecule composing <ui-label>, <ui-input>, and hint/error messaging.
 */
export class UiField extends HTMLElement {
  static observedAttributes = [
    'label', 'name', 'value', 'placeholder', 'type', 'required', 'invalid', 'disabled', 'hint', 'error',
  ];

  #label;
  #input;
  #hint;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    // importNode upgrades the inner Atoms now. With cloneNode they stay inert until connected, and a
    // value set before that becomes an own property that hides the Atom's accessor for good.
    shadow.appendChild(document.importNode(TEMPLATE.content, true));
    this.#label = shadow.querySelector('ui-label');
    this.#input = shadow.querySelector('ui-input');
    this.#hint = shadow.querySelector('.hint');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get value() {
    return this.#input ? this.#input.value : (this.getAttribute('value') ?? '');
  }

  set value(val) {
    const next = val == null ? '' : String(val);
    if (this.#input) this.#input.value = next;
    this.setAttribute('value', next);
  }

  #sync() {
    if (!this.#label || !this.#input || !this.#hint) return;
    const labelText = this.getAttribute('label') || '';
    this.#label.textContent = labelText;
    this.#label.toggleAttribute('required', this.hasAttribute('required'));
    this.#label.hidden = !labelText;

    this.#input.setAttribute('type', this.getAttribute('type') || 'text');
    this.#input.setAttribute('placeholder', this.getAttribute('placeholder') || '');
    this.#input.setAttribute('name', this.getAttribute('name') || '');
    if (labelText) this.#input.setAttribute('aria-label', labelText);
    this.#input.toggleAttribute('required', this.hasAttribute('required'));
    this.#input.toggleAttribute('invalid', this.hasAttribute('invalid'));
    this.#input.toggleAttribute('disabled', this.hasAttribute('disabled'));
    if (this.hasAttribute('value') && this.#input.value !== this.getAttribute('value')) {
      this.#input.value = this.getAttribute('value') ?? '';
    }

    const message = this.hasAttribute('invalid')
      ? (this.getAttribute('error') || this.getAttribute('hint') || '')
      : (this.getAttribute('hint') || '');
    this.#hint.textContent = message;
    this.#hint.hidden = !message;
  }
}

if (!customElements.get('ui-field')) {
  customElements.define('ui-field', UiField);
}
