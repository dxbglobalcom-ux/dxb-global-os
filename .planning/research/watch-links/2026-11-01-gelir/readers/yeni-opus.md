# Grup `yeni` — okuyucu: opus (1 Kasım 2026, akşam)

**xUZYy3hCRUM sorusu:** İzlendi. İlk turda Koerner grubunda tam transkriptle incelendi; yeniden incelenmedi.

**Yöntem:** Üç transkriptin hepsi baştan sona okundu. Künyeler videoların YouTube sayfasından alındı (sayfa okundu, video indirilmedi, kare yok). Adı geçen her araç kendi sitesinden, rakamlar asıl kaynağından kontrol edildi. Depo yalnız okundu.

**Bu grupta zaten bilinen iki gerçek (değiştirmez, çerçeve verir):**
- YouTube holdinge sponsor oldu (kayıt `youtube-sponsorship-2026-10-19`). Sizin sözünüz: *"Kanal konusunu konuşuruz sonra… Ocağa girmeden hemen önce."* 8 Ekim turu ilk kanalı önerdi: İngilizce uzun-form uyku/bilim belgeseli, çalgısız (`turbo/kararlar.md` proje 1). Cevap bekliyor.
- Başkasının viral videosunu yeniden kurgulamak sizin 19 Ekim hükmünüzle serbest (W077). Müzik dışarıda (18 Ekim hükmü).

---

## 1. oL2xB4DiXEo — Doruk Yalçınsoy, "Yapay Zekayla Para Getiren 3 Sistem Nasıl Kurulur?"

**Künye:** 30 Ekim 2026 · 19:22 · 4.652 izlenme · kanal 37,1 bin abone · sponsor yok. Videonun asıl gelir motoru açıklamada duruyor: ücretsiz Skool topluluğundan ücretli "İş Güç Yapay Zeka Premium" topluluğuna geçiş. Topluluk ayda 59 $ ya da yılda 390 $; 117 üye var (skool.com, bugün ölçüldü). Bu, en fazla yaklaşık 6.900 $/ay brüt eder.

**Ne diyor:**

| Dk | Fikir | Değer |
|---|---|---|
| 00-02 | Sunucu ile lokal farkı: 7/24 çalışacak iş sunucuya, hızlı ve gizli iş lokale. | Bilinen |
| 02 | Türkiye'de girişimlerin YZ kullanımı geçen yıl %7,5, bu yıl %14. | **Kanıtlı.** TÜİK, Yapay Zekâ İstatistikleri 2026 (2025: %7,5 → 2026: %14) |
| 02-05 | Ajanları (Hermes) şirketin sunucusuna kurmak. Kurulum ücreti, üstüne yıllık destek sözleşmesiyle aylık ücret. "Türkiye'de bile şirket başına 4.000-5.000 $." | **İddia.** dorukyalcinsoy.com'da fiyat yok. Sitedeki dokuz logonun müşteri olduğu yazılmıyor. Hermes gerçek: `NousResearch/hermes-agent`, 259.400 yıldız, bugün güncellendi. |
| 05-07 | Yazılım ürünü satmak zordur, yatırımcı ister; yeni başlayana önermiyor. | Avenox ve Sequoia ile aynı yönde |
| 06 | Türkiye'de KOBİ'lerin %50'sinin sitesi yok. Google Maps'ten bulunur. Site 10-20 bin TL, e-ticaret 200-300 bin TL. | %50 doğrulanamadı (TÜİK bülteninde bulunamadı). Fiyatlar onun gözlemi, **iddia**. |
| 06-07 | Dikey sesli YZ platformu (emlak); dakika ya da abonelik başı ücret. | İddia, örnek yok |
| 08-11 | Lokal açık modeller: TTS'nin maliyeti "ayda 1.500 $'dan 5 $'a" indi. Qwen görsel düzenleme, STT, video modelleri. | Yön doğru, **1.500→5 abartı** (hangi yük, hangi kalite belirsiz) |
| 12-13 | Lokal modellerden gelir: kurulum danışmanlığı ya da özel eğitilmiş modelin API olarak satışı. Veriyi dışarı vermeyen sektörler (sağlık, telekom). "Şirketlerin %30-50'si lokal istiyor." | %30-50 **iddia**, kaynak yok |
| 13-14 | Bonus: kiralık sunucuyla kişisel VPN. | Gelir değil |
| 14-18 | Kurulumu Claude Code'a konuşarak yaptırmak: Hetzner'de 4 GB sunucu "~5 €". Kendi Hermes'inde guardrail'i sökülmüş ("abliterated") model kullanıyor. | Hetzner bugün 5,99-6,49 € + KDV'den başlıyor (hetzner.com). Sökülmüş model bize uymaz. |

