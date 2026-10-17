# R7-model-channels-and-formulas (helper report, 2026-10-17; raw evidence paths inside)

# Rapor: model YouTube kanalları (2026-10-17 ölçümü)

**Kısa cevap:**
- Tutan kanalların ortak yöntemi şu: kendine ait bir karakter ya da seri, her bölümde ayrı bir hikâye, ve gelirin büyük kısmı reklam dışından.
- 2026'da kanal düşüren yapay zekâ değil. Kanalı düşüren, birbirinin aynısı başlık, kapak ve şablon; YouTube'un denetimi bunu kanal düzeyinde cezalandırıyor.
- Bu yüzden kopyalanacak olan format ve yapı. Karakter, hikâye ve bakış açısı bizim olmalı.

**Kaynaklar:**
- Abone ve 30 günlük izlenme sayıları bugün Social Blade'den alındı. Ham sayfalar `.../h7/sbraw*/`, özet tablo `/tmp/claude-1000/-home-dxb-DxB-Global-OS/780184a8-14f7-45ce-91c0-2943127c7438/scratchpad/h7/sb_table.txt`. h4'ün ölçtüğü kanalları yeniden çekmedim; onlar `.../h4/sbA..K.txt` dosyalarından geliyor.
- Video süreleri ve başlıklar `opencli youtube search` ile çekildi (`.../h7/yt/*.yaml`).
- İlk 30 saniyeler 18 videonun altyazı metninden okundu (`.../h7/trb0*/`). Supercar Blondie ve Doug DeMuro altyazıları boş geldi.
- Basın ve röportaj aramaları Exa ile yapıldı (`.../h7/q/*.txt`).

**Yöntem açığı:** Araç kutusunu doğrudan kullandım: fetch, mcpx exa, opencli. Ancak `evidence.jsonl` kanıt satırlarını ve fleet (araştırma filosu) yolunu kullanmadım. Claude WebSearch bu oturumda elimde yoktu. Kapı "iki taraf birlikte" kuralı koyuyor; o kural uygulanmadı.

"30g izl." sütunu Social Blade'in "Last 30 days" izlenme sayısıdır.

## 1. Çocuk animasyonu

