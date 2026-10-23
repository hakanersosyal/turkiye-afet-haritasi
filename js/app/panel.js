// Türkiye Afet Haritası · Bilgi paneli görünümleri
'use strict';

// ------------------------------------------------------------------ panel görünümleri
const panel = $("#panel");
function renderPanel() {
  let html;
  if (S.mode === "timeline") html = viewTimeline();
  else if (S.mode === "quiz") html = viewQuiz();
  else if (S.mode === "recent") html = viewRecent();
  else if (S.view.t === "prov") html = viewProv(S.view.id);
  else if (S.view.t === "ev") html = viewEvent(S.view.id);
  else if (S.view.t === "fault") html = viewFault(S.view.id);
  else html = S.hz === "iller" ? viewIller() : viewHazard(S.hz);
  panel.innerHTML = html;
  panel.scrollTop = 0;
  bindMagLab();
}
function factCard(k) {
  const f = HAZ[k].facts, i = ((S.fact % f.length) + f.length) % f.length;
  return `<section class="fact" id="factBox"><div class="fh"><b>Biliyor muydun?</b><span class="mini"><button data-act="fact" data-d="-1" aria-label="Önceki bilgi">${ic("prev")}</button><span>${i + 1}/${f.length}</span><button data-act="fact" data-d="1" aria-label="Sonraki bilgi">${ic("next")}</button></span></div><p>${f[i]}</p></section>`;
}
function viewIller() {
  return `<div class="hero"><div class="eyebrow" style="--c:var(--ink-2)">${ic("compass")} Hoş geldin!</div>
<h2>Türkiye Afet Haritası</h2>
<p class="lede">Türkiye'de hangi afetin nerede görüldüğünü keşfet. Bir afet türü seç, haritada bir ile dokun, işaretlere dokunarak gerçek olayları öğren.</p>
<div class="byl">Hazırlayan: <b>Hakan Er</b> · Sosyal Bilgiler Öğretmeni</div></div>
<button class="rc-promo" data-act="mode" data-m="recent"><span class="tile" style="--c:var(--danger)">${ic("calendar")}</span><span class="wp-t"><b>Son Olaylar${RC_EVENTS.some(e => e.isNew) ? `<em class="new">YENİ</em>` : ""}</b><span class="wp-s">Son 7 günün depremleri ve yakın zamanda yaşanan afetler</span></span>${ic("next")}</button>
<section class="daily daily-p" aria-label="Günün bilgisi">${dailyHTML()}</section>
<section><h3>Bir afet türü seç</h3><div class="hz-cards">${HZ_ORDER.slice(1).map(k => `<button class="hz-card" data-act="hz" data-k="${k}" style="--c:var(--${k}-3)">${tile(k)}<span>${HAZ[k].name}</span></button>`).join("")}</div></section>
<section>${factCard("iller")}</section>
<section><h3>7 coğrafi bölge</h3><div class="regs">${REGIONS.map(r => `<button class="reg" data-act="region" data-r="${r.k}" aria-pressed="${S.region === r.k}"><span class="sw" style="background:var(--r-${r.k})"></span><span><b>${r.n} Bölgesi</b><span>${r.t}</span></span></button>`).join("")}</div></section>
<section><h3>Nasıl kullanılır?</h3><ol class="steps"><li>Afet türlerinden birini seç.</li><li>Haritada bir ile dokun ve o ilin afet risk karnesini gör.</li><li>Haritadaki işaretlere dokunarak gerçek olayları öğren.</li><li>Zaman Tüneli, Yarışma ve Afet Çantası bölümlerini dene!</li></ol></section>`;
}
function viewHazard(k) {
  const h = HAZ[k], ki = RISK_KEYS.indexOf(k);
  const top = ki < 0 ? [] : GEO.prov.filter(p => RISK[p.id][ki] === 3).sort((a, b) => a.n.localeCompare(b.n, "tr"));
  const evs = EVENTS.filter(e => e.hz === k).sort((a, b) => (b.y || 0) - (a.y || 0));
  return `<div style="--c:var(--${k}-3)">${scene(k)}
<div class="eyebrow">${ic(k)} Afet türü</div>
<h2>${h.name}</h2>
<p class="lede">${h.def}</p>
${factCard(k)}
<section><h3>Neden olur?</h3><p>${h.why}</p></section>
<section><h3>Türkiye'de nerede?</h3><p>${h.where}</p>${top.length ? `<div class="chips-l">Haritada riski yüksek görünen iller:</div><div class="chips">${top.map(p => `<button class="chip" data-act="prov" data-id="${p.id}">${p.n}</button>`).join("")}</div>` : ""}</section>
<section id="tabsBox">${tabsHTML(k)}</section>
${k === "deprem" ? magLabHTML() : ""}
${evs.length ? `<section><h3>Haritadaki işaretler</h3><div class="evlist">${evs.map(evRow).join("")}</div></section>` : ""}
${k === "deprem" ? `<section><button class="btn" data-act="mode" data-m="timeline">${ic("clock")} Deprem Zaman Tüneli'ni aç</button></section>` : ""}</div>`;
}
function tabsHTML(k) {
  const t = HAZ[k].tabs, i = Math.min(S.tab, t.length - 1);
  const title = k === "kuraklik" ? "Neler yapabiliriz?" : k === "volkan" ? "Volkanlar hakkında" : "Ne yapmalıyım?";
  return `<h3>${title}</h3><div class="tabs" role="tablist">${t.map(([n], j) => `<button role="tab" aria-selected="${j === i}" data-act="tab" data-i="${j}">${n}</button>`).join("")}</div>
${k === "deprem" && i === 1 ? pictos() : ""}<ul class="todo">${t[i][1].map(x => `<li>${ic("check")}<span>${x}</span></li>`).join("")}</ul>`;
}
function evRow(e) {
  const badge = e.hz === "deprem" ? n1(e.mag) : e.recent ? ic(e.hz) : (e.y || ic(e.hz));
  const sub = [e.hz === "deprem" ? e.date : (e.date || e.sub), provNames(e)].filter(Boolean).join(" · ");
  const isNew = e.isNew ? `<em class="new">YENİ</em>` : "";
  return `<button class="ev" data-act="${S.mode === "recent" ? "rc-ev" : "ev"}" data-id="${e.id}" style="--c:var(--${e.hz}-3)"><span class="yr">${badge}</span><span><b>${e.hz === "deprem" ? e.y + " · " : ""}${e.t}${isNew}</b><span>${sub}</span></span></button>`;
}
function rkRow(k, lvl) {
  return `<button class="rk${lvl === 0 ? " none" : ""}" data-act="hzkeep" data-k="${k}" style="--c:var(--${k}-3)">${tile(k)}<span class="nm">${HAZ[k].name}</span><span class="meter" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= lvl ? "on" : ""}"></i>`).join("")}</span><b>${LEVEL[lvl]}</b></button>`;
}
const backBtn = () => `<button class="back" data-act="back">${ic("back")} ${S.hz === "iller" ? "Başlangıca dön" : HAZ[S.hz].name + " bilgisine dön"}</button>`;
function viewProv(id) {
  const p = PROV[id], r = RISK[id];
  const ranked = RISK_KEYS.map((k, i) => [k, r[i]]).filter(([, l]) => l > 0).sort((a, b) => b[1] - a[1]);
  const topL = ranked[0][1];
  const top = ranked.filter(([, l]) => l === topL).map(([k]) => HAZ[k].name.toLocaleLowerCase("tr-TR"));
  const fl = provFaults(id);
  const evs = EVENTS.filter(e => ilsOf(e).includes(id));
  const lead = topL === 3
    ? `${p.n} için en yüksek afet ${top.length > 1 ? "riskleri" : "riski"}: <b>${listTr(top)}</b>.`
    : `${p.n} için öne çıkan afet ${top.length > 1 ? "riskleri" : "riski"}: <b>${listTr(top)}</b>.`;
  const fsent = fl.length ? ` ${listTr(fl.map(f => FAULT_INFO[f].n))} bu ilden geçer.` : "";
  const first = ranked[0][0];
  return `${backBtn()}
