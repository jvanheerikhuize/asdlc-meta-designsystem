---
id: FCT-0010
title: The design system uses six tiers with tokens as the first and Pages outside the shared package
status: active
evidence: "Project owner policy decision (2026-11-25): definitions of the six tiers Tokens, Atoms, Molecules, Organisms, Templates and Pages, and their one-way dependency rule."
---

## Statement
The design system has six tiers. Tokens are named, non-renderable values and the only place for raw visual values. Atoms wrap one foundational control or element and hold only local state. Molecules combine two or three kinds of Atom for one task. Organisms are self-contained regions with their own choreography. Templates are content-agnostic skeletons with named slots that own responsive placement. Pages fill Templates with real data and live in consumers, not in the shared package. A lower tier never knows a higher one.
