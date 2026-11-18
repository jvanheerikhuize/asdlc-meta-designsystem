import '../atoms/ui-button.js';
import '../atoms/ui-icon.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: contents;
    }

    dialog {
      box-sizing: border-box;
      width: min(36rem, calc(100vw - 2rem));
      max-height: calc(100vh - 3rem);
      margin: auto;
      padding: 0;
      border-radius: var(--radius-xl, 1rem);
      border: 1px solid var(--color-border-hover, rgba(255, 255, 255, 0.22));
      background: var(--color-surface, #111116);
      color: var(--color-fg, #ededed);
      box-shadow: var(--shadow-lg, 0 12px 32px rgba(0, 0, 0, 0.6));
      overflow: auto;
    }

    dialog:modal {
      overscroll-behavior: contain;
    }

    dialog::backdrop {
      overflow: hidden;
      overscroll-behavior: contain;
      background: var(--color-overlay, rgba(0, 0, 0, 0.75));
      backdrop-filter: blur(12px);
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3, 0.75rem);
      padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
      border-bottom: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
    }

    h2 {
      margin: 0;
      font-family: var(--font-display, system-ui, sans-serif);
      font-size: var(--text-lg, 1.125rem);
      line-height: var(--leading-tight, 1.2);
    }

    .body {
      padding: var(--space-5, 1.25rem);
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
      line-height: var(--leading-normal, 1.5);
      color: var(--color-fg-secondary, #a1a1aa);
    }

    .foot {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2, 0.5rem);
      padding: var(--space-3, 0.75rem) var(--space-5, 1.25rem);
      border-top: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
    }
  </style>
  <dialog part="dialog" closedby="any" aria-labelledby="modal-title">
    <div class="head">
      <h2 id="modal-title" part="title"></h2>
      <ui-button id="close-btn" part="close" variant="ghost" size="sm" aria-label="Close dialog">
        <span aria-hidden="true">&times;</span>
      </ui-button>
    </div>
    <div class="body" part="body">
      <slot></slot>
    </div>
    <div class="foot" part="footer">
      <slot name="footer"></slot>
    </div>
  </dialog>
`;

/**
 * Accessible modal dialog Organism built on native <dialog> with blurred backdrop,
 * Escape/backdrop dismissal, and focus restoration to the triggering element.
 */
export class UiModal extends HTMLElement {
  static observedAttributes = ['title', 'open'];

  #dialog;
  #titleEl;
  #closeBtn;
  #invoker = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#dialog = shadow.querySelector('dialog');
    this.#titleEl = shadow.getElementById('modal-title');
    this.#closeBtn = shadow.getElementById('close-btn');

    this.#closeBtn.addEventListener('ui-press', () => this.close('close-button'));

    this.#dialog.addEventListener('click', (event) => {
      if (event.target !== this.#dialog) return;
      const rect = this.#dialog.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) {
        this.close('backdrop');
      }
    });

    this.#dialog.addEventListener('close', () => {
      this.removeAttribute('open');
      const reason = this.#dialog.returnValue || 'dismiss';
      this.#dialog.returnValue = '';
      const invoker = this.#invoker;
      this.#invoker = null;
      if (invoker && typeof invoker.focus === 'function') {
        setTimeout(() => invoker.focus(), 0);
      }
      this.dispatchEvent(new CustomEvent('ui-close', {
        bubbles: true,
        composed: true,
        detail: { reason },
      }));
    });
  }

  connectedCallback() {
    this.#syncTitle();
  }

  attributeChangedCallback(name) {
    if (name === 'title') this.#syncTitle();
    if (name === 'open') {
      if (this.hasAttribute('open') && this.#dialog && !this.#dialog.open) {
        this.showModal();
      } else if (!this.hasAttribute('open') && this.#dialog && this.#dialog.open) {
        this.close('attribute');
      }
    }
  }

  showModal(triggerEl = null) {
    if (!this.#dialog || this.#dialog.open) return;
    this.#invoker = triggerEl || document.activeElement;
    this.#dialog.showModal();
    this.setAttribute('open', '');
    this.dispatchEvent(new CustomEvent('ui-open', { bubbles: true, composed: true }));
  }

  close(reason = 'programmatic') {
    if (!this.#dialog || !this.#dialog.open) return;
    this.#dialog.close(reason);
  }

  #syncTitle() {
    if (this.#titleEl) {
      this.#titleEl.textContent = this.getAttribute('title') || '';
    }
  }
}

if (!customElements.get('ui-modal')) {
  customElements.define('ui-modal', UiModal);
}
