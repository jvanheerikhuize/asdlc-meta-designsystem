---
id: FCT-0003
title: Design system ships dark-first default tokens with an explicit light theme preset
status: active
evidence: "Project owner policy decision (2026-11-18) resolving QST-0001: ship both dark-first default tokens and a light theme token preset in SPC-0001 so light-mode consumers are supported from the start."
---

## Statement
The design system MUST ship both the Lumen-inspired dark-first token preset as its default and an explicit light-theme semantic token preset in the walking skeleton (`SPC-0001`), using shared semantic token names so components adapt between themes without structural changes.
