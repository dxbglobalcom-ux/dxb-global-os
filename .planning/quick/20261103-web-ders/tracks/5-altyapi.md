# İz 5 — Altyapı, hız, güvenlik, erişilebilirlik ve hukuk

Tarih: 2026-11-03. Saha verisi ve yığın tespiti o gece bizim ölçümümüzdür; yöntem §3.5'te yazılıdır. Fiyatlar aksi yazılmadıkça satıcının kendi sayfasından o gece okunmuştur.

## 1. Özet

1. Hızın hakemi sahadır: Google, gerçek kullanıcıların 75. yüzdeliğine bakar (LCP ≤ 2,5 sn, INP ≤ 200 ms, CLS ≤ 0,1). Outletcity Metzingen laboratuvarda 66 alıp sahada geçiyor; Lighthouse puanı satılmaz, saha satılır.
2. Ödüllü sitelerin zayıf noktası yükleme değil, tepkidir: Awwwards'ın Sites of the Year listesinin başındaki üç site ve ölçülen altı canvas ağırlıklı sitenin altısı Core Web Vitals'tan kalıyor; beşinde sebep INP. Son 29 Günün Sitesi'nin 16'sında saha verisi bile yok, olan 13'ün 3'ü geçiyor.
3. Çözüm wow'u azaltmak değildir. Outletcity film ve yoğun reklam etiketiyle geçiyor: ilk boyamayı görsel taşır, film ondan sonra akar, ana iş parçacığı boş kalır.
4. Outletcity'nin film düzeni okundu: Nuxt, Mux Player, HLS, `preload=none`, 480p-1080p sınırı, iki film ekranın altında. Bu, uygulanacak reçetedir.
5. Film uygulama sunucusundan verilmez; video servisi kullanılır. 100.000 izlenme × 20 saniyede teslimat Mux'ta 0 $, Cloudflare Stream'de ~33 $, Bunny'de ~4 $'dan başlar.
6. Yığın kararını araç sevgisi değil, "yayından sonra kim düzenleyecek" sorusu verir. Son 28 Günün Sitesi'nde Nuxt 7, Webflow 6, Next 5, WordPress 1 çıktı; Sites of the Year listesinin başındaki Lando Norris Webflow'dadır.
7. WordPress'te tehlike yama hızıdır: Patchstack'e göre 2025'te 11.334 açık, %91'i eklentide, %46'sında açıklandığında yama yok, kitlesel saldırıya ortanca 5 saat. "Ayda bir güncelleme" bakım değildir.
8. Modern yığın da muaf değildir: React2Shell (CVE-2025-55182, CVSS 10) açıklandığı gün sömürüldü; npm solucanı 500+ paket yaktı. Bakım her yığına satılır.
9. Erişilebilirlik artık mahkeme kararıdır: Caen mahkemesi 4 Haziran 2026'da Carrefour'un %71 RGAA savunmasını reddetti, altı ay ve gecikmeye günlük 500 € verdi. ABD'de 2025'te federal mahkemede 3.117 site davası açıldı. Overlay çare değildir.
10. Aylık bakımın dürüst pazarı 89-359 $ (WP Buffs), üst kademe 499-1.500 $'dır (satıcı derlemesi). H5'in değeri geri yükleme denemesi, saha CWV'si, rıza taraması ve erişilebilirlik gerilemesi gibi çoğu ajansın atladığı dört işte durur.

## 2. Kanıt durumu

| İddia | Güç | Kaynak ve tarih |
|---|---|---|
| CWV eşikleri 2,5 sn / 200 ms / 0,1; 75. yüzdelik; mobil ve masaüstü ayrı | resmî | web.dev/articles/vitals, 2026-11-03 okundu |
| İyi CWV sıralama garantisi değildir; Google "başarı için" önerir | resmî | developers.google.com/search/docs/appearance/core-web-vitals |
| Web'in %48'i mobilde, %56'sı masaüstünde geçer; LCP %62, INP %77, CLS %81 | kontrollü ölçüm | Web Almanac 2025 (CrUX, Temmuz 2025) |
| LCP %31 iyileşince satış %8 arttı (5,7 sn ↔ 8,3 sn) | kontrollü ölçüm | Vodafone A/B, web.dev; günde ~34 bin ziyaret, tek test, eski yıl |
| `<canvas>` LCP adayları arasında sayılmaz; video için poster ya da ilk kare, hangisi erkense | resmî | web.dev/articles/lcp |
| Bulanık yer tutucu LCP'yi kandırmaz: 0,05 bit/piksel altı yok sayılır | resmî | Chromium metrics changelog, Chrome 112 |
| Yüksek Lighthouse = hızlı site | efsane | Outletcity lab 66 / saha geçti; Louis Vuitton lab 97 / saha geçti; Basement lab 71 / INP 1.112 ms (bizim ölçüm) |
| "Ödül alan site yavaş olsa da olur" | yarı doğru | Awwwards'ta Usability %30 (elimizde); saha INP'si jüriye girmiyor; ziyaretçi yine bekliyor |
| 2025'te 11.334 WordPress açığı, %91 eklenti, çekirdekte 6; %46 yamasız; ortanca 5 saat; barındırma savunması %26 (bilinen WP sömürüsünde %12) engelliyor | satıcı iddiası | Patchstack 2026; açığı kapatan ürünü satan şirket; sayı ikincil kaynaklarla uyumlu |
| WordPress mobilde %45, Wix %74, Duda %85 geçer | kontrollü ölçüm | Web Almanac 2025 CMS bölümü |
| Otomatik test sorunların %57,38'ini bulur | satıcı iddiası | Deque, 13.000+ sayfa; ilk denetimler, tekrarlar sayılmadan |
| Axe sıfır hata = erişilebilir | efsane | Igloo: gövde HTML'i 220 karakter, axe 0 ihlal; test edecek şey yok (bizim ölçüm) |
| Overlay widget'ı siteyi uyumlu yapar | efsane | FTC, accessiBe'ye 1 M $, Nisan 2025; davalarda widget'lı siteler 1.400'den fazla anıldı (UsableNet, ikincil, PDF açılmadı) |
| Caen, 4 Haziran 2026: Carrefour'a altı ay, günlük 500 €, "%100'ün altı geçmez" | uygulayıcı | Silktide, Deque, handicap.fr uyumlu; karar metni okunmadı; 1.000 € davacı talebidir |
| Lille, Mayıs 2026: Auchan davası reddedildi (250 M € eşiği), Douai'de temyiz | uygulayıcı | aynı kaynaklar; orta boy şirket durumu Fransa'da açık |
| EAA para cezası kesildi | teyitsiz | Level Access (19 Haziran 2026) "teyitli ceza yok" diyor; başka blog aksini yazıyor, kanıt vermiyor |
| 2025'te 3.117 federal site davası (+%27), NY 1.021, FL 961, California 4 | uygulayıcı | Seyfarth, Mart 2026; eyalet mahkemeleri hariç. UsableNet federal + eyalet 5.000+ sayıyor |
| "DMARC p=none artık yetmez" | efsane | Google ve Yahoo sayfaları toplu gönderici için p=none'ı kabul ediyor |
| Microsoft kuralı reddeder mi, Junk'a mı atar | çelişkili | Microsoft'un kendi yazısı iki şeyi de söylüyor (5 Mayıs 2025) |
| Cloudflare ücretsiz katman ve WAF siteyi korur | kısmen | iki küresel kesinti: 18 Kasım 2025, 5 Aralık 2025 (Cloudflare postmortem) |

