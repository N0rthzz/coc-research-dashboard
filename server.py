"""Single-admin publication editor with local, Google Sheets, or Apps Script storage."""
from __future__ import annotations

import csv
import copy
import base64
import html
import hmac
import io
import json
import os
import re
import threading
from functools import lru_cache
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs, urlencode
from urllib.request import Request, urlopen

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None
if load_dotenv is not None:
    load_dotenv(Path(__file__).resolve().parent / ".env")

ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("DATA_DIR", str(ROOT / "storage"))).resolve()
DATA = DATA_DIR / "publications.json"
PROGRAMS = DATA_DIR / "staff_programs.json"
LOG = DATA_DIR / "changes.jsonl"

# Google Sheets is the primary store when STORAGE_BACKEND=google_sheets.
STORAGE_BACKEND = os.environ.get("STORAGE_BACKEND", "local").strip().lower()
APPS_SCRIPT_URL = os.environ.get("GOOGLE_APPS_SCRIPT_URL", "").strip()
APPS_SCRIPT_API_KEY = os.environ.get("GOOGLE_APPS_SCRIPT_API_KEY", "").strip()
SPREADSHEET_ID = os.environ.get("GOOGLE_SHEETS_SPREADSHEET_ID", "").strip()
GOOGLE_SERVICE_ACCOUNT_JSON = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
SHEET_PUBLICATIONS = os.environ.get("GOOGLE_SHEETS_PUBLICATIONS_TAB", "publications")
SHEET_PROGRAMS = os.environ.get("GOOGLE_SHEETS_PROGRAMS_TAB", "staff_programs")
SHEET_AUDIT = os.environ.get("GOOGLE_SHEETS_AUDIT_TAB", "changes")
PUBLICATION_HEADERS = ["id", "staff", "detail", "type", "year", "month", "indexing", "affiliation", "key"]
PROGRAM_HEADERS = ["staff", "program"]
AUDIT_HEADERS = ["seq", "time", "action", "entity", "id", "before", "after", "restore_of"]

# In-process read-through cache for the Apps Script backend.
# Writes remain synchronous: Google Sheets must confirm success before cache changes.
CACHE = {}
CACHE_LOCK = threading.RLock()


def cache_read(tab):
    with CACHE_LOCK:
        if tab in CACHE:
            return copy.deepcopy(CACHE[tab])
    rows = apps_script_request(tab)
    with CACHE_LOCK:
        CACHE[tab] = copy.deepcopy(rows)
    return copy.deepcopy(rows)


def cache_replace(tab, rows):
    # Row-level delta: send only changed records, not the entire table.
    # Keep the cache untouched until Google Sheets confirms the write.
    if tab not in (SHEET_PUBLICATIONS, SHEET_PROGRAMS):
        apps_script_request(tab, rows)
    else:
        pk = "id" if tab == SHEET_PUBLICATIONS else "staff"
        with CACHE_LOCK:
            previous = copy.deepcopy(CACHE.get(tab))
        if previous is None:
            previous = apps_script_request(tab)
        old = {str(r[pk]): r for r in previous}
        new = {str(r[pk]): r for r in rows}
        upserts = [r for k, r in new.items() if k not in old or r != old[k]]
        deletes = [k for k in old if k not in new]
        if upserts or deletes:
            apps_script_request(tab, action="mutate", rows={
                "upserts": upserts, "deletes": deletes
            })
    with CACHE_LOCK:
        CACHE[tab] = copy.deepcopy(rows)


def cache_append_audit(row):
    apps_script_request(SHEET_AUDIT, [row], action="append")
    with CACHE_LOCK:
        CACHE.setdefault(SHEET_AUDIT, []).append(copy.deepcopy(row))


def sync_from_sheets():
    # Only publish a complete snapshot if all three reads succeed.
    snapshot = {tab: apps_script_request(tab) for tab in
                (SHEET_PUBLICATIONS, SHEET_PROGRAMS, SHEET_AUDIT)}
    with CACHE_LOCK:
        CACHE.update(copy.deepcopy(snapshot))
    return {tab: len(rows) for tab, rows in snapshot.items()}


