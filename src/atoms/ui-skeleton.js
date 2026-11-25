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
      gap: var(--space-2);
    }

    .bone {
      position: relative;
      overflow: hidden;
      background: var(--color-card);
      border: var(--border-width) solid var(--color-border);
      border-radius: var(--radius-md);
      width: var(--_sk-width, 100%);
      height: var(--_sk-height, var(--space-4));
    }

    :host([variant="circle"]) .bone {
      border-radius: var(--radius-full);
      width: var(--_sk-width, var(--space-10));
      height: var(--_sk-height, var(--space-10));
    }

    :host([variant="rect"]) .bone {
      height: var(--_sk-height, var(--size-skeleton));
    }

    .bone::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: var(--gradient-shimmer);
      animation: ui-shimmer var(--duration-shimmer) infinite;
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
