---
id: REQ-0006
title: Agents working in any repository can consult a structured catalog of tokens, components, and usage rules
status: active
because: [FCT-0005, FCT-0009, FCT-0010]
---

## Statement
The design system MUST expose a structured, agent-consultable catalog organized by the six tiers and covering every available token, Atom, Molecule, Organism, and Template — including its tag or identifier, declared inputs/attributes, content slots, emitted events, accessibility obligations, and compositional examples — so agents building user interfaces in other repositories can query and apply the design system without inspecting internal implementation code. Each tier MUST state its purpose, the tiers it may use and its members, and each component MUST list the components it composes.

## Acceptance
- Given an agent in a separate repository tasked with building a new user interface
- When the agent consults the design system catalog
- Then the agent can identify the required tokens, component contracts, and composition examples without reading internal component source files

- Given the catalog in any of its forms
- When a reader goes through it from top to bottom
- Then it follows the tier order from Tokens to Pages, every token and component appears in exactly one tier, and the listed composition matches the implementation

- Given a reader who looks at one component in the live catalog
- When they want to know what it is made of or where it is used
- Then they can follow links to the lower-tier components it composes and to the components that compose it
