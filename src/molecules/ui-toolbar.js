const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-flex;
    }

    :host([hidden]) {
      display: none;
    }

    .bar {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      gap: var(--space-1, 0.25rem);
      padding: var(--space-1, 0.25rem);
      border-radius: var(--radius-lg, 0.75rem);
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      background: var(--color-surface, #111116);
      box-sizing: border-box;
    }

    :host([variant="floating"]) .bar {
      background: color-mix(in srgb, var(--color-surface, #111116) 86%, transparent);
      backdrop-filter: blur(12px);
      border-color: var(--color-border-hover, rgba(255, 255, 255, 0.22));
      box-shadow: var(--shadow-md, 0 4px 14px rgba(0, 0, 0, 0.45));
    }

    :host([orientation="vertical"]) .bar {
      flex-direction: column;
    }

    ::slotted([role="separator"]) {
      align-self: stretch;
      border: 0;
      border-inline-start: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      margin: var(--space-1, 0.25rem);
    }

    :host([orientation="vertical"]) ::slotted([role="separator"]) {
      border-inline-start: 0;
      border-block-start: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
    }
  </style>
  <div class="bar" part="toolbar" role="toolbar" focusgroup="toolbar wrap">
    <slot></slot>
  </div>
`;

const INTERACTIVE_SELECTOR = 'ui-button, ui-chip, ui-switch, ui-select, button, [role="button"], a[href]';

/**
 * Accessible composite toolbar Molecule with single-tab-stop roving focus
 * (native focusgroup with automatic Arrow/Home/End roving tabindex fallback).
 */
export class UiToolbar extends HTMLElement {
  static observedAttributes = ['orientation', 'variant', 'aria-label', 'aria-controls'];

  #bar;
  #slot;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#bar = shadow.querySelector('.bar');
    this.#slot = shadow.querySelector('slot');

    if (!('focusGroup' in HTMLElement.prototype)) {
      this.#slot.addEventListener('slotchange', () => this.#initRovingTabindex());
      this.addEventListener('focusin', (event) => {
        const items = this.#items();
        const target = items.find((el) => el === event.target || el.contains(event.target));
        if (target) {
          for (const item of items) item.tabIndex = item === target ? 0 : -1;
        }
      });
      this.addEventListener('keydown', (event) => this.#handleKeyDown(event));
    }
  }

  connectedCallback() {
    this.#sync();
    if (!('focusGroup' in HTMLElement.prototype)) {
      this.#initRovingTabindex();
    }
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #items() {
    const assigned = this.#slot ? this.#slot.assignedElements({ flatten: true }) : [];
    const controls = [];
    for (const el of assigned) {
      if (el.matches(INTERACTIVE_SELECTOR)) {
        controls.push(el);
      } else {
        controls.push(...el.querySelectorAll(INTERACTIVE_SELECTOR));
      }
    }
    return controls.filter((el) => !el.hasAttribute('hidden') && !el.hasAttribute('disabled'));
  }

  #initRovingTabindex() {
    const items = this.#items();
    if (!items.length) return;
    const current = items.find((el) => el.tabIndex === 0) || items[0];
    for (const item of items) {
      item.tabIndex = item === current ? 0 : -1;
    }
  }

  #handleKeyDown(event) {
    const items = this.#items();
    if (!items.length) return;
    const vertical = this.getAttribute('orientation') === 'vertical';
    const rtl = getComputedStyle(this.#bar).direction === 'rtl';
    const steps = vertical
      ? { ArrowDown: 1, ArrowUp: -1 }
      : { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };

    let nextIndex = -1;
    const currentIndex = Math.max(0, items.findIndex((el) => el === event.target || el.contains(event.target)));
    if (event.key in steps) {
      nextIndex = (currentIndex + steps[event.key] + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    }
    if (nextIndex < 0) return;

    event.preventDefault();
    for (let i = 0; i < items.length; i += 1) {
      items[i].tabIndex = i === nextIndex ? 0 : -1;
    }
    items[nextIndex].focus();
    this.dispatchEvent(new CustomEvent('ui-navigate', {
      bubbles: true,
      composed: true,
      detail: { index: nextIndex },
    }));
  }

  #sync() {
    if (!this.#bar) return;
    const vertical = this.getAttribute('orientation') === 'vertical';
    this.#bar.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
    this.#bar.setAttribute('focusgroup', vertical ? 'toolbar wrap block' : 'toolbar wrap');
    const label = this.getAttribute('aria-label') || 'Toolbar';
    this.#bar.setAttribute('aria-label', label);
    const controls = this.getAttribute('aria-controls');
    if (controls) this.#bar.setAttribute('aria-controls', controls);
    else this.#bar.removeAttribute('aria-controls');
  }
}

if (!customElements.get('ui-toolbar')) {
  customElements.define('ui-toolbar', UiToolbar);
}
