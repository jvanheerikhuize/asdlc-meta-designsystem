const UNITS = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
const OPTIONS = { date: { dateStyle: 'medium' }, time: { timeStyle: 'short' }, datetime: { dateStyle: 'medium', timeStyle: 'short' } };

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }

    time {
      font-variant-numeric: var(--numeric-tabular);
    }
  </style>
  <time part="time"></time>
`;

/**
 * Date and time Atom, formatted for a locale or relative to now.
 */
export class UiTime extends HTMLElement {
  static observedAttributes = ['datetime', 'format', 'locale'];

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
    const el = this.shadowRoot.querySelector('time');
    const raw = this.getAttribute('datetime') || '';
    el.setAttribute('datetime', raw);
    // A date without a time is a calendar day, not midnight in UTC.
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00` : raw);
    if (Number.isNaN(date.getTime())) {
      el.textContent = raw;
      return;
    }
    const locale = this.getAttribute('locale') || undefined;
    const format = this.getAttribute('format');
    if (format === 'relative') {
      const seconds = (date.getTime() - Date.now()) / 1000;
      const [unit, size] = UNITS.find(([, n]) => Math.abs(seconds) >= n) ?? ['second', 1];
      el.textContent = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(Math.round(seconds / size), unit);
    } else {
      el.textContent = new Intl.DateTimeFormat(locale, OPTIONS[format] ?? OPTIONS.date).format(date);
    }
  }
}

if (!customElements.get('ui-time')) {
  customElements.define('ui-time', UiTime);
}
