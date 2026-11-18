const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    select {
      box-sizing: border-box;
      width: 100%;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
      line-height: var(--leading-normal, 1.5);
      color: var(--color-fg, #ededed);
      background: var(--color-surface, #111116);
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      border-radius: var(--radius-md, 0.5rem);
      padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
      min-height: 2.25rem;
      cursor: pointer;
    }

    select:hover:not(:disabled) {
      border-color: var(--color-border-hover, rgba(255, 255, 255, 0.22));
    }

    select:focus-visible {
      outline: 2px solid var(--color-focus-ring, #f43f5e);
      outline-offset: 2px;
      border-color: var(--color-focus-ring, #f43f5e);
    }

    :host([invalid]) select {
      border-color: var(--color-danger, #f87171);
    }

    :host([disabled]) select {
      opacity: 0.55;
      cursor: not-allowed;
    }
  </style>
  <select part="select"></select>
`;

/**
 * Native select Atom driven by JSON `options` attribute/property (`[{ value, label }]`).
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
