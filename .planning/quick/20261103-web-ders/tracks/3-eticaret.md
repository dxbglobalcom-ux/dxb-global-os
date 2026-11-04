# E-ticaret ve alışveriş siteleri — dünya seviyesi çalışma (3 Kasım 2026)

Sayılar kaynağıyla yazılmıştır. "Ölçtük" diyen satırlar bu çalışmada açıldı: gerçek kullanıcı verisi PageSpeed Insights sayfasından (CrUX, mobil, 28 gün) okundu; sayfa ağırlıkları gizli Chrome'da 390 px, tek koşu, kısıtlamasız ölçüldü, yani saha verisi değil, karşılaştırma verisidir.

## 1. Özet

1. CEO'nun "hepsi mükemmel yapılıyor" sözü ölçümde tutmuyor: sekiz büyük mağazanın yalnız ikisi (Apple, SSENSE) mobil Core Web Vitals'ı geçiyor; Baymard'a göre ödeme akışı sitelerinin %59'u "orta veya altı", yalnız %2'si "iyi". Çıta yüksek ama çoğu büyük marka da bu çıtada değil; rekabet burada kazanılır.
2. Büyük marka yavaş kalabilir, çünkü talebi hazırdır. Müşterimizin böyle bir yastığı yok; onun için hız ve ödeme kalitesi doğrudan gelirdir.
3. Varsayılan platform Shopify'dır: Web Almanac 2025'te iyi CWV oranı Shopify %76, WooCommerce %35, Magento %35. Bu eşleştirilmiş deney değildir; WooCommerce iyi yapılırsa geçer, ama emek ister.
4. Lüks ve üst segment özel ön yüzle çalışıyor (Gucci, Nike, SSENSE Next.js; LV, Prada Nuxt; Hermès, Mytheresa Angular). Headless bir hız garantisi değil, bir kontrol satın almasıdır; maliyeti ekip ve bakımdır.
5. Wow'un yeri kampanya ve hikâye katmanıdır. Sekiz mağazanın liste sayfasında, kaydırmadan, sıfır video ölçtük; Apple 33.850 piksellik sayfada 14 videoyu `preload=none` ile taşıyor.
6. En ucuz kusur en sık kusurdur: Mytheresa CLS 0,86, Hermès 0,78, LV 0,23. Sabit en-boy oranı bunu bedavaya çözer.
7. Ajan ticaretinde keşif canlı, ajanın kendi başına ödemesi dar. OpenAI 24 Mart 2026'da Instant Checkout'tan geri çekildi; Google UCP canlı ama kapılı; Shopify'da varsayılan yol alıcıyı mağazaya devretmektir.
8. Ajanlar için en değerli iş protokol değil, temiz ürün verisidir. Küçük müşteriye "UCP entegrasyonu" satmak bugün havadır; Shopify'da bu zaten hazır gelir.
9. Stripe ve Shopify Payments Türkiye ve Suudi Arabistan'da işletme açmıyor; Paddle ve Stripe Managed Payments fiziksel ürün satmıyor. Elimizdeki `PLATFORMS.md` bu iki noktada düzeltilmeli.
10. WooCommerce MCP hâlâ developer preview; 11.3'te eski uç nokta ve araç adları kaldırıldı. B30 kartımız eskidir ve yazmaları kapı arkasında tutmak doğru karardır.

## 2. Kanıt durumu