**Para yöntemleri.** Ajan kurulumu, KOBİ sitesi, sesli platform ve mobil uygulama ilk turda incelendi (Avenox D, Tilbury, Koerner). Bu videonun yeni kattığı tek satırdadır:
- **Ajan kurulumu:** Türkiye için fiyat çapası 4-5 bin $ kurulum + aylık destek (iddia). 8 Ekim hükmü değişmiyor: makine gösterilebilir olmadan kurulum satılmaz.
- **KOBİ sitesi:** TL çapası 10-20 bin TL / 200-300 bin TL. Sahibi web ofisi ile Y9.
- **Sesli emlak platformu:** Yenisi dikey arayüz ve dakika başı ücret. B12'deki 2,73 sn gecikme çözülmeden satılmaz.

### Yöntem 1 — Yerinde/yerli YZ: veriyi dışarı vermeyen şirkete açık model kurulumu ve "uzman model" API'si

- **Videonun hâli:** Fikir doğru, içi boş. Sektör, fiyat ve örnek yok. Gerçek dayanak yalnız TÜİK'in iki katına çıkan benimseme rakamı.
- **Helal:** Geçer. Banka ve faizli finans müşteri değildir (sabit dışlama); sağlık, telekom, hukuk, muhasebe ve sanayi açık.
- **Elimizde:** Yerel GPU tezgâhı ve kapı bekçisi (B33), yerel işçi model (B34), stüdyonun ComfyUI medya şeridi, Türkçe TTS/STT. Eksik: dışarıya satılabilir paket, vaka, sözleşme ve tahsilat (B05).
- **Sahibi:** Yok. 8 Ekim'de "kurulum hizmeti merdiveni tahtaya satır" önerildi, söz bekliyor.
- **Ferrari hâli, OS'te hat:**
  1. Satış (Y9 motoru) yalnız veri-hassas sektörleri tarar.
  2. Kapı açıcı ücretli bir "veri egemenliği denetimi": şirketin hangi işini buluta vermeden YZ'ye devredebileceği.
  3. Teklif: kurulum + aylık bakım + "uzman model" aboneliği. Örneğin şirketin kendi sesiyle Türkçe çağrı özetleri, kendi belgesinde arama.
  4. Teslim için mühendislik bir kurulum şablonu çıkarır (Docker, model, ajan, izleme) ve her müşteride aynısı koşar.
  5. Model güncellemeleri B42 arsenal saatiyle aylık otomatik önerilir.
  Onay kapısı: sözleşme, müşteri sunucusuna erişim (kimlik) ve donanım alımı (para çıkışı) sizde.
- **Token:** Şablon bir kez kurulur (ağır, bir defa). Her müşteride kurulum orta, aylık bakım hafif. Müşterinin modeli kendi donanımında koştuğu için çalışma tokeni bize yazılmaz. Token başına gelir yüksek.
- **İlk test (şimdi, 0 $):** Yerel tezgâhta tek bir "uzman model" demosu kurulur (Türkçe çağrı kaydı → özet → CRM notu, hepsi makinede). Kurulum süresi ve kalite ölçülür; 1 hafta, para çıkışı yok.
- **Bunu yapalım mı?** Hattı tahtaya "sonra" satırı olarak yazıp demosunu şimdi kuralım mı? **Önerim: Evet, demo şimdi, satış makine gösterilebilir olunca.** Demo aynı zamanda B34'ün kanıtı olur.

