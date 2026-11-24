import '../atoms/ui-button.js';
import '../atoms/ui-icon.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3, 0.75rem);
      padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    }

    .title {
      margin: 0;
      font-family: var(--font-display, system-ui, sans-serif);
      font-size: var(--text-md, 1rem);
      font-weight: 700;
      line-height: var(--leading-tight, 1.2);
      color: var(--color-fg, #ededed);
    }
  </style>
  <div class="head" part="header">
    <h2 class="title" part="title"></h2>
    <slot name="actions"></slot>
    <ui-button class="close-btn" part="close" variant="ghost" size="sm" aria-label="Close">
      <ui-icon name="close" size="sm"></ui-icon>
    </ui-button>
  </div>
`;

/**
 * Reusable header bar Molecule composing a title heading and close <ui-button>/<ui-icon>.
 */
export class UiPanelHeader extends HTMLElement {
  static observedAttributes = ['title', 'heading-id', 'close-label'];

  #titleEl;
  #closeBtn;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#titleEl = shadow.querySelector('.title');
    this.#closeBtn = shadow.querySelector('.close-btn');
    this.#closeBtn.addEventListener('ui-press', () => {
      this.dispatchEvent(new CustomEvent('ui-close', { bubbles: true, composed: true }));
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#titleEl || !this.#closeBtn) return;
    this.#titleEl.textContent = this.getAttribute('title') || '';
    const hid = this.getAttribute('heading-id');
    if (hid) this.#titleEl.id = hid;
    this.#closeBtn.setAttribute('aria-label', this.getAttribute('close-label') || 'Close');
  }
}

if (!customElements.get('ui-panel-header')) {
  customElements.define('ui-panel-header', UiPanelHeader);
}
