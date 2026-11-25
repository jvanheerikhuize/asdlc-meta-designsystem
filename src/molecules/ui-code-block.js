import '../atoms/ui-surface.js';
import '../atoms/ui-button.js';
import '../atoms/ui-icon.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-fg-muted);
      border-block-end: var(--border-width) solid var(--color-border);
    }

    pre {
      margin: 0;
      padding: var(--space-3);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      line-height: var(--leading-normal);
      color: var(--color-fg-secondary);
      overflow-x: auto;
      white-space: pre-wrap;
    }
  </style>
  <ui-surface part="container" variant="elevated" padding="none" radius="md">
    <div class="head" part="header">
      <span class="lang" part="language"></span>
      <ui-button id="copy-btn" part="copy-button" variant="ghost" size="sm" aria-label="Copy code">
        <ui-icon id="copy-icon" name="code" size="sm"></ui-icon>
        <span id="copy-label">Copy</span>
      </ui-button>
    </div>
    <pre part="pre"><code><slot></slot></code></pre>
  </ui-surface>
`;

/**
 * Monospace code/record preview Molecule composing <ui-surface>,
 * <ui-button> and <ui-icon> for copy-to-clipboard.
 */
export class UiCodeBlock extends HTMLElement {
  static observedAttributes = ['language'];

  #lang;
  #copyBtn;
  #copyIcon;
  #copyLabel;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#lang = shadow.querySelector('.lang');
    this.#copyBtn = shadow.getElementById('copy-btn');
    this.#copyIcon = shadow.getElementById('copy-icon');
    this.#copyLabel = shadow.getElementById('copy-label');

    this.#copyBtn.addEventListener('ui-press', async () => {
      const text = this.textContent?.trim() || '';
      try {
        await navigator.clipboard?.writeText(text);
      } catch {
        /* ignore clipboard permission errors in non-secure contexts */
      }
      this.#copyIcon.setAttribute('name', 'check');
      this.#copyLabel.textContent = 'Copied';
      this.dispatchEvent(new CustomEvent('ui-copy', {
        bubbles: true,
        composed: true,
        detail: { text },
      }));
      setTimeout(() => {
        this.#copyIcon.setAttribute('name', 'code');
        this.#copyLabel.textContent = 'Copy';
      }, 1200);
    });
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (this.#lang) {
      this.#lang.textContent = this.getAttribute('language') || 'html';
    }
  }
}

if (!customElements.get('ui-code-block')) {
  customElements.define('ui-code-block', UiCodeBlock);
}
