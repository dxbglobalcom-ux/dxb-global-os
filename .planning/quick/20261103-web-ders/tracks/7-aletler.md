# İz 7: Web işi yapan yapay zekâ ajanları için alet rafı

Bütün yıldız, son itme ve lisans değerleri 3 Kasım 2026'da `gh api` ile ölçüldü. Tablolarda tarih yazılmışsa yıl 2026'dır. Hiçbir şey kurulmadı. Bu dosyadaki eşikler ve raf düzeni önerimdir; karar CEO'nundur.

## 1. Özet

1. Raftaki alet üç sınıfa ayrılır ve değeri sınıfına göre değişir: **ölçü aleti** (Lighthouse, axe), **el** (MCP, CLI) ve **bilgi** (skill). İlk ikisi iyi bir oturumun tek başına üretemediği şeyi verir. Üçüncüsü ise oturumun zaten bildiğini tekrar edebilir.
2. Skill'in değeri ölçüldü ve sonuç karışık. SkillsBench ortalama +16,6 puan buldu. SWE-Skills-Bench'te 49 skill'in 39'u sıfır fark verdi, 3'ü işi bozdu. İkisi de Opus 5.5 üzerinde ölçülmedi.
3. Yıldız ilgi ölçer. Dört büyük tasarım skill'inin (144 bin, 109 bin, 101 bin, 53 bin yıldız) hiçbiri "skill'li/skill'siz" sonucu yayımlamıyor.
4. Holdingin en büyük eksiği doğru tespit edilmiş: ajan kaydırma sahnesini görmüyor. Üstelik bu sorunu tek başına video vermek çözmüyor. Animation2Code'da en iyi modeller görünümde 0,84, zamanlamada en fazla 0,31 aldı; 2 fps yerine 24 fps vermek yalnız 0,30'u 0,31 yaptı.
5. Bu yüzden hareket gözü üç katmanlı kurulur: kaydırmaya kilitli kareler, gerçek zamanlı video ile kare düşme izi, ölçülen hareket sayıları. Yapay zekâ hakem bunların üstünde evet/hayır maddeleriyle karar verir.
6. Hazır bir "hareket gözü" aleti yok. En yakın iki depo 19 ve 17 yıldızlı. Parçalar ise elimizde ya da resmî: `shoot.mjs`, `frames.sh`, Playwright 1.64 video, Chrome DevTools MCP.
7. Komutla yapılan her ölçü, skill'lerin içindeki rehber metinden değerlidir. impeccable'ın 62 kurallı dedektörü bu yüzden en iyi tasarım parçasıdır.
8. Kayıtlarımızda düzeltilecek altı yer var: `claude-ads` diskte yok; OpenSEO'nun 12 skill'i uygulama olmadan durur; Semrush'ın resmî MCP'si var; Framer'ın resmî MCP'si çıktı; WooCommerce'in eski MCP ucu kaldırıldı; Ahrefs ve PostHog'un yerel depoları arşivlendi.
9. Vercel MCP 21 Temmuz 2026'dan beri satın alma yapabiliyor. Bu para çıkışı yoludur ve onay kapısında durmalıdır.
10. `CUPBOARD.md` 1.463 bayt, tavanı 1.500 bayt. Her alete bir dizin satırı oraya sığmaz; iki katmanlı dizin gerekir.

## 2. Kanıt durumu

