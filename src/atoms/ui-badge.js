const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    :host([hidden]) {
      display: none;
    }

    span {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      line-height: var(--leading-none);
      letter-spacing: var(--tracking-label);
      padding: var(--pad-badge-sm);
      border-radius: var(--radius-full);
      border: var(--border-width) solid var(--color-border);
      background: var(--color-card);
      color: var(--color-fg-secondary);
      white-space: nowrap;
    }

    :host([size="md"]) span {
      font-size: var(--text-sm);
      padding: var(--pad-badge-md);
    }

    :host([variant="accent"]) span {
      color: var(--color-accent);
      border-color: var(--color-accent-border);
      background: var(--color-accent-subtle);
    }

    :host([variant="info"]) span {
      color: var(--color-info);
      border-color: var(--color-info-border);
      background: var(--color-info-subtle);
    }

    :host([variant="success"]) span {
      color: var(--color-success);
      border-color: var(--color-success-border);
      background: var(--color-success-subtle);
    }

    :host([variant="warning"]) span {
      color: var(--color-warning);
      border-color: var(--color-warning-border);
      background: var(--color-warning-subtle);
    }
  </style>
  <span part="badge"><slot></slot></span>
`;

/**
 * Status/metadata badge Atom supporting neutral, accent, info, success, and warning variants.
 */
export class UiBadge extends HTMLElement {
  static observedAttributes = ['variant', 'size'];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('ui-badge')) {
  customElements.define('ui-badge', UiBadge);
}
