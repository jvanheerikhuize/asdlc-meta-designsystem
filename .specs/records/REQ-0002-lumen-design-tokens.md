---
id: REQ-0002
title: Visual token foundation provides Lumen-inspired dark surfaces, typography, spacing, and reduced-motion rules
status: active
because: [FCT-0002, FCT-0003, FCT-0008, FCT-0010, FCT-0011]
---

## Statement
The system MUST expose semantic design tokens for canvas, elevated surfaces, translucent hairline borders, foreground text hierarchy, brand and status accents, spacing, radii, typography scales, control and panel sizes, stacking layers, and motion durations — shipping a Lumen-inspired dark-first default preset and an explicit light-theme preset — with reduced-motion fallbacks and readable contrast ratios across all interactive surfaces. Raw colors MUST be named as primitives that only semantic tokens use. Components MUST take every color, length, weight, layer and duration from semantic tokens. The vocabulary MUST also cover status states, data series, code, gradients, text styles, aspect ratios, interaction and safe areas. Every token that depends on a themed token MUST have a value in both themes.

## Acceptance
- Given a rendered interactive surface using the primary canvas, surface, foreground, and accent tokens
- When reduced-motion preference is active
- Then non-essential transitions and loading shimmer animations are suppressed while visual hierarchy and focus indicators remain intact

- Given any component
- When its visual values are inspected
- Then each comes from a semantic token, with no raw value and no fallback value

- Given any text, status, link or code color in either theme
- When it is shown on the canvas or on a surface
- Then its contrast is at least 4.5 to 1, and data series reach at least 3 to 1

- Given a light region inside a dark page
- When a composite token such as a gradient is used there
- Then it resolves to the light colors