| İddia | Güç | Kaynak ve tarih |
|---|---|---|
| Hazırlanmış skill başarıyı artırır: %33,9'dan %50,5'e. En çok üç modüllü odaklı skill'ler büyük paketleri geçer. | Kontrollü ölçüm | SkillsBench, arXiv 2602.12670 v4, 14 Haziran 2026; 87 görev, 18 model-koşum düzeni. Opus 5.5 yok. |
| Skill'lerin çoğu fark yaratmaz: 39/49 sıfır, ortalama +1,2 puan, jeton +%10,5, 3 skill en çok −10 puan. | Kontrollü ölçüm | SWE-Skills-Bench, arXiv 2603.15401, Mart 2026; Haiku 4.5 ile. Sürüm uyumsuzluğu bozuyor. |
| Ajanın kendi yazdığı skill işe yaramaz: −1,3 puan. | Kontrollü ölçüm | SkillsBench NeurIPS 2026 poster özeti; yalnız özet okundu. |
| Çok yıldız, iyi alet demektir. | Efsane | Depolarda yayımlanmış sonuç yok; ölçüm bu çalışmada. |
| Modeller web hareketini görür. | Kontrollü ölçüm: yanlış | Animation2Code, arXiv 2606.28593, 26 Haziran 2026: 1.069 animasyon; görünüm en çok 0,84, zamanlama en çok 0,31. |
| Modeller etkileşim ve hareketi en zayıf kuruyor. | Kontrollü ölçüm | WebVR, arXiv 2603.13391: 19 model ortalaması, hareket 38,44; genel estetik 72,57. |
| Yapay zekâ hakem insanla %96 uyuşur. | Kontrollü, küçük örnek | Aynı makale: 50 örnek, 5 uzman, Kimi-K2.5, kod+video. Madde rehberi olmadan uyum %59-67. |
| Claude video alır. | Resmî: yanlış | Claude görsel belgesi: görsel işler, istekte en çok 600 görsel, 128 MB; video geçmiyor. |
| Gemini videoyu saniyede 1 kareyle okur; fps değiştirilebilir. | Resmî | aistudio.google.com/docs/video-understanding; düşük çözünürlükte saniyede ~100, yüksekte ~300 jeton. |
| CLI, MCP'den ucuzdur. | Resmî ve uygulayıcı ayrışıyor | Playwright MCP README'si kodlama ajanı için CLI'yi önerir. Checkly'nin üç koşusu ise tüketimi yaklaşık eşit buldu. Resmî söz esas alındı. |
| Çok araçlı MCP bağlamı doldurur. | Resmî | Anthropic tool search: ~55 bin jeton, yüzde 85'ten fazla düşüş. Cloudflare Code Mode: ~1,17 milyon yerine ~1.000 jeton (satıcı sayfası). |
| axe sorunların %57'sini yakalar. | Satıcı iddiası | Deque 2021, sorun adedine göre. Rakip Evinced Ocak 2026: axe 35 manuel denetimde %22,6. |
| Rich Results Test'in API'si var. | Resmî sayfada yok | Google'ın yapılandırılmış veri sayfası iki aleti adlandırır, API anmaz. URL Inspection API yalnız indeksteki sürümü okur. |
| Yapay zekâ SEO denetimi güvenilirdir. | Uygulayıcı, tek kaynak | eullrich.com, 5 Ağustos 2026: 136 sayfada sayılar doğru, 85 sayfaya dayanaksız "High". |

## 3. Dünya seviyesi nasıl yapılır

**Adım 1: Aleti sınıflandır.** Ölçü aleti sayı üretir. El, oturumun erişemediği yere ulaştırır. Bilgi, oturuma metin ekler. Sınanma yolu buna göre ayrılır:

- **T (tohumlu kusur):** Ölçü aletleri içindir. Bilinen 20 kusur ekilmiş bir deneme sitesi taranır. Öneri eşiği: en az 18 kusur yakalansın, temiz sitede sıfır yanlış kritik çıksın.
- **E (erişim):** Eller içindir. Gerçek bir okuma işi baştan sona biter mi, kaç jetona ve kaça mal olur diye bakılır.
- **K (körlü A/B):** Bilgi içindir. `skill-creator` ile aynı turda skill'li ve skill'siz koşu açılır, `agents/comparator.md` çıktıları A ve B diye kör okur. Öneri eşiği: 5 görev, 3'er koşu, en az 10/15 galibiyet, jeton artışı en çok %30. Görsel işte sonuç CEO'nun gözüne de gider.

T ve E sınıfı aletler, oturumun üretemediği ölçüyü ya da veriyi verdiği için çıplak oturumu tanım gereği geçer. K sınıfında bu ölçülmedi; her satır sınanana kadar "ölçülmedi" yazar.

**Adım 2: Rafa girişte beş kapı.** Emil'in kayıt dosyası bu işin iyi örneğidir.

1. Kaynak resmî mi, kim bakıyor?
2. Son 90 günde itme var mı, belirli commit'e sabitlendi mi?
3. Bütün dosyalar okundu mu?
4. Yazma araçları kapalı mı?
5. Sınıfına uygun sınav sonucu `INSTALL_PROVENANCE` dosyasına yazıldı mı?

**Adım 3: Kapı hattı.** Yayından önce sırayla:

| Kapı | Alet | Eşik |
|---|---|---|
| Hız | Lighthouse CI, sonra Unlighthouse ile bütün site | Saha: LCP ≤ 2,5 sn, INP ≤ 200 ms, CLS ≤ 0,1 (75. yüzdelik, Google). Laboratuvar bütçesi site başına yazılır. |
| Erişilebilirlik | axe-core, Pa11y CI | Sıfır kritik ve ciddi bulgu, sonra elle gezinti. W3C insan değerlendirmesini de ister. |
| Bağlantı | lychee veya linkinator | Sıfır kırık. |
| Şema | Rich Results Test, Schema Markup Validator | Sıfır hata. API bulunmadığı için Playwright ile sürülür. |
| Görsel | Playwright `toHaveScreenshot`, BackstopJS | Bölüm 4'teki iki şerit. |
| Tasarım izi | `npx impeccable detect`, taste-skill denetimi | Bulgu okunur, gerekçeli istisna kaydedilir. |
| Hareket | Hareket gözü | Sahne maddeleri + kare düşme sayıları. |

**Adım 4: Hareket gözü.** Holdingde olmayan ve bu dosyanın en önemli önerisi olan parça budur.

