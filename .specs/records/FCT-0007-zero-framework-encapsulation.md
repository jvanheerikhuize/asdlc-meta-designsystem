---
id: FCT-0007
title: Encapsulated native components styled via shared design tokens scale across foundational tiers without external UI frameworks
status: active
promoted_from: ASM-0001
evidence: "Verified in SPC-0001 via tests/test_designsystem.py and tests/test_browser.mjs: all six foundational Atoms isolate internal structure, inherit shared design tokens across component boundaries in dark and light themes, enforce keyboard and disabled/busy activation rules, and carry zero external runtime dependencies."
---

## Statement
Every component encapsulates its internal structure and styling while consuming global design tokens and communicating through standard attributes, slots, and events, enabling Atomic Design tiers to be built and composed with zero third-party UI framework dependencies.
