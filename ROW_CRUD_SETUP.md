# Row-level CRUD setup

1. Back up your Google Spreadsheet (File > Make a copy).
2. Replace the contents of **Code.gs** in the SAME Apps Script project connected to the existing Spreadsheet. Keep Script Property `API_KEY` unchanged.
3. Save, then **Deploy > Manage deployments > Edit > New version > Deploy**.
4. Keep your original `.env` and copy it into this project folder. Never upload `.env` publicly.
5. Restart `python server.py`. Test create/update/delete with a disposable record.

The Python server now computes row-level changes and posts `action=mutate` with only upserts/deletes. The Apps Script handles this operation and still supports `replace` for initial import and `append` for audit. All writes are synchronous.

**Important:** This implementation assumes the Dashboard is the only editor while it runs. If someone edits Google Sheets directly, use the Sync Sheets button before CRUD to avoid stale cache conflicts. A write to Sheets can succeed even if a subsequent audit write fails; check Sheets before retrying a failed request.
