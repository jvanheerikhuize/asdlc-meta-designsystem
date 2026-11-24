---
id: REQ-0003
title: Foundational Atoms encapsulate style, expose reactive state, and enforce keyboard accessibility
status: active
because: [FCT-0001, FCT-0007]
---

## Statement
Foundational Atoms (Button, Text Input, Label, Badge, Icon, and Loading Skeleton) MUST encapsulate their internal presentation, inherit global design tokens, reflect state changes via declared attributes (such as disabled, variant, size, busy, pressed, or a maximum text length), emit standard interaction events, and expose visible keyboard focus rings and accessible roles.

## Acceptance
- Given a Button Atom in a disabled or busy state
- When a user attempts keyboard or pointer activation
- Then activation is suppressed, the accessible disabled or busy state is exposed, and styling reflects the non-interactive state

- Given a Button Atom that declares a pressed state
- When the owning view changes that state
- Then the accessible pressed state and styling follow it, and activation alone does not change it

- Given a Text Input Atom with a maximum length
- When a user types past that length
- Then the extra characters are not accepted