| İddia | Güç | Kaynak ve tarih |
|---|---|---|
| Sepet terk ortalaması %70,22 | Derleme (50 çalışma, 2006–2025); tek mağaza ölçümü değil | Baymard, 22 Eyl 2025 |
| Terkin bir numaralı nedeni ek maliyet, %40 (Baymard'ın eski sayfası %48 diyor; güncel liste geçerli) | Kontrollü anket | Baymard liste sayfası, 22 Eyl 2025 |
| Ödeme akışı düzeltilirse dönüşüm +%35,26 | Satıcı iddiası: denetim satan kurumun tahmini, A/B değil | Baymard |
| Ödeme akışında 23,48 öğe var, ideali 12–14 | Kontrollü ölçüm | Baymard |
| Vodafone: LCP %31 iyileşti, satış %8 arttı | Kontrollü A/B, tek şirket, 50/50 ücretli trafik | web.dev, 17 Mar 2021 |
| Rakuten 24: dönüşüm +%33, ziyaretçi başı gelir +%53 | A/B ama tek açılış sayfası, bir ay; büyüklük genellenmez | web.dev, tarihsiz |
| 0,1 sn hız = perakendede +%8,4 dönüşüm | Satıcı iddiası: Google siparişi, ilişki ölçümü | Deloitte, 24 Mar 2020 |
| "100 ms = %1 satış (Amazon)" | Efsane sınıfı: yıllar önceki bir sunum sözü; hakemli yayın göremedik, bu turda kaynak açılmadı | — |
| Shopify %76, WooCommerce %35, Magento %35 iyi CWV (mobil) | Saha ölçümü, nedensellik yok | Web Almanac 2025 |
| "Headless daha hızlıdır" | Uygulayıcı, kanıt zayıf; bir ajans iki headless mağazayı Liquid'e geri aldı, editör ekibi yetişememiş | Brainiac Studio, tarihsiz |
| "Lüks siteler teknik olarak kusursuz" | Yanlış: 8 mağazada 6'sı CWV'den kalıyor | Ölçtük, 3 Kas 2026 |
| ChatGPT'de anında satış çağı başladı | Yanlış: "did not offer the level of flexibility… allowing merchants to use their own checkout" | OpenAI, 24 Mar 2026 |
| Yapay zekâ trafiği %90 daha iyi dönüşüyor | Satıcı iddiası: ABD, yalnız tıklama, seçilim etkisi var, trafik payı verilmiyor; Adobe'nin Q3 sunumu kendi içinde çelişiyor | Adobe, 29 Eki 2026 |
| 8.000+ UCP mağazası, ~%99'u Shopify | Tek bağımsız izleyici, ikincil; doğrulanamadı | UCP Checker aktarımı, Haz 2026 |
| İnternetten alışverişte iade %19,3, iadelerin %9'u dolandırıcılık | Sektör anketi; yöntem sayfada yok | NRF + Happy Returns, 15 Eki 2025 |
| Sahte yorum yasak, yapay zekâ üretimi dâhil | Resmî | FTC, 14 Ağu 2024 |
| Amazon'un Comet yasağı ayakta | Yanlış: 9 Mart 2026 tedbiri Dokuzuncu Daire'de kaldırıldı; karar olaya özgü, dava sürüyor | Basın (Engadget, MediaPost); karar metni okunmadı |

## 3. Dünya seviyesi nasıl yapılır

### 3.1 Platformu seç

| Platform | Gerçekte ne için | Maliyet | Sınır | Gördüğümüz kullanıcı |
|---|---|---|---|---|
| Shopify | Hızlı, güvenli doğrudan satış | Yıllık €27/79/289 aylık; kendi ödemesi dışında %2/1/0,6 ek | Ödeme akışı kapalıdır | Rhode, Glossier, Allbirds, Kylie, Skims (kaynak kodunda; plan dışarıdan görünmez) |
| Shopify Plus | Ölçek, B2B, çok mağaza | "€2.100/ay'dan" (resmî); $2.300–2.500 ve %0,35–0,40 değişken ücret ikincildir, resmî sayfada yok; 9 ek mağaza; dış ödeme %0,2 | Süreli sözleşme | Plan dışarıdan ölçülemez |
| Hydrogen / özel ön yüz | Shopify motoru, kendi yüzümüz | MIT; ekip maliyeti asıl kalem | Editör ve uygulama ekosistemi zorlaşır | Fashion Nova (Oxygen başlığı); Gymshark, Vuori, Ruggable (Next.js + Shopify) |
| WooCommerce | Site ve içerik tek gövde, tam sahiplik | GPL-2.0, ücretsiz; barındırma ve eklentiler ayrı | Hız ve güvenlik size kalır | Mobil e-ticaret sitelerinin %44,4'ü |
| Adobe Commerce / Magento | Karmaşık katalog, B2B | Lisans teklifle; açık çekirdek OSL-3.0, Mage-OS çatalı | Ağır ekip; CWV %35 | Yayımlanmış kesin liste okunmadı |
| BigCommerce | Satış tavanlı SaaS | $29/79/299; Performance $1.499'dan; yıllık $2 milyonda otomatik geçiş | Satış limiti | Ölçülmedi |
| Salesforce Commerce Cloud | Çok ülkeli marka | Teklifle | Pahalı, uzun proje | Loewe, Hugo Boss (kaynak kodunda) |
| commercetools | Kurumsal bileşen mimarisi | Sipariş bazlı, fiyat yayımlanmıyor | Her şeyi siz kurarsınız | Ölçülmedi |
| Medusa | TypeScript, özel iş kuralı | MIT; bulut $29/99/299, %0 ciro payı | Ön yüz ve operasyon sizde | Ölçülmedi |
| Saleor | GraphQL, çok kanal | BSD-3; bulut $1.599 (aylık $200 bin ciroya kadar) ve $3.999 | Bulut pahalı | Ölçülmedi |
| Vendure | NestJS, kurumsal açık kaynak | GPLv3 + eklenti istisnası; €199/599/2.499; kurumsal €60 bin/yıl'dan | Küçük ekosistem | Ölçülmedi |

Karar kuralı: müşteri ürün satıyor ve ekip kurmak istemiyorsa Shopify. İçerik sitesi asıl varlıksa ya da mağaza zaten oradaysa WooCommerce; ikisinin de üstüne wow ön yüzü, ancak yıllık ciro ekip maliyetini taşıyorsa. Elogic'in tahminine göre $1–2 milyon cirolu Plus mağazasının toplam yıllık maliyeti cironun %4–7'sidir (ajans tahmini, teklif değil). Türkiye'den satan müşteride Shopify Payments yoktur, yani planına göre %2 ile %0,2 arası ek ücret iyzico komisyonunun üstüne biner; bu hesap teklifte yazılır. Toplam sahip olma maliyeti, başlangıç fiyatından önce gelir.

### 3.2 Satın alma davranışı

| Yer | Yapılacak | Ölçüm (Baymard) |
|---|---|---|
| Ürün sayfası | Beden düğme olarak; ölçek görseli; model görseli; teslimat ve iade fiyatın yanında | %57 düğme kullanmıyor; kullanıcıların %42'si boyutu görselden anlamaya çalışıyor; %67 toplam maliyet tahmini vermiyor; %44 iade bilgisi vermiyor; %89 kötü yoruma yanıt vermiyor |
| Liste ve filtre | Fiyat, puan, renk, beden, marka filtresi; dört sıralama; uygulanmış filtre özeti; varyantlar tek satırda; kartta 3+ görsel | %51 beş filtreyi vermiyor; %69 dört sıralamayı vermiyor; %80 üç küçük görsel vermiyor; mobilde %78 orta veya altı |
| Arama | Yazım hatası, eş anlamlı, tema aramaları, otomatik tamamlama | Baymard'ın güncel oranları ücretli; 2021 lüks kıyaslamasında en zayıf alan aramaydı |
| Sepet | Adet düğmesi; hediye seçeneği; toplam baştan görünür | %95 doğru adet arayüzünü kullanmıyor; %68 sepette hediye seçeneği yok |
| Ödeme | Misafir ödeme en önde; hesap en sonda; hız yerine teslim tarihi; 12–14 öğe | %56 hesabı sona bırakmıyor; %48 tarih göstermiyor; %47 telefon nedenini söylemiyor; katılımcıların %68'i telefon vermek istemiyor |
| Mobil | Doğru klavye türü, dokunma alanı | %61 yanlış klavye; %66 öğeler çok yakın |

NN/g'nin filtre yazısı (2014) şunu ekler: faset pahalıdır, her filtrenin arkasında bakımlı üstveri gerekir ve kullanıcının düşündüğü boyutla örtüşmeyen filtre işe yaramaz. Başlangıç ajansının atladığı yer budur: filtreyi tema kurar, ama filtrelenecek veriyi kimse temizlemez.

### 3.3 Lüks mağazalar ne yapıyor (bakıldı, 3 Kas 2026)

| Mağaza | LCP | INP | CLS | CWV | Liste JS (KB) | Alan adı | Ön yüz ve gözlenen araçlar |
|---|---|---|---|---|---|---|---|
| Apple | 1,5 sn | 143 ms | 0 | Geçti | 593 | 3 | Kendi; yalnız kendi alanı |
| SSENSE | 2,1 sn | 171 ms | 0,05 | Geçti | 2.360 | 29 | Next.js; listede her ürün için Product verisi |
| Hermès | 1,3 sn | 220 ms | 0,78 | Kaldı | 1.449 | 14 | Angular; `dd.hermes.com` doğrulaması, Riskified |
| Louis Vuitton | 1,5 sn | 212 ms | 0,23 | Kaldı | 1.915 | 11 | Nuxt, Algolia, AB Tasty |
| Gucci | 2,8 sn | 277 ms | 0 | Kaldı | 2.221 | 20 | Next.js, Contentful görselleri, Optimizely |
| Nike | 3,4 sn | 235 ms | 0,01 | Kaldı | 2.160 | 15 | Next.js; ürün sayfasında ProductGroup |
| Mytheresa | 2,3 sn | 552 ms | 0,86 | Kaldı | 1.691 | 11 | Angular, Monetate, hCaptcha |
| Net-a-Porter | 4,4 sn | 379 ms | 0,13 | Kaldı | 4.078 | 115 | Reklam ve takip etiketi yükü |

Saha sütunları ana sayfanındır; ürün sayfası saha verisi alınmadı. Eşikler LCP 2,5 sn, INP 200 ms, CLS 0,1. Hermès'in verisi yönlendirmeyle `/be/en` sayfasınındır; Hermès ürün sayfası doğrulamaya takıldığı için ağırlık ölçümü alınmadı.

Gördüklerimiz: görsel neredeyse her yerde AVIF (Hermès WebP, Apple JPEG/PNG). Liste sayfası ve ürün sayfası ürün fotoğrafının üstüne kuruludur; Net-a-Porter ürün sayfası dışında ürün yolunda film yoktur. Wow, fotoğrafın boyutu, boşluk düzeni ve tipografidir; ana sayfa ve kampanya ise filmdir. Baymard'ın kamuya açık özetine göre lüks siteler genel e-ticaretten iyi durumdadır, ama 2021'de en zayıf alanları aramaydı; ayrıntı ücretlidir.

Ajan için önemli bir bulgu: düz otomasyon tarayıcısıyla SSENSE 403 verdi, Mytheresa "BOT" hata sayfası gösterdi, Hermès ürün sayfası doğrulama istedi; düz istekle Dior, YSL, Balenciaga, Moncler, Cartier ve Tiffany 403 döndü. Aynı markalar ajan kanalı konuşurken kapıda duvar örüyor. Müşteri için bot politikası bilinçli yazılır: kötü botu kesip tanınan ajanı içeri alan bir kural gerekir.

### 3.4 Ürün verisi ve akışlar

Ürün verisi artık sitenin omurgasıdır; aynı kayıt sayfayı, reklamı, ajanı ve pazaryerini besler. Dünya seviyesinde tek ürün kaynağı (PIM ya da mağaza) tutulur, kanal farkı dönüşüm kurallarıyla verilir.

- **Google:** `id`, başlık (150 karakter), açıklama (5.000), bağlantı, görsel, stok, fiyat, marka, varsa GTIN zorunlu çekirdektir. Content API 18 Ağustos 2026'da ömrünü tamamladı, 1 Eylül'den beri aralıklı 410 dönüyor, tam kapanış 2027 başı; yeni iş yalnız Merchant API ile yapılır.
- **Görsel tuzağı:** 31 Ocak 2027'den itibaren en az 500×500 piksel gerekir. Yapay zekâ görseli `DigitalSourceType` üstverisini korumak zorundadır; yapay zekâ başlığı `structured_title` ile `trained_algorithmic_media` işaretlenir. Stüdyomuzun çıktısı buna bağlanmalıdır, yoksa üstveri silinmiş görsel politika ihlali olur.
- **Meta:** zorunlu alanlara ek `brand`/`gtin`/`mpn`'den biri ve kategori; Meta'da ödeme için `native_commerce` ve `product_disclosures`. Google'ın aynı adlı alanını yalnız ikincil kaynaktan okuduk.
- **TikTok ve pazaryerleri** bu turda birinci elden okunamadı (bölüm 9). İlke: pazaryeri erişim satar, müşteri verisini satmaz; marka mağazası ana varlıktır.

### 3.5 E-ticaret SEO'su

- **Faset:** Google'ın 2024 sonu kuralı açıktır: dizine gerekmeyen filtre `robots.txt` ile kapatılır; dizine girecekse `&` ayırıcı, sabit sıra, yinelenmeyen filtre ve boş sonuçta 404. `canonical` ve `nofollow` uzun vadede daha zayıftır. Uygulamada arama talebi olan birleşimler (kategori+renk gibi) ayrı, içerikli sayfa olarak seçilir, gerisi kapatılır. Filtreyi `#` parçasına koymak taramaya hiç etki etmez.
- **Ürün şeması:** satın alınabilen sayfada merchant listing kurulur: `Offer` zorunlu (`AggregateOffer` kabul edilmez), fiyat sıfırdan büyük. Stok, `shippingDetails`, `hasMerchantReturnPolicy` önerilir; iade politikası kurum düzeyinde bir kez yazılır. Varyantlar `ProductGroup`, üç boyutlu model `subjectOf` ile verilir.
- **Stok bitince:** geçici tükenişte sayfa 200 kalır, `OutOfStock` yazılır, alternatif ve haber verme sunulur. Kalıcı bitişte Google'ın yazılı sözü 2014'ten: faydalı içerik beklenmiyorsa 404 uygun olabilir; aynı ürünün yenisi varsa 301 uygulayıcı pratiğidir.
- **Çok ülke:** Apple 137, SSENSE 42, Mytheresa 41 `hreflang` veriyor; Gucci, Nike ve Net-a-Porter sayfada vermiyor (site haritasında olabilir).

### 3.6 Ajan ticareti: canlı olan ve konuşulan

| Parça | Durum |
|---|---|
| ChatGPT keşfi (ACP akışı) | Canlı; Shopify mağazaları Catalog ile iş yapmadan görünür, satın alma mağazanın kendi ödemesinde biter |
| ChatGPT Instant Checkout | Geri çekildi; belgeler "onaylı ortaklar" diyor; Walmart uygulama yoluna gitti |
| Google UCP | AI Mode'da doğrudan alım; satıcı Merchant of Record kalır; bekleme listesi; çoklu ürün ve iade yol haritasında. Google'ın sayfası Gemini için "yakında", Shopify Fall '26 "sat" diyor: kaynaklar çelişiyor, Google belgesi bu iş için esastır |
| UCP spesifikasyonu | Apache-2.0, 3.470★, son sürüm v2026-08-25, bugün güncellendi |
| ACP spesifikasyonu | Apache-2.0, 1.593★, son push 18 Temmuz 2026: tempo düşmüş |
| Shopify | Catalog, Cart ve Checkout MCP canlı; varsayılan devir mağazaya; doğrudan tamamlama güven katmanıyla; Universal Cart bekleme listesinde; WebMCP temalarda |
| Stripe | Shared Payment Token €0,15; ülke ve aşama entegrasyona göre değişiyor |
| Lighthouse 13.6 | "Agentic Browsing" kategorisi geliştirme aşamasında; erişilebilirlik ağacı ve WebMCP doğruluyor. Mytheresa "ağaç düzgün değil" uyarısı aldı |

Bugün yapılacaklar sırasıyla: eksiksiz akış ve şema; sitede kurum bilgisi, iade ve teslimat gerçeklerinin makinece okunur olması; bot politikası; erişilebilir HTML. Kendi protokol entegrasyonu ancak müşteri Shopify dışındaysa ve ciro gerektiriyorsa yapılır. Ajan trafiği ayrı ölçülür; kaynak ayrımı olmadan Adobe'nin oranlarına güvenilmez.

### 3.7 Ödeme, vergi, kargo

İlke üç sorudur: satıcı kayıtlarda kimdir, para yerel olarak mı toplanıyor, alıcı nihai bedeli sepetten önce görüyor mu? Vergi yükümlülüğü Merchant of Record'a aittir; dijital üründe bu devredilebilir, fiziksel üründe çoğu zaman satıcıda kalır. Yerel ödeme yöntemi ve yerel acquirer onay oranını artırır; bu yerel olgu her pazarda ayrı ölçülür. Vergi dâhil, gümrük dâhil fiyat terk nedeninin başına doğrudan vurur.

| | ABD | AB | BK | Körfez | Türkiye |
|---|---|---|---|---|---|
| Stripe | Var; %2,9+30¢ (ikincil) | Var; %1,5+€0,25, yabancı kart %3,15 | Var; %1,5+£0,20 (ikincil) | BAE var, Suudi yok | Yok |
| Shopify Payments | Var | Çoğu ülke | Var | BAE var, Suudi yok | Yok |
| Adyen | $0,13 + Interchange++ + %0,60 (küresel gösterge) | Aynı model | Aynı model | Ülke doğrulanmadı | Doğrulanmadı |
| Yerel | Kart, cüzdan | Yerel havale, cüzdan | Kart, cüzdan | Tabby, Tamara | iyzico liste %4,29+0,25 TL (pazarlıklı); PayTR %2,19'dan (blog) |
| Vergi | Eyalet satış vergisi, ekonomik bağlantı | OSS: AB içi €10 bin üstü varış ülkesi KDV'si; IOSS €150'ye kadar | £135'e kadar KDV'yi satıcı satışta alır | BAE %5 (resmî); Suudi %15 (doğrulanmadı) | KDV ve e-belge; bu turda okunmadı |
| Gümrük | De minimis 29 Ağu 2025'te tüm ülkelere kapandı | €150 altı için 1 Tem 2026'dan Tem 2028'e €3 sabit vergi | £135 üstü olağan ithalat | Okunmadı | €30 altı kolaylaştırılmış rejim kaldırıldı (bellekten; doğrulanmadı) |

Paddle ve Stripe Managed Payments (%3,5 ek) dijital ürün içindir; Paddle fiziksel teslimatı yasaklar. Fiziksel üründe sınır ötesi Merchant of Record için Global-e ve ESW sınıfı firmalar akla gelir; bu turda fiyat okunamadı. Türkiye'den yabancı müşteriye satışta iyzico Multi Currency vardır, yabancı parada taksit yoktur.

**CEO için tek satır (karar sizde):** Faizli BNPL ile vade farklı kart taksiti sektörde varsayılan gibi sunuluyor; iyzico vade farkını satıcıya bırakıyor, Nike ürün sayfasında Klarna yükleniyor, Körfez'de Tabby ve Tamara Şeriat uyumlu Murabaha diyor (Tamara'nın gecikme ücretinde kaynaklar çelişiyor), Shopify Plus'ın sayfası da bakiye üzerine %3,54 getiri yazıyor; ofis bunların hiçbirini kendiliğinden açmaz.

