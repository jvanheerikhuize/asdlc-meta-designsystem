"""Specification graph checks and requirement citation tests for asdlc-meta-designsystem."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
import spec  # noqa: E402


class SpecGraphTest(unittest.TestCase):
    def test_repository_records_pass_strict(self):
        errors, warnings = spec.check(spec.load())
        self.assertEqual(errors, [])
        self.assertEqual(warnings, [])

    def test_unidirectional_atomic_tiers(self):  # REQ-0001#1
        records = spec.load()
        self.assertEqual(records["REQ-0001"].status, "active")
        self.assertEqual(records["SPC-0001"].meta.get("tier"), "skeleton")
        self.assertEqual(records["SPC-0001"].meta.get("depends_on") or [], [])

    def test_index_builds_cleanly(self):
        index = spec.to_index(spec.load())
        self.assertEqual(index["summary"]["errors"], 0)
        self.assertEqual(index["issues"], [])
        self.assertIn("SPC-0001", index["spec_order"])
