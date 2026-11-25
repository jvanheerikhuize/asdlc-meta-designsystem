---
id: REQ-0001
title: Components are organized into six unidirectional tiers with strict composition
status: active
because: [FCT-0001, FCT-0010]
---

## Statement
Every design system artifact MUST belong to one of six hierarchical tiers — Tokens, Atoms, Molecules, Organisms, Templates, or Pages. Dependencies MUST flow strictly downward (a lower tier MUST NOT import or depend on any higher tier), every Molecule MUST compose one to three kinds of Atom, every Atom MUST take its visual values from Tokens, every Organism MUST compose at least one Molecule, Templates MUST NOT contain or name any component, Pages MUST live outside the shared package, and Molecules and Organisms MUST compose Atom controls and foundational surface Atoms instead of re-implementing raw form/button controls or duplicate container chrome.

## Acceptance
- Given a Molecule composed of Atom controls and design tokens
- When the dependency direction and composition graph are inspected
- Then the Molecule imports and composes at least one Atom, depends only on Atoms and tokens, and no Atom depends on any higher tier

- Given the shared package
- When its contents are inspected
- Then it contains no Page, and every Template exposes only slots
