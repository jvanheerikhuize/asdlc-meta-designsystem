const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    .trend {
      display: inline-flex;
      align-items: center;
      gap: var(--cluster-xs);
      font: var(--type-label);
      font-variant-numeric: var(--numeric-tabular);
      color: var(--color-fg-muted);
    }

    .trend[data-mood="good"] {
      color: var(--color-data-positive);
    }

    .trend[data-mood="bad"] {
      color: var(--color-data-negative);
    }

    svg {
      width: var(--icon-xs);
      height: var(--icon-xs);
      fill: currentColor;
    }

    .trend[data-direction="down"] svg {
      rotate: 180deg;
    }

    .trend[data-direction="flat"] svg {
      rotate: 90deg;
    }
  </style>
  <span class="trend" part="trend">
    <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1 11 10H1z"></path></svg>
    <span class="value" part="value"></span>
  </span>
`;

/**
 * Trend Atom: a signed change with a direction.
 */
export class UiTrend extends HTMLElement {
  static observedAttributes = ['value', 'format', 'digits', 'locale', 'invert'];

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
    const el = this.shadowRoot.querySelector('.trend');
    const value = Number(this.getAttribute('value')) || 0;
    const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
    el.dataset.direction = direction;
    el.dataset.mood = value === 0 ? 'none' : (value > 0) !== this.hasAttribute('invert') ? 'good' : 'bad';
    const digits = parseInt(this.getAttribute('digits'), 10);
    const options = { signDisplay: 'exceptZero' };
    if (this.getAttribute('format') === 'percent') options.style = 'percent';
    if (digits >= 0) Object.assign(options, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    this.shadowRoot.querySelector('.value').textContent = new Intl.NumberFormat(this.getAttribute('locale') || undefined, options).format(value);
  }
}

if (!customElements.get('ui-trend')) {
  customElements.define('ui-trend', UiTrend);
}
