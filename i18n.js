/* UI-only localization. Publication titles, lecturer names and stored data stay verbatim. */
(() => {
  const phrases = {
    'ผลงานวิชาการ · วิทยาลัยการคอมพิวเตอร์': 'Publications · College of Computing',
    'ผลงานวิชาการ': 'Publications',
    'วิทยาลัยการคอมพิวเตอร์ · PSU Phuket': 'College of Computing · PSU Phuket',
    'เมนู': 'Menu', 'ไปยังส่วนต่าง ๆ': 'Jump to', 'หาอาจารย์': 'Find lecturers',
    'ภาพรวม': 'Overview', 'วิเคราะห์': 'Analysis', 'รายการผลงาน': 'Publications',
    'จัดการข้อมูล': 'Manage data', 'ผลงานวิชาการของอาจารย์ CoC': 'CoC faculty publications',
    'ค้นหาอาจารย์จากผลงาน หรือสำรวจแนวโน้มและรายการตีพิมพ์': 'Find lecturers by topic, explore trends, and browse publications.',
    'คำแนะนำจาก Cozy': 'Tips from Cozy', 'Cozy มาสคอต CoC': 'Cozy, the CoC mascot',
    'Cozy ชวนสำรวจ': 'Explore with Cozy',
    'เริ่มจากค้นหัวข้อที่สนใจ หรือเลือกช่วงปีเพื่อดูภาพรวมของผลงาน': 'Search for a topic or choose a year range to explore the publications.',
    'หาอาจารย์จากหัวข้อผลงาน': 'Find lecturers by topic',
    'สนใจหัวข้อไหน? ค้นคำจากรายละเอียดผลงาน แล้วเปิดดูผลงานที่พบได้ทันที': 'Search publication details for a topic and browse matching work.',
    'เช่น machine learning, security, tourism': 'e.g. machine learning, security, tourism',
    'ค้นหัวข้อผลงานอาจารย์': 'Search lecturer publication topics',
    'ผลลัพธ์อาศัยคำใน Detail เท่านั้น ชื่ออาจารย์ที่ไม่พบอาจมีความเชี่ยวชาญด้านนั้นเช่นกัน และจำนวนผลงานไม่ใช่คะแนนความเชี่ยวชาญ': 'Results match words in Detail only. A lecturer may have expertise even without a match; publication counts are not expertise scores.',
    'ตัวกรอง': 'Filters', 'ปีเริ่มต้น (พ.ศ.)': 'From year (CE)', 'ปีสิ้นสุด (พ.ศ.)': 'To year (CE)',
    'อาจารย์': 'Lecturer', 'ทุกคน': 'Everyone', 'ค้นหาชื่ออาจารย์': 'Search lecturers',
    'เลือกทุกคน': 'Select everyone', 'หลักสูตร': 'Program', 'ทุกหลักสูตร': 'All programs',
    'ยังไม่ระบุ': 'Unassigned', 'ไม่ระบุ': 'Not specified', 'ล้างตัวกรอง': 'Reset filters',
    'ตัวกรองเพิ่มเติม · หัวข้อ คำสำคัญ ประเภท และ Indexing': 'More filters · Topic, keyword, type, and indexing',
    'หัวข้อวิจัย': 'Research topic', 'ทุกหัวข้อ': 'All topics',
    'คำสำคัญที่พบบ่อย': 'Frequent keywords', 'ทุกคำสำคัญ': 'All keywords',
    'ค้นหาคำเฉพาะเพิ่มเติม': 'Search for an exact term',
    'พิมพ์คำจากรายละเอียดผลงาน': 'Enter a word from publication details',
    'ประเภทผลงาน': 'Publication type', 'ทุกประเภท': 'All types', 'ทุกค่า': 'All values',
    'วารสารนานาชาติ': 'International journal', 'ประชุมนานาชาติ': 'International conference',
    'วารสารระดับชาติ': 'National journal', 'ประชุมระดับชาติ': 'National conference',
    'หัวข้อและคำสำคัญจัดจากข้อความอ้างอิงอัตโนมัติ รายการหนึ่งอาจเข้าหลายหัวข้อ และควรตรวจชื่อบทความก่อนใช้สรุปเชิงวิชาการ': 'Topics and keywords are inferred from citations. One publication may match several topics; check the original title before drawing conclusions.',
    'สรุปข้อมูล': 'Summary', 'ผลงานไม่ซ้ำ': 'Unique publications',
    'รายการผลงานรายอาจารย์': 'Lecturer entries', 'บทความวารสาร': 'Journal articles',
    'งานประชุมวิชาการ': 'Conference papers', 'จำนวนผลงานในแต่ละปี': 'Publications by year',
    'นับผลงานแต่ละเรื่องหนึ่งครั้งในช่วงปีที่เลือก': 'Each publication is counted once in the selected years.',
    'ยอดรวม': 'Total', 'แยกประเภท': 'By type', 'แยกหลักสูตร': 'By program',
    'รูปแบบกราฟ': 'Chart style', 'แท่ง': 'Bars', 'เส้น': 'Lines', 'พื้นที่ซ้อน': 'Stacked area',
    'ดาวน์โหลด SVG': 'Download SVG', 'ดาวน์โหลดรายงาน CSV': 'Download CSV report',
    'กดจุดหรือช่วงปีในกราฟเพื่อดูรายการของปีนั้น': 'Select a year in the chart to see its publications.',
    'สัดส่วนประเภทผลงาน': 'Publication types',
    'คำนวณจากผลงานที่ไม่ซ้ำตามตัวกรอง': 'Based on unique publications matching the filters.',
    'มุมวิเคราะห์': 'Explore the data',
    'เลือกคำถามที่อยากสำรวจ แล้วใช้ตัวกรองด้านบนปรับข้อมูล': 'Choose a view, then use the filters above to narrow the results.',
    'Cozy บอกใบ้:': 'Cozy’s tip:',
    'ลองดูแนวโน้มก่อน แล้วกดปีในกราฟเพื่อเปิดรายการผลงานจริง': 'Start with trends, then select a year to see the underlying publications.',
    'แนวโน้ม': 'Trends', 'อาจารย์และหลักสูตร': 'Lecturers and programs',
    'ผลงานร่วม': 'Collaborations', 'ตรวจข้อมูล': 'Data checks',
    'รายการด้านล่างแสดงอาจารย์ที่มีชื่ออยู่ในไฟล์': 'Entries show lecturers named in the source file.',
    'ค้นหาในรายละเอียดผลงาน': 'Search publication details', 'ค้นหาผลงาน': 'Search publications',
    'แสดงเฉพาะผลงานปี': 'Showing publications from', 'ล้างปีที่เลือก': 'Clear selected year',
    'ก่อนหน้า': 'Previous', 'ถัดไป': 'Next',
    'ผลงานร่วมอาจปรากฏหลายแถวในไฟล์ต้นทาง กราฟยอดรวมและสัดส่วนประเภทนับเรื่องซ้ำเพียงครั้งเดียว ส่วนการแยกหลักสูตรนับเรื่องร่วมในแต่ละหลักสูตรที่เกี่ยวข้อง จึงอาจรวมกันมากกว่ายอดรวม หากข้อมูลหลักสูตรยังไม่ครบจะแสดงในกลุ่ม “ยังไม่ระบุ”': 'Joint publications may appear in multiple source rows. Total and type charts count each work once. Program counts include the work in every related program, so their sum may exceed the total. Lecturers without a mapped program appear as “Unassigned”.',
    'เพิ่ม แก้ไข นำเข้า CSV และดูประวัติ': 'Add, edit, import CSV, and view history',
    'จัดการหลักสูตรอาจารย์': 'Assign lecturer programs',
    'จับคู่อาจารย์กับหลักสูตร': 'Assign programs to lecturers',
    'เลือกหลักสูตรของแต่ละคน ข้อมูลที่กรอกจะบันทึกในโฟลเดอร์ข้อมูลถาวรของเซิร์ฟเวอร์': 'Assign a program to each lecturer. Changes are saved in the server’s persistent data folder.',
    'ดาวน์โหลดตารางจับคู่': 'Download program mapping', 'เพิ่มหรือแก้ผลงาน': 'Add or edit a publication',
    'ชื่ออาจารย์': 'Lecturer name', 'ประเภท': 'Type', 'ปี ค.ศ.': 'Year (CE)',
    'เดือน': 'Month', 'สังกัด PSU': 'PSU affiliation', 'ใช่': 'Yes', 'ไม่ใช่': 'No',
    'รายละเอียดผลงาน': 'Publication details', 'เช่น Scopus': 'e.g. Scopus',
    'เพิ่มผลงาน': 'Add publication', 'บันทึกการแก้ไข': 'Save changes',
    'ยกเลิกการแก้ไข': 'Cancel editing', 'นำเข้าข้อมูลและประวัติ': 'Import and history',
    'นำเข้า CSV รุ่นใหม่': 'Import a new CSV', 'ยืนยันการนำเข้า': 'Confirm import',
    'ดูประวัติการแก้ไข': 'View change history', 'ประวัติการเปลี่ยนแปลง': 'Change history',
    'การกระทำ': 'Action', 'ทั้งหมด': 'All', 'เพิ่ม': 'Create', 'แก้ไข': 'Edit',
    'ลบ': 'Delete', 'นำเข้า': 'Import', 'คืนค่า': 'Restore',
    'ข้อมูล': 'Entity', 'ผลงาน': 'Publication', 'นำเข้าหลายรายการ': 'Bulk import',
    'ตั้งแต่วันที่': 'From date', 'ถึงวันที่': 'To date', 'ค้นหาประวัติ': 'Search history',
    'ชื่ออาจารย์หรือคำ': 'Lecturer or keyword', 'ยกเลิก': 'Cancel', 'ยืนยัน': 'Confirm',
    'กราฟผลงานตามปี': 'Publications by year chart', 'กราฟผลงานรายปี': 'Yearly publications chart',
    'รวม': 'Total', 'วารสาร': 'Journals', 'งานประชุม': 'Conferences', 'ประชุม': 'Conferences',
    'กลุ่ม': 'Group', 'สัดส่วนวารสาร': 'Journal share',
    'AI และ Machine Learning': 'AI and machine learning', 'ภาพและ Computer Vision': 'Images and computer vision',
    'ภาษาและ NLP': 'Language and NLP', 'ความปลอดภัย': 'Security',
    'เครือข่ายและสื่อสาร': 'Networks and communications',
    'ซอฟต์แวร์และระบบ': 'Software and systems', 'การศึกษา': 'Education',
    'ธุรกิจและการท่องเที่ยว': 'Business and tourism',
    'สุขภาพและชีวสารสนเทศ': 'Health and bioinformatics',
    'จำนวนผลงานและค่าเฉลี่ยย้อนหลัง': 'Publications and rolling average',
    'ช่วงแรก เริ่ม': 'First period from', 'ช่วงแรก สิ้นสุด': 'First period to',
    'ช่วงหลัง เริ่ม': 'Second period from', 'ช่วงหลัง สิ้นสุด': 'Second period to',
    'ปีเริ่มต้นต้องไม่เกินปีสิ้นสุด': 'Start year must not exceed end year.',
    'ผลงานรวม': 'All publications', 'ฐานเดิมเป็นศูนย์': 'The first period has zero publications',
    'แต่ละช่วงอาจยาวไม่เท่ากัน ตัวเลขนี้เป็นยอดรวมของช่วง ไม่ใช่อัตราต่อปี': 'Periods may differ in length. These are totals, not annual rates.',
    'เลือกปีเพื่อดูแนวโน้ม': 'Select years to explore the trend.',
    'ปีสุดท้ายในช่วงที่เลือก': 'Last year selected', 'เทียบปีก่อนหน้า': 'Compared with previous year',
    'เลือกอย่างน้อย 2 ปี': 'Select at least 2 years', 'ค่าเฉลี่ยต่อปี': 'Annual average',
    'ข้อมูลปี 2025 มาจากไฟล์ CV-10-2025 อาจยังไม่ครบทั้งปี โปรดระวังเมื่อเทียบกับปีเต็ม': 'The 2025 data comes from CV-10-2025 and may be incomplete. Use care when comparing it with full years.',
    'ปริมาณผลงานและแนวโน้มเฉลี่ย': 'Publications and rolling trend',
    'แท่ง = จำนวนจริง · เส้น = ค่าเฉลี่ยย้อนหลังสูงสุด 3 ปี': 'Bars show counts; the line shows a rolling average of up to 3 years.',
    'ส่วนผสมของประเภทผลงาน': 'Publication mix',
    'สัดส่วนภายในแต่ละปี เลื่อนลงเพื่อดูทุกปี': 'Share within each year; scroll down to see all years.',
    'เทียบสองช่วงปีแบบเลือกเอง': 'Compare two year ranges',
    'เปรียบเทียบ': 'Compare', 'อาจารย์ทั้งหมด': 'All lecturers', 'เรียงตาม': 'Sort by',
    'ชื่อ': 'Name', 'อาจารย์ 12 อันดับแรก': 'Top 12 lecturers',
    'ยอดตามหลักสูตร': 'Totals by program', 'จำนวนรายปี': 'Yearly counts',
    'ผลงานร่วมอยู่ในยอดของแต่ละอาจารย์หรือหลักสูตรที่เกี่ยวข้อง': 'Joint work counts for each participating lecturer or program.',
    'ดูไทม์ไลน์รายอาจารย์': 'View a lecturer timeline',
    'เลือกอาจารย์': 'Select lecturer',
    '“ยังไม่ระบุ” คือผลงานของอาจารย์ที่ยังไม่ได้จับคู่หลักสูตร': '“Unassigned” refers to lecturers without a mapped program.',
    'ไม่มีผลงานในช่วงที่เลือก': 'No publications in the selected years.',
    'เครือข่ายผลงานร่วม': 'Collaboration network',
    'อาจารย์และหลักสูตร': 'Lecturers and programs',
    'ไม่พบผลงานร่วมในช่วงที่เลือก': 'No collaborations found in the selected years.',
    'Indexing ไม่ระบุ': 'Indexing not specified',
    'หลักสูตรยังไม่ระบุ': 'Program unassigned',
    'รายการซ้ำของอาจารย์คนเดียว': 'Duplicate lecturer entries',
    'เปิดแบบฟอร์มแก้ไข': 'Open edit form',
    'เลือกหัวข้อตัวอย่างหรือพิมพ์อย่างน้อย 2 ตัวอักษร': 'Choose an example topic or type at least 2 characters.',
    'ไม่พบคำนี้ในรายละเอียดผลงาน ลองใช้คำภาษาอังกฤษอื่นหรือคำที่สั้นลง': 'No matching publication details. Try another or shorter English term.',
    'ดูผลงานที่พบ': 'View matching publications',
    'ไม่พบผลงานตามตัวกรองที่เลือก': 'No publications match the selected filters.',
    'แก้ไข': 'Edit', 'ไม่พบประวัติตามตัวกรอง': 'No history matches the selected filters.',
    'คืนค่าการเปลี่ยนแปลงนี้': 'Restore this change',
    'บันทึกไม่สำเร็จ': 'Could not save.', 'ไม่มีข้อมูลที่เปลี่ยน': 'Nothing has changed.',
    'ตรวจสอบก่อนบันทึก': 'Review before saving',
    'บันทึกผลงานแล้ว': 'Publication saved.', 'ยืนยันการลบผลงาน': 'Confirm deletion',
    'ลบรายการแล้ว สามารถคืนค่าได้จากประวัติ': 'Deleted. You can restore it from history.',
    'คืนค่าการเปลี่ยนแปลง': 'Restore a change', 'คืนค่าแล้ว': 'Restored.',
    'นำเข้าข้อมูลแล้ว': 'Data imported.', 'ไม่มี': 'None',
    'ค้นหาผลงาน': 'Search publications',
    'จัดการรายการ': 'Manage entry',
    'เช่น Scopus': 'e.g. Scopus'
  };

  const originals = new WeakMap();
  const lastOutput = new WeakMap();
  let language = 'th';
  const titleTH = document.title;
  const year = value => String(Number(value) - 543);
  function translate(text, element) {
    const trimmed = text.trim();
    if (!trimmed) return text;
    let result = phrases[trimmed];
    if (result === undefined) {
      result = trimmed;
      if (/^(25|26)\d{2}$/.test(trimmed) && element?.closest('#from,#to,#chart,#analysisContent,#finderResults,#drillLabel')) result = year(trimmed);
      else if (/^(25|26)\d{2} \/ \d{1,2}$/.test(trimmed)) result = year(trimmed.slice(0, 4)) + trimmed.slice(4);
      else {
        result = result.replace(/พ\.ศ\.\s*((?:25|26)\d{2})/g, (_, n) => year(n));
        result = result.replace(/^หน้า (\d+) \/ (\d+)$/, 'Page $1 / $2')
          .replace(/^\((\d+) รายการ\)$/, '($1 entries)')
          .replace(/^พบ (\d+) รายการ$/, 'Found $1 entries')
          .replace(/^เลือก (\d+) คน$/, '$1 lecturers selected')
          .replace(/^พบ (\d+) เรื่องที่มีคำค้น$/, 'Found $1 matching publications')
          .replace(/^พบผลงานที่มีคำค้นของอาจารย์ (\d+) คน · เรียงชื่อตามตัวอักษร$/, 'Matching work by $1 lecturers · alphabetical order')
          .replace(/^เรื่องใน (\d+) ปีที่เลือก$/, 'publications over $1 selected years')
          .replace(/^(\d+) เรื่อง$/, '$1 publications')
          .replace(/^แสดง (\d+) จาก (\d+) รายการ$/, 'Showing $1 of $2 entries')
          .replace(/^แสดง (\d+) รายการจาก (\d+)$/, 'Showing $1 of $2 entries')
          .replace(/^((?:19|20)\d{2}) · (.+): (\d+)$/, (_, y, label, count) => `${y} · ${phrases[label] || label}: ${count}`)
          .replace(/^((?:19|20)\d{2}) · คลิกดูรายการ$/, '$1 · Select to view entries')
          .replace(/^((?:19|20)\d{2}) · (.+)$/, (_, y, label) => `${y} · ${phrases[label] || label}`)
          .replace(/^ค่าเฉลี่ยย้อนหลังถึง ((?:19|20)\d{2}): (.+)$/, 'Rolling average through $1: $2')
          .replace(/^เรื่อง · ((?:19|20)\d{2})$/, 'publications · $1')
          .replace(/^เรื่อง จาก (\d+) → (\d+)$/, 'publications from $1 → $2')
          .replace(/^(.+): (\d+) เรื่อง$/, '$1: $2 publications')
          .replace(/^กดดูรายการ$/, 'View entries')
          .replace(/^จัดการรายการ #(\d+)$/, 'Manage entry #$1');
        if (element?.id === 'importSummary') result = trimmed.replace(/^(\d+) แถว · เพิ่มใหม่ (\d+) · มีแล้ว (\d+) · ข้อมูลไม่ถูกต้อง (\d+)$/, '$1 rows · $2 new · $3 existing · $4 invalid').replace(/^นำเข้าแล้ว (\d+) รายการ$/, 'Imported $1 entries');
        if (element?.id === 'importSample') result = trimmed
          .replace(/^เพิ่มใหม่ \(แสดง (\d+) รายการแรก\)/m, 'New (first $1 entries)')
          .replace(/^มีแล้ว \(แสดง (\d+) รายการแรก\)/m, 'Existing (first $1 entries)')
          .replace(/^ข้อมูลไม่ถูกต้อง \(แสดง (\d+) รายการแรก\)/m, 'Invalid (first $1 entries)')
          .replace(/^แถว (\d+) · /gm, 'Row $1 · ')
          .replace(/^ไม่มี$/gm, 'None');
        if (element?.closest('#records .record small')) result = trimmed
          .replace(' · ยังไม่ระบุ · ', ' · Unassigned · ')
          .replace(/Indexing: ไม่ระบุ$/, 'Indexing: Not specified');
        if (result === trimmed) {
          const match = trimmed.match(/^พบ (\d+) คู่ จากผลงานที่รายละเอียดตรงกันภายใต้ชื่ออาจารย์หลายคน ข้อความที่กล่าวถึงผู้ร่วมเขียนอย่างเดียวจะไม่ถูกนับ$/);
          if (match) result = `${match[1]} lecturer pairs share a publication with matching details. Names mentioned in text alone are not counted.`;
        }
        if (result === trimmed) {
          const match = trimmed.match(/^ตารางด้านล่างแสดงทุก(คน|หลักสูตร) เลื่อนได้ตามแนวนอน$/);
          if (match) result = `The table shows every ${match[1] === 'คน' ? 'lecturer' : 'program'}; scroll horizontally to see all years.`;
        }
        if (result === trimmed) {
          const match = trimmed.match(/^(.+) · แสดง (\d+) จาก (\d+) รายการ$/);
          if (match && phrases[match[1]]) result = `${phrases[match[1]]} · Showing ${match[2]} of ${match[3]} entries`;
        }
        if (result === trimmed) {
          const match = trimmed.match(/^(.+) · (\d+) เรื่อง$/);
          if (match) result = `${phrases[match[1]] || match[1]} · ${match[2]} publications`;
        }
      }
    }
    if (result === trimmed) return text;
    return text.replace(trimmed, result);
  }
  function skip(element) {
    return !element || element.closest('script,style,[data-no-translate],#auditList pre,#reviewBody,#records .record h3,#analytics .record p,#finderResults li:not(small)') &&
      !(element.closest('#finderResults li') && element.tagName?.toLowerCase() === 'small');
  }
  function visit(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      const parent = root.parentElement;
      if (skip(parent)) return;
      const current = root.nodeValue;
      if (!originals.has(root) || lastOutput.get(root) !== current) originals.set(root, current);
      const original = originals.get(root);
      const output = language === 'en' ? translate(original, parent) : original;
      lastOutput.set(root, output);
      if (current !== output) root.nodeValue = output;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || skip(root) && root !== document.body) return;
    for (const attr of ['placeholder', 'aria-label', 'title']) {
      if (!root.hasAttribute(attr)) continue;
      const name = 'data-th-' + attr;
      const previous = root.getAttribute(name);
      const current = root.getAttribute(attr);
      if (previous === null || (language === 'th' && current !== previous && !root.hasAttribute('data-en-' + attr))) root.setAttribute(name, current);
      const original = root.getAttribute(name);
      const output = language === 'en' ? translate(original, root) : original;
      if (current !== output) root.setAttribute(attr, output);
    }
    for (const child of root.childNodes) visit(child);
  }
  function apply() {
    document.documentElement.lang = language;
    window.cocLanguage = language;
    document.title = language === 'en' ? phrases[titleTH] : titleTH;
    document.getElementById('langTH').setAttribute('aria-pressed', String(language === 'th'));
    document.getElementById('langEN').setAttribute('aria-pressed', String(language === 'en'));
    visit(document.body);
  }
  function select(lang) {
    language = lang;
    try { localStorage.setItem('coc-language', lang); } catch (_) { }
    apply();
    if (!document.getElementById('auditPanel').hidden && typeof showAudit === 'function') showAudit().catch(() => { });
  }
  document.getElementById('langTH').addEventListener('click', () => select('th'));
  document.getElementById('langEN').addEventListener('click', () => select('en'));
  const observer = new MutationObserver(records => {
    const changed = new Set();
    for (const record of records) {
      if (record.type === 'characterData') changed.add(record.target);
      else for (const node of record.addedNodes) changed.add(node);
    }
    for (const node of changed) visit(node);
  });
  observer.observe(document.body, { childList: true, characterData: true, subtree: true });
  try { language = localStorage.getItem('coc-language') === 'en' ? 'en' : 'th'; } catch (_) { }
  apply();
})();
