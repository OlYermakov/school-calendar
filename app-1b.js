function decodeHtmlEntities(value){
  const text=String(value??"");
  if(!/[&][a-zA-Z#0-9]+;/.test(text)) return text;
  const area=document.createElement("textarea");
  area.innerHTML=text;
  return area.value;
}
function translateKnownTemplates(value){
  const s=decodeHtmlEntities(value).trim();
  if(!s) return "";

  // Консультації Berufs-/Studienberatung: одна й та сама подія може мати
  // різні кімнати/корпуси у різні роки, тому перекладаємо як шаблон,
  // а не лише за точним збігом у словнику.
  const career = s.match(/^Frau\s+([^,]+),\s*Berufsberaterin der Agentur für Arbeit Wiesbaden,\s*bietet Sprechzeiten von jeweils\s+(\d+)\s+Minuten an\.\s*Beratungstermine können vorab über Herrn\s+([^\s(]+)\s*\(([^)]+)\)\s*angefragt und vereinbart werden\.\s*Die Sprechstunde findet in Raum\s+(.+?)\s+im\s+(.+?)\s+statt\.?$/i);
  if(career){
    const [, person, minutes, contact, email, room, buildingRaw] = career;
    let building = buildingRaw.trim();
    building = building
      .replace(/^Interimsgebäude\s*(\d*)$/i, (_,n)=>`тимчасовій будівлі${n ? ` ${n}` : ""}`)
      .replace(/^Erweiterungsbau$/i, "прибудові")
      .replace(/^Hauptgebäude$/i, "головній будівлі");
    if(building===buildingRaw.trim()) building=`будівлі «${buildingRaw.trim()}»`;
    return `Пані ${person}, консультантка з професійної орієнтації Агентства праці Вісбадена, проводить консультації тривалістю по ${minutes} хвилин. Запис на консультацію можна заздалегідь запросити та узгодити через пана ${contact} (${email}). Консультація проходить у кімнаті ${room} у ${building}.`;
  }

  return "";
}

function translateEventText(value){
  const s=decodeHtmlEntities(value).trim();
  if(!s) return "";
  if(DESCRIPTION_TRANSLATIONS[s]) return DESCRIPTION_TRANSLATIONS[s];
  const templateTranslation=translateKnownTemplates(s);
  if(templateTranslation) return templateTranslation;

  let out=s;
  let changed=false;
  // Замінюємо відомі повні фрази всередині довших записів, не втрачаючи решту тексту.
  const exactEntries=Object.entries(DESCRIPTION_TRANSLATIONS).sort((a,b)=>b[0].length-a[0].length);
  for(const [de,ua] of exactEntries){
    if(out.includes(de)){ out=out.split(de).join(ua); changed=true; }
  }
  for(const [re,ua] of EVENT_TRANSLATION_RULES){
    const next=out.replace(re,ua);
    if(next!==out){out=next;changed=true;}
  }
  return changed ? out.replace(/\s{2,}/g," ").trim() : s;
}
function titleUA(s){ return translateEventText(s); }
function descUA(s){ return translateEventText(s); }
function escapeHtml(s=""){
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function linkifyText(s=""){
  return escapeHtml(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:underline;overflow-wrap:anywhere">$1</a>');
}
function uid(){
  return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
}
function parseGermanDate(dateStr,timeStr){
  if(!dateStr) return null;
  const m = String(dateStr).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if(!m) return null;
  let hh=0, mm=0;
  if(timeStr){
    const tm=String(timeStr).trim().match(/^(\d{1,2}):(\d{2})/);
    if(tm){hh=+tm[1]||0;mm=+tm[2]||0;}
  }
  const d=new Date(+m[3],+m[2]-1,+m[1],hh,mm);
  return Number.isNaN(d.getTime()) ? null : d;
}
function detectDelimiter(text){
  const line=(text.split(/\r?\n/).find(l=>l.trim())||"");
  const candidates=[",",";","\t"];
  let best=",", max=-1;
  for(const d of candidates){
    let count=0, quoted=false;
    for(let i=0;i<line.length;i++){
      if(line[i]==='"') quoted=!quoted;
      else if(line[i]===d && !quoted) count++;
    }
    if(count>max){max=count;best=d;}
  }
  return best;
}
function parseCSV(text){
  text=text.replace(/^\uFEFF/,"");
  const delim=detectDelimiter(text);
  const rows=[]; let row=[], field="", quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){
      if(quoted && text[i+1]==='"'){field+='"';i++;}
      else quoted=!quoted;
    } else if(c===delim && !quoted){row.push(field);field="";}
    else if((c==="\n" || c==="\r") && !quoted){
      if(c==="\r" && text[i+1]==="\n") i++;
      row.push(field); field="";
      if(row.some(v=>v.trim()!=="")) rows.push(row);
      row=[];
    } else field+=c;
  }
  if(field || row.length){row.push(field);if(row.some(v=>v.trim()!==""))rows.push(row);}
  if(!rows.length) return [];
  const headers=rows[0].map(h=>h.trim());
  return rows.slice(1).map(cols=>{
    const obj={}; headers.forEach((h,i)=>obj[h]=(cols[i]??"").trim()); return obj;
  });
}
function hydrateEvents(raw){
  if(!Array.isArray(raw)) return [];
  return raw.map(e=>({
    ...e,
    id:e.id||uid(),
    title:decodeHtmlEntities(e.title||""),
    desc:decodeHtmlEntities(e.desc||""),
    type:decodeHtmlEntities(e.type||""),
    place:decodeHtmlEntities(e.place||""),
    start:new Date(e.start),
    end:e.end?new Date(e.end):null
  })).filter(e=>!Number.isNaN(e.start.getTime())).sort((a,b)=>a.start-b.start);
}
function embeddedEvents(){
  try{
    if(Array.isArray(window.EMBEDDED_EVENTS)) return hydrateEvents(window.EMBEDDED_EVENTS);
    const node=document.getElementById("embeddedEvents");
    if(!node) return [];
    return hydrateEvents(JSON.parse(node.textContent||"[]"));
  }catch(_){ return []; }
}
function isPublicWeb(){
  return location.protocol==="http:" || location.protocol==="https:";
}
function serializeEvents(){
  return events.map(e=>({...e,start:e.start.toISOString(),end:e.end?e.end.toISOString():null}));
}
function persist(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(serializeEvents()));}catch(_){}
}
function restore(){
  // Для локального HTML зберігаємо імпорт між відкриттями.
  // Для публічного сайту джерелом істини є набір подій, вбудований безпосередньо в index.html,
  // тому старий localStorage відвідувача не може випадково підмінити опублікований календар.
  if(!isPublicWeb()){
    try{
      let stored=localStorage.getItem(STORAGE_KEY);
      if(!stored){
        for(const key of LEGACY_STORAGE_KEYS){
          stored=localStorage.getItem(key);
          if(stored) break;
        }
      }
      const raw=JSON.parse(stored||"[]");
      events=hydrateEvents(raw);
      if(events.length) persist();
    }catch(_){ events=[]; }
  }
  if(!events.length){
    events=embeddedEvents();
  }
  try{
    let stored=localStorage.getItem(PREF_KEY);
    if(!stored){
      for(const key of LEGACY_PREF_KEYS){
        stored=localStorage.getItem(key);
        if(stored) break;
      }
    }
    const p=JSON.parse(stored||"{}");
    if(p.theme) document.documentElement.dataset.theme=p.theme;
  }catch(_){ }
}
function savePrefs(){
  try{localStorage.setItem(PREF_KEY,JSON.stringify({theme:document.documentElement.dataset.theme||"light"}));}catch(_){}
}
function showNotice(msg){
  els.notice.textContent=msg;els.notice.classList.add("show");
  clearTimeout(showNotice.t);showNotice.t=setTimeout(()=>els.notice.classList.remove("show"),5000);
}
function normalizeEvents(rows){
  const parsed=[];
  for(const r of rows){
    const start=parseGermanDate(r["Von_Datum"],r["Von_Uhrzeit"]);
    if(!start) continue;
    const end=parseGermanDate(r["Bis_Datum"],r["Bis_Uhrzeit"]);
    parsed.push({
      id:uid(),start,end:end||null,
      title:decodeHtmlEntities(r["Titel"]||"Подія").trim(),
      desc:decodeHtmlEntities(r["Beschreibung"]||"").trim(),
      type:decodeHtmlEntities(r["Art"]||"").trim(),
      place:decodeHtmlEntities(r["Ort"]||"").trim()
    });
  }
  return parsed.sort((a,b)=>a.start-b.start);
}