## 3. Dünya seviyesi nasıl yapılır

### 3.1 Yığın seçimi

En iyi stüdyolar önce dört soruyu sorar: yayından sonra içeriği kim değiştirecek, sitenin hareket bütçesi ne, ticaret ne kadar derin, müşteri bizden ayrılırsa siteyi nasıl götürür. Bu sıra uygulayıcı bilgisidir; kontrollü çalışma yoktur. Ölçüm şunu gösteriyor (son 29 Günün Sitesi, ham HTML ve başlıklardan, 2026-11-03; Cartier taramayı engelledi): Nuxt 7, Webflow 6, Next 5, Vite tek sayfa 3, belirsiz 4, Astro 1, Framer 1, WordPress 1. Sunucu izi: Cloudflare 11, Vercel 7, Netlify 5. Ham HTML'de en az 13 sitede GSAP, 11 sitede Lenis görünüyor; paketlenmiş kod açılmadığı için gerçek sayı daha yüksektir.

| İş | İlk seçim | Ne zaman değişir | Platform gideri |
|---|---|---|---|
| Film, 3D, ödül hedefli marka sitesi | Elle yazılmış Nuxt, Next ya da Astro + GSAP + Three.js | Müşteri her hafta kendi düzenleyecekse başına CMS | Vercel Pro 240 $/yıl ya da Cloudflare ~0-60 $/yıl |
| Hareketli pazarlama sitesi, müşteri düzenliyor | Webflow | Tasarımcı bağımsızlığı öncelikse Framer | Webflow CMS 25 $/ay; Framer 10-30 $/ay |
| Çok yazarlı, çok içerikli kurumsal yapı | WordPress blok tema | Ön yüz wow isterse başsız WordPress | Kinsta 35 $/ay'dan |
| Küresel mağaza | Shopify | Ürün mantığı özelse WooCommerce, Medusa | Shopify 27-289 €/ay (elimizde) |
| Mağaza + film bölümü | Shopify ya da Woo arka, özel ön yüz | Bütçe düşükse tema içinde Mux | çift bakım |

Değişenler: Cloudflare, Astro ekibini 16 Ocak 2026'da aldı, MIT lisansı sürüyor. GSAP 30 Nisan 2025'ten beri Webflow'un ücretsiz lisansıyla bütün eklentileriyle ticari kullanılır; lisans Webflow'la yarışan kodsuz görsel araçları dışarıda tutar. Vercel'in kendi sitesi `x-powered-by: next.js, payload` döndürüyor; yani Payload üretim seviyesinde kullanılıyor.

Elimizdekine düzeltme: `PLATFORMS.md` Vercel Hobby'yi 0 $ diye yazıyor; Hobby ticari kullanıma kapalıdır, müşteri işi Pro ister. Aşım 0,15 $/GB'tır.

### 3.2 Müşteri için CMS

Sanity: 20 koltuğa kadar ücretsiz, Growth koltuk başına 15 $, ayda 100 GB; Outletcity'nin görsel adresi Sanity kalıbında ve sayfa kaynağında "sanity" geçiyor (güçlü ipucu, teyit değil). Payload: MIT, kendi sunucumuzda, Next içinde. Strapi: açık çekirdek, Cloud 35/90/450 $. Başsız WordPress: WPGraphQL + Faust (elimizde); müşteri alıştığı paneli korur, bedeli iki sistemin bakımıdır. Kural: içerik modeli şemaya yazılır, müşteriye sayfa değil bileşen verilir; film alanı CMS'te poster, alt yazı ve metin karşılığını zorunlu ister. Böylece erişilebilirlik editörün elinde bozulamaz.

### 3.3 Barındırma, CDN, uç

