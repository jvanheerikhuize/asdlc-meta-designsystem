"""Automated verification for SPC-0001 + SPC-0002 (tokens, strict Atomic tiers, catalog, Pages, WCAG AA contrast)."""
import json
import os
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def _relative_luminance(rgb: tuple[int, int, int]) -> float:
    def channel(c: int) -> float:
        s = c / 255.0
        return s / 12.92 if s <= 0.03928 else ((s + 0.055) / 1.055) ** 2.4

    r, g, b = (channel(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def _contrast_ratio(c1: str, c2: str) -> float:
    l1 = _relative_luminance(_hex_to_rgb(c1))
    l2 = _relative_luminance(_hex_to_rgb(c2))
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def _parse_tokens(css_text: str) -> tuple[dict[str, str], dict[str, str]]:
    root_match = re.search(r":root\s*\{(.*?)\n\}", css_text, re.S)
    light_match = re.search(r'\[data-theme="light"\]\s*\{(.*?)\n\}', css_text, re.S)
    assert root_match and light_match, "Expected :root and [data-theme='light'] blocks"

    def extract(block: str) -> dict[str, str]:
        return dict(re.findall(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", block))

    dark = extract(root_match.group(1))
    light = {**dark, **extract(light_match.group(1))}
    def resolve(tokens: dict[str, str]) -> dict[str, str]:
        out = {}
        for name, value in tokens.items():
            while match := re.search(r"var\((--[a-z0-9-]+)\)", value):
                value = value.replace(match[0], tokens[match[1]])
            out[name] = value
        return out

    return resolve(dark), resolve(light)


def _component_sources() -> list[tuple[str, Path, str]]:
    tiers = ("atoms", "molecules", "organisms", "templates")
    return [(t, p, p.read_text(encoding="utf-8")) for t in tiers for p in sorted((ROOT / "src" / t).glob("*.js"))]


def _composed_tags(src: str) -> set[str]:
    return set(re.findall(r"<((?:ui|page|catalog|detail|workspace)-[a-z-]+)[\s>]", re.sub(r"/\*.*?\*/", "", src, flags=re.S)))


class DesignSystemTest(unittest.TestCase):
    def test_unidirectional_atom_dependencies_and_strict_composition(self):  # REQ-0001
        tier_order = {"atoms": 1, "molecules": 2, "organisms": 3, "templates": 4}
        for tier, rank in tier_order.items():
            for path in sorted((ROOT / "src" / tier).glob("*.js")):
                src = path.read_text(encoding="utf-8")
                imports = re.findall(r"^\s*import\s+.*?(?:from\s+)?['\"]([^'\"]+)['\"]", src, re.M)
                for imp in imports:
                    self.assertTrue(imp.startswith("../"), f"{tier}/{path.name} must not import external {imp}")
                    target_tier = imp.split("/")[1]
                    self.assertIn(target_tier, ("tokens", *tier_order.keys()))
                    if target_tier in tier_order:
                        self.assertLess(
                            tier_order[target_tier],
                            rank,
                            f"{tier}/{path.name} cannot import higher/same tier {imp}",
                        )

                if tier == "molecules":
                    atom_imports = [i for i in imports if i.startswith("../atoms/")]
                    self.assertTrue(atom_imports, f"Molecule {path.name} MUST import and compose at least one Atom")

                if tier in ("molecules", "organisms"):
                    self.assertNotRegex(
                        src,
                        r"<(?:button|input|select|textarea)\b",
                        f"{tier}/{path.name} must compose Atom controls rather than raw <button>/<input>/<select>/<textarea>",
                    )
                    src_no_backdrop = re.sub(r"dialog::backdrop\s*\{[^}]*\}", "", src, flags=re.S)
                    self.assertNotIn(
                        "backdrop-filter",
                        src_no_backdrop,
                        f"{tier}/{path.name} must compose <ui-surface variant='glass'> instead of duplicating backdrop-filter",
                    )

    def test_six_tier_boundaries(self):  # REQ-0001
        package = {p.name for p in (ROOT / "src").iterdir()}
        self.assertEqual(package, {"index.js", "tokens", "atoms", "molecules", "organisms", "templates"})
        for tier, path, src in _component_sources():
            imports = set(re.findall(r"^import .*?['\"]\.\./[a-z]+/([a-z-]+)\.js['\"]", src, re.M))
            composed = _composed_tags(src)
            with self.subTest(component=path.name):
                unused = {tag for tag in imports if tag not in composed and f"createElement('{tag}')" not in src
                          and not re.search(rf"import \{{.*\}} from '[^']*{tag}\.js'", src)}
                self.assertFalse(unused, "unused imports")
                self.assertFalse(composed - imports - {path.stem}, "composed without import")
                if tier in ("atoms", "templates"):
                    self.assertFalse(composed, f"{tier} must not name other components")
                    self.assertFalse(imports)
                if tier == "molecules":
                    atoms = {t for t in composed if (ROOT / "src/atoms" / f"{t}.js").is_file()}
                    self.assertTrue(1 <= len(atoms) <= 3, f"one to three kinds of atom, got {sorted(atoms)}")
                if tier == "organisms":
                    self.assertTrue(composed, "an organism must compose lower tiers")
                if tier == "templates":
                    self.assertIn("<slot", src)
                    self.assertIn(":host([hidden])", src)

    def test_components_take_visual_values_from_tokens(self):  # REQ-0002
        css_text = (ROOT / "src" / "tokens" / "tokens.css").read_text(encoding="utf-8")
        dark, _ = _parse_tokens(css_text)
        for line in re.findall(r"^\s+--(?:color|glow)-[^;]+;", css_text, re.M):
            self.assertRegex(line, r": var\(--palette-[a-z0-9-]+\);", "semantic colors must alias a primitive")
        for _, path, src in _component_sources():
            css = " ".join(re.findall(r"<style>(.*?)</style>|replaceSync\(`(.*?)`\)", src, re.S)[0]) + src[src.find("replaceSync"):] * ("replaceSync" in src)
            css = re.sub(r"@(?:media|container)[^{]*", "", re.sub(r"/\*.*?\*/", "", css, flags=re.S))
            with self.subTest(component=path.name):
                self.assertNotRegex(css, r"#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(", "raw color")
                self.assertNotRegex(css, r"(?<![\w-])\d*\.?\d+(?:px|rem)\b", "raw length")
                self.assertNotRegex(css, r"(?:z-index|font-weight):\s*[1-9]|opacity:\s*0\.\d|[0-9]m?s\b(?=[ ;])", "raw layer, weight, opacity or duration")
                self.assertNotIn("--palette-", src, "primitives are for semantic tokens only")
                fallbacks = [t for t in re.findall(r"var\((--[a-z0-9-]+)\s*,", src) if t in dark]
                self.assertFalse(fallbacks, "fallback values")
                used = set(re.findall(r"var\((--[a-z0-9-]+)\)", css))
                local = set(re.findall(r"(--[a-z0-9_-]+):", css)) | set(re.findall(r"setProperty\('(--[a-z0-9-]+)'", src))
                self.assertFalse(used - set(dark) - local, "unknown tokens")

    def test_lumen_tokens_wcag_aa_contrast_and_reduced_motion(self):  # REQ-0002
        css_path = ROOT / "src" / "tokens" / "tokens.css"
        css_text = css_path.read_text(encoding="utf-8")
        self.assertIn("@media (prefers-reduced-motion: reduce)", css_text)

        dark, light = _parse_tokens(css_text)
        for theme_name, tokens in (("dark", dark), ("light", light)):
            for bg_key in ("--color-bg", "--color-surface"):
                bg = tokens[bg_key]
                for fg_key in (
                    "--color-fg",
                    "--color-fg-secondary",
                    "--color-fg-muted",
                    "--color-accent",
                    "--color-focus-ring",
                    "--color-info",
                    "--color-success",
                    "--color-warning",
                ):
                    ratio = _contrast_ratio(tokens[fg_key], bg)
                    self.assertGreaterEqual(
                        ratio,
                        4.5,
                        f"{theme_name} {fg_key} ({tokens[fg_key]}) on {bg_key} ({bg}) = {ratio:.2f}:1 < 4.5:1",
                    )

            accent_ratio = _contrast_ratio(tokens["--color-accent-fg"], tokens["--color-accent"])
            self.assertGreaterEqual(accent_ratio, 4.5, f"{theme_name} accent-fg contrast {accent_ratio:.2f}:1")

            danger_ratio = _contrast_ratio(tokens["--color-danger-fg"], tokens["--color-danger"])
            self.assertGreaterEqual(danger_ratio, 4.5, f"{theme_name} danger-fg contrast {danger_ratio:.2f}:1")

    def test_foundational_atoms_encapsulation_and_exports(self):  # REQ-0003
        expected = [
            "ui-button", "ui-input", "ui-label", "ui-badge", "ui-icon", "ui-skeleton",
            "ui-chip", "ui-progress", "ui-textarea", "ui-select", "ui-dot", "ui-checkbox",
            "ui-slider", "ui-switch", "ui-tooltip", "ui-surface", "ui-divider",
        ]
        index_js = (ROOT / "src" / "index.js").read_text(encoding="utf-8")
        for tag in expected:
            atom_path = ROOT / "src" / "atoms" / f"{tag}.js"
            self.assertTrue(atom_path.is_file(), f"Missing {atom_path}")
            code = atom_path.read_text(encoding="utf-8")
            self.assertIn("attachShadow({ mode: 'open'", code)
            self.assertIn(f"customElements.define('{tag}'", code)
            self.assertIn(f"./atoms/{tag}.js", index_js)

    def test_molecules_compose_atoms_and_emit_semantic_events(self):  # REQ-0004
        expected = {
            "ui-field": "ui-input",
            "ui-search-bar": "ui-search",
            "ui-media-card": "ui-select",
            "ui-stat-tile": "ui-dot",
            "ui-callout": "ui-icon",
            "ui-code-block": "ui-copy",
            "ui-toolbar": "ui-navigate",
            "ui-tabs": "ui-change",
            "ui-panel-header": "ui-close",
            "ui-empty-state": "ui-icon",
            "ui-theme-toggle": "ui-theme-change",
        }
        index_js = (ROOT / "src" / "index.js").read_text(encoding="utf-8")
        for tag, event_name in expected.items():
            code = (ROOT / "src" / "molecules" / f"{tag}.js").read_text(encoding="utf-8")
            self.assertIn(f"customElements.define('{tag}'", code)
            self.assertIn(f"./molecules/{tag}.js", index_js)
            if tag not in ("ui-field", "ui-stat-tile", "ui-callout"):
                self.assertIn(event_name, code)

    def test_organisms_and_templates_compose_lower_tiers(self):  # REQ-0005
        organisms = ["ui-navbar", "ui-modal", "ui-catalog-grid", "ui-popover", "ui-drawer", "ui-toast", "ui-table"]
        templates = ["page-shell", "catalog-layout", "detail-layout", "workspace-layout"]
        index_js = (ROOT / "src" / "index.js").read_text(encoding="utf-8")
        for tag in organisms:
            code = (ROOT / "src" / "organisms" / f"{tag}.js").read_text(encoding="utf-8")
            self.assertIn(f"customElements.define('{tag}'", code)
            self.assertIn(f"./organisms/{tag}.js", index_js)
        modal_code = (ROOT / "src" / "organisms" / "ui-modal.js").read_text(encoding="utf-8")
        self.assertIn("<dialog", modal_code)
        self.assertIn("showModal()", modal_code)
        toast_code = (ROOT / "src" / "organisms" / "ui-toast.js").read_text(encoding="utf-8")
        self.assertIn("<ui-callout", toast_code)
        for tag in templates:
            code = (ROOT / "src" / "templates" / f"{tag}.js").read_text(encoding="utf-8")
            self.assertIn(f"customElements.define('{tag}'", code)
            self.assertIn(f"./templates/{tag}.js", index_js)

    def test_agent_consultable_catalog_and_global_skill(self):  # REQ-0006
        catalog = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))
        catalog_md = (ROOT / "catalog.md").read_text(encoding="utf-8")

        dark, _ = _parse_tokens((ROOT / "src" / "tokens" / "tokens.css").read_text(encoding="utf-8"))
        documented_tokens = {
            t["name"]
            for group in catalog["tokens"].values()
            for t in group
        }
        self.assertEqual(set(dark.keys()), documented_tokens)

        dark, light = _parse_tokens((ROOT / "src" / "tokens" / "tokens.css").read_text(encoding="utf-8"))
        for token in (t for group in catalog["tokens"].values() for t in group):
            for key, theme in (("dark", dark), ("light", light), ("value", dark)):
                if key in token:
                    self.assertEqual(token[key].replace(" ", ""), re.sub(r"\s", "", theme[token["name"]]), token["name"])

        documented_tags = {c["tag"]: c for c in catalog["components"]}
        expected_tags = {
            "ui-button", "ui-input", "ui-label", "ui-badge", "ui-icon", "ui-skeleton",
            "ui-chip", "ui-progress", "ui-textarea", "ui-select", "ui-dot", "ui-checkbox",
            "ui-slider", "ui-switch", "ui-tooltip", "ui-surface", "ui-divider",
            "ui-field", "ui-search-bar", "ui-media-card", "ui-stat-tile", "ui-callout",
            "ui-code-block", "ui-toolbar", "ui-tabs", "ui-panel-header", "ui-empty-state", "ui-theme-toggle",
            "ui-navbar", "ui-modal", "ui-catalog-grid", "ui-popover", "ui-drawer", "ui-toast", "ui-table",
            "page-shell", "catalog-layout", "detail-layout", "workspace-layout",
        }
        self.assertEqual(set(documented_tags.keys()), expected_tags)
        for tag, entry in documented_tags.items():
            for field in ("tier", "module", "attributes", "slots", "events", "parts", "accessibility", "example"):
                self.assertIn(field, entry, f"{tag} missing {field} in catalog.json")
            self.assertIn(f"<{tag}>", catalog_md)

        if os.environ.get("CI") != "true":
            skill_path = Path.home() / ".agents" / "skills" / "asdlc-design-system" / "SKILL.md"
            self.assertTrue(skill_path.is_file(), f"Missing global skill at {skill_path}")
            self.assertIn("catalog.json", skill_path.read_text(encoding="utf-8"))

    def test_pages_dashboard_and_showcase_bidirectional_links(self):  # REQ-0007
        showcase_html = (ROOT / "showcase" / "index.html").read_text(encoding="utf-8")
        for tag in (c["tag"] for c in json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))["components"]):
            self.assertIn(f'data-component="{tag}"', showcase_html)
        self.assertIn('href="./specs/"', showcase_html)
        self.assertTrue((ROOT / "specs" / "README.md").is_file())
        self.assertTrue((ROOT / "specs" / "SPC-0001.md").is_file())
        self.assertTrue((ROOT / "specs" / "SPC-0002.md").is_file())
