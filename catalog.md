# ASDLC Design System Catalog (`SPC-0001`)

Zero-build, Lumen-inspired vanilla Web Components and CSS Custom Property tokens.
Machine-readable source of truth: [`catalog.json`](catalog.json).

## Quick Start (Zero-Build ESM)

```html
<link rel="stylesheet" href="/path/to/src/tokens/tokens.css">
<script type="module" src="/path/to/src/index.js"></script>

<ui-label for="q" required>Search</ui-label>
<ui-input id="q" aria-label="Search" placeholder="Filter records…"></ui-input>
<ui-button variant="primary"><ui-icon name="search" size="sm"></ui-icon> Run</ui-button>
```

- `ensureTokens(doc = document)` (exported from `src/index.js`) idempotently injects `<link rel="stylesheet" href=".../tokens.css">` if not already present.
- `tokens.css` defines custom properties only; it does not reset `body` styles or bundle `@font-face` files.
- Theme switching: dark mode is the default on `:root`; set `data-theme="light"` on `<html>` (or an ancestor) for light mode.
- **Shadow DOM Notes:** `<ui-button>` aligns slotted `<ui-icon>` and text with `inline-flex` + `gap` and `<ui-icon>` inherits `currentColor`. `<ui-input>` exposes a live `.value` JS property in addition to `ui-input`/`ui-change` events. In `SPC-0001`, Atoms do not implement `ElementInternals` form association (`formAssociated`) or cross-shadow `<label for>` bridging, so always pair `<ui-input>` with `aria-label` and handle `ui-press` in JS. `<ui-skeleton lines>` applies only when `variant="text"`.

## Tier Architecture (`REQ-0001`)

`tokens` -> `atoms` -> `molecules` -> `organisms` -> `templates` -> `pages`
Lower tiers MUST NOT import or depend on higher tiers.

## Design Tokens (`src/tokens/tokens.css`)

| Group | Tokens | Dark (`:root`) | Light (`[data-theme="light"]`) |
| :--- | :--- | :--- | :--- |
| Canvas & Surfaces | `--color-bg`, `--color-surface`, `--color-surface-elevated`, `--color-card`, `--color-card-hover`, `--color-overlay` | `#08080b`, `#111116`, `#18181f`, `rgba(255,255,255,0.04)`, `0.07`, `rgba(0,0,0,0.75)` | `#fafafa`, `#ffffff`, `#f4f4f5`, `rgba(9,9,11,0.03)`, `0.06`, `rgba(9,9,11,0.55)` |
| Ambient Glow | `--glow-rose`, `--glow-amber` | `rgba(244,63,94,0.08)`, `rgba(251,146,60,0.05)` | `rgba(225,29,72,0.06)`, `rgba(217,119,6,0.04)` |
| Borders & Focus | `--color-border`, `--color-border-hover`, `--color-focus-ring` | `rgba(255,255,255,0.08)`, `0.22`, `#f43f5e` | `rgba(9,9,11,0.10)`, `0.24`, `#e11d48` |
| Foreground Text | `--color-fg`, `--color-fg-secondary`, `--color-fg-muted` | `#ededed`, `#a1a1aa`, `#8e8e98` | `#09090b`, `#52525b`, `#5c5c66` |
| Accents | `--color-accent`, `--color-accent-hover`, `--color-accent-fg`, `--color-info`, `--color-success`, `--color-warning`, `--color-danger`, `--color-danger-fg` | `#f43f5e`, `#fb7185`, `#08080b`, `#38bdf8`, `#10b981`, `#f59e0b`, `#f87171`, `#08080b` | `#e11d48`, `#be123c`, `#ffffff`, `#0369a1`, `#047857`, `#b45309`, `#dc2626`, `#ffffff` |
| Typography | `--font-sans`, `--font-display`, `--font-mono`, `--text-xs`..`--text-2xl`, `--leading-tight`, `--leading-normal` | `Geist`, `Bricolage Grotesque`, `Geist Mono` | same |
| Spacing & Radii | `--space-1`..`--space-12`, `--radius-sm`..`--radius-full` | `0.25rem`..`3rem`, `0.375rem`..`9999px` | same |
| Shadows & Motion | `--shadow-sm`..`--shadow-lg`, `--duration-fast`, `--duration-normal`, `--duration-shimmer`, `--ease-standard` | `120ms`, `220ms`, `1400ms` (`0ms` under `prefers-reduced-motion: reduce`) | lighter alpha shadows |

## Atoms (`src/atoms/`)

| Tag | Attributes | Slots | Events | Parts |
| :--- | :--- | :--- | :--- | :--- |
| `<ui-button>` | `variant` (`primary`\|`secondary`\|`ghost`\|`danger`), `size` (`sm`\|`md`\|`lg`), `disabled`, `busy`, `type`, `aria-label` | default | `ui-press` | `button` |
| `<ui-input>` | `type`, `value`, `placeholder`, `disabled`, `readonly`, `required`, `invalid`, `name`, `aria-label` | — | `ui-input`, `ui-change` | `input` |
| `<ui-label>` | `for`, `required`, `size` (`md`\|`sm`) | default | — | `label` |
| `<ui-badge>` | `variant` (`neutral`\|`accent`\|`info`\|`success`\|`warning`), `size` (`sm`\|`md`) | default | — | `badge` |
| `<ui-icon>` | `name` (`search`, `sun`, `moon`, `check`, `alert`, `info`, `arrow-right`, `arrow-left`, `sparkles`, `code`, `layers`, `external`), `size` (`sm`\|`md`\|`lg`), `label` | — | — | `icon` |
| `<ui-skeleton>` | `variant` (`text`\|`rect`\|`circle`), `width`, `height`, `lines` | — | — | `skeleton` |
