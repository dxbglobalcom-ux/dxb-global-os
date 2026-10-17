# R1-fal-h3max-endpoints-and-terms (helper report, 2026-10-17; raw evidence paths inside)

fal'ın kendi sayfalarına göre H3 Max'te mevcut bir reklam klibini yerinde düzeltmek için belgelenmiş bir yol yok. Ürünü sağ elden sola almak ya da ürünü başka bir kamera açısından göstermek hiçbir endpoint'in vaatleri arasında değil. Belgelere en yakın araç `insert-video`: klibin seçilen bir aralığını prompt ve referans görsellerle yeniden üretiyor ve yalnız üretilen saniyeyi faturalıyor. Ancak elin doğru çıkacağına dair bir söz yok, bunu ancak deneme gösterir (UNVERIFIED). Yan bulgu: H3 Max ailesi istenen 9 endpoint'ten fazla; listede 12 endpoint, Turbo varyantları ve 5 stil endpoint'i var.

Kaynak olarak her endpoint'in `https://fal.ai/models/minimax/h3-max/<ep>/llms.txt` sayfasını okudum (aşağıda "<ep>" diye anıyorum). Fiyatları ayrıca HTML sayfasına gömülü `pricingInfoOverride` alanıyla karşılaştırdım; ikisi aynı. Endpoint listesi `https://fal.ai/sitemap.xml`'den geldi. Ham dosyalar `/tmp/claude-1000/-home-dxb-DxB-Global-OS/780184a8-14f7-45ce-91c0-2943127c7438/scratchpad/h1/` altında.

## Endpoint tablosu (fiyatlar saniye başına, USD)

