import '../atoms/ui-surface.js';
import '../atoms/ui-divider.js';
import '../molecules/ui-panel-header.js';

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
      border: 0;
      background: transparent;
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
    }
  </style>
  <dialog part="dialog" closedby="any" aria-labelledby="modal-title">
    <ui-surface variant="base" elevation="lg" radius="xl" padding="none">
      <ui-panel-header id="modal-head" heading-id="modal-title" close-label="Close dialog"></ui-panel-header>
      <ui-divider></ui-divider>
      <div class="body" part="body">
        <slot></slot>
      </div>
      <ui-divider></ui-divider>
      <div class="foot" part="footer">
        <slot name="footer"></slot>
      </div>
    </ui-surface>
  </dialog>
`;

/**
 * Accessible modal dialog Organism composing <ui-surface>, <ui-panel-header>,
 * and <ui-divider> inside native <dialog>.showModal().
 */
export class UiModal extends HTMLElement {
  static observedAttributes = ['title', 'open'];

  #dialog;
  #header;
  #invoker = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#dialog = shadow.querySelector('dialog');
    this.#header = shadow.getElementById('modal-head');

    this.#header.addEventListener('ui-close', () => this.close('close-button'));

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
    if (this.#header) {
      this.#header.setAttribute('title', this.getAttribute('title') || '');
    }
  }
}

if (!customElements.get('ui-modal')) {
  customElements.define('ui-modal', UiModal);
}
