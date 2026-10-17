# R9-video-model-quality-matrix (helper report, 2026-10-17; raw evidence paths inside)

# Video modelleri: sıralama, yetenek ve çekim türü raporu (2026-10-17)

Tek bir model her alanda en iyi değil. Ölçülen tablo şöyle:
- **Wan 3.0:** üç tablonun genelinde birinci. AA metinden-videoda (sesli ve sessiz) ve video düzenlemede birinci.
- **Seedance 2.5:** konuşma ve dudak senkronu ile çok-referanslı işte birinci.
- **MiniMax H3 / fal H3 Max:** görselden-videoda, animasyonda, çok-sahnede ve ekrandaki yazıda önde. Fiyatı en düşük üst seviye model.
- **Gemini Omni Flash 1.1:** LMArena metinden-videoda ve Design Arena'da birinci, AA'da 7–8. sırada.
- **Veo 3.1 ve Kling 3.0:** üç tablonun üçünde de ilk 10'un dışında.

İki acil bulgu var:
1. **Veo 3.1'in Gemini API sürümü 5 gün sonra kapanıyor.** Google'ın kaldırma sayfası (son güncelleme 2026-10-12), `veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview` ve `veo-3.1-lite-generate-preview` için kapanış tarihini **October 22, 2026**, yerine geçeni `gemini-omni-1.1-flash` olarak yazıyor. Kaynak: `ai.google.dev/gemini-api/docs/deprecations`, dosya `raw/deprec.html`. Google'ın kurumsal platformundaki sürüm ve fal'daki Veo uç noktalarının açık kalıp kalmayacağı UNVERIFIED.
2. **Kling 4.0, 15 Ekim'de uygulama içinde çıktı ama API'si yok.** Kuaishou'nun 16 Ekim basın bülteninde "API soon" yazıyor (ir.kuaishou.com, globenewswire). Runware ve kie.ai sayfaları bugün 17:51'de "Coming Soon" diyordu (`h2/raw/rw_k4.txt`, `kie_market.txt`). fal'da `fal-ai/kling-video/v4/text-to-video` sayfası var ama "Price $0", "Category unknown" yazıyor; çağrılabilir olduğu UNVERIFIED. Hiçbir sıralama tablosunda yok.

Sayıları nasıl aldım:
- **Artificial Analysis:** Gizli Chrome ilk okumada çalıştı, sonra "login keyring locked" hatası verdi. Bu yüzden sayfaları `curl` ile indirdim ve sayfaya gömülü Next.js RSC verisini kendi betiğimle çözdüm (`h9/bin/rsc.py`, `cats.py`, `matrix.py`). Gizli Chrome'un ilk okuması T2V sesli tablosunu aynı sayılarla gösterdi, yani iki yol tutarlı.
- **Design Arena:** `POST https://www.designarena.ai/api/leaderboard` veri uç noktası, parametre `{"arenaType":"models","category":…}`.
- **LMArena:** `curl` 403 döndü, `fetch.py` aracının scrapling-stealth kapısıyla okundu.

Klasör kısaltmaları: tüm dosyalar `/tmp/claude-1000/-home-dxb-DxB-Global-OS/780184a8-14f7-45ce-91c0-2943127c7438/scratchpad/` altında. `h9/raw/…` bu işin indirmeleri, `h1/…` ve `h2/raw/…` önceki satıcı sayfaları.

---

## (a) Sıralama tabloları (okunma tarihiyle) [leaderboard]

**AA.** Okunma: 2026-10-17 21:15–21:16 yerel saat. Tablo sürümleri: AA-Video-T2V v2.1, I2V v1.1, I2V-Silent v1.0, Editing v1.1. AA her tabloda ölçeği sabitlemek için bir modeli referans (anchor) alıyor ve 1000'e kilitliyor: T2V tablolarında Kling 3.0 1080p (Pro), I2V-sessizde Wan 2.1 14B. Hücrelerde sıra:Elo±güven aralığı var.

