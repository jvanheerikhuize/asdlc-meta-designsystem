const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      width: 100%;
      height: 100dvh;
      overflow: hidden;
      background: var(--color-bg);
      color: var(--color-fg);
      box-sizing: border-box;
    }

    :host([hidden]) {
      display: none;
    }

    header {
      z-index: var(--z-header);
    }

    .body {
      position: relative;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      min-height: 0;
      min-width: 0;
      overflow: hidden;
    }

    :host([aside-side="right"]) .body {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    :host([aside-side="right"]) .aside {
      order: 2;
    }

    .aside {
      min-height: 0;
      z-index: var(--z-panel);
    }

    .stage {
      position: relative;
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
    }

    .canvas {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }

    .floating {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: var(--z-floating);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    }

    .floating ::slotted(*) {
      pointer-events: auto;
    }

    .bottom {
      z-index: var(--z-tray);
      min-width: 0;
    }

    @media (max-width: 640px) {
      .body,
      :host([aside-side="right"]) .body {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr);
      }

      :host([aside-side="right"]) .aside {
        order: 0;
      }

      .aside {
        max-height: 50dvh;
        overflow: auto;
      }
    }
  </style>
  <header part="header">
    <slot name="header"></slot>
  </header>
  <div class="body" part="body">
    <aside class="aside" part="aside" aria-label="Workspace panel">
      <slot name="aside"></slot>
    </aside>
    <main class="stage" part="main">
      <div class="canvas" part="canvas">
        <slot></slot>
        <div class="floating" part="floating">
          <slot name="floating"></slot>
        </div>
      </div>
      <section class="bottom" part="bottom" aria-label="Workspace tray">
        <slot name="bottom"></slot>
      </section>
    </main>
  </div>
`;

/**
 * Full-viewport (`100dvh`, `overflow: hidden`) canvas application shell Template
 * arranging sticky header, docked side drawer, full-bleed interactive canvas,
 * pointer-transparent floating toolbar overlay, and collapsible bottom tray.
 */
export class WorkspaceLayout extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}

if (!customElements.get('workspace-layout')) {
  customElements.define('workspace-layout', WorkspaceLayout);
}
