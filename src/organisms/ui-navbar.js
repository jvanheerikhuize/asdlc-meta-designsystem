import '../atoms/ui-surface.js';
import '../atoms/ui-cluster.js';
import '../molecules/ui-theme-toggle.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: var(--z-header);
    }

    :host([hidden]) {
      display: none;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      flex-wrap: wrap;
      padding: var(--space-3) var(--space-6);
    }

    .search-slot {
      flex: 1 1 var(--layout-search-min);
      max-width: var(--layout-search-max);
    }
  </style>
  <ui-surface variant="glass" radius="none" padding="none">
    <header part="header">
      <ui-cluster gap="md">
        <slot name="brand"></slot>
        <nav aria-label="Primary">
          <slot name="nav"></slot>
        </nav>
      </ui-cluster>
      <div class="search-slot">
        <slot name="search"></slot>
      </div>
      <ui-cluster gap="md">
        <slot name="actions"></slot>
        <ui-theme-toggle id="theme-btn" exportparts="theme-button"></ui-theme-toggle>
      </ui-cluster>
    </header>
  </ui-surface>
`;

/**
 * Sticky frosted-glass site header Organism composing <ui-surface variant="glass">,
 * <ui-cluster>, and <ui-theme-toggle>, whose ui-theme-change event passes through.
 */
export class UiNavbar extends HTMLElement {
  static observedAttributes = ['theme'];

  #toggle;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#toggle = shadow.getElementById('theme-btn');
    this.#toggle.addEventListener('ui-theme-change', (e) => {
      this.theme = e.detail.theme;
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get theme() {
    return this.getAttribute('theme') === 'light' ? 'light' : 'dark';
  }

  set theme(val) {
    this.setAttribute('theme', val === 'light' ? 'light' : 'dark');
  }

  #sync() {
    this.#toggle?.setAttribute('theme', this.theme);
  }
}

if (!customElements.get('ui-navbar')) {
  customElements.define('ui-navbar', UiNavbar);
}
