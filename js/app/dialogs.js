// Türkiye Afet Haritası · Pencereler: sözlük ve hakkında
'use strict';

// ------------------------------------------------------------------ sözlük ve hakkında
function glossHTML(f) {
  const ff = fold(f || "");
  const list = GLOSS.filter(([t, d]) => !ff || fold(t).includes(ff) || fold(d).includes(ff));
  return list.length ? list.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join("") : `<div><dt>Sonuç yok</dt><dd>Başka bir kelime dene.</dd></div>`;
}
function openGloss() {
  openModal("Afet Sözlüğü", `<label class="gl-search">${ic("search")}<input id="glIn" type="search" placeholder="Kelime ara: fay, tsunami, obruk…" autocomplete="off" aria-label="Sözlükte ara"></label><dl class="gloss" id="glList">${glossHTML("")}</dl>`);
  $("#glIn").addEventListener("input", e => { $("#glList").innerHTML = glossHTML(e.target.value); });
}
function openAbout() {
  openModal("Hakkında", `<p>Bu etkileşimli harita, ortaokul öğrencilerinin Türkiye'deki doğal afetleri tanıması ve afetlere hazırlıklı olmayı öğrenmesi için Sosyal Bilgiler Öğretmeni <b>Hakan Er</b> tarafından hazırlandı.</p>
<h3>Neler var?</h3>
<p>81 il için yedi afet türünde risk karnesi, gerçek olaylar ve yerler, fay hatları ve levha hareketleri, deprem zaman tüneli, KAF domino hikâyesi, bilgi yarışması ve sertifika, afet çantası oyunu, afet sözlüğü, her gün yeni bir bilgi ve son olaylar: son 7 günün depremleri ile yakın zamanda yaşanan gerçek afetler.</p>
<h3>Kaynaklar</h3>
<p>Harita verisi: Natural Earth (kamu malı). Deprem bilgileri: AFAD ile Kandilli Rasathanesi ve Deprem Araştırma Enstitüsü. Fay hatları, MTA'nın diri fay haritası esas alınarak basitleştirildi. Diğer bilgiler: AFAD, Meteoroloji Genel Müdürlüğü, Orman Genel Müdürlüğü ve DSİ.</p>
<p>“Son Olaylar” bölümü: Son depremler EMSC'den (Avrupa-Akdeniz Sismoloji Merkezi) canlı olarak alınır. EMSC, AFAD ve Kandilli Rasathanesi dahil birçok kurumun kayıtlarını bir araya getirir. İnternet yokken AFAD Deprem Kataloğu'ndan kaydedilmiş bir haftanın depremleri gösterilir. Yakın zamanda yaşanan afetler: İstanbul, Kocaeli, Sakarya, Yalova ve Antalya valilikleri, İçişleri Bakanlığı, Çevre, Şehircilik ve İklim Değişikliği Bakanlığı, AFAD, Meteoroloji Genel Müdürlüğü, İBB AKOM, İSKİ ve Kocaeli Büyükşehir Belediyesinin açıklamaları. Bu açıklamalar kurumların kendi sitelerinden ya da onları aktaran Anadolu Ajansı, DHA ve TRT Haber'den alındı. Her olayın kaynak bağlantıları, olayın bilgi kartında yer alır.</p>
<h3>Önemli not</h3>
<p>Haritadaki risk düzeyleri il geneli için yapılmış, eğitim amaçlı ve yaklaşık değerlendirmelerdir. Fay hatlarının konumu basitleştirilmiştir. Resmî ve ayrıntılı bilgi için AFAD'ın Türkiye Deprem Tehlike Haritası'na ve ilgili kurumlara başvurun.</p>
<h3>Faydalı bağlantılar</h3>
<p><a href="https://www.afad.gov.tr" target="_blank" rel="noopener">AFAD</a> · <a href="https://tdth.afad.gov.tr" target="_blank" rel="noopener">Türkiye Deprem Tehlike Haritası</a> · <a href="https://deprem.afad.gov.tr" target="_blank" rel="noopener">Son depremler (AFAD)</a> · <a href="http://www.koeri.boun.edu.tr" target="_blank" rel="noopener">Kandilli Rasathanesi</a> · <a href="https://www.mgm.gov.tr" target="_blank" rel="noopener">Meteoroloji</a></p>
<p class="note">Acil durumlarda <b>112</b>'yi ara. © 2026 Hakan Er, Sosyal Bilgiler Öğretmeni</p>`);
}
const dlg = $("#dlg");
function openModal(title, html) {
  $("#dlgTitle").textContent = title;
  $("#dlgBody").innerHTML = html;
  $("#dlgBody").scrollTop = 0;
  if (!dlg.open) { try { dlg.showModal(); } catch (_) { dlg.setAttribute("open", ""); } }
}
function closeModal() { try { dlg.close(); } catch (_) { dlg.removeAttribute("open"); } }
