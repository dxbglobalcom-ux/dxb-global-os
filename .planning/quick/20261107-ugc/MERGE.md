# MERGE — hiper-gerçekçi YZ UGC (U1 De86u1YgMrs + U2 DfUZlWBjJXE)

Hakem: iki kör okuyucu (opus, fable) + kaynakta ölçüm, 7 Kasım 2026. Hiçbir şey kurulmadı.

## 1. Beş adım — ne diyor, neden işe yarıyor (iki okuyucu aynı)
1. **Referans (0:20):** metinden üretilmiş referans "çok belli olur"; TikTok/Pinterest/Reels'ten gerçek kare bulup uyarla. Neden: gerçek telefon karesi kadraj, ışık ve dağınık oda kusurunu taşır.
2. **Senaryo (0:37):** "değil X, Y" kalıbını ve kısa kopuk cümleleri at. Neden: ikisi de dil modelinin imzası; dolgu söz insanındır.
3. **Ses (0:46, "en önemlisi"):** motorun hazır sesi kullanılmaz; ElevenLabs ya da başka araçla klon ses. Neden: hazır ses herkeste aynı tınıda.
4. **Renk (1:09):** doygunluğu artır, sarıları kıs. Neden: üreteçlerin düz, sarı dökümü.
5. **Kare hızı (1:19):** Topaz Starlight 2.5 ile 1080p/60 fps. Neden: 24 fps takılması ele verir.

Önce/sonra demosu iki ayrı kişi, ürün ve oda gösteriyor; adımların etkisini kanıtlamıyor (ikisi aynı).

## 2. Ayrışmalar ve hükmüm (kaynakta ölçüldü)
| Konu | opus | fable | Hüküm |
|---|---|---|---|
| Ara kare aracı | ComfyUI çekirdeğinde var | yok | **opus**: `comfy_extras/nodes_frame_interpolation.py` (ComfyUI 0.34.0, RIFE+FILM, çarpan 2–16) duruyor; ağırlık klasörü boş |
| RIFE sürümü | 4.25 | 4.26 | **4.25**: Practical-RIFE README "4.25 by default" (MIT, ★1.038) |
| Hedef fps | ×5→60 | ×2→48→30 | **×5 → 120 → 30 varsayılan, 60 yanında**: 120 hem 30'a hem 60'a eşit bölünür; 48→30 düzensiz kare atar |
| Starlight ara kare yapar mı | sustu | yapmaz | **fable**: Topaz'ın ara kare modelleri Apollo/Chronos/Aion (developer.topazlabs.com) |
| Büyütücü | 7B-sharp | 3B | **7B-sharp**: kayıt (j) "yüze sadık, 3B yeniden çizer"; 1080'de süresi ölçülmedi |
| Renk | `selectivecolor` sarı −0,15 + doygunluk 1,08 | `colorbalance` mavi kayması | **opus**: söylenen "sarıları kıs" tam bu filtre; zincir yerel ffmpeg'de hatasız koştu; değeri onun gözü seçer |
| Dudak | LatentSync 1.5 (8 GB) | `--ref-audio`, dudak aracı yok | **ikisi sırayla**: önce H3 `--ref-audio` (dudak çekimde doğar); tutmazsa LatentSync 1.5 (README: 1.5 8 GB, 1.6 18 GB) |
| Ses motoru | Voice Studio varsayılanı | VoxCPM2 | **ikisi Türkçe kör testte yarışır**; Voice Studio (AGPL-3.0, ★103.757) varsayılanı OmniVoice, VoxCPM2 Apache-2.0 |

