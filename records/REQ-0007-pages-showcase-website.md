---
id: REQ-0007
title: Published site hosts both the specification dashboard and the live design-system Showcase website
status: provisional
because: [FCT-0004, FCT-0006, ASM-0001]
---

## Statement
The published static site MUST host both the specification dashboard and the live design-system Showcase website under a single deployment, with bidirectional navigation links between the specification dashboard and the Showcase.

## Acceptance
- Given the published static site deployment
- When a visitor opens the specification dashboard or the design-system Showcase path
- Then both sites render cleanly without asset path collisions and each provides a direct navigation link to the other
