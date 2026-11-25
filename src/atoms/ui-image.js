const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .frame {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius-md);
      background: var(--color-skeleton);
    }

    :host([ratio="square"]) .frame {
      aspect-ratio: var(--ratio-square);
    }

    :host([ratio="photo"]) .frame {
      aspect-ratio: var(--ratio-photo);
    }

    :host([ratio="classic"]) .frame {
      aspect-ratio: var(--ratio-classic);
    }

    :host([ratio="video"]) .frame {
      aspect-ratio: var(--ratio-video);
    }

    :host([ratio="wide"]) .frame {
      aspect-ratio: var(--ratio-wide);
    }

    :host([ratio="poster"]) .frame {
      aspect-ratio: var(--ratio-poster);
    }

    :host([ratio="portrait"]) .frame {
      aspect-ratio: var(--ratio-portrait);
    }

    :host([radius="none"]) .frame {
      border-radius: 0;
    }

    :host([radius="sm"]) .frame {
      border-radius: var(--radius-sm);
    }

    :host([radius="lg"]) .frame {
      border-radius: var(--radius-lg);
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    :host([fit="contain"]) img {
      object-fit: contain;
    }

    img[hidden] {
      display: none;
    }

    .fallback {
      display: grid;
      place-items: center;
      min-height: var(--size-thumbnail-md);
      height: 100%;
      padding: var(--inset-sm);
      box-sizing: border-box;
      font: var(--type-caption);
      text-align: center;
      color: var(--color-fg-muted);
    }

    .fallback[hidden] {
      display: none;
    }
  </style>
  <div class="frame" part="frame">
    <img part="image" />
    <span class="fallback" part="fallback" hidden></span>
  </div>
`;

/**
 * Image Atom with an aspect ratio and a text fallback.
 */
export class UiImage extends HTMLElement {
  static observedAttributes = ['src', 'alt', 'loading'];

  #img;
  #fallback;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#img = shadow.querySelector('img');
    this.#fallback = shadow.querySelector('.fallback');
    this.#img.addEventListener('error', () => this.#show(false));
    this.#img.addEventListener('load', () => this.#show(true));
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback(name) {
    this.#sync(name);
  }

  #show(ok) {
    this.#img.hidden = !ok;
    this.#fallback.hidden = ok;
  }

  #sync() {
    const alt = this.getAttribute('alt') ?? '';
    this.#img.alt = alt;
    this.#fallback.textContent = alt;
    this.#img.loading = this.getAttribute('loading') === 'eager' ? 'eager' : 'lazy';
    const src = this.getAttribute('src');
    if (src === this.#img.getAttribute('src')) {
      if (!src) this.#show(false);
      return;
    }
    if (src) {
      this.#show(true);
      this.#img.setAttribute('src', src);
    } else {
      this.#img.removeAttribute('src');
      this.#show(false);
    }
  }
}

if (!customElements.get('ui-image')) {
  customElements.define('ui-image', UiImage);
}
