# SPC-0001 End-to-End Execution Trace

This document records the end-to-end implementation and verification of `SPC-0001` (Design token foundation and foundational Atoms skeleton) in `asdlc-meta-designsystem`, including commands, test outcomes, epistemic promotions, and observations to feed back into `asdlc-meta-specs`.

## Session Metadata

- **Date:** 2026-11-18
- **Branch:** `feat/agy-spc-0001-skeleton`
- **Baseline Check:**
  - `python3 tools/spec.py check --strict` -> `21 records · 0 errors · 0 warnings` (`SPC-0001 [skeleton] 20% ready`, `SPC-0002 [feature] 0% ready`)
  - `python3 -m unittest discover -s tests -v` -> `3 tests in 0.050s OK`

## Phase Log

### Phase 1: Branch & Baseline
- Created `feat/agy-spc-0001-skeleton` from `main`.
- Inspected `tools/spec.py` traceability rules (`--verify tests` requires active `REQ-xxxx` or `REQ-xxxx#N` citations in `tests/`).

### Phase 2: Design Tokens (`src/tokens/tokens.css`)
- Implemented Lumen-inspired dark-first `:root` tokens and `[data-theme="light"]` overrides.
- **ASM-0002 Observation (Contrast):** Raw `#71717a` muted text on `#08080b`/`#111116` yields ~3.8:1–4.0:1 contrast (below WCAG AA 4.5:1 for normal text), and `#ffffff` on `#f43f5e` yields ~3.67:1. Calibrated dark `--color-fg-muted` to `#8e8e98` (>= 4.5:1), light `--color-fg-muted` to `#5c5c66` (>= 4.5:1), and dark `--color-accent-fg` to `#08080b` (>= 4.5:1 on `#f43f5e`), while keeping light `--color-accent: #e11d48` with `#ffffff` (>= 4.5:1).

### Phase 3: Foundational Atoms (`src/atoms/`) & Entry Point (`src/index.js`)
- Implemented 6 zero-dependency vanilla Web Components with open Shadow DOM: `ui-button` (`delegatesFocus: true`), `ui-input` (`delegatesFocus: true`), `ui-label`, `ui-badge`, `ui-icon` (12 built-in SVG icons), and `ui-skeleton`.
- Added `@media (prefers-reduced-motion: reduce)` inside Shadow DOM stylesheets as well as `tokens.css`, because document-level `* { animation-duration: ... }` rules do not pierce shadow boundaries.
- Created `src/index.js` exporting all 6 classes, `TOKENS_URL`, `ATOMS`, and `ensureTokens(doc = document)`.

### Phase 4: Catalog, Global Skill & Showcase
- Created `catalog.json` and `catalog.md` documenting all tokens and all 6 Atoms.
- Created `/home/jerry/.agents/skills/asdlc-design-system/SKILL.md` for cross-repo agent discovery.
- Created `src/pages/showcase.html`, linked `./showcase/` from `site/index.html`, synced assets to `site/showcase/`, and updated `.github/workflows/pages.yml` to sync `site/showcase/` during GitHub Pages builds.

### Phase 5: Consumer Subagent Trial (`ASM-0003`)
- Invoked a `research` subagent (`Consumer Agent Tester`) restricted to reading only `SKILL.md`, `catalog.json`, and `catalog.md` (no `src/` access) to build a standalone "Quick Search & Filter" view.
- **Result:** The subagent successfully used the right tags, tokens, and `ui-press`/`ui-input` events, **but flagged 6 contract gaps** that forced defensive workarounds:
  1. Cross-Shadow-DOM `<ui-label for>` / `<ui-input id>` association behavior was undocumented.
  2. Live `.value` JS property sync on `<ui-input>` was undocumented.
  3. Form participation (`formAssociated` / `type="submit"`) across Shadow DOM was undocumented.
  4. Slotted `<ui-icon>` flex alignment and `currentColor` inheritance inside `<ui-button>` were undocumented.
  5. `ui-skeleton` `lines` scope (`variant="text"` only) and `tokens.css` scope (no `body` reset or `@font-face`) were undocumented.
  6. `ensureTokens()` mentioned in `SKILL.md` was missing from `catalog.json` / `catalog.md`.
- **Action Taken:** Enriched `catalog.json` and `catalog.md` to document all 6 items. Kept `ASM-0003` `open` (and `REQ-0006` `provisional`) pending a follow-up test in a real separate consumer repository.

### Phase 6: Epistemic Promotions & Final Verification
- Promoted `ASM-0001` -> `FCT-0007` and `ASM-0002` -> `FCT-0008`.
- Updated `REQ-0002`, `REQ-0003`, `REQ-0007` to `status: active` (and updated `REQ-0004`, `REQ-0005` `because` citations from `ASM-0001` to `FCT-0007`).
- Final verification outputs:
  - `python3 tools/spec.py check --strict --verify tests` -> `23 records · 0 errors · 0 warnings` (`SPC-0001 [skeleton] 80% ready`, `SPC-0002 [feature] 0% ready`)
  - `python3 -m unittest discover -s tests -v` -> `8 tests in 0.046s OK`
  - `node tests/test_browser.mjs` -> `ALL_BROWSER_CHECKS_PASSED` (zero console/page errors)
  - `python3 tools/spec.py index` -> `wrote site/data/index.json`

## Observations for `asdlc-meta-specs`
1. **Promoted `ASM` cascading warnings:** When an `ASM` is promoted to `FCT`, `tools/spec.py check --strict` usefully warns on every `REQ` that still cites the promoted `ASM`. Documenting this cascade in `asdlc-spec-workflow` helps agents update downstream provisional `REQ`s immediately.
2. **Shadow DOM + `prefers-reduced-motion`:** Document-level reduced-motion reset rules do not cross Shadow DOM boundaries; each encapsulated component with animations/transitions needs its own `@media (prefers-reduced-motion: reduce)` block or CSS custom property duration (`var(--duration-*)`).
3. **Catalog Contract Completeness (`ASM-0003`):** Listing attributes/events alone is insufficient for Shadow DOM components; consumer agents also need explicit documentation on JS properties, form-association boundaries, slot layout/color inheritance, and cross-shadow label behavior.
4. **CI vs. Local Global Skill Path:** Unit tests that assert files under `~/.agents/skills/` fail on GitHub Actions runners (`CI=true`) because global agent skills live outside the repository checkout. Guarding host-local skill checks with `CI != "true"` keeps CI green while preserving local verification.
