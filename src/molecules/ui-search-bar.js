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

    :host([compact]) .bar {
      grid-template-columns: 1fr;
    }

    :host([compact]) .submit {
      display: none;
    }

    .box {
      position: relative;
    }

    .lead,
    .clear {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }

    .lead {
      display: none;
      left: var(--space-3, 0.75rem);
      color: var(--color-fg-muted, #8e8e98);
      pointer-events: none;
    }

    .clear {
      right: var(--space-1, 0.25rem);
    }

    .clear[hidden] {
      display: none;
    }

    :host([compact]) .lead {
      display: inline-flex;
    }

    :host([compact]) ui-input {
      --ui-input-padding-start: 2.25rem;
    }

    :host([clearable]) ui-input {
      --ui-input-padding-end: 2.5rem;
    }
  </style>
  <div class="bar" part="bar" role="search">
    <div class="box">
      <ui-input part="input" type="search"></ui-input>
      <ui-icon class="lead" name="search" size="sm"></ui-icon>
      <ui-button class="clear" part="clear" variant="ghost" size="sm" aria-label="Clear search" hidden>
        <ui-icon name="close" size="sm"></ui-icon>
      </ui-button>
    </div>
    <ui-button class="submit" part="button" variant="primary" size="md">
      <ui-icon name="search" size="sm"></ui-icon>
      <span class="btn-label">Search</span>
    </ui-button>
  </div>
`;

/**
 * Search bar Molecule composing <ui-input>, <ui-button>, and <ui-icon>.
 * Emits a semantic `ui-search` event carrying `{ query }` on submit, and `ui-input` with an
 * empty value when cleared. `compact` drops the submit button for live filtering.
 */
export class UiSearchBar extends HTMLElement {
  static observedAttributes = ['value', 'placeholder', 'button-label', 'aria-label', 'disabled', 'clearable', 'clear-label', 'compact'];

  #input;
  #clear;
  #button;
  #btnLabel;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    // importNode upgrades the inner Atoms now. With cloneNode they stay inert until connected, and a
    // value set before that becomes an own property that hides the Atom's accessor for good.
    shadow.appendChild(document.importNode(TEMPLATE.content, true));
    this.#input = shadow.querySelector('ui-input');
    this.#button = shadow.querySelector('.submit');
    this.#clear = shadow.querySelector('.clear');
    this.#btnLabel = shadow.querySelector('.btn-label');

    this.#button.addEventListener('ui-press', () => this.#emitSearch());
    this.#clear.addEventListener('ui-press', (event) => {
      event.stopPropagation();
      this.#clearQuery();
    });
    this.#input.addEventListener('ui-input', () => this.#syncClear());
    this.#input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.hasAttribute('clearable') && this.value) {
        // Escape clears first; only an empty search lets it close a surrounding dialog.
        event.preventDefault();
        event.stopPropagation();
        this.#clearQuery();
        return;
      }
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
    if (this.#input) {
      this.#input.value = next;
      this.#syncClear();
    }
    this.setAttribute('value', next);
  }

  #clearQuery() {
    if (this.hasAttribute('disabled')) return;
    this.value = '';
    this.#input.focus();
    this.dispatchEvent(new CustomEvent('ui-input', { bubbles: true, composed: true, detail: { value: '' } }));
  }

  #syncClear() {
    this.#clear.hidden = !this.hasAttribute('clearable') || this.hasAttribute('disabled') || !this.value;
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
    // A native search input brings its own clear control.
    this.#input.setAttribute('type', this.hasAttribute('clearable') ? 'text' : 'search');
    this.#clear.setAttribute('aria-label', this.getAttribute('clear-label') || 'Clear search');
    this.#syncClear();
  }
}

if (!customElements.get('ui-search-bar')) {
  customElements.define('ui-search-bar', UiSearchBar);
}
