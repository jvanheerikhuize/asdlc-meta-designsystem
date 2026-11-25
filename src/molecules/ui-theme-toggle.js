import '../atoms/ui-button.js';
import '../atoms/ui-icon.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-flex;
    }

    :host([hidden]) {
      display: none;
    }
  </style>
  <ui-button part="theme-button" variant="secondary" size="sm" aria-label="Toggle color theme">
    <ui-icon name="sun" size="sm"></ui-icon>
    <span class="text">Light Mode</span>
  </ui-button>
`;

/**
 * Theme toggle Molecule composing <ui-button> and <ui-icon>. It reports the choice; the page applies it.
 */
export class UiThemeToggle extends HTMLElement {
  static observedAttributes = ['theme'];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    shadow.querySelector('ui-button').addEventListener('ui-press', () => {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      this.dispatchEvent(new CustomEvent('ui-theme-change', {
        bubbles: true,
        composed: true,
        detail: { theme: this.theme },
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
    const isLight = this.theme === 'light';
    this.shadowRoot.querySelector('ui-icon').setAttribute('name', isLight ? 'moon' : 'sun');
    this.shadowRoot.querySelector('.text').textContent = isLight ? 'Dark Mode' : 'Light Mode';
  }
}

if (!customElements.get('ui-theme-toggle')) {
  customElements.define('ui-theme-toggle', UiThemeToggle);
}
