const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    select {
      appearance: none;
      -webkit-appearance: none;
      box-sizing: border-box;
      width: 100%;
      height: 2.25rem;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
      font-weight: 500;
      line-height: 1.25;
      color: var(--color-fg, #ededed);
      background: var(--color-surface, #111116);
      border: 1px solid color-mix(in srgb, var(--color-border-hover, rgba(255, 255, 255, 0.22)) 75%, transparent);
      border-radius: var(--radius-md, 0.5rem);
      padding: 0 2.25rem 0 var(--space-3, 0.75rem);
      cursor: pointer;
      transition:
        border-color var(--duration-fast, 120ms) var(--ease-standard, ease),
        background-color var(--duration-fast, 120ms) var(--ease-standard, ease),
        box-shadow var(--duration-fast, 120ms) var(--ease-standard, ease);
    }

    select:hover:not(:disabled) {
      border-color: var(--color-border-hover, rgba(255, 255, 255, 0.22));
      background: var(--color-surface-elevated, #18181f);
    }

    select:focus-visible {
      outline: 2px solid var(--color-focus-ring, #f43f5e);
      outline-offset: 2px;
      border-color: var(--color-focus-ring, #f43f5e);
    }

    option {
      background: var(--color-surface-elevated, #18181f);
      color: var(--color-fg, #ededed);
    }

    @supports (appearance: base-select) {
      select,
      select::picker(select) {
        appearance: base-select;
      }

      select {
        display: flex;
        align-items: center;
      }

      select::picker-icon {
        display: none;
      }

      select::picker(select) {
        margin-block-start: 4px;
        padding: var(--space-1, 0.25rem);
        border: 1px solid var(--color-border-hover, rgba(255, 255, 255, 0.22));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--color-surface-elevated, #18181f);
        color: var(--color-fg, #ededed);
        box-shadow: var(--shadow-lg, 0 12px 32px rgba(0, 0, 0, 0.6));
        font-family: var(--font-sans, system-ui, sans-serif);
        font-size: var(--text-sm, 0.875rem);
      }

      option {
        padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
        border-radius: var(--radius-sm, 0.375rem);
        cursor: pointer;
      }

      option:hover,
      option:focus {
        background: var(--color-card-hover, rgba(255, 255, 255, 0.07));
      }

      option:checked {
        font-weight: 600;
      }

      option::checkmark {
        color: var(--color-accent, #f43f5e);
      }
    }

    .chevron {
      position: absolute;
      inset-inline-end: 0.75rem;
      width: 1rem;
      height: 1rem;
      pointer-events: none;
      color: var(--color-fg-secondary, #a1a1aa);
      transition: color var(--duration-fast, 120ms) var(--ease-standard, ease);
    }

    .wrap:hover select:not(:disabled) + .chevron {
      color: var(--color-fg, #ededed);
    }

    :host([invalid]) select {
      border-color: var(--color-danger, #f87171);
    }

    :host([disabled]) select,
    :host([disabled]) .chevron {
      opacity: 0.55;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      select,
      .chevron {
        transition: none;
      }
    }
  </style>
  <div class="wrap" part="wrapper">
    <select part="select"></select>
    <svg class="chevron" part="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  </div>
`;

/**
 * Branded select Atom driven by JSON `options` attribute/property (`[{ value, label }]`),
 * progressively enhanced with `appearance: base-select` + custom SVG chevron.
 */
export class UiSelect extends HTMLElement {
  static observedAttributes = ['options', 'value', 'disabled', 'invalid', 'name', 'aria-label'];

  #select;
  #options = [];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#select = shadow.querySelector('select');

    this.#select.addEventListener('change', () => {
      this.setAttribute('value', this.#select.value);
      this.dispatchEvent(new CustomEvent('ui-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.#select.value },
      }));
    });
  }

  connectedCallback() {
    this.#renderOptions();
    this.#sync();
  }

  attributeChangedCallback(name) {
    if (name === 'options') this.#renderOptions();
    this.#sync();
  }

  get options() {
    return this.#options;
  }

  set options(list) {
    this.#options = Array.isArray(list) ? list : [];
    this.#renderOptions();
    this.#sync();
  }

  get value() {
    return this.#select ? this.#select.value : (this.getAttribute('value') ?? '');
  }

  set value(val) {
    const next = val == null ? '' : String(val);
    if (this.#select) this.#select.value = next;
    this.setAttribute('value', next);
  }

  #renderOptions() {
    if (!this.#select) return;
    const attr = this.getAttribute('options');
    if (attr) {
      try {
        const parsed = JSON.parse(attr);
        if (Array.isArray(parsed)) this.#options = parsed;
      } catch {
        /* ignore invalid JSON */
      }
    }
    this.#select.innerHTML = '';
    for (const item of this.#options) {
      const opt = document.createElement('option');
      if (typeof item === 'string') {
        opt.value = item;
        opt.textContent = item;
      } else {
        opt.value = item.value ?? '';
        opt.textContent = item.label ?? opt.value;
      }
      this.#select.appendChild(opt);
    }
  }

  #sync() {
    if (!this.#select) return;
    this.#select.disabled = this.hasAttribute('disabled');
    this.#select.name = this.getAttribute('name') || '';
    this.#select.setAttribute('aria-invalid', String(this.hasAttribute('invalid')));
    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) this.#select.setAttribute('aria-label', ariaLabel);
    else this.#select.removeAttribute('aria-label');
    if (this.hasAttribute('value')) {
      this.#select.value = this.getAttribute('value') ?? '';
    }
  }
}

if (!customElements.get('ui-select')) {
  customElements.define('ui-select', UiSelect);
}
