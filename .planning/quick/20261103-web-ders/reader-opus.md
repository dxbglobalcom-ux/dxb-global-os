# Okuyucu "opus": web işi linkleri (31 satır)

Satırlar: `rows/opus.jsonl`. c01-c11 önceki okuyucunun, d01-d21 benimdir. Bu rapor 31 satırın hepsini kapsar. c satırlarının yargısını ben yeniden üretmedim, kayıttan aldım.

## Kısa cevap

Otuz bir linkin çoğu liste ya da "yorum yaz, linki atayım" kapısı. İşe yarayan beş şey var:

1. **d21, Dave Davies'in ikinci beyin yazısı.** B84'ün aylık SEO işinin iskeleti.
2. **d07, NET-A-PORTER.** Lüks mağaza paketinin ölçüsü.
3. **d11, SEO + GEO Autopilot döngüsü.** Aylık ürünün teslim biçimi. Düzeltilerek alınır.
4. **c02 ve c10, yayın ve kabul kapıları.** Site ustasının eline hemen verilir.
5. **d09'daki claude-ads ve d01'deki Meta Ads MCP.** Reklam işinin okuma eli.

Onun sorusuna cevap: bu linklerden SEO öğrenilmez. c01, c11 ve d02 onun "yüzeysel" dediği şeyin kendisidir. Derin bilgi `tracks/` izlerinde duruyor. Linklerin değeri yöntem ve alet göstermelerinde.

## Önemli olanlar ve sebepleri

**d21 (holding 3, Dene).** İncelediğim d satırları içinde kendi ölçümünü ve kendi başarısızlığını açıkça yazan tek uygulayıcı yazısı bu. Sistem Git'te Markdown ve JSON'dur. Çıktı UNREVIEWED etiketiyle gelir, onayı insan verir. Düzeltme testle beceriye işlenir. Her aşama kendi sonucunu yazar, yarım kalan koşu başarı diyemez.

Ölçüsü küçüktür: 20 istekte doğru kaynağın ilk üçe girmesi 14'ten 20'ye çıkmış. Sıralama ya da gelir artışı söylemiyor. Sabah teslimi iki kez sessizce durmuş, bunu da kendisi yazıyor. "Günde saatler kazanıyorum" onun sözüdür, bizde ölçülür. Tahtada ve `B84.md`'de müşteri hafızası araması sonuç vermedi, yani B84'e girdi olarak değerli. Deneme tek örnek müşteri ve iki beceriyle yapılır. Ölçü, düzeltmelerin kaçının sonraki işte tuttuğudur.

**d07 (holding 3, Araştır).** Mağaza dergi gibi kurulmuş. Çekim ve yayın dili önde, satış arkada. Kapak röportajı "Read the interview & shop the shoot" ile mağazaya bağlanıyor. Ürün metni stilist sesiyle yazılmış, "Shown here with" kombini satıyor. Yenilik sayacı canlı: 3 Kasım'da 703, 4 Kasım'da 653.

Örnek alınmayacak yerler: ana sayfada altı h1 var, üçüncü taraf izleyici yükü ağır, konum kutusu telefonda ekranın büyük bölümünü kapatıyor. Satılacak cümle "içerikle satan mağaza"dır: çekim, yayın ve mağaza birlikte, B84 ile B43 ortak. Güzel mağaza kârlı demek değildir. Grubun FY26 üçüncü çeyreği sabit kurda yatay kaldı, müşteriye "bu site para basıyor" denmez. Sayfa ham kaynağı, robots.txt ve saha hız verisi alınamadı (aşağıda).

**d11 (holding 2, Dene).** Değeri döngüdür: denetle, teşhis et, düzelt, yeniden denetle, haftalık grafik. Beceri adları `claude-seo` klasörleriyle aynı. Rehberin bu paket olması güçlü çıkarım, kanıt değil. Kapalı rehber okunamadı.

Olduğu gibi satılmaz. FAQ şemasını yüksek önemde gösteriyor, oysa Google bu zengin sonucu Mayıs 2026'da kaldırdı. llms.txt yokluğunu atlanma sebebi sayıyor, buna dayanak yok. "Cited 3/5" tek koşudur, tekrarlı ölçüm ister. "Asked/mo" hacimlerinin kaynağı görülmedi.

**c02, c10 (holding 2, Kur).** Kurulacak şey alet değil, istem ve liste. c02 yapay zekâyla kurulan sitelerin gerçek hastalığını tarif ediyor: boş HTML, herkese aynı canonical, sahte 404. c10 başka kullanıcının verisi, kupon ve ödeme kırılmalarını tutuyor. İkisi B84'ün yayın ve kabul kapısına girer.

