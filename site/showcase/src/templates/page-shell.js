const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1;
      width: 100%;
      max-width: 1120px;
      margin: 0 auto;
      padding: var(--space-8, 2rem) var(--space-6, 1.5rem) var(--space-12, 3rem);
      display: flex;
      flex-direction: column;
      gap: var(--space-10, 2.5rem);
      box-sizing: border-box;
    }

    footer {
      border-top: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      padding: var(--space-6, 1.5rem);
      text-align: center;
      color: var(--color-fg-muted, #8e8e98);
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
    }
  </style>
  <slot name="header"></slot>
  <main part="main">
    <slot></slot>
  </main>
  <footer part="footer">
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
  }
}

if (!customElements.get('page-shell')) {
  customElements.define('page-shell', PageShell);
}
