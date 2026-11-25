import '../atoms/ui-surface.js';

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
      gap: var(--space-1);
    }

    :host([orientation="vertical"]) .bar {
      flex-direction: column;
    }
  </style>
  <ui-surface variant="elevated" padding="xs" radius="lg">
    <div class="bar" part="toolbar" role="toolbar" focusgroup="toolbar wrap">
      <slot></slot>
    </div>
  </ui-surface>
`;

const INTERACTIVE_SELECTOR = 'ui-button, ui-chip, ui-switch, ui-select, button, [role="button"], a[href]';

/**
 * Accessible composite toolbar Molecule composing <ui-surface> with single-tab-stop
 * roving focus (native focusgroup with automatic Arrow/Home/End roving tabindex fallback).
 */
export class UiToolbar extends HTMLElement {
  static observedAttributes = ['orientation', 'variant', 'aria-label', 'aria-controls'];

  #surface;
  #bar;
  #slot;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#surface = shadow.querySelector('ui-surface');
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
    if (!this.#bar || !this.#surface) return;
    const floating = this.getAttribute('variant') === 'floating';
    this.#surface.setAttribute('variant', floating ? 'glass' : 'elevated');
    this.#surface.setAttribute('elevation', floating ? 'md' : 'none');

    const vertical = this.getAttribute('orientation') === 'vertical';
    this.#bar.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
    this.#bar.setAttribute('focusgroup', vertical ? 'toolbar wrap block' : 'toolbar wrap');
    this.#bar.setAttribute('aria-label', this.getAttribute('aria-label') || 'Toolbar');
    const controls = this.getAttribute('aria-controls');
    if (controls) this.#bar.setAttribute('aria-controls', controls);
    else this.#bar.removeAttribute('aria-controls');
  }
}

if (!customElements.get('ui-toolbar')) {
  customElements.define('ui-toolbar', UiToolbar);
}
