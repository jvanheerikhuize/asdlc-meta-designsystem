---
id: FCT-0009
title: A self-describing design catalog and usage contract enables agents in other repositories to build consistent UIs
status: active
promoted_from: ASM-0003
evidence: "Validated across two stages: (1) isolated consumer-agent catalog trial surfaced six contract details that were added to catalog.json and catalog.md, and (2) separate repository asdlc-meta-specs (PR #35) consumed the published design tokens and components to rebuild its dashboard shell and summary tiles, passing all 42 repository tests and headless browser checks with zero console or page errors."
---

## Statement
Publishing a concise, machine- and agent-readable catalog documenting design tokens, component hierarchy, attributes, slots, events, and accessibility rules enables coding agents working in separate repositories to assemble consistent interfaces without inventing ad-hoc styles or duplicating primitives.
