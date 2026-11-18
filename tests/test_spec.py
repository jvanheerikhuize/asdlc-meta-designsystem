"""Specification graph checks and requirement citation tests for asdlc-meta-designsystem."""
import importlib.util
import os
import tempfile
import unittest
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _load_spec_module():
    local_blueprint = ROOT.parent / "asdlc-meta-specs" / "tools" / "spec.py"
    if local_blueprint.is_file():
        spec_path = local_blueprint
    else:
        tmp = Path(tempfile.gettempdir()) / "asdlc-blueprint-spec.py"
        if not tmp.is_file():
            url = os.environ.get(
                "ASDLC_SPEC_BLUEPRINT_URL",
                "https://jvanheerikhuize.github.io/asdlc-meta-specs/latest/tools/spec.py",
            )
            urllib.request.urlretrieve(url, tmp)
        spec_path = tmp
    mod_spec = importlib.util.spec_from_file_location("spec", spec_path)
    mod = importlib.util.module_from_spec(mod_spec)
    mod_spec.loader.exec_module(mod)
    return mod


spec = _load_spec_module()


class SpecGraphTest(unittest.TestCase):
    def test_repository_records_pass_strict(self):
        errors, warnings = spec.check(spec.load(ROOT))
        self.assertEqual(errors, [])
        self.assertEqual(warnings, [])

    def test_unidirectional_atomic_tiers(self):  # REQ-0001#1
        records = spec.load(ROOT)
        self.assertEqual(records["REQ-0001"].status, "active")
        self.assertEqual(records["SPC-0001"].meta.get("tier"), "skeleton")
        self.assertEqual(records["SPC-0001"].meta.get("depends_on") or [], [])

    def test_index_builds_cleanly(self):
        index = spec.to_index(spec.load(ROOT), ROOT)
        self.assertEqual(index["summary"]["errors"], 0)
        self.assertEqual(index["issues"], [])
        self.assertEqual(index["records_dir"], ".specs/records")
        self.assertIn("SPC-0001", index["spec_order"])
