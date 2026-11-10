// A continuous month range; chart headings continue to use calendar years.
const MONTH_NAMES=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
function inMonthRange(row,fromYear,fromMonth,toYear,toMonth){const month=Number(row.month);if(!Number.isInteger(month)||month<1||month>12)return fromMonth===1&&toMonth===12&&row.year>=fromYear&&row.year<=toYear;const value=Number(row.year)*12+month;return value>=fromYear*12+fromMonth&&value<=toYear*12+toMonth}
for(const id of ['fromMonth','toMonth','fiscalStart'])$(id).innerHTML=MONTH_NAMES.map((name,i)=>`<option value="${i+1}">${name}</option>`).join('');
$('toMonth').value='12';$('fiscalStart').value='10';
const filterBeforeMonths=filtered;
filtered=function(){const a=+$('from').value,b=+$('to').value,m=+$('fromMonth').value,n=+$('toMonth').value;const valid=a*12+m<=b*12+n;$('periodStatus').textContent=valid?`${MONTH_NAMES[m-1]} ${a+543} — ${MONTH_NAMES[n-1]} ${b+543} · กราฟแสดงแยกตามปีปฏิทิน`:'ช่วงเวลาไม่ถูกต้อง: วันเริ่มต้องมาก่อนวันสิ้นสุด';return valid?filterBeforeMonths().filter(row=>inMonthRange(row,a,m,b,n)):[]};
function monthChanged(){$('fiscalYear').value='';page=0;drillYear=null;render()}
for(const id of ['fromMonth','toMonth','from','to'])$(id).addEventListener('change',monthChanged);
function applyFiscalYear(){const endYear=+$('fiscalYear').value;if(!endYear)return;const startMonth=+$('fiscalStart').value;const startYear=startMonth===1?endYear:endYear-1;for(const [id,year] of [['from',startYear],['to',endYear]]){if(!Array.from($(id).options).some(o=>+o.value===year))$(id).add(new Option(String(year+543),String(year)));$(id).value=String(year)}$('fromMonth').value=String(startMonth);$('toMonth').value=String(startMonth===1?12:startMonth-1);page=0;drillYear=null;render()}
$('fiscalYear').onchange=applyFiscalYear;$('fiscalStart').onchange=applyFiscalYear;
const resetBeforeMonths=$('reset').onclick;
$('reset').onclick=()=>{$('fromMonth').value='1';$('toMonth').value='12';$('fiscalYear').value='';resetBeforeMonths()};
const fiscalOptions=setInterval(()=>{if(!data.length)return;clearInterval(fiscalOptions);const years=data.map(row=>Number(row.year));const min=Math.min(...years),max=Math.max(...years)+1;for(let year=min;year<=max;year++)$('fiscalYear').add(new Option(String(year+543),String(year)));render()},100);
