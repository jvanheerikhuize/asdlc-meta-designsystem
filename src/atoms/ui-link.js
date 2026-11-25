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
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }

    a {
      color: var(--color-link);
      text-decoration: underline;
      text-underline-offset: var(--underline-offset);
      text-decoration-thickness: var(--underline-thickness);
      border-radius: var(--radius-xs);
      transition: var(--transition-colors);
    }

    a[href]:visited {
      color: var(--color-link-visited);
    }

    a[href]:hover {
      color: var(--color-link-hover);
    }

    a:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }

    :host([variant="quiet"]) a {
      color: inherit;
      text-decoration: none;
    }

    :host([variant="quiet"]) a[href]:hover {
      text-decoration: underline;
    }

    :host([variant="standalone"]) a {
      font: var(--type-label);
      text-decoration: none;
    }
  </style>
  <a part="link"><slot></slot></a>
`;

/**
 * Link Atom: a native anchor. External links get a safe rel.
 */
export class UiLink extends HTMLElement {
  static observedAttributes = ['href', 'target', 'rel', 'download', 'aria-label'];

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
    for (const name of ['target', 'rel', 'download', 'aria-label']) {
      if (this.hasAttribute(name)) this.#link.setAttribute(name, this.getAttribute(name));
      else this.#link.removeAttribute(name);
    }
    const href = safeHref(this.getAttribute('href'));
    if (href === null) this.#link.removeAttribute('href');
    else this.#link.setAttribute('href', href);
    if (this.getAttribute('target') === '_blank' && !this.hasAttribute('rel')) this.#link.rel = 'noopener';
  }
}

if (!customElements.get('ui-link')) {
  customElements.define('ui-link', UiLink);
}
