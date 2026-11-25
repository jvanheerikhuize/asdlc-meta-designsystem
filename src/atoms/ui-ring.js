const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    svg {
      display: block;
      width: var(--icon-2xl);
      height: var(--icon-2xl);
      rotate: -90deg;
    }

    :host([size="sm"]) svg {
      width: var(--icon-lg);
      height: var(--icon-lg);
    }

    :host([size="lg"]) svg {
      width: var(--size-avatar-xl);
      height: var(--size-avatar-xl);
    }

    circle {
      fill: none;
      stroke: var(--color-card-hover);
      stroke-width: var(--border-width-accent);
    }

    .bar {
      stroke: var(--color-accent);
      stroke-linecap: round;
      stroke-dasharray: var(--_pct, 25) 100;
      transition: stroke-dasharray var(--duration-normal) var(--ease-standard);
    }

    :host([variant="success"]) .bar {
      stroke: var(--color-success);
    }

    :host([variant="warning"]) .bar {
      stroke: var(--color-warning);
    }

    :host([variant="danger"]) .bar {
      stroke: var(--color-danger);
    }

    :host(:not([value])) svg {
      animation: turn var(--duration-shimmer) var(--ease-linear) infinite;
    }

    @keyframes turn { to { rotate: 270deg; } }

    @media (prefers-reduced-motion: reduce) { svg { animation: none; } }
  </style>
  <svg part="ring" viewBox="0 0 40 40" role="progressbar">
    <circle cx="20" cy="20" r="17"></circle>
    <circle class="bar" cx="20" cy="20" r="17" pathLength="100"></circle>
  </svg>
`;

/**
 * Circular progress Atom; without a value it is indeterminate.
 */
export class UiRing extends HTMLElement {
  static observedAttributes = ['value', 'max', 'aria-label'];

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
    const svg = this.shadowRoot.querySelector('svg');
    const max = parseFloat(this.getAttribute('max')) || 100;
    const value = parseFloat(this.getAttribute('value'));
    svg.setAttribute('aria-label', this.getAttribute('aria-label') || 'Progress');
    svg.setAttribute('aria-valuemin', '0');
    svg.setAttribute('aria-valuemax', String(max));
    if (Number.isFinite(value)) {
      const clamped = Math.min(max, Math.max(0, value));
      svg.setAttribute('aria-valuenow', String(clamped));
      svg.style.setProperty('--_pct', String((clamped / max) * 100));
    } else {
      svg.removeAttribute('aria-valuenow');
      svg.style.removeProperty('--_pct');
    }
  }
}

if (!customElements.get('ui-ring')) {
  customElements.define('ui-ring', UiRing);
}