| Model | T2V sesli (28 model) | T2V sessiz (31) | I2V sesli (23) | I2V sessiz (82) | Düzenleme sesli (9) | LMArena T2V (güncelleme Sep 21) | LMArena I2V (Sep 21) | Design Arena video / i2v / çok-girdi / v2v (lastUpdate 2026-10-17T18:06Z) |
|---|---|---|---|---|---|---|---|---|
| Wan 3.0 | **1:1174±15** | **1:1135±19** | 4:1127±16 | 3:1362±13 | **1:1200±11** | 6:1476±13 | 3:1480±11 | 3 / 6 / – / – |
| Utopai X (API yok) | 2:1169±16 | – | – | – | – | – | – | – |
| Seedance 2.5 | 3:1160±15 | 4:1105±18 | 2:1138±17 | – | 2:1155±12 | 7:1474±9 (720p) | 4:1477±7 | 11 / 8 / **1** / – |
| MiniMax H3 (768p) | 4:1159±15 | 2:1121±18 | **1:1140±16** | 4:1356±11 | 4:1125±11 | 8:1460±9 | **1:1495±5** | 8 / 7 / 2 / 2 |
| H3 Max (fal) | 5:1155±16 | 3:1119±17 | 5:1125±17 | – | – | – | – | listede yok |
| FLUX 3 | 6:1146 | 5:1094 | 7:1086 | – | – | 3:1493 | 9:1449 | 6 / 13 / – / – |
| Gemini Omni Flash 1.1 | 8:1132±15 | 7:1073±18 | 3:1132±17 | – | 3:1149±11 | **1:1516±15** | 2:1488±11 | **1** / 17 / 7 / 4 |
| Gemini Omni Flash (1.0) | – | – | – | **1:1368±11** | – | 2:1513±9 | 6:1465±6 | – |
| Kling 3.0 Omni Pro | 15:1019 | 16:985 | 17:1004 | 16:1281 | 9:1000 (referans) | – | – | kling-o3-pro 30 / 20 / 21 / – |
| Kling 3.0 Pro | 16:1000 (referans) | 14:1000 (referans) | 18:1000 (referans) | 17:1277 | – | – | 19:1354 | 24 / – / – / – |
| Veo 3.1 | 19:968±18 | 18:961 | 13:1028 | 32:1253 | – | 12:1364 (Audio) | 13:1398 | 21 / 23 / 12 / – |
| Veo 3.1 Fast | 20:965±17 | 19:960 | 15:1017 | 28:1259 | – | 14:1362 | 15:1385 | 20 / 22 / 13 / – |

Tablo notları:
- **Yakın sıralar istatistikçe eşit.** AA'nın T2V sesli tablosunda Wan 3.0 ile H3 Max arası 19 puan ve sıra aralıkları üst üste biniyor (Wan 1–3, H3 Max 2–6).
- **AA modellerin bazı işleri reddettiğini kendisi yazıyor.** Gemini Omni Flash 1.1 bazı test istemlerini "copyright and safety filters" ile geri çevirmiş. Seedance 2.5 düzenleme testinde "declined source videos showing real people". Bu modellerin puanı yalnız ürettikleri istemler üzerinden.
- **AA, H3'ü 768p'de koşuyor** ("available in 768p or 2K only").
- **Design Arena'da güven aralığı yok** (`btStdErr: null`).
- **Design Arena'da tanımlanamayan modeller var.** "gemini-omni-flash-2" 2. sırada ama Google'ın kaldırma sayfasında böyle bir model yok ve arama sonuç vermedi; UNVERIFIED, büyük olasılıkla yayımlanmamış ya da anonim bir sürüm. "fig", "tomato", "lochness" kod adları da kimliği bilinmeyen modeller.
- **fal'ın "H3 Max AA'da ve Design Arena'da #1" sözü bugün doğrulanmıyor.** fal blogu böyle diyor (`h1/b_introducing-h3-max-by-fal.html`). Bugün AA'da 5. sırada, Design Arena'da listede yok. Çıktığı gün (Ağustos) birinci olup olmadığı UNVERIFIED.
- **Video düzenleme tablosunda yalnız 9 model var.** H3 Max, Veo ve Kling 3.0 Pro bu tabloda yok.

**AA'nın kullanım alanı / yetenek alt tabloları (T2V sesli).** Her kategoride güven aralığı ±45–55, yani ilk 5–8 model istatistikçe çoğu zaman ayrışmıyor:

| Kategori | 1. | 2. | 3. | Seedance 2.5 / H3 / H3 Max / Omni 1.1 / Kling 3 Pro / Veo 3.1 |
|---|---|---|---|---|
| Marketing & Advertising | H3 Max 1167 | Utopai X 1166 | Seedance 2.5 1163 | 3 / 5 / 1 / 8 / 16 / 17 |
| Retail & Ecommerce | Seedance 2.5 1162 | Utopai X | Wan 3.0 | 1 / 4 / 5 / 8 / 12 / 18 |
| Human Anatomy | Seedance 2.5 1184 | Wan 3.0 | Seedance 2.0 | 1 / 5 / 6 / 8 / 15 / 20 |
| Dialogue & Lip Sync | Seedance 2.5 1202 | FLUX 3 | Wan 3.0 | 1 / 4 / 7 / 8 / 14 / 25 |
| Audio Synchronization | Omni 1.1 1177 | Utopai X | Seedance 2.0 | 8 / 4 / 7 / 1 / 16 / 17 |
| Text Rendering | Utopai X 1360 | H3 Max 1352 | Wan 3.0 1342 | 7 / 4 / 2 / 5 / 21 / 17 |
| Animation & Gaming | Wan 3.0 1231 | H3 Max | Utopai X | 4 / 7 / 2 / 6 / 19 / 18 |
| Multi-Scene & Narrative | H3 Max 1190 | Wan 3.0 | H3 | 5 / 3 / 1 / 6 / 15 / 20 |
| Camera Control | Utopai X 1163 | Wan 3.0 | H3 Max | 4 / 5 / 3 / 9 / 17 / 24 |
| Physics | Utopai X 1122 | Seedance 2.5 | H3 | 2 / 3 / 7 / 8 / 12 / 21 |
| Live-Action Film | Wan 3.0 1110 | H3 | Utopai X | 4 / 2 / 7 / 8 / 10 / 25 |
| Lighting & Materials | Wan 3.0 1183 | Utopai X | H3 Max | 5 / 4 / 3 / 9 / 18 / 20 |
| Spatio-Temporal Consistency | H3 Max 1152 | Utopai X | H3 | 4 / 3 / 1 / 8 / 17 / 18 |

Kategorilerin tamamı: `h9/aa_t2v_audio_matrix.txt` (sesli) ve `h9/aa_t2v_silent_matrix.txt` (sessiz). Sessiz tabloda Wan 3.0 pazarlama, perakende, anatomi, çok-sahne ve sosyal medyada birinci. H3 Max animasyon, yazı ve "frontier" kategorisinde birinci. Seedance 2.5 kamera kontrolü ve "consumer" kategorisinde birinci.

**AA düzenleme alt tabloları:**

| Kategori | 1. | 2. |
|---|---|---|
| Complex Edits | Wan 3.0 1337 | Omni 1.1 1286 |
| Object Editing | Wan 3.0 1163 | Omni 1.1 1096 |
| Physics & World Simulation | H3 1235 | Wan 3.0 1224 |
| Sound & Speech Editing | Seedance 2.5 1367 | Wan 3.0 1344 |
| Visual Effects Editing | Wan 3.0 1093 | Omni 1.1 1059 |

**Ek tablo, OpenArt Arena Lip Sync (2026-09-24, beş model uygun bulunmuş):** Seedance 2.5 1123, Seedance 2.0 1060, Seedance 2.0 Mini 1054, H3 1000 (referans), Wan 3.0 923. Veo, Kling ve Omni bu tabloda yok. Kaynak: `h9/raw/ind2/02-openart.ai.md`.

---

## (b) Yetenek tablosu (satıcı belgeleri) [vendor]