### 3.8 İade, dolandırıcılık, yorum, sadakat, e-posta

- **İade:** politika ürün sayfasında görünür olur; Baymard'da ankete katılanların %60'ı orada arıyor. İade nedeni ürün verisine geri beslenir: "küçük kalıyor" bir bedentablosu görevidir, müşteri hizmeti görevi değildir.
- **Dolandırıcılık:** Visa VAMP'ta oran %0,5 "uyumsuz", %1,5 "aşırı" (AB, ABD, Kanada, AP, LAC), CEMEA'da %2,2; Türkiye'nin CEMEA'da sayıldığını bellekten yazıyoruz, sözleşmede doğrulanır. Mastercard %1,5 ve 100 itirazda ceza yolu başlar. Oran kazanılan itirazları saymaz; asıl iş önlemedir. Kart deneme saldırısı için ödeme adımı korunur.
- **Yorum:** gerçek alıcıdan istenir, kötü yorum yanıtlanır (%89 yanıtlamıyor). Olumlu yoruma ödül verilmez; FTC bunu yasakladı. Lüks evler ürün yorumuna genelde mesafelidir; müşteri kararı olarak sorulur.
- **Sadakat:** bu turda ölçülmüş kanıt okunmadı. İndirim yerine erişim ve hizmet veren modeli uygulayıcı önerisidir.
- **E-posta ve SMS:** Gmail'de günde 5.000 üstü gönderim için SPF, DKIM, DMARC, tek tık çıkış ve %0,30 altı spam oranı zorunludur; hedef %0,10. AB, BK ve Türkiye'de açık izin kuralı işlenir, ABD'de SMS izni ayrıca kurulur.
- **Sepet terk serisi:** uygulayıcı standardı üç mesajdır: yaklaşık 1 saat, 24 saat, 72 saat. İlk mesajda indirim verilmez, çünkü müşteriyi beklemeye eğitir. Lüks müşteride mesaj danışman tonundadır. Ölçülmüş oran bu turda okunmadı.

