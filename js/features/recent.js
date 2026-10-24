// Türkiye Afet Haritası · Son olaylar: son 7 günün depremleri (canlı) ve yakın zamanda yaşanan afetler
'use strict';

// ------------------------------------------------------------------ veri dizinleri
const RC_EVENTS = EVENTS.filter(e => e.recent);
const PROV_ID = {};
GEO.prov.forEach(p => { PROV_ID[fold(p.n)] = p.id; });

// Depremler Kandilli Rasathanesi'nden gelir. Kandilli'nin listesi tarayıcıdan okunamadığı için GitHub onu her saat
// js/data/kandilli.js dosyasına yazar (tools/kandilli.py). Dosyadaki son depremden sonrakiler EMSC'den (Avrupa-Akdeniz
// Sismoloji Merkezi) canlı alınır; EMSC, AFAD ve Kandilli'nin kayıtlarını da toplar. İnternet yoksa yalnızca dosya gösterilir.
const EMSC = "https://www.seismicportal.eu/fdsnws/event/1/query";
const QK_FRAME = [25.5, 35.6, 45.0, 42.3];  // batı, güney, doğu, kuzey (tools/kandilli.py ile aynı)
const QK_DAYS = 7, QK_MIN = 2, NEAR_KM = 50, DAY = 864e5, TSI = 3 * 36e5;  // Türkiye saati = UTC+3
const QK_BY = { KOERI: "Kandilli Rasathanesi", AFAD: "AFAD", EMSC: "EMSC (Avrupa-Akdeniz Sismoloji Merkezi)" };
const EMSC_SRC = ["EMSC (Avrupa-Akdeniz Sismoloji Merkezi): Son depremler", "https://www.emsc-csem.org/"];
const kandilliMs = t => Date.parse(t.replace(" ", "T") + "+03:00");
const KANDILLI_MS = KANDILLI.length ? kandilliMs(KANDILLI[0][0]) : 0;  // dosyadaki en yeni deprem
let QK = null;       // { live, total, days, max, min, list, byProv, src, at | range }
let rqBusy = false;

// EMSC bölge adlarının Türkçesi; ilk eşleşen kullanılır, bilinmeyen ad olduğu gibi yazılır.
const REGION_TR = [
  [/BLACK SEA/, "Karadeniz"], [/MARMARA/, "Marmara Denizi"], [/AEGEAN/, "Ege Denizi"], [/DODECANESE/, "Onikiadalar, Yunanistan"],
  [/CRETE/, "Girit, Yunanistan"], [/GREECE/, "Yunanistan"], [/CYPRUS/, "Kıbrıs çevresi"], [/MEDITERRANEAN/, "Akdeniz"],
  [/COAST OF .*TURKEY/, "Türkiye kıyıları açıkları"], [/TURKEY-SYRIA/, "Türkiye-Suriye sınırı"], [/SYRIA/, "Suriye"], [/IRAQ/, "Irak"],
  [/IRAN/, "İran"], [/ARMENIA/, "Ermenistan"], [/GEORGIA/, "Gürcistan"], [/AZERBAIJAN/, "Azerbaycan"], [/BULGARIA/, "Bulgaristan"],
  [/LEBANON/, "Lübnan"], [/TURKEY/, "Türkiye"]
];
const regionTr = r => { const m = REGION_TR.find(([re]) => re.test(r)); return m ? m[1] : r; };
// Kandilli yer adlarını Türkçe harfler olmadan büyük harfle yazar: "SILIFKE ACIKLARI-MERSIN (AKDENIZ)".
// Denizdeki ya da yurt dışındaki depremin yeri için parantez içi (yoksa tamamı) sözcük sözcük düzeltilir.
const KANDILLI_TR = {
  ege: "Ege", akdeniz: "Akdeniz", karadeniz: "Karadeniz", marmara: "Marmara", denizi: "Denizi", korfezi: "Körfezi", golu: "Gölü",
  turkiye: "Türkiye", yunanistan: "Yunanistan", bulgaristan: "Bulgaristan", gurcistan: "Gürcistan", ermenistan: "Ermenistan",
  azerbaycan: "Azerbaycan", nahcivan: "Nahçıvan", iran: "İran", irak: "Irak", suriye: "Suriye", lubnan: "Lübnan",
  kibris: "Kıbrıs", rum: "Rum", kesimi: "Kesimi", sinir: "sınır", bolgesi: "bölgesi", aciklari: "açıkları"
};
function kandilliRegion(place) {
  const m = place.match(/\(([^)]+)\)\s*$/);
  return (m ? m[1] : place).split(/([\s-]+)/).map(w => {
    const f = fold(w);
    return KANDILLI_TR[f] || (PROV_ID[f] ? PROV[PROV_ID[f]].n : w.charAt(0) + w.slice(1).toLowerCase());
  }).join("");
}

