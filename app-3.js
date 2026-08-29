function renderStats(){
  const scoped=events;
  const daySet=new Set(scoped.map(e=>toKey(e.start)));
  const vis=visibleEvents();
  const now=new Date(), todayStart=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const next=scoped.filter(e=>eventEndDay(e)>=todayStart).sort((a,b)=>a.start-b.start)[0];
  els.statEvents.textContent=scoped.length;
  els.statDays.textContent=daySet.size;
  els.statFiltered.textContent=vis.length;
  els.statNext.textContent=next?formatShort(next.start):"—";
  els.statNextName.textContent=next?titleUA(next.title):"немає майбутніх подій";
  els.statRange.textContent=events.length?formatRangeLabel():"у завантаженому діапазоні";
}
function renderHeader(){
  els.heroTitle.textContent="Шкільний календар";
  els.heroSubtitle.textContent=events.length
    ? `${formatRangeLabel()} · ${events.length} подій · український переклад`
    : "Оновіть CSV за потреби · український переклад подій · автоматичний діапазон дат";
}
function renderAll(){
  assignColors();
  const ms=months();
  if(currentMobileMonth>=ms.length) currentMobileMonth=Math.max(0,ms.length-1);
  renderHeader();renderTypeFilter();renderLegend();renderCalendar();renderStats();renderAgenda();
}
function updateMobileNav(){
  const ms=months(),m=ms[currentMobileMonth];
  els.mobileMonthTitle.textContent=`${MONTHS[m.month]} ${m.year}`;
  els.prevMonth.disabled=currentMobileMonth===0;
  els.nextMonth.disabled=currentMobileMonth===ms.length-1;
  document.querySelectorAll(".month").forEach((n,i)=>n.classList.toggle("active-mobile",i===currentMobileMonth));
}
function setMobileMonthFromDate(d){
  const idx=months().findIndex(m=>m.year===d.getFullYear()&&m.month===d.getMonth());
  currentMobileMonth=idx>=0?idx:0;updateMobileNav();
}
function gotoToday(){
  const now=dateOnly(new Date());
  const {start,end}=dataRange();
  const target=now<start?start:now>end?end:now;
  setMobileMonthFromDate(target);
  const key=toKey(target);
  requestAnimationFrame(()=>{
    const day=document.querySelector(`[data-date="${key}"]`);
    if(day) day.scrollIntoView({behavior:"smooth",block:"center"});
  });
}
function openEvent(id){
  const e=events.find(x=>x.id===id);if(!e)return;
  selectedEventId=id;
  els.modalType.textContent=typeUA(e.type);
  const translatedTitle=titleUA(e.title);
  els.modalTitle.textContent=translatedTitle;
  const startTime=hasTime(e.start)?`${pad(e.start.getHours())}:${pad(e.start.getMinutes())}`:"Весь день";
  let endText="";
  if(e.end){
    endText=formatDate(e.end)+(hasTime(e.end)?` · ${pad(e.end.getHours())}:${pad(e.end.getMinutes())}`:"");
  }
  els.modalMeta.innerHTML=`
    <div class="meta"><span>Початок</span>${escapeHtml(formatDate(e.start))} · ${escapeHtml(startTime)}</div>
    ${e.end?`<div class="meta"><span>Завершення</span>${escapeHtml(endText)}</div>`:""}
    ${e.place?`<div class="meta"><span>Місце</span>${escapeHtml(e.place)}</div>`:""}
    <div class="meta"><span>Тип</span>${escapeHtml(typeUA(e.type))}${e.type?` <small>(${escapeHtml(e.type)})</small>`:""}</div>
    ${translatedTitle!==e.title?`<div class="meta"><span>Назва DE</span>${escapeHtml(e.title)}</div>`:""}`;
  const translated=descUA(e.desc);
  els.modalDesc.innerHTML=e.desc?`${linkifyText(translated)}${translated!==decodeHtmlEntities(e.desc)?`<details style="margin-top:14px;color:var(--muted)"><summary>Оригінал німецькою</summary><div style="margin-top:8px">${linkifyText(decodeHtmlEntities(e.desc))}</div></details>`:""}`:`<span style="color:var(--muted)">Опис відсутній.</span>`;
  els.modalBackdrop.classList.add("show");els.modalBackdrop.setAttribute("aria-hidden","false");
}
function closeModal(){els.modalBackdrop.classList.remove("show");els.modalBackdrop.setAttribute("aria-hidden","true");selectedEventId=null;}
function icsEscape(s){return String(s||"").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");}
function icsDate(d){return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;}
function icsDateTimeLocal(d){return `${icsDate(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`;}
function buildICS(list){
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","CALSCALE:GREGORIAN","METHOD:PUBLISH","PRODID:-//Dynamic School Calendar//UK//"];
  for(const e of list.sort((a,b)=>a.start-b.start)){
    lines.push("BEGIN:VEVENT",`UID:${e.id}@school-calendar.local`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"")}`);
    if(hasTime(e.start)){
      lines.push(`DTSTART:${icsDateTimeLocal(e.start)}`);
      if(e.end) lines.push(`DTEND:${icsDateTimeLocal(e.end)}`);
    }else{
      const end=e.end?new Date(dateOnly(e.end)):new Date(dateOnly(e.start));
      if(!e.end || end<=dateOnly(e.start)) end.setDate(end.getDate()+1);
      else end.setDate(end.getDate()+1);
      lines.push(`DTSTART;VALUE=DATE:${icsDate(e.start)}`,`DTEND;VALUE=DATE:${icsDate(end)}`);
    }
    const uaTitle=titleUA(e.title);
    lines.push(`SUMMARY:${icsEscape(uaTitle)}`);
    const uaDesc=descUA(e.desc);
    const descParts=[];
    if(e.desc) descParts.push(uaDesc);
    if(uaTitle!==e.title) descParts.push(`Оригінальна назва (DE): ${e.title}`);
    if(e.desc && uaDesc!==e.desc) descParts.push(`Оригінальний опис (DE): ${e.desc}`);
    if(descParts.length) lines.push(`DESCRIPTION:${icsEscape(descParts.join("\n\n"))}`);
    if(e.place) lines.push(`LOCATION:${icsEscape(e.place)}`);
    if(e.type) lines.push(`CATEGORIES:${icsEscape(typeUA(e.type))}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
async function importFile(file){
  if(!file)return;
  if(!/\.csv$/i.test(file.name) && file.type!=="text/csv"){showNotice("Оберіть CSV-файл.");return;}
  try{
    const text=await file.text(), rows=parseCSV(text), parsed=normalizeEvents(rows);
    if(!parsed.length){showNotice("Не вдалося знайти події. Перевірте назви колонок CSV.");return;}
    events=parsed;persist();renderAll();gotoToday();
    showNotice(`Імпортовано ${events.length} подій із файлу «${file.name}». Дані збережено локально.`);
  }catch(err){showNotice("Помилка читання CSV: "+err.message);}
  els.fileInput.value="";
}

els.loadBtn.addEventListener("click",()=>els.fileInput.click());
els.fileInput.addEventListener("change",e=>importFile(e.target.files?.[0]));
els.search.addEventListener("input",renderAll);
els.typeFilter.addEventListener("change",renderAll);
els.todayBtn.addEventListener("click",gotoToday);
els.agendaBtn.addEventListener("click",()=>{els.agenda.classList.toggle("show");if(els.agenda.classList.contains("show"))els.agenda.scrollIntoView({behavior:"smooth",block:"nearest"});});
els.prevMonth.addEventListener("click",()=>{currentMobileMonth=Math.max(0,currentMobileMonth-1);updateMobileNav();});
els.nextMonth.addEventListener("click",()=>{currentMobileMonth=Math.min(months().length-1,currentMobileMonth+1);updateMobileNav();});
els.themeBtn.addEventListener("click",()=>{
  const next=document.documentElement.dataset.theme==="dark"?"light":"dark";
  document.documentElement.dataset.theme=next;savePrefs();
});
els.modalClose.addEventListener("click",closeModal);
els.modalBackdrop.addEventListener("click",e=>{if(e.target===els.modalBackdrop)closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
["dragenter","dragover"].forEach(name=>els.dropZone.addEventListener(name,e=>{e.preventDefault();els.dropZone.classList.add("drag");}));
["dragleave","drop"].forEach(name=>els.dropZone.addEventListener(name,e=>{e.preventDefault();els.dropZone.classList.remove("drag");}));
els.dropZone.addEventListener("drop",e=>importFile(e.dataTransfer.files?.[0]));

restore();
const now=new Date();
const initialIdx=months().findIndex(m=>m.year===now.getFullYear()&&m.month===now.getMonth());
if(initialIdx>=0) currentMobileMonth=initialIdx;
else if(events.length){
  const {start,end}=dataRange();
  currentMobileMonth=now<start?0:months().length-1;
}else currentMobileMonth=0;
renderAll();
if(events.length){
  showNotice(`Календар готовий: ${events.length} подій уже вбудовано в HTML.`);
}