| | Seedance 2.5 | Kling 3.0 / O3 | Kling 4.0 | MiniMax H3 | H3 Max / Turbo (fal) | Veo 3.1 / Fast | Wan 3.0 | Gemini Omni Flash 1.1 |
|---|---|---|---|---|---|---|---|---|
| Tek çekimde en uzun süre | 4–30 s | 3–15 s | 3–30 s; uzatmayla 2 dk'ya kadar | 5–15 s | 0.92–15 s | 4/6/8 s; uzatmayla 148 s'ye kadar | 2–30 s | 3–10 s (fal) |
| Çözünürlük | 480/720p yerel. fal 1080p seçeneği sunuyor ama aynı sayfa "native up to 720p" diyor (çelişki aşağıda) | 1080p; fal'da `v3/4k` ve `o3/4k` uç noktaları | 720p / 1080p / 4K, 10-bit HDR | 2K (kısa kenar 1440 px) | 480 / 768 / 1080P; 1080p "latent refinement from 768P" | 720p / 1080p / 4K (1080p ve 4K yalnız 8 s) | 480 / 720 / 1080p | 360 / 720p; 1080p ve 4K "upscaled" |
| Yerel ses | Var | Var (O3'te varsayılan kapalı) | Stereo | Stereo | Var, `target_audio_url` ile | Her zaman açık | Var, kapatılabilir | Var, kapatılamıyor |
| Dudak senkronu / diller | 11+ dil (Arapça dahil) | Yalnız Çince ve İngilizce konuşma; başka dil İngilizceye çevriliyor | 9+ dil | Ses kopyalama, diyalog satırı değiştirme | Ayrı lip-sync uç noktası: ses 5 s'den 15 dk'ya kadar | Diyalog var; dil listesi Veo sayfasında görülmedi | Konuşan kişi örneği var; dil listesi bulunamadı | "Yalnız İngilizce tam destekli" |
| Tek koşuda çok çekim | Zaman damgalı çekim listesi | `multi_prompt` ile 6 çekime kadar | 10 anahtar kare | Var | `director` uç noktası | – | Var | Varsayılan olarak kendiliğinden kesiyor |
| Referans girdi | 30 görsel + 10 video + 10 ses, toplam 50 | En fazla 4 öğe/görsel (video ile) | 10 görsel + 5 video + ses; toplam 15 | 9 görsel + 3 video + 3 ses; toplam 12 | Var | 3 görsel | 10 görsel + 5 video + 5 ses + 1 belge | Görseller + 3 video (her biri ≤3 s); ses referansı yok |
| İlk/son kare | Var | Var (`end_image_url`) | Var | Var | Var | Var | Var | Var |
| Kamera kontrolü | İstemle | `shot_type` | Var | İstemle | `camera-controls` (yörünge, yükseklik, mesafe) | İstemle | İstemle | Doğal dille |
| Video düzenleme | Ürün, stil, yüz, ışık, arka plan değiştirme | O3 edit, v2v reference | Var | Nesne ekleme/çıkarma, ışık, diyalog satırı | extend, insert, recast, relight, 3d-to-video | extend | Görsel, kurgu ve diyalog değiştirme | Konuşarak düzenleme; uzatma yalnız sona |
| Yazı/logo | – | – | Logo ve çok dilli metin | "Legible type… brand marks" | – | – | Satıcı kendisi zayıf diyor: "on-screen text rendering accuracy… not yet" | – |
| fal fiyatı ($/s) | 480p 0.2205, 720p 0.473, 1080p 1.164 | Pro: ses kapalı 0.112, açık 0.168; 4K 0.42 | API yok | AA'ya göre 768p ≈ 0.08 | H3 Max 768p 0.052 (kampanya), 31 Ekim'den sonra 0.08. Turbo 768p 0.026, sonra 0.04 | 0.20 / 0.40 (ses), 4K 0.60. Fast 0.10 / 0.15 | 0.05 / 0.10 / 0.20 | 0.03 / 0.10 / 0.15 / 0.30 |

Satıcı belgelerindeki iki çelişki:
- **Seedance 2.5 çözünürlüğü.** fal belgesi 1080p seçeneği sunuyor ama aynı sayfada "native… up to 720p" yazıyor. BytePlus planları "480P / 720P" diyor (`h2/raw/bp_seed.txt`). Atlas Cloud da 1080p'nin 720p kaynaktan büyütme olduğunu yazıyor. Sonuç: yerel 1080p UNVERIFIED.
- **Kling 3.0 diyalog dilleri.** fal "Supports Chinese and English voice output. Other languages are automatically translated to English" diyor. Fuser ise Kling 3.0 rehberine dayanarak Japonca, Korece ve İspanyolcayı da sayıyor.

Belge kaynakları:
- fal belgeleri: `h9/raw/fal/*.txt`, `h1/m_*.txt`, `h2/raw/fal_h3.txt`, `fal_seed25.txt`
- Kling 4: `h9/raw/s_kling4.txt` (kling.ai kullanım kılavuzu, 2026-10-14), `h9/raw/kling4_dev.md`
- Veo: `h9/raw/veo2.txt`
- Omni: `h9/raw/omni_doc.txt` (sınırlamalar bölümü)
- Wan: `h9/raw/wan3_blog.txt`
- Kling 3 sınırlamaları: `h2/raw/rep_kling3.txt` ("Audio works best in English and Chinese")

---

## (c) Çekim türü × en iyi 1–2 model × kanıt

| Çekim türü | En iyi 1–2 | Kanıt |
|---|---|---|
| Ürün packshot / dönen ürün | **Kling 3.0** (ürünü en sadık tutan), **Veo 3.1 Fast** (gerçek yörünge çeviren) | Swayclip, 2026-10-09: 5 fotoğraf × 6 model, tek deneme. Veo 3.1 Fast "only model that consistently performed a real orbit". Kling 3.0 "shapes and colors held up best". Seedance 2.5'te 5 üründen 2'sinde tasarım kaydı. Moda, 2026-09-18 turntable testi: Veo 3.1 Fast, Hailuo 2.3, Wan 3.0, Kling 3.0 Std. AA perakende kategorisi: Seedance 2.5 birinci. [independent test, leaderboard] |
| Ürün fotoğrafından video (ürünü bozmadan) | **Wan 3.0**, **Kling 3.0 Pro** | Moda "image-to-video": Wan 3.0 "kept the product exactly". Seedance 2.5 Moda'nın kendi fotoğrafını "copyright risk" diye reddetti. Omni ürünü değiştirdi. [independent test] |
| Ürünü tutan / kullanan eller | **Kling 3.0 Pro**, Seedance 2.0 / Wan 3.0 | Moda "hands-action": Kling 3.0 Pro "best pour". H3 ve Veo 3.1 Fast sahne nesnelerini değiştirdi. Oakgen (Mayıs 2026, 20 istem, kör puanlama): "chef chopping" testinde Kling kazandı. [independent test] |
| Kameraya konuşan kişi | **Seedance 2.5** (AA ve OpenArt'ta 1.), **Veo 3.1 / Veo 3.1 Fast** (bağımsız testlerde) | AA "Dialogue & Lip Sync" kategorisi: Seedance 2.5 1202, Veo 3.1 25. sırada. Ama bağımsız testler Veo'yu öne koyuyor: Oakgen 4/4 Veo (Kling'e karşı); Moda talking-head 1. Seedance 2.0, 2. Veo 3.1 Fast, 3. Wan 3.0, 4. H3; Fuser (2026-09-28) en güvenilir olarak Veo 3.1 ve LTX-2.5 Pro. Kaynaklar çelişiyor; stüdyo kendi testinde çözmeli. [leaderboard, independent test] |
| Çok dilli dudak senkronu | **Seedance 2.5** (en geniş dil listesi); Kling 3.0 ve Omni'nin yapısal sınırı var | Satıcı: Seedance 11+ dil, Arapça dahil; Kling 3.0 Çince/İngilizce; Omni "yalnız İngilizce tam destekli". PicassoIA testi: Seedance'te Arapça "Medium-Low" (zayıf kaynak). note.com: Japoncada kanji kelimeler zaman zaman Çince okunuyor (H3 ve Seedance'te de). **Türkçe için hiçbir test bulunamadı.** [vendor, independent test] |
| İki ve daha fazla kişi diyaloğu | **Seedance 2.5**, Veo 3.1 | AA diyalog kategorisi; OpenArt çok-karakter ağırlığı. Oakgen "colleagues debating": Veo 8.0, Kling 4.5. Seedance 2.5 belgesinde "multiple characters keep their voices". [leaderboard, independent test, vendor] |
| Hızlı aksiyon / spor | **Kling 3.0** (Kling 4.0 iddialı), Wan 3.0 | Oakgen: dansçı/koşucu testlerinde Kling kazandı. videomodels.ai "Sports" (yapay zekâ hakem, tek koşu, istem başı 4): HappyHorse 1.0 4.05, H3 4.00, Veo 3.1 3.92, Seedance 2.5 3.55. Wan 3.0 satıcı sayfası: "full-body motion at speed". Kling 4.0'ın "fast-paced fights, competitive sports" iddiası test edilmedi (UNVERIFIED). [independent test, vendor] |
| Araçlar / otomobil | **Kanıt yok** | Araç çekimine özel bağımsız test bulunamadı (aramalar: `exa_11`, `exa_30`, `tav_31`). Hiçbir tabloda araç kategorisi yok. UNVERIFIED. |
| Hayvanlar | Kling 3.0 Turbo, Omni (zayıf kanıt) | videomodels.ai "animals": Kling 3.0 Turbo 4.08, Omni 3.97, Veo 3.1 3.80, H3 3.75, Seedance 2.5 3.70. Yapay zekâ hakem, n=4. [independent test, zayıf] |
| Çizgi / 2D / 3D animasyon | **H3 / H3 Max**, Wan 3.0 | AA animasyon kategorisi: Wan 3.0 1231, H3 Max 1210 (sesli); sessizde H3 Max 1. videomodels.ai animation: H3 4.12, Omni 4.07. Moda woodblock testi: Veo 3.1 1., H3 2. note.com anime testi: "H3 is better suited for anime". [leaderboard, independent test] |
| Belgesel / doğa b-roll | **Wan 3.0 (Prime)**, Veo 3.1 Fast | videomodels.ai "nature": Wan 3.0 Prime 4.08, Wan 3.0 4.00. Moda: kamera hareketi 1. Veo 3.1 Fast, 2. Wan 3.0; kalabalık sahne 1. Veo 3.1 Fast, 2. Wan 3.0. AA "Live-Action Film": Wan 3.0 1. [independent test, leaderboard] |
| Ekrandaki yazı / logo | **H3 Max / H3**, **Veo 3.1**; Kling'den kaçınılmalı | AA Text Rendering: H3 Max 1352 (sesli 2., sessiz 1.), Kling 3 Pro 21. Moda text-card: Veo 3.1 1., H3 4.; Kling iki sürümde de yazıyı bozdu ("MDDA SUMMER SESSIIONS"); Wan, fal'ın içerik denetiminde reddedildi. Atlas Cloud'un 10 testi yazıda Seedance 2.5'i en güçlü buldu. Wan satıcısı yazıyı kendi zayıflığı sayıyor. Omni Latin dışı yazıda "Unreliable" (JXP). [leaderboard, independent test, vendor] |
| Tek parça 30 s çekim | **Wan 3.0** (yerel 1080p), **Seedance 2.5** (720p) | Satıcı belgeleri: ikisi de 30 s. Atlas Cloud: Wan'ın resmi demosu ffprobe ile 1920x1072, 30.07 s ölçülmüş. FlyAIgh (25 s tek çekim): ikisi de karakteri tuttu, Wan'ın ejderhası renk değiştirdi. PingWest: Seedance "tek çekim" isteğine rağmen arada kesti ve sonunda yükleme gemisini beton zemine koydu. DesignHero (gerçek reklam işi): 720p'de duraklatılan geniş planlar "blurry and mushy". [vendor, independent test] |
| Mevcut klibi düzenleme | **Wan 3.0** (genel), **Seedance 2.5** (ses ve konuşma), H3 (fizik) | AA düzenleme tablosu yukarıda. Everypixel (2026-09-23, 6 model, 5 düzenleme, tek deneme): Seedance 2.5 tüm görevlerde başarılı ama en pahalı; Wan stil değişiminde kişiyi tutan tek model ama istenmemiş nesne ekliyor; Kling ışık değiştirmede başarısız; Omni klibi düzenlemek yerine sahneyi yeniden çekiyor. H3 Max'in recast ve relight uç noktaları bağımsız test edilmedi. [leaderboard, independent test] |

Bağımsız test dosyaları:
- `h9/raw/ind/` (Swayclip, Astria, note.com, Atlas Cloud, PingWest, Oakgen, Moda)
- `h9/raw/moda/` (Moda'nın 9 çekim türü sayfası)
- `h9/raw/ind2/` (Everypixel, OpenArt, Fuser, Atlas 30 s, Zooop, JXP, MindStudio)
- `h9/raw/vm/vm_scores.json` (videomodels.ai, istem başı skor)

**Kaynak güvenilirliği.** Swayclip, Moda, Atlas Cloud, Fuser, Everypixel/Wavespeed ve ImagineArt bu modelleri kendileri satan aracılar. Çoğu modele tek deneme yapıyor; kör inceleme yalnız Oakgen'de var. Astria kendi sayfasını "calibration, not a ranking" diye etiketliyor. videomodels.ai skorlarını yapay zekâ hakem veriyor ve puan farkları 0.1–0.2 düzeyinde.

---

## (d) Stüdyonun kendisinin test etmesi gereken iddialar

1. **Veo 3.1 hangi yoldan erişilebilir kalacak.** Gemini API kapanışı 22 Ekim. fal ve Vertex'teki Veo 3.1 uç noktalarının kapanış sonrası durumu bilinmiyor.
2. **Kling 4.0 API'si ve fal'daki `v4` sayfasının gerçekten çağrılabilir olup olmadığı.** Satıcının 30 s, 4K/HDR ve hızlı aksiyon iddiaları hiçbir yerde ölçülmedi.
3. **Seedance 2.5'in 1080p çıkışı yerel mi, büyütme mi.** fal belgesi kendi içinde çelişiyor; ürün yakın planı için kritik.
4. **H3 Max'in "5 s klip 3 s'nin altında" ve "AA/DA'da #1" iddiaları.** Astria 9 s için 44 s, Moda 6–26 s ölçtü; AA'da bugün 5.
5. **Kameraya konuşma: Seedance 2.5 mı, Veo mu.** Sıralama tabloları ile bağımsız testler zıt sonuç veriyor.
6. **Türkçe ve Arapça dudak senkronu.** Bu iki dil için hiçbir model test edilmemiş. Kling 3.0'ın bu dilleri İngilizceye çevirmesi ve Omni'nin "yalnız İngilizce" sınırı ayrıca doğrulanmalı.
7. **Kling 3.0 diyalog yapabiliyor mu.** Oakgen "sessiz, mırıldanır gibi ağız hareketi" dedi; Replicate ve Moda "konuşuyor" diyor.
8. **Ürün ve marka yazısını koruma.** Kling'in yazıyı bozması, Seedance 2.5'in ürünlerin 2/5'inde tasarım kayması, Wan'ın kendi kabul ettiği yazı zayıflığı. Holdingin kendi logolarıyla denenmeli.
9. **Reddetme oranları.** Seedance 2.5 ürün fotoğrafını ve gerçek kişileri reddediyor; Omni tanınabilir kişileri reddediyor ve AB/AEA/İngiltere'de yüklenen videoyu düzenlemiyor; Wan fal'ın içerik denetimine takılıyor; Seedance 2.5 ve Omni AA'da filtreye takılıyor.
10. **Araç, hayvan, doğa ve spor çekimleri.** Kanıt ya yok ya da yalnız yapay zekâ hakemli, n=4.
11. **Düzenleme davranışı.** Wan'ın istenmemiş nesne eklemesi, Omni'nin sahneyi yeniden çekmesi, Kling'in ışık değiştirememesi tek denemeye dayanıyor. H3 Max'in recast, relight ve insert uç noktalarının bağımsız testi hiç yok.
12. **30 s tek çekimde gölge ve arka plan kayması** (FlyAIgh: Wan'ın ejderhası; PingWest: Seedance'in gemisi) ve 720p'nin reklam yakın planına yetip yetmediği.
13. **Fiyatlar kısa ömürlü.** H3 Max kampanyası 31 Ekim'de bitiyor ve fiyat yaklaşık %54 artıyor. Runware, WaveSpeed, Replicate ve kie.ai fiyatları bu işte yeniden ölçülmedi (`h2/raw/` 17:47–17:57 tarihli).
14. **Kimliği belirsiz modeller.** Design Arena'daki "gemini-omni-flash-2", "fig" ve "tomato" bilinmiyor; AA'daki Utopai X ve Bach 1.0 Pro'nun API'si yok veya doğrulanmadı.

**Yapılamayanlar:** ACM'deki EVBench makalesi (e-ticaret video benchmark'ı) ve vidscore lip-sync karşılaştırması fetch kapılarında açılmadı. Gizli Chrome giriş anahtar kasası kilitli olduğu için kapalı. Araştırma aracının derin yolu (fleet) 4 dakika sınırına takıldığından hızlı yolla çalıştım. Kendi yazdığım betikler `h9/bin/` altında.