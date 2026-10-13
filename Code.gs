// CoC Dashboard: Apps Script Web App (row-level CRUD + bulk import)
// Deploy > Manage deployments > Edit > New version > Deploy after replacing Code.gs.
const SHEETS = {
  publications: ["id", "staff", "detail", "type", "year", "month", "indexing", "affiliation", "key"],
  staff_programs: ["staff", "program"],
  changes: ["seq", "time", "action", "entity", "id", "before", "after", "restore_of"]
};
function getSheet(name) {
  if (!Object.prototype.hasOwnProperty.call(SHEETS, name)) throw new Error("Invalid sheet: " + name);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("ไม่พบ Spreadsheet: เปิด Apps Script ผ่าน Extensions > Apps Script");
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  const headers = SHEETS[name];
  if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  else if (JSON.stringify(sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0]) !== JSON.stringify(headers))
    throw new Error("หัวคอลัมน์ของชีต " + name + " ไม่ตรงกับระบบ");
  return sheet;
}
function output(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function checkKey(key) {
  const expected = PropertiesService.getScriptProperties().getProperty("API_KEY");
  if (!expected || !key || key !== expected) throw new Error("Unauthorized");
}
function ensureRows(sheet, n) {
  if (sheet.getMaxRows() < n) sheet.insertRowsAfter(sheet.getMaxRows(), n - sheet.getMaxRows());
}
function readRows(name) {
  const sheet = getSheet(name), values = sheet.getDataRange().getDisplayValues(), headers = SHEETS[name];
  return values.slice(1).filter(row => row.some(v => v !== "")).map(row => {
    const item = {};
    headers.forEach((h, i) => item[h] = row[i] ?? "");
    return item;
  });
}
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    checkKey(params.key);
    return output({ok: true, rows: readRows(params.sheet || "publications")});
  } catch (error) { return output({ok: false, error: String(error.message)}); }
}
function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    checkKey(body.key);
    const name = body.sheet;
    if (!Object.prototype.hasOwnProperty.call(SHEETS, name)) throw new Error("Invalid sheet: " + name);
    const action = body.action || "replace";
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = getSheet(name), headers = SHEETS[name];
      const toValues = rows => rows.map(r => headers.map(h => r[h] ?? ""));
      if (action === "mutate") {
        if (name !== "publications" && name !== "staff_programs") throw new Error("Mutate unsupported for " + name);
        const payload = body.rows || {}, upserts = payload.upserts || [], deletes = payload.deletes || [];
        if (!Array.isArray(upserts) || !Array.isArray(deletes)) throw new Error("Invalid mutation payload");
        const pk = name === "publications" ? "id" : "staff";
        const keyIndex = headers.indexOf(pk);
        // Build a lookup once, rather than searching the sheet for every record.
        const last = sheet.getLastRow();
        const keys = last > 1 ? sheet.getRange(2, keyIndex + 1, last - 1, 1).getDisplayValues().flat() : [];
        const positions = new Map();
        keys.forEach((key, i) => { if (key !== "") positions.set(String(key), i + 2); });
        // Delete bottom-up so row numbers remain valid.
        const deleteRows = [...new Set(deletes.map(k => positions.get(String(k))).filter(Boolean))].sort((a,b) => b-a);
        deleteRows.forEach(row => sheet.deleteRow(row));
        if (deleteRows.length) {
          positions.clear();
          const remaining = sheet.getLastRow();
          if (remaining > 1) sheet.getRange(2, keyIndex + 1, remaining - 1, 1).getDisplayValues().flat()
            .forEach((key, i) => { if (key !== "") positions.set(String(key), i + 2); });
        }
        const additions = [];
        upserts.forEach(record => {
          const key = String(record[pk]);
          if (!key || key === "undefined") throw new Error("Missing " + pk);
          const row = positions.get(key);
          const values = headers.map(h => record[h] ?? "");
          if (row) sheet.getRange(row, 1, 1, headers.length).setValues([values]);
          else additions.push(values);
        });
        if (additions.length) {
          const start = sheet.getLastRow() + 1;
          ensureRows(sheet, start + additions.length - 1);
          sheet.getRange(start, 1, additions.length, headers.length).setValues(additions);
        }
        return output({ok: true, updated: upserts.length, deleted: deleteRows.length});
      }
      if (action === "append") {
        if (name !== "changes") throw new Error("Append only supported for changes");
        const records = body.rows || (body.row ? [body.row] : []);
        if (!Array.isArray(records)) throw new Error("rows must be an array");
        if (records.length) {
          const start = sheet.getLastRow() + 1;
          ensureRows(sheet, start + records.length - 1);
          sheet.getRange(start, 1, records.length, headers.length).setValues(toValues(records));
        }
        return output({ok: true, count: records.length});
      }
      if (action !== "replace") throw new Error("Unsupported action: " + action);
      if (!Array.isArray(body.rows)) throw new Error("rows must be an array");
      const values = toValues(body.rows), last = sheet.getLastRow();
      ensureRows(sheet, values.length + 1);
      if (last > 1) sheet.getRange(2, 1, last - 1, headers.length).clearContent();
      if (values.length) sheet.getRange(2, 1, values.length, headers.length).setValues(values);
      return output({ok: true, count: values.length});
    } finally { lock.releaseLock(); }
  } catch (error) { return output({ok: false, error: String(error.message)}); }
}
function testConnection() {
  Object.keys(SHEETS).forEach(name => Logger.log("Connected: " + getSheet(name).getName()));
}
function testApiKeySetup() {
  const key = PropertiesService.getScriptProperties().getProperty("API_KEY");
  Logger.log("API_KEY EXISTS: " + Boolean(key));
  Logger.log("API_KEY LENGTH: " + (key ? key.length : 0));
}
