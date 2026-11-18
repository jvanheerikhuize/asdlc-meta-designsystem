import '../atoms/ui-badge.js';
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

    button.card {
      all: unset;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--space-3, 0.75rem);
      padding: var(--space-5, 1.25rem);
      border-radius: var(--radius-lg, 0.75rem);
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      background: var(--color-card, rgba(255, 255, 255, 0.04));
      color: var(--color-fg, #ededed);
      cursor: pointer;
      text-align: left;
      transition:
        background-color var(--duration-fast, 120ms) var(--ease-standard, ease),
        border-color var(--duration-fast, 120ms) var(--ease-standard, ease),
        transform var(--duration-fast, 120ms) var(--ease-standard, ease);
    }

    button.card:hover {
      background: var(--color-card-hover, rgba(255, 255, 255, 0.07));
      border-color: var(--color-border-hover, rgba(255, 255, 255, 0.22));
      transform: translateY(-2px);
    }

    button.card:focus-visible {
      outline: 2px solid var(--color-focus-ring, #f43f5e);
      outline-offset: 2px;
      border-color: var(--color-focus-ring, #f43f5e);
    }

    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2, 0.5rem);
    }

    .title {
      margin: 0;
      font-family: var(--font-display, system-ui, sans-serif);
      font-size: var(--text-lg, 1.125rem);
      font-weight: 700;
      line-height: var(--leading-tight, 1.2);
    }

    .subtitle {
      margin: 0;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
      line-height: var(--leading-normal, 1.5);
      color: var(--color-fg-secondary, #a1a1aa);
      flex: 1;
    }

    .foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2, 0.5rem);
      font-family: var(--font-mono, monospace);
      font-size: var(--text-xs, 0.75rem);
      color: var(--color-fg-muted, #8e8e98);
    }

    @media (prefers-reduced-motion: reduce) {
      button.card {
        transition: none;
      }
      button.card:hover {
        transform: none;
      }
    }
  </style>
  <button class="card" part="card" type="button">
    <div class="top">
      <ui-badge part="badge"></ui-badge>
      <ui-icon name="arrow-right" size="sm"></ui-icon>
    </div>
    <h3 class="title" part="title"></h3>
    <p class="subtitle" part="subtitle"></p>
    <slot></slot>
    <div class="foot" part="meta"></div>
  </button>
`;

/**
 * Interactive catalog/media card Molecule composing <ui-badge> and <ui-icon>.
 * Emits `ui-select` with `{ id, title }` on activation.
 */
export class UiMediaCard extends HTMLElement {
  static observedAttributes = ['card-id', 'title', 'subtitle', 'badge', 'badge-variant', 'meta'];

  #btn;
  #badge;
  #title;
  #subtitle;
  #meta;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#btn = shadow.querySelector('button.card');
    this.#badge = shadow.querySelector('ui-badge');
    this.#title = shadow.querySelector('.title');
    this.#subtitle = shadow.querySelector('.subtitle');
    this.#meta = shadow.querySelector('.foot');

    this.#btn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ui-select', {
        bubbles: true,
        composed: true,
        detail: {
          id: this.getAttribute('card-id') || '',
          title: this.getAttribute('title') || '',
        },
      }));
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#badge || !this.#title || !this.#subtitle || !this.#meta) return;
    const badgeText = this.getAttribute('badge') || '';
    this.#badge.textContent = badgeText;
    this.#badge.setAttribute('variant', this.getAttribute('badge-variant') || 'neutral');
    this.#badge.hidden = !badgeText;

    this.#title.textContent = this.getAttribute('title') || '';
    this.#subtitle.textContent = this.getAttribute('subtitle') || '';
    this.#meta.textContent = this.getAttribute('meta') || '';
    this.#meta.hidden = !this.#meta.textContent;
  }
}

if (!customElements.get('ui-media-card')) {
  customElements.define('ui-media-card', UiMediaCard);
}
