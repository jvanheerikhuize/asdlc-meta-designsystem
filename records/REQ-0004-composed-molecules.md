---
id: REQ-0004
title: Molecules compose Atoms into single-purpose interactive groups with slot and event contracts
status: provisional
because: [FCT-0001, ASM-0001]
---

## Statement
Molecules (such as Form Field, Search Bar, and Media/Poster Card) MUST compose multiple Atoms through explicit content slots and emit high-level semantic events (such as search submission or card selection) without leaking internal Atom layout details to parent containers.

## Acceptance
- Given a Search Bar Molecule composed of Label, Text Input, and Button Atoms
- When the user enters a query and submits via keyboard or the action Button
- Then the Molecule emits a single semantic search event carrying the current query value