### Yöntem 2 — Ücretli topluluk ve mentorluk (Doruk'un kendi gerçek modeli)

- **Videonun hâli:** Video bir huni. Gösterilen tek kanıtlı gelir yolu kendi topluluğu: 117 × 59 $.
- **Helal:** Geçer (bilgi ve hizmet satışı).
- **Elimizde:** Hiçbiri. Kitlemiz yok. "Kendi kitlen dağıtım yoludur" ilk turda Avenox'ta işlendi.
- **Sahibi:** Yok (C41 dışa dönük personalar ile ilgili).
- **Ferrari hâli:** Holdingin kendisi ders. "Tek insanla yönetilen YZ holdingi" dünyada ilk iddiası, satılabilir bir müfredat olur.
  1. Kanal hattı (aşağıda, 2. video) kitleyi toplar.
  2. Bir kez üretilen dijital kurs (Stan Store tipi, sizin 31 Ekim notunuzla aynı) satılır.
  3. Aylık ücretli topluluğun canlı oturumlarını bir persona ya da siz yaparsınız.
  Onay kapısı: yüz/kimlik ve ödeme sağlayıcı (B05) sizde.
- **Token:** Kurs bir kez yazılır. Topluluk her ay hafif-orta.
- **Bunu yapalım mı?** Kanal hattı ilk 1.000 aboneye ulaşınca ücretli topluluk ve kurs açılsın mı? **Önerim: Evet, ama sıra kanaldan sonra.** Kitle olmadan topluluk boş kalır.

**Gürültü ve risk:**
- VPN bölümü gelir değil.
- "Abliterated" model güvenlik testi için; holding işinde kullanılmaz.
- 3. dakikadaki "Grok Bot, Muse, duets" adları otomatik altyazıda bozuk; karar değiştirmez, kare istenmez.
- 4-5 bin $ fatura ve %30-50 talep rakamları kaynaksız.

---

## 2. HN_1kEGNu3Y — Yüzsüz Ninja, "4 Aylık Kanal Ayda 3000 Dolar: Bütün Sistemi Claude Code ile Kurdum"

**Künye:** 27 Ekim 2026 · 7:59 · 8.485 izlenme · **kanal 426 abone** · sponsor yok.
- Açıklamada Nichle **ortaklık linki** var (`nichle.com/?ref=yt-v10`), yani anlatıcının araçta çıkarı var.
- Açıklamada vaat edilen master prompt yok: metinde doldurulmamış yer tutucular duruyor (`[Notion linki]`, `[video 03 linki]`).

**Ne diyor:**

| Dk | Fikir | Değer |
|---|---|---|
| 00:00 | 4 aylık bir çizim kanalı yalnız reklamdan ayda ~3.000 $ kazanıyor; ortalama 8 dk, haftada 2 video. | **İddia.** Kanal adı söylenmiyor. Nichle'ın kendi modeliyle verdiği "≈ gelir tahmini" olması muhtemel, ödeme dökümü değil. |
| 00:30-01:27 | Claude Code + Google AI Studio API anahtarı → Gemini görsel modelini ajan çağırır. | Kanıtlı ve çalışır desen. Gemini anahtarımız var (B26). |
| 01:27 | Niş aracı "Nichle": 231 tarih kanalı, son 90 günde 15 yeni; en yenisi 2 aylık, 7 videoyla 400 bin+ izlenme. | Araç gerçek: 11,9 bin kanal ölçüyor, "outlier" puanı (videonun izlenmesi ÷ kanalın medyanı), ayda 12 $ ya da yılda 99 $, 7 gün ücretsiz (kart istiyor). Tarih rakamları ekran verisi, **iddia** (kare: 1:27-1:58). |
| 01:58-02:47 | Senaryo yöntemi: başka dilde tutmuş bir videonun transkripti çevrilmez; yazım tarzı analiz ettirilir (giriş, merak, cümle boyu, akış), sonra kendi konuna sıfırdan yeni senaryo yazdırılır. | Değerli. 19 Ekim hükmünüzle uyumlu. |
| 02:47-03:27 | "Master prompt": çizim tarzı, zaman damgası başına görsel sayısı, karakterler, model, tutarlılık. Senaryo zaman damgalı. | Kanıtlı desen |
| 03:27-04:25 | 100+ görsel tek seferde üretilir; haftada 1 yerine 2-3 video. | Görsel maliyeti bugün: Nano Banana 2.1 ~0,034 $/görsel (1K), 3.1 Flash Image ~0,067 $. Batch yarı fiyat. 100 görsel ≈ 1,7-6,7 $. 2.5 Flash Image 15 Mart 2027'de kapanıyor (ai.google.dev). |
| 04:49 | Tutarlılığın sırrı: her görsel isteğine master prompt + referans çizim birlikte gider. | Kanıtlı ve doğru teknik |
| 05:19 | Sistemi herkes kurar; fark niş, fikir ve sabırdır. | Doğru |
| 06:11-07:04 | Dosyalar zaman damgasıyla adlandırılır (00_00, 06_20), kurgu programında elle dizilir. | Yarım otomasyon. Bizde bu adım tamamen otomatik olur. |
| 07:22 | "Günde 40 video basma"; YouTube seri üretimin parasını keser. | **Kanıtlı.** YPP "inauthentic content" politikası (15 Temmuz 2025; eski "repetitious" kuralının yeni adı) |