def apps_script_request(tab, rows=None, action="replace"):
    """Server-side only; never expose the secret to browser JavaScript."""
    if not APPS_SCRIPT_URL.startswith("https://script.google.com/macros/s/") or not APPS_SCRIPT_URL.endswith("/exec"):
        raise RuntimeError("ตั้งค่า GOOGLE_APPS_SCRIPT_URL เป็น URL Web App ที่ลงท้าย /exec")
    if not APPS_SCRIPT_API_KEY:
        raise RuntimeError("ตั้งค่า GOOGLE_APPS_SCRIPT_API_KEY ก่อน")
    if rows is None and action == "replace":
        url = APPS_SCRIPT_URL + "?" + urlencode({"sheet": tab, "key": APPS_SCRIPT_API_KEY})
        req = Request(url, headers={"User-Agent": "CoC-Dashboard/1.0"})
    else:
        payload = {"sheet": tab, "key": APPS_SCRIPT_API_KEY, "action": action, "rows": rows if rows is not None else []}
        req = Request(APPS_SCRIPT_URL, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
                      headers={"Content-Type": "application/json", "User-Agent": "CoC-Dashboard/1.0"}, method="POST")
    with urlopen(req, timeout=45) as response:
        raw = response.read().decode("utf-8-sig")
        content_type = response.headers.get("Content-Type", "")
        if not raw.lstrip().startswith("{"):
            raise RuntimeError(
                "Apps Script ไม่ได้ส่ง JSON กลับมา "
                f"(HTTP {response.status}, Content-Type: {content_type}). "
                "ตรวจสอบ Web App URL, สิทธิ์ Anyone และ Deploy เวอร์ชันล่าสุด"
            )
        try:
            result = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError("Apps Script ส่ง JSON ไม่ถูกต้อง") from exc
    if not result.get("ok"):
        raise RuntimeError("Apps Script: " + str(result.get("error", "Unknown error")))
    return result.get("rows", []) if rows is None and action == "replace" else result


@lru_cache(maxsize=1)
def sheets_client():
    if not SPREADSHEET_ID:
        raise RuntimeError("ตั้งค่า GOOGLE_SHEETS_SPREADSHEET_ID ใน Environment Variables ก่อน")
    if not GOOGLE_SERVICE_ACCOUNT_JSON:
        raise RuntimeError("ตั้งค่า GOOGLE_SERVICE_ACCOUNT_JSON ใน Environment Variables ก่อน")
    import gspread
    from google.oauth2.service_account import Credentials
    info = json.loads(GOOGLE_SERVICE_ACCOUNT_JSON)
    scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    credentials = Credentials.from_service_account_info(info, scopes=scopes)
    return gspread.authorize(credentials)


@lru_cache(maxsize=1)
def spreadsheet():
    return sheets_client().open_by_key(SPREADSHEET_ID)


def worksheet(tab_name, headers):
    import gspread
    book = spreadsheet()
    try:
        ws = book.worksheet(tab_name)
    except gspread.WorksheetNotFound:
        ws = book.add_worksheet(title=tab_name, rows=1000, cols=max(10, len(headers)))
    first = ws.row_values(1)
    if not first:
        ws.append_row(headers, value_input_option="RAW")
    elif first != headers:
        raise RuntimeError(
            f"หัวคอลัมน์ในชีต '{tab_name}' ไม่ตรงกับระบบ ต้องเป็น: {', '.join(headers)}"
        )
    return ws


def sheet_records(tab_name, headers):
    ws = worksheet(tab_name, headers)
    values = ws.get_all_values()
    if len(values) < 2:
        return []
    header = values[0]
    out = []
    for row in values[1:]:
        row = row + [""] * (len(header) - len(row))
        if not any(str(x).strip() for x in row):
            continue
        out.append(dict(zip(header, row[:len(header)])))
    return out


def _sheet_value(value):
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return value


def _audit_cell(value):
    return json.dumps(value, ensure_ascii=False)