<div class="phead"><span class="plate" aria-label="Plaka kodu ${pad2(id)}"><span class="tr">TR</span><span class="no">${pad2(id)}</span></span><div><h2>${p.n}</h2><div class="sub">${regionName(id)} Bölgesi</div></div></div>
<p class="lede">${lead}${fsent}</p>
<section><h3>Afet risk karnesi</h3><div class="risk">${RISK_KEYS.map((k, i) => rkRow(k, r[i])).join("")}</div></section>
${fl.length ? `<section><h3>Bu ilden geçen faylar</h3><div class="chips">${fl.map(f => `<button class="chip" data-act="fault" data-id="${f}" style="--c:var(--fault)">${ic("fault")}${FAULT_INFO[f].n}</button>`).join("")}</div></section>` : ""}
${PFACT[id] ? `<section class="fact"><div class="fh"><b>Biliyor muydun?</b></div><p>${PFACT[id]}</p></section>` : ""}
${evs.length ? `<section><h3>Bu ildeki olaylar ve yerler</h3><div class="evlist">${evs.map(evRow).join("")}</div></section>` : ""}
<div class="lesson"><h3>${HAZ[first].name} için ilk adım</h3><p>${HAZ[first].tabs[0][1][0]}</p></div>
<p class="note">Risk düzeyleri il geneli için yapılmış, eğitim amaçlı ve yaklaşık değerlendirmelerdir. Düşük risk, o afetin hiç yaşanmayacağı anlamına gelmez. Türkiye'nin her yerinde deprem olabilir.</p>`;
}
function magWord(m) { return m >= 7 ? "Büyük deprem" : m >= 6 ? "Güçlü deprem" : m >= 5 ? "Orta büyüklükte deprem" : "Hafif deprem"; }
function eventBody(e) {
  const k = e.hz, stats = [];
  if (k === "deprem") stats.push(["Büyüklük", e.magTxt || n1(e.mag)]);
  if (e.date) stats.push(["Tarih", e.date + (e.time ? ", saat " + e.time : "")]);
  if (e.loss) stats.push(["Can kaybı", e.loss]);
  if (e.fault && FAULT_INFO[e.fault]) stats.push(["Fay", FAULT_INFO[e.fault].n]);
  stats.push([ilsOf(e).length > 1 ? "İller" : "İl", provNames(e)]);
  return `<div class="eyebrow">${ic(k)} ${HAZ[k].name}${e.y ? " · " + e.y : ""}${e.recent && S.mode !== "recent" ? `<em class="new">SON OLAYLAR</em>` : ""}</div>
<h2>${e.t}</h2>${e.sub ? `<p class="lede" style="margin-top:-.2rem">${e.sub}</p>` : ""}
${k === "deprem" ? `<div class="magbig"><span class="m">${e.mb || n1(e.mag)}</span><span><b>büyüklüğünde</b><small>${magWord(e.mag)}</small></span></div>` : ""}
<dl class="stats">${stats.map(([a, b]) => `<div class="stat"><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl>
<p>${e.text}</p>
${e.lesson ? `<div class="lesson"><h3>Ne öğrendik?</h3><p>${e.lesson}</p></div>` : ""}
${e.src ? srcLinks(e.src) : ""}`;
}
const srcLinks = list => `<div class="src"><h3>Kaynaklar</h3><ul>${list.map(([n, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a></li>`).join("")}</ul></div>`;
function viewEvent(id) {
  const e = EV[id];
  return `${backBtn()}<div style="--c:var(--${e.hz}-3)">${eventBody(e)}
<section><h3>${ilsOf(e).length > 1 ? "İlgili iller" : "İlgili il"}</h3><div class="chips">${ilsOf(e).map(i => `<button class="chip" data-act="prov" data-id="${i}">${PROV[i].n}</button>`).join("")}${e.fault ? `<button class="chip" data-act="fault" data-id="${e.fault}" style="--c:var(--fault)">${ic("fault")}${FAULT_INFO[e.fault].n}</button>` : ""}</div></section></div>`;
}
function viewFault(fid) {
  const f = FAULT_INFO[fid], provs = faultProvs(fid), evs = EVENTS.filter(e => e.fault === fid && e.hz === "deprem");
  const stats = [f.len ? ["Uzunluk", f.len] : null, f.speed ? ["Hareket hızı", f.speed] : null].filter(Boolean);
  return `${backBtn()}<div style="--c:var(--fault)"><div class="eyebrow">${ic("fault")} Fay hattı</div>
<h2>${f.n}${f.ab ? ` (${f.ab})` : ""}</h2><span class="ftype">${f.type}</span>
${stats.length ? `<dl class="stats">${stats.map(([a, b]) => `<div class="stat"><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl>` : ""}
<p>${f.text}</p>${f.extra ? `<div class="fact"><p>${f.extra}</p></div>` : ""}
${provs.length ? `<section><h3>Geçtiği ya da yakınından geçtiği iller</h3><div class="chips">${provs.map(i => `<button class="chip" data-act="prov" data-id="${i}">${PROV[i].n}</button>`).join("")}</div></section>` : ""}
${evs.length ? `<section><h3>Bu fay üzerindeki depremler</h3><div class="evlist">${evs.sort((a, b) => a.y - b.y).map(evRow).join("")}</div></section>` : ""}
<p class="note">Fay hatlarının konumu haritada basitleştirilerek gösterilmiştir.</p></div>`;
}
