// Türkiye Afet Haritası · Haritanın kurulması
'use strict';

// ------------------------------------------------------------------ harita kurulumu
const svg = $("#map");
const wrap = $("#mapwrap");
const L = {};
const provEl = {}, labelEl = {}, mkEl = {};

function buildMap() {
  svg.setAttribute("viewBox", `0 0 ${GEO.w} ${GEO.h}`);
  sv("defs", null, svg).innerHTML =
    `<radialGradient id="gSea" gradientUnits="userSpaceOnUse" cx="${GEO.w * .52}" cy="${GEO.h * .46}" r="${GEO.w * .78}"><stop offset="0" class="st-sea"/><stop offset="1" class="st-sea-deep"/></radialGradient>` +
    `<pattern id="pWave" width="46" height="28" patternUnits="userSpaceOnUse"><path class="wave-p" d="M3 9q5-4 10 0t10 0M26 23q5-4 10 0t10 0"/></pattern>`;
  const B = 4000;
  sv("rect", { x: -B, y: -B, width: GEO.w + 2 * B, height: GEO.h + 2 * B, class: "sea" }, svg);
  sv("rect", { x: -B, y: -B, width: GEO.w + 2 * B, height: GEO.h + 2 * B, class: "sea-wave" }, svg);
  sv("path", { d: GEO.land, class: "land-n" }, svg);
  const halo = sv("g", { class: "coast-halo" }, svg);
  sv("path", { d: GEO.outline, class: "h1" }, halo);
  sv("path", { d: GEO.outline, class: "h2" }, halo);
  sv("path", { d: GEO.outline, class: "tr-shadow" }, svg);
  sv("path", { d: GEO.outline, class: "tr-edge" }, svg);
  L.provs = sv("g", { class: "provs" }, svg);
  for (const p of GEO.prov) {
    const el = sv("path", { d: p.d, class: `prov t${p.t}`, "data-id": p.id, "data-r": REGION[p.id] }, L.provs);
    RISK_KEYS.forEach((k, i) => el.setAttribute("data-" + k, RISK[p.id][i]));
    provEl[p.id] = el;
  }
  L.liftSel = sv("g", { class: "lift" }, svg);
  L.liftHov = sv("g", { class: "lift" }, svg);
  sv("path", { d: GEO.lakes, class: "lakes" }, svg);
  sv("path", { d: GEO.rivers, class: "rivers" }, svg);
  sv("path", { d: GEO.outline, class: "tr-outline" }, svg);
  L.grid = sv("g", { class: "grid" }, svg);
  buildGrid();
  L.geo = sv("g", { class: "geo-labels" }, svg);
  buildGeoLabels();
  L.faults = sv("g", { class: "faults" }, svg);
  buildFaults();
  L.plates = sv("g", { class: "plates" }, svg);
  buildPlates();
  L.labels = sv("g", { class: "plabels" }, svg);
  for (const p of GEO.prov) {
    const t = sv("text", { class: "pl", x: p.lx, y: p.ly }, L.labels);
    t.textContent = p.n;
    labelEl[p.id] = t;
  }
  L.markers = sv("g", { class: "markers" }, svg);
  buildMarkers();
  L.fx = sv("g", { class: "fx" }, svg);
}

function buildGrid() {
  for (let lat = 33; lat <= 45; lat++) {
    const pts = [];
    for (let lon = 16; lon <= 54; lon += .5) pts.push(proj(lon, lat));
    sv("path", { d: polyD(pts), class: lat === 36 || lat === 42 ? "key" : "" }, L.grid);
  }
  for (let lon = 18; lon <= 52; lon++) {
    const pts = [];
    for (let lat = 30; lat <= 48; lat += .5) pts.push(proj(lon, lat));
    sv("path", { d: polyD(pts), class: lon === 26 || lon === 45 ? "key" : "" }, L.grid);
  }
  [[36, "36° K"], [42, "42° K"]].forEach(([lat, t]) => {
    const [x, y] = proj(25.35, lat);
    sv("text", { x: x.toFixed(1), y: (y - 4).toFixed(1) }, L.grid).textContent = t;
  });
  [[26, "26° D"], [45, "45° D"]].forEach(([lon, t]) => {
    const [x, y] = proj(lon, 34.5);
    sv("text", { x: (x + 4).toFixed(1), y: y.toFixed(1) }, L.grid).textContent = t;
  });
}

