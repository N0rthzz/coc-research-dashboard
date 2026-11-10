// Paint the complete filtered dataset rather than capturing the visible viewport.
function heatmapExportModel(rows){
  const {years,entries}=peopleEntries(rows);
  const buckets=peopleBuckets(years,peopleDisplay==='five'?5:1);
  const bands=peopleDisplay==='five'?[5,15,30]:peopleGroup==='staff'?[1,3,6]:[5,15,30];
  return {years,entries,buckets,bands};
}
function wrapCanvasText(context,value,width){
  const lines=[];let line='';
  for(const character of String(value)){
    if(line&&context.measureText(line+character).width>width){lines.push(line.trim());line=''}
    line+=character;
  }
  if(line)lines.push(line.trim());return lines.length?lines:[''];
}
async function exportPeoplePng(){
  const en=window.cocLanguage==='en';
  const {years,entries,buckets,bands}=heatmapExportModel(filtered());
  if(!entries.length)throw Error(en?'No matching data to export':'ไม่มีข้อมูลตามตัวกรองสำหรับส่งออก');
  if(document.fonts)await document.fonts.ready;
  const colors=['#f3f6f8','#e2f6f7','#b9e9ec','#70d0d6','#16858d'];
  const level=n=>!n?0:n<=bands[0]?1:n<=bands[1]?2:n<=bands[2]?3:4;
  const nameWidth=280,statWidth=82,cellWidth=68,padding=28;
  const width=padding*2+nameWidth+statWidth*3+buckets.length*cellWidth;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)throw Error(en?'Image export is unavailable':'ไม่สามารถสร้างรูปภาพได้');
  const font='"Noto Sans Thai", Tahoma, sans-serif';
  ctx.font=`15px ${font}`;
  const names=entries.map(entry=>wrapCanvasText(ctx,entry.name,nameWidth-24));
  const heights=names.map(lines=>Math.max(48,lines.length*23+18));
  const height=230+heights.reduce((sum,n)=>sum+n,0)+85;
  const scale=Math.min(2,Math.sqrt(24000000/(width*height)));
  canvas.width=Math.ceil(width*scale);canvas.height=Math.ceil(height*scale);ctx.scale(scale,scale);
  ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.textBaseline='middle';
  const text=(value,x,y,color='#344e5d',size=15,align='left',weight=400)=>{ctx.font=`${weight} ${size}px ${font}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(String(value),x,y)};
  ctx.fillStyle='#33c0ca';ctx.fillRect(padding,28,5,42);
  text('CoC · PSU PHUKET',padding+18,38,'#16858d',14,'left',600);
  text(en?'Publication heatmap — '+(peopleGroup==='staff'?'Lecturers':'Programs'):'Heatmap ผลงาน — '+(peopleGroup==='staff'?'อาจารย์':'หลักสูตร'),padding+18,68,'#344e5d',24,'left',600);
  const year=y=>en?y:y+543;
  const range=`${$('fromMonth').value}/${year(+$('from').value)} – ${$('toMonth').value}/${year(+$('to').value)}`;
  const program=$('program').selectedOptions[0]?.textContent||'';
  text(`${en?'Period':'ช่วงเวลา'}: ${range} · ${en?'Program':'หลักสูตร'}: ${program} · ${entries.length} ${en?'rows':'รายชื่อ'}`,padding,110,'#5a707d',14);
  if(peopleSearch)text(`${en?'Name search':'ค้นหาชื่อ'}: ${peopleSearch}`,padding,136,'#5a707d',14);
  let legendX=padding;
  ['0','1–'+bands[0],(bands[0]+1)+'–'+bands[1],(bands[1]+1)+'–'+bands[2],(bands[2]+1)+'+'].forEach((label,index)=>{ctx.fillStyle=colors[index];ctx.fillRect(legendX,156,20,18);text(label,legendX+27,165,'#4c6472',13);legendX+=100});
  const headerY=190,headerHeight=40;
  ctx.fillStyle='#eef4f6';ctx.fillRect(padding,headerY,width-padding*2,headerHeight);
  text(peopleGroup==='staff'?(en?'Lecturer':'อาจารย์'):(en?'Program':'หลักสูตร'),padding+12,210,'#344e5d',14,'left',600);
  const labels=en?['Total','Journal','Conference']:['รวม','วารสาร','ประชุม'];
  labels.forEach((label,index)=>text(label,padding+nameWidth+statWidth*(index+.5),210,'#344e5d',13,'center',600));
  buckets.forEach((bucket,index)=>text(bucket.length===1?year(bucket[0]):`${year(bucket[0])}–${year(bucket.at(-1))}`,padding+nameWidth+statWidth*3+cellWidth*(index+.5),210,'#344e5d',bucket.length>1?11:13,'center',600));
  let y=230;
  entries.forEach((entry,index)=>{
    const rowHeight=heights[index];ctx.fillStyle=index%2?'#fafcfd':'#fff';ctx.fillRect(padding,y,width-padding*2,rowHeight);
    names[index].forEach((line,lineIndex)=>text(line,padding+12,y+rowHeight/2+(lineIndex-(names[index].length-1)/2)*23,'#344e5d',15,'left',500));
    [entry.total,entry.journal,entry.conference].forEach((n,column)=>text(n,padding+nameWidth+statWidth*(column+.5),y+rowHeight/2,'#344e5d',15,'center',column===0?600:400));
    buckets.forEach((bucket,column)=>{const n=bucket.reduce((sum,yr)=>sum+entry.annual[years.indexOf(yr)],0),intensity=level(n),x=padding+nameWidth+statWidth*3+column*cellWidth;ctx.fillStyle=colors[intensity];ctx.fillRect(x+4,y+5,cellWidth-8,rowHeight-10);text(n||'—',x+cellWidth/2,y+rowHeight/2,intensity===4?'#fff':'#24565d',14,'center',600)});
    y+=rowHeight;
  });
  text(en?'Unique publications within each group. Joint work may count in multiple groups.':'นับผลงานไม่ซ้ำภายในแต่ละกลุ่ม · ผลงานร่วมอาจนับในหลายคนหรือหลายหลักสูตร',padding,y+30,'#5a707d',13);
  text(en?'All matching rows and years included; no viewport cropping.':'ส่งออกครบทุกรายชื่อและทุกปีตามตัวกรอง ไม่ตัดตามขนาดหน้าจอ',padding,y+55,'#5a707d',13);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw Error(en?'Could not create image':'สร้างรูปภาพไม่สำเร็จ');
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`coc-${peopleGroup}-heatmap-${years[0]}-${years.at(-1)}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
$('analysisContent').addEventListener('click',async event=>{
  const button=event.target.closest('[data-export-people]');if(!button)return;
  button.disabled=true;
  try{await exportPeoplePng()}catch(error){alert(error.message)}finally{button.disabled=false}
});