// Haritadaki noktanın içinde olduğu il; denizde ya da sınırın ötesindeyse en fazla 50 km uzaktaki en yakın il.
let provBox = null;
function provAt(px, py) {
  if (!provBox) { provBox = {}; for (const id in provEl) provBox[id] = provEl[id].getBBox(); }
  const pt = svg.createSVGPoint();
  const hit = (x, y) => {
    for (const id in provBox) {
      const b = provBox[id];
      if (x < b.x || y < b.y || x > b.x + b.width || y > b.y + b.height) continue;
      pt.x = x; pt.y = y;
      if (provEl[id].isPointInFill(pt)) return +id;
    }
    return 0;
  };
  let id = hit(px, py);
  if (id) return { id, near: false };
  for (let r = 10; r <= NEAR_KM; r += 10) {  // giderek büyüyen halkalarda ara
    for (let a = 0; a < 12; a++) {
      id = hit(px + Math.cos(a * Math.PI / 6) * r * PJ.s, py + Math.sin(a * Math.PI / 6) * r * PJ.s);
      if (id) return { id, near: true };
    }
  }
  return null;
}

const rqR = m => 3.2 + (m - 2) * 2.6;
function rqWhen(q, long) {
  const [d, t] = q.time.split(" "), [y, mo, da] = d.split("-").map(Number);
  const opt = long ? { weekday: "long", day: "numeric", month: "long", year: "numeric" } : { day: "numeric", month: "long" };
  return `${new Date(y, mo - 1, da).toLocaleDateString("tr-TR", opt)}, saat ${t.replace(":", ".")}`;
}
const hhmm = d => `${pad2(d.getHours())}.${pad2(d.getMinutes())}`;
function rangeTr(a, b) {  // "2026-10-14 00:00", "2026-10-21 19:55" → "14–21 Ekim 2026"
  const day = s => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)), x = day(a), y = day(b);
  const full = y.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  return x.getMonth() === y.getMonth() && x.getFullYear() === y.getFullYear() ? `${x.getDate()}–${full}` : `${x.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} – ${full}`;
}
function countByProv(rows) {
  const by = new Map();
  for (const q of rows) {
    if (!q.il) continue;
    const b = by.get(q.il) || { c: 0, m: 0 };
    b.c++; b.m = Math.max(b.m, q.mag);
    by.set(q.il, b);
  }
  return by;
}