def sheet_save_records(tab_name, headers, records):
    ws = worksheet(tab_name, headers)
    values = [headers]
    for record in records:
        values.append([_sheet_value(record.get(h)) for h in headers])
    # Resize first so larger imports (up to the API limit) fit even in a newly-created tab.
    ws.resize(rows=max(1000, len(values)), cols=max(len(headers), 10))
    # Replace the data range in one request to avoid partially-written row-by-row updates.
    ws.clear()
    ws.update(values, value_input_option="RAW")


def load_audit():
    if STORAGE_BACKEND in {"google_sheets", "apps_script"}:
        raw = (cache_read(SHEET_AUDIT) if STORAGE_BACKEND == "apps_script"
               else sheet_records(SHEET_AUDIT, AUDIT_HEADERS))
        result = []
        for item in raw:
            try:
                result.append({
                    "seq": int(item.get("seq") or 0),
                    "time": item.get("time", ""),
                    "action": item.get("action", ""),
                    "entity": item.get("entity", ""),
                    "id": json.loads(item.get("id") or "null"),
                    "before": json.loads(item.get("before") or "null"),
                    "after": json.loads(item.get("after") or "null"),
                    "restore_of": json.loads(item.get("restore_of") or "null"),
                })
            except (ValueError, json.JSONDecodeError):
                continue
        return result
    return [json.loads(line) for line in LOG.read_text(encoding="utf-8").splitlines() if line] if LOG.exists() else []


def initialize_sheets():
    # Create tabs and seed publications from data.json only when the publications tab is empty.
    pub_ws = worksheet(SHEET_PUBLICATIONS, PUBLICATION_HEADERS)
    if len(pub_ws.get_all_values()) <= 1:
        seed = load(ROOT / "data.json", [])
        if seed:
            sheet_save_records(SHEET_PUBLICATIONS, PUBLICATION_HEADERS, seed)
    worksheet(SHEET_PROGRAMS, PROGRAM_HEADERS)
    worksheet(SHEET_AUDIT, AUDIT_HEADERS)
def initialize_apps_script():
    existing = apps_script_request(SHEET_PUBLICATIONS)
    if not existing:
        seed = json.loads((ROOT / "data.json").read_text(encoding="utf-8"))
        if seed:
            apps_script_request(SHEET_PUBLICATIONS, seed)
            existing = apps_script_request(SHEET_PUBLICATIONS)
    programs = apps_script_request(SHEET_PROGRAMS)
    try:
        audit = apps_script_request(SHEET_AUDIT)
    except TimeoutError as exc:
        print(f"[WARN] Audit log loading timed out: {exc}", flush=True)
        audit = []
    with CACHE_LOCK:
        CACHE.update({SHEET_PUBLICATIONS: existing, SHEET_PROGRAMS: programs, SHEET_AUDIT: audit})
    print(f"Apps Script cache ready: {len(existing)} publications, {len(programs)} programs, {len(audit)} audit entries")


LOCK = threading.RLock()
TYPES = {"International Journal Articles", "International Proceedings", "National Journal Articles", "National Proceedings"}
PROGRAM_VALUES = {"Comp", "DE", "AISE", "DBiz"}


def normalize(value):
    return " ".join(html.unescape(str(value or "")).split())


def key(detail):
    return normalize(detail).casefold()


def next_publication_id(rows):
    current = max((int(x["id"]) for x in rows), default=0)
    for entry in load_audit():
        if entry.get("entity") not in {"publication", "publications"}:
            continue
        ids = entry.get("id")
        for record_id in ids if isinstance(ids, list) else [ids]:
            if isinstance(record_id, int):
                current = max(current, record_id)
    return current + 1


