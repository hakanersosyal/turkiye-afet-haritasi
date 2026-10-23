// Türkiye Afet Haritası · Tıklama yönlendirme, düğmeler ve il arama
'use strict';

// ------------------------------------------------------------------ olay yönlendirme
function act(a, d) {
  switch (a) {
    case "hz": setHazard(d.k); break;
    case "hzkeep": if (S.mode === "explore") setHazard(d.k, { keepView: true }); break;
    case "prov": if (S.mode !== "explore") setMode("explore"); selectProv(+d.id, { fly: true }); break;
    case "ev": closeModal(); openEvent(d.id, { fly: true, fromMap: false }); break;
    case "fault": openFault(d.id); break;
    case "back": S.view = { t: "hz" }; S.sel = null; drawSel(); clearMarkerOn(); clearFaultHl(); renderPanel(); layoutLabels(); break;
    case "tab": S.tab = +d.i; $("#tabsBox").innerHTML = tabsHTML(S.hz); break;
    case "fact": S.fact += +d.d; $("#factBox").outerHTML = factCard(S.view.t === "hz" ? S.hz : "iller"); break;
    case "region": focusRegion(d.r); break;
    case "ov": setOv(d.k, !S.ov[d.k]); break;
    case "mode": setMode(d.m); break;
    case "tl-step": tlStep(+d.d); break;
    case "tl-play": tlPlay(); break;
    case "tl-go": tlStop(); S.tl.i = +d.i; tlShow(); break;
    case "domino": storyStart(); break;
    case "story": S.tl.story = Math.max(0, Math.min(DOMINO.length + 1, S.tl.story + +d.d)); storyDraw(); break;
    case "story-exit": S.tl.story = -1; clearFx(); tlShow(); fitTurkey(); break;
    case "qa": quizAnswer(+d.i); break;
    case "qn": quizNext(); break;
    case "qr": quizStart(); renderPanel(); break;
    case "cert": showCert(); break;
    case "print": window.print(); break;
    case "close": closeModal(); break;
    case "bag-item": if (!S.bag.checked) { S.bag.picked.has(d.id) ? S.bag.picked.delete(d.id) : S.bag.picked.add(d.id); bagRender(); } break;
    case "bag-check": S.bag.checked = true; bagRender(); $("#dlgBody").scrollTop = 0; break;
    case "bag-reset": bagReset(); bagRender(); $("#dlgBody").scrollTop = 0; break;
    case "rc-ev": rcEvent(d.id, { fly: true }); break;
    case "rc-q": rcQuake(+d.i, { fly: true }); break;
    case "rc-prov": rcProv(+d.id, { fly: true }); break;
    case "rc-back": rcBack(); break;
    case "rc-zoom": rcZoom(); break;
    case "rc-reload": loadQuakes(); break;
    case "toast-x": hideToast(); break;
    case "daily-shut": dailyShut(true); break;
    case "daily-open": dailyShut(false); break;
    case "to-panel": hideToast(); panel.scrollIntoView({ behavior: RM.matches ? "auto" : "smooth", block: "start" }); break;
  }
}
function delegate(root) {
  root.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (b && root.contains(b) && !b.disabled) act(b.dataset.act, b.dataset);
  });
}
[panel, $("#mapfoot"), toastEl, $("#dlgBody"), $(".dlg-h"), $("#daily")].forEach(delegate);
dlg.addEventListener("click", e => { if (e.target === dlg) closeModal(); });
$("#hzList").addEventListener("click", e => { const b = e.target.closest(".hz"); if (b) setHazard(b.dataset.k); });
$$(".modes [data-mode]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
$$(".modes [data-open]").forEach(b => b.addEventListener("click", () => {
  const m = b.dataset.open;
  if (m === "bag") openBag(); else if (m === "glossary") openGloss(); else openAbout();
}));
$("#zIn").addEventListener("click", () => zoomAround(1.7, S.vb.x + S.vb.w / 2, S.vb.y + S.vb.h / 2, 280));
$("#zOut").addEventListener("click", () => zoomAround(1 / 1.7, S.vb.x + S.vb.w / 2, S.vb.y + S.vb.h / 2, 280));
$("#zFit").addEventListener("click", () => fitTurkey());
const fsBtn = $("#fsBtn");
if (document.fullscreenEnabled) {
  fsBtn.addEventListener("click", () => {
    const p = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    if (p && p.catch) p.catch(() => { fsBtn.hidden = true; });
  });
} else fsBtn.hidden = true;
const sIn = $("#provSearch");
$("#provList").innerHTML = [...GEO.prov].sort((a, b) => a.n.localeCompare(b.n, "tr")).map(p => `<option value="${p.n}"></option>`).join("");
function doSearch() {
  const v = sIn.value.trim();
  if (!v || S.mode === "quiz") return;
  let id = /^\d{1,2}$/.test(v) ? +v : null;
  if (!id) {
    const f = fold(v);
    const hit = GEO.prov.find(p => fold(p.n) === f) || GEO.prov.find(p => fold(p.n).startsWith(f));
    id = hit && hit.id;
  }
  if (id && PROV[id]) {
    if (S.mode === "recent") rcProv(id, { fly: true });
    else {
      if (S.mode !== "explore") setMode("explore");
      selectProv(id, { fly: true });
    }
    sIn.value = "";
    sIn.blur();
  }
}
sIn.addEventListener("change", doSearch);
sIn.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
document.addEventListener("keydown", e => {
  if (e.key !== "Escape" || dlg.open) return;
  if (S.mode === "explore" && S.view.t !== "hz") act("back", {});
  else if (S.mode === "recent" && S.rc.view) rcBack();
});
const redrawCanvas = () => { if ($("#mlCanvas")) drawMag(); };
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redrawCanvas);
new MutationObserver(redrawCanvas).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
