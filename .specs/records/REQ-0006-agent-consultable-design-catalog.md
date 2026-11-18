---
id: REQ-0006
title: Agents working in any repository can consult a structured catalog of tokens, components, and usage rules
status: active
because: [FCT-0005, FCT-0009]
---

## Statement
The design system MUST expose a structured, agent-consultable catalog covering every available token, Atom, Molecule, Organism, and Template — including its tag or identifier, declared inputs/attributes, content slots, emitted events, accessibility obligations, and compositional examples — so agents building user interfaces in other repositories can query and apply the design system without inspecting internal implementation code.

## Acceptance
- Given an agent in a separate repository tasked with building a new user interface
- When the agent consults the design system catalog
- Then the agent can identify the required tokens, component contracts, and composition examples without reading internal component source files