| Endpoint | Satıcının sözü (kısa) | Video girdisi var mı | Süre / çözünürlük | Şu an (31 Ekim'e kadar) | 31 Ekim sonrası | Girdi videosu faturalanıyor mu |
|---|---|---|---|---|---|---|
| text-to-video | "post-trained variant of MiniMax H3" | Yok (isteğe bağlı `target_audio_url`) | 0.92–15 s; 480P/768P/1080P | 0.0325 / 0.052 / 0.104 (%35 indirim) | 0.05 / 0.08 / 0.16 | – |
| image-to-video | aynı | Yok; `image_url`, `end_image_url` | 0.92–15 s; 480/768/1080 | 0.0325 / 0.052 / 0.104 | 0.05 / 0.08 / 0.16 | – |
| reference-to-video | aynı; referanslar "Image 1 / Video 1" diye anılıyor | Evet, `reference_video_urls` ("motion/reference", her biri 2–15 s, toplam en çok 15 s); ayrıca ilk, orta ve son kare görseli | 0.92–15 s; 480/768/1080 | 0.05 / 0.08 / 0.16. Sayfada promo notu yok. | aynı | Evet. 4.096 token ücretsiz, sonrası 1.000 token başına $0.02. Örnek: 768p'de 5 s referans video ek $0.563, 15 s ise ek $1.974 (sayfadaki tablo). |
| director | "continuous, realtime video streams with live prompts" | Yok (image, end image, audio) | Canlı oturum, varsayılan en çok 15 dk | 0.052 | 0.08; 1080p bunun 2 katı. Oturum başına en az 60 s faturalanıyor. | – |
| reference-director | "Direct a continuous world in real time with image references" | Yok (görsel ve ses referansı) | 480p'den 1440p'ye | "$0.05 per seconds". `pricing_status` alanı "provisional-experiment". | Sayfada yazmıyor (UNVERIFIED) | – |
| recast | "replaces the main people in a source video with people from reference photos… preserve the original motion, gestures, camera, shot timing, and soundtrack" | Evet, 5–30 s, tek plan en çok 15 s; en çok 4 kişi fotoğrafı | 768P/1080P | 0.30 / 0.45. Promo yok. | aynı | Çıktı saniyesi faturalanıyor; çıktı kaynakla aynı uzunlukta. |
| relight | "Change the lighting of an existing video… keeping the subjects, setting, motion and camera" | Evet, en çok 15 s, artı ışık küresi görseli | 480/768/1080/2K | 0.05 / 0.08 / 0.16 / 0.32. Promo yok. | aynı | Çıktı süresi kaynak süresine eşit. |
| lip-sync/image-to-video | "generates a video from an image and supplied audio" | Yok (görsel ve ses) | 480p'den 2K'ya | 0.05 / 0.08 / 0.16 / 0.32. 15 s üstü ×1.2. | aynı | – |
| extend-video | "adds a text-guided continuation to an existing video" | Evet, 1.625–60 s, en çok 50 MB | Eklenen kısım 0.71–15 s; 480p'den 2K'ya | 0.05 / 0.08 / 0.16 / 0.32. Promo yok. | aynı | Üretilen saniye, artı 4.096 tokeni aşan referans. Kaynağın bu tokene sayılıp sayılmadığı yazmıyor (UNVERIFIED). |
| insert-video | "generates a new scene between two selected points in an existing video" | Evet; `start_time`, `resume_time`, isteğe bağlı referans görsel ve video, `color_match` | Üretilen sahne 5–13 s; yalnız 480p/768p | 0.05 / 0.06 | aynı | "Only the newly generated scene duration is billed"; 4.096 tokeni aşan referans ayrıca. |
| camera-controls | "turns a single image into a video with precise, keyframe-based control over the camera's orbit, elevation, and distance" | Yok, tek `image_url`; `camera_trajectory` ile azimut, yükseklik, mesafe | 0.92–15 s; 480/768/1080 | 0.0325 / 0.052 / 0.104 | 0.05 / 0.08 / 0.16 | – |
| 3d-to-video | "Transform Blender renders and 3D previs into photorealistic video" | Evet, en çok 15 s; kamerayı ve hareketi kaynak video belirliyor | 480/768/1080 | 0.05 / 0.08 / 0.16, en az 5 s | aynı | Evet, girdi videosu için referans tokeni ("same as Reference to Video"). |
| styles/* (vhs ve 4 diğer stil) | Örn. "768p VHS-style video" | Yok | 5–15 s, 768p | 0.08 (vhs) | – | – |

H3 Max Turbo'nun üç endpoint'i de var: text-to-video, image-to-video ve extend-video. Turbo text- ve image-to-video şu an 0.01625 / 0.026 / 0.052; 31 Ekim sonrası 0.025 / 0.04 / 0.08. Turbo extend-video promosuz 0.025 / 0.04 / 0.08 / 0.16 ve yalnız devam süresini faturalıyor. Kaynak `https://fal.ai/models/minimax/h3-max-turbo/<ep>/llms.txt`.

**Promo kapsamı:** %35 indirim notu yalnız text-to-video, image-to-video, camera-controls, director ve Turbo'nun text-to-video ile image-to-video endpoint'lerinde var. Düzeltme işine yarayan endpoint'lerde (recast, relight, extend, insert, reference-to-video, 3d) promo yok; 31 Ekim'de fiyatları değişmiyor.

## Düzeltme senaryosu: belgelerin dediği

- **El değişimi:** Hiçbir endpoint "nesneyi tutan eli değiştir" demiyor.
  - `insert-video` seçilen aralığı prompt ve referansla yeniden üretip asıl görüntüye geri dönüyor. Bu, klibin tamamını değil yalnız hatalı bölümü yeniden üretme yolu (en az 5 s, en çok 768p, 768p'de saniyesi $0.06). Elin doğru çıkıp çıkmayacağı belgelenmemiş.
  - `recast` prompt'u "what else to keep or change" kabul ediyor, ama endpoint'in amacı kişi değiştirmek ve saniyesi $0.30. Bunun el düzeltmesinde işe yarayıp yaramadığı UNVERIFIED.
- **Başka kamera açısı:** Mevcut klibin açısını değiştiren bir endpoint yok.
  - `camera-controls` tek bir görselden yeni bir yörünge klibi üretiyor; bu bir düzenleme değil, yeni üretim.
  - `3d-to-video` kamerayı kaynaktan aynen alıyor, yani açıyı değiştirmiyor.
  - `reference-to-video` klibi hareket referansı, ürün fotoğrafını görsel referans olarak alıp çekimi baştan üretebilir; bu da tam yeniden üretim.

Bu senaryoların gerçekten işleyip işlemediği UNVERIFIED; ancak deneme çağrısıyla ölçülür.

## "~35x" iddiası

- İddia fal'ın kendi blogunda geçiyor: `https://blog.fal.ai/introducing-h3-max-by-fal/` (yayın tarihi 2026-08-27). Cümle şu: "H3 Max generates a 5-second video in approximately 3 seconds. That's roughly 35x the throughput of the official H3 endpoint". Yazıda ölçüm yöntemi verilmiyor.
- Aynı yazıda Design Arena'dan bir alıntı var: "more than 50× the speed". Bunu yalnız fal'ın kendi aktarımı olarak okudum.
- Bağımsız teyit için artificialanalysis.ai ve designarena.ai sıralama sayfalarını indirdim. Sayfalar JS ile oluşuyor ve içinde "H3 Max" metni yok. Bağımsız teyit bu yüzden UNVERIFIED.
- Aynı yazıya göre ilk hafta %50 indirim uygulanmış.

## Şartlar, ödeme, limitler

- **Çıktının sahipliği:** Kullanım Şartları'nı okudum (`https://fal.ai/legal/terms-of-service`, "Last Updated: September 8, 2026").
  - "Customer owns… the Customer Input" yazıyor.
  - Çıktının (Output Content) müşteriye devredildiğine dair açık bir madde bulamadım.
  - fal çıktı için güvence vermiyor; "original" ve "will not infringe" olacağı garanti edilmiyor.
  - Ticari kullanımı model lisansı belirliyor: her H3 Max sayfasının verisinde `licenseType: "commercial"` var. SSS'te "Commercial use" rozeti anlatılıyor: `https://fal.ai/docs/documentation/model-apis/faq`.
- **Müşteri işi (ajans kullanımı):** API Hizmet Şartları (`https://fal.ai/legal/api-services`) "Client Solution / End Users" modeline izin veriyor. Şartlar API'nin son kullanıcıya doğrudan açılmasını yasaklıyor ve uç kullanıcılarla sözleşme yapılmasını istiyor.
  - Bir çelişki var: Kullanım Şartları "provide the Services for the benefit of any third party" ve "service bureau" kullanımını da yasaklıyor.
  - Bizim ajans modelimizin bu ikisinden hangisine girdiğini metin net söylemiyor; hukuki görüş gerekiyor (UNVERIFIED).
- **Eğitimde kullanım:** API Hizmet Şartları'na göre fal müşteri içeriğiyle model eğitmiyor; istisna "Pending Enterprise Ready" işaretli modeller. H3 Max'in bu işarete sahip olup olmadığını göremedim (UNVERIFIED).
- **İçerik kısıtları:** Kabul Edilebilir Kullanım Politikası (`https://fal.ai/legal/acceptable-use-policy`) şunları yasaklıyor:
  - rızasız benzerlik ve deepfake ("name, image, voice… likeness without their consent… commercial"),
  - çocuklarla ilgili zararlı içerik ve rızasız mahrem görüntü,
  - hassas kişisel veri işlemek.

  Ayrıca recast ve 3d-to-video'da güvenlik denetimini yalnız "Authorized callers" kapatabiliyor.
- **Veri saklama:** Kaynak `https://fal.ai/docs/documentation/model-apis/media-expiration` ve SSS.
  - İstek girdileri ve çıktıları varsayılan olarak 90 gün saklanıyor; `X-Fal-Store-IO: 0` başlığıyla kapatılıyor.
  - Yüklenen ve üretilen medya CDN'de "at least 7 days" duruyor ve bağlantılar varsayılan olarak herkese açık. Süre `X-Fal-Object-Lifecycle-Preference` başlığıyla, erişim ACL ile ayarlanıyor.
  - Sıfır veri saklama (ZDR) varsayılan değil; satış ekibinden isteniyor.
  - Müşteri materyali için bu başlıkların her çağrıda kullanılması gerekir.
- **Ödeme:** Önden alınan kredi; kart ya da ACH ile, USD olarak, vergiler hariç. Kaynak Kullanım Şartları ve `https://fal.ai/docs/documentation/model-apis/pricing`.
  - Satın alınan kredi 365 günde sona eriyor ve iade edilmiyor.
  - Promosyon kredisinin süresinde çelişki var: Kullanım Şartları "90 days" diyor, SSS "1 week to 1 year" diyor. Kullanım Şartları daha bağlayıcı belge.
  - Bakiye eşiğin altına düşünce hesap kilitleniyor.
  - Sunucu hataları (500 ve üstü) ücretlendirilmiyor; 422 hataları ücretlendirilebiliyor.
- **Eşzamanlılık:** Kaynak `https://fal.ai/docs/documentation/model-apis/concurrency-limits`.
  - Yeni hesap 2 eşzamanlı istekle başlıyor; son 4 haftada ödenen faturalara göre self-serve en çok 40'a çıkıyor.
  - Bazı modellere endpoint başına ayrı limit konabiliyor; limiti aşan istekler kuyrukta bekliyor.
  - Director'da `one_session_per_machine: true`.
- **Hesap şartları:** Giriş GitHub, Google ya da SSO ile; 18 yaş şartı var; ABD ambargosu altında olmadığınızı beyan ediyorsunuz.
  - Kullanım Şartları'nda ve dokümantasyonda şirket doğrulaması ya da KYC şartı geçmiyor. Bu "gerekmiyor" anlamına gelmez; UNVERIFIED.
  - Hesap paneli ve satın alma akışı oturum gerektirdiği için okunmadı.

## Doğrulanmayanlar

- Düzeltme senaryolarının gerçek sonucu: deneme çağrısı gerekiyor.
- Reference-director'ın 31 Ekim sonrası fiyatı.
- Extend-video'da kaynak videonun referans tokenine sayılıp sayılmadığı.
- H3 Max'in "Enterprise-ready" durumu.
- Ajans kullanımında çelişen iki maddenin yorumu.
- 35x iddiasının bağımsız teyidi.
- KYC durumu.

Fiyatları canlı API'den çekmedim; anahtar gerektiriyor (`https://api.fal.ai/v1/models/pricing`). Fiyatlar 2026-10-17 tarihli sayfa metnine dayanıyor.