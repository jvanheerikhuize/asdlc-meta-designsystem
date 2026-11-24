import '../atoms/ui-surface.js';
import '../atoms/ui-icon.js';
import '../atoms/ui-button.js';

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

    .row {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3, 0.75rem);
      font-family: var(--font-sans, system-ui, sans-serif);
    }

    ui-icon.lead {
      margin-top: 0.125rem;
      color: var(--color-info, #38bdf8);
      flex-shrink: 0;
    }

    :host([variant="success"]) ui-icon.lead { color: var(--color-success, #10b981); }
    :host([variant="warning"]) ui-icon.lead { color: var(--color-warning, #f59e0b); }
    :host([variant="danger"]) ui-icon.lead { color: var(--color-danger, #f87171); }

    .content {
      flex: 1;
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
      color: var(--color-fg, #ededed);
    }

    .body {
      font-size: var(--text-sm, 0.875rem);
      color: var(--color-fg-secondary, #a1a1aa);
      line-height: var(--leading-normal, 1.5);
    }
  </style>
  <ui-surface part="callout" variant="base" padding="md" radius="lg" accent="info" role="note">
    <div class="row">
      <ui-icon class="lead" part="icon" name="info" size="md"></ui-icon>
      <div class="content">
        <strong class="title" part="title"></strong>
        <div class="body" part="body"><slot></slot></div>
      </div>
      <ui-button class="dismiss" part="dismiss" variant="ghost" size="sm" aria-label="Dismiss" hidden>
        <ui-icon name="close" size="sm"></ui-icon>
      </ui-button>
    </div>
  </ui-surface>
`;

/**
 * Left-accented status/action banner Molecule composing <ui-surface>, <ui-icon>,
 * and optional dismiss <ui-button>.
 */
export class UiCallout extends HTMLElement {
  static observedAttributes = ['variant', 'title', 'dismissible', 'elevation'];

  #surface;
  #icon;
  #title;
  #dismissBtn;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#surface = shadow.querySelector('ui-surface');
    this.#icon = shadow.querySelector('ui-icon.lead');
    this.#title = shadow.querySelector('.title');
    this.#dismissBtn = shadow.querySelector('.dismiss');

    this.#dismissBtn.addEventListener('ui-press', () => {
      this.dispatchEvent(new CustomEvent('ui-dismiss', { bubbles: true, composed: true }));
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#surface || !this.#icon || !this.#title || !this.#dismissBtn) return;
    const variant = this.getAttribute('variant') || 'info';
    this.#surface.setAttribute('accent', variant);
    const elevation = this.getAttribute('elevation') || 'none';
    this.#surface.setAttribute('elevation', elevation);
    this.#icon.setAttribute('name', ICONS_BY_VARIANT[variant] || 'info');
    const title = this.getAttribute('title') || '';
    this.#title.textContent = title;
    this.#title.hidden = !title;
    this.#dismissBtn.hidden = !this.hasAttribute('dismissible');
  }
}

if (!customElements.get('ui-callout')) {
  customElements.define('ui-callout', UiCallout);
}
