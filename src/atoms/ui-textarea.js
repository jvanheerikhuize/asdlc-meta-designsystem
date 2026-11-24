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
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
      line-height: var(--leading-normal, 1.5);
      color: var(--color-fg, #ededed);
      background: var(--color-surface, #111116);
      border: 1px solid color-mix(in srgb, var(--color-border-hover, rgba(255, 255, 255, 0.22)) 75%, transparent);
      scrollbar-color: var(--color-border-hover, rgba(255, 255, 255, 0.22)) transparent;
      border-radius: var(--radius-md, 0.5rem);
      padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
      transition: border-color var(--duration-fast, 120ms) var(--ease-standard, ease);
    }

    textarea::placeholder {
      color: var(--color-fg-muted, #8e8e98);
    }

    textarea:hover:not(:disabled) {
      border-color: var(--color-border-hover, rgba(255, 255, 255, 0.22));
    }

    textarea:focus-visible {
      outline: 2px solid var(--color-focus-ring, #f43f5e);
      outline-offset: 2px;
      border-color: var(--color-focus-ring, #f43f5e);
    }

    :host([invalid]) textarea {
      border-color: var(--color-danger, #f87171);
    }

    :host([disabled]) textarea {
      opacity: 0.55;
      cursor: not-allowed;
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
