(() => {
  const root = $('programGrid');
  let editing = '', query = '';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  root.before(status);
  const notify = (text, error = false) => { status.textContent = text; status.className = error ? 'warning' : 'hint'; };
  const names = () => staffChoices();
  const count = name => data.filter(row => staffKey(row.staff) === staffKey(name)).length;
  programEditor = function () {
    const filteredNames = names().filter(name => staffKey(name).includes(staffKey(query)));
    root.innerHTML = `<form id="staffForm" class="staffForm"><h3>${editing ? 'แก้ไขอาจารย์' : 'เพิ่มอาจารย์'}</h3><label>ชื่ออาจารย์<input id="staffNameInput" maxlength="180" required value="${escapeHTML(editing)}" placeholder="ชื่อที่ใช้ในรายการผลงาน"></label><fieldset><legend>หลักสูตร (เลือกได้หลายหลักสูตร)</legend>${PROGRAMS.slice(0,-1).map(p => `<label><input name="staffProgram" type="checkbox" value="${p}" ${editing && hasProgram(editing,p) ? 'checked' : ''}> ${p}</label>`).join('')}</fieldset><p class="hint">ไม่เลือกหลักสูตร = ยังไม่ระบุ${editing ? ` · การเปลี่ยนชื่อจะอัปเดตชื่อในผลงานที่เชื่อมอยู่ ${count(editing)} รายการด้วย` : ''}</p><div><button type="submit" class="primary">${editing ? 'บันทึกการแก้ไข' : 'เพิ่มอาจารย์'}</button> <button type="button" class="quiet" data-staff-cancel>ล้างฟอร์ม</button></div></form><div class="staffDirectory"><label>ค้นหาอาจารย์<input id="staffManagerSearch" type="search" value="${escapeHTML(query)}" placeholder="ค้นหาชื่อ"></label><p class="hint">${filteredNames.length} คน · ลบได้เฉพาะอาจารย์ที่ไม่มีผลงานเชื่อมอยู่</p>${filteredNames.map(name => `<article class="staffManageRow"><div>${staffIdentity(name)}<p class="hint">${escapeHTML(programOf(name))} · ${count(name)} รายการผลงาน</p></div><div><button type="button" class="quiet" data-staff-edit="${escapeHTML(name)}">แก้ไข</button> <button type="button" class="quiet warning" data-staff-delete="${escapeHTML(name)}" ${count(name) ? 'disabled title="มีผลงานเชื่อมอยู่ กรุณาแก้ชื่ออาจารย์ในผลงานก่อน"' : ''}>ลบ</button></div></article>`).join('') || '<p class="hint">ไม่พบอาจารย์</p>'}</div>`;
  };
  async function reloadStaff() {
    mapping = await api('/api/programs');
    await refresh();
  }
  root.onchange = null;
  root.addEventListener('input', e => {
    if (e.target.id !== 'staffManagerSearch') return;
    const position = e.target.selectionStart;
    query = e.target.value; programEditor();
    const input = $('staffManagerSearch'); input.focus();
    if (position !== null) try { input.setSelectionRange(position, position); } catch {}
  });
  root.addEventListener('submit', async e => {
    if (e.target.id !== 'staffForm') return;
    e.preventDefault();
    const name = $('staffNameInput').value.trim();
    if (editing && name !== editing && count(editing) && !await review('เปลี่ยนชื่ออาจารย์', `เปลี่ยน ${editing} เป็น ${name} รวมถึงชื่อในผลงาน ${count(editing)} รายการ`)) return;
    const button = e.target.querySelector('[type=submit]'); button.disabled = true;
    try {
      await api('/api/staff', 'POST', { original: editing, name, programs: [...root.querySelectorAll('[name=staffProgram]:checked')].map(input => input.value) });
      editing = ''; await reloadStaff(); notify('บันทึกอาจารย์แล้ว');
    } catch (error) { notify(error.message, true); button.disabled = false; }
  });
  root.addEventListener('click', async e => {
    const button = e.target.closest('[data-staff-edit],[data-staff-delete],[data-staff-cancel]');
    if (!button) return;
    if (button.hasAttribute('data-staff-cancel')) { editing = ''; programEditor(); return; }
    if (button.dataset.staffEdit) { editing = button.dataset.staffEdit; programEditor(); $('staffNameInput').focus(); return; }
    const name = button.dataset.staffDelete;
    if (!await review('ลบอาจารย์', `ลบ ${name} ออกจากรายชื่อและตารางหลักสูตร`, 'ลบ')) return;
    button.disabled = true;
    try { await api('/api/staff', 'POST', { action: 'delete', original: name }); editing = ''; await reloadStaff(); notify('ลบอาจารย์แล้ว'); }
    catch (error) { notify(error.message, true); button.disabled = false; }
  });
  programEditor();
})();
