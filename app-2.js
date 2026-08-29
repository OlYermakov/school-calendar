function assignColors(){
  typeColors=new Map();let i=0;
  for(const t of KNOWN_ORDER) if(!typeColors.has(t)) typeColors.set(t,COLORS[i++%COLORS.length]);
  for(const e of events){if(e.type && !typeColors.has(e.type)) typeColors.set(e.type,COLORS[i++%COLORS.length]);}
}
function colorFor(t){return typeColors.get(t)||"#64748b";}
function dataRange(){
  if(!events.length){
    const now=new Date();
    const d=new Date(now.getFullYear(),now.getMonth(),1);
    return {start:d,end:new Date(d.getFullYear(),d.getMonth()+1,0,23,59,59)};
  }
  let start=new Date(events[0].start);
  let end=eventEndDay(events[0]);
  for(const e of events){
    if(e.start<start) start=new Date(e.start);
    const eEnd=eventEndDay(e);
    if(eEnd>end) end=new Date(eEnd);
  }
  return {start:dateOnly(start),end:dateOnly(end)};
}
function months(){
  const {start,end}=dataRange();
  const out=[];
  let y=start.getFullYear(),m=start.getMonth();
  const endY=end.getFullYear(),endM=end.getMonth();
  while(y<endY || (y===endY && m<=endM)){
    out.push({year:y,month:m});
    m++;
    if(m===12){m=0;y++;}
  }
  return out;
}
function formatRangeLabel(){
  if(!events.length) return "Імпортуйте CSV, щоб побудувати календар";
  const {start,end}=dataRange();
  const sameMonth=start.getFullYear()===end.getFullYear() && start.getMonth()===end.getMonth();
  if(sameMonth) return `${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
  return `${MONTHS[start.getMonth()]} ${start.getFullYear()} — ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
}
function monthMatrix(year,month){
  const first=new Date(year,month,1);
  const offset=(first.getDay()+6)%7;
  const count=new Date(year,month+1,0).getDate();
  const out=Array(offset).fill(null);
  for(let d=1;d<=count;d++) out.push(new Date(year,month,d));
  while(out.length%7) out.push(null);
  return out;
}
function eventEndDay(e){
  const end=e.end?new Date(e.end):new Date(e.start);
  if(e.end && end.getHours()===0 && end.getMinutes()===0 && dateOnly(end)>dateOnly(e.start)){
    end.setDate(end.getDate()-1);
  }
  return dateOnly(end);
}
function eventsByDay(){
  const map=new Map();
  for(const e of events){
    let cur=dateOnly(e.start);
    const last=eventEndDay(e);
    while(cur<=last){
      const k=toKey(cur);if(!map.has(k))map.set(k,[]);map.get(k).push(e);cur.setDate(cur.getDate()+1);
    }
  }
  for(const arr of map.values()) arr.sort((a,b)=>a.start-b.start);
  return map;
}
function filterState(){
  return {q:els.search.value.trim().toLowerCase(),type:els.typeFilter.value};
}
function eventMatches(e,st){
  if(st.type && e.type!==st.type) return false;
  if(!st.q) return true;
  const hay=[e.title,titleUA(e.title),e.desc,descUA(e.desc),e.type,typeUA(e.type),e.place].join(" ").toLowerCase();
  return hay.includes(st.q);
}
function visibleEvents(){
  const st=filterState();
  return events.filter(e=>eventMatches(e,st));
}
function renderTypeFilter(){
  const current=els.typeFilter.value;
  const types=[...new Set(events.map(e=>e.type).filter(Boolean))].sort((a,b)=>typeUA(a).localeCompare(typeUA(b),"uk"));
  els.typeFilter.innerHTML=`<option value="">Усі типи подій</option>`+types.map(t=>`<option value="${escapeHtml(t)}">${escapeHtml(typeUA(t))}</option>`).join("");
  if(types.includes(current)) els.typeFilter.value=current;
}
function renderLegend(){
  const types=[...new Set(events.map(e=>e.type).filter(Boolean))].sort((a,b)=>typeUA(a).localeCompare(typeUA(b),"uk"));
  if(!types.length){els.legend.innerHTML=`<span class="legend-title">ТИПИ</span><span class="chip">Імпортуйте CSV, щоб побачити легенду</span>`;return;}
  els.legend.innerHTML=`<span class="legend-title">ТИПИ</span>`+types.map(t=>`<button class="chip" data-type="${escapeHtml(t)}"><span class="dot" style="background:${colorFor(t)}"></span>${escapeHtml(typeUA(t))}</button>`).join("");
  els.legend.querySelectorAll("[data-type]").forEach(b=>b.addEventListener("click",()=>{
    els.typeFilter.value=els.typeFilter.value===b.dataset.type?"":b.dataset.type;renderAll();
  }));
}
function renderCalendar(){
  const byDay=eventsByDay(), st=filterState(), today=toKey(new Date());
  els.calendar.innerHTML="";
  const ms=months();
  ms.forEach((m,mi)=>{
    const matrix=monthMatrix(m.year,m.month);
    const monthVisible=events.filter(e=>e.start.getFullYear()===m.year && e.start.getMonth()===m.month && eventMatches(e,st)).length;
    const section=document.createElement("section");
    section.className="month"+(mi===currentMobileMonth?" active-mobile":"");
    section.dataset.monthIndex=mi;
    const daysHtml=matrix.map(d=>{
      if(!d) return `<div class="day empty" aria-hidden="true"></div>`;
      const k=toKey(d), list=byDay.get(k)||[], weekend=((d.getDay()+6)%7)>=5;
      const matched=list.filter(e=>eventMatches(e,st));
      const shown=matched.slice(0,3);
      const cls=["day",weekend?"weekend":"",k===today?"today":"",list.length && !matched.length?"filtered-out":""].filter(Boolean).join(" ");
      return `<div class="${cls}" tabindex="0" data-date="${k}">
        <div class="day-num"><span>${d.getDate()}</span>${k===today?'<span class="today-badge">сьогодні</span>':""}</div>
        ${shown.map(e=>`<div class="event" data-event-id="${e.id}" title="${escapeHtml(titleUA(e.title))}${titleUA(e.title)!==e.title?`\nDE: ${escapeHtml(e.title)}`:""}">
          <span class="bar" style="background:${colorFor(e.type)}"></span><span class="event-title">${escapeHtml(titleUA(e.title))}</span>
        </div>`).join("")}
        ${matched.length>3?`<div class="more">+${matched.length-3} ще</div>`:""}
      </div>`;
    }).join("");
    section.innerHTML=`<div class="month-head"><div class="month-title">${MONTHS[m.month]} ${m.year}</div><div class="month-count">${monthVisible?monthVisible+" под.":""}</div></div>
      <div class="weekdays">${WEEKDAYS.map((w,i)=>`<div class="weekday ${i>=5?"weekend":""}">${w}</div>`).join("")}</div>
      <div class="days">${daysHtml}</div>`;
    els.calendar.appendChild(section);
  });
  els.calendar.querySelectorAll("[data-event-id]").forEach(n=>n.addEventListener("click",ev=>{
    ev.stopPropagation();openEvent(n.dataset.eventId);
  }));
  els.calendar.querySelectorAll("[data-date]").forEach(n=>n.addEventListener("click",()=>{
    const list=(byDay.get(n.dataset.date)||[]).filter(e=>eventMatches(e,st));
    if(list.length===1) openEvent(list[0].id);
    else if(list.length>1) renderDayAgenda(n.dataset.date,list);
  }));
  updateMobileNav();
}
function renderDayAgenda(dateKey,list){
  const d=new Date(dateKey+"T00:00:00");
  els.agenda.classList.add("show");
  els.agenda.querySelector("h2").textContent=`Події на ${formatDate(d)}`;
  els.agendaList.innerHTML=list.map(e=>agendaRow(e)).join("");
  els.agendaList.querySelectorAll("[data-event-id]").forEach(n=>n.addEventListener("click",()=>openEvent(n.dataset.eventId)));
  els.agenda.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function agendaRow(e){
  return `<div class="agenda-row" data-event-id="${e.id}" role="button" tabindex="0">
    <div class="agenda-date">${formatShort(e.start)}${hasTime(e.start)?` · ${pad(e.start.getHours())}:${pad(e.start.getMinutes())}`:""}</div>
    <div class="bar" style="background:${colorFor(e.type)}"></div>
    <div><div class="agenda-name">${escapeHtml(titleUA(e.title))}</div><div style="color:var(--muted);margin-top:2px">${escapeHtml(typeUA(e.type))}${e.place?` · ${escapeHtml(e.place)}`:""}</div></div>
  </div>`;
}
function renderAgenda(){
  const now=new Date();
  let list=visibleEvents().filter(e=>e.start>=new Date(now.getFullYear(),now.getMonth(),now.getDate())).sort((a,b)=>a.start-b.start).slice(0,10);
  if(!list.length) list=visibleEvents().slice(-10);
  els.agenda.querySelector("h2").textContent="Найближчі події";
  els.agendaList.innerHTML=list.length?list.map(agendaRow).join(""):`<div style="color:var(--muted);font-size:13px">Немає подій за поточним фільтром.</div>`;
  els.agendaList.querySelectorAll("[data-event-id]").forEach(n=>n.addEventListener("click",()=>openEvent(n.dataset.eventId)));
}
