const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }

    :host([hidden]) {
      display: none;
    }

    .surface {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      display: block;
      background: var(--_bg, var(--color-surface, #111116));
      color: var(--color-fg, #ededed);
      border: 1px solid var(--_border, var(--color-border, rgba(255, 255, 255, 0.08)));
      border-radius: var(--_radius, var(--radius-lg, 0.75rem));
      padding: var(--_pad, 0);
      box-shadow: var(--_shadow, none);
      overflow: hidden;
      transition:
        background-color var(--duration-fast, 120ms) var(--ease-standard, ease),
        border-color var(--duration-fast, 120ms) var(--ease-standard, ease),
        transform var(--duration-fast, 120ms) var(--ease-standard, ease);
    }

    :host([variant="elevated"]) .surface { --_bg: var(--color-surface-elevated, #18181f); }
    :host([variant="card"]) .surface { --_bg: var(--color-card, rgba(255, 255, 255, 0.04)); }
    :host([variant="glass"]) .surface {
      --_bg: color-mix(in srgb, var(--color-surface, #111116) 84%, transparent);
      --_border: var(--color-border-hover, rgba(255, 255, 255, 0.22));
      backdrop-filter: blur(12px);
    }

    :host([elevation="sm"]) .surface { --_shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.35)); }
    :host([elevation="md"]) .surface { --_shadow: var(--shadow-md, 0 4px 14px rgba(0, 0, 0, 0.45)); }
    :host([elevation="lg"]) .surface { --_shadow: var(--shadow-lg, 0 12px 32px rgba(0, 0, 0, 0.6)); }

    :host([padding="none"]) .surface { --_pad: 0; }
    :host([padding="xs"]) .surface { --_pad: var(--space-1, 0.25rem); }
    :host([padding="sm"]) .surface { --_pad: var(--space-3, 0.75rem); }
    :host([padding="md"]) .surface { --_pad: var(--space-4, 1rem) var(--space-5, 1.25rem); }
    :host([padding="lg"]) .surface { --_pad: var(--space-5, 1.25rem); }

    :host([radius="none"]) .surface { --_radius: 0; border-inline: 0; }
    :host([radius="sm"]) .surface { --_radius: var(--radius-sm, 0.375rem); }
    :host([radius="md"]) .surface { --_radius: var(--radius-md, 0.5rem); }
    :host([radius="lg"]) .surface { --_radius: var(--radius-lg, 0.75rem); }
    :host([radius="xl"]) .surface { --_radius: var(--radius-xl, 1rem); }
    :host([radius="full"]) .surface { --_radius: var(--radius-full, 9999px); }

    :host([accent="info"]) .surface { border-inline-start: 4px solid var(--color-info, #38bdf8); }
    :host([accent="success"]) .surface { border-inline-start: 4px solid var(--color-success, #10b981); }
    :host([accent="warning"]) .surface { border-inline-start: 4px solid var(--color-warning, #f59e0b); }
    :host([accent="danger"]) .surface { border-inline-start: 4px solid var(--color-danger, #f87171); }
    :host([accent="accent"]) .surface { border-inline-start: 4px solid var(--color-accent, #f43f5e); }

    button.surface {
      appearance: none;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    button.surface:hover {
      background: var(--color-card-hover, rgba(255, 255, 255, 0.07));
      border-color: var(--color-border-hover, rgba(255, 255, 255, 0.22));
      transform: translateY(-2px);
    }

    button.surface:focus-visible {
      outline: 2px solid var(--color-focus-ring, #f43f5e);
      outline-offset: 2px;
      border-color: var(--color-focus-ring, #f43f5e);
    }

    @media (prefers-reduced-motion: reduce) {
      .surface { transition: none; }
      button.surface:hover { transform: none; }
    }
  </style>
  <div class="surface" part="surface"><slot></slot></div>
`;

/**
 * Foundational container Atom providing consistent surface backgrounds, borders,
 * radii, padding, elevation shadows, left-accent stripes, and interactive card states.
 */
export class UiSurface extends HTMLElement {
  static observedAttributes = ['variant', 'elevation', 'padding', 'radius', 'accent', 'interactive', 'aria-label'];

  #el;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#el = shadow.querySelector('.surface');
  }

  connectedCallback() {
    this.#syncElement();
  }

  attributeChangedCallback(name) {
    if (name === 'interactive' || name === 'aria-label') {
      this.#syncElement();
    }
  }

  #syncElement() {
    const wantButton = this.hasAttribute('interactive');
    const isButton = this.#el.tagName === 'BUTTON';
    if (wantButton !== isButton) {
      const next = document.createElement(wantButton ? 'button' : 'div');
      if (wantButton) next.type = 'button';
      next.className = 'surface';
      next.setAttribute('part', 'surface');
      next.innerHTML = '<slot></slot>';
      if (wantButton) {
        next.addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('ui-press', { bubbles: true, composed: true }));
        });
      }
      this.#el.replaceWith(next);
      this.#el = next;
    }
    const label = this.getAttribute('aria-label');
    if (label && this.#el.tagName === 'BUTTON') {
      this.#el.setAttribute('aria-label', label);
    } else {
      this.#el.removeAttribute('aria-label');
    }
  }
}

if (!customElements.get('ui-surface')) {
  customElements.define('ui-surface', UiSurface);
}