| Kanal | Abone | 30g izl. | Diller | Formül (tek satır) | Para |
|---|---|---|---|---|---|
| Cocomelon | 203M | 1,4B | Moonbug genelinde 32 dil (NYT 2022) | 2–4 dk şarkı bölümleri ve 40–60 dk derlemeler, sabit aile karakterleri | Lisans, ürün, Netflix (Moonbug modeli, PRNewswire 2020) |
| Pinkfong | 85,3M | 464M | 25 dil, 244 ülke (şirketin halka arz duyurusu 2025-09) | Baby Shark evreni, uygulama, YouTube ve 360° genişleme | Yurt dışı gelir %76, faaliyet marjı yaklaşık %20 (aynı belge) |
| Bebefinn (2022'de açıldı) | 37,1M | 391M | Ayrı Almanca kanalı da var (aramada görüldü) | 3 kardeş ve ebeveynleri; "EP220" gibi numaralı 3 dk bölümler ve 1–1,5 saatlik derlemeler | Lisans; Japonya'da Amazon'da oyuncak 1 numara (KoreaTechDesk 2025-12) |
| Masha and the Bear (İng.) | 55,6M | 169M | Çok dilde ayrı kanallar | 7–13 dk az diyaloglu slapstick bölümler ve 30–60 dk derlemeler | Lisans; Rus şirket 2025 cirosu 271,3 milyon ruble (KP.ru 2026-06) |
| BabyBus | 44,1M | 201M | (ölçülmedi) | 30–60 dk tema derlemeleri, "Sheriff Labrador" güvenlik serisi | (ölçülmedi) |
| Omar & Hana (helal referansı) | 3,99M | 24,8M | Malezya | İslami çocuk şarkıları ve hikâyeleri | (ölçülmedi) |

Formül:
- **Sabit karakter ailesi büyüyor.** Bebefinn'e eklenen yeni karakter Minjee, ilk 3 haftada 30M izlenme topladı (Pinkfong basın bülteni 2025-10-20). Bebefinn 14 ayda Diamond ödülüne ulaştı.
- **Kısa bölüm ve uzun derleme birlikte.** Kısa bölüm 2–4 dk; aynı malzemeden 30–90 dk derlemeler yapılıyor (Cocomelon, BabyBus ve Bebefinn arama listeleri).
- **Açılış ilk 3 saniyede.** Bebefinn marka sesiyle açılıyor, hemen diyalog ve şarkı geliyor. IvyBears ilk 20 saniyede bir sorun kuruyor ("Hercules kaçırıldı") ve ekibi çağırıyor (altyazı metinleri).
- **Veriyle üretim.** Moonbug, çocuklara bölüm izletip dikkatin nerede koptuğunu ölçüyor (NYT 2022). Animaj bir bölümü fikirden yayına 5 haftadan kısa sürede çıkarıyor (WorldScreen 2026-03).
- **Reklam zayıf, para lisanstan.** "Made for Kids" etiketli kanalların medyan RPM'i (bin izlenme başına gelir) 0,33 $. Bütün nişlerin medyanı 2,30 $ (MilX, 300 kanal, 2025-05 ile 2026-05 arası).

**Bizim için "aynı yöntem":** Sabit aile karakterleri, şarkı ve hikâye, numaralı bölümler, derlemeler, çok dilli kanallar ve lisans hedefi bu formülden alınır. Karakterler, şarkı düzenlemeleri ve dünya tamamen bizim olmalı. Omar & Hana, İslami çocuk nişinin tuttuğunu gösteriyor: 3,99M abone.

## 2. Bilim / eğitim belgeseli

| Kanal | Abone | 30g izl. | Diller | Formül | Para |
|---|---|---|---|---|---|
| Mark Rober | 84,1M | 500M | Video başına ortalama 30'dan fazla dublaj (YouTube Blog 2025-09) | 18–35 dk mühendislik yapımı veya yarışma; ilk 20 saniyede risk ve "ters köşe" vaadi | Kanal CrunchLabs abonelik kutusunu satan bir vitrin; video başına yaklaşık 500 bin $ (NetInfluencer 2026-10) |
| Zack D. Films | 29,2M | 3,62B, 30 günde 147 video | Bilinen İspanyolca kanal küçük (81 abone) | 30–60 sn 3D Shorts; ilk 1–2 saniyede kanca; tarih, bilim ve tıp | Reklam; Patreon var |
| Kurzgesagt | 25,7M | 87M | 9 dil; diğer dillerde insan seslendirme (mt-recordings) | 7–22 dk düz animasyon; karşı-sezgisel ya da tarihli bir cümleyle açılış | Mağaza %40, sponsor %12, YouTube reklamı %13, kurum %10, Patreon %9 (kendi videosu, 2015–2022 dönemi) |
| Veritasium | 21,4M | 108M | (ölçülmedi) | 21–48 dk; sunucu ve uzman kamerada, canlı gösteriyle açılış | Sponsor; yazar ekibi var (video künyeleri) |
| fern | 5,6M | 60M | İngilizce | 15–117 dk 3D animasyonlu araştırmacı belgesel, ayda 2–4 video | Sponsor ilk cümlede (Shopify); yapay zekâyı "yalnız yaratıcı olmayan işlerde" kullanıyor (kendi SSS sayfası) |

Formül:
- **Kanca bir sahneyle açılıyor.**
  - Kurzgesagt: "You probably think you know human history but you don't." Bir başka videoda tarihli soğuk açılış: "July 2026. Thousands of AIs…"
  - fern: "Around mid-2025, a certain type of video starts appearing…"
- **Zack D'nin üretim hattı yapay zekâ değil.** Blender, Cascadeur ve şablonlarla çalışıyor; "hook in 1–2 seconds, hold 30–60" ilkesini izliyor (animatörü Chris Reilly'nin portföyü). Senaryolar "sıkı tanımlı ses ve yapı" ile bir yazar ekibine yazdırılıyor (iş ilanı özeti).
- **Seri ve bölüm yapısı iki ölçekte de var:** saniyelik Shorts'tan 2 saatlik belgesele kadar.
- **Para reklam dışından:** Kurzgesagt'ta mağaza, Mark Rober'da CrunchLabs.