1. *Konuma kilitli kareler.* Her sahne eşit konumlardan çekilir. ScrollCraft'ın `shoot.mjs` aracı bunu yapıyor: perde başına 6 konum, DEAD SCROLL ve FROZEN CLIP uyarıları.
2. *Gerçek zamanlı kayıt.* Gerçek tekerlek girdisiyle gezilir. Playwright 1.64 `fps` seçeneği ve Chrome DevTools MCP `screencast_start` kullanılır. Aynı anda `performance_start_trace` alınır.
3. *Kare sayısı.* Chrome'un kendi ölçüsü Percent Dropped Frames'tir: ortalama, en kötü 1 saniye, 95. yüzdelik. `PipelineReporter` izlerinden okunur; Chrome ekibi `requestAnimationFrame` ile fps saymayı yanlış sayar. Uzun kareler LoAF ile yakalanır. Resmî eşik yoktur. Öneri eşiği: orta sınıf dizüstünde ortalama %5, en kötü pencere %15.
4. *Hareket sayıları.* ffmpeg `freezedetect`, `scdet`, `ssim` donma ve ani geçişleri zaman çizelgesine döker. Referans varsa Animation2Code'un yolu izlenir: görünüm için DreamSim, yörünge için CoTracker3.
5. *Hakem.* Sahne başına evet/hayır maddeler yazılır: giriş kaçıncı karede başlıyor, başlık okunur süre kalıyor mu, çıkış yönü doğru mu. Claude kare sayfasıyla, Gemini aynı videoyla ayrı ayrı okur; ikisi ayrışırsa sahne insana gider. Madde rehberi WebVR'de uyumu %59-67'den %77-87'ye çıkardı.
6. *Sayı hakemi bozar.* Model "akıcı" dese de ölçü %20 düşüş diyorsa ölçü geçerlidir. Animation2Code bu sıranın gerekçesidir.

**Acemi ajansın atladıkları:**

- En çok yıldızlı paketi kurup sınamamak.
- Lighthouse'u yalnız ana sayfada koşmak.
- Skill'in özetine inanıp siteye bakmamak. InstaWP'nin denemesinde beş güncellemeden biri gerçekten olmuş (WP-WOO.md).
- Sürüm sabitlememek. claude-seo'nun açık bir kaydı, DataForSEO MCP v3'te yok olan araç adlarına bakan 16 dosyayı anlatıyor.

## 4. Wow ile çatışma

- **Görsel kapı hareketi kapatır.** `toHaveScreenshot` varsayılan olarak CSS ve Web Animations'ı durdurur. Yerleşim korunur ama gösteri kapıya hiç girmez. İki şerit kurulur: yerleşim için dondurulmuş, sahne için belirli ilerleme değerine sarılmış.
- **Lighthouse kaydırmayı görmez.** Navigation yükü ölçer. Timespan etkileşimi izler ama performans puanı ve LCP vermez. Ağır film ve 3B için puan kapısı yetmez; `lighthouse_audit` da performansı dışarıda bırakır. Yükleme zamanı ile sahne zamanı ayrı ölçülür.
- **axe durum görür.** Sabitlenmiş sahnede tek tarama yetmez. Sahne başına tarama koşar, `prefers-reduced-motion` şeridi ayrıca denetlenir.
- **Sahte yeşil.** Playwright'ın Chromium'u h264 çözmez; klipler boyanmaz, kapı afişe karşı geçer (ScrollCraft `verify.md`). Kurulu Chrome kullanılır.
- **Telefon başka makinedir.** Denemelerdeki "telefonda var, masaüstünde yok" kusuru bu yüzden çıktı. Emülasyon iPhone'un video çözücüsünü taklit edemez. Gerçek cihaz yürüyüşü kalır; BrowserStack sınıfı cihaz bulutu ücretli yedektir.
- **Dedektör gösteriyi azaltmaz.** impeccable ve taste-skill kuralları uyarıdır. Gerekçeli seçim `ignores add-value` ile kaydedilir. ui-ux-pro-max'in sektör paletleri ise ortalamaya çeker; ilk fikir kaynağı yapılmaz.
- **Dondurulabilir sahne.** En iyi sahneler zamanı tek değişkene bağlar. Hyperframes'in determinizm sözleşmesi bunu tarif eder: tüm GSAP zaman çizelgeleri duraklatılıp sarılır, `beginFrame` tek seferde kare alır. Sahneyi `seek` edilebilir yazmak hem kapıyı hem gösteriyi kurtarır.

## 5. Aletler

**Sütunlar.** *Ölçüm*: yıldız · son itme · lisans · fiyat. *Yer*: Raf (ortak skill rafı), Alet (ortak CLI), MCP, Persona, Aylık, İş (iş tipine göre açılır). *H/İ*: hype (D, O, Y) ve ispat yolu (T, E, K). "Fiyat 3." üçüncü taraf kaynağıdır. Fiyatı yazılmayan ikiz ölçülmedi.