// ------------------------------------------------------------------ depremleri yükleme
function fetchQuakes(since) {
  const [w, s, e, n] = QK_FRAME, start = new Date(since).toISOString().slice(0, 19);
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 12000);
  return fetch(`${EMSC}?format=json&limit=5000&minlat=${s}&maxlat=${n}&minlon=${w}&maxlon=${e}&start=${start}`, { signal: ctl.signal })
    .then(r => { if (r.status === 204) return {}; if (!r.ok) throw new Error("EMSC " + r.status); return r.json(); })  // 204: o andan beri deprem yok
    .then(d => d.features || [])
    .finally(() => clearTimeout(timer));
}
// Kandilli ve EMSC kayıtlarını aynı biçime getirir; il, haritadaki noktadan bulunur.
function quakeRow(o) {  // o: { ms, lat, lon, depth, mag, region, src, id (EMSC) | place (Kandilli) }
  const [px, py] = proj(o.lon, o.lat), at = provAt(px, py), where = at && !at.near ? PROV[at.id].n : o.region;
  return {
    ...o, px, py, mag: Math.round(o.mag * 10) / 10, depth: Math.abs(Math.round(o.depth * 10) / 10),
    time: new Date(o.ms + TSI).toISOString().slice(0, 16).replace("T", " "),
    il: at ? at.id : 0, where,
    near: at && at.near && where !== PROV[at.id].n ? "en yakın il: " + PROV[at.id].n : ""
  };
}
function kandilliRows(from) {
  const rows = [];
  for (const [t, lat, lon, depth, mag, place] of KANDILLI) {  // en yenisi üstte
    const ms = kandilliMs(t);
    if (ms < from) break;
    rows.push(quakeRow({ ms, lat, lon, depth, mag, place, region: kandilliRegion(place), src: "KOERI" }));
  }
  return rows;
}
const emscRows = features => features.map(f => f.properties).filter(p => !p.evtype || p.evtype.endsWith("e")).map(p => quakeRow({  // ke, se: deprem
  id: p.unid, ms: Date.parse(p.time), lat: p.lat, lon: p.lon, depth: p.depth, mag: p.mag, region: regionTr(p.flynn_region || ""), src: p.auth
}));
function quakeSet(rows) {
  const list = rows.filter(q => q.mag >= QK_MIN).sort((a, b) => a.mag - b.mag || a.ms - b.ms).map((q, i) => ({ ...q, i }));
  return { total: rows.length, min: QK_MIN, max: Math.max(...rows.map(q => q.mag)), list, byProv: countByProv(rows) };
}
function liveQuakes(features) {
  const k = kandilliRows(Date.now() - QK_DAYS * DAY);
  // Sınırdaki deprem hem Kandilli'de hem EMSC'de olabilir: bir dakika ve yarım derece içindekiler aynı sayılır.
  const same = (a, b) => Math.abs(a.ms - b.ms) < 6e4 && Math.abs(a.lat - b.lat) < .5 && Math.abs(a.lon - b.lon) < .5;
  const rows = [...k, ...emscRows(features).filter(e => !k.some(q => same(q, e)))];
  if (!rows.length) throw new Error("deprem yok");
  return { live: true, at: new Date(), days: QK_DAYS, ...quakeSet(rows), src: [RECENT_SRC.kandilli, EMSC_SRC] };
}
function savedQuakes() {  // dosyadaki en yeni depremden geriye 7 gün
  const rows = kandilliRows(KANDILLI_MS - QK_DAYS * DAY), first = rows[rows.length - 1];
  return { live: false, range: rangeTr(first.time, rows[0].time), days: (rows[0].ms - first.ms) / DAY || 1, ...quakeSet(rows), src: [RECENT_SRC.kandilli] };
}
const keepScroll = f => { const st = panel.scrollTop; f(); panel.scrollTop = st; };
function loadQuakes() {
  if (rqBusy) return;
  rqBusy = true;
  const again = !!QK;
  if (again && S.mode === "recent") keepScroll(renderPanel);
  fetchQuakes(Math.max(Date.now() - QK_DAYS * DAY, KANDILLI_MS)).then(liveQuakes).catch(() => null).then(q => {
    rqBusy = false;
    if (!q && again) {  // yenileme olmadı: eldeki veri kalsın
      showToast("Son depremler alınamadı. İnternet bağlantını kontrol et.", { ms: 6000 });
      if (S.mode === "recent") keepScroll(renderPanel);
      return;
    }
    QK = q || savedQuakes();
    if (S.rc.view && S.rc.view.t === "q") S.rc.view = null;  // sıra numaraları değişti
    clearQuakeOn();
    buildQuakeLayer();
    if (S.mode === "recent") { renderFoot(); keepScroll(renderPanel); }
  });
}

