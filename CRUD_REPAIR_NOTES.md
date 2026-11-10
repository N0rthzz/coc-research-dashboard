# CRUD repair

This revision fixes two issues in the single-request version:

1. Google Sheets returns `id`, `year`, `month` as strings, whereas Python uses integers. Previously, a one-row edit/delete could cause the diff to send hundreds of unchanged records to Apps Script. The diff now normalizes these values before comparing.
2. The DELETE exception handler referenced `path` before assigning it, hiding the underlying failure. It now logs the original error.

## Install

Stop the old Python server, copy your existing `.env` into this folder, and run `python server.py`. The Apps Script `Code.gs` is unchanged from the single-request version, so if that version was deployed already, no new deployment is required.

Test a disposable record first: create, update, delete, then verify the `publications` and `changes` tabs. If an error persists, copy the `[API ERROR]` line from the terminal without sharing secrets.
