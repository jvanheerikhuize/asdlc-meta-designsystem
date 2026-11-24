---
id: REQ-0005
title: Organisms, Templates, and Pages assemble Molecules into responsive, accessible application views
status: active
because: [FCT-0001, FCT-0004, FCT-0007]
---

## Statement
Organisms (Site Header, Modal Dialog with blurred backdrop and focus containment, Catalog Grid, and Data Table), Templates (structural page blueprints), and Pages (live showcase instances with realistic content) MUST compose lower-tier components into responsive views that preserve keyboard navigation, overlay dismissal, and clean slot boundaries.

## Acceptance
- Given a Modal Dialog Organism opened from a Catalog Grid item
- When the user presses the escape key or activates the backdrop close control
- Then the modal closes cleanly and restores keyboard focus to the triggering element

- Given a Data Table wider than the available space
- When a keyboard user focuses its labelled region
- Then the table scrolls inside that region, the page itself does not scroll sideways, and header and cell semantics stay intact