const GEO_LABELS = [
  ["KARADENİZ", 35.2, 42.72, "sea-l"], ["AKDENİZ", 30.5, 35.25, "sea-l"], ["MARMARA", 28.1, 40.69, "sea-l sea-s"],
  ["BULGARİSTAN", 26.5, 42.35, "cn"], ["GÜRCİSTAN", 43.05, 41.95, "cn"],
  ["İRAN", 45.05, 38.0, "cn"], ["IRAK", 43.6, 36.7, "cn"], ["SURİYE", 39.5, 35.4, "cn"],
  ["KIBRIS", 33.25, 35.17, "cn"]
];
function buildGeoLabels() {
  for (const [t, lon, lat, cls] of GEO_LABELS) {
    const [x, y] = proj(lon, lat);
    sv("text", { x: x.toFixed(1), y: y.toFixed(1), class: cls }, L.geo).textContent = t;
  }
  const [x, y] = proj(25.5, 38.55);
  sv("text", { class: "sea-l sea-s", transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(-90)` }, L.geo).textContent = "EGE DENİZİ";
}

// Fay adları boş alanlara (deniz, komşu ülke) yazılır ve kesikli çizgiyle faya bağlanır.
const FAULT_CALLOUTS = [
  [[33.45, 42.3], [33.26, 40.86], "KUZEY ANADOLU FAY HATTI"],
  [[37.95, 36.2], [37.29, 37.52], "DOĞU ANADOLU FAY HATTI"]
];
const FAULT_LABELS = [["olu", [36.35, 35.85], [36.30, 35.10], "ÖLÜ DENİZ FAYI", "-0.7em"]];
function buildFaults() {
  for (const fid of Object.keys(FAULT_INFO)) {
    const f = GEO.faults[fid];
    if (!f) continue;
    const major = fid === "kaf" || fid === "daf";
    const g = sv("g", { class: `fault-g ${major ? "f-major" : fid === "bitlis" ? "f-minor f-thrust" : "f-minor"}`, "data-fault": fid }, L.faults);
    const c = sv("path", { d: f.d, class: "fault-c" }, g);
    const l = sv("path", { d: f.d, class: "fault-l" }, g);
    if (major) { c.setAttribute("pathLength", "1"); l.setAttribute("pathLength", "1"); }
    sv("path", { d: f.d, class: "fault-hit", "data-fault": fid }, g);
  }
  for (const [, a, b, text, dy] of FAULT_LABELS) {
    const [x1, y1] = proj(a[0], a[1]), [x2, y2] = proj(b[0], b[1]);
    let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    if (ang > 90) ang -= 180;
    if (ang < -90) ang += 180;
    const g = sv("g", { transform: `translate(${((x1 + x2) / 2).toFixed(1)} ${((y1 + y2) / 2).toFixed(1)}) rotate(${ang.toFixed(1)})` }, L.faults);
    sv("text", { class: "flabel", dy }, g).textContent = text;
  }
  for (const [at, to, text] of FAULT_CALLOUTS) {
    const [x1, y1] = proj(at[0], at[1]), [x2, y2] = proj(to[0], to[1]);
    const up = y2 < y1;
    sv("path", { d: `M${x1.toFixed(1)} ${(y1 + (up ? -12 : 10)).toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`, class: "fleader" }, L.faults);
    sv("circle", { r: 4, class: "fdot" }, sv("g", { class: "mk-s" }, sv("g", { transform: `translate(${x2.toFixed(1)} ${y2.toFixed(1)})` }, L.faults)));
    sv("text", { class: "flabel", x: x1.toFixed(1), y: y1.toFixed(1), dy: ".35em" }, L.faults).textContent = text;
  }
}

function buildPlates() {
  ["kaf", "daf", "olu", "bitlis", "helen"].forEach(fid => sv("path", { d: GEO.faults[fid].d, class: "pb" }, L.plates));
  const ARROWS = [
    [[40.8, 35.55], [40.6, 36.2], [40.3, 36.85]],
    [[31.3, 34.1], [31.25, 34.45], [31.2, 34.85]],
    [[36.8, 39.35], [34.6, 39.55], [32.3, 39.25]],
    [[28.7, 38.1], [27.7, 37.6], [26.8, 37.0]]
  ];
  for (const a of ARROWS) {
    const P = a.map(([lo, la]) => proj(lo, la));
    sv("path", { d: `M${P[0].join(" ")}Q${P[1].join(" ")} ${P[2].join(" ")}`, class: "parrow" }, L.plates);
    const ang = Math.atan2(P[2][1] - P[1][1], P[2][0] - P[1][0]) * 180 / Math.PI;
    const g = sv("g", { transform: `translate(${P[2][0].toFixed(1)} ${P[2][1].toFixed(1)}) rotate(${ang.toFixed(1)})` }, L.plates);
    sv("path", { d: "M8 0-9-8.5-9 8.5z", class: "parr-h" }, sv("g", { class: "mk-s" }, g));
  }
  const PL = [
    ["AVRASYA LEVHASI", 34.0, 42.95, "Görece sabit"],
    ["ANADOLU LEVHASI", 34.6, 39.95, "Yılda yaklaşık 2–2,5 cm batıya"],
    ["ARAP LEVHASI", 41.6, 35.35, "Yılda yaklaşık 2 cm kuzeye"],
    ["AFRİKA LEVHASI", 29.2, 34.35, "Yılda 1 cm'den az kuzeye"],
    ["EGE", 26.25, 36.55, "Yılda yaklaşık 3 cm güneybatıya"]
  ];
  for (const [t, lon, lat, s] of PL) {
    const [x, y] = proj(lon, lat);
    sv("text", { class: "plabel", x: x.toFixed(1), y: y.toFixed(1) }, L.plates).textContent = t;
    sv("text", { class: "plabel-s", x: x.toFixed(1), y: y.toFixed(1), dy: "1.45em" }, L.plates).textContent = s;
  }
}

function buildMarkers() {
  const order = [...EVENTS].sort((a, b) => (b.mag || 0) - (a.mag || 0));
  for (const e of order) {
    const g = sv("g", {
      class: e.recent ? "mk mk-rc" : "mk", "data-ev": e.id, "data-hz": e.hz, transform: `translate(${e.px.toFixed(1)} ${e.py.toFixed(1)})`,
      tabindex: "0", role: "button", "aria-label": e.t + (e.y ? ", " + e.y : "")
    }, L.markers);
    g.style.setProperty("--c", `var(--${e.hz}-3)`);
    const s = sv("g", { class: "mk-s" }, g);
    if (e.hz === "deprem") {
      const r = 5 + (e.mag - 5.5) * 3.4;
      sv("circle", { r: (r + 7).toFixed(1), class: "mk-hit" }, s);
      sv("circle", { cx: 1.5, cy: 3, r: r.toFixed(1), class: "q-sh" }, s);
      sv("circle", { r: r.toFixed(1), class: "q-dot" }, s);
      sv("circle", { r: Math.max(1.6, r * .3).toFixed(1), class: "q-core" }, s);
      sv("text", { x: (r + 4).toFixed(1), y: 4, class: "q-yr" }, s).textContent = e.y;
    } else {
      sv("circle", { cy: -16, r: 19, class: "mk-hit" }, s);
      if (e.isNew) sv("circle", { cy: -18, r: 14, class: "pin-new" }, s);
      sv("ellipse", { cx: 0, cy: 1, rx: 7, ry: 2.6, class: "pin-sh" }, s);
      sv("path", { d: "M0 0C-2.6-6-12-9.6-12-18a12 12 0 1 1 24 0c0 8.4-9.4 12-12 18z", class: "pin" }, s);
      sv("g", { transform: "translate(-7.5 -25.5) scale(.625)", class: "pin-i" }, s).innerHTML = ICON[e.hz];
    }
    mkEl[e.id] = g;
  }
}