### Yöntem — Yüzsüz (faceless) YouTube kanalı, reklam geliri

- **Videonun hâli:**
  - Üretim hattı gerçek ve ucuz.
  - Gelir rakamı başka birinin kanalına ait tahmin; anlatıcının kendi kanalı 426 abone. Hayatta kalan örneğinden öğrenme (survivorship) riski yüksek.
  - Doygunluk: Nichle'a göre aynı nişte 90 günde 15 yeni kanal açılmış.
  - Kurgu elle yapılıyor, tek dilde.
- **Helal:**
  - İçerik geçer: çizim, anlatı, müzik yok. Gerçekçi olmayan çizimde YouTube'un "yapay/değiştirilmiş içerik" etiketi gerekmez; gerçekçi görüntüde gerekir.
  - **Reklam geliri şüpheli → sizin sorunuz.** YouTube'da kumar ve alkol reklamı varsayılan olarak engelli. 200'e kadar genel kategori, flört gibi hassas kategoriler ve 500 reklamveren adresi engellenebiliyor. **Ama engel yalnız izleme sayfasındaki reklamda işler; Shorts ve akışta reklamı seçemeyiz** (support.google.com/youtube/answer/172795). Faizli finans için ayrı bir kategori olduğu yardım sayfasında görünmüyor; Studio'da bakılmalı.
- **Elimizde:**
  - Senaryo: Opus.
  - Görsel: yerel GPU'da ComfyUI medya şeridi, ayrıca Gemini anahtarı.
  - Ses: yerel TTS; Pocket TTS, Chatterbox ve VoxCPM2 bir önceki turdan.
  - Montaj: OpenMontage ve Remotion depoda.
  - Yayın: Postiz (8 Ekim önerisi).
  - Eksik: kanal hesabı ve AdSense (kimlik adımı), hattın uçtan uca bağlanması, niş istihbaratı.
- **Sahibi:** Yok. 8 Ekim'de "Kanal hattı — kendi satırı" önerildi; söz Ocak öncesi konuşmaya bırakıldı. Bağlı satırlar: B43 (stüdyo, SIGNAL Faz 0), B28.

