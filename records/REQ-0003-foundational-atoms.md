---
id: REQ-0003
title: Foundational Atoms encapsulate style, expose reactive state, and enforce keyboard accessibility
status: active
because: [FCT-0001, FCT-0007]
---

## Statement
Foundational Atoms (Button, Text Input, Label, Badge, Icon, and Loading Skeleton) MUST encapsulate their internal presentation, inherit global design tokens, reflect state changes via declared attributes (such as disabled, variant, size, or busy), emit standard interaction events, and expose visible keyboard focus rings and accessible roles.

## Acceptance
- Given a Button Atom in a disabled or busy state
- When a user attempts keyboard or pointer activation
- Then activation is suppressed, the accessible disabled or busy state is exposed, and styling reflects the non-interactive state
