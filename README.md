# ASDLC Meta-DesignSystem

A vanilla, atom-based design system built with plain HTML, CSS, and JavaScript, extending Brad Frost's Atomic Design with a token tier and drawing visual and UX inspiration from [`lumen`](https://github.com/jvanheerikhuize/lumen), specified using the `asdlc-meta-specs` epistemic record graph.

## Tiers

Dependencies go one way: a tier never knows a higher one.

1. **Tokens:** named values. The only place for raw colors, lengths, layers and durations.
2. **Atoms:** one foundational HTML element each, styled only with tokens, with local state only.
3. **Molecules:** at most three kinds of atom, not counting text atoms, for one task.
4. **Organisms:** self-contained regions that compose at least one molecule, with their own choreography, such as focus, loading and empty states.
5. **Templates:** content-agnostic skeletons with slots and responsive placement.
6. **Pages:** templates with real data. They live in consumers; the [`showcase/`](showcase/) here is one.

Tiers 1 to 5 are the shared package in [`src/`](src/). See [`catalog.md`](catalog.md) for every token and component.

## Working with Specifications

Records in `.specs/records/` are behavioral and stack-agnostic, `specs/` is rendered from them, and technology choices live in [`TECH_STACK.md`](TECH_STACK.md).

```bash
python3 ~/.agents/skills/asdlc-spec-workflow/scripts/sync_specs.py --apply --repo .
python3 -m unittest discover -s tests
```
