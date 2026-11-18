---
id: REQ-0005
title: Organisms, Templates, and Pages assemble Molecules into responsive, accessible application views
status: provisional
because: [FCT-0001, ASM-0001]
---

## Statement
Organisms (Site Header, Modal Dialog with blurred backdrop and focus containment, and Catalog Grid), Templates (structural page blueprints), and Pages (live showcase instances with realistic content) MUST compose lower-tier components into responsive views that preserve keyboard navigation, overlay dismissal, and clean slot boundaries.

## Acceptance
- Given a Modal Dialog Organism opened from a Catalog Grid item
- When the user presses the escape key or activates the backdrop close control
- Then the modal closes cleanly and restores keyboard focus to the triggering element
