# ASDLC Meta-DesignSystem

A vanilla, atom-based design system built with plain HTML, CSS, and JavaScript, following Brad Frost's Atomic Design methodology and drawing visual and UX inspiration from [`lumen`](https://github.com/jvanheerikhuize/lumen), specified using the `asdlc-meta-specs` epistemic record graph.

## Atomic Architecture

1. **Atoms:** Foundational tokens and indivisible controls (buttons, inputs, labels, badges, icons, loading skeletons).
2. **Molecules:** Small functional groups (form fields, search bars, media/poster cards).
3. **Organisms:** Standalone interface sections (site header/navbar, modal dialogs, catalog grids).
4. **Templates:** Structural page blueprints arranging organisms into responsive grids.
5. **Pages:** Live instances populated with real content to test the system under real-world conditions.

## Working with Specifications

```bash
pip install -r requirements.txt
python3 tools/spec.py check --strict
python3 tools/spec.py render --tier skeleton --stack TECH_STACK.md
python3 tools/spec.py index
```

All technology-specific choices (Web Components, Shadow DOM, CSS Custom Properties, and Lumen visual tokens) live in [`TECH_STACK.md`](TECH_STACK.md), while `records/` stays strictly behavioral and stack-agnostic.