**Ferrari hâli — "Kanal fabrikası", OS'te 9 istasyonlu hat:**
1. **Niş istihbaratı (saatle, haftalık):** Nichle'ın yaptığını kendimiz yaparız. YouTube Data API ile seçilen nişlerde kanalları izleyen ajan "outlier" puanı (izlenme ÷ kanal medyanı) hesaplar ve **her dilde** tutan videoları bulur. Bu, SIGNAL Faz 0'ın kendisidir. Kurulana kadar Nichle 12 $/ay yeter.
2. **Tarz analizi → özgün senaryo:** Tutan videonun yapısı çıkarılır, holdingin kendi konusuyla zaman damgalı yeni senaryo yazılır. Kopya değil; 19 Ekim hükmünüz zaten serbest bırakıyor.
3. **Görsel kitabı:** Her kanal için bir kez master prompt ve karakter/ortam referans sayfası yazılır. Her sahne isteğiyle birlikte gönderilir.
4. **Görsel üretimi:** Yerel GPU, kuyrukta gece (0 $ nakit). Gerekirse Gemini batch (~0,017-0,034 $/görsel).
5. **Ses:** Yerel TTS, müzik yok; doğa ve ortam sesi.
6. **Otomatik montaj:** Zaman damgalı adlar → OpenMontage/Remotion zaman çizelgesi → kare kare render. CapCut'ta elle dizme yok.
7. **Kalite kapısı:** Sol ve tutarlılık denetimi. Her videonun "inauthentic" olmadığı (konu, yapı ve anlatı farkı) ölçülür. İlk 3 pilot sizin gözünüze gelir (Kanun D).
8. **Çok dilli tek kanal:** YouTube Eylül 2025'ten beri bütün yaratıcılara video başına çok dilli ses izi yükletiyor. Aynı görsellerle TR, EN, AR ve diğer dillerde ses izleri tek videonun izlenmesini katlar. Videodaki tek dilli hattın bizdeki farkı budur; Avenox'ta gördüğümüz dublaj talebinin kendi kanalımızdaki karşılığıdır.
9. **Yayın ve ölçüm (saatle):** Postiz zamanlar. İzlenme, izleyici tutma, RPM ve kategori-engel raporu sabah raporuna düşer; sonuç 1. istasyonu besler.

- **Saatle kendi koşan:** 1, 4, 5, 6, 9. **Göz isteyen:** 2'nin konu seçimi, 7.
- **Onay kapısı:** Kanal ve AdSense hesabı (kimlik) sizde; kategori engellerinin ilk ayarı sizin hükmünüzle. Para çıkışı yok (Nichle denemesi kart ister; o da sizde).
- **Token:** Video başına harcanır ama video yıllarca kazanan bir varlıktır. Kaba tahmin: video başına senaryo, analiz, prompt ve denetim ~150-300 bin token; görsel ve ses yerelde. Her ek dil yalnız çeviri ve ses kadar ek yük getirir, görsel yeniden üretilmez. Müşteri başına aylık tekrar yok; token başına gelir, hit oranına bağlı.
- **Gelir gerçekçiliği:** Uzun-form RPM için 8 Ekim turunun ikincil kaynaklı bandı 4-15 $. 3.000 $/ay için ayda ~200-750 bin izlenme gerekir. İlk aylar 0; eşik 1.000 abone + 4.000 saat.
- **İlk test (şimdi, 0 $ nakit, 1 hafta):** Kanal açılmadan, 8 Ekim'de önerilen nişte (uyku/bilim belgeseli) ya da tarihte 8 dakikalık **tek pilot video** uçtan uca bu hatla üretilir; TR + EN ses izi. Ölçülen: insan dakikası, token, GPU saati ve sizin notunuz. Yayın, siz kanalı açınca.
- **Bunu yapalım mı?** "Ocak öncesi kanal konuşmasını" şimdi yapıp kanal fabrikasının tek pilot videosunu bu hafta üretelim mi? **Önerim: Evet.** Kapı (YouTube sponsorluğu) zaten açık. Hattın her parçası depoda var, nakit maliyeti sıfır. İlk para yolu bekledikçe gecikir.

**Gürültü ve risk:**
- 3.000 $ başka kanalın tahmini; anlatıcı Nichle ortağı.
- YPP politikası seri üretimi keser: farklılık ve göz kapısı şart.
- Shorts reklamları süzülemez.
- Niş doygunluğu hızlı. Tek kanal tek niş kırılgandır; fabrika birden çok niş ve dil ister.

---

## 3. OxQ47jXQApk — Mark Tilbury, "Ranking 7 Side Hustles That Made Me Rich (2026)"

