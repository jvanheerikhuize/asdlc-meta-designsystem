import '../atoms/ui-input.js';
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

    .bar {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--space-2, 0.5rem);
      align-items: center;
    }
  </style>
  <div class="bar" part="bar" role="search">
    <ui-input part="input" type="search"></ui-input>
    <ui-button part="button" variant="primary" size="md">
      <ui-icon name="search" size="sm"></ui-icon>
      <span class="btn-label">Search</span>
    </ui-button>
  </div>
`;

/**
 * Search bar Molecule composing <ui-input>, <ui-button>, and <ui-icon>.
 * Emits a semantic `ui-search` event carrying `{ query }` on submit.
 */
export class UiSearchBar extends HTMLElement {
  static observedAttributes = ['value', 'placeholder', 'button-label', 'aria-label', 'disabled'];

  #input;
  #button;
  #btnLabel;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#input = shadow.querySelector('ui-input');
    this.#button = shadow.querySelector('ui-button');
    this.#btnLabel = shadow.querySelector('.btn-label');

    this.#button.addEventListener('ui-press', () => this.#emitSearch());
    this.#input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.#emitSearch();
      }
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get value() {
    return this.#input ? this.#input.value : (this.getAttribute('value') ?? '');
  }

  set value(val) {
    const next = val == null ? '' : String(val);
    if (this.#input) this.#input.value = next;
    this.setAttribute('value', next);
  }

  #emitSearch() {
    if (this.hasAttribute('disabled')) return;
    this.dispatchEvent(new CustomEvent('ui-search', {
      bubbles: true,
      composed: true,
      detail: { query: this.value },
    }));
  }

  #sync() {
    if (!this.#input || !this.#button || !this.#btnLabel) return;
    this.#input.setAttribute('placeholder', this.getAttribute('placeholder') || 'Search…');
    this.#input.setAttribute('aria-label', this.getAttribute('aria-label') || 'Search');
    this.#input.toggleAttribute('disabled', this.hasAttribute('disabled'));
    this.#button.toggleAttribute('disabled', this.hasAttribute('disabled'));
    this.#btnLabel.textContent = this.getAttribute('button-label') || 'Search';
    if (this.hasAttribute('value') && this.#input.value !== this.getAttribute('value')) {
      this.#input.value = this.getAttribute('value') ?? '';
    }
  }
}

if (!customElements.get('ui-search-bar')) {
  customElements.define('ui-search-bar', UiSearchBar);
}
