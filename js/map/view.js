// Türkiye Afet Haritası · Yakınlaştırma, kaydırma, il adları ve ölçek
'use strict';

// ------------------------------------------------------------------ görünüm (yakınlaştırma / kaydırma)
function aspect() { return size.h / size.w; }
function fitRect(b, pad) {
  const A = aspect();
  let w = b.w * (1 + 2 * pad), h = b.h * (1 + 2 * pad);
  if (h / w > A) w = h / A; else h = w * A;
  return { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w, h };
}
function clampVB(v) {
  const A = aspect();
  const maxW = Math.max(GEO.w, GEO.h / A) * 1.05, minW = TB.w / 14;
  const w = Math.min(maxW, Math.max(minW, v.w)), h = w * A;
  const cx = Math.min(GEO.w, Math.max(0, v.x + v.w / 2)), cy = Math.min(GEO.h, Math.max(0, v.y + v.h / 2));
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}
function applyVB() {
  const v = S.vb;
  svg.setAttribute("viewBox", `${v.x.toFixed(2)} ${v.y.toFixed(2)} ${v.w.toFixed(2)} ${v.h.toFixed(2)}`);
  S.u = v.w / Math.max(1, size.w);
  svg.style.setProperty("--u", S.u.toFixed(4));
  if (L.rcPat) L.rcPat.setAttribute("patternTransform", `rotate(45) scale(${S.u.toFixed(4)})`);
  const z = TB.w * 1.06 / v.w;
  svg.classList.toggle("z2", z > 2.4);
  svg.classList.toggle("zoomed", z > 1.12);
  layoutLabels();
  updateScalebar();
}
let flyRAF = 0;
const stopFly = () => cancelAnimationFrame(flyRAF);
function flyTo(t, ms = 650) {
  if (!size.w) return;  // boyut henüz ölçülmedi (ör. #zaman ile açılış): ilk sığdırmayı ResizeObserver yapar
  t = clampVB(t);
  stopFly();
  if (RM.matches || ms <= 0) { S.vb = t; applyVB(); return; }
  const f = { ...S.vb }, t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    S.vb = { x: f.x + (t.x - f.x) * e, y: f.y + (t.y - f.y) * e, w: f.w + (t.w - f.w) * e, h: f.h + (t.h - f.h) * e };
    applyVB();
    if (k < 1) flyRAF = requestAnimationFrame(step);
  };
  flyRAF = requestAnimationFrame(step);
}
function zoomAround(f, x, y, ms) {
  const v = S.vb, w = v.w / f, A = aspect();
  const t = { x: x - (x - v.x) / f, y: y - (y - v.y) / f, w, h: w * A };
  if (ms) flyTo(t, ms); else { stopFly(); S.vb = clampVB(t); applyVB(); }
}
const fitTurkey = ms => flyTo(fitRect(TB, .03), ms);
function svgPt(cx, cy) {
  const r = svg.getBoundingClientRect();
  return [S.vb.x + (cx - r.left) * S.u, S.vb.y + (cy - r.top) * S.u];
}
function bboxOf(ids) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const id of ids) {
    const b = provEl[id].getBBox();
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function flyToBox(b, minFrac) {
  const m = TB.w * minFrac;
  const bb = { x: b.x + b.w / 2 - Math.max(b.w, m) / 2, y: b.y + b.h / 2 - Math.max(b.h, m * .6) / 2, w: Math.max(b.w, m), h: Math.max(b.h, m * .6) };
  flyTo(fitRect(bb, .25));
}

function layoutLabels() {
  if (!S.ov.labels || S.mode === "quiz" || !size.w) return;
  const sc = 1 / S.u, v = S.vb, placed = [];
  const list = labelOrder.slice();
  if (S.sel) list.unshift(PROV[S.sel]);
  const seen = new Set();
  for (const p of list) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const el = labelEl[p.id];
    const rpx = p.r * sc;
    let fs = Math.max(11.5, Math.min(21, 7.5 + rpx * .34));
    if (p.id === S.sel) fs = Math.max(fs, 15);
    const w = p.n.length * fs * .6 + 6, h = fs * 1.2;
    const cx = (p.lx - v.x) * sc, cy = (p.ly - v.y) * sc;
    const vis = cx > -w && cy > -h && cx < size.w + w && cy < size.h + h;
    let ok = vis && (p.id === S.sel || w < rpx * 5.2 + 26);
    const box = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
    if (ok) for (const b of placed) if (box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]) { ok = false; break; }
    if (ok) {
      placed.push(box);
      el.setAttribute("font-size", (fs * S.u).toFixed(2));
      el.style.display = "";
      el.classList.toggle("sel", p.id === S.sel);
    } else el.style.display = "none";
  }
}
const labelOrder = [...GEO.prov].sort((a, b) => b.r - a.r);

const scaleEl = $("#scalebar");
function updateScalebar() {
  const kmPerPx = S.u / PJ.s, raw = kmPerPx * 120;
  const km = [10, 20, 25, 50, 100, 200, 250, 500, 1000].reduce((best, s) => (s <= raw ? s : best), 10);
  scaleEl.innerHTML = `${km} km<div class="bar" style="width:${Math.round(km / kmPerPx)}px"></div>`;
}
