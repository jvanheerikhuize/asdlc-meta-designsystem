---
id: REQ-0002
title: Visual token foundation provides Lumen-inspired dark surfaces, typography, spacing, and reduced-motion rules
status: provisional
because: [FCT-0002, ASM-0002]
---

## Statement
The system MUST expose semantic design tokens for canvas, elevated surfaces, translucent hairline borders, foreground text hierarchy, brand and status accents, spacing, radii, typography scales, and motion durations, with reduced-motion fallbacks and readable contrast ratios across all interactive surfaces.

## Acceptance
- Given a rendered interactive surface using the primary canvas, surface, foreground, and accent tokens
- When reduced-motion preference is active
- Then non-essential transitions and loading shimmer animations are suppressed while visual hierarchy and focus indicators remain intact