## 3. Fabrika hattı (ücretsiz, varsayılan)
1. **Referans:** gerçek UGC'den yalnız kadraj, oda, ışık, telefon açısı LOOK istemine yazılır; yüz kadromuzdan.
2. **Senaryo:** senarist koltuğu; "değil X, Y" ve üçlü kısa kalıp yok, dolgu serbest; WER kapısı.
3. **Görsel:** FLUX.1-Krea (yalnız dış motora kare) / FLUX.2-klein-4B uyarlama.
4. **Video:** H3 T2VA/Ref2VA 640×1152, 24 fps.
5. **Ses:** Voice Studio klonu (ElevenLabs yerine), rıza kayıtlı kadro sesi → `--ref-audio`.
6. **Dudak:** gerekirse LatentSync 1.5.
7. **Taslak onun gözüne** (Kanun D).
8. **Renk + tane:** `selectivecolor=yellows='0 0 -0.15 0':correction_method=relative,eq=saturation=1.08,noise=alls=5:allf=t+u`.
9. **Büyütme:** SeedVR2 7B-sharp → 1080×1920.
10. **Ara kare:** `FrameInterpolate` RIFE 4.25 ×5 → `fps=30` (60 yan yana).
11. **Ses düzeyi:** `loudnorm=I=-14:TP=-1.5:LRA=9`.
12. **Son kontrol:** WER, kimlik ilk↔son kare, gözle kare, kulakla ses.

**Tanıklık (onun hükmü, 7 Kas):** karakterin "kullandım" sözü gerçek bir kullanımdır: CEO, ailesi ya da holdingin ürünü kullandırdığı biri; kullanım işle birlikte kaydedilir. YZ etiketi şimdilik yok (İ5).

## 4. Ücretli yedek (fabrika yetmezse; satın alma onda)
| Adım | Model | Fiyat |
|---|---|---|
| Görsel | **Seedream 5.0 Pro** (ByteDance, görsel; bölge düzenleme) | $0,045 / 2K üstü $0,09 |
| Video | **Seedance 2.5** — çok sahnede tutarlı; pahalı, yavaş, kare hızı ve sesi zayıf (bir uzmanın tecrübe önerisi) | Replicate ~$0,23/sn |
| Video | **Wan 3.0** — Seedance kalitesinde, daha hızlı, ucuz, kare hızı iyi (bir uzmanın tecrübe önerisi) | ölçülmedi |
| Video | **Gemini Omni 1.1 Flash** — video referanslı işte çok iyi ve ucuz, referanssız tutarsız (bir uzmanın tecrübe önerisi); Google AI Pro 18 Eki'de iptal | abonelik |
| Video | Veo 3.1 Fast/Standard | $0,10–0,12 / $0,40 sn |
| Ses | ElevenLabs Starter / Creator | $6 / $22 ay |
| Dudak | sync.so lipsync-2 | $3/dk + abonelik |
| Büyütme | Topaz Video (Linux yok; bulut API) | $299/yıl |

Ölçü saniye fiyatı değil, **kabul edilen klip başına maliyet**.

## 5. Holdingde eksik olan
- Voice Studio diskte yok; Voicebox 0.5.0 duruyor, kapalı, 0 profil.
- RIFE 4.25 ağırlığı yok (`models/frame_interpolation` boş); hatta bağlı değil.
- `--ref-audio` ile klon ses hiç çekilmedi.
- Renk tarifi yazılı değil; `post-ugc.sh` bilerek "slightly warm".
- **Çelişki, ona tek satır:** B43 adım (8) "motorun kendi sesi, klon yok" ve EYW-001 v2 bu yolla kabul edildi; bugünkü söz Voice Studio. Hangisi varsayılan, o söyler.
- H3 yerel filmleri 1 Eylül'de reddetti ("gerçek insan gibi durmuyorlar"); müşteri karesinde fabrika yetmezse ücretli yedek devreye girer.

## 6. Riskler
- Gerçek kişinin fotoğrafını "uyarlamak" benzerlik riskidir; yalnız kompozisyon alınır.
- 60 fps telefon selfie'sinde fazla akıcı durabilir; 30 ve 60 yan yana onun gözüne.
- "AI 87%" dedektörü adsız; "comment clone" etkileşim yemi.
- Tek kartta süre ve VRAM (7B-sharp 1080, RIFE ×5) ölçülmedi.
- Beyan kuralları (NY, AB m.50) iş başlayınca araştırılır (İ5).
