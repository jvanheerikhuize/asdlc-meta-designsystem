const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    video {
      display: block;
      width: 100%;
      aspect-ratio: var(--ratio-video);
      border-radius: var(--radius-card);
      background: var(--color-surface-sunken);
    }

    video:focus-visible {
      outline: var(--focus-width) solid var(--color-focus-ring);
      outline-offset: var(--focus-offset);
    }
  </style>
  <video part="video" controls preload="metadata"></video>
`;

/**
 * Video Atom with native controls and captions.
 */
export class UiVideo extends HTMLElement {
  static observedAttributes = ['src', 'poster', 'captions', 'captions-lang', 'loop', 'muted', 'aria-label'];

  #media;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#media = shadow.querySelector('video');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  play() {
    return this.#media.play();
  }

  pause() {
    this.#media.pause();
  }

  #sync() {
    for (const name of ['src', 'poster', 'aria-label']) {
      if (this.hasAttribute(name)) this.#media.setAttribute(name, this.getAttribute(name));
      else this.#media.removeAttribute(name);
    }
    this.#media.loop = this.hasAttribute('loop');
    this.#media.muted = this.hasAttribute('muted');
    this.#media.querySelector('track')?.remove();
    if (this.hasAttribute('captions')) {
      const track = document.createElement('track');
      track.kind = 'captions';
      track.src = this.getAttribute('captions');
      track.srclang = this.getAttribute('captions-lang') || document.documentElement.lang || 'en';
      track.default = true;
      this.#media.append(track);
    }
  }
}

if (!customElements.get('ui-video')) {
  customElements.define('ui-video', UiVideo);
}