**Künye:**
- **Yayın 24 Ekim 2024**; başlıktaki "(2026)" sonradan eklenmiş, içerik 2 yıllık.
- 24:51 · 698.889 izlenme · kanal 9,34 milyon abone.
- **Sponsor bölümü:** Trading 212 (~13:55-14:55). Açıklamada Webull ve ortaklık linkleri var.
- "Haftada 100.000 $+ gelir" iddiası bağımsız bir kaynakla doğrulanamadı.

**Yedi gelir yolu ve hükmü** (puanlar onun: zaman / sermaye / haftada 100 $ kolaylığı, 5 en iyi):

| Dk | Yol | Onun puanı | DXB için |
|---|---|---|---|
| 00:28 | Fiziksel perakende mağaza. Banka kredisiyle açmış; bugün Kickstarter önerir. | 2/4/5 | Dijital holdinge uymaz. **Banka kredisi faizli, geçmez.** Kickstarter (ödüllü ön satış) geçer. |
| 04:34 | Kendi marka ve ürün gamı, Çin'de üretim. Niş → trend → topluluk. | 2/3/4-5 | Aşağıda (Yöntem A) |
| 08:15 | eBay: batan dükkânın ölü stoğu önce komisyonla, sonra toptan alınıp satılır ("3 katı"). | 3-4/5/5 | İlk turda Koerner konsinye ajanıyla incelendi. Yeni kattığı: komisyondan toptan alıma geçiş basamağı. Alım para çıkışıdır, sizde. |
| 11:02 | Borsa: S&P 500 fonu, Trading 212 "pie". Oğlu günde 5 £ → 1.783 £, kâr 276 £ ("%18"). | 5/5/2,5 | Aşağıda (Soru). **Projeksiyon abartı:** 250 £/ay ile 31 yılda 2,19 milyon £ yıllık %16,5 getiri ister; kendisi videoda %8-10 diyor. %10'da sonuç ~570 bin £. |
| 15:23 | Konut kirası ve **deal sourcing**: yatırımcıya fırsat bulup bulma ücreti almak. | 3/5/5 | Aşağıda (Yöntem B) |
| 18:31 | Ticari gayrimenkul (depo kirası). | 3/1/4 | Ağır sermaye, dijital değil. Kiracı helal olmak şartıyla geçer. Şimdi yeri yok. |
| 19:57 | Kişisel marka: reklam, marka anlaşması, kendi dijital ürünü. Eşik 1.000 abone + 4.000 saat. | 2/3/4 | İlk turda incelendi (kendi kitlen). Yeni kattığı: **kişisel finans nişinin sponsor havuzu aracı kurum ve bankadır** (bu videonun kendisi Trading 212 ve Webull). Faizli finans sponsoru sizin hükmünüzle dışarıda, bu yüzden bu niş bize ters. Kanal fabrikasının niş seçiminde bu süzgeç kullanılır. |

Diğer sayılar: enflasyon "60 yılda ortalama %3,8" ABD için makul (kontrol edilmedi). "İngiltere'de %74 fitness ürünü sahibi" ve "Spartan 1,5 milyon katılımcı" iddia; karar değiştirmez.

### Yöntem A — Holdingin kendi ürün markası (stoklu, ön satışla doğrulanmış)

- **Videonun hâli:** Gerçek bir model, ama sermaye ve yıllar ister. Anlatıcının başarısı 1990'lar model uçak nişinden geliyor.
- **Helal:** Geçer. Malın sahibi olunduğu için ilk turdaki dropshipping şüphesini de çözer. Üretilecek mala önden ödeme alınan ön satış istisnâ akdidir; mal ve teslim belli olmak şartıyla geçer. Hiç şüphe istenmiyorsa ödemesiz bekleme listesiyle doğrulanır.
- **Elimizde:** Stüdyo (ürün görseli, reklam filmi), web ofisi (satış sayfası), niş istihbaratı (kanal hattıyla aynı motor). Eksik: tedarikçi, numune, ödeme (B05).
- **Sahibi:** Yok.
- **Ferrari hâli, hat:**
  1. Niş motoru, topluluğu olan ve kalıcı nişleri bulur (fad değil).
  2. Stüdyo ürünü ve reklamını üretimden önce fotogerçekçi olarak çizer.
  3. Web ofisi ön satış ya da bekleme listesi sayfası kurar.
  4. Küçük bir test (organik içerik) talep ölçer.
  5. Eşik geçilirse tedarikçi araştırması ve numune; üretim yalnız talep kanıtlanınca.
  6. Kanal ve sosyal içerik topluluğu besler.
  Onay kapısı: numune, üretim ve reklam harcaması (para çıkışı) ile tedarikçi sözleşmesi sizde.
