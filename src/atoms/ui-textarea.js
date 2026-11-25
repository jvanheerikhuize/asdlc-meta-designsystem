const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    textarea {
      box-sizing: border-box;
      width: 100%;
      resize: vertical;
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      line-height: var(--leading-normal);
      color: var(--color-fg);
      background: var(--color-surface);
      border: var(--border-width) solid var(--color-border-field);
      scrollbar-color: var(--color-border-hover) transparent;
      border-radius: var(--radius-md);
      padding: var(--space-2) var(--space-3);
      transition: border-color var(--duration-fast) var(--ease-standard);
    }

    textarea::placeholder {
      color: var(--color-fg-muted);
    }

    textarea:hover:not(:disabled) {
      border-color: var(--color-border-hover);
    }

    textarea:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
      border-color: var(--color-focus-ring);
    }

    :host([invalid]) textarea {
      border-color: var(--color-danger);
    }

    :host([disabled]) textarea {
      opacity: var(--opacity-disabled);
      cursor: var(--cursor-disabled);
    }

    @media (prefers-reduced-motion: reduce) {
      textarea { transition: none; }
    }
  </style>
  <textarea part="textarea" rows="3"></textarea>
`;

/**
 * Multi-line text input Atom encapsulating native <textarea>.
 */
export class UiTextarea extends HTMLElement {
  static observedAttributes = [
    'value', 'placeholder', 'rows', 'disabled', 'readonly', 'required', 'invalid', 'name', 'aria-label',
  ];

  #textarea;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#textarea = shadow.querySelector('textarea');

    this.#textarea.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('ui-input', {
        bubbles: true,
        composed: true,
        detail: { value: this.#textarea.value },
      }));
    });

    this.#textarea.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('ui-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.#textarea.value },
      }));
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    if (name === 'value' && this.#textarea && this.#textarea.value !== (newVal ?? '')) {
      this.#textarea.value = newVal ?? '';
      return;
    }
    this.#sync();
  }

  get value() {
    return this.#textarea ? this.#textarea.value : (this.getAttribute('value') ?? '');
  }

  set value(val) {
    const next = val == null ? '' : String(val);
    if (this.#textarea) this.#textarea.value = next;
    this.setAttribute('value', next);
  }

  #sync() {
    if (!this.#textarea) return;
    this.#textarea.placeholder = this.getAttribute('placeholder') || '';
    this.#textarea.name = this.getAttribute('name') || '';
    this.#textarea.rows = Number.parseInt(this.getAttribute('rows') || '3', 10) || 3;
    this.#textarea.disabled = this.hasAttribute('disabled');
    this.#textarea.readOnly = this.hasAttribute('readonly');
    this.#textarea.required = this.hasAttribute('required');
    this.#textarea.setAttribute('aria-invalid', String(this.hasAttribute('invalid')));
    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) this.#textarea.setAttribute('aria-label', ariaLabel);
    else this.#textarea.removeAttribute('aria-label');
    if (this.hasAttribute('value') && this.#textarea.value !== this.getAttribute('value')) {
      this.#textarea.value = this.getAttribute('value') ?? '';
    }
  }
}

if (!customElements.get('ui-textarea')) {
  customElements.define('ui-textarea', UiTextarea);
}
