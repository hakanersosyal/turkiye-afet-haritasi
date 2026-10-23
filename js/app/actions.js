// Türkiye Afet Haritası · Eylemler: afet türü, mod, il, olay ve fay seçimi
'use strict';

// ------------------------------------------------------------------ eylemler
function setHazard(k, o = {}) {
  if (S.mode !== "explore") setMode("explore", true);
  S.hz = k; S.tab = 0; S.fact = 0;
  clearRegion();
  svg.dataset.hz = k;
  setOv("faults", k === "iller" || k === "deprem" || k === "tsunami", true);
  $$("#hzList .hz").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.k === k)));
  if (!o.keepView) { S.view = { t: "hz" }; S.sel = null; clearMarkerOn(); clearFaultHl(); drawSel(); }
  renderHead(); renderFoot(); renderPanel(); layoutLabels();
  try { history.replaceState(null, "", "#" + k); } catch (_) { /* yoksay */ }
}
function setMode(m, silent) {
  if (S.mode === m && !silent) return;
  if (S.mode === "timeline") {
    tlStop(); clearFx(); S.tl.story = -1;
    TL.forEach(e => mkEl[e.id].classList.remove("tl-on", "cur"));
  }
  if (S.mode === "quiz") { clearQuizMarks(); svg.classList.remove("q-faults"); }
  if (S.mode === "recent") rcClear();
  S.mode = m;
  svg.dataset.mode = m;
  dailyEl.classList.toggle("off", m === "quiz");
  $$(".modes [data-mode]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
  S.sel = null; clearMarkerOn(); clearFaultHl(); clearRegion(); hideToast(); drawSel();
  if (m === "explore") { svg.dataset.hz = S.hz; svg.classList.toggle("ov-faults", S.ov.faults); }
  if (m === "timeline") { svg.dataset.hz = "none"; svg.classList.add("ov-faults"); S.tl.i = 0; tlShow(true); }
  if (m === "quiz") { svg.dataset.hz = "iller"; quizStart(); }
  if (m === "recent") { svg.dataset.hz = "recent"; setOv("faults", true, true); if (!QK) loadQuakes(); }
  if (!silent) {
    renderHead(); renderFoot(); renderPanel(); layoutLabels();
    if (m !== "explore") fitTurkey(500);
    try { history.replaceState(null, "", "#" + (m === "explore" ? S.hz : { timeline: "zaman", quiz: "yarisma", recent: "sonolaylar" }[m])); } catch (_) { /* yoksay */ }
  }
}
function setOv(k, on, quiet) {
  S.ov[k] = on;
  svg.classList.toggle("ov-" + k, on);
  if (!quiet) { renderFoot(); layoutLabels(); }
}
function selectProv(id, o = {}) {
  if (!PROV[id]) return;
  S.sel = id; S.view = { t: "prov", id };
  clearMarkerOn(); clearFaultHl(); drawSel(); layoutLabels(); renderPanel();
  announce(PROV[id].n + " seçildi");
  if (o.fly) flyToBox(bboxOf([id]), .2);
}
function onMarker(id) {
  if (S.mode === "timeline") {
    if (S.tl.story >= 0) return;
    const i = TL.findIndex(e => e.id === id);
    if (i >= 0) { tlStop(); S.tl.i = i; tlShow(); }
    return;
  }
  if (S.mode === "recent") { rcEvent(id); return; }
  openEvent(id);
}
function openEvent(id, o = {}) {
  const e = EV[id];
  if (!e) return;
  if (S.mode !== "explore") setMode("explore", true);
  if (S.hz !== e.hz) setHazard(e.hz, { keepView: true });
  S.view = { t: "ev", id }; S.sel = null;
  drawSel(); clearFaultHl(); setMarkerOn(id); ripple(e); renderPanel(); layoutLabels();
  if (o.fly) flyTo(fitRect({ x: e.px - TB.w / 9, y: e.py - TB.h / 9, w: TB.w / 4.5, h: TB.h / 4.5 }, 0));
  if (!WIDE.matches && o.fromMap !== false) showToast(`<b>${esc(e.t)}</b> <button class="tlink" data-act="to-panel">Bilgileri gör</button>`, { ms: 6000 });
}
function openFault(fid) {
  if (!FAULT_INFO[fid]) return;
  if (S.mode !== "explore") setMode("explore", true);
  if (!S.ov.faults) setOv("faults", true);
  S.view = { t: "fault", id: fid }; S.sel = null;
  drawSel(); clearMarkerOn(); setFaultHl(fid); renderPanel(); layoutLabels();
}
let mkOn = null;
function setMarkerOn(id) {
  clearMarkerOn();
  mkOn = mkEl[id];
  if (mkOn) { mkOn.classList.add("on"); mkOn.parentNode.appendChild(mkOn); }
}
function clearMarkerOn() { if (mkOn) mkOn.classList.remove("on"); mkOn = null; }
function setFaultHl(fid) {
  clearFaultHl();
  const g = L.faults.querySelector(`.fault-g[data-fault="${fid}"]`);
  if (g) { g.classList.add("hl"); g.parentNode.appendChild(g); }
}
function clearFaultHl() { $$(".fault-g.hl", L.faults).forEach(g => g.classList.remove("hl")); }
function ripple(e) {
  if (RM.matches) return;
  const g = sv("g", { class: "rip", transform: `translate(${e.px.toFixed(1)} ${e.py.toFixed(1)})` }, L.fx);
  g.style.setProperty("--c", `var(--${e.hz}-3)`);
  const s = sv("g", { class: "mk-s" }, g);
  for (let i = 0; i < 3; i++) sv("circle", { r: 12 }, s);
  setTimeout(() => g.remove(), 3300);
}
const clearFx = () => { L.fx.textContent = ""; };
function focusRegion(r) {
  S.region = S.region === r ? null : r;
  for (const id in provEl) provEl[id].classList.toggle("dim", !!S.region && REGION[id] !== S.region);
  $$("[data-act='region']").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.r === S.region)));
  if (S.region) flyToBox(bboxOf(GEO.prov.filter(p => REGION[p.id] === r).map(p => p.id)), .2);
  else fitTurkey();
}
function clearRegion() {
  if (!S.region) return;
  S.region = null;
  for (const id in provEl) provEl[id].classList.remove("dim");
}