// ------------------------------------------------------------------ harita katmanı
function buildRecentLayer() {
  // Selden etkilenen iller: kara rengi üzerine mavi tarama (düz mavi denizle karışıyordu).
  L.rcPat = sv("pattern", { id: "pRc", width: 8, height: 8, patternUnits: "userSpaceOnUse" }, svg.querySelector("defs"));
  sv("rect", { width: 8, height: 8, class: "rc-bg" }, L.rcPat);
  sv("path", { d: "M4 0V8", class: "rc-ln" }, L.rcPat);
  L.rq = sv("g", { class: "rquakes" });
  svg.insertBefore(L.rq, L.labels);  // il adları noktaların üstünde okunur kalsın
  RC_EVENTS.filter(e => e.hz === "sel").forEach(e => ilsOf(e).forEach(id => provEl[id].classList.add("rc-hit")));
}
function buildQuakeLayer() {
  L.rq.textContent = "";
  for (const q of QK.list) {  // liste küçükten büyüğe sıralı: büyük depremler üstte kalır
    const g = sv("g", { class: "rq" + (q.mag >= 3 ? " big" : ""), "data-rq": q.i, transform: `translate(${q.px.toFixed(1)} ${q.py.toFixed(1)})` }, L.rq);
    const s = sv("g", { class: "mk-s" }, g);
    sv("circle", { r: (rqR(q.mag) + 5).toFixed(1), class: "mk-hit" }, s);
    sv("circle", { r: rqR(q.mag).toFixed(1), class: "rq-dot" }, s);
  }
}
let rqOn = null;
function setQuakeOn(i) {
  clearQuakeOn();
  rqOn = L.rq.querySelector(`.rq[data-rq="${i}"]`);
  if (rqOn) { rqOn.classList.add("on"); rqOn.parentNode.appendChild(rqOn); }
}
function clearQuakeOn() { if (rqOn) rqOn.classList.remove("on"); rqOn = null; }

// ------------------------------------------------------------------ eylemler
function rcShow(view) {
  S.rc.view = view;
  S.sel = view && view.t === "prov" ? view.id : null;
  clearMarkerOn(); clearQuakeOn(); drawSel();
  if (view && view.t === "ev") { setMarkerOn(view.id); ripple(EV[view.id]); }
  if (view && view.t === "q") { setQuakeOn(view.i); ripple({ ...QK.list[view.i], hz: "deprem" }); }
  if (!view) hideToast();
  renderPanel(); layoutLabels();
}
const toPanel = html => { if (!WIDE.matches) showToast(`${html} <button class="tlink" data-act="to-panel">Bilgileri gör</button>`, { ms: 6000 }); };
const flyNear = (x, y) => flyTo(fitRect({ x: x - TB.w / 9, y: y - TB.h / 9, w: TB.w / 4.5, h: TB.h / 4.5 }, 0));
function rcEvent(id, o = {}) {
  const e = EV[id];
  if (!e) return;
  if (S.mode !== "recent") setMode("recent");
  rcShow({ t: "ev", id });
  if (o.fly) flyNear(e.px, e.py); else toPanel(`<b>${esc(e.t)}</b>`);
}
function rcQuake(i, o = {}) {
  const q = QK && QK.list[i];
  if (!q) return;
  rcShow({ t: "q", i });
  if (o.fly) flyNear(q.px, q.py); else toPanel(`<b>${n1(q.mag)}</b> ${esc(q.where)}`);
}
function rcProv(id, o = {}) {
  if (!PROV[id]) return;
  rcShow({ t: "prov", id });
  announce(PROV[id].n + " seçildi");
  if (o.fly) flyToBox(bboxOf([id]), .2); else toPanel(`<b>${esc(PROV[id].n)}</b> seçildi`);
}
const rcBack = () => rcShow(null);
function rcClear() { S.rc.view = null; clearQuakeOn(); }
const rcZoom = () => flyToBox(bboxOf([...new Set(RC_EVENTS.flatMap(ilsOf))]), .2);
function rcTip(id) {
  const n = RC_EVENTS.filter(e => ilsOf(e).includes(id)).length, q = QK && QK.byProv.get(id);
  const parts = [n ? `${n} olay` : "", q ? `${q.c} deprem` : ""].filter(Boolean);
  return "Son olaylar: " + (parts.join(", ") || "kayıt yok");
}

