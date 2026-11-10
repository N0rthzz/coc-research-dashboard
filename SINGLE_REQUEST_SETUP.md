# Single-request CRUD setup

1. Back up the Google spreadsheet (File > Make a copy).
2. Replace the Apps Script `Code.gs` with the supplied file; Save; Deploy > Manage deployments > Edit > New version > Deploy.
3. Copy your existing `.env` into this folder. Do not put secrets in the ZIP.
4. Stop the old Python server, run `python server.py`, and hard refresh the dashboard.
5. Test Create, Update and Delete on disposable records, and verify the `changes` tab.

Publication Create/Update/Delete now send one Apps Script HTTP request that updates the publication row and appends its audit entry under a single Apps Script lock. Other operations retain their previous behavior. This is **not an atomic database transaction**: Google Sheets can still partially apply changes if an error occurs between writes. If that happens, use Sync Sheets and inspect the changes tab before retrying. External edits to the Sheets while the app runs may also cause conflicts; use Sync Sheets to refresh.
