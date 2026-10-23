// Türkiye Afet Haritası · Başlatma
'use strict';

// ------------------------------------------------------------------ başlat
(function init() {
  $("#logoBox").innerHTML = LOGO;
  $("#compass").innerHTML = COMPASS;
  $("#zIn").innerHTML = ic("plus");
  $("#zOut").innerHTML = ic("minus");
  $("#zFit").innerHTML = ic("fit");
  fsBtn.innerHTML = ic("full");
  $("#searchIc").innerHTML = ic("search");
  $("#sosIc").innerHTML = ic("phone");
  dailyRender();
  $(".dlg-h [data-act='close']").innerHTML = ic("close");
  $$(".modes [data-ic]").forEach(b => b.insertAdjacentHTML("afterbegin", ic(b.dataset.ic)));
  $("#hzList").innerHTML = HZ_ORDER.map(k => `<button class="hz" data-k="${k}" aria-pressed="${k === S.hz}" style="--c:var(--${k}-3)">${tile(k)}<span><span class="nm">${HAZ[k].name}</span><span class="sub">${HAZ[k].short}</span></span></button>`).join("");
  buildMap();
  buildRecentLayer();
  svg.dataset.hz = S.hz;
  svg.dataset.mode = S.mode;
  ["faults", "plates", "labels", "grid"].forEach(k => svg.classList.toggle("ov-" + k, S.ov[k]));
  const ro = new ResizeObserver(() => {
    const r = wrap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const first = !size.w, c = [S.vb.x + S.vb.w / 2, S.vb.y + S.vb.h / 2];
    size.w = r.width; size.h = r.height;
    if (first) S.vb = clampVB(fitRect(TB, .03));
    else { const w = S.vb.w; S.vb = clampVB({ x: c[0] - w / 2, y: c[1] - w * aspect() / 2, w, h: w * aspect() }); }
    applyVB();
  });
  ro.observe(wrap);
  renderHead(); renderFoot(); renderPanel();
  const h = decodeURIComponent((location.hash || "").slice(1));
  if (HZ_ORDER.includes(h) && h !== "iller") setHazard(h);
  else if (h === "zaman") setMode("timeline");
  else if (h === "yarisma") setMode("quiz");
  else if (h === "sonolaylar" || h === "buhafta") setMode("recent");  // buhafta: eski bağlantılar
  else if (h === "canta") openBag();
  else if (h === "sozluk") openGloss();
  if (S.mode === "explore") showToast("İpucu: Bir afet türü seç ya da haritada bir ile dokun.", { ms: 9000 });
})();
