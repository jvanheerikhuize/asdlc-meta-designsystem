// Only destinations that cannot run code in this page.
function safeHref(value) {
  if (value === null) return null;
  try {
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(new URL(value, document.baseURI).protocol) ? value : null;
  } catch {
    return null;
  }
}

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    a {
      display: inline-flex;
      align-items: center;
      gap: var(--cluster-xs);
      padding: var(--pad-cell);
      font: var(--type-label);
      color: var(--color-fg-secondary);
      text-decoration: none;
      border-radius: var(--radius-control);
      transition: var(--transition-colors);
    }

    a[href]:hover {
      color: var(--color-fg);
      background: var(--color-card-hover);
    }

    a:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    :host([current]) a {
      color: var(--color-fg);
      background: var(--color-selected);
    }
  </style>
  <a part="link"><slot></slot></a>
`;

/**
 * Navigation link Atom with a current state.
 */
export class UiNavLink extends HTMLElement {
  static observedAttributes = ['href', 'current', 'aria-label'];

  #link;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#link = shadow.querySelector('a');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    for (const name of ['aria-label']) {
      if (this.hasAttribute(name)) this.#link.setAttribute(name, this.getAttribute(name));
      else this.#link.removeAttribute(name);
    }
    const href = safeHref(this.getAttribute('href'));
    if (href === null) this.#link.removeAttribute('href');
    else this.#link.setAttribute('href', href);
    if (this.hasAttribute('current')) this.#link.setAttribute('aria-current', 'page');
    else this.#link.removeAttribute('aria-current');
  }
}

if (!customElements.get('ui-nav-link')) {
  customElements.define('ui-nav-link', UiNavLink);
}