### SEO, AEO, içerik

| Alet | Gerçekte ne yapar | Ölçüm | İkizi | Bizde | Yer | H/İ |
|---|---|---|---|---|---|---|
| OpenSEO | Uygulama, MCP, skill | 26,2k · 31 Eki · MIT | Semrush, Ahrefs | 12 skill; uygulama yok, skill bağlantısız durur | Raf + #47 | O/E |
| DataForSEO MCP | SERP, anahtar kelime, site verisi | 259 · 2 Kas · Apache-2.0 · en az 50 $, SERP 0,0006 $'dan | Açık veri ikizi bulunmadı | Yok; para çıkışı | MCP | D/E |
| Ahrefs MCP | Uzak resmî MCP; yerel depo arşiv | 100 · Lite'tan; çağrı en az 50 birim; Lite 129 $ (fiyat 3.) | OpenSEO + DataForSEO | Yok | Müşteri öderse | D/E |
| Semrush MCP | `mcp.semrush.com/v2/mcp`; proje salt okur | Uygun planda 50.000 birim; Pro 139,95 $ (fiyat 3.) | OpenSEO + DataForSEO | Yok | Müşteri öderse | D/E |
| Search Console | Resmî MCP bulunmadı; mcp-gsc topluluk | 2,1k · 15 Eyl · MIT · ücretsiz; inceleme günde 2.000 | SEOgets (W082) | Yok | MCP | D/E |
| Bing Webmaster, IndexNow | AI Performance önizleme; API belgesi bulunmadı; Google IndexNow'da yok | Ücretsiz | Ahrefs Brand Radar | Yok | Aylık | D/E |
| Screaming Frog | v24'te resmî MCP (19 Mayıs) | 199 £/yıl (kaynaklar ayrışıyor) | SEOnaut 855 · 8 Eki · MIT | Yok | Alet | D/T |
| squirrelscan | Ajan için site denetimi, 310+ kural (kendi sözü) | 305 · 3 Kas · MIT | Sitebulb | Yok | Aday | O/T |
| claude-seo | 35 skill paketi; Skool'da özel sürümü var | 26,3k · 1 Kas · MIT | Semrush Site Audit | Yok | Aday | Y/K |
| marketingskills | 53 skill, her biri `evals.json` taşır; ortaklıklarla fonlanır | 58,3k · 31 Eki · MIT | Holo (W093) | Yok | Raf: 3-4 skill | Y/K |
| Otterly, Peec, Profound | Yapay zekâ görünürlük takibi | 29-489 $/ay; Peec 70-360 € (fiyat 3.) | OpenSEO `ai-visibility-audit` | Yok | Aylık | O/E |
| humanizer | Yapay metin izlerini ayıklar | 64,4k · 28 Eki · MIT | Ücretli yeniden yazıcılar | Yok | Raf adayı | O/K |
| Vale | Metin denetçisi; kural dosyasıyla marka dili | 6,3k · 31 Eki · MIT | Acrolinx | Yok | Alet | D/T |

### WordPress, WooCommerce, Shopify, Webflow, Framer

| Alet | Gerçekte ne yapar | Ölçüm | İkizi | Bizde | Yer | H/İ |
|---|---|---|---|---|---|---|
| WordPress agent-skills | Yaklaşık 20 skill; GPT-5.2 Codex yazmış, katkıcılar gözden geçirmiş | 2,3k · 26 Eki · lisans belirsiz | InstaWP | Yok | Raf | D/K |
| mcp-adapter | Abilities API'yi MCP'ye açar | 1,9k · 3 Kas · GPL-2.0 · v0.7.1 | InstaMCP | Yok | İş | D/E |
| WooCommerce MCP | Geliştirici önizlemesi; artık adapter üzerinden | Woo çekirdeğinde | Shopify MCP | Kartta eski yol | İş | D/E |
| WP-CLI | Sitenin kabuktan yönetimi | 5,2k · 2 Kas · MIT | Yönetilen host panelleri | Yok | Alet | D/E |
| Playground + MCP | Atılabilir WordPress | 2,0k · 3 Kas · GPL-2.0 | InstaWP 5 $/site | Yok | İş | D/E |
| Studio CLI | Yerel site, önizleme linki | 548 · 3 Kas · GPL-2.0 | Local, Kinsta | Yok | İş | D/E |
| Shopify AI Toolkit, Dev MCP | Tek `shopify` skill'i; GraphQL, Liquid doğrular; Dev MCP kimliksiz | 627 · 27 Eki · MIT | Medusa | Yok | İş | D/T |
| Webflow MCP + skill | Uzak; GSAP etkileşimi; site açamaz; AEO verisi ücretli eklenti | 140 ve 135 · 27-29 Eki · MIT | Astro + GSAP | Yok | İş | D/E |
| Framer MCP | Geliştirici sayfasında "New"; önizlemede ücretsiz (tek kaynak) | Fiyat 10-30 $/ay | Astro + GSAP | Yok | İş | O/E |

