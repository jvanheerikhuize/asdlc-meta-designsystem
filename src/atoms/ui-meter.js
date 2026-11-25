const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .track {
      height: var(--size-track-lg);
      border-radius: var(--radius-full);
      background: var(--color-card-hover);
      overflow: hidden;
    }

    .fill {
      height: 100%;
      width: var(--_pct, 0%);
      border-radius: inherit;
      background: var(--color-accent);
      transition: width var(--duration-normal) var(--ease-standard);
    }

    .fill[data-level="low"] {
      background: var(--color-danger);
    }

    .fill[data-level="mid"] {
      background: var(--color-warning);
    }

    .fill[data-level="high"] {
      background: var(--color-success);
    }
  </style>
  <div class="track" part="track" role="meter"><div class="fill" part="fill"></div></div>
`;

/**
 * Meter Atom for a measurement within a known range.
 */
export class UiMeter extends HTMLElement {
  static observedAttributes = ['value', 'min', 'max', 'low', 'high', 'variant', 'aria-label'];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const number = (name, fallback) => {
      const value = parseFloat(this.getAttribute(name));
      return Number.isFinite(value) ? value : fallback;
    };
    const min = number('min', 0);
    const max = Math.max(min + Number.EPSILON, number('max', 100));
    const value = Math.min(max, Math.max(min, number('value', min)));
    const track = this.shadowRoot.querySelector('.track');
    const fill = this.shadowRoot.querySelector('.fill');
    fill.style.setProperty('--_pct', `${((value - min) / (max - min)) * 100}%`);
    track.setAttribute('aria-valuenow', String(value));
    track.setAttribute('aria-valuemin', String(min));
    track.setAttribute('aria-valuemax', String(max));
    track.setAttribute('aria-label', this.getAttribute('aria-label') || 'Meter');
    if (this.getAttribute('variant') === 'auto') {
      const low = number('low', min + (max - min) / 3);
      const high = number('high', min + ((max - min) * 2) / 3);
      fill.dataset.level = value < low ? 'low' : value < high ? 'mid' : 'high';
    } else {
      delete fill.dataset.level;
    }
  }
}

if (!customElements.get('ui-meter')) {
  customElements.define('ui-meter', UiMeter);
}
