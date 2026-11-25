const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .handle {
      box-sizing: border-box;
      display: grid;
      place-content: center;
      width: var(--target-min);
      height: 100%;
      min-height: var(--size-handle);
      border-radius: var(--radius-sm);
      cursor: var(--cursor-resize-x);
      touch-action: var(--touch-none);
    }

    .handle::after {
      content: '';
      width: var(--space-1);
      height: var(--size-handle);
      border-radius: var(--radius-full);
      background: var(--color-border-strong);
      transition: var(--transition-colors);
    }

    .handle:hover::after {
      background: var(--color-accent);
    }

    .handle:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    :host([orientation="horizontal"]) .handle {
      width: 100%;
      height: var(--target-min);
      min-height: 0;
      cursor: var(--cursor-resize-y);
    }

    :host([orientation="horizontal"]) .handle::after {
      width: var(--size-handle);
      height: var(--space-1);
    }

    :host([disabled]) .handle {
      opacity: var(--opacity-disabled);
      cursor: var(--cursor-disabled);
    }
  </style>
  <div class="handle" part="handle" role="separator" tabindex="0"></div>
`;

/**
 * Drag handle Atom for resizing or sorting. It reports movement; the owner applies it.
 */
export class UiHandle extends HTMLElement {
  static observedAttributes = ['orientation', 'value', 'min', 'max', 'disabled', 'aria-label'];

  #handle;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#handle = shadow.querySelector('.handle');
    this.#handle.addEventListener('pointerdown', (event) => {
      if (this.hasAttribute('disabled') || event.button !== 0) return;
      this.#handle.setPointerCapture(event.pointerId);
      let { clientX, clientY } = event;
      const move = (e) => {
        this.#report(e.clientX - clientX, e.clientY - clientY, 'pointer');
        ({ clientX, clientY } = e);
      };
      const end = () => {
        this.#handle.removeEventListener('pointermove', move);
        this.#handle.removeEventListener('lostpointercapture', end);
      };
      this.#handle.addEventListener('pointermove', move);
      this.#handle.addEventListener('lostpointercapture', end);
    });
    this.#handle.addEventListener('keydown', (event) => {
      const step = parseFloat(getComputedStyle(this).getPropertyValue('--travel-step')) || 8;
      const [dx, dy] = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key] ?? [0, 0];
      if (this.hasAttribute('disabled') || (!dx && !dy)) return;
      event.preventDefault();
      this.#report(dx, dy, 'keyboard');
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #report(dx, dy, source) {
    if (dx || dy) this.dispatchEvent(new CustomEvent('ui-move', { bubbles: true, composed: true, detail: { dx, dy, source } }));
  }

  #sync() {
    for (const [name, aria] of [['value', 'aria-valuenow'], ['min', 'aria-valuemin'], ['max', 'aria-valuemax']]) {
      if (this.hasAttribute(name)) this.#handle.setAttribute(aria, this.getAttribute(name));
      else this.#handle.removeAttribute(aria);
    }
    this.#handle.setAttribute('aria-label', this.getAttribute('aria-label') || 'Resize');
    this.#handle.setAttribute('aria-orientation', this.getAttribute('orientation') === 'horizontal' ? 'horizontal' : 'vertical');
    this.#handle.setAttribute('aria-disabled', String(this.hasAttribute('disabled')));
    this.#handle.tabIndex = this.hasAttribute('disabled') ? -1 : 0;
  }
}

if (!customElements.get('ui-handle')) {
  customElements.define('ui-handle', UiHandle);
}