### 3.9 WooCommerce MCP ve ajanın bugünkü elleri (B30)

Resmî belge 3 Kasım 2026'da okundu: "developer preview". WooCommerce MCP artık kendi uç noktası değildir. `mcp-adapter` eklentisi kurulur, adres `/wp-json/mcp/mcp-adapter-default-server` olur, üç üst araçla keşfedip çalıştırır. Eski `/wp-json/woocommerce/mcp` ve `products-list` tarzı adlar 11.3'te kaldırıldı; eski uç 410 döner. Kimlik Application Password ile ya da yerelde WP-CLI ile verilir; belge özel kullanıcı ister ve sipariş verisinin kişisel veri taşıdığını söyler.

| Mağaza | Ajan bugün yapar | Yapamaz ya da kapıda durur |
|---|---|---|
| WooCommerce | Yedi yetenek: ürün sorgula, oluştur, güncelle, sil (varsayılan çöp); sipariş sorgula, durum değiştir, not ekle | Kupon, müşteri, iade, kargo, vergi, ayar bu yedide yok; belge "kapatılacak boşluklar var" diyor. Bunlar REST ve WP-CLI ile yapılır |
| Shopify | Sidekick çok adımlı değişikliği sahneler, SimGym ile sınar; Dev MCP ve AI Toolkit geliştiriciye yardım eder | Sidekick iddiaları Shopify'ın anlatımıdır, bağımsız ölçüm okunmadı |
| Her ikisi | Toplu katalog, çeviri, şema, akış onarımı | Fiyat, iade, para hareketi: onay kapısı |

