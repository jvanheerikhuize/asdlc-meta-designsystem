import '../atoms/ui-button.js';
import '../atoms/ui-icon.js';
import '../atoms/ui-heading.js';

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
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
    }

  </style>
  <div class="head" part="header">
    <ui-heading class="title" exportparts="heading: title" level="2" size="h5"></ui-heading>
    <slot name="actions"></slot>
    <ui-button class="close-btn" part="close" variant="ghost" size="sm" aria-label="Close">
      <ui-icon name="close" size="sm"></ui-icon>
    </ui-button>
  </div>
`;

/**
 * Reusable header bar Molecule composing a <ui-heading> and close <ui-button>/<ui-icon>.
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
