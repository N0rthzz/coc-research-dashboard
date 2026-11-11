/* Source: https://computing.psu.ac.th/th/academic-staff/ ; retrieved 2026-11-11. */
const STAFF_PORTRAITS = {
  "AZIZ NANTHAAMORNPHONG": {
    "name": "รศ.ดร.อซีส นันทอมรพงศ์",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ผศ.ดร.อซีส-นันทอมรพงศ์-225x300-1.jpg",
    "email": "aziz.n@phuket.psu.ac.th"
  },
  "WARODOM WERAPUN": {
    "name": "รศ.ดร.วโรดม วีระพันธ์",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ผศ.ดร.วโรดม-วีระพันธ์-225x300-1.jpg",
    "email": "warodom.w@phuket.psu.ac.th"
  },
  "ADISAK INTANA": {
    "name": "ผศ.ดร.อดิศักดิ์ อินทนา",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.อดิศักดิ์-อินทนา-225x300-1.jpg",
    "email": "adisak.i@phuket.psu.ac.th"
  },
  "WASIMON PANICHPATTANAKUL": {
    "name": "ดร.วศิมน พาณิชพัฒนกุล",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.วศิมน-พาณิชพัฒนกุล-225x300-1.jpg",
    "email": "wasimon.pa@phuket.psu.ac.th"
  },
  "KULJAREE TANTAYAKUL": {
    "name": "ผศ.ดร.กุลจรี ตันตยกุล",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.กุลจรี-ตันตยกุล-225x300-1.jpg",
    "email": "kuljaree.t@phuket.psu.ac.th"
  },
  "KANJANA LAOSEN": {
    "name": "ผศ.ดร.กาญจนา เหล่าเส็น",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/kanjana_l-1-225x300-1.jpg",
    "email": "kanjana.l@phuket.psu.ac.th"
  },
  "PHATCHAREE THEPNIMIT": {
    "name": "อาจารย์ พัชรี เทพนิมิตร",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/อาจารย์พัชรี-เทพนิมิตร-225x300-1.jpg",
    "email": "phatcharee.th@phuket.psu.ac.th"
  },
  "MONCHANOK THONGTHEP": {
    "name": "อาจารย์มนชนก ทองเทพ",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/อาจารย์มนชนก-ทองเทพ-225x300-1.jpg",
    "email": "monchanok.t@phuket.psu.ac.th"
  },
  "VEERAPORN SIDDOO": {
    "name": "ผศ.ดร.วีราภรณ์ ซิดดู",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.วีราภรณ์-ซิดดู-225x300-1.jpg",
    "email": "veeraporn.s@phuket.psu.ac.th"
  },
  "NORRATHEP RATTANAVIPANON": {
    "name": "ผศ.ดร.นรเทพ รัตนวิภานนท์",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.นรเทพ-รัตนวิภานนท์-225x300-1.jpg",
    "email": "norrathep.r@phuket.psu.ac.th"
  },
  "MANEENATE PUONGMANEE": {
    "name": "ดร.มณีเนตร พวงมณี",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/MANEENATE_PUONGMANEE_r-225x300-1.jpg",
    "email": "maneenate.p@phuket.psu.ac.th"
  },
  "THITINAN KLIANGSUWAN": {
    "name": "ผศ.ดร.ฐิตินันท์ เกลี้ยงสุวรรณ",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.ฐิตินันท์-เกลี้ยงสุวรรณ-225x300-1.jpg",
    "email": "thitinan.kl@phuket.psu.ac.th"
  },
  "AYUTH INTRAPRADIT": {
    "name": "อาจารย์อยุทธย์ อินทรประดิษฐ์",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/อาจารย์อยุทธย์-อินทรประดิษฐ์-225x300-1.jpg",
    "email": "ayuth.i@phuket.psu.ac.th"
  },
  "APICHAT HEEDNACRAM": {
    "name": "รศ.ดร.อภิชาติ หีดนาคราม",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/รศ.ดร.อภิชาติ-หีดนาคราม-225x300-1.jpg",
    "email": "apichat.h@phuket.psu.ac.th"
  },
  "KOMSAN KANJANASIT": {
    "name": "ผศ.ดร.คมสันต์ กาญจนสิทธิ์",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/KOMSAN_re-225x300-1.jpg",
    "email": "komsan.k@phuket.psu.ac.th"
  },
  "KWANKAMON DITTAKAN": {
    "name": "ผศ.ดร.ขวัญกมล ดิฐกัญจน์",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.ขวัญกมล-ดิฐกัญจน์2-225x300-1.jpg",
    "email": "kwankamon.d@phuket.psu.ac.th"
  },
  "NAWANOL THEERA-AMPORNPUNT": {
    "name": "ผศ.ดร.นวนล ธีระอัมพรพันธุ์",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.นวนล-ธีระอัมพรพันธุ์-225x300-1.jpg",
    "email": "nawanol.t@phuket.psu.ac.th"
  },
  "NATTAPONG TONGTEP": {
    "name": "ผศ.ดร.ณัฐพงศ์ ทองเทพ",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ผศ.ดร.ณัฐพงศ์-ทองเทพ-225x300-1.jpg",
    "email": "nattapong.t@phuket.psu.ac.th"
  },
  "JAKRAPHAN CHAOPREECHA": {
    "name": "ผศ.ดร.จักรพันธ์ เชาว์ปรีชา",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.จักรพันธ์-เชาว์ปรีชา-225x300-1.jpg",
    "email": "jakraphan.c@phuket.psu.ac.th"
  },
  "JIRAWAT THAENTHONG": {
    "name": "ผศ.ดร.จิรวัฒน์ แท่นทอง",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.จิรวัฒน์-แท่นทอง-225x300-1.jpg",
    "email": "jirawat.t@phuket.psu.ac.th"
  },
  "AMONRAT PRASITSUPPAROTE": {
    "name": "ผศ.ดร.อมรรัตน์ ประสิทธิ์ศุภโรจน์",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.อมรรัตน์-ประสิทธิ์ศุภโรจน์-225x300-1.jpg",
    "email": "amonrat.pr@phuket.psu.ac.th"
  },
  "PANISA TREEPONG": {
    "name": "ผศ.ดร.ปาณิศา ตรีพงศ์",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.ปาณิศา-ตรีพงศ์-225x300-1.jpg",
    "email": "panisa.t@phuket.psu.ac.th"
  },
  "JAKAPAN SUABOOT": {
    "name": "ผศ.ดร.จักรพันธ์ สัวบุตร",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.จักรพันธ์-สัวบุตร2-225x300-1.jpg",
    "email": "jakapan.su@phuket.psu.ac.th"
  },
  "KULLAWAT CHAOWANAWATEE": {
    "name": "ผศ.กุลวรรธน์ เชาวนวาที",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/กุลวรรธน์-เชาวนวาที-2-3-225x300-1.jpg",
    "email": "kullawat.c@phuket.psu.ac.th"
  },
  "CHAKADKIT THAENCHAIKUN": {
    "name": "ผศ.ดร.ฉกาจกิจ แท่นชัยกุล",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.ฉกาจกิจ-แท่นชัยกุล-225x300-1.jpg",
    "email": "chakadkit.th@phuket.psu.ac.th"
  },
  "CHAMIKORN HIRANRAT": {
    "name": "ดร.จามิกร หิรัญรัตน์",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/อาจารย์จามิกร-หิรัญรัตน์-225x300-1.jpg",
    "email": "jamikorn.hi@phuket.psu.ac.th"
  },
  "VORAVIKA WATTANASOONTORN": {
    "name": "ดร.วรวิกา วัฒนสุนทร",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/ดร.วรวิกา-วัฒนสุนทร-225x300-1.jpg",
    "email": "voravika.w@phuket.psu.ac.th"
  },
  "LERLUCK BOONLAMP": {
    "name": "อาจารย์เลอลักษณ์ บุญล้ำ",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/อาจารย์เลอลักษณ์-บุญล้ำ-225x300-1.jpg",
    "email": "lerluck.b@phuket.psu.ac.th"
  },
  "WISARUT CHANTARA": {
    "name": "อาจารย์ วิศรุต จันทระ",
    "photo": "https://computing.psu.ac.th/th/storage/2025/07/อาจารย์วิศรุต-จันทระ-225x300-1.jpg",
    "email": "wisarut.ch@phuket.psu.ac.th"
  }
};
function staffIdentity(name) {
 const safe=escapeHTML(name), profile=STAFF_PORTRAITS[staffKey(name)];
 const initials=String(name).trim().split(/\s+/).map(s=>s[0]).slice(0,2).join('');
 return `<span class="staffIdentity"><span class="staffAvatar" aria-hidden="true"><span>${escapeHTML(initials)}</span>${profile?`<img src="${escapeHTML(profile.photo)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:''}</span><span>${safe}</span></span>`;
}
document.addEventListener('error',event=>{if(event.target.matches?.('.staffAvatar img'))event.target.remove()},true);