Düzeltmeler: `study-cards/woocommerce-mcp.md` eski araç adlarını taşıyor, yenilenmeli. `WP-WOO.md`'nin açık sorusu kapandı: hâlâ preview. Doğru sıra kurulu kararımızla aynıdır: staging, salt okuma kullanıcı, sonra tek tek yazma. InstaWP'nin denemesinde ajanın bildirdiği beş eklenti güncellemesinden biri gerçekleşmişti; ajanın özeti değil sitenin kendisi kontrol edilir. Sipariş durumu değişiminin müşteri e-postası tetikleyebileceği stagingde ölçülür.

## 4. Wow ile çatışma

Çatışma gerçek ama sanıldığı yerde değil. Ölçtüğümüz sayfalarda en büyük yük film değil, betiktir: Net-a-Porter liste sayfasında 4 MB JavaScript ve 115 alan adı, görsel ise 468 KB. Apple'ın iPhone liste sayfası ise 593 KB betikle çalışıyor.

Bu ölçüde en iyiler şöyle yapıyor:

1. **LCP'yi film yapmazlar.** Gucci videolarında `preload=none` ve poster var; yalnız ilki otomatik oynuyor. Hermès de `preload=none`. Nike iki videoyu `preload=auto`, postersiz yüklüyor ve Nike LCP 3,4 sn ile kalıyor; nedeni tek başına bu değildir, ama bu yol izlenmez.
2. **Uzun sinematik sayfayı parçalarlar.** Apple iPhone sayfası masaüstünde 33.850 piksel, 14 video, 18 yapışkan katman, tam kaydırmada yaklaşık 16 MB indiriyor; ağırlık kaydırdıkça geliyor. İlk ekrana ödenen bedel küçük kalıyor. Bu sayfanın saha verisini biz ölçmedik.
3. **Filmi satın alma yolundan ayırırlar.** Kampanya ve hikâye sayfası sinema olur. Liste, ürün kutusu, sepet ve ödeme sunucudan gelen HTML ile anında çalışır. Bu mağazalarda ölçüm anında ana sayfalarda canvas ve WebGL sıfırdı; üç boyut kullanılacaksa `model-viewer` tıklayınca açılır.
4. **Alanı önceden ayırırlar.** Her görsel, video ve banner sabit en-boy oranıyla gelir. Çerez ve ülke katmanları düzeni itmez, üstte durur. Hermès ve Mytheresa'nın kaldığı yer budur.
5. **Etiketleri bütçeler.** Kural: üçüncü taraf etiketler sunucu tarafına ya da etkileşim sonrasına alınır; her yeni etiket eskisini çıkarır.
6. **Etkileşimi korurlar.** Filtre ve beden seçimi INP'yi vurur (Mytheresa 552 ms). Hidrasyon parçalanır, uzun görevler bölünür.
7. **Hareket azaltmaya saygı gösterirler.** Apple ve Nike `prefers-reduced-motion` kuralları taşıyor; LV ve SSENSE'te okunabilen stil dosyalarında sıfır ölçtük (başka alandaki dosyalar okunamaz). Bu zemin bizde şarttır, film durur ama poster kalır.

