const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .stack {
      display: flex;
      flex-direction: column;
      gap: var(--space-2, 0.5rem);
    }

    .bone {
      position: relative;
      overflow: hidden;
      background: var(--color-card, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      border-radius: var(--radius-md, 0.5rem);
      width: var(--_sk-width, 100%);
      height: var(--_sk-height, 1rem);
    }

    :host([variant="circle"]) .bone {
      border-radius: var(--radius-full, 9999px);
      width: var(--_sk-width, 2.5rem);
      height: var(--_sk-height, 2.5rem);
    }

    :host([variant="rect"]) .bone {
      height: var(--_sk-height, 5rem);
    }

    .bone::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        transparent,
        var(--color-card-hover, rgba(255, 255, 255, 0.07)),
        transparent
      );
      animation: ui-shimmer var(--duration-shimmer, 1400ms) infinite;
    }

    @keyframes ui-shimmer {
      100% {
        transform: translateX(100%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .bone::after {
        animation: none;
        display: none;
      }
    }
  </style>
  <div class="stack" part="skeleton" aria-hidden="true"></div>
`;

/**
 * Loading skeleton Atom with shimmer animation and reduced-motion static fallback.
 */
export class UiSkeleton extends HTMLElement {
  static observedAttributes = ['variant', 'width', 'height', 'lines'];

  #stack;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#stack = shadow.querySelector('.stack');
    this.setAttribute('aria-busy', 'true');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (!this.#stack) return;
    const width = this.getAttribute('width');
    const height = this.getAttribute('height');
    if (width) this.style.setProperty('--_sk-width', width);
    else this.style.removeProperty('--_sk-width');
    if (height) this.style.setProperty('--_sk-height', height);
    else this.style.removeProperty('--_sk-height');

    const variant = this.getAttribute('variant') || 'text';
    const count = variant === 'text'
      ? Math.max(1, Math.min(12, Number.parseInt(this.getAttribute('lines') || '1', 10) || 1))
      : 1;

    this.#stack.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const bone = document.createElement('div');
      bone.className = 'bone';
      if (count > 1 && i === count - 1) {
        bone.style.width = '72%';
      }
      this.#stack.appendChild(bone);
    }
  }
}

if (!customElements.get('ui-skeleton')) {
  customElements.define('ui-skeleton', UiSkeleton);
}