- **Token:** Marka başına bir kez orta. İçerik her ay hafif. Stoğu talep belirlediği için risk düşük.
- **İlk test:** Bekleme listesi sayfası ve 3 ürün konsepti; yalnız organik paylaşımla 2 hafta kayıt sayısı ölçülür. Nakit 0 $; kanal ya da sosyal hesap ister.
- **Bunu yapalım mı?** Kendi ürün markası hattı "sonra" satırı olarak tahtaya girsin, testi kanal hattı kitle kurduktan sonra yapılsın mı? **Önerim: Evet, sonra.** Bugün kitle ve tahsilat yok; önce kanal ve ajans nakit getirmeli.

### Yöntem B — Fırsat bulma (deal sourcing) aboneliği

- **Videonun hâli:** Masa başında yatırımcıya fırsat bulup bulma ücreti alınır. Sermaye gerekmez; gerçek iş ağdır.
- **Helal:** Geçer (simsarlık ücreti). Faizli kredi gerektiren alımlar pakete girmez.
- **Elimizde:** Scrapling ve araştırma kapısı; REVENUE-OPPORTUNITIES #1 (tedarikçi/fiyat istihbaratı) ve #4 (trend-sinyal aboneliği) aynı aileden; B17 sahibi.
- **Ferrari hâli:** Ajan seçilen pazarda ilanları ve ihaleleri her gün tarar. Piyasa değerinin altındaki fırsatları değerleme notuyla puanlar. Abone yatırımcılara haftalık bir "fırsat paketi" gider; kapanan işte bulma ücreti alınır. Onay kapısı: pazar seçimi, aracılık için yasal kayıt (kimlik adımı) ve yatırımcı sözleşmesi sizde.
- **Token:** Her ay sürekli (tarama ve değerleme) ama bir paket çok aboneye gider. Token başına gelir orta.
- **Bunu yapalım mı?** Emlak fırsat aboneliği ayrı bir hat olarak kurulsun mu? **Önerim: Hayır, şimdilik.** B17'deki #1/#4 veri-istihbaratı ailesine bir varyant olarak not düşülsün. Pazar seçilmeden ve ağ olmadan değeri yok; kanal ve ajans hattı önce.

### Soru — Borsa (uzun vadeli hisse/endeks)

- **Neden şüpheli:**
  - S&P 500 bankalar, alkol ve faizli finans şirketlerini içerir.
  - Trading 212 yatırılmamış nakde faiz öder (kullanıcının açtığı bir seçenek) ve hisse ödünç verir; ikisi de faizdir ve kapatılabilir. CFD hesabı ayrıca vardır.
  - İslami endeks fonu mevcut: iShares MSCI World Islamic UCITS ETF (ISWD/ISDW), yıllık gider %0,30.
- Bu bir üretim hattı değil, hazine yönetimidir; para çıkışıdır. Sizin "altın al-sat yok" sözünüz spekülasyonu dışlar; uzun vadeli İslami endeks ayrı bir sorudur.
- **Soru:** Holdingin fazla nakdi ileride yalnız İslami endeks fonunda (kaldıraçsız, faiz seçenekleri kapalı) tutulabilir mi? **Önerim: Şimdi hayır** (fazla nakit yok). Hüküm sizin.

