# Takip 1: SEO, mesleğin tepesinde

Ölçüm tarihi 3 Kasım 2026. Ham kayıtlar: `tracks/ground-1-seo/` (mahkeme PDF'leri, rater kılavuzu, tarama çıktıları).

## 1. Özet

1. Google'ın sıralaması artık tahmin konusu değil, mahkeme kaydıdır. Üç ana kova vardır: konu uygunluğu (bağlantı metni, sayfa gövdesi, tıklama), Navboost (13 aylık tıklama hafızası) ve kalite (Q*, büyük ölçüde site düzeyinde ve sabit). Üstüne derin modeller biner.
2. Sıra şudur: önce sayfa görülebilir olmalı, sonra içerik farklı olmalı, en son ince ayar gelir. Martin Splitt 2026'da şema gibi işleri "son birkaç yüzde" diye tarif etti.
3. Bu ofisin bir numaralı riski ölçüldü: ödüllü WebGL sitelerinin bir kısmı ham HTML'de 2-12 kelime ve sıfır bağlantı veriyor. Apple'ın AirPods Pro sayfası aynı gösteriyi 5.888 kelimelik ham HTML üstünde kuruyor.
4. Çözüm gösteriyi kısmak değildir. Sunucuda üretilmiş tam belge altta durur, film ve 3D onun üstüne biner. İkisi aynı sayfada yaşar.
5. Google JavaScript'i çalıştırır, ama Bing "kritik içeriği istemci tarafına saklama" diyor ve yapay zekâ tarayıcılarının çoğu (Aralık 2024 ölçümü) JavaScript çalıştırmıyordu. Ham HTML üç kitleye de hizmet eder.
6. Core Web Vitals gerçek ama küçük bir sinyaldir. Eşikler p75'te LCP ≤2,5 sn, INP ≤200 ms, CLS ≤0,1'dir. Lighthouse 100 hedef değildir. Canvas LCP adayları arasında yazılı değildir; kırmızı olan çoğu kez yükleme ekranıdır.
7. Yeniden tasarım ve taşıma en pahalı olaydır. 892 alan adı taşımasında ortalama toparlanma 523 gün, %17'si 1.000 günde dönmemiş (üçüncü taraf tahmini veri).
8. 2026 kuralları değiştirdi: FAQ zengin sonucu 7 Mayıs'ta kalktı, llms.txt Google için gereksiz ilan edildi, spam politikası üretken yanıtları kapsadı, Search Console'a üretken yapay zekâ raporu ve çıkış düğmesi geldi.
9. Satılan hava: link paketleri, "AEO/GEO" diye ayrı paketlenen standart SEO, DA puanı, kelime sayısı hedefi, otomatik yazar kutusu.
10. CEO'nun sözü sınandı. "Her biri en mükemmel" doğru çıta, ama kalemler eşit değildir; her kalemi eşit parlatmak ajans tuzağıdır. Elimizdeki H1 ve H2 gelir satırları ile SEO personası düzeltme istiyor (§6).

## 2. Kanıt durumu

| İddia | Güç | Kaynak ve tarih |
|---|---|---|
| Navboost tıklama verisiyle çalışır, 2017'den beri 13 ay (önce 18) | Resmî (mahkeme bulgusu) | [Mehta görüşü, 5 Ağu 2024](https://storage.courtlistener.com/recap/gov.uscourts.dcd.223205/gov.uscourts.dcd.223205.1033.0_4.pdf), FOF ¶96 |
| Üç temel sinyal: anchor, body, clicks; Q* "site ile ilgili, büyük ölçüde sabit"; PageRank Q*'a girdi | Mahkeme delili, görüşme notu; yeminli ifade değil, Google tarafının notu, sansürlü | [PXR0356, H.J. Kim, 18 Şub 2025](https://www.justice.gov/media/1398871/dl) |
| 100'den fazla ham sinyal; üst sinyaller logların doğrusal birleşimi; "clicks are easily manipulated" | Aynı tür not | [PXR0357, Nayak, 31 Oca 2025](https://www.justice.gov/media/1398866/dl) |
| LLM sinyalleri Navboost'un yerini almadı | Resmî (mahkeme bulgusu) | Mehta 2024, ¶102 |
| Gemini'yi besleyen FastSearch RankEmbed tabanlıdır, tam aramadan düşük kalitelidir | Resmî (mahkeme bulgusu) | [Mehta çözüm görüşü, 2 Eyl 2025](https://storage.courtlistener.com/recap/gov.uscourts.dcd.223205/gov.uscourts.dcd.223205.1436.0_1.pdf), ¶44 |
| "Rater verisi sıralamada doğrudan kullanılmaz" | Resmî, ama gerilimli: mahkeme RankEmbed'in rater puanlarıyla eğitildiğini yazar. Sayfaya doğrudan etki yok, modele eğitim etkisi var | [Google](https://developers.google.com/search/docs/fundamentals/creating-helpful-content); Mehta 2025 |
| E-E-A-T bir sıralama faktörü değildir, Trust en önemlisidir | Resmî | Aynı sayfa; [QRG, 11 Eyl 2025](https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf) |
| 2024 sızıntısı: 14.014 öznitelik; ağırlık yok, kullanım kanıtı yok | Belge gerçek, yorumlar uygulayıcı | [Fishkin, 28 May 2024](https://sparktoro.com/blog/an-anonymous-source-shared-thousands-of-leaked-google-search-api-documents-with-me-everyone-in-seo-should-read-them/); Kim notu "eğriler ve eşikler yok" der |
| CWV sıralama sistemlerinde kullanılır, alaka daha ağır basar | Resmî; etki büyüklüğü yayımlanmamış | [Google](https://developers.google.com/search/docs/appearance/page-experience) |
| "Mart 2026 güncellemesi hızı doğrudan faktör yaptı" | Efsane; Google kaynağı yok | Satıcı blogu |
| Google render sürücüsü: medyan 10 sn, p90 ~3 saat, p99 ~18 saat | Satıcı ölçümü, kontrollü ama tek teknik site, Nisan 2024 | [Vercel/MERJ](https://vercel.com/blog/how-google-handles-javascript-throughout-the-indexing-process) |
| Büyük yapay zekâ tarayıcıları JS çalıştırmaz (Gemini ve AppleBot hariç) | Satıcı ölçümü, Aralık 2024, yaşlı | [Vercel](https://vercel.com/blog/the-rise-of-the-ai-crawler) |
| Googlebot HTML'in ilk 2 MB'ını okur (sıkıştırılmamış), PDF 64 MB | Resmî belge, ikincil alıntı; davranış değişimi duyurulmadı | [SEJ, Şub 2026](https://www.searchenginejournal.com/google-updates-googlebot-file-size-limit-docs/566485/) |
| llms.txt, "chunking", özel şema üretken arama için gerekmez | Resmî | [Google, 15 May 2026](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) |
| "Üretken arama için optimizasyon hâlâ SEO'dur" | Resmî, ama Bing GEO'yu ayrı terim olarak kullanır; iki resmî sayfa farklı konuşur | Aynı; [Bing kılavuzu](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) |
| "Haziran 2026'da yeni rater kılavuzu" | Efsane; PDF'in resmî adresi 3 Kasım'da 11 Eylül 2025 baskısını, 182 sayfayı verdi | Kendi ölçümüm |
| Kelime sayısı hedefi işe yarar; tarih değiştirmek tazelik verir | Efsane | Google, aynı sayfa |
| Link hâlâ ilk üç faktörde | Tartışmalı: Illyes "değil" dedi (Eylül 2023); Kim notunda anchor üç temelden biri, PageRank kaliteye girdi | SEL; PXR0356 |
| Title testlerinde %56 olumsuz, %6 olumlu | Kontrollü ölçüm, 2019, seçim yanlılığı var | SearchPilot konuşması |
| FAQ şeması tıklama artırır (%4,3; SearchPilot testlerinin %67'si) | Eski yıl, artık geçersiz: özellik kalktı | Semrush, SearchPilot 2021; Google 8 May 2026 |
| Google başlıkların %61,6'sını yeniden yazar | Uygulayıcı, 2022, ikincil okundu | Zyppy, 80.959 başlık |
| GSC tıklamalarının ~%46'sı sorgusuz gelir | Satıcı ölçümü, 146.741 site | [Ahrefs](https://ahrefs.com/blog/gsc-anonymized-queries/) |
| AI Overview birinci sıranın CTR'sını %58 düşürür | Satıcı ölçümü, korelasyon, masaüstü, Aralık 2025; Pew panelinde %8'e karşı %15 tıklama (Mart 2025) | [Ahrefs](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/), [Pew](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) |
| Taşımada ortalama 523 gün | Uygulayıcı; Ahrefs tahmini trafik, yalnız alan adı değişimi | [Dan Taylor, 8 Oca 2025](https://www.searchenginejournal.com/study-how-long-should-seo-migration-take/492050/) |
| Dijital PR ceza almaz | Efsane, pazarlama cümlesi | Satıcı sayfaları |

## 3. Dünya seviyesi nasıl yapılır

### 3.1 Sıralamadan çıkan iş kuralı
Kayıtlar dört sonuç verir. Konu uygunluğu için sayfa, sorgunun terimlerini ve kavramlarını gerçekten taşır. Navboost sorgu-belge çiftinin tıklama hafızasıdır; konum ve cihaza göre ayrılır, 13 aya yayılır. Başlığın tıklanması ve sonuca dönülmemesi bu yüzden gerçek işin parçasıdır. Tıklama satın almak boşa harcamadır: Nayak notu tıklamanın kolay manipüle edildiğini bildiklerini, makine trafiği spam politikası da yasağı söyler. Q* site düzeyindedir; zayıf sayfa yığını iyi sayfayı da etkileyebilir, bu çıkarımdır. Yeni sitede tıklama verisi azdır; Lehman'ın ifadesiyle genelleme modelleri "tıklama verisindeki delikleri" doldurur, yani yeni sitede dil ve içerik kalitesi daha çok yük taşır.

Mahkemenin veri paylaşım emri (Glue, RankEmbed verisi) henüz SEO işini değiştirmez. Google 16 Ocak 2026'da temyize gitti, ABD Adalet Bakanlığı karşı temyizde; temyiz kararı bulunamadı.

### 3.2 Anahtar kelime ve niyet
Kaynak sırası Search Console, sonra ücretli veri sağlayıcıdır. Sağlayıcı hacimleri tahmindir; Google 5 Haziran 2026'da üçüncü taraf verisinin kendisinden gelmediğini [yazdı](https://developers.google.com/search/docs/fundamentals/third-party-seo). Her hedef sorgu için sonuç sayfası elle okunur: hangi sayfa türü, hangi SERP özelliği, AI Overview var mı. Pew verisinde 10+ kelimelik sorguların %53'ü özet tetiklerken 1-2 kelimelikler %8'de kalıyor; bilgi sorgusu trafiği planında bu indirim yapılır, işlem sorgusu önceliklidir. Her sayfa bir niyetin sahibidir; yamyamlık tablosu yapılır.

### 3.3 Mimari ve iç bağlantı
Her önemli sayfaya en az bir `<a href>` gider; `onclick`, `routerLink` ve `<span>` güvenilir [değildir](https://developers.google.com/search/docs/crawling-indexing/links-crawlable). Para sayfaları ana sayfadan en fazla üç tıkta durur (uygulayıcı kuralı). Bağlantı metni tek başına okunduğunda anlaşılır olmalıdır. Hub-küme yapısı sorgu verisinden çıkar, şablondan çıkmaz. URL'ler tirelidir ve sabit kalır.

### 3.4 Sayfa üstü
`<title>` tektir, açıklayıcıdır ve görünür başlıkla aynı şeyi söyler; Google başlığı H1, og:title ve dış bağlantı metinlerinden [yeniden üretebilir](https://developers.google.com/search/docs/appearance/title-link). Yeniden yazma oranı yüksekse sorun çoğu kez başlık-sayfa uyuşmazlığıdır. Tek görünür H1 kullanılır. Önemli içerik sayfanın üst kısmına yerleşir; Bing bunu kılavuza yazdı.

### 3.5 İçerik ve E-E-A-T
Google'ın 2026 ifadesi "commodity olmayan içerik"tir: başkalarının söylediğini ya da modelin kolayca üretebileceğini yeniden yazma. Rater kılavuzu "Who, How, Why" sorularını sorar; sayfanın sorumlusu, yazarın gerçekliği, müşteri itibarı bulunabilir olmalıdır. Yazar kutusu sinyal değil, gerçeğin görünür hâlidir. YMYL konularda (sağlık, finans, hukuk) uzman imzası şarttır. Üretken yapay zekâ yasak değildir, kılavuz çabaya, özgünlüğe ve katma değere bakar; ölçekli düşük değer "Lowest" alır.

### 3.6 Teknik ayrıntı
- **Tarama:** Tarama bütçesi 1 milyon+ sayfa (haftalık değişim) ya da 10 bin+ sayfa (günlük değişim) sitelerin [sorunudur](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget). Küçük sitede bütçe satmak havadır. Eticarette filtre URL'leri gerçek sorundur.
- **Render:** Yalnız 200 dönen sayfalar güvenle render'a gider. Ham HTML'deki `noindex` JavaScript ile kaldırılamaz, render hiç çalışmayabilir. Durum kodu, canonical, robots ve hreflang ham HTML'de olur. Dinamik render Google'a göre geçici [çaredir](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering); SSR, statik üretim ya da hydration önerilir.
- **İndeks:** "Taranmış, indekslenmemiş" teknik değil içerik sinyalidir. Splitt: "baktık ve 'eh' dedik".
- **Canonical:** Sinyal gücü sırası yönlendirme, `rel=canonical`, site haritasıdır. Web Almanac 2025'e göre sayfaların %2,7-3'ünde render canonical'ı değiştiriyor; bu hata sınıfı SPA'da yaşar.
- **Site haritası:** En çok 50 MB (sıkıştırılmamış) ya da 50.000 URL. `lastmod` yalnız doğruysa kullanılır, `priority` ve `changefreq` yok [sayılır](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- **Yapısal veri:** Organization, Product ve merchant listing, BreadcrumbList, VideoObject, Article, LocalBusiness gerçek karşılık bulur. Şema görünür içerikle aynı olmalıdır. Sıralama vaadiyle satılmaz.
- **CWV:** [Eşikler](https://web.dev/articles/defining-core-web-vitals-thresholds): iyi ≤2,5 sn / ≤200 ms / ≤0,1; kötü >4 sn / >500 ms / >0,25. Sayfa görüntülerinin 75. yüzdeliği, saha verisiyle. 2025'te tüm eşikleri geçen mobil site oranı %48, masaüstü %56 (Web Almanac). Google "mükemmel puan peşinde koşmak" için uyarır.
- **Mobil öncelik:** Yalnız mobilde görünen içerik indekslenir, kullanıcı etkileşimi isteyen içerik [yüklenmez](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing). Masaüstü gösterisi mobilde kısaltılmışsa kayıp buradadır.

### 3.7 Görsel ve video
Google [CSS arka plan görsellerini indekslemez](https://developers.google.com/search/docs/appearance/google-images); indeks için `<img src>`, alt metin, açıklayıcı dosya adı, `og:image` ya da `primaryImageOfPage` gerekir. Video sonucu için [izleme sayfası](https://developers.google.com/search/docs/appearance/video) şarttır: sayfanın ana amacı tek videodur, video başka öğenin arkasında kalamaz, küçük resim sabit URL'dedir, VideoObject verilir. Hero arka plan filmi video sonucu getirmez. Bing görsel ve videonun tek bilgi kaynağı olmamasını, alt metin, altyazı ve döküm verilmesini ister.

### 3.8 Uluslararası
Google hreflang'i `head`, HTTP başlığı ya da site haritasıyla [alır](https://developers.google.com/search/docs/specialty/international/localized-versions); karşılıklı olmayan çift yok sayılır, sayfa kendini de listeler, bölge kodu ISO 3166-1 Alpha-2'dir (`en-GB`; `UK` etkisizdir). Yandex hreflang'i `head` içinde alır, site haritasında [artık almaz](https://yandex.com/support/webmaster/yandex-indexing/locale-pages.html). Bu yüzden Yandex'in olduğu pazarda, Türkiye dahil, varsayılan `head` içidir. Google IP'ye göre içerik değiştirmemeyi ve otomatik yönlendirmemeyi [söyler](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites); dil seçimi görünür bağlantıdır. Yapı kararı: tek marka ve tek ekip için alt klasör, ülke hukuku ve operasyonu ayrıysa ülke uzantısı. Ahrefs'in "%67 hatalı" rakamı (374.756 alan adı, 2023 sunumu) şişiktir: %56,3 zorunlu olmayan x-default eksiğidir. Gerçek eksik karşılık oranı %15,3'tür. Stox "öz referans zorunlu değil" derken Google "must" der; resmî sayfa geçerlidir.

### 3.9 Motorlar yan yana (StatCounter, Ekim 2026)

| Motor | Pay | Araç ve bildirim | JavaScript | Fark |
|---|---|---|---|---|
| Google | Dünya %91,05 | Search Console; IndexNow listesinde yok | Render eder, kuyrukla | Hreflang tam |
| Bing | Dünya %4,8; Japonya %32,51 (bu rakama şüpheyle bakılır) | BWT; IndexNow akışı | "İstemciye saklama" | Copilot dayanağı; 302 yalnız 2 günden kısa; NOARCHIVE Copilot'tan çıkarır; `data-snippet`. Dil için `html lang` kullanılır, resmî hreflang belgesi bulunamadı |
| Yandex | Rusya %70,22; Türkiye %21,63 | Webmaster; IndexNow (Ekim 2021) | JS ayarı var (Mayıs 2022) | Turbo 1 Nisan 2025'te kapandı; 2023 kod sızıntısı 1.922 faktör, ağırlıksız |
| Baidu | Çin %49 (aynı tabloda Yandex %11,77, Çin rakamına temkinli bakılır) | ziyuan.baidu.com | Ajanslara göre zayıf; resmî metin okunamadı | ICP ve barındırma ajans kaynaklı ve çelişkili; hukukçu kararı gerekir |
| Naver | Kore: StatCounter %42,25; InternetTrend %66,69 (Temmuz 2026, InterAd alıntısı) | Search Advisor; IndexNow | Doğrulanamadı | Kendi blog ve kafe içerikleri, AI Briefing, C-Rank ve D.I.A.: ajans anlatımı |

Bildirim için IndexNow bir kez kurulur; [Amazon, Bing, Naver, Seznam, Yandex, Yep](https://www.indexnow.org/faq) paylaşır, indeks garantisi vermez. Personamız `marketing-baidu-seo-specialist` duruyor; Naver ve Yandex karşılığı yok.

### 3.10 Yerel SEO
Google üç eksen [söyler](https://support.google.com/business/answer/7091): alaka, mesafe, tanınırlık; yorum ve bağlantılar tanınırlığa girer, para ile sıralama satın alınmaz. Whitespark 2026 (6 Kasım 2025, 47 uzman, 187 faktör, görüş anketi): ana kategori, mesafe, işletme adında anahtar kelime, şehirde fiziksel adres, arama anında açık olmak. Üçüncü madde kural ihlalidir: ad gerçek dünyadaki ad [olmalıdır](https://support.google.com/business/answer/3038177), gereksiz ekleme askıya alma getirir, sanal ofis profil alamaz. Yani çalışan şey her zaman yapılabilir şey değildir. Aynı ankette hizmet başına ayrı sayfa organik yerelde birinci faktördür. Sahte yorum ABD'de [FTC kuralıyla](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials) yasaktır; Google da Temmuz 2026'da yorum snippet kuralına ekledi.

### 3.11 Link ve dijital PR
Gerçek olan: özgün veri, gazetecinin alıntılayacağı çalışma, marka adına bağlantı, ilgili sektör sitesi. Ceza getiren: satın alma, ağlar, son kullanma tarihi geçmiş alan adı istismarı, site itibarı istismarı. Bing de link satın almayı ve özel ağları sayar. Disavow yalnız manuel işlem riski varsa [kullanılır](https://support.google.com/webmasters/answer/2648487). Ankete göre dijital PR link maliyeti ~597 $ (satıcı, ~70 ajans). Kimse "ay başına 10 link" sözü vermez. Illyes'in Eylül 2023 sözü ile Kim notu birlikte okunur: az sayıda güvenilir bağlantı işe yarar, hacim satın alınmaz.

### 3.12 Taşıma ve yeniden tasarım
Trafik yedi yerde kaybolur: eşlenmemiş URL, ana sayfaya toplu yönlendirme (soft 404), kaybolan iç bağlantı, ham HTML'den düşen metin, canlıda kalan `noindex` ya da robots engeli, aynı anda alan adı + CMS + tasarım değişimi, kısa ömürlü yönlendirmeler. [Google](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes): yönlendirmeler en az 1 yıl, zincir ideali en fazla 3 ve 5'ten az, Googlebot 10 sıçramaya kadar izler, tek seferde tek değişiklik, orta site için "birkaç hafta". Bu süre indekste taşınmayı anlatır, trafik toparlanmasını değil; Taylor'ın 523 günüyle çelişmez, başka şey ölçer. Haziran 2026'dan beri Change of Address tüm www ve alan adı varyantları için yapılır.

Sıra: tam tarama ve log; GSC'den 16 aylık sayfa ve sorgu; 1:1 URL haritası; şifreli ve `noindex` sahne; başlık, canonical, şema, kelime, iç bağlantı karşılaştırma taraması; 301 testi; düşük trafikli saat; canlı log ile 404 izleme; eski harita bir süre açık. Sunucu değişiminde tarama hızı birkaç gün [düşebilir](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes), normaldir.

### 3.13 2025-2026'da değişenler
- **Çekirdek:** [Panoya göre](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history) 2025 Mart, Haziran, Aralık; 2026 Mart, Mayıs. 2026 spam: Mart, Haziran, Ağustos, Eylül. Şubat 2026 Discover güncellemesi. Duyurulmayan küçük çekirdek güncellemeleri Aralık 2025'te belgelendi.
- **Politika:** Geri tuşu kaçırma (Nisan), spam bildirimi manuel işleme gidebilir (Nisan), spam politikası üretken yanıtları kapsar (Mayıs). AB soruşturması sonrası site itibarı istismarında AEA manuel işlemi 30 Ağustos'ta kalktı; AEA dışında sürüyor.
- **Ölçüm:** num=100 Eylül 2025'te kapandı, gösterim serisi kırıldı. Üretken yapay zekâ raporu 31 Ağustos 2026'da herkese açıldı: gösterim var, tıklama ve sorgu yok. Çıkış düğmesi [sıralama sinyali değildir](https://blog.google/products-and-platforms/products/search/new-controls-website-owners/). Bing AI Performance 10 Şubat 2026'da açıldı.
- **Özellik:** FAQ kalktı; Preferred Sources tüm dillere ve yapay zekâ yüzeylerine geldi; CrUX soft navigation deneysel verisi 13 Ekim 2026'da yayımlandı.
- **Yapay zekâ özeti:** Similarweb ve Semrush sorguların %43-48'inde AI Overview ölçüyor (satıcı, Temmuz 2026).

**Acemi ajansın atladıkları:** ham HTML kontrolü, log okuma, karşılaştırma taraması, marka dışı ayrım, şablon bazlı CWV, Yandex'in hreflang farkı, GBP kural kontrolü.

## 4. Wow ile çatışma

Kendi ölçümüm. Ham: `curl`, Googlebot kimliği. Render: Chromium headless, 412 px, yazılım GPU, kaydırma yok, 6 sn bekleme. Tek koşu, laboratuvar.

| Site | Ham kelime | Görünür / DOM kelime | Render bağlantı | H1 | LCP öğesi |
|---|---|---|---|---|---|
| igloo.inc | 2 | 0 / 14 | 0 | 0 | `::before` |
| activetheory.net | 6 | 5 / 5 | 0 | 1 | H1 |
| resn.co.nz | 12 | 12 / 24 | 0 | 1 | H1, 11,9 sn |
| lusion.co | 385 | 878 / 343 | 28 | 1 | H1 (3 canvas var) |
| immersive-g.com | 457 | 15 / 1.148 | 24 | 1 | DIV |
| bruno-simon.com | 566 | 0 / 986 | 19 | 0 | yok |
| apple.com/airpods-pro | 5.888 | 4.134 / 10.978 | 458 | 1 | IMG |

Ödül almak arama görünürlüğü demek değildir, ama iki yol da aynı gösteriyi yapabiliyor. Lusion, Immersive Garden ve Bruno Simon canvas altına anlamsal katman koymuş; Apple tam belge üstüne film bindiriyor. Bizim standardımız Apple düzeni olmalıdır.

**Çözümler:**
- **Belge önce:** Astro ya da Next.js ile sunucuda tam HTML gelir, sahne sonra hydrate olur. Canvas'ta söylenen her cümle DOM'da da vardır. Müşteri projesinde bu tartışılmaz.
- **Gizli katman sınırı:** Görünmeyen ama DOM'da duran metin yalnız ekrandakinin aynısı olabilir. Farklı metin gizli metin ya da cloaking politikasına girer. Metni görünür tutmak ve sahneyle hareketlendirmek en temiz yoldur.
- **Sahne başına URL:** Tek canvas içinde dolaşılan ürün, proje, oda Google için tek sayfadır. Her önemli durum gerçek `<a href>` ve gerçek URL alır; geçiş View Transitions ya da istemci yönlendirmesiyle aynı gösteriyi korur.
- **Kaydırma:** "Google Search does not interact with your page." Kaydırmada eklenen içerik görülmeyebilir. Metin yüklemede DOM'dadır; kaydırma yalnız görünüşü oynatır.
- **LCP:** Canvas, [LCP aday listesinde](https://web.dev/articles/lcp) ve [W3C metninde](https://www.w3.org/TR/largest-contentful-paint/) yoktur. Lusion'da LCP H1 çıktı. Yani metrik yeşilken sahne gelmemiş olabilir; kullanıcı gözü ayrıca ölçülür. Opaklığı 0 olan öğe aday olmaz, tam ekran görsel arka plan sayılabilir. Tüm sayfayı örten yükleme ekranı LCP'yi geciktirir; Resn'in 11,9 sn değeri bu tipe işaret eder, ama yazılım GPU rakamıdır. Çare: H1 ve poster ilk boyamada görünür, sahne arkadan yüklenir. Film için `<video poster>`, ilk kare ya da poster hangisi erkense LCP odur; poster hafif ve önceden yüklenir.
- **INP:** Render döngüsü ana iş parçacığından çıkar (`transferControlToOffscreen`). Splitt 2021'de worker'ların Googlebot'ta beklendiği gibi çalışmadığını söyledi; bu yüzden worker görsel işi yapar, içerik üretmez.
- **CLS:** Hareket `transform` ile [yapılır](https://web.dev/articles/cls). Kaydırma, kullanıcı girdisi muafiyetine girmez; sabitlenen sahnede yerleşim değiştiren animasyon doğrudan CLS yazar.
- **2 MB:** Satır içi sahne JSON'u, base64 ve şişkin hydration verisi HTML'e girmez. Medyan HTML 33 KB'tır, bizim sitelerde asıl risk budur.
- **SPA ölçümü:** Soft navigation deneysel veride SPA ağırlıklı Android sitelerde "iyi" LCP %26'dan %87'ye [çıkıyor](https://web.dev/blog/cwv-experimental-soft-navs/). Hedef Mayıs 2027; sonrasında Search Console yeni veriye geçer. Sıralamaya etkisi yazılmadı.
- **Görsel envanter:** Sahnede kullanılan ana görseller sayfada `<img>` olarak da yer alır; film için ayrı izleme sayfası ve döküm yapılır. Bu Google Görseller ve Video trafiğini açar.

## 5. Aletler

GitHub sayıları 3 Kasım 2026'da okundu.

| Alet | Gerçekte ne yapar | Gerçek mi | Eşi | Bizde | Yeri |
|---|---|---|---|---|---|
| Search Console + API | Birinci taraf veri, URL Inspection | Resmî, ücretsiz | Ahrefs, Semrush (tahmin verisi) | Bağlı değil | Her site, ilk gün |
| mcp-gsc | GSC'yi ajana bağlar | 2.098★, Eyl 2026, MIT | Ahrefs MCP | Plan | MCP |
| Bing Webmaster | Bing verisi, atıf raporu | Resmî, ücretsiz | Topluluk MCP'leri (≤2★) zayıf; doğrudan API | Plan | Aylık iş |
| Screaming Frog | Tarama, JS render, hreflang, karşılaştırma | €245/yıl; 500 URL ücretsiz, JS dahil | SiteOne Crawler (997★, Eyl 2026, MIT) | Yok | Kurulum, CEO onayı |
| Unlighthouse | Tüm site Lighthouse | 4.931★, Eki 2026, MIT | DebugBear, SpeedCurve (fiyat ölçülmedi) | Yok | Ortak raf |
| Lighthouse CI | Commit başına bütçe | 7.129★, Kas 2026, Apache-2.0 | Aynı | Plan | Yayın kapısı |
| web-vitals + CrUX API | Saha verisi | 8.667★, Eki 2026, Apache-2.0 | RUM satıcıları | Yok | Her site |
| Playwright | Ham ve render DOM karşılaştırma | Bugün kullanıldı | Screaming Frog | Var | Yayın kapısı |
| OpenSEO | Kelime, sıra, backlink, denetim | 26.239★, Eki 2026, MIT; veri ücretli | Ahrefs (Lite €119'dan), Semrush (Pro 139,95 $, ikincil kaynak) | 12 skill rafta, uygulama #47'de | Ortak raf |
| DataForSEO | SERP ve kelime API'si | MCP 259★, Kas 2026, Apache-2.0; ~50 $ alt yükleme | Ahrefs, Semrush API | #47'de, para onda | MCP |
| SerpBear | Kendi sıra takibimiz | 2.164★, Eki 2026, MIT | AccuRanker (ölçülmedi) | Yok | Aylık iş |
| GoAccess | Log analizi | 21.112★, Eki 2026, MIT | Screaming Frog Log Analyser | Yok | Taşımada |
| CausalImpact | Önce-sonra etki ölçümü | 1.865★, Mar 2026, Apache-2.0 | SearchPilot, SplitSignal | Yok | Test |
| Sitebulb, Lumar, Botify | Kurumsal tarama | Fiyat özel ya da doğrulanmadı | SiteOne, Unlighthouse | Yok | Yalnız büyük müşteri |
| Local Falcon | Geo-grid yerel sıra | Fiyat okunamadı | DataForSEO ile kendi taramamız | Yok | Yerel paket |
| IndexNow | Bing, Yandex, Naver bildirimi | Açık protokol | BWT URL gönderimi | Plan | Yayın kapısı |
| Rich Results Test, schema.org | Şema doğrulama | Resmî; 6.297★ | Screaming Frog | Var | Yayın kapısı |

Hreflang için gerçek açık kaynak denetleyici bulunamadı (en iyisi 1★); ofis kendi betiğini yazar, Screaming Frog ikizidir.

## 6. Ofisin işi

**Elimizde yanlış ya da eksik olanlar:**
- `marketing-seo-specialist` personası 12 Temmuz 2026 tarihli. Metin aramasında render, WebGL, taşıma, GBP, Bing, Yandex ve Naver geçmiyor. Bu dosya ofisin ana açığıdır.
- OpenSEO skill'leri fırsat bulmakta iyidir, sağlayıcı verisinin tahmin olduğunu dürüstçe söyler. Lighthouse varsayılan kapalı; metinlerinde hreflang, Core Web Vitals, IndexNow ve taşıma adımı yok. Teknik denetimin yerini tutmaz.
- **H1 (yerel aday siteleri):** Şehir × hizmet çoğaltması doorway ve ölçekli içerik politikasına temas eder; sanal adres GBP alamaz. M#10 açıklaması dürüstlüğü çözer, politika riskini çözmez. Sayı büyüdükçe risk büyür.
- **H2 (dizinler):** Gerçek ve tazelenen özel veri varsa ayakta durur; yoksa aynı politika geçerlidir.
- W073 (Searchmaxxed) paketi hizmet şartnamesi olarak faydalı. "AEO/GEO" etiketi Google'ın Haziran 2026 sayfasında sınanacak hizmet olarak geçer. Günlük GBP gönderisinin değeri kanıtlanmadı.
- Dosya 7 yığınına eksik eklenecekler: log analizi, taşıma süreci, Yandex ve Naver paneli, IndexNow.

**CEO'ya tek satır:** Satın alınan yorum ve kendini firma gibi gösteren yerel site aldatma sorusu açar (M#10, M#11 dışarıda bıraktı); karar onda.

| Aşama | İş | Sahibi |
|---|---|---|
| Brif | Sorgu ve niyet haritası, URL planı, pazar ve motor seçimi | Uzman |
| Tasarım | Sahne başına URL, H1, film izleme sayfası, metin katmanı | Usta + uzman |
| Yapım | SSR, `<a href>`, ham HTML, şema, hreflang, görsel envanter | Ön yüz, usta kontrol eder |
| Yayın kapısı (otomatik) | Ham HTML'de H1 ve ana metin; 200 ve canonical; `noindex` taraması; bağlantı grafiği; Lighthouse CI; şema; ham ve render karşılaştırma | Kapı, kırmızıda yayın durur |
| Canlı | GSC, BWT, Yandex, IndexNow, site haritası, web-vitals | Uzman |
| Taşıma varsa | §3.12 süreci, uzman imzası olmadan alan adı değişmez | Uzman |

**Ofis çıtası (bizim önerimiz, Google'ın değil):** p75 LCP ≤2,0 sn, INP ≤150 ms, CLS ≤0,05; ham HTML ≤500 KB; para sayfası derinliği ≤3.

**Ustanın ilk günden elinde olacaklar:** ham HTML kuralı, sahne başına URL kuralı, Googlebot'un etkileşmediği bilgisi, yükleme ekranı yasağı, görsel ve video envanteri. Bunlar sonradan eklenmez, mimari kararıdır. Sıralama işi uzmanındır; görünürlük işi ustanındır.

**Otomatik (haftalık):** GSC verisini kendi deposuna çekme (Google 16 ay tutar), anomali uyarısı, Status Dashboard takibi, tarama farkı, 404 logu, CWV şablon bazlı.

**Aylık program:**
1. Tarama farkı ve düzeltmeler.
2. Marka dışı sorgu değişimi, kaybeden sayfalar.
3. En çok getiren 20 sayfanın tazelenmesi ve bir yeni özgün içerik.
4. Şablonu olan sitede bir test; küçük sitede CausalImpact ile önce-sonra, sınırlı güvenle.
5. Dijital PR ve bağlantı kaydı.
6. Yerel müşteride GBP, yorum yanıtı, geo-grid.
7. Tek sayfa rapor.

**Rapor:** Marka dışı tıklama, organik dönüşüm ve gelir, para sayfası indeks oranı, şablon bazlı CWV p75, sabit sorgu sepetinde pay, üretken gösterim (Google), atıf (Bing). Rapora girmez: DA, ortalama sıra tek başına, Eylül 2025 öncesi ile gösterim karşılaştırması. Ajan taslak yazar, uzman imzalar.

## 7. Satılabilecekler

Google 2026 sayfası garanti verilemeyeceğini söyler; sözleşmeye sıra garantisi yazılmaz.

| Kalem | Piyasa çıpası | Not |
|---|---|---|
| Aylık SEO | En yaygın 501-1.000 $ (%20,4); ajans ort. 3.209 $, danışmanlık 3.250 $, serbest ~1.349 $; küresel sağlayıcı 3.474 $, yerel 1.557 $ ([Ahrefs](https://ahrefs.com/blog/seo-pricing/), 439 sağlayıcı, 15 Ağu 2024; üst dilimi varsayar) | Backlinko Aralık 2025: 1.000-2.500 $ (ikincil); SE Ranking 2023 medyan 891 $ |
| Proje (denetim, kurulum) | En yaygın 2.501-5.000 $; ajans ort. ~9.508 $ (Ahrefs) | Taşıma kalemi için ayrı fiyat bulunamadı |
| Saatlik | Ajans ~99 $, danışmanlık ~171 $, serbest ~72 $ (Ahrefs) | Hindistan'da %85,7 ≤30 $/saat; bölge farkı büyük |
| Dijital PR | Link başına ~597 $ (satıcı) | Sonuç garantisi yok |

Müşterinin gerçekten ödediği üç şey: gösteri sitesinin bulunur olması, yeniden tasarımda trafiğini kaybetmemek, gelire bağlanan aylık iş. Bizim farkımız birincisidir. "Wow + indekslenebilir" yapım fiyatı ayrı kalem değil, H5 yapımının içindeki güvencedir; taşıma sigortası ayrı satılır. Ayda 500 $ bandı bizim seviyemiz değildir.

## 8. En iyi kaynaklar

**Belgeler (ortak kütüphaneye girer):** Search Central ve [değişiklik günlüğü](https://developers.google.com/search/updates), Status Dashboard, QRG PDF'i, Mehta 2024 ve 2025 görüşleri, PXR0356 ve PXR0357, Bing kılavuzu, web.dev Web Vitals, Web Almanac SEO ve Performance bölümleri, Yandex ve Naver panel belgeleri.

| Kişi | Neden | Sınama sonucu |
|---|---|---|
| Martin Splitt, John Mueller, Gary Illyes (Google) | Render ve tarama için birinci el | İşverenleri adına konuşurlar; mahkeme kaydıyla karşılaştırılarak okunur. Danny Sullivan 1 Ağustos 2025'te liaison rolünden çıktı |
| Rand Fishkin | Sızıntıyı açan kişi | Tıklama iddiası mahkemede doğrulandı. "Marka linkten önemli" kendi görüşüdür; kendisi ağırlık bilinmediğini ve SEO'dan uzaklaştığını yazar |
| Mike King | Sızıntının teknik okuması | Fishkin'e göre inceleme bir hafta sonu sürdü; ajans sahibidir |
| Will Critchlow, SearchPilot | Sektörün az bulunan kontrollü testleri | Satıcıdır; genel kazanma oranı güncel bulunamadı, FAQ örneği eskidi |
| Dan Taylor | Taşıma verisi | Tahmini trafik, yalnız alan adı taşıması |
| Patrick Stox | Hreflang ve teknik | "Sorun" sayımı zorunlu olmayanları da içerir |
| Darren Shaw | Yerel faktör anketi | Görüş anketidir, kuralla çelişen madde taşır |
| Joy Hawkins | Yerel testler | Birincil yazıları okunamadı, güven verilmedi |
| Cyrus Shepard | Büyük örneklem iç bağlantı ve başlık | Korelasyondur; "5 kat" rakamı ikincilden, doğrulanmadı |
| Barry Schwartz | Sektörün kayıt defteri | Muhabirdir, yöntem kaynağı değildir |
| Aleyda Solis, Glenn Gabe, Lily Ray, Kevin Indig | Taşıma, çekirdek güncelleme vakaları | Hata kaydı araması sonuçsuz kaldı; sınanmadı, öyle yazılır |

Ortak kütüphaneye konacak olan bir özet değil, üç şeydir: kanıt tablosu, yayın kapısı listesi, taşıma süreci. Personalar bu üçüne bağlanır, ayda bir değişiklik günlüğüyle güncellenir.

## 9. Bilinmeyenler

- **Googlebot'ta WebGL:** Render servisinin WebGL çizip çizmediği, canvas üzerindeki metni okuyup okumadığı için Google belgesi bulunamadı. Küçük bir test sitesi ve URL Inspection ekran görüntüsü çözer.
- **Opaklığı 0 başlayıp kaydırmada açılan metnin ağırlığı:** Belgelenmemiş; "uzun viewport" iddiası doğrulanamadı. Aynı test çözer.
- **CWV'nin etki büyüklüğü:** Yayımlanmamış. Hiçbir çalışma nedensellik kurmuyor.
- **Ödüllü sitelerin saha verisi:** PSI kotası 429 verdi; CrUX anahtarıyla tamamlanır.
- **Yapay zekâ tarayıcılarının 2026 davranışı:** Elimizdeki ölçüm Aralık 2024'tür. Kendi loglarımız çözer.
- **Bing'in hreflang tutumu, Baidu'nun JS ve ICP kuralı, Naver'in JS ve hreflang kuralı:** Resmî metin okunamadı. Yerel hukuk ve panel erişimi gerekir.
- **Çin ve Japonya StatCounter payları:** Örneklem etkisi şüphesi var; ikinci kaynak bakılmadı.
- **Yorum hukuku:** ABD dışında (AB, Birleşik Krallık, Körfez, Türkiye) ölçülmedi.
- **Taşıma ve kurumsal retainer piyasa fiyatı:** İsimli kaynak bulunamadı.
- **Sürmekte olan temyiz:** Karar çıkınca kayıt yeniden okunur.
