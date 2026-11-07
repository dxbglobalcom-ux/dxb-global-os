# reader-fable — "5 things to get the PERFECT AI UGC" (De86u1YgMrs, 96 s)

Okunan: transkript (tamamı), sheet01–09. Ölçülen: B43/B28/B12, KATALOG, studio.mjs, `~/tools/h3`, ComfyUI, `nvidia-smi`, onay defteri. Hiçbir şey kurulmadı, açılmadı.

## 1. Kelime kelime, saniye saniye

**Önce/sonra (00:01–00:17).** "Before" 00:03–00:07: topuz saçlı kadın, kavanoz, "This is what I've been using for my dry skin…"; etiketi (01:30) **480p · 24fps**. "After" 00:08–00:17: başka kadın, pijama, "Moochi Daily Barrier Serum", 4 cümle; **1080p · 60fps**. Çıkarımım: farklı kişi, ürün, oda, ışık — kontrollü karşılaştırma değil.

| # | sn | Söylediği | Gösterdiği | Niye "AI izi"ni siler (S = söylediği, Ç = çıkarımım) |
|---|---|---|---|---|
| 1 Reference | 00:20–00:37 | "most important… real reference pics on TikTok, Pinterest, Instagram Reels… adapt into your own"; metinden referans "so obvious" | ChatGPT **veya Nano Banana Pro** promptu "a girl holding a serum jar, natural light, ug…" (00:25–00:29); "AI 87%" rozeti (00:30); Real → Adapted (00:36) | S: metin→resim yüz belli olur. Ç: gerçek telefon karesi kadraj, ışık, lens kusuru, dağınık fon taşır |
| 2 Script | 00:37–00:46 | "get rid of… 'it's not this, it's that'… short, choppy sentences" | script.txt: "Okay so I have been using this for like two weeks and honestly? My skin has never felt this soft. Like, ever." (22 kelime) | S: LLM kalıpları. Ç: dolgu söz ve kendini düzelten uzun cümle insan konuşmasıdır |
| 3 Voice ("most important by far") | 00:46–01:08 | "fix your damn voice… cannot use the default output from these video models… clone a custom voice using 11 labs"; kendi aracı ücretsiz, adsız: "comment the word clone" | Veo · Sora · Kling "Default voice" çizili (00:57); You→Clone, ElevenLabs (00:59–01:01); "$0 free" (01:04) | S: AI sesi "miles away"den tanınır. Ç: dahili ses düz tonlu, nefessiz; klonda ritim, nefes, oda tınısı var |
| 4 Colour | 01:09–01:18 | "very flat, yellowish colour profile… boost the saturation and tone down the yellows" | ofis kadını, "flat" büyüteci; Saturation ↑ Yellows ↓ kaydırıcıları (01:16–01:18) | S: üreteçlerin ortak sarı-düz tonu. Ç: telefon HDR + doygun; düz görüntü "render" hissi verir |
| 5 Frame rate | 01:19–01:31 | "upscale it. Specifically, the frame rate… dead giveaway… Topaz Starlight 2.5, upscaling to 1080p and 60fps" | "24 fps" rozeti (01:24); 24↔60 kaydırıcı; Topaz Labs · Starlight 2.5 (01:28); 480p·24 → 1080p·60 (01:30) | S: 24 fps takılır. Ç: üreteç 24 verir, telefon 30 çeker |

01:32–01:35: beş simge tikli — Reference · Script · Voice · Colour · Frame rate.

## 2. Fabrika — ücretsiz, varsayılan (ölçülen)

Kart RTX 5060 Ti 16.311 MiB; ComfyUI :8188 çalışıyor.

