# Türkiye Afet Haritası

Ortaokul öğrencileri için etkileşimli Türkiye afet haritası.
**Hazırlayan: Hakan Er, Sosyal Bilgiler Öğretmeni**

**Canlı site:** https://hakanersosyal.github.io/turkiye-afet-haritasi/

## Neler var?

- 81 il için yedi afet türünde (deprem, sel, heyelan, çığ, orman yangını, kuraklık, tsunami) risk karnesi ve volkanlar
- Gerçek olaylar ve yerler, fay hatları ve levha hareketleri
- Deprem zaman tüneli ve KAF domino hikâyesi
- 25 soruluk bilgi yarışması ve sertifika, afet çantası oyunu, afet sözlüğü
- **Günün Bilgisi:** haritanın köşesinde her gün değişen bir “Biliyor muydun?” bilgisi
- **Son Olaylar:** son 7 günün depremleri (her açılışta internetten kendiliğinden güncellenir) ve yakın zamanda yaşanan gerçek afetler (her olayın kaynak bağlantılarıyla)

Bir bölümü doğrudan açmak için adresin sonuna ekleyin:
`#sonolaylar`, `#zaman`, `#yarisma`, `#canta`, `#sozluk`, `#deprem`, `#sel`, `#heyelan`, `#cig`, `#yangin`, `#kuraklik`, `#tsunami`, `#volkan`

Örnek: https://hakanersosyal.github.io/turkiye-afet-haritasi/#sonolaylar (eski `#buhafta` bağlantıları da çalışır)

## İnternetsiz kullanım (akıllı tahta)

GitHub'da **Code → Download ZIP** ile indirin, klasörü açın ve `index.html` dosyasına çift tıklayın. Kurulum gerekmez.
İnternet yoksa başlık yazı tipleri yerine bilgisayarın kendi yazı tipi kullanılır ve Son Olaylar'da canlı depremler yerine
kayıtlı bir haftanın AFAD depremleri gösterilir; geri kalan her şey çalışır.

## Klasör yapısı

```
index.html                 sayfa iskeleti
css/                       görünüm (tokens.css: renkler ve koyu tema)
js/data/                   içerik: metinler buradan düzenlenir
  hazards.js               afet türleri: tanım, neden, ne yapmalıyım
  events.js                haritadaki tarihî olaylar ve yerler
  recent.js                Son Olaylar: yakın zamanda yaşanan afetler, dersler ve kaynaklar
  recent-quakes.js         internet yokken gösterilen kayıtlı depremler (araçla üretilir)
  regions.js               illerin risk düzeyleri ve bölgeleri
  faults.js, glossary.js, quiz.js, bag.js, province-facts.js, magnitude.js
  geo.js                   harita geometrisi (elle düzenlenmez)
js/art/                    SVG çizimler ve simgeler
js/core/, js/map/, js/app/, js/features/   uygulama kodu
tools/afad_haftalik.py     AFAD'dan bir haftanın deprem verisini çeker (kayıtlı depremler için)
```

Betikler `index.html`'deki sırayla yüklenen klasik betiklerdir; bu sayede site çift tıklanarak da çalışır.
Yeni bir dosya eklerken `index.html`'deki sıraya dikkat edin: veri dosyaları kodu kullanan dosyalardan önce gelir.

## "Son Olaylar"ı güncelleme (isteğe bağlı)

Düzenli güncelleme gerekmez:

- **Depremler** her açılışta EMSC'den (Avrupa-Akdeniz Sismoloji Merkezi) canlı alınır. EMSC, AFAD ve Kandilli'nin kayıtlarını da toplar.
  (AFAD'ın servisi tarayıcıdan okunmaya izin vermediği için doğrudan AFAD kullanılamıyor.)
- **Afetler** tarihleriyle birlikte listelenir. Bir olay, bittiği günden (`on` alanı) sonraki 30 gün boyunca "YENİ" olarak işaretlenir; sonra kendiliğinden normal görünür.

Yeni bir afet eklemek isterseniz `js/data/recent.js` içindeki `events` listesinin başına ekleyin, `updated` tarihini değiştirin.
Her olayın `src` alanına resmî açıklamanın bağlantısını ekleyin. Rakamları kurumun kendi açıklamasından (valilik, bakanlık, AFAD, belediye) alın;
bağlantı olarak kurumun sitesini ya da açıklamayı aktaran Anadolu Ajansı, DHA veya TRT Haber'i kullanın. Yalnızca tek bir haber sitesinde geçen bilgileri eklemeyin.

İnternet yokken gösterilen kayıtlı depremleri yenilemek için (Türkiye saatiyle tarih aralığı):

```
python3 tools/afad_haftalik.py 2026-10-21 2026-10-28
```

## Kaynaklar

- Harita verisi: Natural Earth (kamu malı)
- Deprem bilgileri: AFAD, Kandilli Rasathanesi ve Deprem Araştırma Enstitüsü
- Fay hatları: MTA diri fay haritası esas alınarak basitleştirildi
- Diğer bilgiler: AFAD, Meteoroloji Genel Müdürlüğü, Orman Genel Müdürlüğü, DSİ
- Son Olaylar: depremler EMSC (canlı) ve AFAD Deprem Kataloğu (kayıtlı); afetler İstanbul, Kocaeli, Sakarya, Yalova ve Antalya valilikleri, İçişleri Bakanlığı, Çevre, Şehircilik ve İklim Değişikliği Bakanlığı, AFAD, Meteoroloji Genel Müdürlüğü, İBB AKOM, İSKİ ve Kocaeli Büyükşehir Belediyesi açıklamaları; kurumların kendi sitelerinden ya da onları aktaran Anadolu Ajansı, DHA ve TRT Haber'den (bağlantılar sitede, her olayın kartında)

## Önemli not

Haritadaki risk düzeyleri il geneli için yapılmış, eğitim amaçlı ve yaklaşık değerlendirmelerdir. Fay hatlarının konumu basitleştirilmiştir.
Resmî ve ayrıntılı bilgi için AFAD'ın Türkiye Deprem Tehlike Haritası'na ve ilgili kurumlara başvurun. Acil durumlarda **112**'yi arayın.

© 2026 Hakan Er, Sosyal Bilgiler Öğretmeni
