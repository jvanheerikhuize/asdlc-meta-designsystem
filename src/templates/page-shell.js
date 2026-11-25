const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    :host([hidden]) {
      display: none;
    }

    main {
      flex: 1;
      width: 100%;
      max-width: var(--layout-content);
      margin: 0 auto;
      padding: var(--space-8) var(--space-6) var(--space-12);
      display: flex;
      flex-direction: column;
      gap: var(--space-10);
      box-sizing: border-box;
    }

    footer {
      border-top: var(--border-width) solid var(--color-border);
      padding: var(--space-6);
      text-align: center;
      color: var(--color-fg-muted);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
    }

    footer[hidden] {
      display: none;
    }

    @media (max-width: 640px) {
      main {
        padding: var(--space-6) var(--space-4) var(--space-8);
        gap: var(--space-8);
      }

      footer {
        padding: var(--space-4);
      }
    }
  </style>
  <slot name="header"></slot>
  <main part="main">
    <slot></slot>
  </main>
  <footer part="footer" hidden>
    <slot name="footer"></slot>
  </footer>
`;

/**
 * Page shell Template providing sticky header, centered main container, and footer slots.
 */
export class PageShell extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    const slot = shadow.querySelector('slot[name="footer"]');
    slot.addEventListener('slotchange', () => {
      slot.parentElement.hidden = slot.assignedNodes().length === 0;
    });
  }
}

if (!customElements.get('page-shell')) {
  customElements.define('page-shell', PageShell);
}
