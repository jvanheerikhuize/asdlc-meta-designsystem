---
id: REQ-0005
title: Organisms, Templates, and Pages assemble Molecules into responsive, accessible application views
status: active
because: [FCT-0001, FCT-0004, FCT-0007, FCT-0010]
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

- Given a Popover with a heading
- When the user activates its close control
- Then the Popover closes, focus returns to the trigger, and the close is reported once

- Given a Modal Dialog, Drawer or Toast
- When the user activates its close control
- Then the close is reported once

- Given a Data Table or Catalog Grid that is loading or has no items
- When it is rendered
- Then it shows a loading placeholder or an empty message in place of its items

- Given a Template in a narrow view
- When its slots are filled
- Then they stack without sideways scrolling, and a footer without content takes no space