**Gürültü ve risk:** 2 yıllık video "2026" diye yeniden başlıklanmış. Yedi yolun dördü sermaye yoğun ve fiziksel. Projeksiyon ekranı abartı. Gelir iddiası doğrulanamadı.

---

## Grubun DXB için en önemli beş şeyi (sıralı)

1. **Kanal fabrikası pilotu (HN_1kEGNu3Y):** Holdingin ilk sıfır nakitli, kendi koşan gelir hattı. YouTube kapısı sponsorlukla açık, hattın parçaları depoda. Videonun tek dilli elle kurgusunu otomatik montaj ve çok dilli ses iziyle aşarız. Karar Ocak öncesine bırakılmıştı; Kasım'ın ilk günündeyiz.
2. **Kendi niş istihbarat motoru:** Nichle'ın aylık 12 $'a sattığı outlier puanını YouTube Data API ile biz hesaplarız. Bu tek motor kanal fabrikasını, B28 ajansının kreatif araştırmasını ve ürün markası nişini besler; ileride kendisi bir veri aboneliği olarak satılabilir. SIGNAL Faz 0'ın somut ilk işi budur.
3. **Reklam gelirinin helal sınırı netleşmeli:** Uzun-form izleme sayfasında kumar ve alkol varsayılan olarak engelli, flört ve 200 kategori engellenebilir. Shorts ve akış reklamı süzülemez. Bu cevap, kanal hattının Shorts'u gelir kalemi mi yoksa yalnız vitrin mi sayacağını belirler.
4. **Yerinde/yerli YZ:** TÜİK'e göre Türk girişimlerinde YZ kullanımı bir yılda %7,5'ten %14'e çıktı (kanıtlı). Veriyi dışarı vermeyen sektörlere yerel model kurulumu bizim GPU ve B34 birikimimizle doğal bir hat. Demo şimdi, satış makine gösterilebilir olunca.
5. **Kitle → ücretli topluluk ve dijital ürün:** Doruk'un gerçek geliri videosu değil, 117 × 59 $'lık topluluğu. Sizin 31 Ekim notunuzdaki "influencer + dijital ürün" fikrinin kanıtlı Türkçe örneği bu. Kanal hattı kitleyi toplayınca açılır.

## Sizin sorularınız (her biri evet/hayır, önerimle)

| # | Soru | Önerim |
|---|---|---|
| 1 | Kanal konuşmasını şimdi yapıp kanal fabrikasının tek pilot videosunu (TR + EN ses izi, çalgısız) bu hafta üretelim mi? Kanal hesabını siz açarsınız. | **Evet** |
| 2 | YouTube reklam geliri: uzun-form izleme sayfasında kategori engelleriyle kabul; Shorts ve akış reklamı süzülemediği için Shorts yalnız vitrin olsun mu? | **Evet.** Shorts gelirinin hükmü sizin. |
| 3 | Kendi niş istihbarat motorumuz (outlier puanı) SIGNAL Faz 0 olarak kurulsun mu? O güne kadar Nichle 12 $/ay. | **Evet** |
| 4 | Yerinde/yerli YZ hattı tahtaya "sonra" satırı olarak girsin, yerel demo şimdi kurulsun mu? | **Evet** |
| 5 | Kanal 1.000 aboneye ulaşınca ücretli topluluk ve dijital kurs açılsın mı? | **Evet, sırası gelince** |
| 6 | Kendi ürün markası (stoklu, önce bekleme listesiyle doğrulanmış) tahtaya "sonra" satırı olarak girsin mi? | **Evet, sonra** |
| 7 | Emlak fırsat aboneliği ayrı hat olsun mu? | **Hayır.** B17 #1/#4'e varyant notu yeter. |
| 8 | Fazla nakit ileride yalnız İslami endeks fonunda tutulabilir mi? | **Şimdi hayır.** Hüküm sizin. |

**Kare gerekirse (lider için):** HN_1kEGNu3Y 0:00-0:30 ve 4:25-5:02 (3.000 $ kazanan referans kanalın adı; gelirin Nichle tahmini olup olmadığı) · 1:27-1:58 (Nichle'daki tarih nişi rakamları).