### Tasarım, zevk, hareket, 3B

| Alet | Gerçekte ne yapar | Ölçüm | İkizi | Bizde | Yer | H/İ |
|---|---|---|---|---|---|---|
| Figma MCP | Uzak resmî; tasarımdan kod, tuvale yazma | Full/Dev Pro günde 200; View 20/ay | Penpot 62k · MPL-2.0 | Yok | İş | D/E |
| Framelink | Figma düzenini okur | 16,1k · 27 Eki · MIT | Figma MCP | Yok | Yedek | D/E |
| Stitch | Uzak MCP, DESIGN.md | Skill'ler 8,7k · 17 Ağu · Apache-2.0; ücretsiz, 350 üretim (fiyat 3.) | Figma Make | Yok | İş | O/K |
| 21st Magic | Bileşen arar, üretir | 6,4k · 9 Eyl · ISC; 100 kredi bedava, 400 kredi 20 $ | shadcn, React Bits | Yok | İş | O/K |
| impeccable | 62 kurallı dedektör + 24 komut | 101,5k · 3 Kas · Apache-2.0 · v4.8.0 | Slop denetimi yapan ücretli ikiz bulunmadı | Kapalı, 2 kayıt | Alet | O/T+K |
| taste-skill | Yön dağıtır, üç genişlikte denetler; iş 30-45 dk | 109,5k · 3 Kas · MIT | Ücretli ikizi bulunmadı | Kapalı | Raf adayı | Y/K |
| ui-ux-pro-max | Aranabilir stil, palet, kural tablosu | 144,7k · 2 Kas · MIT | Aynı sınıf ücretli şablonlar | Kapalı | Sınanana dek kapalı | Y/K |
| frontend-design | Anthropic'in kısa tasarım skill'i | 1.1.1 · anthropics/skills 187k | v0 | Kapalı | K sınavında baz | D/K |
| Emil skill'leri | Mikro hareket, cila, UI stres | 53,3k · 2 Kas · MIT · 3 katkıcı | Motion+ AI Kit | 15 skill | Raf | O/K |
| awesome-design-md | Markaların DESIGN.md çözümlemeleri | 125,5k · 28 Eki · MIT | Mobbin | Yok | Başvuru | O/K |
| web-quality-skills | Lighthouse, CWV skill'i (Addy Osmani) | 3,0k · 24 Ağu · MIT | DebugBear | Yok | Raf adayı | D/K |
| gsap-skills | Resmî, 8 dar skill; ScrollTrigger dahil | 17,8k · 29 Tem · MIT | Motion+ AI Kit | Yok | Raf | D/K |
| Motion AI Kit | Motion+ üyeliğiyle skill ve MCP | Motion 34,9k · MIT; Kit ücretli, fiyat bulunmadı | gsap-skills | Yok | Yedek | O/K |
| threejs-skills | three.js yönergeleri | 3,9k · 19 Eki · MIT | Spline | Yok | Raf adayı | O/K |
| Blender MCP | Blender'ı dil modeliyle sürer; topluluk | 33,2k · 29 Eki · MIT | Spline | Yok | Media Studio | O/E |
| ScrollCraft | Kaydırma sahneleri ve denetimi | Kaynak 4,5k · 30 Eyl · MIT | Scroll World 10,8k | Var; dizinde yok | Raf | D/K |
| Hyperframes, Remotion | HTML/React'ten video | 78,3k ve 70,4k · 3 Kas | Runway | EK09 listesinde | Media Studio | D/E |

### Tersine mühendislik

| Alet | Gerçekte ne yapar | Ölçüm | İkizi | Bizde | Yer | H/İ |
|---|---|---|---|---|---|---|
| REA | İkili, paket, tarayıcı çalışma zamanı kanıtı; kaynak varsa kendisi "atla" der | 426,8k · 3 Kas · MIT · 106k çatal, 1.624 izleyici | Ticari çözümleyiciler | Var | Raf | D/E |
| ai-website-cloner | `/clone-website` ile Next.js kopyası | 38,5k · 19 Eki · MIT | Same.new | Yok | Aday | O/K |
| screenshot-to-code | Görselden statik kod | 81k · 27 Eki · MIT | v0 | Yok | Gürültü | Y/K |
| SingleFile, monolith | Sayfanın tek dosya kopyası | 22,8k AGPL-3.0; 15,6k CC0 | Wayback | Yok | Alet | D/E |
| Stack tespiti | webappanalyzer verisi, wappalyzergo, WhatWeb, httpx | 608 · 1,1k · 7k · 10,6k | Wappalyzer ~250 $, BuiltWith 295 $ (fiyat 3.) | Yok | Alet | D/T |

### Kalite, analitik, yayın, reklam

