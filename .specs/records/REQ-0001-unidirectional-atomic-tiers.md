---
id: REQ-0001
title: Components are organized into five unidirectional Atomic Design tiers
status: active
because: [FCT-0001]
---

## Statement
Every design system artifact MUST belong to one of five hierarchical tiers — Atoms, Molecules, Organisms, Templates, or Pages — and components at a lower tier MUST NOT import or depend on components from a higher tier.

## Acceptance
- Given a Molecule composed of Atom controls and design tokens
- When the dependency direction is inspected
- Then the Molecule depends only on Atoms and tokens, and no Atom depends on any Molecule, Organism, Template, or Page