**d09 (holding 2, Kur, yalnız claude-ads).** Listeden çıkan tek gerçek kazanç budur. Dışa aktarımdan okur, hesaba dokunmaz, pass, fail, unknown, not_applicable verir. Ücretsiz reklam denetimi satış kapısı olur. W096 "Kur" demiş ama diskte yok. W096'daki canlı hesap ve puan anlatımı README'ye göre düzeltilmeli.

**d01 (holding 2, Araştır).** Post sığ, yön gerçek. Listede adı geçmeyen resmî Meta Ads MCP (`mcp.facebook.com/ads`) önce denenmeli, AdAdvisor ücretli yedek durur. Yazma izni para çıkışıdır, CEO kapısında kalır, önce yalnız okuma.

**d03, d14, d16, d17 (holding 2, Dene).**
- **d03 Pomelli:** siteden marka DNA'sı çıkarma adımı iyi fikir, ücretsiz deneme kolay.
- **d14:** üretilen sayfayı yerel Gutenberg bloğu olarak teslim etme yolu gerçek. Etkileşimin dönüşümden sağ çıkıp çıkmadığı sınanmalı, video görülemedi.
- **d16:** toplu ürün reklamı gerçek ihtiyaç, ama "10 kat ucuz" grafiği Codex ile Claude'u değil MCP ile CLI'ı karşılaştırıyor.
- **d17:** aday listesi para yoludur, elimizdeki Scrapling yeter, Hermes gerekmez. Kayıt doğruluğu ölçülmeden liste sayılmaz.

**c04, c05, c09, d10.**
- **c04 Agentation:** tıkla-not ile revizyon turunu kısaltır, onun onay tıkı çalışma biçimine oturur.
- **c05 ARM:** formdan sonraki ilk dakikayı satan gelir fikri. Gördüğümüz bir sunum demosu, ürün bulunamadı.
- **c09:** sitenin bir işlevini ChatGPT içinde çalıştırmak, AEO'nun alıntıdan kullanıma geçtiği yer. Dizin yayını kimlik adımı ister.
- **d10:** listeden marketingskills ve claude-seo aday. Ortak `product-marketing` bağlam düzeni B84'e alınır.

## Geri kalanlar

| Satır | Ne | Hüküm |
|---|---|---|
| c01, c11, d02 | Başlangıç listeleri, kaynaksız | Gerek yok; c01 ve d02'de resmî kaynakla çelişen ya da dayanaksız yerler satırda yazılı |
| c03 | Reddit'ten pazar araştırması istemi | Gerek yok; küçük bir alışkanlık |
| c07 | "Ücretsiz ikiz" depo listesi | Gerek yok; OpenSEO ve Chatwoot zaten kayıtlı |
| c06, c08 | Ses ve film listeleri, konu dışı | İzle; B43 |
| d05 | Beş oturum deposu, konu dışı | Gerek yok |
| d06 | Oturum becerileri, konu dışı | İzle; stop-slop ve MLflow'un beceri sınama yöntemi küçük değer |
| d13 | Uzun oturum faturası dersi | Gerek yok; bizde ölçülü ve yazılı |
| d15 | Altı ücretsiz site dizini | Gerek yok; müşteri verisi bu sitelere girmez |
| d18 | UI-TARS Desktop, konu dışı | İzle; operator bu işi görüyor |
| d19 | OpenMontage, konu dışı | Gerek yok; kurulu, kopya 18 Ağustos'ta kalmış (B42) |
| d20 | Portekizce berber reeli | Gerek yok; web işiyle bağı yok |
| d08, d12 | Gönderilere erişilemedi | Puan verilmedi; 0 bilinmezlik demektir |

Öneri dağılımı: Kur 3, Dene 9, Araştır 3, İzle 4, Gerek yok 12.

## Her aletin gerçek değeri

