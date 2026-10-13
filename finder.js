// Find relevant publications without treating a publication count as an expertise score.
const finderQuery = document.getElementById('finderQuery');
const finderResults = document.getElementById('finderResults');
const finderCount = document.getElementById('finderCount');

function drawFinder() {
  const query = finderQuery.value.trim().toLocaleLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  if (query.length < 2 || !words.length) {
    finderCount.textContent = 'เลือกหัวข้อตัวอย่างหรือพิมพ์อย่างน้อย 2 ตัวอักษร';
    finderResults.innerHTML = '';
    return;
  }
  const groups = new Map();
  for (const row of data) {
    const detail = row.detail.toLocaleLowerCase();
    if (!words.every(word => detail.includes(word))) continue;
    if (!groups.has(row.staff)) groups.set(row.staff, new Map());
    const entries = groups.get(row.staff);
    // The source may list the same publication more than once for one lecturer.
    if (!entries.has(row.key)) entries.set(row.key, row);
  }
  const names = [...groups.keys()].sort((a, b) => a.localeCompare(b));
  finderCount.textContent = names.length
    ? `พบผลงานที่มีคำค้นของอาจารย์ ${names.length} คน · เรียงชื่อตามตัวอักษร`
    : 'ไม่พบคำนี้ในรายละเอียดผลงาน ลองใช้คำภาษาอังกฤษอื่นหรือคำที่สั้นลง';
  finderResults.innerHTML = names.map(name => {
    const papers = [...groups.get(name).values()].sort((a, b) => b.year - a.year || b.month - a.month);
    return `<article class="finderPerson"><h3>${escapeHTML(name)}</h3><p>พบ ${papers.length} เรื่องที่มีคำค้น</p><details><summary>ดูผลงานที่พบ</summary><ol>${papers.map(row => `<li>${escapeHTML(row.detail)}<small>พ.ศ. ${row.year + 543} · ${escapeHTML(LABELS[row.type] || row.type)}</small></li>`).join('')}</ol></details></article>`;
  }).join('');
}

finderQuery.addEventListener('input', drawFinder);
document.querySelector('.finderTopics').addEventListener('click', event => {
  const button = event.target.closest('[data-finder]');
  if (!button) return;
  finderQuery.value = button.dataset.finder;
  drawFinder();
  finderQuery.focus();
});
const renderBeforeFinder = render;
render = function () { renderBeforeFinder(); drawFinder(); };
drawFinder();