| Alet | Gerçekte ne yapar | Ölçüm | İkizi | Bizde | Yer | H/İ |
|---|---|---|---|---|---|---|
| Playwright, CLI, MCP | Sürüş, video, iz; 1.62'den beri birlikte | 99,2k · 14,9k · 39,1k · Apache-2.0 | BrowserStack | MCP var | Alet + MCP | D/T |
| Chrome DevTools MCP | İz, video, 60 araç | 54,7k · 3 Kas · Apache-2.0 | DebugBear | Yok | MCP | D/T |
| Lighthouse CI, Unlighthouse | Commit başına ve bütün site | 7,1k ve 4,9k | Calibre, SpeedCurve | Yok | Alet | D/T |
| axe-core, Pa11y CI | Erişilebilirlik | 7,7k MPL-2.0; 647 LGPL-3.0 | axe DevTools, Evinced | Yok | Alet | D/T |
| BackstopJS, reg-suit | Görsel fark | 7,2k · 1,3k · MIT | Argos, Chromatic 179 $ | Yok | Alet | D/T |
| lychee, linkinator | Kırık bağlantı | 4,1k Apache-2.0; 1,3k MIT | Ahrefs Site Audit | Yok | Alet | D/T |
| web-motion-skill, claude-eye | Kaydırıp kare sayfası çıkarır | 19 · 17 Ağu; 17 · 29 Oca | Hazır ücretli ikizi bulunmadı | Yok | Yöntem örneği | D/T |
| GA MCP | GA4, salt okur varsayılan | 3,6k · 3 Kas · Apache-2.0 | Plausible, Umami | Yok | MCP | D/E |
| Clarity MCP | Isı haritası verisi | 137 · 24 Şub · MIT · ücretsiz | Hotjar | Yok | MCP | D/E |
| PostHog MCP | Uzak resmî; eski depo arşiv | 40,6k | Mixpanel | Yok | İş | D/E |
| Plausible, Umami, Matomo | Barındırılan analitik; resmî Plausible MCP bulunmadı | 29,8k AGPL · 39,9k MIT · 22k GPL | GA4 | Yok | İş | D/E |
| Vercel MCP | Yayın, log; **satın alma** | Tüm planlar | Coolify 65,6k | Yok | MCP, kısıtlı | D/E |
| Cloudflare MCP | Tek uç, 2.500+ API | Sunucu deposu 4,4k · Apache-2.0 | Coolify | Yok | MCP | D/E |
| Netlify MCP | Uzak, CLI'ye bağlar | 69 · 3 Kas | Coolify | Yok | İş | D/E |
| claude-ads | 12 platform denetimi; salt okur varsayılan | 10,7k · 1 Kas · MIT · 2 katkıcı | Madgicx | **Diskte yok** | Raf | O/K |
| Google Ads MCP | Resmî, salt okur | 1,1k · 2 Kas · Apache-2.0 | Adspirer | Yok | MCP | D/E |
| Meta Ads MCP | Resmî, açık beta, yazabilir | 29 Nisan'dan beri | pipeboard 1,3k | Yok | MCP, yazma kapalı | O/E |

### Bugünkü raf

Ölçülen: `~/.local/share/dxb/skills/` altında apple-design, emil (15), expo, openseo (12), reverse-engineer-anything, stripe-best-practices var. MCP tarafında scrapling ve playwright kayıtlı. Global skill olarak ScrollCraft duruyor. Plugin önbelleğinde impeccable, taste-skill, ui-ux-pro-max, frontend-design, open-design var, hepsi kapalı.

Kusurlar:

- `CUPBOARD.md` rafta openseo, expo, stripe ve ScrollCraft'ı anmıyor.
- `apple-design` iki kopya ve iki `SKILL.md` birbirinden farklı.
- impeccable hem kullanıcı hem proje kapsamında kayıtlı.
- Dört tasarım eklentisi "Phase-8 only" satırının arkasında. Web ofisinin erişimi için bu satır değişmeli; bu onun sözüne bağlı.
- Bütün personalar içinde yalnız bir dosya openseo, impeccable ya da taste-skill'i anıyor. Raf var, ama ustanın elinde değil.
- `claude-ads` için W096 "Kur" demiş, kurulmamış.

### Ortak dolap düzeni

CEO'nun hükmü: alet, skill ve MCP holdingde bir kez durur, ofise kopyalanmaz. Önerim:

