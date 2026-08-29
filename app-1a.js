"use strict";

const MONTHS = ["Січень","Лютий","Березень","Квітень","Травень","Квітень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];
MONTHS[5] = "Червень";
const WEEKDAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"];
const COLORS = ["#2563eb","#16a34a","#dc2626","#7c3aed","#f59e0b","#0891b2","#d946ef","#10b981","#f43f5e","#0ea5e9","#9333ea","#ea580c","#64748b"];
const TYPE_UA = {
            Ferien: "Канікули",
            Prüfung: "Іспит",
            Konferenz: "Педагогічна рада",
            Unterricht: "Навчальні заняття",
            Schulung: "Підвищення кваліфікації",
            "Schulung Schüler": "Навчання учнів",
            Sonstiges: "Інші події",
            Arbeiten: "Контрольні роботи",
            "Freie Tage": "Вихідні дні",
            Fahrten: "Поїздки",
            "Abendveranstaltung": "Вечірні заходи",
            Abitur: "Абітурієнтські іспити",
            Termin: "Терміни та дедлайни",
        };
const DESCRIPTION_TRANSLATIONS = {
            "Lesung": "Авторське читання",
            "Sprechstunde zur Berufs- und Studienberatung": "Консультація з професійної орієнтації та навчання",
            "Jakob Springfeld liest aus seinem Buch \"Unter Nazis\". Wer sich vorab informieren möchte: https://www.nrwision.de/mediathek/buchtipp-fuer-dich-unter-nazis-jung-ostdeutsch-gegen-rechts-von-jakob-springfeld-250708/": "Якоб Спрінгфельд читає уривки зі своєї книги «Серед нацистів». Хто хоче заздалегідь ознайомитися: https://www.nrwision.de/mediathek/buchtipp-fuer-dich-unter-nazis-jung-ostdeutsch-gegen-rechts-von-jakob-springfeld-250708/",
            "Nachprüfung schrift.": "Письмовий пересклад",
            "1. Sitzung Medienteam": "1-е засідання медіа-команди",
            "Nachprüfung mdl": "Усний пересклад",
            "1.-2. Klassenleiterunterricht": "1-2 урок класного керівника",
            "3.-6. Std. regulärer Unterricht": "3-6 урок звичайних занять",
            "Prävention in Wiesbaden": "Профілактика у Вісбадені",
            "Angekündigte Alarmübung": "Запланована тренувальна тривога",
            "Frau Feder, Berufsberaterin der Agentur für Arbeit Wiesbaden, bietet Sprechzeiten von jeweils 30 Minuten an. Beratungstermine können vorab über Herrn Steffen (steffen@rheingauschule.de) angefragt und vereinbart werden. Die Sprechstunde findet in Raum 72 im Erweiterungsbau statt.": "Пані Федер, консультант з питань кар'єри Агентства праці Вісбадена, пропонує консультації по 30 хвилин. Терміни консультацій можна заздалегідь узгодити з паном Штеффеном (steffen@rheingauschule.de). Консультації проходять у кімнаті 72 у прибудові.",
            "Vorstellung Schulsprecher/-in": "Представлення голови учнівського самоврядування",
            "Schulsprecherwahl": "Вибори голови учнівського самоврядування",
            "Arbeit in Deutsch 06b (061D02-GYM)": "Контрольна робота з німецької мови 06b (061D02-GYM)",
            "Arbeit in Mathematik 06b (061M02-GYM)": "Контрольна робота з математики 06b (061M02-GYM)",
            "Arbeit in Englisch 06b (061E02-GYM)": "Контрольна робота з англійської мови 06b (061E02-GYM)",
            "Lernkontrolle in Geschichte 06b (061G02-GYM)": "Контрольна робота з історії 06b (061G02-GYM)",
            "Lernkontrolle in Religion - evangelisch 6 (061REV_a-d01-GYM)": "Контрольна робота з релігії - євангельська 6 (061REV_a-d01-GYM)",
            "Unterrichtsende 11:05 wegen der Vorbereitungen zum Adventsbasar": "Закінчення уроків о 11:05 через підготовку до різдвяного базару",
            "Adventsbasar": "Різдвяний базар",
            "Adventskonzert Dom Geisenheim; Generalprobe ab 08.00 Uhr": "Різдвяний концерт у соборі Гайзенгайма; генеральна репетиція з 08:00",
            "Gottesdienst": "Богослужіння",
            "Klassenleiterunterricht, Ferien nach der 3. Stunde": "Урок класного керівника, канікули після 3-го уроку",
            "letzter Termin für schriftliche Lernkontrolle": "Останній термін для письмових контрольних робіт",
            "Praktikum Kl. 9 & Q1": "Практика 9 клас та Q1",
            "Notenkonferenz  5,6,7 - Unterrichtende ab 12:55": "Педагогічна рада з оцінювання 5,6,7 - закінчення уроків з 12:55",
            "Notenkonferenz 8,9,10,E - Unterrichtende ab 12:55": "Педагогічна рада з оцінювання 8,9,10,E - закінчення уроків з 12:55",
            "Ende des 1. Halbjahr, Zeugnisausgabe, 3. Std Klassenleiterstunde": "Кінець 1-го півріччя, видача свідоцтв, 3-й урок класного керівника",
            "Probenfahrt Ensembles": "Репетиційна поїздка ансамблів",
            "Rosenmontag; bewegl. Ferientag": "Розенмонтаг; рухомий вихідний день",
            "Fastnachtsdienstag; beweglicher Ferientag": "Масний вівторок; рухомий вихідний день",
            "Elternsprechtag 5-E": "День батьківських консультацій 5-E",
            "Ausgabe Präsentationsprüfungen": "Видача тем презентаційних іспитів",
            "Unterrichtende nach der 3. Std.": "Закінчення уроків після 3-го уроку",
            "4. Gesamtkonferenz, Unterrichtsende 12:55": "4-а загальна конференція, закінчення уроків о 12:55",
            "3. Kulturnacht an der RGS": "3-я культурна ніч у RGS",
            "Zukunftstag (ehemals. Girl's and Boy's Day)": "День майбутнього (колишній День дівчат і хлопців)",
            "Versand der Mahnbriefe; Abgabe bis 09:30 Uhr": "Розсилка попереджень; подача до 09:30",
            "Letzter Termin Antrag der Eltern auf freiwillige Wiederholung": "Останній термін подачі заяв батьків на добровільне повторення",
            "Tag der Arbeit; unterrichstfrei": "День праці; без уроків",
            "Unterrichtsfrei, beweglicher Ferientag": "Без уроків, рухомий вихідний день",
            "Sommerkonzert; Generalprobe ab 08.00 Uhr": "Літній концерт; генеральна репетиція з 08:00",
            "Versetzungskonferenz 7,6,5, Dikla - Unterrichtende ab 12:55": "Педагогічна рада з переведення 7,6,5, Дікла - закінчення уроків з 12:55",
            "Versetzungskonferenz E,10,9,8 - Unterrichtende ab 12:55": "Педагогічна рада з переведення E,10,9,8 - закінчення уроків з 12:55",
            "Bundesjugendspiele": "Федеральні молодіжні ігри",
            "Sommerfest - Unterrichtende 11:05": "Літній фестиваль - закінчення уроків о 11:05",
            "Ersatztermin BUJU": "Резервний термін БУЮ",
            "KL-Unterricht & Zeugnisse, Sommerferien nach der 3. Stunde": "Урок класного керівника та свідоцтва, літні канікули після 3-го уроку",
            "Jörg Isermeyer, Egal war gestern": "Йорг Ізермаєр, 'Все одно було вчора'",
            "2. Gesamtkonferenz": "2-а загальна конференція",
            "Fachkonferenz Spanisch": "Предметна конференція з іспанської мови",
            "SV-Tag": "День учнівського самоврядування",
            "Autorenlesung Jgst. 7": "Читання автора для 7-го класу",
            "Pädagogische Konferenzen Klasse 6": "Педагогічні конференції 6-го класу",
            "Tag der offenen Tür": "День відкритих дверей",
            "Schulkonferenz": "Шкільна конференція",
            "Unterrichtende 11:05h Adventsbasar": "Закінчення уроків о 11:05 через різдвяний базар",
            "Schulelternbeiratssitzung": "Засідання батьківського комітету школи",
            "Ferien nach der 3.Std.": "Канікули після 3-го уроку",
            "Tag der deutschen Einheit": "День німецької єдності",
            "Heiliger Abend": "Святий вечір",
            "1. Weihnachtsfeiertag": "1-й день Різдва",
            "2. Weihnachtsfeiertag": "2-й день Різдва",
            "Silvester": "Новий рік",
            "Neujahr": "Новий рік",
            "Karfreitag": "Страсна п'ятниця",
            "Ostersonntag": "Великдень",
            "Ostermontag": "Великодній понеділок",
            "Christi Himmelfahrt": "Вознесіння Господнє",
            "Pfingstsonntag": "Трійця",
            "Pfingstmontag": "Трійцевий понеділок",
            "Fronleichnam": "Тіло і Кров Христові",
            "Tag der Arbeit": "День праці",
            "Gedenkstättnfahrt": "Поїздка до меморіалу"
        };

const KNOWN_ORDER = ["Ferien","Unterricht","Prüfung","Konferenz","Schulung","Schulung Schüler","Sonstiges","Arbeiten","Freie Tage","Fahrten","Abendveranstaltung","Abitur","Termin"];
const STORAGE_KEY = "school-calendar-events-v4";
const LEGACY_STORAGE_KEYS = ["school-calendar-events-v3","school-calendar-2526-events-v2"];
const PREF_KEY = "school-calendar-prefs-v3";
const LEGACY_PREF_KEYS = ["school-calendar-2526-prefs-v2"];

let events = [];
let currentMobileMonth = 0
let selectedEventId = null;
let typeColors = new Map();

const $ = (s) => document.querySelector(s);
const els = {
  fileInput:$("#fileInput"), loadBtn:$("#loadBtn"), themeBtn:$("#themeBtn"),
  search:$("#searchInput"), typeFilter:$("#typeFilter"), todayBtn:$("#todayBtn"), agendaBtn:$("#agendaBtn"),
  calendar:$("#calendar"), legend:$("#legend"), notice:$("#notice"), agenda:$("#agenda"), agendaList:$("#agendaList"),
  prevMonth:$("#prevMonth"), nextMonth:$("#nextMonth"), mobileMonthTitle:$("#mobileMonthTitle"), dropZone:$("#dropZone"),
  modalBackdrop:$("#modalBackdrop"), modalClose:$("#modalClose"), modalTitle:$("#modalTitle"), modalType:$("#modalType"),
  modalMeta:$("#modalMeta"), modalDesc:$("#modalDesc"),
  statEvents:$("#statEvents"), statDays:$("#statDays"), statNext:$("#statNext"), statNextName:$("#statNextName"), statFiltered:$("#statFiltered"),
  statRange:$("#statRange"), heroTitle:$("#heroTitle"), heroSubtitle:$("#heroSubtitle")
};

function pad(n){ return String(n).padStart(2,"0"); }
function toKey(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function dateOnly(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
function formatDate(d, opts={}){ return d.toLocaleDateString("uk-UA",{day:"2-digit",month:"2-digit",year:"numeric",...opts}); }
function formatShort(d){ return d.toLocaleDateString("uk-UA",{day:"2-digit",month:"2-digit"}); }
function hasTime(d){ return d && (d.getHours() !== 0 || d.getMinutes() !== 0); }
function typeUA(t){ return TYPE_UA[t] || t || "Подія"; }

// Додаткові правила для нових подій, яких ще немає у словнику точних перекладів.
// Спочатку використовується точний переклад, потім — обережні заміни типових шкільних термінів.
const EVENT_TRANSLATION_RULES = [
  [/\bSprechstunde zur Berufs- und Studienberatung\b/gi, "консультація з професійної орієнтації та навчання"],
  [/\bBerufs- und Studienberatung\b/gi, "професійна орієнтація та консультація щодо навчання"],
  [/\bSprechstunde\b/gi, "консультація"],
  [/\bLesung\b/gi, "авторське читання"],
  [/\bliest aus seinem Buch\b/gi, "читає уривки зі своєї книги"],
  [/\bWer sich vorab informieren möchte\b/gi, "Хто хоче заздалегідь ознайомитися"],
  [/\bGesamtkonferenz\b/gi, "загальна педагогічна рада"],
  [/\bSchulkonferenz\b/gi, "шкільна конференція"],
  [/\bFachkonferenz\b/gi, "предметна конференція"],
  [/\bPädagogische Konferenz(?:en)?\b/gi, "педагогічна конференція"],
  [/\bNotenkonferenz\b/gi, "педагогічна рада з оцінювання"],
  [/\bVersetzungskonferenz\b/gi, "педагогічна рада з переведення"],
  [/\bKlassenleiterunterricht\b/gi, "урок класного керівника"],
  [/\bKlassenleiterstunde\b/gi, "урок класного керівника"],
  [/\bUnterrichtsende\b/gi, "закінчення уроків"],
  [/\bUnterrichtende\b/gi, "закінчення уроків"],
  [/\bUnterrichtsfrei\b/gi, "без уроків"],
  [/\bregulärer Unterricht\b/gi, "звичайні заняття"],
  [/\bUnterricht\b/gi, "заняття"],
  [/\bFerien\b/gi, "канікули"],
  [/\bFerientag\b/gi, "вихідний день"],
  [/\bbeweglicher?\b/gi, "рухомий"],
  [/\bPrüfung(?:en)?\b/gi, "іспит"],
  [/\bNachprüfung\b/gi, "перескладання"],
  [/\bschriftlich(?:e|en|er|es)?\b|\bschrift\.\b/gi, "письмовий"],
  [/\bmündlich(?:e|en|er|es)?\b|\bmdl\.?\b/gi, "усний"],
  [/\bPräsentationsprüfung(?:en)?\b/gi, "презентаційний іспит"],
  [/\bLernkontrolle(?:n)?\b/gi, "контрольна робота"],
  [/\bArbeit in Deutsch\b/gi, "контрольна робота з німецької мови"],
  [/\bArbeit in Mathematik\b/gi, "контрольна робота з математики"],
  [/\bArbeit in Englisch\b/gi, "контрольна робота з англійської мови"],
  [/\bDeutsch\b/gi, "німецька мова"],
  [/\bMathematik\b/gi, "математика"],
  [/\bEnglisch\b/gi, "англійська мова"],
  [/\bGeschichte\b/gi, "історія"],
  [/\bReligion\b/gi, "релігія"],
  [/\bSpanisch\b/gi, "іспанська мова"],
  [/\bElternsprechtag\b/gi, "день батьківських консультацій"],
  [/\bElternabend\b/gi, "батьківські збори"],
  [/\bElternbeirat\b/gi, "батьківський комітет"],
  [/\bSchulelternbeiratssitzung\b/gi, "засідання батьківського комітету школи"],
  [/\bSchulsprecherwahl\b/gi, "вибори голови учнівського самоврядування"],
  [/\bSchulsprecher\/?-?in\b/gi, "голова учнівського самоврядування"],
  [/\bSV-Tag\b/gi, "день учнівського самоврядування"],
  [/\bTag der offenen Tür\b/gi, "день відкритих дверей"],
  [/\bZukunftstag\b/gi, "день майбутнього"],
  [/\bBundesjugendspiele\b/gi, "федеральні молодіжні ігри"],
  [/\bSommerfest\b/gi, "літнє свято"],
  [/\bSommerkonzert\b/gi, "літній концерт"],
  [/\bAdventskonzert\b/gi, "різдвяний концерт"],
  [/\bAdventsbasar\b/gi, "різдвяний базар"],
  [/\bGeneralprobe\b/gi, "генеральна репетиція"],
  [/\bGottesdienst\b/gi, "богослужіння"],
  [/\bPraktikum\b/gi, "практика"],
  [/\bAutorenlesung\b/gi, "зустріч-читання з автором"],
  [/\bProbenfahrt\b/gi, "репетиційна поїздка"],
  [/\bGedenkstättenfahrt\b/gi, "поїздка до меморіалу"],
  [/\bGedenkstättnfahrt\b/gi, "поїздка до меморіалу"],
  [/\bAlarmübung\b/gi, "тренувальна тривога"],
  [/\bZeugnisausgabe\b/gi, "видача табелів"],
  [/\bZeugnisse\b/gi, "табелі"],
  [/\b1\. Halbjahr\b/gi, "1-го півріччя"],
  [/\bAbgabe\b/gi, "подача"],
  [/\bTermin\b/gi, "термін"],
  [/\bKlasse\b/gi, "клас"],
  [/\bKl\.\s*/gi, "клас "],
  [/\bJgst\.\s*/gi, "клас "],
  [/\bStd\.\s*/gi, "урок "],
  [/\bab (\d{1,2})[.:](\d{2}) Uhr\b/gi, "з $1:$2"],
  [/\bum (\d{1,2})[.:](\d{2}) Uhr\b/gi, "о $1:$2"]
];