def load(path, default):
    if STORAGE_BACKEND == "apps_script":
        if path == DATA:
            rows = cache_read(SHEET_PUBLICATIONS)
            for row in rows:
                for field in ("id", "year", "month"):
                    row[field] = int(float(str(row[field]).replace(",", ""))) if str(row.get(field, "")).strip() else 0
            return rows
        if path == PROGRAMS:
            return {row["staff"]: row["program"] for row in cache_read(SHEET_PROGRAMS)
                    if row.get("staff") and row.get("program")}
        if path == LOG:
            return load_audit()
    if STORAGE_BACKEND == "google_sheets":
        if path == DATA:
            rows = sheet_records(SHEET_PUBLICATIONS, PUBLICATION_HEADERS)
            for row in rows:
                for field in ("id", "year", "month"):
                    row[field] = int(float(str(row[field]).replace(",", ""))) if str(row.get(field, "")).strip() else 0
            return rows
        if path == PROGRAMS:
            return {row["staff"]: row["program"] for row in sheet_records(SHEET_PROGRAMS, PROGRAM_HEADERS)
                    if row.get("staff") and row.get("program")}
        if path == LOG:
            return load_audit()
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def save(path, value):
    if STORAGE_BACKEND == "apps_script":
        if path == DATA:
            cache_replace(SHEET_PUBLICATIONS, value)
            return
        if path == PROGRAMS:
            cache_replace(SHEET_PROGRAMS,
                                [{"staff": staff, "program": program} for staff, program in sorted(value.items())])
            return
        if path == LOG:
            cache_replace(SHEET_AUDIT, value)
            return
    if STORAGE_BACKEND == "google_sheets":
        if path == DATA:
            sheet_save_records(SHEET_PUBLICATIONS, PUBLICATION_HEADERS, value)
            return
        if path == PROGRAMS:
            sheet_save_records(SHEET_PROGRAMS, PROGRAM_HEADERS,
                               [{"staff": staff, "program": program} for staff, program in sorted(value.items())])
            return
        if path == LOG:
            sheet_save_records(SHEET_AUDIT, AUDIT_HEADERS, value)
            return
    temp = path.with_name(path.name + ".tmp")
    with temp.open("w", encoding="utf-8") as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(temp, path)


def event(action, entity, record_id, before, after, restore_of=None):
    entry = {"time": datetime.now(timezone.utc).isoformat(), "action": action,
             "entity": entity, "id": record_id, "before": before, "after": after,
             "restore_of": restore_of}
    if STORAGE_BACKEND == "apps_script":
        cache_append_audit({**entry, "seq": len(load_audit()) + 1,
                            "id": _audit_cell(record_id),
                            "before": _audit_cell(before),
                            "after": _audit_cell(after),
                            "restore_of": _audit_cell(restore_of)})
        return
    if STORAGE_BACKEND == "google_sheets":
        existing = load_audit()
        existing.append({**entry, "seq": len(existing) + 1})
        save(LOG, [{**e, "id": _audit_cell(e.get("id")), "before": _audit_cell(e.get("before")),
                    "after": _audit_cell(e.get("after")), "restore_of": _audit_cell(e.get("restore_of"))}
                   for e in existing])
        return
    with LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        f.flush()
        os.fsync(f.fileno())


