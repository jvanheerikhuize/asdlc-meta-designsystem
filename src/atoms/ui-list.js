const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    ul, ol {
      margin: 0;
      padding-inline-start: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--stack-sm);
      font: var(--type-body);
      color: var(--color-fg);
    }

    :host([type="none"]) ul {
      list-style: none;
      padding-inline-start: 0;
    }

    :host([gap="xs"]) :is(ul, ol) {
      gap: var(--stack-xs);
    }

    :host([gap="md"]) :is(ul, ol) {
      gap: var(--stack-md);
    }

    ::slotted(li)::marker {
      color: var(--color-accent);
    }
  </style>
  <ul part="list" role="list"><slot></slot></ul>
`;

/**
 * List Atom around native list items.
 */
export class UiList extends HTMLElement {
  static observedAttributes = ['type'];

  #list;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#list = shadow.querySelector('ul');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const wanted = this.getAttribute('type') === 'number' ? 'ol' : 'ul';
    if (this.#list.localName === wanted) return;
    const next = document.createElement(wanted);
    next.setAttribute('part', 'list');
    next.setAttribute('role', 'list');
    next.append(document.createElement('slot'));
    this.#list.replaceWith(next);
    this.#list = next;
  }
}

if (!customElements.get('ui-list')) {
  customElements.define('ui-list', UiList);
}
