const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    :host([hidden]) {
      display: none;
    }

    .avatar {
      display: grid;
      place-items: center;
      overflow: hidden;
      width: var(--size-avatar-md);
      height: var(--size-avatar-md);
      border-radius: var(--radius-full);
      background: var(--color-accent-subtle);
      color: var(--color-accent-text);
      font: var(--type-caption);
      font-weight: var(--weight-semibold);
    }

    :host([size="xs"]) .avatar {
      width: var(--size-avatar-xs);
      height: var(--size-avatar-xs);
    }

    :host([size="sm"]) .avatar {
      width: var(--size-avatar-sm);
      height: var(--size-avatar-sm);
    }

    :host([size="lg"]) .avatar {
      width: var(--size-avatar-lg);
      height: var(--size-avatar-lg);
    }

    :host([size="xl"]) .avatar {
      width: var(--size-avatar-xl);
      height: var(--size-avatar-xl);
    }

    :host([size="xs"]) .avatar {
      font-size: var(--text-2xs);
    }

    :host([size="xl"]) .avatar {
      font-size: var(--text-xl);
    }

    :host([shape="square"]) .avatar {
      border-radius: var(--radius-control);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    img[hidden], .initials[hidden] {
      display: none;
    }
  </style>
  <span class="avatar" part="avatar" role="img">
    <img part="image" alt="" hidden />
    <span class="initials" part="initials" aria-hidden="true"></span>
  </span>
`;

/**
 * Avatar Atom: a picture, or initials when there is none.
 */
export class UiAvatar extends HTMLElement {
  static observedAttributes = ['src', 'name'];

  #img;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#img = shadow.querySelector('img');
    this.#img.addEventListener('error', () => this.#show(false));
    this.#img.addEventListener('load', () => this.#show(true));
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #show(ok) {
    this.#img.hidden = !ok;
    this.shadowRoot.querySelector('.initials').hidden = ok;
  }

  #sync() {
    const name = (this.getAttribute('name') || '').trim();
    const words = name.split(/\s+/).filter(Boolean);
    const initials = words.length > 1 ? [words[0], words.at(-1)] : words;
    this.shadowRoot.querySelector('.initials').textContent = initials.map((w) => [...w][0].toUpperCase()).join('');
    this.shadowRoot.querySelector('.avatar').setAttribute('aria-label', name || 'Avatar');
    const src = this.getAttribute('src');
    if (src === this.#img.getAttribute('src')) return;
    this.#show(false);
    if (src) this.#img.setAttribute('src', src);
    else this.#img.removeAttribute('src');
  }
}

if (!customElements.get('ui-avatar')) {
  customElements.define('ui-avatar', UiAvatar);
}