| Adım | Bizde ne var | Nasıl, ayar, sıra |
|---|---|---|
| 1 Referans | FLUX.1-Krea-dev fp8 (`studio.mjs still`: 1920×1088, 28 adım, guidance 4.5). **FLUX.2-klein-4B fp8 ağırlığı var** (`ComfyUI-models/comfyorg/diffusion_models/`, blueprint "Image Edit (Flux.2 Klein 4B)", 5 Kas ölçüldü) — referans alır, `studio.mjs`'e bağlı değil. H3 Ref2VA: 9 resim + 3 video + **3 ses** (`run.py --ref`, `--ref-audio`). `shoot-ugc.sh` LOOK bloğu zaten "filmed on a modern phone… visible pores… handheld micro-movement" | Gerçek kare **yüz için değil**, ışık-kadraj-fon için okunur, LOOK promptuna yazılır; kimlik kadromuzdan (AHMET/JAMES — flux-local-engine-only 2026-09-14). Dış motora kare gerekirse klein-4B ile gerçek kadraj kadromuzun yüzüne uyarlanır |
| 2 Senaryo | Kadro yazar; WER kapısı var | Persona kuralı: "X değil Y" yasak; dolgu söz + bir uzun cümle şart; 20–30 kelime/10 sn |
| 3 Ses | Onay defteri 2026-11-01: Voice Studio ve Voicebox "kurulu, test edildi". **Ölçüm 7 Kas:** VoiceStudio diskte yok (`find -maxdepth 5`, docker image yok, pip yok); Voicebox `/home/dxb/voicebox/voicebox-main` 0.5.0 var, servis kapalı, 0 profil. Türkçe + reklam lisansı temiz: **VoxCPM2** (Apache-2.0, VoiceStudio içinde), **Chatterbox Multilingual** (MIT; Resemble Ağu 2026 "retired, no longer maintained" — https://github.com/resemble-ai/chatterbox). VoiceStudio varsayılanı OmniVoice ağırlığı CC-BY-NC → müşteri işinde yasak (ses-fable 1 Kas) | 10–20 sn temiz referans (kendi kadromuz, rıza kaydı) → VoxCPM2 klon → replik .wav → **H3 `--ref-audio`**: dudak çekimde doğar, lip-sync aracı gerekmez. ⚠ Çatışma: `tts-cancelled-engine-voice-only-2026-09-04` ("MiniMax H3'ün kendi sesi olsun") ve B43 adım (8) "no cloned voice" bugünkü sözüyle çelişir; H3'ün 11 dilinde Türkçe yok. Kanun A: bugünkü cümlesi geçer, kayıt onun sözüyle silinir — tek satır sorulur |
| 4 Renk | B43 adım (7) "COLOUR GRADE + FILM GRAIN" var, tarif yok; ffmpeg zincirde | SeedVR2'den sonra tek geçiş: `eq=saturation=1.12`, `colorbalance=bm=0.04:bs=-0.03`, `noise=c0s=5:c0f=t+u`; müşteri başına LUT'a dönüştürülür; önce bir karede gözle |
| 5 Kare hızı + büyütme | H3 çıkışı **24 fps** (`workflow.py`). SeedVR2 ComfyUI çekirdeğinde ölçülü: 3B→1080 4,07–4,25 s/kare ≈ 24,5 dk/15 s. **Ara kare aracı yok** (`models/frame_interpolation` boş, `custom_nodes` boş). `~/tools/appimages/Video2X-x86_64.AppImage` duruyor (6.4.0, AGPL-3, 22,6k★, RIFE ncnn/Vulkan + Real-ESRGAN — https://github.com/k4yt3x/video2x) ama açılmıyor: `libfuse.so.2` yok | Kanun D: 640×1152 taslak onun gözüne → SeedVR2 3B 1080 → **RIFE ×2 → 48 → `fps=30`** (Instagram asgari 30 fps: https://help.instagram.com/1038071743007909); 60 yalnız o isterse. RIFE: Practical-RIFE (MIT, ~1k★, model 4.26, `inference_video.py --multi=2`, https://github.com/hzwer/Practical-RIFE) ya da ComfyUI-Frame-Interpolation (MIT, 1,1k★, RIFE 4.0–4.9, https://github.com/Fannovel16/ComfyUI-Frame-Interpolation). FILM arşiv 2025-10-14 (https://github.com/google-research/frame-interpolation) — alınmaz. Büyütme önce, ara kare sonra (tersi SeedVR2 süresini ikiler). Bu kartta süre/VRAM ölçülmedi |

## 3. Ücretli yedek (fabrika yetmezse; alım onda)

| Adım | Yedek, fiyat | Kaynak |
|---|---|---|
| Referans/kare | ChatGPT Image 2 (Plus var); Nano Banana Pro (Google AI Pro iptal 2026-10-18) | B43 |
| Video motoru | Veo 3.1 0,40 $/s (fast 0,15); Kling 3.0 0,10–0,14 $/s; H3 API 0,08 $/s | B28 |
| Ses | ElevenLabs Starter 6 $/ay (anlık klon), Creator 22 $/ay (profesyonel klon) | https://elevenlabs.io/pricing |
| Dudak (ses sonradan konursa) | sync.so lipsync-2 3,00 $/dk + 5–19 $/ay; yerel LatentSync 1.6 18 GB VRAM ister, kart 16 GB | https://sync.so/pricing · https://github.com/bytedance/LatentSync |
| Büyütme/60 fps | Topaz Video Personal 299 $/yıl (59 $/ay) — **Linux sürümü yok**, bu istasyonda yedek bile değil; bulut API Starlight Precise 2.6: 1080p'de 1 kredi/26 kare | https://www.topazlabs.com/topaz-video · study-cards/seedvr2-topaz-equivalent.md · https://developer.topazlabs.com/video-models/upscaling-and-enhancement |

## 4. Hat uçtan uca

Gerçek referans (ışık/kadraj) → senaryo (§2 kuralı) → kadro kimlik kareleri (dış motor için klein-4B uyarlama) → **klon ses .wav** → H3 Ref2VA 8 adım 640×1152 `--ref-audio` → taslak onun gözüne → SeedVR2 3B 1080 → ffmpeg renk + tane → RIFE ×2 → 30 fps → son kontrol: WER, kimlik ilk↔son, gözle kare, kulakla ses.
**Eksik:** ① Voice Studio diskte yok, Voicebox kapalı, klon 0; ② RIFE yok (Video2X libfuse2 ister); ③ `--ref-audio` ile klon ses hiç çekilmedi (EYW-001 v1'in dış sesi 4 Eylül'de iptal); ④ renk/tane tarifi yazılı değil; ⑤ 4 Eylül ses hükmü yolu kapatıyor.

## 5. Nereye

- **B43:** adım (7) tarif; adım (6)'ya ara kare; adım (8) ses hükmü onun sözünü bekler. Kurulum isteği (RIFE, VoxCPM2) **B41**; Topaz/ElevenLabs/sync.so ikizleri **B31** rafına.
- **B12:** Voice Studio kurulum durumu ölçümle düzeltilir; VoxCPM2 ile Chatterbox Türkçe testi (ses-fable §2.4).
- **B28 (H6):** `media-delivery-qc` beş kontrolü (referans, senaryo kalıbı, ses, renk, fps) teslim kapısına alır.

## 6. Yanlış, riskli, abartılı

1. **Starlight ara kare yapmaz** — Topaz'ın kare hızı modelleri Apollo/Chronos/Aion (https://developer.topazlabs.com/video-models/frame-interpolation); "Starlight 2.5 → 60fps" iki aracı tek ada yüklüyor.
2. **60 fps yanlış ölçüt:** Instagram asgari 30; telefon 30 çeker. Çıkarımım: 60'a ara kare "dizi efekti" verir — başka bir yapaylık.
3. Önce/sonra iki ayrı kişi, ürün, oda; hangi adım neyi düzeltti gösterilmiyor.
4. Gerçek insanın TikTok fotoğrafını "uyarlamak" o yüzü referans yapmaktır; bizde yüz kadrodan, fotoğraf yalnız ışığı öğretir (kul hakkı notu 21 Eki).
5. "AI 87%" dedektörü adsız; "comment clone" etkileşim yemi, ücretsiz araç doğrulanamaz.
6. "Model sesi belli olur" bizde ölçüyle tam tutmuyor: EYW-001'i kulağıyla "tam doğal ses" diye kabul etti; Türkçe için zaten Voice Studio şart.
7. "Hiç anlaşılmamalı" — NY sentetik oyuncu bildirimi 2026-06-09'dan beri, AB m.50 yürürlükte (B28); onun İ5 hükmü (2 Kas) "şimdilik etiket yok" — yeniden açılmıyor, hatırlatılıyor.