Ödeme adımında wow, kusursuz akıştır: marka rengi, yazı tipi, hızlı cüzdan. Shopify'da ödeme akışı kapalı olduğundan orada güven tasarlanır.

## 5. Aletler

| Ad | Gerçekten ne yapar | Gerçek mi | Açık/ücretli ikizi | Bizde | Nereye |
|---|---|---|---|---|---|
| WooCommerce + mcp-adapter | Mağaza ve ajan kapısı | GPL-2.0; 10.577★ / 1.902★; 3 Kas | Shopify + Sidekick | Hayır (B30, W-C42-4) | Site ustası; staging MCP |
| Shopify AI Toolkit | Shopify geliştirme bilgisi | MIT; 627★; 27 Eki | mcp-adapter | Hayır | Ortak raf |
| Hydrogen | Shopify üstü özel ön yüz | MIT; 2.164★; 3 Kas | Next.js + Vercel Pro $20/ay | Hayır | Ustanın bilgisi |
| Medusa | Headless motor | MIT + Enterprise bölümü; 37.071★ | commercetools (teklifle) | Hayır | İş başına |
| Saleor | GraphQL motor | BSD-3; 23.502★ | Saleor Cloud $1.599/ay | Hayır | İş başına |
| Vendure | NestJS motor | GPLv3 + istisna; 8.562★ | Ticari lisans €199/ay'dan | Hayır | İş başına |
| Spree / Bagisto | Motor, pazaryeri | BSD-3 15.806★ / MIT 28.327★ | Shopify Plus | Hayır | Yedek bilgi |
| Mage-OS | Magento çatalı | OSL-3.0; 325★ | Adobe Commerce | Hayır | Devralınan işte |
| UCP ve ACP belgeleri | Ajan ticaret sözleşmesi | Apache-2.0; 3.470★ / 1.593★ | Shopify Catalog, Stripe | Hayır | Ortak bilgi, aylık izleme |
| stripe/ai + best-practices | Ödeme aracı, MCP | MIT; 2.034★ | iyzico, Adyen | Skill rafta | Ortak raf |
| Stripe Radar / Riskified | Dolandırıcılık puanı | Radar €0,05'ten; Riskified fiyatı okunmadı | Açık ikiz bulunamadı | Hayır | İş başına |
| Stripe Tax | Vergi hesabı | %0,5 ya da €80/ay'dan | Açık ikiz bulunamadı | Hayır | Mali uzman |
| Algolia | Arama | Fiyat okunmadı; LV, Prada, Valentino'da görüldü | Meilisearch 59.770★, Typesense GPL-3.0 27.076★ | Hayır | İş başına |
| Klaviyo | E-posta, SMS | 250 profile kadar ücretsiz | listmonk AGPL-3.0 24.135★, Mautic 10.929★ | Hayır | Aylık iş |
| Feedonomics, Channable | Akış yönetimi | Fiyat okunmadı | Merchant API + kendi betik | Hayır | Akış uzmanı |
| Baymard Premium | 200 bin saatlik araştırma | Fiyat okunmadı; para çıkışı CEO'da | NN/g açık yazıları | Hayır | Ortak bilgi |
| Lighthouse CI, Playwright, axe | Kapılar; ödeme testi | Bkz. `PLATFORMS.md` | SpeedCurve | Kısmen | Her iş |
| PageSpeed web sayfası | Gizli Chrome'dan saha verisi | API anahtarsız 429 verdi; sayfa çalıştı | CrUX API | Yöntem var | Aylık iş |

