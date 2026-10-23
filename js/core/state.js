// Türkiye Afet Haritası · Veri dizinleri ve uygulama durumu
'use strict';

// ------------------------------------------------------------------ veri dizinleri
const HZ_ORDER = ["iller", "deprem", "sel", "heyelan", "cig", "yangin", "kuraklik", "tsunami", "volkan"];
const PROV = {};
GEO.prov.forEach(p => { PROV[p.id] = p; });
// Son olayların afetleri de haritadaki olaylara katılır; son 30 günde bitenler YENİ olarak işaretlenir.
RECENT.events.forEach(e => EVENTS.push({ ...e, recent: true, isNew: Date.now() - Date.parse(e.on + "T23:59:59+03:00") < 30 * 864e5 }));
const EV = {};
EVENTS.forEach(e => { EV[e.id] = e; [e.px, e.py] = proj(e.lon, e.lat); });
const BAGI = {};
BAG.forEach(b => { BAGI[b.id] = b; });
const TL = EVENTS.filter(e => e.hz === "deprem").sort((a, b) => a.y - b.y);
const TB = { x: GEO.tb[0], y: GEO.tb[1], w: GEO.tb[2] - GEO.tb[0], h: GEO.tb[3] - GEO.tb[1] };
const ilsOf = e => Array.isArray(e.il) ? e.il : [e.il];
const provNames = e => ilsOf(e).map(i => PROV[i].n).join(", ");
const regionName = id => REGIONS.find(r => r.k === REGION[id]).n;
function faultProvs(fid) {
  const s = new Set(GEO.faults[fid] ? GEO.faults[fid].p : []);
  (FAULT_EXTRA[fid] || []).forEach(i => s.add(i));
  return [...s].filter(i => PROV[i]);
}
const provFaults = id => Object.keys(FAULT_INFO).filter(f => faultProvs(f).includes(id));
const tile = k => `<span class="tile${k === "iller" ? " multi" : ""}" style="--c:var(--${k}-3)">${ic(k)}</span>`;

// ------------------------------------------------------------------ durum
const S = {
  mode: "explore", hz: "iller", view: { t: "hz" }, sel: null, tab: 0, fact: 0, region: null, mag: 7,
  ov: { faults: true, plates: false, labels: true, grid: false },
  u: 1, vb: { x: 0, y: 0, w: GEO.w, h: GEO.h },
  tl: { i: 0, playing: false, timer: 0, story: -1 },
  q: null, bag: null, rc: { view: null }
};
const size = { w: 0, h: 0 };
