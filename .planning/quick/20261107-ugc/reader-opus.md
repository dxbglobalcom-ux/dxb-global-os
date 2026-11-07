# Okuyucu: opus — hiper-gerçekçi YZ UGC reeli (De86u1YgMrs)

Kaynak: transkriptin bütün satırları + 9 kare sayfası + 41,5–46,5 sn adım adım. Saatler kareden (transkript ~1 sn erken). Video kopyamız 720×1280, **30 fps**, 96,17 sn (ffprobe, `scene.log`).

## 1. Kelime kelime, adım adım

| Adım · sn | Söylediği / gösterdiği | Neden "YZ izini" siler (**çıkarım**) |
|---|---|---|
| **Önce/sonra** 0:03–0:17 | Önce: topuz saçlı, kapüşonlu kadın, kavanoz, *"This is what I've been using for my dry skin"*. Sonra: **başka kadın**, pijama, tavan lambalı oda, "Moochi Daily Barrier Serum" damlalık, *"Korean moisturizer… patented hydration formula"*. | — (bkz. §6) |
| **1 Referans** 0:20–0:37 | *"really good reference image"*; T2I kutusuna "a girl holding a serum jar, natural light, ug" yazılıyor (0:26); ChatGPT / **Nano Banana Pro** logoları (0:29); görsele "AI 87%" rozeti (0:30); TikTok, Pinterest, Instagram ekranları; *"adapt into your own"*, kartlar "Real → Adapted" (0:36–0:37). | Metinden üretilen kare idealize ışık, kusursuz cilt ve sahne gibi duran oda taşır. Gerçek telefon karesi ise kadraj, oda ve ışık kusurunu taşır. |
| **2 Senaryo** 0:37–0:46 | script.txt, 22 kelime: *"Okay so I have been using this for like two weeks and honestly? My skin has never felt this soft. Like, ever."* Sonra pembe vurgu, ardından *"It's not this, it's that"* ve "Short. Choppy." | "Değil X, Y" kalıbı ve üçlü kısa cümle, LLM'in imzasıdır. Dolgu sözcükleri ("okay so", "like") insan konuşmasıdır. |
| **3 Ses** 0:46–1:08 | *"most important thing by far… fix your damn voice"*; "Default voice" üstü çizili, altında Veo · Sora · Kling (0:57); "You / Clone" dalgaları + ElevenLabs logosu; *"completely free… comment the word clone"*. **Araç adı verilmiyor.** | Motorun hazır sesi herkeste aynı tını ve düz vurgudur. |
| **4 Renk** 1:09–1:18 | Ofis karesinde büyüteç ve "flat" etiketi; *"boost the saturation and tone down the yellows"*. Saturation kaydırıcısı sağa, Yellows sola gidiyor. **Sayı verilmiyor.** | Üreticilerin düz, sarı dökümü (onun iddiası). |
| **5 Kare hızı** 1:19–1:31 | *"upscale it. Specifically, the frame rate… dead giveaway"*; "24 fps" rozeti, 24↔60 fps kaydırıcısı; Topaz Labs **Starlight 2.5**; "480p · 24fps → 1080p · 60fps". | 24 fps sinema kadansıdır. Telefon videosu 30/60 fps çeker, bu yüzden 24 fps'teki takılma ele verir. |

## 2. Önce kendi fabrikamız (ücretsiz, varsayılan) — ölçülen

