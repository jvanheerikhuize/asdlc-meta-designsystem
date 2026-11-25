const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline;
    }

    :host([hidden]) {
      display: none;
    }

    mark {
      background: var(--color-highlight);
      color: inherit;
      border-radius: var(--radius-xs);
    }

    :host([active]) mark {
      background: var(--color-match-active);
      color: var(--color-match-active-fg);
    }
  </style>
  <mark part="mark"><slot></slot></mark>
`;

/**
 * Highlighted text Atom, such as a search match.
 */
export class UiMark extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-mark')) {
  customElements.define('ui-mark', UiMark);
}
