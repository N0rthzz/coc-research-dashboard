const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

// Exercise language switching, including dynamic period text and restoration.
const buttons={};
const element={closest:()=>null};
const text={nodeType:3,nodeValue:'ดาวน์โหลดรูป PNG',parentElement:element};
const body={nodeType:1,closest:()=>null,hasAttribute:()=>false,childNodes:[text]};
const context={window:{},Node:{TEXT_NODE:3,ELEMENT_NODE:1},
  document:{title:'ผลงานวิชาการ · วิทยาลัยการคอมพิวเตอร์',body,documentElement:{},
    getElementById:id=>buttons[id]??=( {hidden:true,setAttribute(){},addEventListener(event,fn){this[event]=fn}})},
  localStorage:{getItem:()=>null,setItem(){}},MutationObserver:class{observe(){}}
};
vm.createContext(context);vm.runInContext(fs.readFileSync('i18n.js','utf8'),context);
buttons.langEN.click();assert.equal(text.nodeValue,'Download PNG image');
const t=context.window.cocTranslate;
assert.equal(t('ตุลาคม'),'October');assert.equal(t('ผลงานตามหลักสูตร'),'Publications by program');
assert.equal(t('Heatmap รายปี'),'Heatmap: annual');
assert.equal(t('หน้า 1 / 3 · แสดงครั้งละ 10 รายชื่อ'),'Page 1 / 3 · 10 names per page');
const period={closest:selector=>selector.includes('#periodStatus')?{}:null};
assert.equal(t('ตุลาคม 2568 — กันยายน 2569 · กราฟแสดงแยกตามปีปฏิทิน',period),'October 2025 — September 2026 · Charts use calendar years');
assert.equal(t('2569',{closest:selector=>selector.includes('#fiscalYear')?{}:null}),'2026');
buttons.langTH.click();assert.equal(text.nodeValue,'ดาวน์โหลดรูป PNG');assert.equal(t('ตุลาคม'),'ตุลาคม');

// Export paints the entire dataset, independent of the on-screen viewport/page.
const fills=[],drawn=[],downloads=[];
const canvasContext={font:'',measureText:value=>({width:String(value).length*8}),
  scale(){},fillRect(...args){fills.push(args)},fillText(value){drawn.push(value)}};
const canvas={getContext:()=>canvasContext,toBlob:callback=>callback({type:'image/png'})};
const exportButtons={analysisContent:{addEventListener(){}},from:{value:'2025'},to:{value:'2026'},
  fromMonth:{value:'10'},toMonth:{value:'9'},program:{selectedOptions:[{textContent:'All programs'}]}};
const entries=Array.from({length:25},(_,i)=>({name:'Lecturer '+i,total:3,journal:2,conference:1,annual:[1,2]}));
const exportContext={window:{cocLanguage:'en'},peopleDisplay:'annual',peopleGroup:'staff',peopleSearch:'',
  peopleEntries:()=>({years:[2025,2026],entries}),peopleBuckets:(years,size)=>size===1?years.map(y=>[y]):[years],
  filtered:()=>[], $:id=>exportButtons[id],
  document:{fonts:{ready:Promise.resolve()},createElement:tag=>tag==='canvas'?canvas:{click(){downloads.push(this.download)}}},
  URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout(){},alert:assert.fail
};
vm.createContext(exportContext);vm.runInContext(fs.readFileSync('heatmap-export.js','utf8'),exportContext);
(async()=>{
  await exportContext.exportPeoplePng();
  assert.equal(downloads.length,1);assert.ok(downloads[0].endsWith('.png'));
  assert.ok(drawn.includes('Lecturer 24'));assert.ok(drawn.includes('2025'));assert.ok(drawn.includes('2026'));
  assert.ok(canvas.height>1200);assert.ok(fills.length>25);
  exportContext.peopleDisplay='five';assert.equal(exportContext.heatmapExportModel([]).buckets.length,1);
  console.log('Passed: locale switching, month/fiscal translations, full-data PNG export and grouped buckets');
})().catch(error=>{console.error(error);process.exitCode=1});
