---
id: ASM-0003
title: A self-describing design catalog and usage contract enables agents in other repositories to build consistent UIs
status: open
confidence: 0.8
---

## Statement
If the design system publishes a concise, machine- and agent-readable catalog documenting its design tokens, component hierarchy, attributes, slots, events, and accessibility rules, then coding agents working in separate repositories can consult it to assemble consistent interfaces without inventing ad-hoc styles or duplicating primitives.

## How we validate it
Have an agent in a separate consumer repository consult the published catalog to build a new UI view and measure token adherence, component reuse, and whether any missing contract details force the agent to guess.
