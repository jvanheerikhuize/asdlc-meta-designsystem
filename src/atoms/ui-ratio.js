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
      aspect-ratio: var(--ratio-video);
      overflow: hidden;
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

    ::slotted(*) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
  <div class="frame" part="frame"><slot></slot></div>
`;

/**
 * Aspect ratio Atom that keeps its content in proportion.
 */
export class UiRatio extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-ratio')) {
  customElements.define('ui-ratio', UiRatio);
}
