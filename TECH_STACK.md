# Technology Stack & Visual Binding

This document binds the technology-agnostic specifications in `records/` to a concrete browser-native implementation and Lumen-inspired dark-first visual language.

## 1. Runtime & Architecture

- **Zero external runtime dependencies:** Plain HTML5, CSS3, and ES2022+ JavaScript. No React, Vue, Tailwind, or bundler required.
- **HTML (Web Components):** Native `<template>`, `<slot>`, `<dialog>`, and Custom Elements (`customElements.define`) using custom tags (e.g., `<ui-button>`, `<ui-input>`, `<ui-card>`, `<ui-modal>`, `<ui-navbar>`).
- **CSS (Design Tokens & Shadow DOM):**
  - Global CSS Custom Properties (`--color-*`, `--space-*`, `--radius-*`, `--font-*`, `--shadow-*`) defined at `:root` so tokens pierce Shadow DOM boundaries cleanly.
  - Native CSS nesting and encapsulated Shadow DOM (`attachShadow({ mode: 'open' })`) stylesheets for component-scoped styling.
  - Native `@media (prefers-reduced-motion: reduce)` fallbacks and optical label alignment (`text-box: trim-both cap alphabetic`).
- **Vanilla JavaScript:** Component classes extending `HTMLElement`, using `observedAttributes`, `attributeChangedCallback`, `connectedCallback`, `CustomEvent` dispatching, and ARIA attribute synchronization without a virtual DOM.
- **Verification:** `python3 tools/spec.py check --strict` for specification integrity and native browser / Node test runner checks for component behavior.

## 2. Lumen-Inspired Visual Tokens

| Token Group | Values / Direction |
| :--- | :--- |
| Canvas & Surfaces | **Dark (default `:root`):** Obsidian (`#08080b`), elevated (`#111116`), translucent card (`rgba(255, 255, 255, 0.04)`) · **Light (`[data-theme="light"]`):** Paper (`#fafafa`), elevated (`#ffffff`), subtle card (`rgba(9, 9, 11, 0.03)`) |
| Ambient Glow | Subtle top radial highlights in rose (`rgba(244, 63, 94, 0.08)`) and amber (`rgba(251, 146, 60, 0.05)`) |
| Borders & Hairlines | **Dark:** `rgba(255, 255, 255, 0.08)` default, `0.22` hover/focus · **Light:** `rgba(9, 9, 11, 0.10)` default, `0.24` hover/focus |
| Foreground Text | **Dark:** Primary `#ededed`, secondary `#a1a1aa`, muted `#71717a` · **Light:** Primary `#09090b`, secondary `#52525b`, muted `#71717a` |
| Brand & Status Accents | Rose-crimson primary accent (`#f43f5e` dark / `#e11d48` light), sky info (`#38bdf8`), emerald success (`#10b981`), amber warning (`#f59e0b`) |
| Typography | Sans (`Geist`, `system-ui`, `sans-serif`), Display (`Bricolage Grotesque`, `Geist`, `sans-serif`), Mono (`Geist Mono`, `ui-monospace`, `monospace`) |
| Overlays & Loading | Native `<dialog>` backdrop (`rgba(0, 0, 0, 0.75)` + `backdrop-filter: blur(12px)`), shimmer skeleton gradient animation |

## 3. Publishing & Cross-Repository Distribution

- **GitHub Pages Dual-Site Layout:**
  - `/` (`site/index.html`): ASDLC specification dashboard (records, tasks, graph, capture), linking to `./showcase/`.
  - `/showcase/` (`site/showcase/index.html`): Live design-system Showcase website demonstrating tokens, Atoms, Molecules, Organisms, and Templates, linking back to `../`.
- **Cross-Repo Agent Consultation:**
  - **Shared Global Skill:** `~/.agents/skills/asdlc-design-system/SKILL.md` points agents in any repository to the design system contract.
  - **Machine-Readable Catalog:** `catalog.json` (plus human/agent `catalog.md`) documents every token, custom element tag, observed attribute, slot, emitted `CustomEvent`, and ARIA contract.
  - **Zero-Build ESM Entry Point:** `src/index.js` registers all custom elements and exports token stylesheets (`https://jvanheerikhuize.github.io/asdlc-meta-designsystem/latest/src/index.js` and `.../latest/src/tokens/tokens.css`, plus `/vX.Y.Z/src/...` for git-tagged releases) so consumer repositories can import components directly without a bundler.
  - **Workspace Version Policy (`TECH_STACK.md` header):** Consumer repositories declare `Design-System: asdlc-meta-designsystem@latest` (default auto-updating channel) or `Design-System: asdlc-meta-designsystem@vX.Y.Z` (pinned release tag). Running `python3 ~/.agents/skills/asdlc-design-system/scripts/sync_consumers.py --apply` aligns every consumer's HTML imports with its declared channel.

## 4. Atomic Directory Layout

```text
src/
  index.js      # Zero-build ESM entry point registering custom elements
  tokens/       # CSS custom properties (:root dark default + [data-theme="light"])
  atoms/        # ui-button, ui-input, ui-label, ui-badge, ui-icon, ui-skeleton
  molecules/    # ui-field, ui-search-bar, ui-media-card
  organisms/    # ui-navbar, ui-modal, ui-catalog-grid
  templates/    # page-shell, catalog-layout
  pages/        # showcase.html (Lumen-inspired live instance, copied to site/showcase/)
```

