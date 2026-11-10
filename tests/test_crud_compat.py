import copy
import unittest
from unittest.mock import patch

import server


class CrudCompatibilityTests(unittest.TestCase):
    def setUp(self):
        self.old = {"id": "1", "year": "2025", "month": "1", "staff": "Alice", "detail": "Original"}
        server.CACHE.clear()
        server.CACHE.update({server.SHEET_PUBLICATIONS: [self.old], server.SHEET_AUDIT: []})
        self.backend = patch.object(server, "STORAGE_BACKEND", "apps_script")
        self.backend.start()
        self.addCleanup(self.backend.stop)

    def test_legacy_create_update_delete_send_only_changed_rows(self):
        for action in ("create", "update", "delete"):
            with self.subTest(action=action):
                self.setUp()
                original = {**self.old, "id": 1, "year": 2025, "month": 1}
                changed = {**original, "detail": "Updated"}
                added = {**original, "id": 2}
                rows = [original, added] if action == "create" else [changed] if action == "update" else []
                calls = []

                def request(tab, rows=None, action="replace"):
                    calls.append((tab, action, copy.deepcopy(rows)))
                    if action == "mutate_with_audit":
                        raise RuntimeError("Apps Script: Unsupported action: mutate_with_audit")
                    return {"ok": True}

                with patch.object(server, "apps_script_request", side_effect=request):
                    server.save_publication_with_audit(rows, action, 1, original, changed)
                self.assertEqual([c[1] for c in calls], ["mutate_with_audit", "mutate", "append"])
                delta = calls[1][2]
                self.assertEqual(delta["upserts"], [added] if action == "create" else [changed] if action == "update" else [])
                self.assertEqual(delta["deletes"], ["1"] if action == "delete" else [])
                self.assertEqual(server.CACHE[server.SHEET_PUBLICATIONS], rows)
                self.assertEqual(len(server.CACHE[server.SHEET_AUDIT]), 1)

    def test_other_errors_never_retry_or_change_cache(self):
        with patch.object(server, "apps_script_request", side_effect=RuntimeError("Timeout")) as request:
            with self.assertRaisesRegex(RuntimeError, "Timeout"):
                server.save_publication_with_audit([], "delete", 1, self.old, None)
        self.assertEqual(request.call_count, 1)
        self.assertEqual(server.CACHE[server.SHEET_PUBLICATIONS], [self.old])

    def test_audit_failure_keeps_cache_in_step_with_saved_publications(self):
        errors = [RuntimeError("Apps Script: Unsupported action: mutate_with_audit"), {"ok": True}, RuntimeError("Audit unavailable")]
        with patch.object(server, "apps_script_request", side_effect=errors):
            with self.assertRaisesRegex(RuntimeError, "audit logging failed"):
                server.save_publication_with_audit([], "delete", 1, self.old, None)
        self.assertEqual(server.CACHE[server.SHEET_PUBLICATIONS], [])
        self.assertEqual(server.CACHE[server.SHEET_AUDIT], [])

    def test_current_deployment_uses_one_request(self):
        with patch.object(server, "apps_script_request", return_value={"ok": True}) as request:
            server.save_publication_with_audit([], "delete", 1, self.old, None)
        self.assertEqual(request.call_count, 1)
        self.assertEqual(request.call_args.kwargs["action"], "mutate_with_audit")

    def test_original_deployment_uses_replace_then_audit(self):
        replies = [RuntimeError("Apps Script: Unsupported action: mutate_with_audit"),
                   RuntimeError("Apps Script: Unsupported action: mutate"),
                   {"ok": True}, {"ok": True}]
        with patch.object(server, "apps_script_request", side_effect=replies) as request:
            server.save_publication_with_audit([], "delete", 1, self.old, None)
        self.assertEqual(request.call_count, 4)
        self.assertEqual(request.call_args_list[2].args, (server.SHEET_PUBLICATIONS, []))
        self.assertEqual(request.call_args_list[3].kwargs["action"], "append")
        self.assertEqual(server.CACHE[server.SHEET_PUBLICATIONS], [])


if __name__ == "__main__":
    unittest.main()
