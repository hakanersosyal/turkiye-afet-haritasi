// Türkiye Afet Haritası · Son olaylar: yakın zamanda yaşanan, araştırılmış gerçek afetler ve kaynakları
'use strict';

// Kaynaklar: [ad, bağlantı]. Olaylar haritadaki olaylara da eklenir (bkz. core/state.js).
// Rakamlar kurumların kendi açıklamalarından alınır; bağlantı ya kurumun sitesi ya da açıklamayı aktaran haber ajansıdır (AA, TRT Haber, DHA).
const RECENT_SRC = {
  valilik: ["İstanbul Valisi'nin açıklaması: ihbarlar ve hasar (AA, 19 Ekim)", "https://www.aa.com.tr/tr/gundem/istanbul-valisi-gul-istanbulda-selden-etkilenenlerin-zararlari-bugun-odenmeye-baslanacak/4093343"],
  valilikSon: ["İstanbul Valiliği: Can kaybı 7, arama-kurtarma sona erdi (TRT Haber, 20 Ekim)", "https://www.trthaber.com/haber/gundem/istanbulda-sel-nedeniyle-can-kaybi-7ye-yukseldi-960627.html"],
  akom: ["İBB AKOM yağış ölçümleri (AKOM, 15 Ekim)", "https://akom.ibb.istanbul/haberler/aylik-toplam-yagisin-4-kati-bir-gunde-dustu/"],
  kurum: ["Bakan Kurum: 48 toprak kayması, 53 istinat duvarı (TRT Haber, 15 Ekim)", "https://www.trthaber.com/haber/gundem/bakan-kurum-hasar-tespit-calismasi-basladi-960229.html"],
  kocaeliBld: ["Kocaeli Büyükşehir Belediyesi: Yağış ölçümleri ve kapanan yollar (15 Ekim)", "https://www.kocaeli.bel.tr/haber/rekor-yagisa-canla-basla-mucadele-52263.html"],
  gebze: ["Gebze'de sele kapılan cipteki 2 kişi (TRT Haber, 19 Ekim)", "https://www.trthaber.com/haber/gundem/selde-can-kaybi-8e-yukseldi-960500.html"],
  basiskele: ["Başiskele'de sele kapılan kişi (AA, 16 Ekim)", "https://www.aa.com.tr/tr/gundem/kocaelide-saganak-sonucu-kaybolan-kisinin-cesedi-bulundu/4091225"],
  okul: ["Kocaeli, Sakarya ve Yalova'da eğitime ara (TRT Haber / AA, 15 Ekim)", "https://www.trthaber.com/haber/turkiye/6-ilde-egitime-ara-verildi-960217.html"],
  sakarya: ["İçişleri Bakanı'nın Sakarya açıklaması (AA, 16 Ekim)", "https://aa.com.tr/tr/gundem/bakan-ciftci-turuncu-uyari-verilen-illerde-vatandaslarimiz-mumkun-mertebe-evlerinden-disariya-cikmasinlar/4091227"],
  yalova: ["Yalova Valisi'nin açıklaması (DHA, 15 Ekim)", "https://www.dha.com.tr/yerel-haberler/yalova/yalovada-saganak-nedeniyle-sel-sularinda-mahsu-2963578"],
  cinarcik: ["Çınarcık'ta mahsur kalan bekçi kurtarıldı (DHA, 15 Ekim)", "https://dha.com.tr/foto-galeri/yalovada-saganak-nedeniyle-sel-sularinda-mahsur-kalan-bekci-kepceyle-kurtarildi-2963049"],
  mgm: ["Meteoroloji: Ekim'de Marmara'da seller (TRT Haber / AA, 19 Ekim)", "https://www.trthaber.com/haber/turkiye/eylul-ayinda-66-meteorolojik-afet-yasandi-960509.html"],
  demre: ["Antalya Valiliği: Demre'de mahsur kalan 22 kişi kurtarıldı (TRT Haber / AA, 14 Ekim)", "https://www.trthaber.com/haber/turkiye/antalyada-saganak-mahsur-kalan-22-kisi-kurtarildi-960130.html"],
  iski: ["İSKİ verileri: Barajlarda doluluk yüzde 50'yi geçti (AA, 18 Ekim)", "https://www.aa.com.tr/tr/gundem/istanbula-su-saglayan-barajlardaki-doluluk-yuzde-50yi-gecti/4092412"],
  iskiCanli: ["İSKİ baraj doluluk oranları (güncel)", "https://iski.istanbul/baraj-doluluk/"],
  afad: ["AFAD: Sahada 60 bin 395 personel görevde (AA, 17 Ekim)", "https://www.aa.com.tr/tr/gundem/afad-saganakla-mucadele-calismalarinda-60-bin-395-personel-ile-8-bin-927-arac-gorev-yapmaktadir/4091584"],
  kandilli: ["Kandilli Rasathanesi: Son depremler", "http://www.koeri.boun.edu.tr/scripts/lst0.asp"]
};

