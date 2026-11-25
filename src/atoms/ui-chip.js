const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    :host([hidden]) {
      display: none;
    }

    button {
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      line-height: var(--leading-none);
      padding: var(--pad-chip);
      border-radius: var(--radius-full);
      border: var(--border-width) solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-fg-secondary);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      transition:
        background-color var(--duration-fast) var(--ease-standard),
        border-color var(--duration-fast) var(--ease-standard),
        color var(--duration-fast) var(--ease-standard);
    }

    button:hover:not(:disabled) {
      color: var(--color-fg);
      border-color: var(--color-border-hover);
    }

    :host([pressed]) button {
      background: var(--color-fg);
      color: var(--color-bg);
      border-color: var(--color-fg);
    }

    :host([variant="accent"]) button {
      color: var(--color-accent);
      border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
    }

    :host([variant="accent"][pressed]) button {
      background: var(--color-accent);
      color: var(--color-accent-fg);
      border-color: var(--color-accent);
    }

    button:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    :host([disabled]) button {
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      button { transition: none; }
    }
  </style>
  <button part="chip" type="button" aria-pressed="false"><slot></slot></button>
`;

/**
 * Toggleable filter chip Atom with `pressed` state (`aria-pressed`) and `ui-toggle` event.
 */
export class UiChip extends HTMLElement {
  static observedAttributes = ['pressed', 'disabled', 'variant'];

  #btn;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#btn = shadow.querySelector('button');

    this.#btn.addEventListener('click', () => {
      if (this.disabled) return;
      this.pressed = !this.pressed;
      this.dispatchEvent(new CustomEvent('ui-toggle', {
        bubbles: true,
        composed: true,
        detail: { pressed: this.pressed },
      }));
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get pressed() {
    return this.hasAttribute('pressed');
  }

  set pressed(val) {
    this.toggleAttribute('pressed', Boolean(val));
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  #sync() {
    if (!this.#btn) return;
    this.#btn.disabled = this.disabled;
    this.#btn.setAttribute('aria-pressed', String(this.pressed));
  }
}

if (!customElements.get('ui-chip')) {
  customElements.define('ui-chip', UiChip);
}
