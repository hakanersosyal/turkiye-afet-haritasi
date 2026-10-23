// Türkiye Afet Haritası · Harita başlığı ve lejant
'use strict';

// ------------------------------------------------------------------ üst başlık ve lejant
function renderHead() {
  let html;
  if (S.mode === "timeline") html = `<span class="tile" style="--c:var(--ink)">${ic("clock")}</span><div><h2>Deprem Zaman Tüneli</h2><p>1509'dan bugüne Türkiye'nin büyük depremleri</p></div>`;
  else if (S.mode === "quiz") html = `<span class="tile" style="--c:var(--ink)">${ic("quiz")}</span><div><h2>Bilgi Yarışması</h2><p>${QUIZ.length} soru · Bazı soruları haritada cevaplayacaksın</p></div>`;
  else if (S.mode === "recent") html = `<span class="tile" style="--c:var(--ink)">${ic("calendar")}</span><div><h2>Son Olaylar</h2><p>Son 7 günün depremleri ve yakın zamanda yaşanan afetler</p></div>`;
  else html = `${tile(S.hz)}<div><h2>${HAZ[S.hz].name}</h2><p>${S.hz === "iller" ? "81 il · 7 coğrafi bölge · Bir ile dokun" : HAZ[S.hz].short}</p></div>`;
  $("#mhTitle").innerHTML = html;
  $("#provSearch").disabled = S.mode === "quiz";
}
function renderFoot() {
  const foot = $("#mapfoot");
  if (S.mode === "timeline") { foot.innerHTML = S.tl.story >= 0 ? storyFoot() : tlBar(); return; }
  let lg;
  const k = S.hz;
  if (S.mode === "quiz") lg = `<span class="lg-t">Yarışma:</span><span class="lg-i">İl adları gizlendi. Haritayı kullanarak cevapla!</span>`;
  else if (S.mode === "recent") lg = recentLegend();
  else if (k === "iller" || k === "volkan") {
    lg = `<span class="lg-t">Bölgeler:</span>` + REGIONS.map(r => `<button class="lg-i" data-act="region" data-r="${r.k}" aria-pressed="${S.region === r.k}"><span class="sw" style="background:var(--r-${r.k})"></span>${r.n}</button>`).join("");
    if (k === "volkan") lg += `<span class="lg-i"><svg class="ico" viewBox="0 0 24 24" style="color:var(--volkan-3)">${ICON.pin}</svg>Volkan ya da volkanik yer</span>`;
  } else {
    lg = `<span class="lg-t">${HAZ[k].legend}:</span>` +
      (k === "tsunami" ? `<span class="lg-i"><span class="sw" style="background:var(--inland)"></span>Kıyısı yok</span>` : "") +
      [1, 2, 3].map(l => `<span class="lg-i"><span class="sw" style="background:var(--${k}-${l})"></span>${LEVEL[l]}</span>`).join("");
    if (k === "deprem") lg += `<span class="lg-i"><span class="lg-fault"></span>Fay hattı</span><span class="lg-i"><span class="lg-dot" style="width:.65rem;height:.65rem"></span><span class="lg-dot" style="width:1.05rem;height:1.05rem"></span>Deprem (büyüklüğe göre)</span><span class="lg-note">Düşük risk, hiç deprem olmayacağı anlamına gelmez. Türkiye'nin her yerinde deprem olabilir.</span>`;
    else lg += `<span class="lg-i"><svg class="ico" viewBox="0 0 24 24" style="color:var(--${k}-3)">${ICON.pin}</svg>Önemli olay ya da yer</span>`;
  }
  const tg = S.mode === "quiz" ? "" : [["faults", "Fay hatları"], ["plates", "Levhalar"], ["labels", "İl adları"], ["grid", "Enlem-boylam"]]
    .map(([key, n]) => `<button class="tg" data-act="ov" data-k="${key}" aria-pressed="${S.ov[key]}"><i></i>${n}</button>`).join("");
  foot.innerHTML = `<div class="legend">${lg}</div><div class="toggles">${tg}</div>`;
}
