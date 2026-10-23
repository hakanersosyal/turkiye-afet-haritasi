// Türkiye Afet Haritası · Fare, dokunma ve klavye ile harita etkileşimi
'use strict';

// ------------------------------------------------------------------ işaretçi olayları
const ptrs = new Map();
let drag = null, pinch = null, hovId = null;
svg.addEventListener("pointerdown", e => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  try { svg.setPointerCapture(e.pointerId); } catch (_) { /* yoksay */ }
  if (ptrs.size === 1) {
    drag = { x: e.clientX, y: e.clientY, vb: { ...S.vb }, moved: false, target: e.target };
    stopFly();
  } else if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, vb: { ...S.vb }, mid: svgPt((a.x + b.x) / 2, (a.y + b.y) / 2) };
    if (drag) drag.moved = true;
  }
});
svg.addEventListener("pointermove", e => {
  if (!ptrs.has(e.pointerId)) { if (e.pointerType === "mouse") hover(e); return; }
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size >= 2 && pinch) {
    const [a, b] = [...ptrs.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (!d) return;
    const w = pinch.vb.w * pinch.d / d, r = svg.getBoundingClientRect();
    const u = w / size.w, mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
    S.vb = clampVB({ x: pinch.mid[0] - mx * u, y: pinch.mid[1] - my * u, w, h: w * aspect() });
    applyVB();
    return;
  }
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 7) { drag.moved = true; svg.classList.add("dragging"); hideTip(); }
    if (drag.moved) { S.vb = clampVB({ ...drag.vb, x: drag.vb.x - dx * S.u, y: drag.vb.y - dy * S.u }); applyVB(); }
  }
});
function endPtr(e, cancel) {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.delete(e.pointerId);
  if (!cancel && drag && !drag.moved && ptrs.size === 0) tap(drag.target);
  if (ptrs.size < 2) pinch = null;
  if (ptrs.size === 1) {
    const [p] = [...ptrs.values()];
    drag = { x: p.x, y: p.y, vb: { ...S.vb }, moved: true, target: null };
  }
  if (ptrs.size === 0) { drag = null; svg.classList.remove("dragging"); }
}
svg.addEventListener("pointerup", e => endPtr(e, false));
svg.addEventListener("pointercancel", e => endPtr(e, true));
svg.addEventListener("pointerleave", e => { if (e.pointerType === "mouse" && !ptrs.size) { hideTip(); unhover(); } });
svg.addEventListener("wheel", e => {
  e.preventDefault();
  const [x, y] = svgPt(e.clientX, e.clientY);
  zoomAround(Math.exp(-e.deltaY * (e.deltaMode === 1 ? .05 : .0018)), x, y, 0);
}, { passive: false });
svg.addEventListener("keydown", e => {
  const mk = e.target.closest && e.target.closest(".mk");
  if (mk && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onMarker(mk.dataset.ev); }
});

function tap(t) {
  if (!t || !t.closest) return;
  const mk = t.closest(".mk");
  if (mk) { onMarker(mk.dataset.ev); return; }
  const rq = t.closest(".rq");
  if (rq) { rcQuake(+rq.dataset.rq); return; }
  const fh = t.closest(".fault-hit");
  if (fh && S.mode === "explore") { openFault(fh.dataset.fault); return; }
  const p = t.closest(".prov");
  if (!p) return;
  const id = +p.dataset.id;
  if (S.mode === "quiz") quizMapAnswer(id);
  else if (S.mode === "recent") rcProv(id);
  else if (S.mode === "explore") {
    selectProv(id);
    if (!WIDE.matches) showToast(`<b>${esc(PROV[id].n)}</b> seçildi <button class="tlink" data-act="to-panel">Bilgileri gör</button>`, { ms: 6000 });
  }
}
const tipEl = $("#tip");
function showTip(e, a, b) {
  const r = wrap.getBoundingClientRect(), y = e.clientY - r.top;
  tipEl.innerHTML = esc(a) + (b ? `<small>${esc(b)}</small>` : "");
  tipEl.style.left = (e.clientX - r.left) + "px";
  tipEl.style.top = y + "px";
  tipEl.classList.toggle("below", y < 70);
  tipEl.hidden = false;
}
const hideTip = () => { tipEl.hidden = true; };
function hover(e) {
  const t = e.target;
  const mk = t.closest && t.closest(".mk");
  if (mk) { unhover(); const ev = EV[mk.dataset.ev]; showTip(e, ev.t, ev.date || ev.sub || ""); return; }
  const rq = t.closest && t.closest(".rq");
  if (rq) { unhover(); const q = QK.list[+rq.dataset.rq]; showTip(e, `${n1(q.mag)} büyüklüğünde deprem`, `${q.where} · ${rqWhen(q)}`); return; }
  const fh = t.closest && t.closest(".fault-hit");
  if (fh && S.mode === "explore") { unhover(); showTip(e, FAULT_INFO[fh.dataset.fault].n, "Bilgi için dokun"); return; }
  const p = t.closest && t.closest(".prov");
  if (!p) { unhover(); hideTip(); return; }
  const id = +p.dataset.id;
  if (S.mode === "quiz") hideTip(); else showTip(e, PROV[id].n, tipSub(id));
  if (hovId !== id) { hovId = id; drawHover(); }
}
function unhover() { if (hovId != null) { hovId = null; drawHover(); } }
function tipSub(id) {
  if (S.mode === "recent") return rcTip(id);
  if (S.mode !== "explore" || S.hz === "iller" || S.hz === "volkan") return `${pad2(id)} · ${regionName(id)} Bölgesi`;
  const lvl = RISK[id][RISK_KEYS.indexOf(S.hz)];
  return `${HAZ[S.hz].name}: ${LEVEL[lvl]}`;
}
function liftPiece(group, id, sel) {
  group.textContent = "";
  if (!id) return;
  const src = provEl[id];
  sv("path", { d: src.getAttribute("d"), class: "ls" }, group);
  const c = src.cloneNode(false);
  c.classList.add("lp");
  if (sel) c.classList.add("sel");
  group.appendChild(c);
}
const drawHover = () => liftPiece(L.liftHov, hovId && hovId !== S.sel ? hovId : null, false);
const drawSel = () => { liftPiece(L.liftSel, S.mode === "explore" || S.mode === "recent" ? S.sel : null, true); drawHover(); };