1. **Skill:** `~/.local/share/dxb/skills/<aile>/<skill>/` tek kopya; yanında kayıt dosyası: kaynak, commit, tarih, okuyan, sınav sonucu.
2. **CLI:** `~/.local/share/dxb/tools/` tek sürüm.
3. **MCP:** holdingde bir kez kayıtlı, varsayılan kapalı; yazma araçları ve satın alma ayrıca kapalı.
4. **Dizin iki katmanlı:** `CUPBOARD.md`'ye 37 bayt kaldığı için oraya yalnız `INDEX.md`'yi gösteren tek bir satır girer, bunun için de bir satır boşaltılır. `INDEX.md` alet başına bir satırdır ve kayıt dosyalarından üretilir: `ad — ne işe yarar — sınıf — sınav durumu — nasıl açılır`.
5. **Ofis:** Ofis sayfasında yalnız alet adları listelenir. İş tipi paketleri (WordPress, Shopify, Webflow, Framer) iş açılınca etkinleşir.
6. **Öteki ofisler:** Aynı dizinden okur; Playwright ve Cloudflare yalnız web ofisinin değildir.

### Web ofisinin on zorunlusu

| # | Alet | Neden | Durum |
|---|---|---|---|
| 1 | Playwright (CLI + MCP) | Her ölçünün eli; video ve iz | MCP var |
| 2 | Chrome DevTools MCP | Kare izi, ekran kaydı | Eksik |
| 3 | Hareket gözü | Sahneyi ölçen tek parça | Yazılacak |
| 4 | Lighthouse CI + Unlighthouse | Hız bütçesi, bütün site | Eksik |
| 5 | axe-core + Pa11y CI | Erişilebilirlik tabanı | Eksik |
| 6 | lychee + şema kapısı | Bağlantı ve veri | Eksik; şema kapısı yazılacak |
| 7 | impeccable dedektörü | Komutla çalışan tasarım izi taraması | Kapalı |
| 8 | gsap-skills | Dar, resmî, ScrollTrigger | Eksik |
| 9 | Search Console + GA4 + Clarity okuma | Sitenin gerçek verisi | Eksik |
| 10 | DataForSEO + OpenSEO | Pazar verisi | Skill var; 50 $ onda |

Bu ona ek olarak ScrollCraft, Emil, Media Studio ustanın elinde durur. WordPress ve Shopify paketleri iş tipiyle açılır.

### Gürültü

- **Aynı işin kalabalığı:** geo-seo-claude (11,5k; kendi puanının dış dayanağı ölçülmedi), notfair-plugin (4,1k), kostja94/marketing-skills (1,1k; 160+ skill), aaron-he-zhu (yalnız yönlendirme deposu).
- **Raf için fazla büyük:** open-design (565 `SKILL.md`). SkillsBench odaklı paketleri öne koyuyor.
- **Kullanılmaz durumda:** Automattic/wordpress-mcp, PostHog/mcp, penpot-mcp, ahrefs-mcp-server, abilities-api ve lost-pixel arşivde. timecut 2023'ten, schemarama arşivde, structured-data-testing-tool 2023'ten beri itme almamış.
- **Bu iş için yanlış:** screenshot-to-code imza sahnesine yetmez, çünkü hareket taşımaz.

### Eksikler

Hareket gözü, şema kapısı, Search Console okuma eli, stack tespiti, reklam denetimi (claude-ads) ve K sınavı sonuçlarının kendisi. Elimizdeki hiçbir bilgi skill'i için bu ortamda sınav sonucu yok.

## 6. Ofisin işi

| Ne zaman | İş | Kim |
|---|---|---|
| Ofis kurulurken, bir kez | Yeni aletlerin kurulması, T ve E sınavları, K sınavları, `INDEX.md`, hareket gözünün yazımı | Site ustası + inşaat; satın almalar CEO |
| Her işin başında | Referans sitenin dondurulmuş kopyası, stack tespiti, iş paketinin açılması | Site ustası |
| Her yapımda, otomatik | Bölüm 3'teki kapı hattı; her commit'te hız, erişilebilirlik, bağlantı, şema | Komut koşar, usta okur |
| Her imza sahnesinde | Hareket gözü + iki ekran yürüyüşü | Hareket uzmanı ya da taze göz |
| Yayından önce | Bütün site taraması, elle erişilebilirlik gezintisi, gerçek telefon | Kalite koltuğu; erişilebilirlik uzmanı değerli işte |
| Yayından sonra, otomatik | Çalışma izleme (Uptime Kuma; ücretli ikizi Checkly), kırık bağlantı | Zamanlanmış iş |
| Aylık | Search Console, Bing dışa aktarımı, Clarity, AEO takibi; rapor | SEO uzmanı, gerekçesi insan gözüyle |
| Aylık, rafta | Sürüm ve arşiv taraması; yeni sürüm için sınav yenileme | Dolap sahibi |

**Ustanın elinde birinci gün:** on zorunlunun ilk sekizi, ScrollCraft, Media Studio. Ölçü aletleri ustada durur, çünkü site onun sorumluluğundadır. Veri okuma ve reklam denetimi uzmanın işidir, çünkü yorum ister; eullrich'in denemesi bunu gösterir.

