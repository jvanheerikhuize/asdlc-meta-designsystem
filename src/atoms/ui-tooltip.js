const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    :host([hidden]) {
      display: none;
    }

    .bubble {
      position: absolute;
      z-index: 60;
      max-width: 16rem;
      width: max-content;
      padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
      border-radius: var(--radius-sm, 0.375rem);
      border: 1px solid var(--color-border-hover, rgba(255, 255, 255, 0.22));
      background: var(--color-surface-elevated, #18181f);
      color: var(--color-fg, #ededed);
      box-shadow: var(--shadow-md, 0 4px 14px rgba(0, 0, 0, 0.45));
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-xs, 0.75rem);
      line-height: var(--leading-normal, 1.5);
      pointer-events: auto;
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--duration-fast, 120ms) var(--ease-standard, ease);
    }

    :host([open]) .bubble {
      opacity: 1;
      visibility: visible;
    }

    :host(:not([placement])) .bubble,
    :host([placement="top"]) .bubble {
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
    }

    :host([placement="bottom"]) .bubble {
      top: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
    }

    :host([placement="right"]) .bubble {
      left: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
    }

    :host([placement="left"]) .bubble {
      right: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
    }

    @media (prefers-reduced-motion: reduce) {
      .bubble {
        transition: none;
      }
    }
  </style>
  <slot></slot>
  <span class="bubble" part="tooltip" role="tooltip"></span>
`;

/**
 * Accessible tooltip Atom satisfying WCAG 1.4.13 (dismissible via Escape,
 * hoverable over tooltip content, persistent while focused or hovered).
 */
export class UiTooltip extends HTMLElement {
  static observedAttributes = ['text', 'placement', 'open'];

  #bubble;
  #hideTimer = null;
  #onKeyDown = (event) => {
    if (event.key === 'Escape' && this.hasAttribute('open')) {
      this.hide();
    }
  };

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#bubble = shadow.querySelector('.bubble');

    this.addEventListener('mouseenter', () => this.show());
    this.addEventListener('mouseleave', () => this.#scheduleHide());
    this.addEventListener('focusin', () => this.show());
    this.addEventListener('focusout', (event) => {
      if (!this.contains(event.relatedTarget)) {
        this.hide();
      }
    });
  }

  connectedCallback() {
    this.#sync();
    document.addEventListener('keydown', this.#onKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.#onKeyDown);
    if (this.#hideTimer) clearTimeout(this.#hideTimer);
  }

  attributeChangedCallback() {
    this.#sync();
  }

  show() {
    if (this.#hideTimer) {
      clearTimeout(this.#hideTimer);
      this.#hideTimer = null;
    }
    if (!this.getAttribute('text')) return;
    this.setAttribute('open', '');
  }

  hide() {
    if (this.#hideTimer) {
      clearTimeout(this.#hideTimer);
      this.#hideTimer = null;
    }
    this.removeAttribute('open');
  }

  #scheduleHide() {
    if (this.#hideTimer) clearTimeout(this.#hideTimer);
    this.#hideTimer = setTimeout(() => this.hide(), 100);
  }

  #sync() {
    if (!this.#bubble) return;
    this.#bubble.textContent = this.getAttribute('text') || '';
  }
}

if (!customElements.get('ui-tooltip')) {
  customElements.define('ui-tooltip', UiTooltip);
}
