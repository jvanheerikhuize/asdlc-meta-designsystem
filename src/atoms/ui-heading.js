const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .heading {
      margin: 0;
      font: var(--type-h2);
      letter-spacing: var(--tracking-heading);
      color: var(--color-heading);
      text-wrap: balance;
    }

    :host([level="1"]) .heading {
      font: var(--type-h1);
    }

    :host([level="3"]) .heading {
      font: var(--type-h3);
    }

    :host(:is([level="4"], [level="5"], [level="6"])) .heading {
      font: var(--type-h4);
    }

    :host([size="display"]) .heading {
      font: var(--type-display);
    }

    :host([size="h1"]) .heading {
      font: var(--type-h1);
    }

    :host([size="h2"]) .heading {
      font: var(--type-h2);
    }

    :host([size="h3"]) .heading {
      font: var(--type-h3);
    }

    :host([size="h4"]) .heading {
      font: var(--type-h4);
    }

    :host([size="h5"]) .heading {
      font: var(--type-h5);
    }

    :host([tone="secondary"]) .heading {
      color: var(--color-fg-secondary);
    }

    :host([tone="muted"]) .heading {
      color: var(--color-fg-muted);
    }

    :host([tone="accent"]) .heading {
      color: var(--color-accent);
    }

    :host([tone="info"]) .heading {
      color: var(--color-info);
    }

    :host([tone="success"]) .heading {
      color: var(--color-success);
    }

    :host([tone="warning"]) .heading {
      color: var(--color-warning);
    }

    :host([tone="danger"]) .heading {
      color: var(--color-danger);
    }

    :host([tone="inverse"]) .heading {
      color: var(--color-fg-inverse);
    }
  </style>
  <h2 class="heading" part="heading"><slot></slot></h2>
`;

/**
 * Heading Atom: a native heading whose level and visual size are independent.
 */
export class UiHeading extends HTMLElement {
  static observedAttributes = ['level'];

  #heading;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#heading = shadow.querySelector('.heading');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const level = Math.min(6, Math.max(1, parseInt(this.getAttribute('level'), 10) || 2));
    if (this.#heading.localName === `h${level}`) return;
    const next = document.createElement(`h${level}`);
    next.className = 'heading';
    next.setAttribute('part', 'heading');
    next.append(document.createElement('slot'));
    this.#heading.replaceWith(next);
    this.#heading = next;
  }
}

if (!customElements.get('ui-heading')) {
  customElements.define('ui-heading', UiHeading);
}
