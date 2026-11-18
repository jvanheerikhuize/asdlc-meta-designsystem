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
      display: flex;
      gap: 2px;
      width: 100%;
      height: 0.5rem;
      border-radius: var(--radius-full, 9999px);
      background: var(--color-card, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      overflow: hidden;
    }

    .fill,
    .seg {
      height: 100%;
      border-radius: var(--radius-full, 9999px);
      background: var(--color-success, #10b981);
      transition: width var(--duration-normal, 220ms) var(--ease-standard, ease);
    }

    .seg {
      border-radius: 2px;
      min-width: 4px;
    }

    :host([variant="accent"]) .fill,
    .seg[data-variant="accent"] { background: var(--color-accent, #f43f5e); }
    :host([variant="warning"]) .fill,
    .seg[data-variant="warning"] { background: var(--color-warning, #f59e0b); }
    :host([variant="danger"]) .fill,
    .seg[data-variant="danger"] { background: var(--color-danger, #f87171); }
    .seg[data-variant="info"] { background: var(--color-info, #38bdf8); }
    .seg[data-variant="off"] { background: var(--color-border-hover, rgba(255, 255, 255, 0.22)); }

    @media (prefers-reduced-motion: reduce) {
      .fill,
      .seg { transition: none; }
    }
  </style>
  <div class="track" part="track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="fill" part="fill"></div>
  </div>
`;

/**
 * Progress bar Atom supporting single-value mode and multi-segment mode (`segments` JSON).
 */
export class UiProgress extends HTMLElement {
  static observedAttributes = ['value', 'max', 'variant', 'segments', 'aria-label'];

  #track;
  #segments = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#track = shadow.querySelector('.track');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get segments() {
    return this.#segments;
  }

  set segments(list) {
    this.#segments = Array.isArray(list) ? list : null;
    this.#sync();
  }

  #sync() {
    if (!this.#track) return;
    const label = this.getAttribute('aria-label');
    if (label) this.#track.setAttribute('aria-label', label);
    else this.#track.removeAttribute('aria-label');

    const segAttr = this.getAttribute('segments');
    let segs = this.#segments;
    if (segAttr) {
      try {
        const parsed = JSON.parse(segAttr);
        if (Array.isArray(parsed)) segs = parsed;
      } catch {
        /* ignore invalid JSON */
      }
    }

    if (Array.isArray(segs) && segs.length > 0) {
      const total = segs.reduce((sum, s) => sum + Math.max(0, Number(s.value) || 0), 0) || 1;
      const active = segs
        .filter((s) => s.variant !== 'off')
        .reduce((sum, s) => sum + Math.max(0, Number(s.value) || 0), 0);
      this.#track.setAttribute('aria-valuemax', String(total));
      this.#track.setAttribute('aria-valuenow', String(active));
      this.#track.innerHTML = '';
      for (const s of segs) {
        const val = Math.max(0, Number(s.value) || 0);
        if (!val) continue;
        const div = document.createElement('div');
        div.className = 'seg';
        div.setAttribute('part', 'segment');
        div.dataset.variant = s.variant || 'success';
        if (s.label) div.title = s.label;
        div.style.width = `${(val / total) * 100}%`;
        this.#track.appendChild(div);
      }
      return;
    }

    const max = Math.max(1, Number.parseFloat(this.getAttribute('max') || '100') || 100);
    const raw = Number.parseFloat(this.getAttribute('value') || '0') || 0;
    const clamped = Math.min(max, Math.max(0, raw));
    const pct = (clamped / max) * 100;

    this.#track.setAttribute('aria-valuemax', String(max));
    this.#track.setAttribute('aria-valuenow', String(clamped));
    this.#track.innerHTML = '<div class="fill" part="fill"></div>';
    this.#track.querySelector('.fill').style.width = `${pct}%`;
  }
}

if (!customElements.get('ui-progress')) {
  customElements.define('ui-progress', UiProgress);
}
