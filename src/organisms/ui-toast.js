import '../molecules/ui-callout.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      max-width: min(26rem, calc(100vw - 2rem));
    }

    :host(:not([open])) {
      display: none;
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
  <div role="region" aria-label="Notification">
    <ui-callout part="callout" elevation="lg" dismissible>
      <slot></slot>
    </ui-callout>
  </div>
`;

/**
 * Notification lifecycle Organism wrapping <ui-callout dismissible> with
 * auto-dismiss timer (paused on hover/focus) and polite screen-reader announcement.
 */
export class UiToast extends HTMLElement {
  static observedAttributes = ['variant', 'title', 'open', 'duration'];

  #callout;
  #liveEl;
  #timer = null;
  #paused = false;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#callout = shadow.querySelector('ui-callout');
    this.#liveEl = shadow.querySelector('.sr-live');

    this.#callout.addEventListener('ui-dismiss', () => this.dismiss('dismiss-button'));
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
    if (!this.#callout) return;
    this.#callout.setAttribute('variant', this.getAttribute('variant') || 'info');
    this.#callout.setAttribute('title', this.getAttribute('title') || '');
  }
}

if (!customElements.get('ui-toast')) {
  customElements.define('ui-toast', UiToast);
}
