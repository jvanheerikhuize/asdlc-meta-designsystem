import '../atoms/ui-button.js';
import '../atoms/ui-icon.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }

    :host(:not([open])) .docked {
      display: none;
    }

    .docked {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: var(--drawer-width, 22rem);
      height: 100%;
      max-width: 100vw;
      background: var(--color-surface, #111116);
      color: var(--color-fg, #ededed);
      border-inline-end: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      overflow: hidden;
    }

    :host([side="right"]) .docked {
      border-inline-end: 0;
      border-inline-start: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
    }

    :host([side="bottom"]) .docked {
      width: 100%;
      height: var(--drawer-height, 14rem);
      border-inline: 0;
      border-block-start: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
    }

    dialog {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--color-fg, #ededed);
      max-width: none;
      max-height: none;
      width: 100vw;
      height: 100svh;
      inset: 0;
      overflow: hidden;
    }

    dialog:modal {
      overscroll-behavior: contain;
    }

    dialog::backdrop {
      background: var(--color-overlay, rgba(0, 0, 0, 0.75));
      backdrop-filter: blur(8px);
    }

    .modal-frame {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: stretch;
      justify-content: flex-start;
    }

    :host([side="right"]) .modal-frame {
      justify-content: flex-end;
    }

    :host([side="bottom"]) .modal-frame {
      align-items: flex-end;
    }

    .sheet {
      display: flex;
      flex-direction: column;
      width: min(var(--drawer-width, 22rem), calc(100vw - 1.5rem));
      height: 100svh;
      background: var(--color-surface, #111116);
      border-inline-end: 1px solid var(--color-border-hover, rgba(255, 255, 255, 0.22));
      box-shadow: var(--shadow-lg, 0 12px 32px rgba(0, 0, 0, 0.6));
      overflow: hidden;
    }

    :host([side="right"]) .sheet {
      border-inline-end: 0;
      border-inline-start: 1px solid var(--color-border-hover, rgba(255, 255, 255, 0.22));
    }

    :host([side="bottom"]) .sheet {
      width: 100%;
      height: min(var(--drawer-height, 20rem), 82svh);
      border-inline: 0;
      border-block-start: 1px solid var(--color-border-hover, rgba(255, 255, 255, 0.22));
      border-start-start-radius: var(--radius-xl, 1rem);
      border-start-end-radius: var(--radius-xl, 1rem);
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3, 0.75rem);
      padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
      border-bottom: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      flex-shrink: 0;
    }

    h2 {
      margin: 0;
      font-family: var(--font-display, system-ui, sans-serif);
      font-size: var(--text-md, 1rem);
      line-height: var(--leading-tight, 1.2);
    }

    .body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-4, 1rem);
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: var(--text-sm, 0.875rem);
      line-height: var(--leading-normal, 1.5);
    }

    .foot {
      padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
      border-top: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
      flex-shrink: 0;
    }

    .foot:empty {
      display: none;
    }
  </style>
  <aside class="docked" part="panel">
    <div class="head" part="header">
      <h2 class="drawer-title" part="title"></h2>
      <ui-button class="close-btn" part="close" variant="ghost" size="sm" aria-label="Close panel">
        <ui-icon name="close" size="sm"></ui-icon>
      </ui-button>
    </div>
    <div class="body" part="body"><slot id="docked-slot"></slot></div>
    <div class="foot" part="footer"><slot id="docked-foot" name="footer"></slot></div>
  </aside>

  <dialog part="dialog" aria-labelledby="modal-drawer-title">
    <div class="modal-frame">
      <div class="sheet" part="sheet">
        <div class="head" part="header">
          <h2 id="modal-drawer-title" class="drawer-title" part="title"></h2>
          <ui-button class="modal-close-btn" part="close" variant="ghost" size="sm" aria-label="Close drawer">
            <ui-icon name="close" size="sm"></ui-icon>
          </ui-button>
        </div>
        <div class="body" part="body"><slot id="modal-slot"></slot></div>
        <div class="foot" part="footer"><slot id="modal-foot"></slot></div>
      </div>
    </div>
  </dialog>