Statik ya da önbellekli sayfa uçtan verilir; TTFB hedefi sahada 0,8 sn altıdır. Cloudflare Free 0, Pro 20-25 $, Business 200-250 $ (WAF hepsinde, bot denetimi kademeyle artar; WordPress için APO Free'de 5 $/ay). Vercel Pro 20 $ + 1 TB, Netlify Pro 20 $ ve GB başına ~0,13 $. Hetzner + Coolify en ucuz yol (Hetzner 5,99-6,49 €/ay'dan, 65.589★, Apache-2.0); bedeli yamayı, yedeği ve gece nöbetini ofisin üstlenmesidir. Yönetilen WordPress: Kinsta 35 $/ay (14 gün yedek), WP Engine 28 $/ay'dan (yıllık). Ofis kuralı: müşteri başına ayrı proje ve ayrı anahtar; alan adı Cloudflare dışı kayıtçıda da tutulabilir; iki kesinti ders verdi: DNS, vekil ve WAF tek elde ise yedek yoktur.

### 3.4 Medya hattı

Görsel: AVIF %96,33, WebP %97,08 destek (caniuse, 2026-10-29). `<picture>` ile AVIF, WebP, JPEG sırası; `srcset` genişlikleri 480-2560; kahraman görsel `fetchpriority="high"`, asla `loading="lazy"`. Mobil sayfaların %17'si LCP görselini tembel yüklüyor (Almanac 2025); başlangıç ajansının en sık hatası budur. Boyut hedefi kahramanda mobil 150 KB, bu rakam ofis hedefidir.

Video, iki ayrı iş:
- **Kısa sessiz döngü:** 3-8 sn, MP4 (H.264) + AV1/WebM, `muted playsinline`, poster, sayfa başına tek döngü.
- **Film bölümü:** HLS. Apple'ın şartnamesi: 6 sn segment, her 2 sn IDR, varsayılan 2.000 kbit/sn (iOS hücresel 730), merdiven 145 kbit/sn'den 7,8 Mbit/sn'ye, AV1 ve HEVC yalnız fMP4, her zaman SDR H.264 yedeği. Yerel HLS %84,28 (Chrome 142+ dahil), geri kalanına hls.js koşullu yüklenir.

Outletcity ölçümü (390 px, 2026-11-03): iki `mux-player`, biri 1.430 px, öteki 5.444 px aşağıda; `preload=none`, `autoplay muted loop playsinline`, `min-resolution=480p`, `max-resolution=1080p`, telefonda 720×1280 kademe; ilk manifest bu makinede 1,38 sn'de, LCP'den sonra. LCP görseli `?auto=format&q=75&w=516`, base64 bulanık yer tutucu altında; ürün görselleri Fastly'de. 34 ayrı host, reklam etiketleri dahil, buna rağmen sahada geçiyor. Yani hız, filmi kısmaktan değil sırayı doğru kurmaktan geliyor. Poster özniteliği boş; filmler ekran altında olduğu için bu LCP'ye dokunmuyor.

| Servis | Kodlama | Depo | Teslimat | 100 bin × 20 sn (bizim hesap) |
|---|---|---|---|---|
| Mux | ücretsiz (1080p temel) | 0,003 $/dk/ay | ilk 100 bin dk ücretsiz, sonra 0,001 $/dk | 0 $ |
| Cloudflare Stream | ücretsiz | 5 $/1.000 dk | 1 $/1.000 dk | ~33 $ + depo |
| Bunny Stream | ücretsiz | 0,01 $/GB'dan | 0,005 $/GB'dan | 3 Mbit/sn'de ~4 $'dan |
| Kendi FFmpeg + CDN | emek | depo | CDN | Vercel'de 1 TB aşımı 0,15 $/GB |

Bir tuzak: Mux ve Cloudflare dakika sayar, Bunny GB sayar; yüksek bit hızlı filmde Bunny'nin üstünlüğü daralır.

### 3.5 Core Web Vitals ölçümü

Yöntem: pagespeed.web.dev sayfası gizli tarayıcıda okundu; anahtarsız API kotası doluydu (HTTP 429). Mobil, 28 günlük CrUX, 2026-11-03, saniye ve milisaniye. Geçme hesabı üç eşikle yapıldı; kalın sayı eşiği aşar.

| Site | LCP | INP | CLS | Sonuç | Lab |
|---|---|---|---|---|---|
| Lando Norris (Webflow, 21 canvas) | 1,9 | **382** | 0 | kaldı | bitmedi |
| Messenger (abeto) | 0,6 | **293** | 0,01 | kaldı | bitmedi |
| Igloo Inc | **4,5** | 196 | 0 | kaldı | bitmedi |
| Lusion | 2,0 | **433** | 0 | kaldı | bitmedi |
| Active Theory | **2,6** | **257** | 0 | kaldı | bitmedi |
| Bruno Simon | yok | **2.642** | 0 | kaldı | bitmedi |
| Basement (Next) | 1,5 | **1.112** | 0 | kaldı | 71 |
| Resn | **14** | **290** | 0 | kaldı | 64 |
| Locomotive | 1,7 | 127 | **0,14** | kaldı | bitmedi |
| Outletcity Metzingen | 2,3 | 135 | 0,01 | **geçti** | 66 |
| Louis Vuitton | 1,4 | 150 | 0 | **geçti** | 97 |
| Apple iPhone | **3,7** | 111 | 0 | kaldı | 68 |
| Aesop | 1,7 | 123 | **0,12** | kaldı | bitmedi |
| Hermès | 1,3 | **220** | **0,78** | kaldı | 72 |
| Rolex | **4,2** | **369** | **0,27** | kaldı | 52 |
| Gucci | **2,8** | **277** | 0 | kaldı | 81 |
| Stripe | **3,3** | **283** | 0 | kaldı | 54 |
| Linear | **4,3** | **222** | 0 | kaldı | 47 |
| Vercel | 2,0 | **222** | 0 | kaldı | 85 |