**Sınırlar.** Para çıkışı olanlar CEO'da durur: DataForSEO yüklemesi, Figma koltuğu, Vercel satın almaları, Screaming Frog lisansı. Hesap bağlamak kimlik adımıdır. Reklam araçları her kategoriye açıktır; haram kategori müşterisi W096'daki gibi reddedilir, bu karar yine onundur. Yazma yetkili MCP'ler (Meta, WooCommerce, Vercel) önce deneme hesabında ve kapalı açılır.

## 7. Satılabilecekler

Fiyatlar çoğunlukla satıcı sayfalarından gelir; gösterge olarak okunmalıdır.

| Hizmet | Piyasa | Kaynak |
|---|---|---|
| Teknik SEO denetimi | Ortalama 700-1.000 $; Avrupa'da bir ajans 1.500-5.000 € | SEOProfy, 629 Clutch ajansı, 2026; ajans sayfası |
| Elle WCAG denetimi | Küçük site 1.250-2.750 $ (sayfa başı 100-250 $); orta 2.500-7.000 $; Almanya 2.500-6.000 € | Accessible.org; rehber sayfaları, 2026 |
| Aylık SEO | En sık 501-2.000 $/ay | Ahrefs anketi, 439 uzman |
| WordPress bakım paketi | 30-500 $/ay; bir örnek liste 49-199 $ | Rehber ve tek satıcı, 2026 |
| Reklam hesabı denetimi, sonra yönetim | Harcamanın %10-20'si ya da 500-1.500 $/ay | W096 kaydındaki satıcı sayfaları |
| Hareket ve performans denetimi | Ayrı fiyat aranmadı | Bu kalem için kaynak yok. |

Kapı hattının raporu teslimata kanıt olarak eklenir. Ayrıca satılan parça denetim ve aylık izlemedir.

## 8. En iyi kaynaklar

- **SkillsBench ve SWE-Skills-Bench:** Skill'e ne zaman güveneceğini gösterir. Dolap kurallarına girmeli.
- **Animation2Code ve WebVR:** Hareket ölçüsünün tek bilimsel zemini.
- **Chrome ekibi, "smoothness" yazısı (web.dev):** Percent Dropped Frames, kısmi kare, iz olayları. Hareket uzmanının bilgisi olmalı.
- **Playwright sürüm notları:** 1.59 screencast, 1.62 paket, 1.64 fps.
- **ScrollCraft `verify.md`:** Holdingin kendi kazandığı dersler; hareket gözünün başlangıcı.
- **skill-creator:** Holdingin sınav yöntemi.
- **Resmî MCP sayfaları:** Figma, Webflow, Shopify, WooCommerce, Cloudflare, Vercel. Üçüncü taraf listeleri çelişkili olduğundan esas alınmaz.
- **eullrich.com denemesi:** Ajanın ölçüyü yoruma çevirirken nerede uydurduğunu tablo olarak gösteriyor.

Ortak bilgiye girecekler: üç sınıf ve üç sınav, kapı hattı, hareket gözü yöntemi, raf giriş kapıları.

## 9. Bilinmeyenler

- **Opus 5.5'te skill değeri.** Hiçbir yayın bu modelde ölçmedi. Çözümü K sınavlarıdır; önce impeccable, taste-skill, gsap-skills, claude-seo.
- **Gemini'nin hareket yargısı.** Üst fps sınırı belgede yazmıyor; kaydırma sahnesi için hakem kalitesi ölçülmedi. Çözümü 10 sahnelik etiketli küçük bir denemedir ve Gemini anahtarı gerekir. `STACK.md` Gemini'yi anmıyor.
- **Kare düşme eşiği.** Resmî eşik yok; önerim CEO'nun gözüyle ayarlanmalı.
- **Rich Results için API.** Bulunamadı. URL Inspection cevabındaki alanlar okunamadı; `UrlInspectionResult` sayfası gereklidir.
- **Search Console ve Bing için resmî MCP.** Bulunamadı. Tek arama turuna dayanıyor; kesin yokluk kanıtı değil.
- **Fiyatlar.** Motion+ AI Kit, Ahrefs, Semrush, Wappalyzer, BuiltWith, 21st.dev ve Argos ailesi resmî sayfada doğrulanamadı. 21st.dev'in iki resmî sayfası birbiriyle çelişiyor: kredi ve "token" birimleri.
- **Uygulayıcı sesi.** Reddit ve X iki denemede boş döndü; Tavily aylık limitine takıldı, ödeme yapılmadı. Sweep'lerim kendi 170 saniyelik sınırımda kesildi, kanıt satırı üretmedi. Dolayısıyla uygulayıcı tarafı zayıf; bağımsız deneme tek bir yazıyla sınırlı.
- **Framer MCP.** Önizleme ve fiyat bilgisi tek takip sitesinden geldi.
- **Meta Ads MCP'nin yazma kapsamı.** İkinci el kaynaklardan.
- **Yerel model.** Qwen3-VL-8B hareket ölçüsünde 0,24 aldı. Holdingin GPU'sunda hakem olarak denenmedi.
