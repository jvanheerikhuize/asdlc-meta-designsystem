---
id: REQ-0004
title: Molecules compose Atoms into single-purpose interactive groups with slot and event contracts
status: active
because: [FCT-0001, FCT-0007]
---

## Statement
Molecules (such as Form Field, Search Bar, and Media/Poster Card) MUST compose multiple Atoms through explicit content slots and emit high-level semantic events (such as search submission or card selection) without leaking internal Atom layout details to parent containers.

## Acceptance
- Given a Search Bar Molecule composed of Label, Text Input, and Button Atoms
- When the user enters a query and submits via keyboard or the action Button
- Then the Molecule emits a single semantic search event carrying the current query value

- Given a Form Field or Search Bar Molecule whose value is set before it is placed in a view
- When it is placed in the view and the user edits it
- Then it first shows the value that was set and afterwards reports the edited value

- Given a clearable Search Bar Molecule with a query
- When the user clears it with the clear control or Escape
- Then the query is empty, the change is reported once, and focus stays in the input

- Given a Form Field Molecule inside a form
- When the form is submitted or reset
- Then the Form Field takes part like a Text Input