**Bizim için:** Kanca yapısı, seri disiplini, Shorts hattı ve çok dilli yayın alınır. Konuların araştırması ve yorumu bizim olmalı. Zack D taklidi yapan yapay zekâ araçları zaten piyasada (GitHub'da "zack-d-films-ai-video-generator", Veo 3.1 tabanlı). Bu yüzden aynı görünümle girmek, YouTube'un "mimics existing formats … interchangeable" maddesine çarpar (Tubefilter 2026-07-13).

## 3. Otomobil

| Kanal | Abone | 30g izl. | Formül | Para |
|---|---|---|---|---|
| Supercar Blondie | 22,3M | 86M | Nadir ve lüks araçlar; kurucu kameradan çekildi, yerine kurum içi sunucular ve kullanıcı içeriği geldi (NBK Social) | SBX Cars müzayedesi; tüm platformlarda ayda yaklaşık 1,5B izlenme (CEO Middle East 2026-03) |
| carwow | 11,1M | 85M | Haftalık drag yarışı; başlık "A v B v C: DRAG RACE"; ilk cümle soru, sonra teknik değerler | Araba pazar yeri için müşteri yönlendirme; trafiğin %60'ı içerikten (CMO podcast'i) |
| WhistlinDiesel | 10,8M | 41M | Kişilik ve gösteri (30 günde 4 video) | (ölçülmedi) |
| Doug DeMuro | 5,1M | 27M | 20–40 dk inceleme ve haftalık 1 saat 40 dk podcast | Cars & Bids; günde yaklaşık 40 araç satılıyor (Publish Press 2025-09) |
| AutoRegionBA (2023-11'de açıldı) | 3,96M | 46M (+340K abone) | Yüzsüz araba Shorts'ları ("Pick a Car for Aura Farming") | Reklam tahmini 11K–184 bin $/ay (Social Blade) |

Formül:
- Bu nişte büyük para reklamdan değil ticaretten geliyor: müzayede (Supercar Blondie, Doug DeMuro) ve müşteri yönlendirme (carwow).
- Tekrarlanan seri formatı ölçülebilir şekilde tutuyor. carwow 2025'te yalnız drag yarışlarına ayrılmış ikinci bir kanal açtı.
- Yapay zekâya en uygun örnek AutoRegionBA tipi yüzsüz Shorts. Ama bunun "şablon" sayılma riski yüksek. Bu bir çıkarım; ölçmedim.

**Bizim için:** Karşılaştırma, sıralama ve seri formatı alınır. Gerçek aracı gösteremeyen bir yapay zekâ kanalı, gerçekliğin yerine ne koyacağını göstermeli: model tarihi ya da mühendislik anlatımı. Bunun tutacağı **⚠ UNVERIFIED**; ölçüm yok.

## 4. Yapay zekâ ve teknoloji anlatımı

| Kanal | Abone | 30g izl. | Formül | Para |
|---|---|---|---|---|
| MKBHD | 21,4M | 130M | 10–23 dk ürün incelemesi, kamerada sunucu | Sponsor, ürün, stüdyo (MKBHD Inc. 26 kişi) |
| 3Blue1Brown | 8,7M | 12,5M | Matematik ve yapay zekâ animasyonu (30 günde 3 video) | (ölçülmedi) |
| Fireship | 4,31M | 28,5M | 4–7 dk haber; olaydan 24–48 saat içinde yayın (growwly) | Sponsor |
| Two Minute Papers | 1,84M | 2,1M | 3–8 dk makale anlatımı | (ölçülmedi) |
| AI Explained / Matt Wolfe | 455K / 1,02M | 0,99M / 1,75M | 30 dk derin analiz / araç haberleri | (ölçülmedi) |

Formül ve bulgu:
- **Bu nişte 10M+ abonesi olan, yalnız yapay zekâya ayrılmış kanal bulamadım.**
- Genel bilim kanalının yapay zekâ videosu niş kanalları geçiyor: Kurzgesagt "AI Just Crossed the Terrifying Line" 12 günde 20,5M izlendi.
- Fireship'in kancası isim, öfke ve risk içeren bir haber hikâyesi: "Last week, a developer got so tired of Adobe's…"
- Teknoloji RPM ortalaması 8 $ (CreatorsMetrics).

**Bizim için:** Hız (24–48 saat) ve 5 dakikalık format alınır. Görüş ve yorum bizim olmalı; YouTube'un istediği de tam olarak bu "original insight".

## 5. Tarih / uzun anlatım / uyku

| Kanal | Abone | 30g izl. | Formül | Para |
|---|---|---|---|---|
| The Infographics Show | 15,5M | 51M | 12–47 dk anlatı ve 2–3 saatlik derlemeler; 30 günde 39 video; soğuk açılış sahnesi | (ölçülmedi) |
| OverSimplified | 9,66M | 11,8M (30 günde 0 video) | Toplam 33 video; 15–40 dk çöp adam komedisi; "Part 1/2" serileri | NordVPN sponsoru, mağaza ve figür; hepsi ilk 30 saniyede |
| Simple History | 5,12M | 10,8M | 4–34 dk savaş ve asker hikâyeleri | (ölçülmedi) |
| Kings and Generals | 4,21M | 17,6M | 20 dk ve 3–6 saatlik "Full Story, Every Battle" derlemeleri | (ölçülmedi) |
| Sleepless Historian (yapay zekâ ile, 2025) | 716K | 1,76M (+1K abone) | 2 saatlik uyku tarihi, neredeyse her gün; açılış "like + subscribe + where you're tuning in from" | 2025 sonunda para kazanma kapatıldı, 5 hafta sonra geri açıldı (danışmanlık firmasının bülteni, 2026-09) |

Formül:
- **Uyku-tarih kanalı ölçülebilir şekilde soldu.** 2025-06'da aylık +185K abone ve yaklaşık 8M izlenme bildiriliyordu (LinkedIn). Bugün aylık 1,76M izlenme ve +1K abone var. Yeni videoları 13K–80K izlenmede; bir yıl önceki videolar 600K'nın üstündeydi.
- **"Boring History" (Davis ve Eizner):** 6 ayda yaklaşık 170 bin $ kazandı, sonra "reused content" gerekçesiyle para kazanma kapatıldı. Kaynakta sayılan üç tetik şunlar: aynı kapak, aynı başlık kalıbı, durağan görsellerden oluşan "slideshow" video (TubeGen blogu 2026-07). TubeGen bu kanalı kuran aracın satıcısı, yani taraf.
- **Yanlış pozitif riski var.** History After Dark, insan araştırması ve sentetik sesle çalışıyordu. 2026-10'da "generic or repetitive" gerekçesiyle para kazanma kapatıldı ve itiraz birkaç saatte reddedildi (yaratıcının kendi videosu).
- OverSimplified 30 günde hiç video koymadan 11,8M izlenme aldı. Eski içerik sürekli izleniyor.

**Bizim için:** Uzun format ve derlemeler alınır. Her videonun konusu, kapağı ve başlığı ayrı olmalı; görüntü hareketli olmalı (durağan slayt değil); anlatıcı kimliği bizim olmalı.

## 6. Ek niş: kişisel finans ve ekonomi (en yüksek RPM)

Ortalama RPM 12 $, aralık 6–28 $ ve üstü. Eğitimde ortalama 5 $ (CreatorsMetrics).

| Kanal | Abone | 30g izl. | Formül | Para |
|---|---|---|---|---|
| The Diary Of A CEO | 20,6M | 122M (+900K) | Uzun röportaj podcast'i | Sponsor |
| Mark Tilbury | 9,23M | 155M (+280K) | Gerçek kişi, hızlı kurgu ve animasyon; kanca "I want you to imagine that you suddenly became rich overnight… this video was recommended to you for a reason" | Sponsor, ürün |
| Graham Stephan | 5,18M | 9,2M (+0) | Yatırım vlogu | (ölçülmedi) |
| Economics Explained | 2,89M | 6,2M | Yüzsüz ekonomi anlatımı | (ölçülmedi) |

İki sınır var:
- **YouTube kuralı.** Finans tavsiyesi veren yapay zekâ "insan uzman" personası para kazanamaz (Tubefilter 2026-07-13). Bu nişe sahte danışmanla girilemez; yalnız ekonomi ve tarih anlatımı olur.
- **İslami sınır.** Bu nişin popüler konuları (faizli yatırım, trading, "vergiden kaçınma") İslami sınıra değiyor. Bu benim çıkarımım ve karar CEO'nun. Ona tek satırla sorulmalı.

## AI destekli kanallar: kalanlar ve silinenler

| Kanal | Ölçüm (SB 2026-10-17) | Durum |
|---|---|---|
| Animaj / Pocoyo (ES) | 15,3M abone, 30 günde 84M izlenme; yılda 22B izlenme, ayda 240M tekil izleyici (Animaj 2025-06) | Ayakta. Yapay zekâ ara kare üretiminde (SIGGRAPH 2026); karakterler tanınmış ve sahipli; Google'dan 1M $ yatırım (Bloomberg 2026-03) |
| IvyBears (2026-04'te açıldı) | 8M abone ama toplam 74,6M izlenme; 30 günde 372K izlenme ve +250K abone | Abone ile izlenme oranı olağan dışı. Arkasında bir vitamin markası var ("Reversed Flywheel"). Sebep **UNVERIFIED** |
| Sleepless Historian | 716K, 30g 1,76M | Kapatıldı, geri açıldı; izlenme düştü |
| Neural Viz | 238K; 30 günde 0 video, 99,8K izlenme | Eleştirmen beğenisi aldı (WIRED 2025-10); Patreon'da 394 ücretli üye (Graphtreon) |
| Elias Yoder (yapay zekâ personası) | 367K; 30 günde 42 video, 1,98M izlenme | "İlk ayda 100 bin $" iddiası doğrulanmamış |
| Silinenler | CuentosFacianantes (5,9M), Imperio de Jesus (5,8M); 2026-01'de toplam 35M aboneli 16 kanal (Verge, TNW). Bandar Apna Dost bugün 57 videoda (619'du), 30 günlük izlenmesi −2B | Spam, aldatma, tekrar |

**Fark (kaynaklardan):**
- Kalanların sahipli bir karakteri ya da IP'si, bölüm başına ayrı bir hikâyesi ve insan yaratıcı yönetimi var.
- Silinenlerde başkasının IP'si (Dragon Ball), aynı durumun tekrarı, şok içerikleri, aynı kapak ve başlık kalıbı ve slayt gösterisi gibi videolar var. YouTube'un 2026-07 ilanındaki üç kategori de tam olarak bunlar.

## Sonuç (yalnız bu kanıttan)

1. Kopyalanabilir olan format, kanca, seri ve yayın düzeni. Karakter ve görüş bizim olmazsa kanal YouTube'un "interchangeable" maddesine düşer.
2. Abone sayısı yanıltıcı. Örnek alırken 30 günlük izlenmeye bakılmalı: IvyBears'ta 8M abone ama 372K aylık izlenme var, Graham Stephan +0 abonede.
3. Çocuk nişi izlenmede en büyük, ama RPM'i 0,33 $. Para lisanstan gelir, yani karakter IP'si şart. Finans nişi en yüksek RPM'i veriyor ama yapay zekâ "uzman" yasak ve İslami sınır kontrolü gerekiyor.
4. En büyük bilim ve otomobil kanalları reklamı vitrin olarak kullanıyor: CrunchLabs, mağaza, müzayede, müşteri yönlendirme. Holdingin kendi ürününe bağlanan bir kanal bu modele en yakın olanı.
5. YouTube denetimi kanal düzeyinde ve otomatik çalışıyor; insan emeğiyle yapılan kanalları bile düşürebiliyor. Her video, kapak ve başlık ayrı olmalı ve görüntü durağan slayt olmamalı.
6. Çok dillilik ölçülmüş bir kaldıraç: dublajlı videolarda izlenme süresinin %25'ten fazlası ana dil dışından geliyor (YouTube Blog 2025-09). Mark Rober video başına 30'dan fazla dil kullanıyor, Kurzgesagt 9 dilde.

**⚠ UNVERIFIED, ayrıca listelenmeli:**
- Kapak görsel stilleri (fern'in 3D kapakları dışında hiçbirini görmedim).
- Zack D'nin "yaklaşık 60 çalışan, video başına 1–3 bin $" iddiası (Medium).
- Sleepless Historian'ın ve Felune'un gelir rakamları (danışman ve bülten kaynakları).
- AutoRegionBA'nın içerik sahipliği.
- Bright Box'ın bugünkü sayısı (Social Blade sayfası okunamadı).

Not: Sorgularımdan biri dar tutulmamış grep penceresi yüzünden maliyet kapısına takıldı; yeniden yazıp çalıştırdım. `cd` kullandığım bir komut da kapıya takıldı.