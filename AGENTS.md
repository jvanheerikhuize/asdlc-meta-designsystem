# Agent Directives

1. **Keep records honest.** Every `REQ` in `.specs/records/` cites its grounds in `because`. Never mark a requirement `active` while it rests on an open assumption or an open question blocks it. When you do not know something and have no candidate answer, add a `QST` instead of guessing. Run `python3 ~/.agents/skills/asdlc-spec-workflow/scripts/sync_specs.py --apply` before committing.
2. **Keep records stack-agnostic.** Describe behaviour in `.specs/records/`, not languages, frameworks, databases or vendors. Render compiled specs to `specs/` (`specs/README.md` + `specs/SPC-*.md`).
3. **Keep it small.** Five record types in `.specs/records/`, zero vendored spec engine (`Spec-Blueprint: asdlc-meta-specs@latest` in `TECH_STACK.md`).
4. **Diagrams in Markdown use Mermaid**, with labels that contain special characters quoted.
