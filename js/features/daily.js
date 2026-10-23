// Türkiye Afet Haritası · Günün bilgisi: her gün afet türlerinin ve illerin “Biliyor muydun?” bilgilerinden biri
'use strict';

// ------------------------------------------------------------------ günün bilgisi
const DAILY = [
  ...HZ_ORDER.flatMap(k => HAZ[k].facts.filter(t => !t.startsWith("Haritada")).map(t => ({ t, hz: k }))),  // harita ipuçları hariç
  ...Object.keys(PFACT).map(id => ({ t: PFACT[id], il: +id }))
];
// Gün numarası 211 adımla ilerler: 211 asal olduğundan havuz 211'den küçük kaldıkça her bilgi bir kez gelir,
// art arda günlerde farklı konular çıkar ve aynı gün herkes aynı bilgiyi görür.
function dailyFact(d = new Date()) {
  const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
  return DAILY[day * 211 % DAILY.length];
}
function dailyHTML(closable) {
  const f = dailyFact();
  const date = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
  const topic = f.il ? `<span class="plate"><span class="tr">TR</span><span class="no">${pad2(f.il)}</span></span>${PROV[f.il].n}` : `${tile(f.hz)}${HAZ[f.hz].name}`;
  const go = f.il ? `data-act="prov" data-id="${f.il}"` : `data-act="hz" data-k="${f.hz}"`;
  return `<div class="dh">${ic("bulb")}<b>Günün Bilgisi</b><span>${date}</span>${closable ? `<button class="ibtn" data-act="daily-shut" aria-label="Günün bilgisini kapat" title="Kapat">${ic("close")}</button>` : ""}</div>
<div class="dt"><span>${topic}</span><button class="tlink" ${go}>Haritada gör ${ic("next")}</button></div><p>${f.t}</p>`;
}

// Haritadaki kart kapatılınca o gün küçük bir düğme olarak kalır; ertesi gün yeniden açılır.
const dailyEl = $("#daily"), DAILY_KEY = "gunun-bilgisi-kapali";
function dailyRender() {
  let shut = false;
  try { shut = localStorage.getItem(DAILY_KEY) === new Date().toDateString(); } catch (_) { /* yoksay */ }
  dailyEl.classList.toggle("shut", shut);
  dailyEl.innerHTML = shut ? `<button class="daily-open" data-act="daily-open">${ic("bulb")} Günün Bilgisi</button>` : dailyHTML(true);
}
function dailyShut(on) {
  try { if (on) localStorage.setItem(DAILY_KEY, new Date().toDateString()); else localStorage.removeItem(DAILY_KEY); } catch (_) { /* yoksay */ }
  dailyRender();
  $(on ? ".daily-open" : "[data-act='daily-shut']", dailyEl).focus();
}
