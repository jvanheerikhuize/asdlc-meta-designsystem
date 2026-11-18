import '../atoms/ui-icon.js';

const ICONS_BY_VARIANT = {
  info: 'info',
  success: 'check',
  warning: 'alert',
  danger: 'alert',
};

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .callout {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3, 0.75rem);
      padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
      border-radius: var(--radius-lg, 0.75rem);
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      border-left: 5px solid var(--color-info, #38bdf8);
      background: var(--color-surface, #111116);
      color: var(--color-fg, #ededed);
      font-family: var(--font-sans, system-ui, sans-serif);
    }

    :host([variant="success"]) .callout { border-left-color: var(--color-success, #10b981); }
    :host([variant="warning"]) .callout { border-left-color: var(--color-warning, #f59e0b); }
    :host([variant="danger"]) .callout { border-left-color: var(--color-danger, #f87171); }

    ui-icon {
      margin-top: 0.125rem;
      color: var(--color-info, #38bdf8);
      flex-shrink: 0;
    }

    :host([variant="success"]) ui-icon { color: var(--color-success, #10b981); }
    :host([variant="warning"]) ui-icon { color: var(--color-warning, #f59e0b); }
    :host([variant="danger"]) ui-icon { color: var(--color-danger, #f87171); }

    .content {
      display: flex;
      flex-direction: column;
      gap: var(--space-1, 0.25rem);
      min-width: 0;
    }

    .title {
      margin: 0;
      font-size: var(--text-sm, 0.875rem);
      font-weight: 700;
      line-height: var(--leading-tight, 1.2);
    }

    .body {
      font-size: var(--text-sm, 0.875rem);
      color: var(--color-fg-secondary, #a1a1aa);
      line-height: var(--leading-normal, 1.5);
    }
  </style>
  <div class="callout" part="callout" role="note">
    <ui-icon part="icon" name="info" size="md"></ui-icon>
    <div class="content">
      <strong class="title" part="title"></strong>
      <div class="body" part="body"><slot></slot></div>
    </div>
  </div>
`;

/**
 * Left-accented status/action banner Molecule composing <ui-icon>.
 */
export class UiCallout extends HTMLElement {
  static observedAttributes = ['variant', 'title'];

  #icon;
  #title;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#icon = shadow.querySelector('ui-icon');
    this.#title = shadow.querySelector('.title');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#icon || !this.#title) return;
    const variant = this.getAttribute('variant') || 'info';
    this.#icon.setAttribute('name', ICONS_BY_VARIANT[variant] || 'info');
    const title = this.getAttribute('title') || '';
    this.#title.textContent = title;
    this.#title.hidden = !title;
  }
}

if (!customElements.get('ui-callout')) {
  customElements.define('ui-callout', UiCallout);
}
