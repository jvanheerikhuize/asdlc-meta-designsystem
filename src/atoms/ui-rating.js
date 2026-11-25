const STAR = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    .wrap {
      position: relative;
      display: inline-flex;
      gap: var(--space-0-5);
      border-radius: var(--radius-sm);
    }

    .wrap:focus-within:has(input:focus-visible) {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    svg {
      width: var(--icon-lg);
      height: var(--icon-lg);
      fill: var(--color-border-strong);
      transition: var(--transition-colors);
    }

    svg.on {
      fill: var(--color-warning);
    }

    input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
      cursor: var(--cursor-interactive);
    }

    :host([readonly]) input {
      display: none;
    }

    input:disabled {
      cursor: var(--cursor-disabled);
    }

    .wrap:has(input:disabled) {
      opacity: var(--opacity-disabled);
    }
  </style>
  <div class="wrap" part="rating">
    <span class="stars" aria-hidden="true"></span>
    <input type="range" min="0" step="1" />
  </div>
`;

/**
 * Star rating Atom.
 */
export class UiRating extends HTMLElement {
  static observedAttributes = ['value', 'max', 'readonly', 'disabled', 'name', 'aria-label'];
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
      this.setAttribute('value', this.#input.value);
      this.dispatchEvent(new CustomEvent('ui-input', { bubbles: true, composed: true, detail: { value: this.value } }));
    });
    this.#input.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('ui-change', { bubbles: true, composed: true, detail: { value: this.value } }));
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
    this.#initial ??= this.getAttribute('value');
    this.#sync();
  }

  formResetCallback() {
    if (this.#initial === null) this.removeAttribute('value');
    else this.setAttribute('value', this.#initial);
  }

  get value() {
    return this.#input.value;
  }

  set value(val) {
    this.setAttribute('value', String(val ?? 0));
  }

  #initial = null;

  #sync() {
    const max = Math.min(10, Math.max(1, parseInt(this.getAttribute('max'), 10) || 5));
    const value = Math.min(max, Math.max(0, Math.round(Number(this.getAttribute('value')) || 0)));
    const label = this.getAttribute('aria-label') || 'Rating';
    const text = `${value} of ${max}`;
    this.#input.max = String(max);
    this.#input.value = String(value);
    this.#input.disabled = this.hasAttribute('disabled') || this.#formDisabled;
    this.#input.setAttribute('aria-label', label);
    this.#input.setAttribute('aria-valuetext', text);
    this.shadowRoot.querySelector('.stars').innerHTML = Array.from({ length: max }, (_, i) => (
      `<svg viewBox="0 0 24 24" class="${i < value ? 'on' : ''}"><path d="${STAR}"/></svg>`)).join('');
    const wrap = this.shadowRoot.querySelector('.wrap');
    if (this.hasAttribute('readonly')) {
      wrap.setAttribute('role', 'img');
      wrap.setAttribute('aria-label', `${label}: ${text}`);
    } else {
      wrap.removeAttribute('role');
      wrap.removeAttribute('aria-label');
    }
    this.#internals.setFormValue(String(value));
  }
}

if (!customElements.get('ui-rating')) {
  customElements.define('ui-rating', UiRating);
}
