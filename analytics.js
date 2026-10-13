// Views derive from the current in-memory data after each CRUD operation.
let chartStyle='bar',analysisView='network',timelineStaff='',comparison=[2020,2022,2023,2025],qualityKind='indexing',peopleSort='total';
const TOPICS=[
  ['AI และ Machine Learning',/\b(machine learning|deep learning|neural|artificial intelligence|classification|prediction|transformer|yolo|reinforcement learning)\b/i],
  ['ภาพและ Computer Vision',/\b(image|vision|object detection|recognition|video|segmentation|steganography|medical imaging)\b/i],
  ['ภาษาและ NLP',/\b(language|sentiment|text mining|natural language|translation|speech|thai text|chatbot)\b/i],
  ['ความปลอดภัย',/\b(security|privacy|cryptograph|attack|authentication|intrusion|vulnerabilit)/i],
  ['เครือข่ายและสื่อสาร',/\b(network|wireless|optical|signal|antenna|communication|noma|otfs|mimo)\b/i],
  ['ซอฟต์แวร์และระบบ',/\b(software|system|requirements|testing|cloud|distributed|mobile application|embedded|internet of things|iot)\b/i],
  ['การศึกษา',/\b(education|educational|student|learning outcome|teaching|classroom|active learning)\b/i],
  ['ธุรกิจและการท่องเที่ยว',/\b(business|tourism|hotel|marketing|customer|entrepreneur|service quality)\b/i],
  ['สุขภาพและชีวสารสนเทศ',/\b(health|medical|disease|gene|protein|clinical|patient)\b/i]
];
const KEYWORDS=['learning','detection','classification','prediction','network','security','software','image','recognition','signal','tourism','education','students','mobile','cloud','iot','privacy','sentiment','text','neural','deep','optical','antenna','blockchain','bioinformatics','recommendation','sustainability','energy','smart','thai'];
function hasWord(text,word){return new RegExp(`\\b${word}\\b`,'i').test(text)}
const originalFiltered=filtered;
filtered=function(){const word=$('advancedKeyword').value.trim().toLocaleLowerCase(),keyword=$('keywordFilter').value,topic=$('topicFilter').value,type=$('advancedType').value,index=$('advancedIndexing').value;return originalFiltered().filter(r=>(!word||r.detail.toLocaleLowerCase().includes(word))&&(!keyword||hasWord(r.detail,keyword))&&(!topic||TOPICS[+topic][1].test(r.detail))&&(!type||r.type===type)&&(!index||r.indexing===index))};
const originalRender=render;
render=function(){originalRender();drawAnalysis()};
function svgChart(rows) {
  const years = [];
  for (let y = +$('from').value; y <= +$('to').value; y++) years.push(y);
  if (!years.length) return;
  const cats = mode === 'type' ? TYPES : mode === 'program' ? PROGRAMS : ['รวม'];
  const byYear = years.map(year => {
    const current = rows.filter(x => x.year === year);
    return cats.map(cat => mode === 'total' ? unique(current).length
      : mode === 'type' ? unique(current.filter(x => x.type === cat)).length
      : unique(current.filter(x => programOf(x.staff) === cat)).length);
  });
  const percent = chartStyle === 'percent';
  const max = percent ? 100 : chartStyle === 'line'
    ? Math.max(1, ...byYear.flat())
    : Math.max(1, ...byYear.map(values => values.reduce((a, b) => a + b, 0)));
  const width = Math.max(600, years.length * 52 + 100), height = 300;
  const left = 49, right = 16, top = 18, base = 248;
  const step = (width - left - right) / years.length, barWidth = Math.min(36, step * .66);
  const yCoord = value => base - (base - top) * value / max;
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="กราฟผลงานตามปี">`;
  for (let tick = 0; tick <= 4; tick++) {
    const y = yCoord(max * tick / 4);
    svg += `<path d="M${left} ${y} H${width-right}" stroke="#e3ebf3"/>`
      + `<text x="${left-10}" y="${y+4}" text-anchor="end" fill="#52697e" font-size="12">${percent ? tick * 25 + '%' : Math.round(max * tick / 4)}</text>`;
  }
  byYear.forEach((values, i) => {
    const x = left + i * step + step / 2;
    svg += `<text x="${x}" y="${base+22}" text-anchor="middle" fill="#52697e" font-size="12">${years[i]+543}</text>`;
    if (chartStyle === 'bar' || percent) {
      const sum = values.reduce((a, b) => a + b, 0);
      let cumulative = 0;
      values.forEach((n, j) => {
        if (!n || (percent && !sum)) return;
        const amount = percent ? n * 100 / sum : n;
        const barHeight = (base - top) * amount / max;
        const y = base - (base - top) * (cumulative + amount) / max;
        cumulative += amount;
        const detail = percent ? ` · ${Math.round(n * 100 / sum)}% (${n} เรื่อง)` : `: ${n}`;
        svg += `<rect data-year="${years[i]}" x="${x-barWidth/2}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${COLORS[j%COLORS.length]}">`
          + `<title>พ.ศ. ${years[i]+543} · ${LABELS[cats[j]] || cats[j]}${detail}</title></rect>`;
      });
    }
  });
  if (chartStyle === 'line') cats.forEach((cat, j) => {
    const points = byYear.map((v, i) => [left + i * step + step / 2, yCoord(v[j]), v[j]]);
    svg += `<polyline points="${points.map(p => p.slice(0, 2).join(',')).join(' ')}" fill="none" stroke="${COLORS[j%COLORS.length]}" stroke-width="2.5"/>`;
    points.forEach((point, i) => {
      svg += `<circle data-year="${years[i]}" cx="${point[0]}" cy="${point[1]}" r="5" fill="${COLORS[j%COLORS.length]}">`
        + `<title>พ.ศ. ${years[i]+543} · ${LABELS[cat] || cat}: ${point[2]}</title></circle>`;
    });
  });
  if (chartStyle === 'area') {
    for (let j = cats.length - 1; j >= 0; j--) {
      const upper = byYear.map((v, i) => [left + i * step + step / 2, yCoord(v.slice(0, j + 1).reduce((a, b) => a + b, 0))]);
      const lower = byYear.map((v, i) => [left + i * step + step / 2, yCoord(v.slice(0, j).reduce((a, b) => a + b, 0))]).reverse();
      svg += `<polygon points="${[...upper, ...lower].map(p => p.join(',')).join(' ')}" fill="${COLORS[j%COLORS.length]}" opacity=".83"><title>${LABELS[cats[j]] || cats[j]}</title></polygon>`;
    }
    byYear.forEach((_, i) => {
      const x = left + i * step + step / 2;
      svg += `<rect data-year="${years[i]}" x="${x-step/2}" y="${top}" width="${step}" height="${base-top}" fill="transparent"><title>พ.ศ. ${years[i]+543} · คลิกดูรายการ</title></rect>`;
    });
  }
  $('chart').innerHTML = svg + '</svg>';
  $('legend').innerHTML = mode === 'total' ? '' : cats.map((cat, i) => `<span style="--color:${COLORS[i%COLORS.length]}">${LABELS[cat] || cat}</span>`).join('');
  $('chartHelp').textContent = percent
    ? mode === 'program'
      ? 'แต่ละแท่งรวม 100% จากยอดของหลักสูตรที่เกี่ยวข้อง ผลงานร่วมอาจถูกนับในหลายหลักสูตร · กดส่วนสีเพื่อดูรายการปีนั้น'
      : 'แต่ละแท่งรวม 100% เพื่อเทียบสัดส่วนประเภทระหว่างปี · กดส่วนสีเพื่อดูรายการปีนั้น'
    : 'กดจุดหรือส่วนสีในกราฟเพื่อดูรายการของปีนั้น';
}
drawBarChart=svgChart;
function countTable(rows){return `<div class="tablewrap"><table><thead><tr><th>กลุ่ม</th><th>วารสาร</th><th>งานประชุม</th><th>สัดส่วนวารสาร</th><th>รวม</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${escapeHTML(x.name)}</td><td>${x.journal}</td><td>${x.conference}</td><td>${x.journal+x.conference?Math.round(100*x.journal/(x.journal+x.conference))+'%':'—'}</td><td><strong>${x.journal+x.conference}</strong></td></tr>`).join('')}</tbody></table></div>`}
function breakdown(rows,name){const u=unique(rows);return {name,journal:u.filter(x=>x.type.includes('Journal')).length,conference:u.filter(x=>x.type.includes('Proceedings')).length}}
let activeView='trends',peopleGroup='staff',comparisonYears=[2020,2022,2023,2025];
const spanYears=()=>{let out=[];for(let y=+$('from').value;y<=+$('to').value;y++)out.push(y);return out};
const summaryCounts=rows=>{let u=unique(rows);return {total:u.length,journal:u.filter(x=>x.type.includes('Journal')).length,conference:u.filter(x=>x.type.includes('Proceedings')).length}};
function trendChart(rows,years){let counts=years.map(y=>unique(rows.filter(x=>x.year===y)).length),moving=counts.map((_,i)=>{let slice=counts.slice(Math.max(0,i-2),i+1);return slice.reduce((a,b)=>a+b,0)/slice.length}),max=Math.max(1,...counts,...moving),w=Math.max(650,years.length*57+70),baseline=235,top=18,step=(w-60)/years.length,svg=`<svg viewBox="0 0 ${w} 285" role="img" aria-label="จำนวนผลงานและค่าเฉลี่ยย้อนหลัง">`;
for(let t=0;t<=4;t++){let y=baseline-(baseline-top)*t/4;svg+=`<path d="M46 ${y} H${w-10}" stroke="#e1eaf3"/><text x="39" y="${y+4}" text-anchor="end" fill="#61778c" font-size="12">${Math.round(max*t/4)}</text>`}
years.forEach((yr,i)=>{let x=47+step*i+step/2,y=baseline-(baseline-top)*counts[i]/max;svg+=`<rect data-drill="${yr}" x="${x-12}" y="${y}" width="24" height="${baseline-y}" rx="3" fill="#2563a6"><title>พ.ศ. ${yr+543}: ${counts[i]} เรื่อง</title></rect><text x="${x}" y="${baseline+21}" text-anchor="middle" fill="#5e7387" font-size="12">${yr+543}</text>`});
let points=moving.map((v,i)=>[47+step*i+step/2,baseline-(baseline-top)*v/max]);svg+=`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#b27a18" stroke-width="3"/>${points.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#b27a18"><title>ค่าเฉลี่ยย้อนหลังถึง พ.ศ. ${years[i]+543}: ${moving[i].toFixed(1)}</title></circle>`).join('')}</svg>`;return svg}
function composition(rows,years){let active=years.filter(y=>rows.some(x=>x.year===y));return `<div class="composition">${active.map(y=>{let r=unique(rows.filter(x=>x.year===y)),tot=r.length;return `<div class="mixrow"><button class="linkbutton" data-drill="${y}">${y+543}</button><div class="mixtrack">${TYPES.map((t,i)=>{let n=r.filter(x=>x.type===t).length;return n?`<span style="width:${100*n/tot}%;background:${COLORS[i]}" title="${LABELS[t]}: ${n} (${Math.round(100*n/tot)}%)"></span>`:''}).join('')}</div><strong>${tot}</strong></div>`}).join('')}</div><div class="legend">${TYPES.map((t,i)=>`<span style="--color:${COLORS[i]}">${LABELS[t]}</span>`).join('')}</div>`}
function periodControls(years){if(!years.length)return '';let options=years.map(y=>`<option value="${y}">${y+543}</option>`);return `<div class="periodInputs">${['ช่วงแรก เริ่ม','ช่วงแรก สิ้นสุด','ช่วงหลัง เริ่ม','ช่วงหลัง สิ้นสุด'].map((label,i)=>`<label>${label}<select data-period="${i}">${years.map((y,j)=>`<option value="${y}" ${y===comparisonYears[i]?'selected':''}>${y+543}</option>`).join('')}</select></label>`).join('')}</div>`}
function comparePeriods(rows){let [a,b,c,d]=comparisonYears;if(a>b||c>d)return '<p class="soft">ปีเริ่มต้นต้องไม่เกินปีสิ้นสุด</p>';let first=summaryCounts(rows.filter(x=>x.year>=a&&x.year<=b)),second=summaryCounts(rows.filter(x=>x.year>=c&&x.year<=d));let items=[['ผลงานรวม','total'],['วารสาร','journal'],['งานประชุม','conference']];return `<div class="periodCompare">${items.map(([label,key])=>`<div><span>${label}</span><strong>${first[key]} → ${second[key]}</strong><small>${first[key]===0?'ฐานเดิมเป็นศูนย์':`${second[key]>=first[key]?'+':''}${Math.round(100*(second[key]-first[key])/first[key])}%`}</small></div>`).join('')}</div><p class="note">แต่ละช่วงอาจยาวไม่เท่ากัน ตัวเลขนี้เป็นยอดรวมของช่วง ไม่ใช่อัตราต่อปี</p>`}
function trendView(rows){let years=spanYears();if(years.length<1)return '<p class="muted">เลือกปีเพื่อดูแนวโน้ม</p>';if(comparisonYears.some(y=>!years.includes(y))){let middle=Math.floor(years.length/2);comparisonYears=[years[0],years[Math.max(0,middle-1)],years[middle],years.at(-1)]}let counts=years.map(y=>unique(rows.filter(x=>x.year===y)).length),latest=counts.at(-1),previous=counts.at(-2);let html=`<div class="insightCards"><div><span>ปีสุดท้ายในช่วงที่เลือก</span><strong>${latest}</strong><small>เรื่อง · พ.ศ. ${years.at(-1)+543}</small></div><div><span>เทียบปีก่อนหน้า</span><strong>${previous===undefined?'—':`${latest-previous>=0?'+':''}${latest-previous}`}</strong><small>${previous===undefined?'เลือกอย่างน้อย 2 ปี':`เรื่อง จาก ${previous} → ${latest}`}</small></div><div><span>ค่าเฉลี่ยต่อปี</span><strong>${(counts.reduce((a,b)=>a+b,0)/years.length).toFixed(1)}</strong><small>เรื่องใน ${years.length} ปีที่เลือก</small></div></div>`;
if(years.includes(2025))html+='<p class="note">ข้อมูลปี 2025 มาจากไฟล์ CV-10-2025 อาจยังไม่ครบทั้งปี โปรดระวังเมื่อเทียบกับปีเต็ม</p>';
html+=`<div class="analysisSplit"><section><h3>ปริมาณผลงานและแนวโน้มเฉลี่ย</h3><p class="hint">แท่ง = จำนวนจริง · เส้น = ค่าเฉลี่ยย้อนหลังสูงสุด 3 ปี</p><div class="chart insightChart">${trendChart(rows,years)}</div></section><section><h3>ส่วนผสมของประเภทผลงาน</h3><p class="hint">สัดส่วนภายในแต่ละปี เลื่อนลงเพื่อดูทุกปี</p>${composition(rows,years)}</section></div>`;
html+=`<details class="analysisDetails"><summary>เทียบสองช่วงปีแบบเลือกเอง</summary>${periodControls(years)}<div id="periodResults">${comparePeriods(rows)}</div></details>`;return html}
function heatmapTable(entries, years, group) {
  const bands = group === 'staff' ? [1, 3, 6] : [5, 15, 30];
  const level = n => !n ? 0 : n <= bands[0] ? 1 : n <= bands[1] ? 2 : n <= bands[2] ? 3 : 4;
  const label = group === 'staff' ? 'อาจารย์' : 'หลักสูตร';
  return `<div class="heatLegend" aria-label="ระดับสีของจำนวนผลงาน"><span>จำนวนผลงานต่อปี</span>${['0', '1–'+bands[0], (bands[0]+1)+'–'+bands[1], (bands[1]+1)+'–'+bands[2], (bands[2]+1)+'+'].map((range,i)=>`<span><i class="heatLevel h${i}"></i>${range}</span>`).join('')}</div>`
    + `<div class="tablewrap heatWrap"><table class="peopleTable heatTable"><thead><tr><th scope="col">${label}</th><th scope="col">รวม</th><th scope="col">วารสาร</th><th scope="col">ประชุม</th>${years.map(y=>`<th scope="col">${y+543}</th>`).join('')}</tr></thead><tbody>`
    + entries.map(e=>`<tr><th scope="row">${escapeHTML(e.name)}</th><td><strong>${e.total}</strong></td><td>${e.journal}</td><td>${e.conference}</td>${e.annual.map((n,i)=>`<td>${n?`<button type="button" class="heatCell h${level(n)}" data-heat-year="${years[i]}" data-heat-group="${escapeHTML(e.name)}" aria-label="${escapeHTML(e.name)} พ.ศ. ${years[i]+543}: ${n} เรื่อง" title="กดดูผลงาน ${escapeHTML(e.name)} พ.ศ. ${years[i]+543}">${n}</button>`:`<span class="heatCell h0" aria-label="ไม่มีผลงาน">—</span>`}</td>`).join('')}</tr>`).join('')
    + '</tbody></table></div>';
}
function peopleView(rows){let years=spanYears();let groupValues=peopleGroup==='program'?PROGRAMS:[...new Set(rows.map(x=>x.staff))];let entries=groupValues.map(name=>{let items=rows.filter(x=>peopleGroup==='program'?programOf(x.staff)===name:x.staff===name),tot=summaryCounts(items);return {name,...tot,annual:years.map(y=>unique(items.filter(x=>x.year===y)).length)}});entries.sort((a,b)=>peopleSort==='name'?a.name.localeCompare(b.name):b[peopleSort]-a[peopleSort]||a.name.localeCompare(b.name));let max=Math.max(1,...entries.map(e=>e.total)),peak=Math.max(1,...entries.flatMap(e=>e.annual));let top=entries.slice(0,12);return `<div class="analysisControls"><label>เปรียบเทียบ<select id="peopleGroup"><option value="staff" ${peopleGroup==='staff'?'selected':''}>อาจารย์ทั้งหมด</option><option value="program" ${peopleGroup==='program'?'selected':''}>หลักสูตร</option></select></label><label>เรียงตาม<select id="peopleSort"><option value="total" ${peopleSort==='total'?'selected':''}>ผลงานรวม</option><option value="journal" ${peopleSort==='journal'?'selected':''}>วารสาร</option><option value="conference" ${peopleSort==='conference'?'selected':''}>งานประชุม</option><option value="name" ${peopleSort==='name'?'selected':''}>ชื่อ</option></select></label></div><div class="analysisSplit"><section><h3>${peopleGroup==='staff'?'อาจารย์ 12 อันดับแรก':'ยอดตามหลักสูตร'}</h3><div class="ranking">${top.map(e=>`<div class="rankrow"><span title="${escapeHTML(e.name)}">${escapeHTML(e.name)}</span><div class="ranktrack"><i style="width:${100*e.total/max}%"></i></div><strong>${e.total}</strong></div>`).join('')}</div></section><section><h3>Heatmap: ${peopleGroup==='staff'?'อาจารย์':'หลักสูตร'} × ปี</h3><p class="hint">สีเข้มหมายถึงผลงานมาก กดช่องที่มีตัวเลขเพื่อดูรายการจริงของปีนั้น</p><p class="note">ผลงานร่วมอยู่ในยอดของแต่ละอาจารย์หรือหลักสูตรที่เกี่ยวข้อง</p></section></div>${heatmapTable(entries,years,peopleGroup)}`+(peopleGroup==='staff'?`<details class="analysisDetails"><summary>ดูไทม์ไลน์รายอาจารย์</summary><label>เลือกอาจารย์ <select id="timelineSelect">${entries.map(e=>`<option value="${escapeHTML(e.name)}" ${timelineStaff===e.name?'selected':''}>${escapeHTML(e.name)}</option>`).join('')}</select></label><div id="timelineItems">${timelineContent(rows,entries)}</div></details>`:'<p class="note">“ยังไม่ระบุ” คือผลงานของอาจารย์ที่ยังไม่ได้จับคู่หลักสูตร</p>')}
function timelineContent(rows,entries){let name=timelineStaff&&entries.some(e=>e.name===timelineStaff)?timelineStaff:entries[0]?.name;timelineStaff=name||'';let items=rows.filter(x=>x.staff===name).sort((a,b)=>b.year-a.year||b.month-a.month);return items.length?items.map(x=>`<div class="record"><span class="tag">${x.year+543} / ${x.month}</span><span class="tag">${LABELS[x.type]}</span><p>${escapeHTML(x.detail)}</p></div>`).join(''):'<p class="muted">ไม่มีผลงานในช่วงที่เลือก</p>'}
function collaborationView(rows){let groups=new Map();for(const row of rows){let list=groups.get(row.key)||[];list.push(row);groups.set(row.key,list)}let pairs=new Map();for(const list of groups.values()){let names=[...new Set(list.map(x=>x.staff))].sort();for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){let id=names[i]+'|'+names[j],record=pairs.get(id)||{names:[names[i],names[j]],count:0,titles:[]};record.count++;record.titles.push(list[0].detail);pairs.set(id,record)}}let edges=[...pairs.values()].sort((a,b)=>b.count-a.count),names=[...new Set(edges.flatMap(e=>e.names))].slice(0,18);let points=new Map(names.map((n,i)=>[n,{x:350+215*Math.cos(2*Math.PI*i/names.length),y:190+135*Math.sin(2*Math.PI*i/names.length)}]));let svg=names.length?`<div class="chart networkChart"><svg viewBox="0 0 700 395" role="img" aria-label="เครือข่ายผลงานร่วม">${edges.filter(e=>e.names.every(n=>points.has(n))).map(e=>{let a=points.get(e.names[0]),b=points.get(e.names[1]);return `<line x1="${a.x}" x2="${b.x}" y1="${a.y}" y2="${b.y}" stroke="#79a6bf" stroke-width="${Math.min(12,2+2*e.count)}"><title>${escapeHTML(e.names.join(' + '))}: ${e.count} เรื่อง</title></line>`}).join('')}${names.map(n=>{let p=points.get(n);return `<circle cx="${p.x}" cy="${p.y}" r="12" fill="#245580"><title>${escapeHTML(n)}</title></circle><text x="${p.x}" y="${p.y+25}" text-anchor="middle" font-size="11" fill="#294258">${escapeHTML(n.split(' ').at(-1))}</text>`}).join('')}</svg></div>`:'';return `<p class="hint">พบ ${edges.length} คู่ จากผลงานที่รายละเอียดตรงกันภายใต้ชื่ออาจารย์หลายคน ข้อความที่กล่าวถึงผู้ร่วมเขียนอย่างเดียวจะไม่ถูกนับ</p>`+(svg||'<p class="muted">ไม่พบผลงานร่วมในช่วงที่เลือก</p>')+edges.map(e=>`<details class="record"><summary>${escapeHTML(e.names.join(' + '))} · ${e.count} เรื่อง</summary>${e.titles.map(x=>`<p>${escapeHTML(x)}</p>`).join('')}</details>`).join('')}
function qualityView(rows){let seen=new Map();for(let x of rows){let k=x.staff+'|'+x.year+'|'+x.key;seen.set(k,(seen.get(k)||0)+1)}let buckets={indexing:rows.filter(x=>x.indexing==='ไม่ระบุ'),program:rows.filter(x=>programOf(x.staff)==='ยังไม่ระบุ'),duplicate:rows.filter(x=>seen.get(x.staff+'|'+x.year+'|'+x.key)>1)};let labels={indexing:'Indexing ไม่ระบุ',program:'หลักสูตรยังไม่ระบุ',duplicate:'รายการซ้ำของอาจารย์คนเดียว'};return `<div class="qualityTiles">${Object.keys(buckets).map(key=>`<button data-quality="${key}" class="${qualityKind===key?'active':''}"><strong>${buckets[key].length}</strong><span>${labels[key]}</span></button>`).join('')}</div><p class="hint">${labels[qualityKind]} · แสดง ${Math.min(100,buckets[qualityKind].length)} จาก ${buckets[qualityKind].length} รายการ</p>`+buckets[qualityKind].slice(0,100).map(x=>`<div class="record"><strong>${escapeHTML(x.staff)} · ${x.year+543}</strong><p>${escapeHTML(x.detail)}</p><button class="linkbutton" data-quality-edit="${x.id}">เปิดแบบฟอร์มแก้ไข</button></div>`).join('')}
function drawAnalysis(){const root=$('analysisContent');if(!root)return;let rows=filtered(),names={trends:'แนวโน้ม',people:'อาจารย์และหลักสูตร',collab:'ผลงานร่วม',quality:'ตรวจข้อมูล'};document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===activeView);b.setAttribute('aria-pressed',b.dataset.view===activeView?'true':'false')});$('analysisHeading').textContent=names[activeView];root.innerHTML=activeView==='trends'?trendView(rows):activeView==='people'?peopleView(rows):activeView==='collab'?collaborationView(rows):qualityView(rows)}
$('analysisNav').onclick=e=>{let button=e.target.closest('[data-view]');if(button){activeView=button.dataset.view;drawAnalysis()}};
$('analysisContent').onchange=e=>{if(e.target.dataset.period!==undefined)comparisonYears[+e.target.dataset.period]=+e.target.value;if(e.target.id==='peopleSort')peopleSort=e.target.value;if(e.target.id==='peopleGroup')peopleGroup=e.target.value;if(e.target.id==='timelineSelect')timelineStaff=e.target.value;if(e.target.id==='timelineSelect'){let rows=filtered(),entries=[...new Set(rows.map(x=>x.staff))].map(name=>({name}));$('timelineItems').innerHTML=timelineContent(rows,entries)}else drawAnalysis()};
$('analysisContent').onclick=e=>{let b=e.target.closest('[data-quality],[data-quality-edit],[data-drill],[data-heat-year]');if(!b)return;if(b.dataset.quality){qualityKind=b.dataset.quality;drawAnalysis()}else if(b.dataset.qualityEdit){fillForm(+b.dataset.qualityEdit)}else if(b.dataset.heatYear){if(peopleGroup==='staff'){selected=new Set([b.dataset.heatGroup]);$('program').value='all';options()}else{$('program').value=b.dataset.heatGroup==='ยังไม่ระบุ'?'unknown':b.dataset.heatGroup}drillYear=+b.dataset.heatYear;page=0;render();$('publications').scrollIntoView({behavior:'smooth',block:'start'})}else if(b.dataset.drill){drillYear=+b.dataset.drill;page=0;render();$('records').scrollIntoView({behavior:'smooth',block:'start'})}};

for(const id of ['advancedKeyword','topicFilter','keywordFilter','advancedType','advancedIndexing'])$(id).addEventListener(id==='advancedKeyword'?'input':'change',()=>{page=0;render()});
const resetBasic=$('reset').onclick;
$('reset').onclick=()=>{for(const id of ['advancedKeyword','topicFilter','keywordFilter','advancedType','advancedIndexing'])$(id).value='';resetBasic()};
// init has already started its fetch; update indexing choices when the first load completes.
const waitForData=setInterval(()=>{if(!data.length)return;clearInterval(waitForData);let indexes=[...new Set(data.map(x=>x.indexing))].sort();$('advancedIndexing').innerHTML='<option value="">ทุกค่า</option>'+indexes.map(x=>`<option value="${escapeHTML(x)}">${escapeHTML(x)}</option>`).join('');const papers=unique(data);$('topicFilter').innerHTML='<option value="">ทุกหัวข้อ</option>'+TOPICS.map(([label,regex],i)=>`<option value="${i}">${label} (${papers.filter(x=>regex.test(x.detail)).length})</option>`).join('');$('keywordFilter').innerHTML='<option value="">ทุกคำสำคัญ</option>'+KEYWORDS.map(word=>[word,papers.filter(x=>hasWord(x.detail,word)).length]).filter(([,n])=>n>=3).sort((a,b)=>b[1]-a[1]).map(([word,n])=>`<option value="${word}">${word} (${n})</option>`).join('');drawAnalysis()},100);
$('chartStyle').onchange=e=>{chartStyle=e.target.value;if(chartStyle==='percent'&&mode==='total'){mode='type';document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode))}render()};
document.querySelectorAll('[data-mode]').forEach(button=>{const original=button.onclick;button.onclick=()=>{if(chartStyle==='percent'&&button.dataset.mode==='total'){chartStyle='bar';$('chartStyle').value='bar'}original()}});
function download(content,name,type){let blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
$('exportChart').onclick=()=>{const svg=$('chart').querySelector('svg');if(!svg)return;let copy=svg.cloneNode(true);copy.setAttribute('xmlns','http://www.w3.org/2000/svg');download(new XMLSerializer().serializeToString(copy),'coc-publications-chart.svg','image/svg+xml')};
const csvCell=x=>'"'+String(x??'').replaceAll('"','""')+'"';
$('exportReport').onclick=()=>{let rows=filtered().filter(x=>drillYear===null||x.year===drillYear),q=$('textSearch').value.trim().toLocaleLowerCase();rows=rows.filter(x=>!q||x.detail.toLocaleLowerCase().includes(q)||x.staff.toLocaleLowerCase().includes(q));const header=['ID','Year CE','Year BE','Month','Staff name','Program','Type','Indexing','PSU affiliation','Detail'];let lines=[header.map(csvCell).join(','),...rows.map(x=>[x.id,x.year,x.year+543,x.month,x.staff,programOf(x.staff),x.type,x.indexing,x.affiliation,x.detail].map(csvCell).join(','))];download('\ufeff'+lines.join('\r\n'),'coc-publications-report.csv','text/csv;charset=utf-8')};