## 6. Ofisin işi

**Kadroda var:** `personas/commerce/` içinde woocommerce-architect, cro-checkout-specialist, catalog-pim-specialist, commerce-integration-engineer, commerce-returns-specialist, commerce-analytics-specialist, merchandising-pricing-manager; ayrıca `marketing-agentic-search-optimizer`, `marketing-seo-specialist`, `finance-tax-strategist`. **Eksik:** Shopify mimarı ve ödeme-dolandırıcılık uzmanı. Yeni yazmadan önce dolaptaki genel usta ve uzman düzeni kontrol edilir.

| Zaman | İş | Sahip |
|---|---|---|
| Kurulumda bir kez | Platform kararı ve toplam maliyet; ödeme ve vergi haritası; ürün veri modeli; şema; faset planı; bot politikası | Site ustası + ticaret uzmanı |
| Kurulumda bir kez | Baymard listesine göre ürün, liste, sepet, ödeme kontrolü; performans bütçesi; gerçek ödeme testi | Dönüşüm uzmanı + kalite |
| Otomatik | Akış hata denetimi, stok ve fiyat eşleşmesi, CWV izlemesi, ödeme Playwright testi, VAMP oranı uyarısı, spam oranı izlemesi | Motor |
| Aylık | Merchant Center teşhisi, tükenmiş ürün sayfaları, faset taraması, yeni etiket temizliği, sepet terk serisi, iade nedeni raporu, protokol takibi | Uzmanlar |
| Onay kapısı | Fiyat toplu değişimi, iade, reklam harcaması, yeni sözleşme, BNPL ve taksit | CEO ya da müşteri |

