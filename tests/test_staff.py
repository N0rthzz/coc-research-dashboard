import copy
import unittest
from unittest.mock import patch

import server


class StaffTests(unittest.TestCase):
    def setUp(self):
        self.store = {server.DATA: [{"id": 1, "staff": "Alice", "detail": "Paper"}], server.PROGRAMS: {"Alice": "Comp"}}
        def save(path, value):
            self.store[path] = copy.deepcopy(value)
        self.load_patch = patch.object(server, "load", side_effect=lambda path, default: copy.deepcopy(self.store.get(path, default)))
        self.save_patch = patch.object(server, "save", side_effect=save)
        self.load_patch.start()
        self.saver = self.save_patch.start()
        self.addCleanup(self.load_patch.stop)
        self.addCleanup(self.save_patch.stop)

    def test_create_unassigned_faculty_and_delete(self):
        server.manage_staff({"name": "Bob", "programs": []})
        self.assertIn("Bob", self.store[server.PROGRAMS])
        server.manage_staff({"action": "delete", "original": "Bob"})
        self.assertNotIn("Bob", self.store[server.PROGRAMS])
        self.assertEqual(len(self.store[server.DATA]), 1)

    def test_rename_updates_publications_and_multiple_programs(self):
        server.manage_staff({"original": "Alice", "name": "Alice Smith", "programs": ["Comp", "MsComp"]})
        self.assertEqual(self.store[server.DATA][0]["staff"], "Alice Smith")
        self.assertEqual(self.store[server.PROGRAMS], {"Alice Smith": "Comp, MsComp"})
        self.assertEqual(self.store[server.DATA][0]["id"], 1)

    def test_linked_faculty_cannot_be_deleted(self):
        with self.assertRaises(ValueError):
            server.manage_staff({"action": "delete", "original": "alice"})
        self.saver.assert_not_called()

    def test_normalized_duplicate_is_rejected(self):
        with self.assertRaises(ValueError):
            server.manage_staff({"name": " ALICE ", "programs": []})
        self.saver.assert_not_called()

    def test_failed_publication_write_rolls_back_mapping(self):
        original = copy.deepcopy(self.store)
        def fail(path, value):
            if path == server.DATA:
                raise RuntimeError("Unavailable")
            self.store[path] = copy.deepcopy(value)
        self.saver.side_effect = fail
        with self.assertRaises(RuntimeError):
            server.manage_staff({"original": "Alice", "name": "Alice Smith", "programs": ["DE"]})
        self.assertEqual(self.store, original)

    def test_unknown_program_is_rejected(self):
        with self.assertRaises(ValueError):
            server.manage_staff({"name": "Bob", "programs": ["Invalid"]})
        self.saver.assert_not_called()
