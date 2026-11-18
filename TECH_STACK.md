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
| Canvas & Surfaces | Obsidian background (`#08080b`), elevated dark surface (`#111116`), translucent card surface (`rgba(255, 255, 255, 0.04)`) |
| Ambient Glow | Subtle top radial highlights in rose (`rgba(244, 63, 94, 0.08)`) and amber (`rgba(251, 146, 60, 0.05)`) |
| Borders & Hairlines | Crisp `1px` translucent borders (`rgba(255, 255, 255, 0.08)` default, `rgba(255, 255, 255, 0.22)` hover/focus) |
| Foreground Text | Primary `#ededed`, secondary `#a1a1aa`, muted `#71717a` |
| Brand & Status Accents | Rose-crimson primary accent (`#f43f5e`), sky info (`#38bdf8`), emerald success (`#10b981`), amber warning (`#f59e0b`) |
| Typography | Sans (`Geist`, `system-ui`, `sans-serif`), Display (`Bricolage Grotesque`, `Geist`, `sans-serif`), Mono (`Geist Mono`, `ui-monospace`, `monospace`) |
| Overlays & Loading | Native `<dialog>` backdrop (`rgba(0, 0, 0, 0.75)` + `backdrop-filter: blur(12px)`), shimmer skeleton gradient animation |

## 3. Atomic Directory Layout

```text
src/
  tokens/       # CSS custom properties (colors, typography, spacing, motion)
  atoms/        # ui-button, ui-input, ui-label, ui-badge, ui-icon, ui-skeleton
  molecules/    # ui-field, ui-search-bar, ui-media-card
  organisms/    # ui-navbar, ui-modal, ui-catalog-grid
  templates/    # page-shell, catalog-layout
  pages/        # showcase.html (Lumen-inspired live instance)
```
