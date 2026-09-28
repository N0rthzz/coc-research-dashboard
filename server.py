"""Local, single-user publication editor. Standard library only."""
from __future__ import annotations

import csv
import base64
import html
import hmac
import io
import json
import os
import re
import threading
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("DATA_DIR", str(ROOT / "storage"))).resolve()
DATA = DATA_DIR / "publications.json"
PROGRAMS = DATA_DIR / "staff_programs.json"
LOG = DATA_DIR / "changes.jsonl"
LOCK = threading.RLock()
TYPES = {"International Journal Articles", "International Proceedings", "National Journal Articles", "National Proceedings"}
PROGRAM_VALUES = {"Comp", "DE", "AISE", "DBiz"}


def normalize(value):
    return " ".join(html.unescape(str(value or "")).split())


def key(detail):
    return normalize(detail).casefold()


def next_publication_id(rows):
    current = max((int(x["id"]) for x in rows), default=0)
    if LOG.exists():
        for line in LOG.read_text(encoding="utf-8").splitlines():
            if not line:
                continue
            entry = json.loads(line)
            if entry.get("entity") not in {"publication", "publications"}:
                continue
            ids = entry.get("id")
            for record_id in ids if isinstance(ids, list) else [ids]:
                if isinstance(record_id, int):
                    current = max(current, record_id)
    return current + 1


def load(path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def save(path, value):
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
        with LOCK:
            if path == "/api/publications":
                return self.respond(200, load(DATA, []))
            if path == "/api/programs":
                return self.respond(200, load(PROGRAMS, {}))
            if path == "/api/audit":
                records = [json.loads(line) for line in LOG.read_text(encoding="utf-8").splitlines() if line] if LOG.exists() else []
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
        if path not in {"/", "/index.html", "/enhance.js", "/analytics.js"}:
            return self.respond(404, {"error": "ไม่พบข้อมูล"})
        return super().do_GET()

    def do_POST(self):
        if not self.authorized():
            return
        path = urlparse(self.path).path
        try:
            raw = self.read_body(limit=10_000_000 if path == "/api/import-preview" else 3_000_000)
            with LOCK:
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
                    records = [json.loads(line) for line in LOG.read_text(encoding="utf-8").splitlines() if line]
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

    def do_DELETE(self):
        if not self.authorized():
            return
        match = re.fullmatch(r"/api/publications/(\d+)", urlparse(self.path).path)
        if not match:
            return self.respond(404, {"error": "ไม่พบรายการ"})
        with LOCK:
            rows = load(DATA, [])
            old = next((r for r in rows if r["id"] == int(match[1])), None)
            if old is None:
                return self.respond(404, {"error": "ไม่พบรายการ"})
            rows.remove(old)
            save(DATA, rows)
            event("delete", "publication", old["id"], old, None)
            return self.respond(200, {"deleted": old["id"]})


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8000")))
    args = parser.parse_args()
    if not os.environ.get("ADMIN_USER") or not os.environ.get("ADMIN_PASSWORD"):
        parser.error("ตั้งค่า ADMIN_USER และ ADMIN_PASSWORD ก่อนเปิดเซิร์ฟเวอร์")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA.exists():
        save(DATA, load(ROOT / "data.json", []))
    if not PROGRAMS.exists():
        save(PROGRAMS, {})
    LOG.touch(exist_ok=True)
    print(f"Open http://localhost:{args.port}  (Ctrl+C to stop)")
    ThreadingHTTPServer((os.environ.get("HOST", "127.0.0.1"), args.port), Handler).serve_forever()