def validate(raw):
    if not isinstance(raw, dict):
        raise ValueError("รูปแบบข้อมูลไม่ถูกต้อง")
    staff, detail = normalize(raw.get("staff")), normalize(raw.get("detail"))
    typ = raw.get("type")
    if not staff or len(staff) > 180 or not detail or len(detail) > 10000 or typ not in TYPES:
        raise ValueError("กรุณากรอกชื่ออาจารย์ รายละเอียด และประเภทผลงานให้ถูกต้อง")
    try:
        year, month = int(raw.get("year")), int(raw.get("month"))
    except (TypeError, ValueError):
        raise ValueError("ปีและเดือนต้องเป็นตัวเลข") from None
    if year < 1900 or year > 2100 or month < 1 or month > 12:
        raise ValueError("ปีหรือเดือนอยู่นอกช่วงที่กำหนด")
    indexing = normalize(raw.get("indexing")) or "ไม่ระบุ"
    affiliation = raw.get("affiliation") or "ไม่ระบุ"
    if len(indexing) > 180 or affiliation not in {"Y", "N", "ไม่ระบุ"}:
        raise ValueError("ข้อมูล Indexing หรือสังกัด PSU ไม่ถูกต้อง")
    return {"staff": staff, "detail": detail, "type": typ, "year": year,
            "month": month, "indexing": indexing, "affiliation": affiliation, "key": key(detail)}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def respond(self, code, payload):
        b = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(b)

    def authorized(self):
        supplied = self.headers.get("Authorization", "")
        expected = "Basic " + base64.b64encode((os.environ["ADMIN_USER"] + ":" + os.environ["ADMIN_PASSWORD"]).encode()).decode()
        if hmac.compare_digest(supplied, expected):
            return True
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="CoC Publications", charset="UTF-8"')
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", "0")
        self.end_headers()
        return False

    def read_body(self, limit=3_000_000):
        length = int(self.headers.get("Content-Length", "0"))
        if length < 1 or length > limit:
            raise ValueError("ข้อมูลที่ส่งมามีขนาดไม่ถูกต้องหรือใหญ่เกินไป")
        return self.rfile.read(length)

    def do_GET(self):
        if not self.authorized():
            return
        path = urlparse(self.path).path
        try:
            with LOCK:
                if path == "/api/publications":
                    return self.respond(200, load(DATA, []))
                if path == "/api/programs":
                    return self.respond(200, load(PROGRAMS, {}))
                if path == "/api/audit":
                    records = load_audit()
                    params = parse_qs(urlparse(self.path).query)
                    def param(name):
                        return params.get(name, [""])[0]
                    try:
                        page = max(1, int(param("page") or "1"))
                    except ValueError:
                        return self.respond(400, {"error": "เลขหน้าไม่ถูกต้อง"})
                    action, entity, start, end, search = (param(x) for x in ("action", "entity", "start", "end", "search"))
                    results = []
                    for i, record in enumerate(records):
                        if action and record["action"] != action or entity and record["entity"] != entity:
                            continue
                        if start and record["time"][:10] < start or end and record["time"][:10] > end:
                            continue
                        if search and search.casefold() not in json.dumps(record, ensure_ascii=False).casefold():
                            continue
                        results.append({**record, "seq": i + 1})
                    results.reverse()
                    return self.respond(200, {"total": len(results), "page": page,
                                              "items": results[(page-1)*25:page*25]})
        except Exception as exc:
            print(f"[API GET ERROR] {path}: {type(exc).__name__}: {exc}", flush=True)
            return self.respond(503, {"error": "เชื่อมต่อแหล่งข้อมูลไม่สำเร็จ กรุณาตรวจ Terminal ของเซิร์ฟเวอร์"})
        if path not in {"/", "/index.html", "/app.css", "/enhance.js", "/analytics.js", "/finder.js", "/i18n.js", "/cozy.png"}:
            return self.respond(404, {"error": "ไม่พบข้อมูล"})
        return super().do_GET()

    def do_POST(self):
        if not self.authorized():
            return
        path = urlparse(self.path).path
        try:
            raw = self.read_body(limit=10_000_000 if path == "/api/import-preview" else 3_000_000)
            with LOCK:
                if path == "/api/sync":
                    if STORAGE_BACKEND != "apps_script":
                        return self.respond(400, {"error": "Sync ใช้ได้กับ Apps Script backend เท่านั้น"})
                    return self.respond(200, {"ok": True, "counts": sync_from_sheets()})
                if path == "/api/import-preview":
                    content = raw.decode("utf-8-sig")
                    rows = list(csv.DictReader(io.StringIO(content)))
                    if len(rows) > 10000 or not rows or not {"Staff name", "Type", "Detail", "Month", "Year"}.issubset(rows[0]):
                        raise ValueError("CSV ต้องมีคอลัมน์ Staff name, Type, Detail, Month, Year และไม่เกิน 10,000 แถว")
                    old = load(DATA, [])
                    existing = {(r["staff"], r["key"], r["year"]) for r in old}
                    fresh, duplicate, invalid = [], 0, 0
                    duplicate_examples, invalid_examples = [], []
                    for row_index, row in enumerate(rows, start=2):
                        try:
                            rec = validate({"staff": row["Staff name"], "type": row["Type"], "detail": row["Detail"],
                                            "year": row["Year"], "month": row["Month"], "indexing": row.get("Indexing"),
                                            "affiliation": row.get("Is the author's affiliation with PSU?")})
                            signature = (rec["staff"], rec["key"], rec["year"])
                            if signature in existing:
                                duplicate += 1
                                if len(duplicate_examples) < 30:
                                    duplicate_examples.append({"row": row_index, "staff": rec["staff"], "detail": rec["detail"][:180]})
                            else:
                                existing.add(signature)
                                fresh.append(rec)
                        except ValueError:
                            invalid += 1
                            if len(invalid_examples) < 30:
                                invalid_examples.append({"row": row_index, "staff": row.get("Staff name", ""), "detail": normalize(row.get("Detail"))[:180]})
                    return self.respond(200, {"rows": len(rows), "new": len(fresh), "existing": duplicate,
                                              "invalid": invalid, "preview": fresh[:30],
                                              "existing_preview": duplicate_examples, "invalid_preview": invalid_examples,
                                              "candidates": fresh})
                body = json.loads(raw)
                if path == "/api/restore":
                    try:
                        seq = int(body.get("seq"))
                    except (TypeError, ValueError):
                        raise ValueError("รายการประวัติไม่ถูกต้อง") from None
                    records = load_audit()
                    if seq < 1 or seq > len(records):
                        raise ValueError("ไม่พบรายการประวัติ")
                    target = records[seq-1]
                    if target["action"] == "restore" or any(x.get("restore_of") == seq for x in records):
                        raise ValueError("รายการนี้คืนค่าไปแล้ว")
                    entity, action = target["entity"], target["action"]
                    if entity == "program":
                        mapping = load(PROGRAMS, {})
                        current = mapping.get(target["id"], "")
                        if current != target["after"]:
                            raise ValueError("หลักสูตรถูกแก้หลังจากรายการนี้แล้ว กรุณาตรวจสอบก่อน")
                        if target["before"]:
                            mapping[target["id"]] = target["before"]
                        else:
                            mapping.pop(target["id"], None)
                        save(PROGRAMS, mapping)
                        event("restore", "program", target["id"], current, target["before"], seq)
                    elif entity in {"publication", "publications"}:
                        rows = load(DATA, [])
                        old = target["before"]
                        new = target["after"]
                        batch = new if action == "import" else [new] if new else []
                        for item in batch:
                            current = next((r for r in rows if r["id"] == item["id"]), None)
                            if current != item:
                                raise ValueError("ผลงานถูกแก้หลังจากรายการนี้แล้ว กรุณาตรวจสอบก่อน")
                        if action == "delete" and any(r["id"] == old["id"] for r in rows):
                            raise ValueError("รหัสผลงานนี้มีอยู่แล้ว")
                        if action == "create" or action == "import":
                            ids = {item["id"] for item in batch}
                            rows = [r for r in rows if r["id"] not in ids]
                        elif action == "update":
                            rows = [old if r["id"] == old["id"] else r for r in rows]
                        elif action == "delete":
                            rows.append(old)
                        else:
                            raise ValueError("ไม่สามารถคืนค่ารายการนี้")
                        save(DATA, rows)
                        event("restore", entity, target["id"], new, old, seq)
                    else:
                        raise ValueError("ไม่สามารถคืนค่ารายการนี้")
                    return self.respond(200, {"restored": seq})
                if path == "/api/publications":
                    rec = validate(body)
                    rows = load(DATA, [])
                    rec["id"] = next_publication_id(rows)
                    rows.append(rec)
                    save(DATA, rows)
                    event("create", "publication", rec["id"], None, rec)
                    return self.respond(201, rec)
                if path == "/api/import":
                    candidates = body.get("candidates")
                    if not isinstance(candidates, list) or len(candidates) > 10000:
                        raise ValueError("ข้อมูลนำเข้าไม่ถูกต้อง")
                    rows = load(DATA, [])
                    existing = {(r["staff"], r["key"], r["year"]) for r in rows}
                    next_id = next_publication_id(rows) - 1
                    added = []
                    for candidate in candidates:
                        rec = validate(candidate)
                        sig = (rec["staff"], rec["key"], rec["year"])
                        if sig in existing:
                            continue
                        existing.add(sig)
                        next_id += 1
                        rec["id"] = next_id
                        rows.append(rec)
                        added.append(rec)
                    if added:
                        save(DATA, rows)
                        event("import", "publications", [x["id"] for x in added], None, added)
                    return self.respond(200, {"added": len(added)})
                if path == "/api/programs":
                    staff, program = normalize(body.get("staff")), body.get("program") or ""
                    if not staff or program not in PROGRAM_VALUES | {""}:
                        raise ValueError("ชื่ออาจารย์หรือหลักสูตรไม่ถูกต้อง")
                    mapping = load(PROGRAMS, {})
                    before = mapping.get(staff, "")
                    if program:
                        mapping[staff] = program
                    else:
                        mapping.pop(staff, None)
                    if before != program:
                        save(PROGRAMS, mapping)
                        event("update", "program", staff, before, program)
                    return self.respond(200, mapping)
            return self.respond(404, {"error": "ไม่พบคำสั่ง"})
        except (ValueError, UnicodeError, json.JSONDecodeError) as e:
            return self.respond(400, {"error": str(e)})
        except Exception as exc:
            print(f"[API GET ERROR] {path}: {type(exc).__name__}: {exc}", flush=True)
            return self.respond(503, {"error": "เชื่อมต่อแหล่งข้อมูลไม่สำเร็จ กรุณาตรวจ Terminal ของเซิร์ฟเวอร์"})

    def do_PUT(self):
        if not self.authorized():
            return
        try:
            path = urlparse(self.path).path
            match = re.fullmatch(r"/api/publications/(\d+)", path)
            if not match:
                return self.respond(404, {"error": "ไม่พบรายการ"})
            payload = validate(json.loads(self.read_body()))
            with LOCK:
                rows = load(DATA, [])
                old = next((r for r in rows if r["id"] == int(match[1])), None)
                if old is None:
                    return self.respond(404, {"error": "ไม่พบรายการ"})
                rec = {**payload, "id": old["id"]}
                rows[rows.index(old)] = rec
                save(DATA, rows)
                event("update", "publication", rec["id"], old, rec)
                return self.respond(200, rec)
        except (ValueError, json.JSONDecodeError) as e:
            return self.respond(400, {"error": str(e)})
        except Exception as exc:
            print(f"[API GET ERROR] {path}: {type(exc).__name__}: {exc}", flush=True)
            return self.respond(503, {"error": "เชื่อมต่อแหล่งข้อมูลไม่สำเร็จ กรุณาตรวจ Terminal ของเซิร์ฟเวอร์"})

    def do_DELETE(self):
        if not self.authorized():
            return
        match = re.fullmatch(r"/api/publications/(\d+)", urlparse(self.path).path)
        if not match:
            return self.respond(404, {"error": "ไม่พบรายการ"})
        try:
            with LOCK:
                rows = load(DATA, [])
                old = next((r for r in rows if r["id"] == int(match[1])), None)
                if old is None:
                    return self.respond(404, {"error": "ไม่พบรายการ"})
                rows.remove(old)
                save(DATA, rows)
                event("delete", "publication", old["id"], old, None)
                return self.respond(200, {"deleted": old["id"]})
        except Exception as exc:
            print(
    f"[API DELETE ERROR] {self.path}: "
    f"{type(exc).__name__}: {exc}",
    flush=True
)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8000")))
    args = parser.parse_args()
    if not os.environ.get("ADMIN_USER") or not os.environ.get("ADMIN_PASSWORD"):
        parser.error("ตั้งค่า ADMIN_USER และ ADMIN_PASSWORD ก่อนเปิดเซิร์ฟเวอร์")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if STORAGE_BACKEND == "apps_script":
        initialize_apps_script()
        print("Storage backend: Google Apps Script")
    elif STORAGE_BACKEND == "google_sheets":
        initialize_sheets()
        print("Storage backend: Google Sheets")
    elif STORAGE_BACKEND == "local":
        if not DATA.exists():
            save(DATA, load(ROOT / "data.json", []))
        if not PROGRAMS.exists():
            save(PROGRAMS, {})
        LOG.touch(exist_ok=True)
        print("Storage backend: local JSON files")
    else:
        parser.error(f"Unsupported STORAGE_BACKEND: {STORAGE_BACKEND}")
    print(f"Open http://localhost:{args.port}  (Ctrl+C to stop)")
    ThreadingHTTPServer((os.environ.get("HOST", "127.0.0.1"), args.port), Handler).serve_forever()