// ------------------------------------------------------------------ lejant ve panel
function recentLegend() {
  const qk = !QK ? "Depremler yükleniyor" : `Deprem: ${QK.live ? "son 7 gün" : QK.range + ", Kandilli"} (${n1(QK.min)} ve üzeri)`;
  return `<span class="lg-t">Son olaylar:</span>` +
    `<span class="lg-i"><span class="sw sw-rc"></span>Sel ve su baskını yaşanan iller</span>` +
    `<span class="lg-i"><svg class="ico" viewBox="0 0 24 24" style="color:var(--sel-3)">${ICON.pin}</svg>Afet olayı</span>` +
    `<span class="lg-i"><span class="lg-dot" style="width:.55rem;height:.55rem"></span><span class="lg-dot" style="width:.9rem;height:.9rem"></span>${qk}</span>` +
    `<span class="lg-note">İşaretlere ve noktalara dokun. Bir ile dokunarak o ilde son zamanlarda neler olduğunu gör.</span>`;
}
function viewRecent() {
  const v = S.rc.view;
  if (v && v.t === "ev") return viewRecentEvent(EV[v.id]);
  if (v && v.t === "q") return viewRecentQuake(QK.list[v.i]);
  if (v && v.t === "prov") return viewRecentProv(v.id);
  return viewRecentHome();
}
const rcBackBtn = () => `<button class="back" data-act="rc-back">${ic("back")} Son Olaylar'a dön</button>`;
const rqRow = q => `<button class="ev" data-act="rc-q" data-i="${q.i}" style="--c:var(--deprem-3)"><span class="yr">${n1(q.mag)}</span><span><b>${esc(q.near ? q.where + " · " + q.near : q.where)}</b><span>${rqWhen(q)} · ${n1(q.depth)} km derinlikte</span></span></button>`;
const qkSpan = () => QK.live ? "Son 7 günde" : `${QK.range} tarihleri arasında`;

