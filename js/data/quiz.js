// Türkiye Afet Haritası · Bilgi yarışması soruları ve unvanlar
'use strict';

// ------------------------------------------------------------------ bilgi yarışması
// Çoktan seçmeli sorularda doğru cevap her zaman ilk seçenektir; seçenekler oyunda karıştırılır.
// Harita sorularında "map": doğru illerin plaka kodları ya da quizValid() içindeki adlandırılmış bir küme.
const QUIZ = [
  { q: "Deprem anında yakınında sağlam bir masa varsa ne yapmalısın?",
    a: ["Çök, kapan, tutun: Masanın altına girip başımı korur, masaya tutunurum", "Hemen merdivenlere koşarım", "Balkona çıkarım", "Asansörle aşağı inerim"],
    ex: "Deprem anında koşmak, merdivenleri ya da asansörü kullanmak tehlikelidir. Doğru hareket: ÇÖK, KAPAN, TUTUN!" },
  { q: "Türkiye'de tüm acil durumlar için hangi numarayı aramalısın?", a: ["112", "911", "199", "100"],
    ex: "112 Acil Çağrı Merkezi ambulans, itfaiye, polis, jandarma, AFAD ve orman yangını ihbarı için tek numaradır. 911 ise ABD'de kullanılır." },
  { map: "kaf", faults: true, q: "Haritada Kuzey Anadolu Fay Hattı'nın geçtiği illerden birine dokun.", hint: "İpucu: Kalın kırmızı çizgiyi takip et.",
    ex: "Kuzey Anadolu Fayı; Bingöl, Erzincan, Tokat, Amasya, Çorum, Kastamonu, Çankırı, Bolu, Düzce, Sakarya ve Kocaeli gibi illerden geçer ve Marmara Denizi'nin altından Saros Körfezi'ne uzanır." },
  { q: "Türkiye hangi deprem kuşağı üzerinde yer alır?", a: ["Alp-Himalaya Deprem Kuşağı", "Pasifik Ateş Çemberi", "Atlas Okyanusu Ortası Sırtı", "Doğu Afrika Rift Vadisi"],
    ex: "Türkiye, Avrupa'dan Asya'ya uzanan Alp-Himalaya Deprem Kuşağı üzerindedir. Pasifik Ateş Çemberi ise Japonya ve Şili gibi ülkeleri içine alır." },
  { q: "Deprem sırasında sokaktaysan ne yapmalısın?",
    a: ["Binalardan, ağaçlardan ve elektrik tellerinden uzak, açık bir alana geçerim", "Hemen en yakın binanın içine koşarım", "Bir binanın duvarının dibine sığınırım", "Bir elektrik direğine sıkıca tutunurum"],
    ex: "Sarsıntı sırasında binalardan cam ve sıva parçaları düşebilir, ağaçlar ve direkler devrilebilir. Açık bir alana geç, çök ve başını, enseni kollarınla koru." },
  { q: "Orman yangınlarının büyük çoğunluğunun nedeni nedir?", a: ["İnsanların dikkatsizliği ve ihmali", "Yıldırım düşmesi", "Volkan patlamaları", "Depremler"],
    ex: "Sigara izmaritleri, piknik ateşleri, anız yakma gibi insan kaynaklı nedenler orman yangınlarının büyük çoğunluğunu oluşturur." },
  { q: "Bir yangının çıkması için gereken üç şeye “yangın üçgeni” denir. Bunlar hangileridir?", a: ["Isı, yakıt ve oksijen", "Su, toprak ve hava", "Rüzgâr, yağmur ve güneş", "Duman, kül ve kıvılcım"],
    ex: "Yangın için ısı, yakıt (kuru ot, dal, yaprak) ve oksijen gerekir. Bunlardan biri ortadan kalkınca yangın söner: Su ısıyı düşürür, üstüne atılan toprak oksijeni keser." },
  { map: [46], q: "6 Şubat 2023'teki iki büyük depremin merkez üssü olan ile dokun.",
    ex: "Depremlerin merkez üsleri Kahramanmaraş'ın Pazarcık (7,7) ve Elbistan (7,6) ilçeleriydi." },
  { q: "Kıyıdayken deniz suyu aniden çekilirse ne yapmalısın?", a: ["Hemen kıyıdan uzaklaşıp yüksek bir yere çıkarım", "Ortaya çıkan deniz kabuklarını toplarım", "Fotoğraf çekmek için beklerim", "Denize girip yüzerim"],
    ex: "Denizin aniden çekilmesi tsunaminin habercisi olabilir. Hiç beklemeden yüksek bir yere çık!" },
  { q: "Tsunami ile ilgili aşağıdakilerden hangisi doğrudur?",
    a: ["Tsunami tek bir dalga değildir; dalgalar saatlerce gelebilir", "İlk dalga geçince kıyıya dönmek güvenlidir", "Türkiye'nin kıyılarında hiç tsunami görülmez", "Tsunami açık denizde çok yavaş ilerler"],
    ex: "Tsunami bir dalga dizisidir; sonraki dalgalar ilkinden büyük olabilir. Açık denizde bir uçak kadar hızlı ilerler. 1999 Gölcük ve 2020 İzmir (Sisam) depremlerinde kıyılarımızda küçük tsunamiler oluştu." },
  { q: "Afet ve acil durum çantası en az ne kadar süre yetecek şekilde hazırlanmalı?", a: ["3 gün (72 saat)", "1 gün", "1 hafta", "1 ay"],
    ex: "Afetten sonraki ilk 72 saat çok önemlidir. Çantan en az 3 gün yetecek malzeme içermeli." },
  { q: "Heyelanlar en sık hangi bölgemizde görülür?", a: ["Karadeniz Bölgesi", "İç Anadolu Bölgesi", "Güneydoğu Anadolu Bölgesi", "Ege Bölgesi"],
    ex: "Karadeniz'de yamaçlar dik, yağış boldur. Bu iki etken heyelan riskini çok artırır." },
  { q: "Bir yamaçtan toprak kaymaya başladı. Kayan kütleden nasıl uzaklaşmalısın?", a: ["Kayma yönüne dik olacak şekilde yana doğru", "Kayma yönünde yokuş aşağı koşarak", "Yamaçtan yukarı tırmanarak", "Olduğum yerde bekleyerek"],
    ex: "Kayan toprak yokuş aşağı senden hızlı ilerleyebilir. Kütlenin yolundan, hareket yönüne dik olacak şekilde yana doğru hızla uzaklaş. Vadilerden ve dere yataklarından da uzak dur." },
  { map: [53], q: "Türkiye'nin en çok yağış alan iline dokun.", hint: "İpucu: Doğu Karadeniz'de, Trabzon ile Artvin arasında.",
    ex: "Rize yılda 2.000 milimetreden fazla yağış alır. Dik ve dar vadilerde yağmur suları çok hızlı toplandığı için sel ve heyelan riski yüksektir." },
  { q: "7 büyüklüğündeki bir deprem, 6 büyüklüğündekinden yaklaşık kaç kat fazla enerji açığa çıkarır?", a: ["Yaklaşık 32 kat", "Yaklaşık 2 kat", "Yaklaşık 10 kat", "Aynı enerjiyi"],
    ex: "Büyüklük 1 arttığında açığa çıkan enerji yaklaşık 32 kat artar. 6'dan 8'e çıkınca bu fark yaklaşık 1.000 kata ulaşır!" },
  { q: "Enkaz altında kalan biri, sesini kurtarma ekiplerine en iyi nasıl duyurabilir?", a: ["Düdük çalarak ya da borulara, duvara vurarak", "Durmadan bağırarak", "Kibrit ya da çakmak yakarak", "Hiç ses çıkarmadan bekleyerek"],
    ex: "Bağırmak enerjini çabuk tüketir ve toz yutmana yol açar. Düdük sesi ve borulara vurmak uzaklara ulaşır; bu yüzden afet çantasında bir düdük olmalı! Kibrit ve çakmak ise gaz kaçağı varsa yangına yol açabilir." },
  { map: [41], q: "17 Ağustos 1999'daki Gölcük (Marmara) depreminin merkez üssünün bulunduğu ile dokun.", hint: "İpucu: İzmit Körfezi'nin çevresine bak.",
    ex: "7,4 büyüklüğündeki deprem Kocaeli'nin Gölcük ilçesi yakınlarında oldu; Kuzey Anadolu Fayı yaklaşık 150 km boyunca kırıldı. Bu depremden sonra zorunlu deprem sigortası başladı ve 2009'da AFAD kuruldu." },
  { q: "“Obruk” nedir?", a: ["Yer altındaki boşlukların çökmesiyle oluşan derin çukur", "Bir volkan türü", "Kurumuş bir nehir yatağı", "Kıyıdaki sarp kayalık"],
    ex: "Konya Kapalı Havzası'nda yer altı suyunun aşırı çekilmesi yeni obrukların oluşmasına yol açıyor." },
  { q: "Sel sırasında aşağıdakilerden hangisi YANLIŞ bir davranıştır?", a: ["Akan suyun içinden yürüyerek karşıya geçmek", "Yüksek bir yere çıkmak", "Elektrik tellerinden uzak durmak", "Yetkililerin uyarılarına uymak"],
    ex: "Sadece 15 cm derinliğindeki hızlı akan su bile bir insanı yere düşürebilir. Akan suya asla girme!" },
  { map: "cig3", q: "Çığ riskinin yüksek olduğu illerden birine dokun.", hint: "İpucu: Doğu Anadolu'nun yüksek dağlarını düşün.",
    ex: "Hakkari, Van, Bitlis, Muş, Bingöl, Erzurum, Erzincan, Tunceli ve Şırnak ile Rize, Artvin, Gümüşhane ve Bayburt çığ riskinin yüksek olduğu illerdendir." },
  { q: "Türkiye'nin en büyük gölü olan Van Gölü nasıl oluştu?", a: ["Nemrut volkanından çıkan lavların bir vadinin önünü kapatmasıyla", "Bir göktaşının çarpmasıyla", "Bir buzulun erimesiyle", "İnsanlar tarafından baraj gölü olarak yapıldı"],
    ex: "Van Gölü bir volkanik set gölüdür. Nemrut Dağı'nın lavları suların aktığı vadiyi kapatmış ve göl oluşmuştur." },
  { q: "Kapadokya'nın ünlü peribacaları nasıl oluştu?",
    a: ["Volkan küllerinden oluşan yumuşak kayacın rüzgâr ve yağmurla aşınmasıyla", "Bir depremde yerden fışkıran kayalarla", "İnsanların kayaları yontmasıyla", "Bir buzulun eriyip çekilmesiyle"],
    ex: "Erciyes, Hasan Dağı ve Göllüdağ gibi volkanların küllerinden yumuşak bir kayaç (tüf) oluştu. Yağmur ve rüzgâr bu kayacı uzun süre boyunca aşındırarak peribacalarını şekillendirdi." },
  { map: [7], q: "2021'de ülkemizin en büyük orman yangınlarından birinin yaşandığı Manavgat hangi ildedir? Haritada o ile dokun.", hint: "İpucu: Akdeniz kıyısında, turizmiyle ünlü bir il.",
    ex: "Manavgat, Antalya'nın bir ilçesidir. 28 Temmuz 2021'de başlayan yangın kuvvetli rüzgâr ve yüksek sıcaklıkla hızla yayıldı ve yaklaşık 10 gün sürdü. Yaklaşık 60 bin hektar alan zarar gördü." },
  { q: "Aşağıdakilerden hangisi deprem öncesinde yapılması gereken bir hazırlıktır?", a: ["Dolap ve kitaplıkları duvara sabitlemek", "Ağır eşyaları dolapların üstüne koymak", "Yatağı büyük bir pencerenin hemen altına koymak", "Kapı önlerine eşya yığmak"],
    ex: "Sabitlenmemiş eşyalar deprem sırasında devrilerek yaralanmalara ve kaçış yollarının kapanmasına yol açabilir." },
  { map: "ege3", q: "Ege Bölgesi'nde deprem tehlikesi yüksek olan illerden birine dokun.",
    ex: "İzmir, Manisa, Aydın, Denizli, Muğla, Kütahya ve Afyonkarahisar, Ege'de deprem tehlikesinin yüksek olduğu illerdendir. Ege'de yer kabuğu gerildiği için çok sayıda fay vardır." }
];
// [doğru cevap oranı, unvan, sonuç mesajı]: eşikler soru sayısına göre hesaplanır, soru eklenince değiştirmek gerekmez.
const RANKS = [
  [.9, "Afet Bilinci Uzmanı", "Muhteşem! Afetler hakkında gerçekten çok şey biliyorsun. Bildiklerini ailenle de paylaş!"],
  [.75, "Afet Bilinci Elçisi", "Çok iyi! Afetlere karşı bilinçli bir öğrencisin. Birkaç konuya daha göz atarsan tam puan senin!"],
  [.5, "Afet Gönüllüsü", "Güzel! Haritayı biraz daha keşfedip yeniden denersen puanın kesinlikle artacak."],
  [0, "Afet Çırağı", "İyi bir başlangıç! Afet türlerini haritada inceleyip yeniden dene."]
];
