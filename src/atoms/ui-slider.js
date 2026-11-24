const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      --slider-pct: 0%;
      --slider-color: var(--color-accent, #f43f5e);
    }

    :host([hidden]) {
      display: none;
    }

    :host([variant="success"]) {
      --slider-color: var(--color-success, #10b981);
    }

    :host([variant="warning"]) {
      --slider-color: var(--color-warning, #f59e0b);
    }

    :host([variant="neutral"]) {
      --slider-color: var(--color-fg, #ededed);
    }

    .wrap {
      display: flex;
      align-items: center;
      width: 100%;
      min-height: 1.5rem;
    }

    input[type="range"] {
      appearance: none;
      -webkit-appearance: none;
      width: 100%;
      height: 0.375rem;
      margin: 0;
      border-radius: var(--radius-full, 9999px);
      background: linear-gradient(
        to right,
        var(--slider-color) 0%,
        var(--slider-color) var(--slider-pct),
        var(--color-border-hover, rgba(255, 255, 255, 0.22)) var(--slider-pct),
        var(--color-border-hover, rgba(255, 255, 255, 0.22)) 100%
      );
      outline: none;
      cursor: pointer;
    }

    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 0.95rem;
      height: 0.95rem;
      border-radius: var(--radius-full, 9999px);
      background: #ffffff;
      border: 2.5px solid var(--slider-color);
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.45));
      cursor: pointer;
      transition: transform var(--duration-fast, 120ms) var(--ease-standard, ease);
    }

    input[type="range"]::-moz-range-thumb {
      width: 0.95rem;
      height: 0.95rem;
      border-radius: var(--radius-full, 9999px);
      background: #ffffff;
      border: 2.5px solid var(--slider-color);
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.45));
      cursor: pointer;
      transition: transform var(--duration-fast, 120ms) var(--ease-standard, ease);
    }

    input[type="range"]:hover:not(:disabled)::-webkit-slider-thumb {
      transform: scale(1.15);
    }

    input[type="range"]:hover:not(:disabled)::-moz-range-thumb {
      transform: scale(1.15);
    }

    input[type="range"]:focus-visible {
      outline: 2px solid var(--color-focus-ring, #f43f5e);
      outline-offset: 4px;
    }

    :host([disabled]) input[type="range"] {
      opacity: 0.55;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      input[type="range"]::-webkit-slider-thumb,
      input[type="range"]::-moz-range-thumb {
        transition: none;
      }
    }
  </style>
  <div class="wrap" part="track">
    <input part="slider" type="range" min="0" max="100" step="1" value="0" />
  </div>
`;

/**
 * Range slider Atom encapsulating native <input type="range"> for timeline scrubbing, volume, and numeric controls.
 */
export class UiSlider extends HTMLElement {
  static observedAttributes = [
    'min',
    'max',
    'step',
    'value',
    'disabled',
    'variant',
    'name',
    'aria-label',
    'aria-valuetext',
  ];

  #input;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#input = shadow.querySelector('input');

    this.#input.addEventListener('input', () => {
      this.setAttribute('value', this.#input.value);
      this.#updateFill();
      this.dispatchEvent(new CustomEvent('ui-input', {
        bubbles: true,
        composed: true,
        detail: { value: Number(this.#input.value) },
      }));
    });

    this.#input.addEventListener('change', () => {
      this.setAttribute('value', this.#input.value);
      this.#updateFill();
      this.dispatchEvent(new CustomEvent('ui-change', {
        bubbles: true,
        composed: true,
        detail: { value: Number(this.#input.value) },
      }));
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get value() {
    return Number(this.#input ? this.#input.value : this.getAttribute('value') || 0);
  }

  set value(val) {
    this.setAttribute('value', String(val ?? 0));
  }

  get min() {
    return Number(this.getAttribute('min') ?? 0);
  }

  set min(val) {
    this.setAttribute('min', String(val ?? 0));
  }

  get max() {
    return Number(this.getAttribute('max') ?? 100);
  }

  set max(val) {
    this.setAttribute('max', String(val ?? 100));
  }

  get step() {
    return Number(this.getAttribute('step') ?? 1);
  }

  set step(val) {
    this.setAttribute('step', String(val ?? 1));
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  #updateFill() {
    if (!this.#input) return;
    const min = Number.parseFloat(this.#input.min) || 0;
    const max = Number.parseFloat(this.#input.max);
    const hi = Number.isFinite(max) && max > min ? max : min + 100;
    const val = Math.min(hi, Math.max(min, Number.parseFloat(this.#input.value) || 0));
    const pct = ((val - min) / (hi - min)) * 100;
    this.style.setProperty('--slider-pct', `${pct.toFixed(2)}%`);
  }

  #sync() {
    if (!this.#input) return;
    this.#input.min = this.getAttribute('min') ?? '0';
    this.#input.max = this.getAttribute('max') ?? '100';
    this.#input.step = this.getAttribute('step') ?? '1';
    this.#input.value = this.getAttribute('value') ?? '0';
    this.#input.disabled = this.disabled;
    this.#input.name = this.getAttribute('name') || '';

    for (const attr of ['aria-label', 'aria-valuetext']) {
      const v = this.getAttribute(attr);
      if (v) this.#input.setAttribute(attr, v);
      else this.#input.removeAttribute(attr);
    }

    this.#updateFill();
  }
}

if (!customElements.get('ui-slider')) {
  customElements.define('ui-slider', UiSlider);
}
