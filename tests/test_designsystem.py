"""Automated verification for SPC-0001 (tokens, Atoms, catalog, Pages, WCAG AA contrast)."""
import json
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
    return dark, light


class DesignSystemTest(unittest.TestCase):
    def test_unidirectional_atom_dependencies_and_zero_external_imports(self):  # REQ-0001
        atoms_dir = ROOT / "src" / "atoms"
        atom_files = sorted(atoms_dir.glob("ui-*.js"))
        self.assertEqual(len(atom_files), 6)
        for path in atom_files:
            src = path.read_text(encoding="utf-8")
            imports = re.findall(r"^\s*import\s+.*?(?:from\s+)?['\"]([^'\"]+)['\"]", src, re.M)
            self.assertEqual(imports, [], f"{path.name} must have zero external/cross-tier imports, got {imports}")

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
        expected = ["ui-button", "ui-input", "ui-label", "ui-badge", "ui-icon", "ui-skeleton"]
        index_js = (ROOT / "src" / "index.js").read_text(encoding="utf-8")
        for tag in expected:
            atom_path = ROOT / "src" / "atoms" / f"{tag}.js"
            self.assertTrue(atom_path.is_file(), f"Missing {atom_path}")
            code = atom_path.read_text(encoding="utf-8")
            self.assertIn("attachShadow({ mode: 'open'", code)
            self.assertIn(f"customElements.define('{tag}'", code)
            self.assertIn(f"./atoms/{tag}.js", index_js)

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

        documented_tags = {c["tag"]: c for c in catalog["components"]}
        expected_tags = {"ui-button", "ui-input", "ui-label", "ui-badge", "ui-icon", "ui-skeleton"}
        self.assertEqual(set(documented_tags.keys()), expected_tags)
        for tag, entry in documented_tags.items():
            for field in ("tier", "module", "attributes", "slots", "events", "parts", "accessibility", "example"):
                self.assertIn(field, entry, f"{tag} missing {field} in catalog.json")
            self.assertIn(f"<{tag}>", catalog_md)

        skill_path = Path.home() / ".agents" / "skills" / "asdlc-design-system" / "SKILL.md"
        self.assertTrue(skill_path.is_file(), f"Missing global skill at {skill_path}")
        self.assertIn("catalog.json", skill_path.read_text(encoding="utf-8"))

    def test_pages_dashboard_and_showcase_bidirectional_links(self):  # REQ-0007
        dash_html = (ROOT / "site" / "index.html").read_text(encoding="utf-8")
        showcase_html = (ROOT / "site" / "showcase" / "index.html").read_text(encoding="utf-8")
        self.assertIn('href="./showcase/"', dash_html)
        self.assertIn('href="../"', showcase_html)
        self.assertTrue((ROOT / "site" / "showcase" / "src" / "index.js").is_file())
        self.assertTrue((ROOT / "site" / "showcase" / "src" / "tokens" / "tokens.css").is_file())
