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
        catalog = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))
        text_atoms = {c["tag"] for c in catalog["components"] if c.get("textOnly")}
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
                    # REQ-0008
                    self.assertNotRegex(src, r"<(?:h[1-6]|p|strong|small|code|a|input|button|select|textarea|img)[ >]", "an atom covers this element")
                    self.assertTrue(atoms, "a molecule must compose atoms")
                    counted = atoms - text_atoms
                    self.assertLessEqual(len(counted), 3, f"at most three kinds besides text atoms, got {sorted(counted)}")
                if tier == "organisms":
                    molecules = {t for t in composed if (ROOT / "src/molecules" / f"{t}.js").is_file()}
                    self.assertTrue(molecules, "an organism must compose at least one molecule")
                    template = src[src.index("innerHTML = `"):src.index("`;")]
                    self.assertNotRegex(template, r"<(?:h[1-6]|p|strong|small|code|a|input|button|select|textarea|img)[ >]|aria-live|overflow-[xy]:|display: grid", "an atom covers this")
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
                self.assertNotRegex(css, r"color-mix\(|cursor:(?!\s*(?:var|inherit))|scale\((?![01]\)|var)", "derived color, raw cursor or raw scale")
                self.assertNotRegex(css, r"(?<![\w-])\d*\.?\d+em\b|\b(?:linear|ease|ease-in|ease-out|ease-in-out)(?=[ ,;])", "raw em length or easing")
                if path.parent.name == "atoms":
                    self.assertTrue(set(re.findall(r"var\((--[a-z0-9-]+)\)", css)) & set(dark), "an atom must use tokens")
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

    def test_extended_vocabulary_contrast_and_theming(self):  # REQ-0002
        css_text = (ROOT / "src" / "tokens" / "tokens.css").read_text(encoding="utf-8")
        blocks = {
            "dark": re.search(r":root\s*\{(.*?)\n\}", css_text, re.S)[1],
            "light": re.search(r'\[data-theme="light"\]\s*\{(.*?)\n\}', css_text, re.S)[1],
        }
        pairs = {theme: re.findall(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", block) for theme, block in blocks.items()}
        for theme, found in pairs.items():
            self.assertEqual(len(found), len(dict(found)), f"{theme}: duplicate tokens")
        raw_dark, raw_light = dict(pairs["dark"]), dict(pairs["light"])
        self.assertFalse(set(raw_light) - set(raw_dark), "light-only tokens")

        # A token that refers to a themed token must be repeated in the light block,
        # because custom properties resolve where they are declared.
        themed = set(raw_light)
        for name, value in raw_dark.items():
            if themed & set(re.findall(r"var\((--[a-z0-9-]+)\)", value)):
                self.assertIn(name, raw_light, f"{name} depends on a themed token")

        def rgba(value):
            if value.startswith("#"):
                return (*_hex_to_rgb(value), 1.0)
            return tuple(float(x) for x in re.findall(r"[\d.]+", value))

        def over(top, bottom):
            r, g, b, a = rgba(top)
            return "#" + "".join(f"{round(a * t + (1 - a) * u):02x}" for t, u in zip((r, g, b), _hex_to_rgb(bottom)))

        for theme, tokens in zip(("dark", "light"), _parse_tokens(css_text)):
            def check(fg, bg, minimum):
                ratio = _contrast_ratio(over(tokens[fg], bg), bg)
                self.assertGreaterEqual(ratio, minimum, f"{theme} {fg} on {bg}: {ratio:.2f}:1")

            for base in ("--color-bg", "--color-surface", "--color-surface-elevated"):
                bg = tokens[base]
                for fg in ("link", "link-hover", "link-visited", "heading", "fg-placeholder", "data-axis", "icon", "data-positive", "data-negative"):
                    check(f"--color-{fg}", bg, 4.5)
                for fg in ["border-control", "caret", "border-selected"] + [f"data-{i}" for i in range(1, 11)]:
                    check(f"--color-{fg}", bg, 3)
                for status in ("info", "success", "warning", "danger", "accent", "neutral"):
                    for tint in ("subtle", "subtle-hover"):
                        check(f"--color-{status}-text", over(tokens[f"--color-{status}-{tint}"], bg), 4.5)
            for status in ("info", "success", "warning", "danger", "accent", "neutral"):
                for state in ("", "-hover", "-active"):
                    check(f"--color-{status}-fg", tokens[f"--color-{status}{state}"], 4.5)
            check("--color-fg-inverse", tokens["--color-surface-inverse"], 4.5)
            check("--color-match-active-fg", tokens["--color-match-active"], 4.5)
            for fg in (t for t in tokens if t.startswith("--color-code-") and not t.endswith(("-bg", "-active"))):
                check(fg, tokens["--color-code-bg"], 4.5)
            for line, text in (("inserted", "inserted"), ("deleted", "deleted")):
                check(f"--color-code-{text}", over(tokens[f"--color-code-{line}-bg"], tokens["--color-code-bg"]), 4.5)

        reduced = css_text[css_text.index("@media (prefers-reduced-motion"):]
        for name, value in raw_dark.items():
            if re.match(r"--(?:duration|travel|scale)-", name) and value != "0ms":
                self.assertRegex(reduced, rf"{name}: (?:0ms|0px|1);", f"{name} needs a reduced-motion value")

    def test_foundational_atoms_encapsulation_and_exports(self):  # REQ-0003
        expected = [
            "ui-abbr", "ui-arrow", "ui-audio", "ui-avatar", "ui-badge", "ui-button", "ui-center",
            "ui-checkbox", "ui-chip", "ui-cluster", "ui-code", "ui-color-input", "ui-counter",
            "ui-disclosure", "ui-divider", "ui-dot", "ui-embed", "ui-fieldset", "ui-file-input",
            "ui-glow", "ui-grid", "ui-handle", "ui-heading", "ui-hint", "ui-icon", "ui-image",
            "ui-input", "ui-kbd", "ui-label", "ui-link", "ui-list", "ui-live", "ui-mark",
            "ui-marker", "ui-menu-item", "ui-meter", "ui-nav-link", "ui-number", "ui-number-input",
            "ui-output", "ui-progress", "ui-quote", "ui-radio", "ui-rating", "ui-ratio", "ui-ring",
            "ui-scrim", "ui-scroll", "ui-select", "ui-skeleton", "ui-skip-link", "ui-slider",
            "ui-spacer", "ui-sparkline", "ui-spinner", "ui-stack", "ui-step-marker", "ui-surface",
            "ui-swatch", "ui-switch", "ui-text", "ui-textarea", "ui-time", "ui-tooltip", "ui-trend",
            "ui-video", "ui-visually-hidden",
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

        for group, tokens in catalog["tokens"].items():
            for token in tokens if group != "primitives" else []:
                self.assertIn(f"`{token['name']}`", catalog_md)

        documented_tags = {c["tag"]: c for c in catalog["components"]}
        expected_tags = {
            "ui-abbr", "ui-arrow", "ui-audio", "ui-avatar", "ui-badge", "ui-button", "ui-center",
            "ui-checkbox", "ui-chip", "ui-cluster", "ui-code", "ui-color-input", "ui-counter",
            "ui-disclosure", "ui-divider", "ui-dot", "ui-embed", "ui-fieldset", "ui-file-input",
            "ui-glow", "ui-grid", "ui-handle", "ui-heading", "ui-hint", "ui-icon", "ui-image",
            "ui-input", "ui-kbd", "ui-label", "ui-link", "ui-list", "ui-live", "ui-mark",
            "ui-marker", "ui-menu-item", "ui-meter", "ui-nav-link", "ui-number", "ui-number-input",
            "ui-output", "ui-progress", "ui-quote", "ui-radio", "ui-rating", "ui-ratio", "ui-ring",
            "ui-scrim", "ui-scroll", "ui-select", "ui-skeleton", "ui-skip-link", "ui-slider",
            "ui-spacer", "ui-sparkline", "ui-spinner", "ui-stack", "ui-step-marker", "ui-surface",
            "ui-swatch", "ui-switch", "ui-text", "ui-textarea", "ui-time", "ui-tooltip", "ui-trend",
            "ui-video", "ui-visually-hidden",
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

        # The catalog follows the six tiers in all its forms.
        tiers = {t["id"]: t for t in catalog["tiers"]}
        self.assertEqual(list(tiers), catalog["architecture"]["tiers"])
        self.assertEqual([t["order"] for t in catalog["tiers"]], [1, 2, 3, 4, 5, 6])
        self.assertEqual(tiers["tokens"]["members"], list(catalog["tokens"]))
        self.assertEqual(set(catalog["tokenGroups"]), set(catalog["tokens"]))
        self.assertEqual(tiers["pages"]["members"], [p["id"] for p in catalog["pages"]])
        showcase = (ROOT / "showcase" / "index.html").read_text(encoding="utf-8")
        page_html = re.sub(r"<article.*?</article>", "", showcase, flags=re.S)  # without the specimens
        for page in catalog["pages"]:
            self.assertEqual(page["templates"], [t for t in tiers["templates"]["members"] if re.search(rf"<{t}\b", page_html)])
        md_sections = {m[1].lower(): m[2] for m in re.finditer(r"^## \d\. (\w+).*?$(.*?)(?=^## |\Z)", catalog_md, re.M | re.S)}
        self.assertEqual(list(md_sections), list(tiers))
        html_sections = {m[1]: m[2] for m in re.finditer(r'<section class="tier" id="(\w+)"(.*?)</section>', showcase, re.S)}
        self.assertEqual(list(html_sections), list(tiers))
        for tier, path, src in _component_sources():
            entry = documented_tags[path.stem]
            composes = (_composed_tags(src) | set(re.findall(r"createElement\('(ui-[a-z-]+)'\)", src))) - {path.stem}
            self.assertEqual(entry["composes"], sorted(composes), path.stem)
            self.assertEqual(entry["tier"], tier)
            self.assertIn(path.stem, tiers[tier]["members"])
            for tag in composes:
                self.assertIn(documented_tags[tag]["tier"], tiers[tier]["mayUse"])
            cell = ", ".join(f"`{t}`" for t in entry["composes"]) or "—"
            self.assertIn(f"| `<{path.stem}>` | {cell} |", md_sections[tier])
        for tier in ("atoms", "molecules", "organisms", "templates"):
            self.assertEqual(tiers[tier]["members"], [c["tag"] for c in catalog["components"] if c["tier"] == tier])
            self.assertEqual(tiers[tier]["members"], re.findall(r"^\| `<([a-z-]+)>` ", md_sections[tier], re.M))
            self.assertEqual(tiers[tier]["members"], re.findall(r'<article [^>]*data-id="([a-z-]+)"', html_sections[tier]))

        index_js = (ROOT / "src" / "index.js").read_text(encoding="utf-8")
        exported = re.findall(r"^export \{ (\w+) \}", index_js, re.M)
        self.assertEqual(sorted(exported), sorted(c["className"] for c in catalog["components"]))
        self.assertEqual(exported, catalog["entrypointExports"][:len(exported)])
        for tier in ("atoms", "molecules", "organisms", "templates"):
            listed = re.findall(r"'([a-z-]+)'", re.search(rf"export const {tier.upper()} = \[(.*?)\];", index_js, re.S)[1])
            self.assertEqual(sorted(listed), sorted(tiers[tier]["members"]))

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
