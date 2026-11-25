---
id: REQ-0002
title: Visual token foundation provides Lumen-inspired dark surfaces, typography, spacing, and reduced-motion rules
status: active
because: [FCT-0002, FCT-0003, FCT-0008, FCT-0010]
---

## Statement
The system MUST expose semantic design tokens for canvas, elevated surfaces, translucent hairline borders, foreground text hierarchy, brand and status accents, spacing, radii, typography scales, control and panel sizes, stacking layers, and motion durations — shipping a Lumen-inspired dark-first default preset and an explicit light-theme preset — with reduced-motion fallbacks and readable contrast ratios across all interactive surfaces. Raw colors MUST be named as primitives that only semantic tokens use. Components MUST take every color, length, weight, layer and duration from semantic tokens.

## Acceptance
- Given a rendered interactive surface using the primary canvas, surface, foreground, and accent tokens
- When reduced-motion preference is active
- Then non-essential transitions and loading shimmer animations are suppressed while visual hierarchy and focus indicators remain intact

- Given any component
- When its visual values are inspected
- Then each comes from a semantic token, with no raw value and no fallback value
