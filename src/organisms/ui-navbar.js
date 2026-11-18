import '../atoms/ui-button.js';
import '../atoms/ui-icon.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 20;
    }

    :host([hidden]) {
      display: none;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4, 1rem);
      flex-wrap: wrap;
      padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
      background: color-mix(in srgb, var(--color-surface, #111116) 82%, transparent);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
    }

    .left,
    .right {
      display: flex;
      align-items: center;
      gap: var(--space-3, 0.75rem);
      flex-wrap: wrap;
    }

    .search-slot {
      flex: 1 1 220px;
      max-width: 340px;
    }
  </style>
  <header part="header">
    <div class="left">
      <slot name="brand"></slot>
      <nav aria-label="Primary">
        <slot name="nav"></slot>
      </nav>
    </div>
    <div class="search-slot">
      <slot name="search"></slot>
    </div>
    <div class="right">
      <slot name="actions"></slot>
      <ui-button id="theme-btn" part="theme-button" variant="secondary" size="sm" aria-label="Toggle color theme">
        <ui-icon id="theme-icon" name="sun" size="sm"></ui-icon>
        <span id="theme-text">Light Mode</span>
      </ui-button>
    </div>
  </header>
`;

/**
 * Sticky frosted-glass site header Organism with brand, nav, search, and actions slots
 * plus an integrated theme toggle emitting `ui-theme-change`.
 */
export class UiNavbar extends HTMLElement {
  static observedAttributes = ['theme'];

  #themeBtn;
  #themeIcon;
  #themeText;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#themeBtn = shadow.getElementById('theme-btn');
    this.#themeIcon = shadow.getElementById('theme-icon');
    this.#themeText = shadow.getElementById('theme-text');

    this.#themeBtn.addEventListener('ui-press', () => {
      const next = this.theme === 'light' ? 'dark' : 'light';
      this.theme = next;
      this.dispatchEvent(new CustomEvent('ui-theme-change', {
        bubbles: true,
        composed: true,
        detail: { theme: next },
      }));
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
    if (!this.#themeIcon || !this.#themeText) return;
    const isLight = this.theme === 'light';
    this.#themeIcon.setAttribute('name', isLight ? 'moon' : 'sun');
    this.#themeText.textContent = isLight ? 'Dark Mode' : 'Light Mode';
  }
}

if (!customElements.get('ui-navbar')) {
  customElements.define('ui-navbar', UiNavbar);
}
