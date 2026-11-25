# Technology Stack & Visual Binding

This document binds the technology-agnostic specifications in `.specs/records/` (rendered to `specs/`) to a concrete browser-native implementation and Lumen-inspired dark-first visual language.

Spec-Blueprint: asdlc-meta-specs@latest

## 1. Runtime & Architecture

- **Zero external runtime dependencies:** Plain HTML5, CSS3, and ES2022+ JavaScript. No React, Vue, Tailwind, or bundler required.
- **HTML (Web Components):** Native `<template>`, `<slot>`, `<dialog>`, and Custom Elements (`customElements.define`) using custom tags (e.g., `<ui-button>`, `<ui-input>`, `<ui-media-card>`, `<ui-modal>`, `<ui-navbar>`).
- **CSS (Design Tokens & Shadow DOM):**
  - Global CSS Custom Properties (`--color-*`, `--space-*`, `--radius-*`, `--font-*`, `--shadow-*`) defined at `:root` so tokens pierce Shadow DOM boundaries cleanly.
  - Native CSS nesting and encapsulated Shadow DOM (`attachShadow({ mode: 'open' })`) stylesheets for component-scoped styling.
  - Native `@media (prefers-reduced-motion: reduce)` fallbacks and optical label alignment (`text-box: trim-both cap alphabetic`).
- **Vanilla JavaScript:** Component classes extending `HTMLElement`, using `observedAttributes`, `attributeChangedCallback`, `connectedCallback`, `CustomEvent` dispatching, and ARIA attribute synchronization without a virtual DOM.
- **Verification:** `Spec-Blueprint` (`asdlc-meta-specs@latest`) `check --strict` for specification integrity and native browser / Node test runner checks for component behavior.

## 2. Lumen-Inspired Visual Tokens

| Token Group | Values / Direction |
| :--- | :--- |
| Canvas & Surfaces | **Dark (default `:root`):** Obsidian (`#08080b`), elevated (`#111116`), translucent card (`rgba(255, 255, 255, 0.04)`) · **Light (`[data-theme="light"]`):** Paper (`#fafafa`), elevated (`#ffffff`), subtle card (`rgba(9, 9, 11, 0.03)`) |
| Ambient Glow | Subtle top radial highlights in rose (`rgba(244, 63, 94, 0.08)`) and amber (`rgba(251, 146, 60, 0.05)`) |
| Borders & Hairlines | **Dark:** `rgba(255, 255, 255, 0.08)` default, `0.22` hover/focus · **Light:** `rgba(9, 9, 11, 0.10)` default, `0.24` hover/focus |
| Foreground Text | **Dark:** Primary `#ededed`, secondary `#a1a1aa`, muted `#8e8e98` · **Light:** Primary `#09090b`, secondary `#52525b`, muted `#5c5c66` |
| Brand & Status Accents | Rose-crimson primary accent (`#f43f5e` dark / `#e11d48` light), sky info (`#38bdf8`), emerald success (`#10b981`), amber warning (`#f59e0b`) |
| Typography | Sans (`Geist`, `system-ui`, `sans-serif`), Display (`Bricolage Grotesque`, `Geist`, `sans-serif`), Mono (`Geist Mono`, `ui-monospace`, `monospace`) |
| Overlays & Loading | Native `<dialog>` backdrop (`rgba(0, 0, 0, 0.75)` + `backdrop-filter: blur(12px)`), shimmer skeleton gradient animation |

## 3. Publishing & Cross-Repository Distribution

- **GitHub Pages Dual-Site Layout (Primary Showcase + Bolted-On Spec Dashboard):**
  - `/` (`site/index.html` & `/showcase/`): Primary live design-system Showcase website demonstrating tokens, Atoms, Molecules, Organisms, and Templates, linking to `./specs/`.
  - `/specs/` (`site/specs/index.html`): ASDLC specification dashboard (records, tasks, graph, capture) fetched dynamically from `asdlc-meta-specs@latest` at deploy time, linking back to `../`.
- **Cross-Repo Agent Consultation:**
  - **Shared Global Skill:** `~/.agents/skills/asdlc-design-system/SKILL.md` points agents in any repository to the design system contract.
  - **Machine-Readable Catalog:** `catalog.json` (plus human/agent `catalog.md`) documents every token, custom element tag, observed attribute, slot, emitted `CustomEvent`, and ARIA contract.
  - **Zero-Build ESM Entry Point:** `src/index.js` registers all custom elements and exports token stylesheets (`https://jvanheerikhuize.github.io/asdlc-meta-designsystem/latest/src/index.js` and `.../latest/src/tokens/tokens.css`, plus `/vX.Y.Z/src/...` for git-tagged releases) so consumer repositories can import components directly without a bundler.
  - **Workspace Version Policy (`TECH_STACK.md` header):** Consumer repositories declare `Design-System: asdlc-meta-designsystem@latest` (default auto-updating channel) or `Design-System: asdlc-meta-designsystem@vX.Y.Z` (pinned release tag). Running `python3 ~/.agents/skills/asdlc-design-system/scripts/sync_consumers.py --apply` aligns every consumer's HTML imports with its declared channel.

## 4. Tier Layout

```text
src/            # Shared package: tiers 1 to 5
├── index.js    # Zero-build ESM entry point registering custom elements
├── tokens/     # 1. tokens.css (--palette-* primitives, then semantic tokens), mkdocs-theme.css
├── atoms/      # 2. One native element each, imports nothing
├── molecules/  # 3. One to three kinds of atom, imports atoms only
├── organisms/  # 4. Imports atoms and molecules
└── templates/  # 5. Slots and CSS Grid, imports nothing
showcase/       # 6. The one page here, a consumer of src/ and catalog.json
```

- **Token rules:** components use `var(--token)` without fallbacks, so `tokens.css` is mandatory. Only semantic tokens may use `--palette-*`. `--anchor-gap` and `--anchor-margin` must be in `px`, because scripts read them.
- **Exceptions:** media and container queries cannot read custom properties, so breakpoints are literals: `640px` (narrow) and `1023px` (drawer becomes modal). `0`, percentages, viewport units, `em`, `fr` and ratios are not tokens.
- **Enforcement:** `tests/test_designsystem.py` checks imports, composition, raw values and unused imports.
