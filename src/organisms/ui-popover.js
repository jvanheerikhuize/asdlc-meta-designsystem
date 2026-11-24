import '../atoms/ui-surface.js';

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

    .panel {
      box-sizing: border-box;
      min-width: 12rem;
      max-width: min(22rem, calc(100vw - 1.5rem));
      border: 0;
      padding: 0;
      background: transparent;
    }

    .panel[popover] {
      position: fixed;
      inset: auto;
      margin: 0;
    }

    .panel[popover]:not(:popover-open) {
      display: none;
    }

    .panel:not([popover])[hidden] {
      display: none;
    }
  </style>
  <span class="trigger-wrap" part="trigger">
    <slot name="trigger"></slot>
  </span>
  <div class="panel" part="panel" popover="auto">
    <ui-surface variant="base" elevation="lg" radius="lg" padding="sm">
      <slot></slot>
    </ui-surface>
  </div>
`;

/**
 * Viewport-aware anchored flyout Organism composing <ui-surface> inside native
 * Top Layer `popover="auto"` with collision flipping and `aria-expanded` sync.
 */
export class UiPopover extends HTMLElement {
  static observedAttributes = ['open', 'placement', 'aria-label'];

  #triggerSlot;
  #triggerWrap;
  #panel;
  #supportsPopover;
  #notifiedOpen = false;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#triggerSlot = shadow.querySelector('slot[name="trigger"]');
    this.#triggerWrap = shadow.querySelector('.trigger-wrap');
    this.#panel = shadow.querySelector('.panel');
    this.#supportsPopover = typeof this.#panel.showPopover === 'function';

    if (!this.#supportsPopover) {
      this.#panel.removeAttribute('popover');
      this.#panel.hidden = true;
    }

    this.#triggerWrap.addEventListener('click', () => this.togglePopover());
    this.#triggerSlot.addEventListener('slotchange', () => this.#syncExpanded(this.hasAttribute('open')));

    if (this.#supportsPopover) {
      this.#panel.addEventListener('toggle', (event) => {
        const isOpen = event.newState === 'open';
        if (isOpen) {
          if (!this.hasAttribute('open')) this.setAttribute('open', '');
          this.#positionPanel();
          this.#syncExpanded(true);
          if (!this.#notifiedOpen) {
            this.#notifiedOpen = true;
            this.dispatchEvent(new CustomEvent('ui-open', { bubbles: true, composed: true }));
          }
        } else {
          if (this.hasAttribute('open')) this.removeAttribute('open');
          this.#syncExpanded(false);
          if (this.#notifiedOpen) {
            this.#notifiedOpen = false;
            this.dispatchEvent(new CustomEvent('ui-close', { bubbles: true, composed: true }));
          }
        }
      });
    }
  }

  connectedCallback() {
    this.#syncLabel();
    this.#syncExpanded(this.hasAttribute('open'));
    if (this.hasAttribute('open')) {
      this.openPopover();
    }
  }

  attributeChangedCallback(name) {
    if (name === 'aria-label') this.#syncLabel();
    if (name === 'open') {
      if (this.hasAttribute('open')) this.openPopover();
      else this.closePopover();
    }
  }

  openPopover() {
    if (!this.#panel) return;
    if (this.#supportsPopover) {
      if (!this.#panel.matches(':popover-open')) {
        this.#panel.showPopover();
      }
      if (!this.hasAttribute('open')) this.setAttribute('open', '');
      this.#positionPanel();
      this.#syncExpanded(true);
      if (!this.#notifiedOpen) {
        this.#notifiedOpen = true;
        this.dispatchEvent(new CustomEvent('ui-open', { bubbles: true, composed: true }));
      }
    } else if (this.#panel.hidden) {
      this.#panel.hidden = false;
      if (!this.hasAttribute('open')) this.setAttribute('open', '');
      this.#positionPanel();
      this.#syncExpanded(true);
      this.#notifiedOpen = true;
      this.dispatchEvent(new CustomEvent('ui-open', { bubbles: true, composed: true }));
    }
  }

  closePopover() {
    if (!this.#panel) return;
    if (this.#supportsPopover) {
      if (this.#panel.matches(':popover-open')) {
        this.#panel.hidePopover();
      }
      if (this.hasAttribute('open')) this.removeAttribute('open');
      this.#syncExpanded(false);
      if (this.#notifiedOpen) {
        this.#notifiedOpen = false;
        this.dispatchEvent(new CustomEvent('ui-close', { bubbles: true, composed: true }));
      }
    } else if (!this.#panel.hidden) {
      this.#panel.hidden = true;
      if (this.hasAttribute('open')) this.removeAttribute('open');
      this.#syncExpanded(false);
      this.#notifiedOpen = false;
      this.dispatchEvent(new CustomEvent('ui-close', { bubbles: true, composed: true }));
    }
  }

  togglePopover() {
    if (this.hasAttribute('open')) this.closePopover();
    else this.openPopover();
  }

  #positionPanel() {
    const triggerRect = this.#triggerWrap.getBoundingClientRect();
    const panelRect = this.#panel.getBoundingClientRect();
    const placement = this.getAttribute('placement') || 'bottom-start';
    const gap = 6;

    const preferTop = placement.startsWith('top');
    const fitsBelow = triggerRect.bottom + gap + panelRect.height <= window.innerHeight - 8;
    const fitsAbove = triggerRect.top - gap - panelRect.height >= 8;

    const placeAbove = preferTop ? (fitsAbove || !fitsBelow) : (!fitsBelow && fitsAbove);
    const top = placeAbove
      ? Math.max(8, triggerRect.top - gap - panelRect.height)
      : Math.min(window.innerHeight - panelRect.height - 8, triggerRect.bottom + gap);

    const preferEnd = placement.endsWith('end');
    const rawLeft = preferEnd ? triggerRect.right - panelRect.width : triggerRect.left;
    const left = Math.max(8, Math.min(rawLeft, window.innerWidth - panelRect.width - 8));

    this.#panel.style.top = `${Math.max(8, top)}px`;
    this.#panel.style.left = `${Math.max(8, left)}px`;
  }

  #syncExpanded(expanded) {
    const assigned = this.#triggerSlot?.assignedElements({ flatten: true }) || [];
    for (const el of assigned) {
      el.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  }

  #syncLabel() {
    if (!this.#panel) return;
    const label = this.getAttribute('aria-label');
    if (label) this.#panel.setAttribute('aria-label', label);
    else this.#panel.removeAttribute('aria-label');
  }
}

if (!customElements.get('ui-popover')) {
  customElements.define('ui-popover', UiPopover);
}