`;

/**
 * Responsive collapsible drawer/sheet Organism supporting `docked` non-modal
 * panels (sidebars and bottom elevation trays), `modal` top-layer <dialog>
 * sheets, and `auto` viewport-responsive switching (< 1024px modal, >= 1024px docked).
 */
export class UiDrawer extends HTMLElement {
  static observedAttributes = ['title', 'side', 'mode', 'open'];

  #docked;
  #dialog;
  #sheet;
  #dockedSlot;
  #dockedFoot;
  #modalSlot;
  #modalFoot;
  #invoker = null;
  #mql = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(max-width: 1023px)')
    : null;
  #onMediaChange = () => this.#syncState();

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#docked = shadow.querySelector('.docked');
    this.#dialog = shadow.querySelector('dialog');
    this.#sheet = shadow.querySelector('.sheet');
    this.#dockedSlot = shadow.getElementById('docked-slot');
    this.#dockedFoot = shadow.getElementById('docked-foot');
    this.#modalSlot = shadow.getElementById('modal-slot');
    this.#modalFoot = shadow.getElementById('modal-foot');

    shadow.querySelector('.close-btn').addEventListener('ui-press', () => this.close('close-button'));
    shadow.querySelector('.modal-close-btn').addEventListener('ui-press', () => this.close('close-button'));

    this.#dialog.addEventListener('click', (event) => {
      if (!this.#sheet.contains(event.target)) {
        this.close('backdrop');
      }
    });

    this.#dialog.addEventListener('close', () => {
      if (this.hasAttribute('open') && this.#isModalActive()) {
        this.removeAttribute('open');
      }
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
    this.#mql?.addEventListener('change', this.#onMediaChange);
    this.#syncTitle();
    this.#syncState();
  }

  disconnectedCallback() {
    this.#mql?.removeEventListener('change', this.#onMediaChange);
  }

  attributeChangedCallback(name) {
    if (name === 'title') this.#syncTitle();
    if (name === 'open' || name === 'mode' || name === 'side') {
      this.#syncState();
    }
  }

  show(triggerEl = null) {
    this.#invoker = triggerEl || document.activeElement;
    if (!this.hasAttribute('open')) {
      this.setAttribute('open', '');
    }
    this.dispatchEvent(new CustomEvent('ui-open', { bubbles: true, composed: true }));
  }

  close(reason = 'programmatic') {
    if (!this.hasAttribute('open')) return;
    if (this.#dialog?.open) {
      this.#dialog.close(reason);
      this.removeAttribute('open');
      return;
    }
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('ui-close', {
      bubbles: true,
      composed: true,
      detail: { reason },
    }));
  }

  #isModalActive() {
    const mode = this.getAttribute('mode') || 'docked';
    if (mode === 'modal') return true;
    if (mode === 'auto') return Boolean(this.#mql?.matches);
    return false;
  }

  #syncTitle() {
    const title = this.getAttribute('title') || '';
    for (const el of this.shadowRoot.querySelectorAll('.drawer-title')) {
      el.textContent = title;
    }
    this.#docked?.setAttribute('aria-label', title || 'Side panel');
  }

  #syncState() {
    if (!this.#docked || !this.#dialog) return;
    const isOpen = this.hasAttribute('open');
    const modal = this.#isModalActive();

    if (modal) {
      this.#docked.style.display = 'none';
      this.#dockedSlot.setAttribute('name', '__inactive_default');
      this.#dockedFoot.setAttribute('name', '__inactive_footer');
      this.#modalSlot.removeAttribute('name');
      this.#modalFoot.setAttribute('name', 'footer');

      if (isOpen && !this.#dialog.open) {
        this.#dialog.showModal();
      } else if (!isOpen && this.#dialog.open) {
        this.#dialog.close('attribute');
      }
    } else {
      if (this.#dialog.open) {
        this.#dialog.close('mode-switch');
      }
      this.#docked.style.display = isOpen ? 'flex' : 'none';
      this.#dockedSlot.removeAttribute('name');
      this.#dockedFoot.setAttribute('name', 'footer');
      this.#modalSlot.setAttribute('name', '__inactive_default');
      this.#modalFoot.setAttribute('name', '__inactive_footer');
    }
  }
}

if (!customElements.get('ui-drawer')) {
  customElements.define('ui-drawer', UiDrawer);
}