Sonuç: 19 sitede 2 geçiş. Bu sayı yalnız bu örnek içindir; rastgele değildir.

Son 29 Günün Sitesi (Treo'nun açık CrUX özeti, bütün cihazlar, alan adı düzeyi, yuvarlanmış; PSI sayfası bu sırada artık yanıt vermedi): 16'sında veri yok, çünkü trafik CrUX eşiğinin altında; 13'ünde veri var, 3'ü geçiyor (Signal-A, Odyssee, TWKS), 10'u kalıyor. Yani Günün Sitesi unvanı sahada hız söylemez; iki kazanan hâlâ `webflow.io` ön izleme adresindeydi.

Dünya seviyesi süreç: `web-vitals` kütüphanesiyle kendi RUM verisi, atıf modu açık; CI'da Lighthouse CI bütçesi (JS, görsel, LCP); CrUX ayda bir müşteri raporunda. Düşük trafikli sitede CrUX veri vermez; o yüzden RUM ilk günden kurulur. Başlangıç ajansı PSI ekranı gösterir, bizim raporumuz 28 günlük sahayı gösterir. Lighthouse artık PSI'da "Agentic Browsing" kategorisi de basıyor (Outletcity 1/2); bu AEO izinin konusu.

### 3.6 WordPress ve WooCommerce

Sıra: blok tema, az eklenti, her eklentinin sahibi ve son güncelleme tarihi bilinir. Güncellemeler önce kopyada, görsel fark testiyle, sonra canlıda. Güvenlik yaması için ayrı hat: 5 saatlik pencere ayda bir bakımla kapanmaz; ya sanal yama (Patchstack 69 $/ay Developer; açık ikizi CrowdSec + Core Rule Set) ya da saldırı yüzeyini düşürmek. `DISALLOW_FILE_EDIT`, 2FA, dosya izinleri 755/644, `wp-config.php` 400/440, otomatik çekirdek güncellemesi (WordPress el kitabı). Woo'da HPOS yeni kurulumda 8.2'den beri varsayılan, eski mağazada elle açılır (`wp wc cot sync`). Sepet, Hesabım ve Ödeme önbellek dışı; `woocommerce_cart_hash`, `woocommerce_items_in_cart`, `wp_woocommerce_session_` çerezleri dışlanabilir. Canlı Woo veritabanı kopyadan ezilmez (elimizde, `WP-WOO.md`).

W122 elimizde ve kullanılır: 14,2 MB → 1,6 MB görsel; 1,78 sn → 830 ms; sayfa önbelleği 501 ms; Cloudflare ile Singapur 712 → 49 ms; ücretsiz üç adım ~%70. Eksikleri: tek bir tanıtım sitesi, sponsorlu son adım, CWV yok, saha yok. "Veritabanı önbelleği yavaşlattı" sonucu Woo'ya taşınmaz: oturum açmış ve sepetli trafik sayfa önbelleğini geçer, nesne önbelleği orada ölçülerek açılır. Minify'ın siteyi bozması adımın kuralı olur: her adım tek tek ölçülür, geri alınabilir.

### 3.7 Güvenlik

Başlık hedefi: HSTS ≥ 1 yıl, nonce'lu sıkı CSP (`script-src 'nonce-…' 'strict-dynamic'; object-src 'none'; base-uri 'none'`), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`. Web'de CSP %21,9, HSTS %36, Permissions-Policy %3,7 (Almanac 2025). Ölçtük: Apple, Stripe, Linear, Vercel CSP gönderiyor; Lando Norris, Igloo, Lusion, Basement göndermiyor. Yani müşteriye "ödüllü sitelerden daha sıkı" demek ölçüyle mümkündür. Etiket yöneticisi CSP'yi zorlar: önce `Report-Only`, sonra zorlama.

Tedarik zinciri OWASP 2025'te A03 oldu. CISA, Eylül 2025'te 500+ npm paketini vuran solucanı duyurdu; ikinci dalga Kasım 2025. Kural: kilit dosyası, `npm ci`, yaşam döngüsü betikleri kapalı, pnpm `minimumReleaseAge` ya da Renovate bekleme süresi (yeni sürüm birkaç gün dinlenir), gitleaks, OSV-Scanner. İstisna: CVSS 10 güvenlik yaması bekletilmez; React2Shell'de sömürü saatler içinde başladı, CISA KEV'e girdi. Statik çıktı bu sınıfı baştan kapatır; sunucu bileşeni gerekmiyorsa kullanılmaz. Sırlar yalnız barındırmanın kasasında; istemci paketine giden `NEXT_PUBLIC_` değişkenleri sır sayılmaz. Bot denetimi: Cloudflare kuralları, formda Turnstile, kayıt ve ödeme uçlarında hız sınırı.

### 3.8 Çalışma süresi, hata, yedek, felaket

Dışarıdan 1 dk izleme (UptimeRobot Solo 9 €/ay; Uptime Kuma açık ikizi, ayrı sunucuda), Sentry (Team 29 $/ay), SSL ve alan adı bitiş uyarısı, kalp atışı izleme cron için. Yedek: 3 kopya, 2 ortam, 1 kopya başka sağlayıcıda; şifreli (restic + rclone). **Geri yükleme üç ayda bir denenir ve kaydı rapora girer**; denenmemiş yedek yedek değildir. Ofis hedefi (önerimiz, sektör sabiti değil): tanıtım sitesi RPO 24 saat, RTO 4 saat; mağaza RPO 15 dakika, RTO 1 saat.

Cloudflare dersi: 18 Kasım 2025'te izin değişikliği Bot Management dosyasını şişirdi, çekirdek trafik 11:20-14:30 UTC bozuldu; 5 Aralık'ta React2Shell'e karşı yapılan WAF değişikliği 25 dakika trafiğin ~%28'ini düşürdü. Yani bir yamanın acelesi kesinti üretti. Üst kademe müşteride ikinci CDN'de statik acil durum sayfası, kısa TTL ve yazılı devir planı bulunur.

### 3.9 DNS ve e-posta

Herkes: SPF ya da DKIM, TLS, ters DNS, RFC 5322, spam oranı < %0,3 (hedef < %0,1). Günde 5.000+ gönderen: SPF **ve** DKIM, DMARC en az `p=none`, hizalama, tek tık abonelikten çıkma; Yahoo çıkışı 2 günde işler. Microsoft 5 Mayıs 2025'ten beri aynı üçlüyü ister. Dünya seviyesi yasal alt sınırda durmaz: `p=none` → rapor okuma (parsedmarc) → `quarantine` → `reject`; DKIM 2048 bit; pazarlama için alt alan adı; site formu işlem e-postası servisiyle (Resend, Postmark elimizde). Yayın gününde hesap: kayıtçı kilidi, CAA, DNSSEC değerlendirmesi. Başlangıç ajansı DNS'i taşırken müşterinin SPF'ini koparır; taşımadan önce bütün kayıtlar dışa alınır.

### 3.10 Çok dil

Dil başına alt klasör varsayılanımızdır. `hreflang` karşılıklıdır: iki sayfa birbirine işaret etmezse yok sayılır; her sürüm kendini ve ötekileri listeler; `x-default` seçici sayfa içindir; `GB` kullanılır, `UK` yok sayılır; `es-419` tanınmaz (Google). Tek yöntem seçilir: başlık, `Link` ya da site haritası. Arapça için CSS mantıksal özellikler ve `dir="rtl"` baştan yazılır; film altyazısı ve poster metni de dile bağlanır. Framer dil başına 20 $, Webflow yerelleştirme ayrı kademe; bedel müşteri teklifine yazılır. Dil değişimi IP ile zorlanmaz, önerilir; bu uygulayıcı kuralıdır.

### 3.11 Erişilebilirlik: ilke, sonra ülkeler

**İlke:** satılan her dijital hizmet engelli kullanıcıya açık olmalıdır; ölçü WCAG AA'dır. Hedefimiz WCAG 2.2 AA'dır. Yeni AA ölçütleri: 2.4.11 odak örtülmez, 2.5.7 sürükleme alternatifi, 2.5.8 hedef boyutu, 3.3.8 erişilebilir kimlik doğrulama. Web gerçeği: ana sayfaların %95,9'u otomatik testte kalıyor, ortalama 56,1 hata, en sık düşük kontrast %83,9 (WebAIM 2026).

| Bölge | Kural | Yaptırım | Not |
|---|---|---|---|
| AB | EAA, 28 Haziran 2025'ten; EN 301 549 V3.2.1 (WCAG 2.1), V4.1.1 (WCAG 2.2) 2 Eylül 2026'da yayımlandı, AB Resmî Gazetesi atfı Kasım-Aralık 2026 bekleniyor | ülkeye göre; Almanya 100 bin €, Hollanda 900 bin € ya da ciro %10 (satıcı özeti) | Hizmette <10 kişi ve ≤2 M € mikro işletme muaf (Alman BFSG §2). Almanya'da özel ihtar mektupları, Hollanda AB dışı satıcılara da yazıyor |
| ABD | Özel sektöre federal web kuralı yok; ADA Title III davaları | uzlaşma + avukat | Devlet için Title II: 50 bin+ nüfus 26 Nisan 2027'ye uzadı; WCAG 2.1 AA |
| BK, Kanada, Avustralya | genel eşitlik yasaları | dava | yeniden ölçülmedi |
| Türkiye, Körfez | kamu ağırlıklı | | özel sektör yükümü bu gece kurulamadı (§9) |

**Avukat sözü gerekir:** AB dışı satıcının kapsamı, mikro muafiyet, orantısız yük beyanı, erişilebilirlik bildirimi metni. Sözleşmeye "tam uyum garantisi" yazılmaz; Carrefour kararı %100 dili kurduğu için bu, ofisi müşterinin yerine davalı yapar.

### 3.12 Gizlilik ve çerez: ilke, sonra ülkeler

**İlke:** gerekli olmayan etiket, seçim yapılmadan çalışmaz; ret kabul kadar kolaydır; seçim kaydedilir; sinyal varsa uyulur. Bu tek davranışı en sıkı bölgeye göre kurmak, ülke ülke ayrı site yapmaktan ucuzdur.

| Bölge | Model | Güncel durum | Yaptırım |
|---|---|---|---|
| AB | önceden rıza (GDPR + ePrivacy) | Digital Omnibus: Komisyon 19 Kasım 2025, Konsey 21 Ekim 2026; kural ePrivacy'de kalıyor, kitle ölçümü ve bağlamsal reklam istisnası, ret sonrası 4 ay; tarayıcı sinyali silindi; Parlamento bekleniyor, 2027'den önce yok | CNIL: Google 325 M €, Shein 150 M € (Eylül 2025; Shein itiraz ediyor) |
| BK | rıza + istisna | DUAA PECR değişikliği 5 Şubat 2026; birinci taraf istatistik ve görünüm istisnası (hukuk bürosu özetleri); ICO rehberi Nisan 2026 | £17,5 M ya da ciro %4 |
| ABD eyaletleri | ret hakkı | California: 25 M $ ciro ya da 100 bin kişi; GPC'ye uymak zorunlu; ~12 eyalet GPC ister (satıcı sayımı, liste çelişiyor) | Healthline 1,55 M $, Sephora 1,2 M $ |
| Türkiye | açık rıza | Kurul 2026/347 ilke kararı: aydınlatma ve açık rıza metni ayrı (RG 24 Mart 2026) | çerezde 300 bin TL örneği (2023) |
| Suudi Arabistan | PDPL rıza | 14 Eylül 2024'ten beri yürürlükte; SDAIA | karar sayısı kaynaklarda çelişiyor |
| BAE | PDPL + DIFC, ADGM ayrı | uygulama yönetmeliği dikkatli kaynaklara göre yayımlanmadı | 2027 son tarihi teyitsiz |
| Katar | Kanun 13/2016 | çerez açıkça düzenlenmemiş (akademik); NDPO rehberi bakılacak | |

Google reklamı varsa Consent Mode v2 (`ad_user_data`, `ad_personalization`) kurulur. Rıza aracı kuralı: seçimi kendimiz saklarız, tarama ayda bir yeni çerezi yakalar, banner LCP'ye engel olmaz. Ofis, müşterinin verisini işliyorsa işleyen sıfatıyla veri işleme sözleşmesi gerekir. **Avukat sözü gerekir:** her pazarın metni, ödeme ya da rıza modeli, sınır ötesi aktarım, BAE ve Körfez'de hangi rejim. Gizlilik metni şablondan müşteriye verilmez; `privacy-dpo` taslak hazırlar, hukuk onaylar.

## 4. Wow ile çatışma

Film, 3D ve hareket azaltılmaz; hangi saniyede neyin çalıştığı yönetilir.

1. **İlk boyama DOM'undur.** Canvas LCP sayılmadığı için ilk metin ve görsel gerçek HTML olur. Igloo gibi 15,4 MB varlıkla ve boş gövdeyle açılan site LCP 4,5 sn veriyor; Lusion aynı sınıfta 2,0 sn.
2. **INP'nin düşmanı ana iş parçacığıdır.** Olay işleyicisi yalnız durum yazar, çizim rAF'te olur; ağır iş parçalanır (web.dev), mümkünse OffscreenCanvas'a taşınır (%96,27). Varlık çözme ve shader derleme, kullanıcı dokunmadan önce biter.
3. **Kare bütçesi:** 60 Hz'de 16,7 ms, 120 Hz'de 8,3 ms. Telefon için çizim çağrısı 100-150 dolayı uygulayıcı rakamıdır, kontrollü ölçüm değildir; `renderer.info` ile o cihazda ölçülür. Geometri meshopt ya da Draco, doku KTX2 (Igloo'nun en büyük dosyaları KTX2); glTF-Transform ile derlemede.
4. **Cihaz kademesi:** detect-gpu ile üç kademe; düşük kademede aynı sahne daha düşük piksel oranıyla, en altta önceden işlenmiş film. Bu kalite kaybı değil, sanat yönetimidir: telefon için ayrı kompozisyon. Pil ve ısı için ekran dışındayken döngü durur.
5. **WebGPU** %85,8, WebGL2 %97,13. Three.js WebGPURenderer'ın WebGL2'ye düşmesi blog kaynaklıdır; yedek yol test edilmeden teslim edilmez.
6. **Lenis** yerel kaydırmanın üstünde çalışır, `respectReducedMotion` varsayılan açıktır. Sınırları kayıtlıdır: Safari'de 60 fps, düşük güçte 30 fps, iframe üstünde durur, `anchors` elle açılır.
7. **Azaltılmış hareket ayrı bir tasarımdır.** Sayfaların yarısı `prefers-reduced-motion` kullanıyor. Kapatmak yerine solma ve duran film karesi konur. Kaydırmanın kendisi kullanıcının denetimindedir, ama paralaks ve kaydırma tetikli hareket 2.3.3 kapsamına girer. Otomatik başlayan ve 5 sn'den uzun film için **duraklat düğmesi A seviyesi zorunluluktur** (2.2.2); yanıp sönme saniyede 3'ü geçmez (2.3.1).
8. **Canvas'ın altında gerçek belge.** Lando Norris: 1 `h1`, `main`, 3.249 karakter metin, 37 bağlantı. Lusion: 1 `h1`, 2.713 karakter. Axe Lando'da 4 kural (kontrast 14, hedef boyutu 8), Lusion'da 3 kural buldu. Igloo'da 14 sn sonra bile `h1`, bağlantı ve metin yok (başsız tarayıcıda; gerçek GPU'da canvas açılabilir), yani ekran okuyucu ve arama motoru boş sayfa görür. Bizim çizgimiz: Lando'nun belgesi, Igloo'nun görüntüsü.
9. **Üçüncü taraf etiket** filmden pahalı olabilir: rıza gelmeden yüklenmez, `fetchpriority="low"` ve boşta çalıştırma ile sıraya girer.

## 5. Aletler

Yıldız ve son itme `gh api`, 2026-11-03. "Önerildi": `PLATFORMS.md`'de adı geçti, kurulu değil.

| Ad | Gerçekte ne yapar | Gerçek mi | İkizi | Bizde | Yeri |
|---|---|---|---|---|---|
| web-vitals | saha ölçümü | 8.667★, 10-30, Apache-2.0 | SpeedCurve, DebugBear (fiyat ölçülmedi) | yok | şablon |
| Lighthouse CI | CI bütçesi | 7.129★, 11-03, Apache-2.0 | Calibre | önerildi | CI |
| sitespeed.io | tekrarlı ölçüm, video | 5.046★, 11-02, MIT | WebPageTest | yok | aylık iş |
| sharp / imgproxy | görsel üretim | 32.820★ / 11.169★, Apache-2.0 | Cloudflare Images 0,50 $/1.000 | yok | raf |
| FFmpeg | kodlama | 66.412★ | Mux, Bunny | var (stüdyo) | stüdyo eli |
| Mux Elements | oynatıcı | 365★, MIT | Vidstack 3.720★, MIT | yok | şablon |
| hls.js / Shaka | HLS oynatma | 17.033★ / 8.269★ | Mux Player | yok | şablon |
| Three.js | 3D | 117.504★, MIT | Spline | yok | usta |
| React Three Fiber | React'te 3D | 33.469★, MIT | aynı | yok | usta |
| glTF-Transform / meshoptimizer | model sıkıştırma | 2.058★ / 8.780★, MIT | RapidCompact | yok | raf |
| detect-gpu | cihaz kademesi | 1.223★, MIT | kendi ölçümümüz | yok | şablon |
| GSAP | zaman çizgisi, kaydırma | 30.125★, Webflow ücretsiz lisansı | Motion 34.854★, MIT | yok | usta |
| Lenis | yumuşak kaydırma | 17.064★, MIT | GSAP ScrollSmoother | yok | usta |
| axe-core | otomatik WCAG | 7.746★, MPL-2.0 | axe DevTools Pro (fiyat kapalı) | önerildi | CI |
| Pa11y | çok sayfa tarama | 4.590★, LGPL-3.0 | Siteimprove, Silktide | yok | aylık iş |
| CookieConsent | rıza arayüzü | 5.740★, MIT | Cookiebot 7-90 €, CookieYes 10-55 $, Usercentrics | önerildi | şablon |
| Uptime Kuma | izleme | 93.226★, MIT | UptimeRobot 9-55 €, Better Stack | önerildi | aylık iş |
| Sentry | hata izleme | 45.700★, kendi lisansı | Sentry Cloud 29 $ | yok | şablon |
| restic / rclone | şifreli yedek | 36.983★ / 60.771★ | BlogVault, Kinsta yedeği | yok | aylık iş |
| Coolify | kendi PaaS | 65.589★, Apache-2.0 | Vercel, Netlify | önerildi | B09/B11 |
| Renovate | bağımlılık güncelleme | 23.005★, AGPL-3.0 | Dependabot | yok | CI |
| gitleaks / OSV-Scanner / Trivy | sır ve açık tarama | 30.642★ / 11.382★ / 38.944★ | Snyk | yok | CI |
| CrowdSec + Core Rule Set | açık WAF | 15.442★ / 3.341★ | Cloudflare WAF, Sucuri 9,99-19,98 $/ay | yok | sunucu |
| WPScan | WP açık tarama | 9.832★, kendi lisansı | Patchstack 69 $/ay | yok | aylık iş |
| parsedmarc | DMARC raporu | 1.314★, Apache-2.0 | Postmark DMARC, dmarcian | yok | aylık iş |

Eski ya da düşmüş: mozilla/http-observatory arşivde (2024-10); Klaro son itme 2025-03. Elimizde olup bu işe bağlanacaklar: Emil'in `animation-performance` skill'i, scrollcraft'ın `encode.sh mobile` ve `--reduced-motion` çekimi, `wp-performance` (WordPress/agent-skills), personalar `testing-accessibility-auditor`, `testing-performance-benchmarker`, `privacy-dpo`, `legal-tr-counsel`, `legal-de-counsel`, `security-engineer`, `engineering-devops-automator`.

## 6. Ofisin işi

**Site ustasının elinde birinci günden:** yığın karar soruları, performans bütçesi, medya sırası, CMS şeması, bileşen kuralı (odak, kontrast, hedef boyutu, azaltılmış hareket), başlık şablonu, RUM. Bunlar sonradan eklenmez, şablona gömülür. Hazır başlangıç deposu her işin ilk commit'idir.

| Zaman | İş | Sahip |
|---|---|---|
| Yapımda bir kez | DNS devri, DMARC, başlıklar, WAF, yedek ve geri yükleme denemesi, izleme, rıza haritası, hreflang, Consent Mode | usta + DevOps |
| Yapımda bir kez, uzman | WebGL kademesi ve shader bütçesi; video merdiveni; ekran okuyucu ve klavye testi; hukuk metinleri | 3D uzmanı, stüdyo, erişilebilirlik denetçisi, hukuk |
| Otomatik, her commit | Lighthouse CI, axe, Playwright (ödeme dahil), gitleaks, OSV, bağımlılık bekleme | CI |
| Otomatik, sürekli | 1 dk izleme, Sentry, RUM, yedek, DMARC raporu, açık bildirimi | makine |
| Aylık | saha CWV raporu, rıza taraması, Pa11y gerileme, güncelleme kopyada, başlık ve TLS kontrolü, CrUX | bakım masası |
| Üç aylık | geri yükleme denemesi, felaket tatbikatı, elle erişilebilirlik örneklemi, eklenti ve bağımlılık ayıklama | bakım masası + denetçi |
| Olay | saatler içinde yama, müşteriye yazılı bildirim | güvenlik + CEO kapısı |

Para çıkışı (Mux, Kinsta, Patchstack, Cloudflare ücretli), sözleşme ve müşteri hesabı bağlama CEO'nun kapısındadır.

## 7. Satılabilecekler

Müşteri altyapıya değil, sitenin ayakta kalmasına ve dava yememesine para verir.

| Ürün | Pazar fiyatı | Kaynak |
|---|---|---|
| Aylık bakım, giriş | 89 $; 39-99 $ beyaz etiket toptan | WP Buffs, GoWP sayfaları, 2026-11-03 |
| Bakım, üst | 179-359 $ | WP Buffs |
| Kademeler | 49-99 / 149-249 / 299-499 / 499-1.500 $ | White Label WP Agency, 2026-08 (satıcı) |
| Eski anket | tek kademe 67 $; en üst ortanca 160 $, ortalama 336 $ | ManageWP 2020, 2.279 yanıt, eski yıl |
| Küçük anket | %57 25-100 $, %33 100-200 $ | MainWP 2023, ~64 yanıt, ikincil |
| Hız düzeltmesi | 150-700 $ tek sefer | W122 (elimizde) |
| Güvenlik, temizlik | 229-549 $/yıl | Sucuri |

Öneri (H5, fiyat kararı CEO'nun): **Çekirdek** 149-249 $ (izleme, yedek, güncelleme, aylık CWV, 2 saat); **Büyüme** 299-499 $ (RUM, rıza taraması, a11y gerilemesi, 4-6 saat, üç aylık geri yükleme); **Film ve Ticaret** 499-1.500 $ (ödeme izleme, ikinci CDN planı, 1 saatlik müdahale, video maliyet takibi). Tek sefer: saha CWV denetimi, WCAG 2.2 denetimi, çerez ve rıza denetimi, DMARC kurulumu; bunlar bakımın kapı açıcısıdır. Araç gideri bizim için site başına: statik site ~5-10 $, WordPress ~50-70 $ (Kinsta 35 $ dahil; izleme, Sentry ve sanal yama müşteriler arasında paylaşılır). Bu hesap bizimdir, model maliyeti içinde değildir.

CEO için tek satır: bakım sözleşmesindeki "garanti" ve iade kalıbının şer'î hükmü W094'te olduğu gibi onda; siber sigorta önerilirse (geleneksel sigorta) aynı. Faiz, kumar bu izde çıkmadı.

## 8. En iyi kaynaklar

- **web.dev ve Chromium metrics changelog:** ölçümün tanımı burada değişir; ortak bilgiye özeti girer.
- **HTTP Archive Web Almanac 2025:** performans, CMS, güvenlik, erişilebilirlik, gizlilik bölümleri; satıcısız sayı.
- **W3C Understanding WCAG 2.2:** her ölçütün niyeti; persona bilgisine girer.
- **WebAIM Million:** yıllık gerçek.
- **Apple HLS Authoring Specification:** kodlama şartnamesi stüdyo eline.
- **Seyfarth ADA Title III blog, UsableNet raporları:** dava verisi.
- **Patchstack yıllık raporu:** satıcı ama tek derin veri; WordPress el kitabı hardening bölümü.
- **Cloudflare postmortem'leri:** felaket öğretisi.
- **Heuking ve Baker McKenzie izleyicileri, ICO, CNIL:** gizlilik gündemi.
- **Three.js Journey (Bruno Simon), Codrops vaka yazıları, Awwwards vaka çalışmaları:** ustaların yöntemi; bu gece okunmadı, sıraya alındı.
- Ortak kütüphaneye girecek dört belge: medya hattı reçetesi, bakım takvimi, başlık ve CSP şablonu, ülke tablosu (§3.11-3.12, üç ayda bir tazelenir).

## 9. Bilinmeyenler

- **Araştırma sınırı:** oturumun ortak WebSearch bütçesi bu iz sürerken bitti. Sınırı dolanmamak için o noktadan sonra sweep, exa ve tavily dahil hiçbir arama kanalı kullanılmadı; yalnız bilinen resmî sayfalar doğrudan okundu. Başta dört sweep koştu (`ground-5-altyapi/`), ama çıktıları ayrıntılı okunmadı; Reddit ve HN boş döndü. Yani uygulayıcı sesi zayıftır.
- **Ölçüm sınırı:** gizli Chrome gece yarısına doğru kilitlendi (giriş anahtar kasası, CEO'nun parolası), kasaya dokunulmadı. Porsche PSI'dan okunamadı. Saha tablosu örnektir, istatistik değildir.
- Türkiye ve Körfez'de özel sektöre erişilebilirlik yükümü; KVKK Çerez Rehberi'nin aslı açılamadı; UK ICO sayfası bot kapısına takıldı; EUR-Lex metni çekilemedi (mikro tanımı Alman BFSG'den). Kapatan: hukukun ilk el okuması.
- CIPA ve piksel davaları, BK/Kanada/Avustralya güncel durumu araştırılmadı.
- Caen kararının metni, temyiz, 22 Eylül 2026 Leclerc duruşmasının sonucu; EAA'da ilk idari ceza.
- Erişilebilirlik denetiminin pazar fiyatı için isimli kaynak bulunamadı; Webflow Enterprise, Shopify Plus, WPML, Polylang, Kinsta dışı yedek fiyatları ölçülmedi.
- INP'nin sebebi ölçülmedi; sitelerin içinde LoAF izi almak gerekir. Saha sayıları Chrome kullanıcılarıdır, iOS Safari CrUX'a girmez; lüks kitlede bu büyük bir kör noktadır, kendi RUM'umuz kapatır.
- WebGPU üretim sorunları ve Three.js sürüm iddiaları yalnız blog kaynaklıdır. Kapatan: gerçek telefonlarda kendi test sahnemiz.
- Reklam etiketlerinin Outletcity'de rıza öncesi yüklenip yüklenmediği ölçülmedi (tarayıcı profilinde seçim izi vardı).
