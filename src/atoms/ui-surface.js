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
      background: var(--_bg, var(--color-surface));
      color: var(--color-fg);
      border: var(--border-width) solid var(--_border, var(--color-border));
      border-radius: var(--_radius, var(--radius-lg));
      padding: var(--_pad, 0);
      box-shadow: var(--_shadow, none);
      overflow: hidden;
      transition:
        background-color var(--duration-fast) var(--ease-standard),
        border-color var(--duration-fast) var(--ease-standard),
        transform var(--duration-fast) var(--ease-standard);
    }

    :host([variant="elevated"]) .surface { --_bg: var(--color-surface-elevated); }
    :host([variant="card"]) .surface { --_bg: var(--color-card); }
    :host([variant="glass"]) .surface {
      --_bg: color-mix(in srgb, var(--color-surface) 84%, transparent);
      --_border: var(--color-border-hover);
      backdrop-filter: blur(var(--frost-md));
    }

    :host([elevation="sm"]) .surface { --_shadow: var(--shadow-sm); }
    :host([elevation="md"]) .surface { --_shadow: var(--shadow-md); }
    :host([elevation="lg"]) .surface { --_shadow: var(--shadow-lg); }

    :host([padding="none"]) .surface { --_pad: 0; }
    :host([padding="xs"]) .surface { --_pad: var(--space-1); }
    :host([padding="sm"]) .surface { --_pad: var(--space-3); }
    :host([padding="md"]) .surface { --_pad: var(--space-4) var(--space-5); }
    :host([padding="lg"]) .surface { --_pad: var(--space-5); }

    :host([radius="none"]) .surface { --_radius: 0; border-inline: 0; }
    :host([radius="sm"]) .surface { --_radius: var(--radius-sm); }
    :host([radius="md"]) .surface { --_radius: var(--radius-md); }
    :host([radius="lg"]) .surface { --_radius: var(--radius-lg); }
    :host([radius="xl"]) .surface { --_radius: var(--radius-xl); }
    :host([radius="full"]) .surface { --_radius: var(--radius-full); }

    :host([accent="info"]) .surface { border-inline-start: var(--border-width-accent) solid var(--color-info); }
    :host([accent="success"]) .surface { border-inline-start: var(--border-width-accent) solid var(--color-success); }
    :host([accent="warning"]) .surface { border-inline-start: var(--border-width-accent) solid var(--color-warning); }
    :host([accent="danger"]) .surface { border-inline-start: var(--border-width-accent) solid var(--color-danger); }
    :host([accent="accent"]) .surface { border-inline-start: var(--border-width-accent) solid var(--color-accent); }

    button.surface {
      appearance: none;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    button.surface:hover {
      background: var(--color-card-hover);
      border-color: var(--color-border-hover);
      transform: translateY(calc(-1 * var(--space-0-5)));
    }

    button.surface:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
      border-color: var(--color-focus-ring);
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