function quakeHome() {
  if (!QK) return `<section><h3>Son 7 günün depremleri</h3><p class="rc-status">${ic("deprem")} Son depremler yükleniyor…</p></section>`;
  const top = [...QK.list].sort((a, b) => b.mag - a.mag).slice(0, 3);
  const busy = [...QK.byProv].sort((a, b) => b[1].c - a[1].c).slice(0, 5);
  const small = Math.floor((QK.total - QK.list.filter(q => q.mag >= 3).length) / QK.total * 100);
  const tiles = [
    [QK.total.toLocaleString("tr-TR"), QK.live ? "deprem: son 7 günde Türkiye ve çevresinde kaydedilen" : `deprem: ${QK.range} tarihleri arasında kaydedilen`, "deprem-3"],
    [Math.round(QK.total / QK.days).toLocaleString("tr-TR"), "deprem: günde ortalama", "focus"],
    [n1(QK.max), "en büyük depremin büyüklüğü", "danger"],
    ["%" + small, "küçük deprem: Büyüklüğü 3'ten az olanların oranı. Çoğunu kimse hissetmedi.", "safe"]
  ];
  const retry = `<button class="tlink" data-act="rc-reload">${QK.live ? "Yenile" : "Yeniden dene"}</button>`;
  const status = rqBusy ? "Yenileniyor…" : QK.live
    ? `<span class="live" aria-hidden="true"></span>Canlı veri · Son güncelleme: ${hhmm(QK.at)} ${retry}`
    : `Canlı veriye ulaşılamadı. Kandilli Rasathanesi'nin ${QK.range} tarihleri arasında kaydettiği depremler gösteriliyor. ${retry}`;
  return `<section><h3>${QK.live ? "Son 7 günün depremleri" : "Depremler"}</h3><p class="rc-status">${status}</p>
<div class="rc-stats">${tiles.map(([v, t, c]) => `<div class="rc-stat" style="--c:var(--${c})"><b>${v}</b><span>${t}</span></div>`).join("")}</div>
${top.length ? `<p style="margin-top:.9rem">Haritadaki kırmızı noktalar bu depremlerden ${n1(QK.min)} ve daha büyük olanları gösteriyor. En büyükleri:</p><div class="evlist">${top.map(rqRow).join("")}</div>` : ""}
${busy.length ? `<p class="chips-l">En çok deprem kaydedilen iller:</p><div class="chips">${busy.map(([id, b]) => `<button class="chip" data-act="rc-prov" data-id="${id}">${PROV[id].n} · ${b.c}</button>`).join("")}</div>` : ""}
<div class="fact" style="margin-top:.9rem"><div class="fh"><b>Kendin keşfet</b></div><p>“Fay hatları” düğmesi açıkken kırmızı noktaların çoğunun fay hatlarının çevresinde toplandığını görebilirsin.</p></div></section>`;
}
function viewRecentHome() {
  const seen = new Set();
  const src = [...(QK ? QK.src : []), ...RC_EVENTS.flatMap(e => e.src || []), ...RECENT.sources].filter(([, u]) => !seen.has(u) && seen.add(u));
  const qnote = !QK ? "" : QK.live ? " Deprem verisi: Kandilli Rasathanesi. Kandilli'nin listesi sitede saatte bir yenilenir; aradaki en yeni depremler EMSC'den (Avrupa-Akdeniz Sismoloji Merkezi) canlı alınır. Her depremin kaynağı kendi bilgi kartında yazar." : " Deprem verisi: Kandilli Rasathanesi.";
  return `<div class="hero rc-hero"><div class="eyebrow" style="--c:var(--danger)">${ic("calendar")} Son Olaylar</div>
<h2>Türkiye'de son neler oldu?</h2>
<p class="lede">Son 7 günde kaydedilen depremleri ve yakın zamanda yaşanan önemli afetleri burada bulabilirsin. Depremler internetten kendiliğinden güncellenir.</p></div>
${quakeHome()}
<section><h3>Yakın zamanda yaşanan afetler</h3>${RC_EVENTS.length ? `<div class="evlist">${RC_EVENTS.map(evRow).join("")}</div>
<div class="row"><button class="btn" data-act="rc-zoom">${ic("fit")} Olayları haritada göster</button></div>` : `<p>Şu anda listede bir olay yok.</p>`}</section>
${RECENT.lessons.length ? `<div class="lesson"><h3>Bu olaylardan ne öğrendik?</h3><ul class="todo">${RECENT.lessons.map(x => `<li>${ic("check")}<span>${x}</span></li>`).join("")}</ul></div>` : ""}
${srcLinks(src)}
<p class="note">Afet bilgileri resmî açıklamalardan derlendi (son güncelleme: ${RECENT.updated}); rakamlar sonradan değişebilir.${qnote} Saatler Türkiye saatidir.</p>`;
}
function viewRecentEvent(e) {
  return `${rcBackBtn()}<div style="--c:var(--${e.hz}-3)">${eventBody(e)}
<section><h3>${ilsOf(e).length > 1 ? "İlgili iller" : "İlgili il"}</h3><div class="chips">${ilsOf(e).map(i => `<button class="chip" data-act="rc-prov" data-id="${i}">${PROV[i].n}</button>`).join("")}</div></section></div>`;
}
function viewRecentQuake(q) {
  const band = [...MAG_BANDS].reverse().find(b => q.mag >= b.min);
  const feel = band ? band.txt : q.mag < 2.5 ? "Çok küçük bir deprem: Genellikle hissedilmez ama sismograflar kaydeder."
    : "Küçük bir deprem: Merkezine yakın bazı kişiler hissedebilir ama hasar yapmaz.";
  const src = q.id ? ["EMSC: Bu depremin ayrıntıları", `https://www.seismicportal.eu/eventdetails.html?unid=${encodeURIComponent(q.id)}`] : RECENT_SRC.kandilli;
  const by = QK_BY[q.src] || `${q.src || "EMSC"} (EMSC aracılığıyla)`;
  return `${rcBackBtn()}<div style="--c:var(--deprem-3)"><div class="eyebrow">${ic("deprem")} Deprem · ${QK.live ? "Son 7 gün" : "Kandilli kaydı"}</div>
<h2>${esc(q.where)}</h2>${q.near ? `<p class="lede" style="margin-top:-.2rem">${esc(q.near)}</p>` : ""}
<div class="magbig"><span class="m">${n1(q.mag)}</span><span><b>büyüklüğünde</b><small>${magWord(q.mag)}</small></span></div>
<dl class="stats"><div class="stat"><dt>Tarih</dt><dd>${rqWhen(q, true)}</dd></div><div class="stat"><dt>Derinlik</dt><dd>${n1(q.depth)} km</dd></div>
<div class="stat" style="grid-column:1/-1"><dt>Kaynak</dt><dd>${esc(by)}</dd></div></dl>
<p>${feel}</p>${q.place ? `<p class="note">Kandilli bu depremin yerini şöyle yazdı: ${esc(q.place)}</p>` : ""}
${q.il ? `<section><h3>İlgili il</h3><div class="chips"><button class="chip" data-act="rc-prov" data-id="${q.il}">${PROV[q.il].n}</button></div></section>` : ""}
${srcLinks([src])}</div>`;
}
function viewRecentProv(id) {
  const p = PROV[id], q = QK && QK.byProv.get(id);
  const evs = RC_EVENTS.filter(e => ilsOf(e).includes(id));
  const qs = QK ? QK.list.filter(x => x.il === id).sort((a, b) => b.mag - a.mag).slice(0, 3) : [];
  const qtxt = !QK ? "Son depremler yükleniyor…"
    : q ? `${qkSpan()} ${p.n} ve çevresinde <b>${q.c}</b> deprem kaydedildi. En büyüğü <b>${n1(q.m)}</b> büyüklüğündeydi.`
      : `${qkSpan()} ${p.n} için kaydedilmiş bir deprem yok.`;
  return `${rcBackBtn()}
<div class="phead"><span class="plate" aria-label="Plaka kodu ${pad2(id)}"><span class="tr">TR</span><span class="no">${pad2(id)}</span></span><div><h2>${p.n}</h2><div class="sub">Son olaylar</div></div></div>
${evs.length ? `<section><h3>Yakın zamanda yaşanan afetler</h3><div class="evlist">${evs.map(evRow).join("")}</div></section>` : `<p class="lede">Son olaylar listesinde ${p.n} ile ilgili bir afet yok.</p>`}
<section><h3>Depremler</h3><p>${qtxt}</p>
${qs.length ? `<div class="evlist">${qs.map(rqRow).join("")}</div>` : ""}</section>
<div class="lesson"><h3>Unutma</h3><p>Afetler her yerde ve her zaman olabilir. Afet çantanı hazırla, ailenle bir afet planı yap!</p></div>
<div class="row"><button class="btn" data-act="prov" data-id="${id}">${ic("compass")} ${p.n} afet risk karnesi</button></div>`;
}
