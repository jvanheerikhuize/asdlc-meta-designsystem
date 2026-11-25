import '../atoms/ui-surface.js';
import '../atoms/ui-divider.js';
import '../molecules/ui-panel-header.js';

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
      width: var(--drawer-width, var(--panel-drawer));
      height: 100%;
      max-width: 100vw;
    }

    :host([side="bottom"]) .docked {
      width: 100%;
      height: var(--drawer-height, var(--panel-tray));
    }

    .panel-inner {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    dialog {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
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
      background: var(--color-overlay);
      backdrop-filter: blur(var(--frost-sm));
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
      width: min(var(--drawer-width, var(--panel-drawer)), calc(100vw - var(--space-6)));
      height: 100svh;
    }

    :host([side="bottom"]) .sheet {
      width: 100%;
      height: min(var(--drawer-height, var(--panel-sheet)), 82svh);
    }

    .body {
      flex: 1;
      overflow-y: auto;
      scrollbar-color: var(--color-border-hover) transparent;
      padding: var(--space-4);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      line-height: var(--leading-normal);
    }

    .foot {
      padding: var(--space-3) var(--space-4);
      flex-shrink: 0;
    }

    .foot:empty {
      display: none;
    }
  </style>
  <aside class="docked" part="panel">
    <ui-surface variant="base" radius="none" padding="none" style="width:100%;height:100%;">
      <div class="panel-inner">
        <ui-panel-header class="docked-head" close-label="Close panel"></ui-panel-header>
        <ui-divider></ui-divider>
        <div class="body" part="body"><slot id="docked-slot"></slot></div>
        <div class="foot" part="footer"><slot id="docked-foot" name="footer"></slot></div>
      </div>
    </ui-surface>
  </aside>

  <dialog part="dialog" aria-labelledby="modal-drawer-title">
    <div class="modal-frame">
      <div class="sheet" part="sheet">
        <ui-surface variant="base" elevation="lg" radius="lg" padding="none" style="width:100%;height:100%;">
          <div class="panel-inner">
            <ui-panel-header class="modal-head" heading-id="modal-drawer-title" close-label="Close drawer"></ui-panel-header>
            <ui-divider></ui-divider>
            <div class="body" part="body"><slot id="modal-slot"></slot></div>
            <div class="foot" part="footer"><slot id="modal-foot"></slot></div>
          </div>
        </ui-surface>
      </div>
    </div>
  </dialog>
`;

/**
 * Responsive collapsible drawer/sheet Organism composing <ui-surface>,
 * <ui-panel-header>, and <ui-divider>.
 */
export class UiDrawer extends HTMLElement {
  static observedAttributes = ['title', 'side', 'mode', 'open'];

  #docked;
  #dialog;
  #sheet;
  #dockedHead;
  #modalHead;
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
    this.#dockedHead = shadow.querySelector('.docked-head');
    this.#modalHead = shadow.querySelector('.modal-head');
    this.#dockedSlot = shadow.getElementById('docked-slot');
    this.#dockedFoot = shadow.getElementById('docked-foot');
    this.#modalSlot = shadow.getElementById('modal-slot');
    this.#modalFoot = shadow.getElementById('modal-foot');

    this.#dockedHead.addEventListener('ui-close', () => this.close('close-button'));
    this.#modalHead.addEventListener('ui-close', () => this.close('close-button'));

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
    this.#dockedHead?.setAttribute('title', title);
    this.#modalHead?.setAttribute('title', title);
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
