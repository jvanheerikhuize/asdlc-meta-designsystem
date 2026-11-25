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
      border: var(--line-default);
      border-radius: var(--radius-card);
      overflow: hidden;
      aspect-ratio: var(--ratio-video);
      background: var(--color-surface-sunken);
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

    iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
    }
  </style>
  <div class="frame" part="frame"><iframe part="embed" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
`;

/**
 * Embedded page Atom, sandboxed by default.
 */
export class UiEmbed extends HTMLElement {
  static observedAttributes = ['src', 'label', 'sandbox'];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const frame = this.shadowRoot.querySelector('iframe');
    frame.title = this.getAttribute('label') || 'Embedded content';
    frame.setAttribute('sandbox', this.getAttribute('sandbox') ?? 'allow-scripts');
    let src = null;
    try {
      const url = new URL(this.getAttribute('src') ?? '', document.baseURI);
      if (this.hasAttribute('src') && ['http:', 'https:'].includes(url.protocol)) src = url.href;
    } catch { /* not a URL */ }
    if (src === null) frame.removeAttribute('src');
    else if (frame.src !== src) frame.src = src;
  }
}

if (!customElements.get('ui-embed')) {
  customElements.define('ui-embed', UiEmbed);
}
