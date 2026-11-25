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
      position: fixed;
      inset: auto;
      margin: 0;
      box-sizing: border-box;
      z-index: 60;
      max-width: min(16rem, calc(100vw - 1rem));
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

    @media (prefers-reduced-motion: reduce) {
      .bubble {
        transition: none;
      }
    }
  </style>
  <slot></slot>
  <span class="bubble" part="tooltip" role="tooltip" popover="manual"></span>
`;

/**
 * Accessible tooltip Atom satisfying WCAG 1.4.13 (dismissible via Escape,
 * hoverable over tooltip content, persistent while focused or hovered). The bubble
 * lives in the Top Layer, so ancestors that clip their content do not cut it off.
 */
export class UiTooltip extends HTMLElement {
  static observedAttributes = ['text', 'placement', 'open'];

  #bubble;
  #hideTimer = null;
  #tracking = false;
  #position = () => this.#place();
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
    if (typeof this.#bubble.showPopover !== 'function') this.#bubble.removeAttribute('popover');

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
    this.#track(false);
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
    if (!this.isConnected) return;
    const open = this.hasAttribute('open');
    if (this.#bubble.hasAttribute('popover') && this.#bubble.matches(':popover-open') !== open) {
      if (open) this.#bubble.showPopover();
      else this.#bubble.hidePopover();
    }
    this.#track(open);
    if (open) this.#place();
  }

  #track(on) {
    if (on === this.#tracking) return;
    this.#tracking = on;
    const method = on ? 'addEventListener' : 'removeEventListener';
    window[method]('scroll', this.#position, { capture: true, passive: true });
    window[method]('resize', this.#position);
  }

  #place() {
    const gap = 6;
    const edge = 8;
    const host = this.getBoundingClientRect();
    const { width, height } = this.#bubble.getBoundingClientRect();
    const fits = {
      top: host.top - gap - height >= edge,
      bottom: host.bottom + gap + height <= window.innerHeight - edge,
      left: host.left - gap - width >= edge,
      right: host.right + gap + width <= window.innerWidth - edge,
    };
    const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    let side = this.getAttribute('placement');
    if (!(side in opposite)) side = 'top';
    if (!fits[side] && fits[opposite[side]]) side = opposite[side];

    let left = host.left + (host.width - width) / 2;
    let top = host.top + (host.height - height) / 2;
    if (side === 'top') top = host.top - gap - height;
    if (side === 'bottom') top = host.bottom + gap;
    if (side === 'left') left = host.left - gap - width;
    if (side === 'right') left = host.right + gap;
    left = Math.max(edge, Math.min(left, window.innerWidth - width - edge));
    top = Math.max(edge, Math.min(top, window.innerHeight - height - edge));
    this.#bubble.style.left = `${left}px`;
    this.#bubble.style.top = `${top}px`;
  }
}

if (!customElements.get('ui-tooltip')) {
  customElements.define('ui-tooltip', UiTooltip);
}
