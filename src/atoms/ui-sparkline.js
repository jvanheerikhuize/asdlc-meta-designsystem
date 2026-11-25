const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    svg {
      display: block;
      width: 100%;
      height: var(--control-sm);
      overflow: visible;
    }

    polyline {
      fill: none;
      stroke: var(--color-accent);
      stroke-width: var(--border-width-strong);
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }

    :host([variant="info"]) polyline {
      stroke: var(--color-info);
    }

    :host([variant="success"]) polyline {
      stroke: var(--color-success);
    }

    :host([variant="warning"]) polyline {
      stroke: var(--color-warning);
    }

    :host([variant="danger"]) polyline {
      stroke: var(--color-danger);
    }
  </style>
  <svg part="chart" viewBox="0 0 100 20" preserveAspectRatio="none" role="img"><polyline part="line"></polyline></svg>
`;

/**
 * Sparkline Atom: a tiny line chart.
 */
export class UiSparkline extends HTMLElement {
  static observedAttributes = ['values', 'label'];

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
    const values = (this.getAttribute('values') || '').split(/[\s,]+/).filter(Boolean).map(Number).filter(Number.isFinite);
    const min = values.reduce((a, b) => Math.min(a, b), Infinity);
    const max = values.reduce((a, b) => Math.max(a, b), -Infinity);
    const span = max - min || 1;
    const last = Math.max(1, values.length - 1);
    const points = values.map((v, i) => `${(i / last) * 100},${max === min ? 10 : 19 - ((v - min) / span) * 18}`);
    this.shadowRoot.querySelector('polyline').setAttribute('points', points.join(' '));
    this.shadowRoot.querySelector('svg').setAttribute('aria-label', this.getAttribute('label')
      || (values.length ? `Line from ${values[0]} to ${values.at(-1)}, lowest ${min}, highest ${max}` : 'No data'));
  }
}

if (!customElements.get('ui-sparkline')) {
  customElements.define('ui-sparkline', UiSparkline);
}
