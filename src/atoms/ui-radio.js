const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-flex;
    }

    :host([hidden]) {
      display: none;
    }

    label {
      display: inline-flex;
      align-items: center;
      gap: var(--cluster-sm);
      font: var(--type-small);
      color: var(--color-fg);
      cursor: var(--cursor-interactive);
      user-select: none;
    }

    input {
      appearance: none;
      margin: 0;
      flex-shrink: 0;
      display: grid;
      place-content: center;
      width: var(--size-checkbox);
      height: var(--size-checkbox);
      border: var(--border-width) solid var(--color-border-control);
      border-radius: var(--radius-full);
      background: var(--color-surface);
      cursor: inherit;
      transition: var(--transition-colors);
    }

    input::after {
      content: '';
      width: var(--size-checkmark);
      height: var(--size-checkmark);
      border-radius: var(--radius-full);
      background: var(--color-accent);
      transform: scale(0);
      transition: var(--transition-transform);
    }

    input:checked {
      border-color: var(--color-accent);
    }

    input:checked::after {
      transform: scale(1);
    }

    input:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    label:has(input:disabled) {
      opacity: var(--opacity-disabled);
      cursor: var(--cursor-disabled);
    }
  </style>
  <label part="label">
    <input part="radio" type="radio" />
    <slot></slot>
  </label>
`;

/**
 * Radio button Atom. Radios with the same name in one form or view form a group.
 */
export class UiRadio extends HTMLElement {
  static observedAttributes = ['checked', 'disabled', 'name', 'value', 'aria-label'];
  static formAssociated = true;

  #input;
  #initial = null;
  #root = null;
  #internals = this.attachInternals();
  #formDisabled = false;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#input = shadow.querySelector('input');
    this.#input.addEventListener('change', () => this.#choose());
    this.#input.addEventListener('keydown', (event) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      const group = this.#group().filter((el) => !el.#input.disabled);
      const next = group[(group.indexOf(this) + step + group.length) % group.length];
      next.focus();
      if (next !== this) next.#choose();
    });
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

  connectedCallback() {
    this.#initial ??= this.hasAttribute('checked');
    this.#root = this.getRootNode();
    this.#sync();
  }

  disconnectedCallback() {
    for (const el of this.#group(this.#root)) el.#syncTabStop();
  }

  formResetCallback() {
    this.toggleAttribute('checked', this.#initial);
  }

  get checked() {
    return this.hasAttribute('checked');
  }

  set checked(val) {
    this.toggleAttribute('checked', Boolean(val));
  }

  get value() {
    return this.getAttribute('value') ?? 'on';
  }

  set value(val) {
    this.setAttribute('value', String(val));
  }

  #group(root = this.getRootNode()) {
    const name = this.getAttribute('name');
    if (!name) return this.isConnected ? [this] : [];
    return [...root.querySelectorAll('ui-radio')].filter((el) => el.getAttribute('name') === name && el.form === this.form);
  }

  #choose() {
    this.checked = true;
    this.dispatchEvent(new CustomEvent('ui-change', { bubbles: true, composed: true, detail: { checked: true, value: this.value } }));
  }

  // The group is one keyboard stop: the checked radio, or else the first enabled one.
  #syncTabStop() {
    const group = this.#group();
    const enabled = group.filter((el) => !el.#input.disabled);
    const stop = enabled.find((el) => el.checked) ?? enabled[0];
    for (const el of group) el.#input.tabIndex = el === stop ? 0 : -1;
  }

  #sync() {
    for (const name of ['aria-label']) {
      if (this.hasAttribute(name)) this.#input.setAttribute(name, this.getAttribute(name));
      else this.#input.removeAttribute(name);
    }
    this.#input.checked = this.checked;
    this.#input.disabled = this.hasAttribute('disabled') || this.#formDisabled;
    this.#internals.setFormValue(this.checked ? this.value : null);
    if (!this.isConnected) return;
    if (this.checked) for (const el of this.#group()) if (el !== this && el.checked) el.checked = false;
    this.#syncTabStop();
  }
}

if (!customElements.get('ui-radio')) {
  customElements.define('ui-radio', UiRadio);
}