const RECENT = {
  updated: "21 Ekim 2026",
  // Yeni olayları listenin başına ekleyin. "on": olayın bittiği gün; 30 gün boyunca YENİ olarak işaretlenir.
  events: [
    { id: "w2026_ist", on: "2026-10-15", hz: "sel", y: 2026, date: "14–15 Ekim 2026", t: "İstanbul Selleri", sub: "Sarıyer, Ayazağa", lat: 41.112, lon: 29.015, il: 34,
      loss: "7 kişi",
      text: "13 Ekim'de başlayıp 14 Ekim'de çok şiddetlenen sağanak İstanbul'da dereleri taşırdı; sokakları, alt geçitleri, evleri ve iş yerlerini su bastı. En çok etkilenen yerlerden biri Sarıyer'in Ayazağa Mahallesi'ydi: Bakan Kurum'a göre burada 300 iş yeri ve 200 araç zarar gördü. AKOM'un ölçümlerine göre 13–15 Ekim arasında Beykoz'a metrekareye 277,1, Sarıyer'e 211,8 kilogram yağış düştü. Beykoz'daki miktar 1942'den bu yana ölçülen en yüksek yağış oldu. Bu, İstanbul'un bir Ekim ayı boyunca aldığı ortalama yağışın (66,3 kg) 4 katından fazla! Vali'nin açıklamasına göre yaklaşık 19 bin 300 ihbar geldi; kabaca 3 bin ev ve iş yeri ciddi hasar gördü. Bakan Kurum'a göre kentte 48 heyelan oldu, 39 ilçede 53 istinat duvarı yıkıldı.",
      lesson: "Dereler taştığında eski yataklarını geri ister. Dere yataklarına ve kenarlarına bina yapılmamalı; su basmış yollara ve alt geçitlere asla girilmemeli.",
      src: [RECENT_SRC.valilikSon, RECENT_SRC.valilik, RECENT_SRC.akom, RECENT_SRC.kurum] },
    { id: "w2026_kocaeli", on: "2026-10-15", hz: "sel", y: 2026, date: "14–15 Ekim 2026", t: "Kocaeli'de Sel", sub: "Başiskele, Kartepe, Gebze", lat: 40.70, lon: 29.96, il: 41,
      loss: "3 kişi",
      text: "Sağanak Kocaeli'de de dereleri taşırdı. 14 Ekim akşamından 15 Ekim akşamına kadar Kartepe'ye metrekareye 214,9, Başiskele'ye 197,8 kilogram yağış düştü. D-130 kara yolundaki Seymen Tüneli'ni su bastı; Seymen'de ve Gebze'de suların arasında mahsur kalan 7 kişi kurtarıldı. Ne yazık ki Gebze'de sele kapılan bir cipteki 2 kişi ile Başiskele'de aracıyla sele kapılan 1 kişi hayatını kaybetti. Valilik okulları 15 ve 16 Ekim'de tatil etti.",
      lesson: "Su basmış yollara ve alt geçitlere araçla girilmemeli. Yalnızca 60 cm su bir otomobili sürükleyebilir!",
      src: [RECENT_SRC.kocaeliBld, RECENT_SRC.gebze, RECENT_SRC.basiskele, RECENT_SRC.okul] },
    { id: "w2026_akcakese", on: "2026-10-15", hz: "heyelan", y: 2026, date: "15 Ekim 2026", t: "Kandıra Yolunda Heyelan", sub: "Kocaeli, İzmit–Kandıra yolu", lat: 41.0, lon: 30.05, il: 41,
      text: "14 Ekim gecesi başlayıp ertesi gün boyunca süren yağmurdan sonra yamaçlardan kayan toprak, İzmit ile Kandıra arasındaki D-605 kara yolunu iki yönde de trafiğe kapattı. Araçlar Akçakese–Pirceler köy yolundan yönlendirildi. Yuvacık Barajı yolunda da toprak kayması oldu ve 24 kişi tahliye edildi. Aynı yağışlarla İstanbul'da da 48 heyelan yaşandı.",
      lesson: "Yağmur suyu toprağı ağırlaştırır ve kaygan hâle getirir. Şiddetli yağışlardan sonra yamaçların altındaki yollarda dikkatli olunmalı, heyelan alanına yaklaşılmamalı.",
      src: [RECENT_SRC.kocaeliBld, RECENT_SRC.kurum] },
    { id: "w2026_sakarya", on: "2026-10-15", hz: "sel", y: 2026, date: "14–15 Ekim 2026", t: "Sakarya Selleri", sub: "Ferizli, Karasu", lat: 41.10, lon: 30.69, il: 54,
      text: "Sakarya'da da sel ve su baskınları yaşandı. İçişleri Bakanı'nın açıklamasına göre Ferizli'ye metrekareye 275, Karasu'ya 224 kilogram yağış düştü. 865 kişi güvenli yerlere tahliye edildi; 2 yapı ve 5 köprü yıkıldı. Tarlalar zarar gördü, bazı yerlerde elektrik ve su kesildi. Okullar iki gün tatil edildi.",
      lesson: "Yetkililer tahliye dediğinde vakit kaybetmeden uymak hayat kurtarır.",
      src: [RECENT_SRC.sakarya, RECENT_SRC.okul] },
    { id: "w2026_yalova", on: "2026-10-15", hz: "sel", y: 2026, date: "14–15 Ekim 2026", t: "Yalova'da Su Baskınları", sub: "Çınarcık, Armutlu", lat: 40.52, lon: 28.83, il: 77,
      text: "Sağanak Yalova'da da etkili oldu; Armutlu'da bazı yolları su kapladı. Vali'nin açıklamasına göre il genelinde 101 ihbar geldi ve 8 kişi güvenli yerlere taşındı. Çınarcık'ta dere yatağına yakın 5 katlı bir binanın temelinde sorun görülünce, binada yaşayan 28 kişi tedbir amacıyla tahliye edildi. Esenköy'de su basan bir arıtma tesisinde mahsur kalan bekçi, kepçeyle kurtarıldı. Okullar 15 ve 16 Ekim'de tatil edildi.",
      lesson: "Sel sırasında yüksek ve güvenli bir yerde kal, kurtarma ekiplerini bekle. Akan suyun içinden geçmeye çalışma.",
      src: [RECENT_SRC.yalova, RECENT_SRC.cinarcik, RECENT_SRC.mgm] },
    { id: "w2026_demre", on: "2026-10-14", hz: "sel", y: 2026, date: "14 Ekim 2026", t: "Demre'de Sel", sub: "Antalya", lat: 36.245, lon: 29.985, il: 7,
      text: "Antalya'nın Demre ilçesinde sağanak taşkına yol açtı. Valiliğin açıklamasına göre Çevreli Mahallesi'ndeki bir okulda mahsur kalan 13 öğrenci ve 7 öğretmen ile bir serada mahsur kalan 2 kişi; AFAD, emniyet, jandarma ve belediye ekiplerinin müdahalesiyle güvenli yerlere ulaştırıldı. Herkesin sağlık durumu iyiydi. Belediye başkanına göre Çevreli'deki seraların yaklaşık yüzde 70'i zarar gördü.",
      lesson: "Sel sırasında sakin kal; öğretmenlerinin ve kurtarma ekiplerinin söylediklerine uy. Yüksek ve güvenli bir yerde yardımı bekle.",
      src: [RECENT_SRC.demre] },
    { id: "w2026_baraj", on: "2026-10-18", hz: "kuraklik", y: 2026, date: "14–18 Ekim 2026", t: "İstanbul Barajları Doldu", sub: "4 günde 14 puan arttı", lat: 41.07, lon: 29.36, il: 34,
      text: "İSKİ verilerine göre İstanbul barajlarının doluluk oranı 14 Ekim'de yüzde 38,06'ydı. Şiddetli yağışlardan sonra yalnızca 4 gün içinde, 18 Ekim'de yüzde 52,43'e yükseldi. Geçen yıl aynı gün bu oran yüzde 24,51'di.",
      lesson: "Aynı yağmur hem sele yol açtı hem de barajları doldurdu. Yine de su kaynaklarımız sınırlı: Suyu her zaman idareli kullanmalıyız.",
      src: [RECENT_SRC.iski, RECENT_SRC.iskiCanli] }
  ],
  lessons: [
    "Dere yataklarına ve kenarlarına bina yapılmamalı. Dereler taştığında eski yataklarını geri ister.",
    "Su basmış yollara, alt geçitlere ve akan suya asla girme. 15–20 cm hızlı akan su bir insanı devirebilir, 60 cm su bir otomobili sürükleyebilir.",
    "Sel sularında elektrik tehlikesi vardır: Kopmuş tellere ve elektrik direklerine yaklaşma.",
    "Meteorolojinin turuncu uyarılarını ciddiye al; gerekmedikçe dışarı çıkma.",
    "Her gün onlarca küçük deprem olur ve çoğunu hissetmeyiz. Hazırlıklı olmak her zaman önemli!"
  ],
  // Olaylarda geçmeyen genel kaynaklar
  sources: [RECENT_SRC.afad]
};