**Elimizde olan:** MiniMax H3 FL2VA ve Ref2VA (fp8 + turbo LoRA'lar, `~/tools/ComfyUI-models/comfyorg/`), FLUX.1-Krea, FLUX.2-klein-4B, Qwen-Image-Edit-2511, SeedVR2 3B ve 7B-sharp (`/home/dxb/models/seedvr2/`), RealESRGAN ncnn, ComfyUI 0.34.0. Voicebox `/home/dxb/voicebox` altında duruyor. **Voice Studio diskte yok** (ölçüldü).

1. **Referans:** H3'ün yerel yolu metinden başlar. Yüzler yalnız H3'ün doğurduğu kadrodan gelir (AHMET, JAMES), yerel motora Flux karesi verilmez (B43(c)). Gerçek UGC karelerinden **yalnız kadraj, oda, ışık ve telefon açısı** prompta yazılır. Ref2VA (9 görsel) yalnız oda ve ışık referansı için kullanılır, **gerçek kişinin yüzü için asla**.
2. **Senaryo:** senarist koltuğu yazar. Kural listesi: "değil X, Y" yok, üçlü kısa kalıp yok, dolgu sözcükleri ve yarım cümle serbest. Her cümleyi sesli okutup ölçeriz (WER kapısı zaten var).
3. **Ses:** B43 (8) şunu söylüyor: *"the engine's own voice born in the take (no TTS, no recorded or cloned voice)"*. Kabul ettiği EYW-001 v2 bu yoldan çıktı (*"tam doğal ses ve görüntü"*). Bugünkü sözü ise "ElevenLabs yerine Voice Studio". **Çelişki: ona tek satırla sorulur.** Klon ses gerekirse yol şudur: Voice Studio ([debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio), AGPL-3.0, ★103.751, son push 2026-11-07, varsayılan motor OmniVoice) klonlar. Klon ya H3 Ref2VA'ya ses referansı olarak girer ya da sonradan dudak eşlemesi yapılır. Ses referansı yolu EYW-001 v1'de denendi ve o el 2026-09-04'te onun emriyle iptal edildi. Dudak eşlemesi için LatentSync 1.5 kullanılır (8 GB VRAM; 1.6 18 GB ister ve 16 GB kartımıza sığmaz; [bytedance/LatentSync](https://github.com/bytedance/LatentSync), Apache-2.0). Dudak eşlemesi kendi ağız izini ekler, bu yüzden H3'ün sesle birlikte doğan dudağı gerçekçilikte önde.
4. **Renk:** ffmpeg kullanılır. Bugünkü `~/tools/h3/ugc/post-ugc.sh` şunu yapıyor: `eq=saturation=1.02`, `noise=alls=5` grenli ve **bilerek "slightly warm"**. Video bunun tersini söylüyor. Önerilen başlangıç: `selectivecolor=yellows='0 0 -0.15 0'` + `eq=saturation=1.08` ([ffmpeg-filters](https://ffmpeg.org/ffmpeg-filters.html#selectivecolor)). Bu değerler ölçülmedi; doğru değeri onun gözü seçer.
5. **Büyütme ve kare hızı:** H3 640×1152, **24 fps** üretir (`studio.mjs` satır 452). Önce LAW D gereği taslak onun gözünden geçer. Sonra SeedVR2 7B-sharp ile 1080×1920'ye büyütülür (ölçülmüş: 5,64 sn/kare 2K'da; 3B 1080'de 4,07–4,25). **Kare ara-doldurma için yeni kurulum gerekmiyor:** ComfyUI 0.34.0 çekirdeğinde `FrameInterpolate` düğümü var (RIFE + FILM, `comfy_extras/nodes_frame_interpolation.py`). Ama `models/frame_interpolation/` boş. Ağırlık için iki seçenek:
   - RIFE **4.25**: [hzwer/Practical-RIFE](https://github.com/hzwer/Practical-RIFE), MIT, ★1.038, son push 2026-08-27. Kendi notu: "4.24+ diffusion videoya uygun", varsayılanı 4.25.
   - `film_net_fp16.safetensors`: ComfyUI'nin kendi şablonu ([HF Comfy-Org](https://huggingface.co/Comfy-Org/frame_interpolation)). FILM'in ana deposu arşivlenmiş ([google-research](https://github.com/google-research/frame-interpolation)).

   Çarpan tam sayı (2–16) olduğu için 24→60 şöyle yapılır: ×5 = 120, sonra `ffmpeg -vf fps=60`. **Sıra: önce büyüt, sonra ara-doldur.** Hesap: 362 kare × 5,64 sn ≈ 34 dk; ters sırada 905 kare ≈ 85 dk. Kart yükü ölçülmedi.

## 3. Ücretli yedek (yalnız fabrika yetmezse)

| Adım | Ücretli ikiz |
|---|---|
| 1 / video | H3 resmi API 768p **$0,08/sn**, fal H3 Max 1080p **$0,16/sn**. Kahraman plan için Veo 3.1 **$0,40/sn** (B43/B28 kayıtları) |
| 3 | ElevenLabs Starter **$6/ay** (Instant Clone, ticari kullanım), Creator **$22/ay** (Professional Clone) — [elevenlabs.io/pricing](https://elevenlabs.io/pricing), 2026-11-07 okundu |
| 5 | Topaz Video Personal **$59/ay veya $299/yıl**. **Linux sürümü yok**, istasyonumuzda çalışmaz (`study-cards/seedvr2-topaz-equivalent.md`, 2026-09-03) |
| 2, 4 | Gerek yok |

## 4. Uçtan uca hat (tek UGC)

1. Brif ve gerçek UGC'den kadraj çalışması.
2. Senarist yazar.
3. H3 çekimi: T2VA (Ref2VA yalnız oda için), 640×1152, 24 fps, motorun kendi sesi.
4. **Onun gözü** (LAW D).
5. Renk ve gren (ffmpeg).
6. SeedVR2 7B-sharp ile 1080×1920.
7. RIFE ×5, ardından fps=60 ya da 30.
8. Ses `loudnorm I=-14` (`finish-ugc.sh` içinde zaten var).
9. Son kontrol: WER, yazı kapısı, kimlik.

**Eksikler:**
- Voice Studio kurulu değil (B12'deki 2026-11-01 emri).
- Ara-doldurma ağırlığı yok ve media şeridine bağlı değil.
- UGC renk kuralı videoyla çelişiyor.
- Dinleyen kontrol eli yok (B43(k)).
- Kayıt kendi içinde çelişiyor: B43 metni "4 sampling steps" diyor, kapanış notu "studio standard 8 steps" (2026-10-19) diyor.
- `studio.mjs shot` ses izi yazmaz, UGC bu yoldan çekilmez.

## 5. Nereye gider (hiçbir şey kurulmadı)

- **B43:** bu beş adım UGC kontrol listesi olarak QC'ye eklenir. SeedVR2'den sonra ara-doldurma adımı (RIFE 4.25 / FILM, çekirdek düğüm) ve sarı/beyaz dengesi düzeltmesi eklenir. Arsenal §11 çekmecesine bir ara-doldurma satırı yazılır.
- **B12:** Voice Studio'nun kurulup Voicebox'la yan yana test edilmesi; ses kararı da bu satıra yazılır.
- **B28 H6:** aşağıdaki açıklama/beyan çatışması.

## 6. Yanlış, riskli ya da abartılı olanlar

- **Önce/sonra aynı klip değil:** iki ayrı kadın, iki ayrı ürün, iki ayrı oda var. Demo, beş adımın etkisini kanıtlamıyor.
- "En önemli" iki kez, iki farklı adım için söyleniyor: 0:18 ve 0:47'de 3. adım, 0:20'de 1. adım.
- Ses aracı saklanıyor ("comment clone"): bu bir etkileşim yemi. "AI 87%" rozetinin dedektörü adsız.
- İyi senaryo örneği de "Like, ever." diye kısa ve kopuk biter. Ürüne "moisturizer" deniyor, ekranda serum var.
- "1080p 60fps" bize ulaşmadı: elimizdeki kopya 720p, 30 fps. Telefon selfie'si genelde 30 fps'tir; 60 fps fazla akıcı durabilir. 30 ve 60 yan yana gösterilip seçim onun gözüne bırakılır.
- Gerçek içerik üreticinin fotoğrafını "uyarlamak" benzerlik hakkı riski taşır; yalnız kompozisyon alınır.
- **En büyük risk "hiç anlaşılmasın" hedefinde:**
  - Var olmayan bir kişinin *"I've been using this"* demesi sahte tanıklıktır. Bunu FTC kuralı yasaklıyor ([16 CFR 465, 2024](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials)).
  - NY GBL §396-b ve AB YZ Yasası Md. 50 yürürlükte; TikTok etiketsiz YZ içeriğini tespit ediyor (B28'de kaynaklarıyla kayıtlı).
  - B28 H6'nın kendi metni: *"presenter shown as AI — never a fake testimonial"*.
  - Beyan konusunu 2026-08-27'de ertelemişti. Aldatma (gış) sınırı ve bu çatışma onundur. Bir kez söylenir, karar onun.
