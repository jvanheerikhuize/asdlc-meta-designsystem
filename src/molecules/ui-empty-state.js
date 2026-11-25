import '../atoms/ui-surface.js';
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

    ui-surface::part(surface) {
      background: transparent;
      border-style: dashed;
    }

    .body {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-8);
      text-align: center;
      color: var(--color-fg-muted);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
    }
  </style>
  <ui-surface part="container">
    <div class="body" part="body">
      <ui-icon name="search" size="lg"></ui-icon>
      <span class="text" part="text"></span>
      <slot></slot>
    </div>
  </ui-surface>
`;

/**
 * Empty-state Molecule composing <ui-surface> and <ui-icon> with a message and an optional slotted action.
 */
export class UiEmptyState extends HTMLElement {
  static observedAttributes = ['text', 'icon'];

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
    this.shadowRoot.querySelector('.text').textContent = this.getAttribute('text') || 'No matching items.';
    this.shadowRoot.querySelector('ui-icon').setAttribute('name', this.getAttribute('icon') || 'search');
  }
}

if (!customElements.get('ui-empty-state')) {
  customElements.define('ui-empty-state', UiEmptyState);
}
