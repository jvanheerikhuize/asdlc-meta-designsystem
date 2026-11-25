const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    div {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: radial-gradient(60% 60% at 50% 0%, var(--glow-rose), transparent 70%);
    }

    :host([tone="amber"]) div {
      background: radial-gradient(60% 60% at 50% 0%, var(--glow-amber), transparent 70%);
    }

    :host([tone="sky"]) div {
      background: radial-gradient(60% 60% at 50% 0%, var(--glow-sky), transparent 70%);
    }

    :host([tone="emerald"]) div {
      background: radial-gradient(60% 60% at 50% 0%, var(--glow-emerald), transparent 70%);
    }

    :host([tone="violet"]) div {
      background: radial-gradient(60% 60% at 50% 0%, var(--glow-violet), transparent 70%);
    }
  </style>
  <div part="glow" aria-hidden="true"></div>
`;

/**
 * Decorative glow Atom.
 */
export class UiGlow extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-glow')) {
  customElements.define('ui-glow', UiGlow);
}
