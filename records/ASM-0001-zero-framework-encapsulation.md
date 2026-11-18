---
id: ASM-0001
title: Encapsulated native components styled via shared design tokens scale across all five tiers without external UI frameworks
status: open
confidence: 0.85
---

## Statement
If every component encapsulates its internal structure and styling while consuming global design tokens and communicating through standard attributes, slots, and events, then all five Atomic Design tiers can be built and composed with zero third-party UI framework dependencies.

## How we validate it
Implement the `SPC-0001` walking skeleton (tokens, foundational Atoms, and one composed Molecule) and verify style encapsulation, token propagation across component boundaries, keyboard accessibility, and zero external runtime imports in a clean browser session.
