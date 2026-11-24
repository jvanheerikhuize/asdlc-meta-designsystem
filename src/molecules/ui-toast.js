import '../atoms/ui-button.js';
import '../atoms/ui-icon.js';

const VARIANT_ICONS = {
  info: 'info',
  success: 'check',
  warning: 'alert',
  danger: 'alert',
};

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host(:not([open])) .toast {
      display: none;
    }

    .toast {
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      gap: var(--space-3, 0.75rem);
      min-width: min(18rem, 100%);
      max-width: min(26rem, calc(100vw - 2rem));
      margin: 0;
      padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
      border-radius: var(--radius-lg, 0.75rem);
      border: 1px solid var(--color-border-hover, rgba(255, 255, 255, 0.22));
      border-inline-start: 3px solid var(--_accent, var(--color-info, #38bdf8));
      background: var(--color-surface, #111116);
      color: var(--color-fg, #ededed);
      box-shadow: var(--shadow-lg, 0 12px 32px rgba(0, 0, 0, 0.6));
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
      line-height: var(--leading-normal, 1.5);
    }

    :host([variant="success"]) .toast { --_accent: var(--color-success, #10b981); }
    :host([variant="warning"]) .toast { --_accent: var(--color-warning, #f59e0b); }
    :host([variant="danger"]) .toast { --_accent: var(--color-danger, #f87171); }

    .icon {
      color: var(--_accent, var(--color-info, #38bdf8));
      margin-top: 2px;
      flex-shrink: 0;
    }

    .content {
      flex: 1;
      min-width: 0;
    }

    .title {
      display: block;
      font-weight: 600;
      color: var(--color-fg, #ededed);
      margin-bottom: 2px;
    }

    .title:empty {
      display: none;
    }

    .body {
      color: var(--color-fg-secondary, #a1a1aa);
    }

    .sr-live {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  </style>
  <div class="sr-live" aria-live="polite" aria-atomic="true"></div>
  <div class="toast" part="toast" role="region" aria-label="Notification">
    <ui-icon class="icon" part="icon" name="info" size="md"></ui-icon>
    <div class="content">
      <strong class="title" part="title"></strong>
      <div class="body" part="body"><slot></slot></div>
    </div>
    <ui-button class="dismiss" part="dismiss" variant="ghost" size="sm" aria-label="Dismiss notification">
      <ui-icon name="close" size="sm"></ui-icon>
    </ui-button>
  </div>
`;

/**
 * Non-modal notification toast Molecule with explicit keyboard-focusable dismiss,
 * screen-reader polite announcement (ariaNotify + live region fallback), and
 * focus/hover-aware auto-dismiss timer.
 */
export class UiToast extends HTMLElement {
  static observedAttributes = ['variant', 'title', 'open', 'duration'];

  #toast;
  #icon;
  #titleEl;
  #liveEl;
  #dismissBtn;
  #timer = null;
  #paused = false;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#toast = shadow.querySelector('.toast');
    this.#icon = shadow.querySelector('.icon');
    this.#titleEl = shadow.querySelector('.title');
    this.#liveEl = shadow.querySelector('.sr-live');
    this.#dismissBtn = shadow.querySelector('.dismiss');

    this.#dismissBtn.addEventListener('ui-press', () => this.dismiss('dismiss-button'));
    this.addEventListener('mouseenter', () => {
      this.#paused = true;
      this.#clearTimer();
    });
    this.addEventListener('mouseleave', () => {
      this.#paused = false;
      this.#armTimer();
    });
    this.addEventListener('focusin', () => {
      this.#paused = true;
      this.#clearTimer();
    });
    this.addEventListener('focusout', (event) => {
      if (!this.contains(event.relatedTarget)) {
        this.#paused = false;
        this.#armTimer();
      }
    });
  }

  connectedCallback() {
    this.#sync();
    if (this.hasAttribute('open')) {
      this.#announce();
      this.#armTimer();
    }
  }

  disconnectedCallback() {
    this.#clearTimer();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this.#sync();
    if (name === 'open' && oldVal === null && newVal !== null) {
      this.#announce();
      this.#armTimer();
    } else if (name === 'open' && newVal === null) {
      this.#clearTimer();
    }
  }

  show() {
    this.setAttribute('open', '');
  }

  dismiss(reason = 'programmatic') {
    if (!this.hasAttribute('open')) return;
    this.#clearTimer();
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('ui-close', {
      bubbles: true,
      composed: true,
      detail: { reason },
    }));
  }

  #announce() {
    const title = this.getAttribute('title') || '';
    const body = this.textContent?.trim() || '';
    const message = [title, body].filter(Boolean).join(': ');
    if (!message) return;
    if (typeof this.ariaNotify === 'function') {
      this.ariaNotify(message);
    } else if (this.#liveEl) {
      this.#liveEl.textContent = message;
    }
  }

  #clearTimer() {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }

  #armTimer() {
    this.#clearTimer();
    if (this.#paused || !this.hasAttribute('open')) return;
    const ms = Number(this.getAttribute('duration') || 0);
    if (ms > 0) {
      this.#timer = setTimeout(() => this.dismiss('timeout'), ms);
    }
  }

  #sync() {
    if (!this.#toast) return;
    const variant = this.getAttribute('variant') || 'info';
    this.#icon.setAttribute('name', VARIANT_ICONS[variant] || 'info');
    this.#titleEl.textContent = this.getAttribute('title') || '';
  }
}

if (!customElements.get('ui-toast')) {
  customElements.define('ui-toast', UiToast);
}
