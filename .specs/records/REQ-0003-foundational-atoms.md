---
id: REQ-0003
title: Foundational Atoms encapsulate style, expose reactive state, and enforce keyboard accessibility
status: active
because: [FCT-0001, FCT-0007]
---

## Statement
Foundational Atoms (Button, Text Input, Label, Badge, Icon, Tooltip, and Loading Skeleton) MUST encapsulate their internal presentation, inherit global design tokens, reflect state changes via declared attributes (such as disabled, variant, size, busy, pressed, or a maximum text length), emit standard interaction events, and expose visible keyboard focus rings and accessible roles.

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

- Given a Tooltip Atom inside a container that clips its content
- When the tooltip opens
- Then its whole label is visible within the viewport

- Given a Button Atom that controls a menu or panel
- When the owning view declares whether that is open
- Then assistive technology is told so on the focusable control

- Given Text Input and submit Button Atoms inside a form
- When the user activates the Button or presses Enter in the Text Input
- Then the form validates and submits once, carrying the named value

- Given Text Input and Button Atoms inside a form
- When the form is reset, or its group of controls is disabled
- Then the Text Input returns to its declared value, or both Atoms become inactive
