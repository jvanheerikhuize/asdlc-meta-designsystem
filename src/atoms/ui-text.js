const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .text {
      margin: 0;
      font: var(--type-body);
      color: var(--color-fg);
    }

    :host([inline]) {
      display: inline;
    }

    :host([variant="lead"]) .text {
      font: var(--type-lead);
    }

    :host([variant="strong"]) .text {
      font: var(--type-body-strong);
    }

    :host([variant="small"]) .text {
      font: var(--type-small);
    }

    :host([variant="label"]) .text {
      font: var(--type-label);
    }

    :host([variant="caption"]) .text {
      font: var(--type-caption);
    }

    :host([variant="overline"]) .text {
      font: var(--type-overline);
      letter-spacing: var(--tracking-caps);
      text-transform: uppercase;
    }

    :host([variant="stat"]) .text {
      font: var(--type-stat);
      font-variant-numeric: var(--numeric-tabular);
    }

    :host([tone="secondary"]) .text {
      color: var(--color-fg-secondary);
    }

    :host([tone="muted"]) .text {
      color: var(--color-fg-muted);
    }

    :host([tone="accent"]) .text {
      color: var(--color-accent);
    }

    :host([tone="info"]) .text {
      color: var(--color-info);
    }

    :host([tone="success"]) .text {
      color: var(--color-success);
    }

    :host([tone="warning"]) .text {
      color: var(--color-warning);
    }

    :host([tone="danger"]) .text {
      color: var(--color-danger);
    }

    :host([tone="inverse"]) .text {
      color: var(--color-fg-inverse);
    }

    :host([align="center"]) .text {
      text-align: center;
    }

    :host([align="end"]) .text {
      text-align: end;
    }

    :host([truncate]) .text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host([lines]) .text {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: var(--_lines, 2);
      overflow: hidden;
    }
  </style>
  <p class="text" part="text"><slot></slot></p>
`;

/**
 * Text Atom: a paragraph or inline run in one of the text styles.
 */
export class UiText extends HTMLElement {
  static observedAttributes = ['inline', 'lines'];

  #text;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#text = shadow.querySelector('.text');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const wanted = this.hasAttribute('inline') ? 'SPAN' : 'P';
    if (this.#text.tagName !== wanted) {
      const next = document.createElement(wanted);
      next.className = 'text';
      next.setAttribute('part', 'text');
      next.append(document.createElement('slot'));
      this.#text.replaceWith(next);
      this.#text = next;
    }
    const lines = parseInt(this.getAttribute('lines'), 10);
    if (lines > 0) this.style.setProperty('--_lines', String(lines));
    else this.style.removeProperty('--_lines');
  }
}

if (!customElements.get('ui-text')) {
  customElements.define('ui-text', UiText);
}
