const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }

    data {
      font-variant-numeric: var(--numeric-tabular);
    }
  </style>
  <data part="number"></data>
`;

/**
 * Formatted number Atom.
 */
export class UiNumber extends HTMLElement {
  static observedAttributes = ['value', 'format', 'currency', 'unit', 'digits', 'locale'];

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
    const el = this.shadowRoot.querySelector('data');
    const raw = this.getAttribute('value') ?? '';
    const value = Number(raw);
    el.value = raw;
    if (raw === '' || Number.isNaN(value)) {
      el.textContent = raw;
      return;
    }
    const format = this.getAttribute('format');
    const options = {};
    if (format === 'percent') options.style = 'percent';
    if (format === 'compact') options.notation = 'compact';
    if (format === 'currency') Object.assign(options, { style: 'currency', currency: this.getAttribute('currency') || 'EUR' });
    if (format === 'unit') Object.assign(options, { style: 'unit', unit: this.getAttribute('unit') || 'kilometer' });
    const digits = parseInt(this.getAttribute('digits'), 10);
    if (digits >= 0) Object.assign(options, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    try {
      el.textContent = new Intl.NumberFormat(this.getAttribute('locale') || undefined, options).format(value);
    } catch {
      el.textContent = raw; // unknown currency, unit or locale
    }
  }
}

if (!customElements.get('ui-number')) {
  customElements.define('ui-number', UiNumber);
}