**Usta ilk günden şunları elinde tutar:** platform seçim kuralı, performans bütçesi, ürün veri modeli ve ödeme yolu. Bunlar sonradan değişirse iş baştan yapılır. Akış, e-posta, dolandırıcılık ve vergi uzmanın işidir.

## 7. Satılabilecekler

| Ürün | Piyasa | Kaynak |
|---|---|---|
| Hazır tema mağaza | Partner başlangıç fiyatları $100–$10.000 | Shopify partner dizini, ilk 16 / 4.868 partner, 3 Kas 2026 |
| Temiz doğrudan satış mağazası | Beş haneli dolar | Elogic tahmini, 2026 |
| Karmaşık B2B veya headless | Beş-altı haneli dolar | Elogic tahmini |
| Aylık bakım ve geliştirme | Küçük ölçekte yıllık $6–24 bin; $5–10 milyon cirolu markada $36–120 bin | Elogic tahmini |
| Eski katalog taşıma | Veri temizliği projenin yaklaşık %30'u | Elogic |
| WordPress ölçülü hız onarımı | $150–700 | Bizde var: `20261014-88-link/MERGE.md` teklif 11 |
| Akış, şema, ajan hazırlığı denetimi | Bağımsız piyasa fiyatı bulamadık | Pilotla ölçülür |

Müşteri site için değil, ölçülmüş sonuç için aylık ödeyecektir; H5'in "aylık bakımla yaşar" notu burada da geçerlidir. Tema mağazası fiyat savaşıdır, oraya girilmez. Asıl ürün: wow mağaza kurulumu + aylık dönüşüm ve akış bakımı. Ajan hazırlığı tek başına satılmaz, bakıma eklenir. Fiyat sözü verilmeden önce Elogic'in tahminleri canlı teklifle sınanır.

## 8. En iyi kaynaklar

- **Baymard Institute:** e-ticaret kullanılabilirliğinin en derin araştırması; denetim satar, tahminleri buna göre okunur.
- **HTTP Archive Web Almanac (Ecommerce):** platformlar için kamuya açık saha verisi.
- **web.dev vaka çalışmaları:** Vodafone A/B yöntemi örnek alınır.
- **Google Search Central ve Merchant belgeleri:** faset, merchant listing, Merchant API, ürün verisi. Değişiklik günlüğü aylık okunur.
- **shopify.dev/docs/agents, ucp.dev, ACP deposu, docs.stripe.com/agentic-commerce:** ajan ticaretinde gerçek durum belgede yazılıdır, basın bülteninde değil.
- **Stripe'ın izleme programları sayfası:** Visa ve Mastercard eşiklerinin en okunur özeti.
- **Nielsen Norman Group:** faset ve filtre kavramları.

Ortak bilgiye konacaklar: platform seçim tablosu; Baymard'dan çıkarılmış ürün, liste, sepet, ödeme kontrol listesi; merchant listing şema şablonu; faset kuralı; Merchant Center yapay zekâ görsel kuralı (stüdyo dâhil); ülke ödeme tablosu; WooCommerce MCP'nin güncel kartı. Bu, rafımızdaki OpenSEO'nun eksik katmanıdır: 12 skill'in içinde "faceted", "merchant listing" ve "merchant center" sözcükleri hiç geçmiyor (dosya taramasıyla ölçüldü).

## 9. Bilinmeyenler

Çalışmanın ortasında oturumun ortak WebSearch hakkı doldu; o noktadan sonra arama motoru kullanılmadı, adı bilinen resmî sayfalar doğrudan okundu ve daha önce toplanmış tarama dosyaları kullanıldı. Aşağıdaki boşlukların çoğu bundandır; hak yenilenince kapanır.

| Bilinmeyen | Ne kapatır |
|---|---|
| Shopify Plus değişken ücreti, Adobe ve Salesforce lisans fiyatı | Resmî teklif |
| Ürün sayfası saha CWV'si; Net-a-Porter, Hermès, Gucci arka ucu | CrUX API; satıcı açıklaması |
| WooCommerce'in UCP ve ACP desteği | Woo ve Stripe belgeleri |
| TikTok kataloğu, Amazon, Noon, Trendyol, Zalando ücretleri | Her platformun resmî sayfası |
| Türkiye gümrük ve e-ticaret kuralı; Suudi KDV; ABD eşikleri | Resmî Gazete, Ticaret Bakanlığı, ZATCA |
| PayTR gerçek oranı; Adyen'in Türkiye ve Körfez kapsamı | Teklif |
| Sepet terk serisi, yorum, sadakat ve SMS için ölçülmüş oranlar (Spiegel sayfası 404 verdi) | Klaviyo verisi, Spiegel özgün çalışması, kendi A/B'miz |
| Sınır ötesi fiziksel Merchant of Record fiyatları | Global-e, ESW teklifi |
| Baymard'ın arama, mobil ve lüks ayrıntıları | Baymard Premium; para çıkışı CEO'da |
| Ajan trafiğinin gerçek payı | Müşteri analitiğinde kaynak ayrımı |
| Reddit ve X'teki uygulayıcı görüşü: tarama az sonuç verdi | Hak yenilenince hedefli okuma |