| Alet | Gerçek mi | Değeri | Karar |
|---|---|---|---|
| claude-ads | MIT, 10.726★ | Reklam denetimi, satış kapısı | Rafa kur; ikizi Optmyzr, Adalysis (fiyat okunmadı) |
| Meta Ads MCP | Meta'nın kendi sunucusu, açık beta | Ajans işinin eli | Önce yalnız okuma dene; yazma CEO'da |
| AdAdvisor MCP | Ürün gerçek; ücretsiz, 19,99 / 49,99 / 89,99 $/ay; taslak onayı var | Meta sunucusunun ücretli yedeği | Yedekte dursun; "Official Meta Tech Partner" kendi sözü |
| google-analytics-mcp | Apache-2.0, 3.631★ | Rapor okuma | Ortak MCP adayı; ikizi Plausible Stats API |
| Shopify AI Toolkit | MIT, 627★ | Shopify geliştirme bilgisi | Shopify işi gelince; ikizi WooCommerce mcp-adapter |
| Higgsfield CLI ve MCP | CLI MIT, 694★; üretim ücretli kredi | Ücretli yedek; yerelde çalışmaz | Maliyet denemesi; açık ikizi Media Studio |
| Pomelli | Google Labs, deneysel; Türkiye listede, yalnız İngilizce | Teklif öncesi örnek | Dene; kapanabilir |
| marketingskills | MIT, 58.390★ | CRO, SEO, metin iş bilgisi | 3-4 beceri dene; fonlayan satıcılar var |
| claude-seo ve OpenSEO | claude-seo MIT, 26.460★; OpenSEO rafta | Aynı işi görüyorlar | Aynı sitede karşılaştır, biri kalsın |
| Agentation | PolyForm Shield, 5.253★ | Revizyon döngüsü | Dene; React ister |
| TestSprite | CLI Apache-2.0, bulut ücretli | Kabul testi | Dene; açık ikizi Playwright + ajan |
| Scrapling | BSD-3, 95.560★ | Aday bulma | Kurulu; ücretli ikizi Apify, Apollo |
| Hyperframes | Apache-2.0, 78.591★ | HTML'den video | B43 için aday; W025, EK09'da kayıtlı |
| stop-slop, humanizer | MIT | Metin kontrolü | İzle; ikisi aynı iş |
| n8n-mcp | MIT, 23.199★ | n8n kurulu değil | Gerek yok |
| UI-TARS Desktop | Apache-2.0, 39.542★; model ayrıca gerekir | operator'ın benzeri | İzle |

Hiçbiri kurulmadı. Hesap açma, kredi satın alma ve reklam yazma izni CEO kapısındadır.

## CEO'nun kararına kalan satırlar

- **AutoHedge, Vibe-Trading (d09):** işlem yapan finans ajanları. Faiz, spekülasyon ve garar yönü İslami sınıra değiyor. Önermiyorum, karar onun.
- **/last30days (d06):** Polymarket bahis oranlarını kaynak sayıyor. Kullanılırsa o kaynak kapalı tutulmalı.
- **Yapay UGC (d16):** gerçek olmayan kişinin ürünü kullanmış gibi anlatması aldatıcı tanıklık sayılabilir. Kaynağı bu okumada açılmadı, hukuk sorusu.

## Çelişki ve düzeltmeler

- **Brif ile CEO emri çelişti.** Brif her adı geçen depoyu açmayı istiyor. LITERATURE.md satır 13, onun 27 Ağustos 2026 emriyle `superpowers` ve `gstack`'i dışlıyor ve yeniden etüt edilmemelerini yazıyor. Emri üstün tuttum, d05 ve d10'da değerlendirme yazmadım. Dışlamayı görmeden önce ikisinin verisini çekmiş, `superpowers` README'sinin başını okumuştum. İlk d05 satırım okunmaya değer demişti, o yargıyı sildim.
- **W096 düzeltilmeli.** "Kur" denmiş, alet diskte yok, anlatımı da eski.
- **d10'daki yıldız sayıları tutmuyor.** Aynı depo görsellerde farklı, gerçek sayı ayrı. Listenin "Everything tested" sözüne güvenilmez.

## Görülemeyenler

- **d08, d12:** yt-dlp boş yanıt verdi, giriş yapılmış sayfa "Sorry, this page isn't available" dedi, embed kırık çıktı. Kaldırılmış mı gizli mi, bilinmiyor. Hesap adı olmadığı için yeniden yüklemesi aranamadı.
- **d14:** YouTube görüntüyü reddetti, görüntü lider tarafından CEO'nun Chrome'unda açılmalı. Konuşma tam okundu.
- **d15:** transkript iki kez başarısız oldu, yalnız ekran okundu.
- **d07:** curl ve başsız Playwright 403 aldı. Gizli Chrome anahtar kasası kilitli diye durdu; kasayı yalnız CEO'nun parolası açar, dokunulmadı. PageSpeed günlük kotası doldu. Bu yüzden ham HTML, robots.txt, saha hız verisi ve sepet-ödeme yok. Yapay zekâ tarayıcılarının bu duvarda ne gördüğü GEO için açık soru.
- **d11:** DM ile verilen rehber kapalı, yalnız ekranda görünen bölümü okundu.
- **d10:** sahibi yazılmayan üç depo aranıp bulunamadı.
- **d21:** yazarın halka açık schema becerisi bulunamadı.
- **d13, d20:** konuşma tam, görüntü örneklendi.
