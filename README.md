# CoC Publications Dashboard

Dashboard วิเคราะห์ผลงานวิชาการของ College of Computing โดยใช้ Google Sheets เป็นแหล่งข้อมูลหลัก (Google Sheets API + Service Account) และคงหน้า Dashboard/กราฟ/ตัวกรอง/CSV import/CRUD/ประวัติการเปลี่ยนแปลงเดิมไว้

## สิ่งที่เปลี่ยนในเวอร์ชันนี้

- `STORAGE_BACKEND=google_sheets` ทำให้ผลงาน หลักสูตรอาจารย์ และประวัติการแก้ไขถูกอ่าน/เขียนใน Google Sheets
- Backend ใช้ Service Account ผ่าน Environment Variable ไม่เปิด Credentials ให้ Browser
- สร้างแท็บที่ยังไม่มีให้อัตโนมัติ: `publications`, `staff_programs`, `changes`
- ถ้าแท็บ `publications` ยังไม่มีข้อมูล จะนำข้อมูลเริ่มต้นจาก `data.json` (717 รายการในชุดข้อมูลที่ให้มา) เข้าไปครั้งแรกเท่านั้น ระบบจะไม่เขียนทับแท็บที่มีข้อมูลอยู่แล้ว
- หากต้องการใช้โหมด JSON ในเครื่องเหมือนเดิม ตั้ง `STORAGE_BACKEND=local` ได้

## ตั้งค่า Google Cloud และ Google Sheets

1. สร้างหรือเลือกโปรเจกต์ใน [Google Cloud Console](https://console.cloud.google.com/).
2. เปิดใช้งาน **Google Sheets API**.
3. สร้าง **Service Account** และสร้าง JSON key สำหรับบัญชีนี้ เก็บไฟล์ไว้อย่างปลอดภัย
4. สร้าง Google Spreadsheet แล้วคัดลอก ID จาก URL รูปแบบ `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
5. กด Share ใน Spreadsheet แล้วแชร์ให้ email ของ Service Account ด้วยสิทธิ์ **Editor**.
6. ไม่ต้องสร้างแท็บเองก็ได้ ระบบจะสร้างแท็บและหัวคอลัมน์ให้เมื่อเริ่มทำงานครั้งแรก

แท็บที่ระบบใช้:

- `publications`: `id`, `staff`, `detail`, `type`, `year`, `month`, `indexing`, `affiliation`, `key`
- `staff_programs`: `staff`, `program`
- `changes`: `seq`, `time`, `action`, `entity`, `id`, `before`, `after`, `restore_of`

อย่าเปลี่ยนชื่อหรือเรียงหัวคอลัมน์เหล่านี้เอง หากต้องการใช้ชื่อแท็บอื่น ให้เปลี่ยน Environment Variables ที่ระบุด้านล่าง

## รันในเครื่อง

1. แตก ZIP แล้วเปิดโฟลเดอร์โปรเจกต์
2. คัดลอก `.env.example` เป็น `.env`.
3. กรอก `ADMIN_USER` และ `ADMIN_PASSWORD` เป็นค่าที่เดายาก
4. กรอก `GOOGLE_SHEETS_SPREADSHEET_ID`.
5. เปิดไฟล์ JSON key ของ Service Account แล้วคัดลอกเนื้อหาทั้งหมดลง `GOOGLE_SERVICE_ACCOUNT_JSON` เป็น JSON บรรทัดเดียวใน `.env`. อย่า commit ไฟล์ `.env` หรือ key.
6. รัน `docker compose up --build -d`.
7. เปิด `http://localhost:8000` แล้วล็อกอินด้วยข้อมูลผู้ดูแล

หากไม่ใช้ Docker ให้ตั้ง Environment Variables เดียวกันใน shell, ติดตั้ง dependencies ด้วย `pip install -r requirements.txt` แล้วรัน `python server.py`.

## Deploy บน Render

1. Push โปรเจกต์ไป GitHub หลังตรวจว่า `.env` และ Service Account key ไม่ได้อยู่ใน commit.
2. สร้าง Web Service จาก Repository และเลือก **Docker** เป็น Runtime.
3. ตั้ง Environment Variables ต่อไปนี้ใน Render:d
   - `HOST=0.0.0.0`
   - `PORT=8000`
   - `STORAGE_BACKEND=google_sheets`
   - `ADMIN_USER` และ `ADMIN_PASSWORD`
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = เนื้อหา JSON key ทั้งก้อน (เป็น secret)
   - `GOOGLE_SHEETS_PUBLICATIONS_TAB=publications`
   - `GOOGLE_SHEETS_PROGRAMS_TAB=staff_programs`
   - `GOOGLE_SHEETS_AUDIT_TAB=changes`
4. Deploy แล้วเปิด URL ผ่าน HTTPS และล็อกอิน
5. ทดสอบอ่านข้อมูล เพิ่มรายการทดสอบ แก้ไข ลบ คืนค่าจากประวัติ และตรวจว่าข้อมูลใน Google Sheets เปลี่ยนตามจริง

เมื่อใช้ Google Sheets เป็น backend แล้ว ข้อมูลหลักและ audit log ไม่ต้องพึ่ง persistent disk ของ Render แต่ไฟล์ `data.json` ยังคงเป็นชุดข้อมูลตั้งต้นสำหรับการสร้างแท็บ `publications` ครั้งแรกที่ว่างเปล่า

## ความปลอดภัยและข้อจำกัดที่ควรรู้

- ห้าม commit `.env`, JSON key หรือใส่ key ใน JavaScript/HTML.
- ใช้ HTTPS เท่านั้น เพราะหน้าแก้ไขใช้ HTTP Basic Authentication.
- ระบบเดิมเป็นเครื่องมือผู้ดูแลแบบบัญชีเดียว ไม่ใช่ระบบ multi-user ที่มี role แยกบัญชี
- การบันทึกผลงานใน Google Sheets เขียนชุดข้อมูลในแท็บ `publications` ใหม่ทั้งชุดทุกครั้ง จึงเหมาะกับขนาดข้อมูลระดับโปรเจกต์นี้และการใช้งานผู้ดูแลจำนวนน้อย ไม่ควรเปิดให้หลายคนแก้พร้อมกันโดยไม่มีการออกแบบ concurrency เพิ่ม
- ควรสำรอง Google Spreadsheet เป็นระยะ และทดสอบกับสำเนาชีตก่อนใช้ข้อมูลจริง

## โหมด local JSON

หากต้องการกลับไปใช้ JSON ในเครื่อง ให้ตั้ง `STORAGE_BACKEND=local` และใช้ `storage/` สำหรับ `publications.json`, `staff_programs.json` และ `changes.jsonl`.

## Fast Cache (Apps Script backend)

When `STORAGE_BACKEND=apps_script`, the Python server loads publications,
program assignments and audit entries once at startup. Subsequent dashboard
reads use RAM rather than making a new Apps Script request for each page load.
Changes made through the dashboard are written to Google Sheets first, and
only then committed to the cache. If a write fails, the cache is not changed.

If you edit the spreadsheet directly, click **↻ Sync Sheets** on the dashboard
to reload all three tabs. Restarting the Python server also refreshes the cache.
The initial server startup and write operations still depend on Apps Script
response times. Keep your existing `.env` secret; it is not included in this ZIP.
