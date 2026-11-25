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
      height: var(--control-md);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      line-height: var(--leading-control);
      color: var(--color-fg);
      background: var(--color-surface);
      border: var(--border-width) solid color-mix(in srgb, var(--color-border-hover) 75%, transparent);
      border-radius: var(--radius-md);
      padding: 0 var(--control-md) 0 var(--space-3);
      cursor: pointer;
      transition:
        border-color var(--duration-fast) var(--ease-standard),
        background-color var(--duration-fast) var(--ease-standard),
        box-shadow var(--duration-fast) var(--ease-standard);
    }

    select:hover:not(:disabled) {
      border-color: var(--color-border-hover);
      background: var(--color-surface-elevated);
    }

    select:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
      border-color: var(--color-focus-ring);
    }

    option {
      background: var(--color-surface-elevated);
      color: var(--color-fg);
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
        margin-block-start: var(--space-1);
        padding: var(--space-1);
        border: var(--border-width) solid var(--color-border-hover);
        border-radius: var(--radius-md);
        background: var(--color-surface-elevated);
        color: var(--color-fg);
        box-shadow: var(--shadow-lg);
        font-family: var(--font-sans);
        font-size: var(--text-sm);
      }

      option {
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-sm);
        cursor: pointer;
      }

      option:hover,
      option:focus {
        background: var(--color-card-hover);
      }

      option:checked {
        font-weight: var(--weight-semibold);
      }

      option::checkmark {
        color: var(--color-accent);
      }
    }

    .chevron {
      position: absolute;
      inset-inline-end: var(--space-3);
      width: var(--icon-md);
      height: var(--icon-md);
      pointer-events: none;
      color: var(--color-fg-secondary);
      transition: color var(--duration-fast) var(--ease-standard);
    }

    .wrap:hover select:not(:disabled) + .chevron {
      color: var(--color-fg);
    }

    :host([invalid]) select {
      border-color: var(--color-danger);
    }

    :host([disabled]) select,
    :host([disabled]) .chevron {
      opacity: var(--opacity-disabled);
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
