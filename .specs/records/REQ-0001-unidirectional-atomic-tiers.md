---
id: REQ-0001
title: Components are organized into five unidirectional Atomic Design tiers with strict composition
status: active
because: [FCT-0001]
---

## Statement
Every design system artifact MUST belong to one of five hierarchical tiers — Atoms, Molecules, Organisms, Templates, or Pages. Dependencies MUST flow strictly downward (a lower tier MUST NOT import or depend on any higher tier), every Molecule MUST compose at least one Atom rather than standing alone, and Molecules and Organisms MUST compose Atom controls and foundational surface Atoms instead of re-implementing raw form/button controls or duplicate container chrome.

## Acceptance
- Given a Molecule composed of Atom controls and design tokens
- When the dependency direction and composition graph are inspected
- Then the Molecule imports and composes at least one Atom, depends only on Atoms and tokens, and no Atom depends on any higher tier
