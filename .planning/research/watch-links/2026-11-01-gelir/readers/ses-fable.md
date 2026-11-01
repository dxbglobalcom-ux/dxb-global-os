# ses — fable · GZtLsvklYBI — açık kaynak ikameler ve holdingin ses klonlama gücü (1 Kasım 2026)

Kaynaklar: transkript `$J/transcripts/v8-GZtLsvklYBI.txt` (683 satır, tamamı okundu) · yt-dlp açıklama · `gh api` depo ölçümleri (1 Kasım) · HF model kartları · Voicebox kurulumu `/home/dxb/voicebox/voicebox-main` · `nvidia-smi` · depo içi grep (salt okunur). Hiçbir şey kurulmadı, hiçbir servis açılmadı.

## 0. CEO'nun duyduğu adlar çözüldü

- **"Voice Studio"** = **VoiceStudio** — https://github.com/debpalash/VoiceStudio · 97.488 ★ (videoda 6 Ekim'de "54.000" deniyor; ölçüldü) · AGPL-3.0 · açıldı 2026-04-09 · son push 2026-11-01. Yapımcı sözü "Hindistan'da bir startup CTO'su, 10 günde" → **iddia**; CLA'da şirket Yupcha Softwares Private Limited (Hindistan) — tutarlı ama "10 gün" doğrulanmadı.
- **"Odysseus Free Yarın"** = iki ayrı araç: **Odysseus** (https://github.com/odysseus-dev/odysseus · 94.867 ★ · AGPL-3.0 · açıldı 2026-05-31) + **FreeLLMAPI** (https://github.com/tashfeenahmed/freellmapi · 45.501 ★ · MIT) — "Free LLM API" dikteye "Free Yarın" diye düşmüş.
- **Açıklamada var mı?** Evet. Video açıklaması 10 deponun tamamını linkliyor + kaynak sayfası https://thenextnewthing.ai/l/github-repos-oct6. Liste aşağıda §3'te.

## 1. Künye

"Replace: Suno AI, ChatGPT, Perplexity, Lovable, Manus, Opus Clip & more" · The Next New Thing (Andrew Warner) · 6 Ekim 2026 · 32:30 · 395.586 izlenme (1 Kasım). **Sponsor:** Zapier (00:19 "presented by Zapier" — yalnız anons, ayrı bölüm yok). Tür: 10 ücretli aboneliğe 10 açık kaynak ikame; tek tez (00:00–00:19): para + gizlilik + kendi ajanınla kodu değiştirme. Gelir yöntemi anlatmıyor; iki küçük gelir fikri geçiyor (§3.5, §3.6).

## 2. Ses klonlama — bizde ne var, dünyada ne var, bizimki zayıf mı

### 2.1 Bizde bugün (ölçüldü)

| Parça | Ölçüm |
|---|---|
| **Voicebox** `/home/dxb/voicebox/voicebox-main` | package.json 0.5.0; git HEAD `51f49dea` 2026-07-27; MIT. Yukarı akış son sürüm hâlâ **v0.5.0 (25 Nis 2026)**; `main` ondan **227 commit** ileride (son 7 Eki 2026): OmniVoice motoru, Qwen VoiceDesign, OpenAI-uyumlu motor, Chatterbox MLX, MP3/M4B dışa aktarma eklendi — bizdeki Temmuz kopyasında yok. |
| Voicebox'ın sardığı TTS motorları (`backend/backends/__init__.py`) | Qwen3-TTS 1.7B/0.6B Base + CustomVoice (10 dil, **Türkçe yok**) · **Chatterbox Multilingual (MIT, 23 dil, Türkçe VAR)** · Chatterbox Turbo (yalnız EN) · LuxTTS (EN) · TADA 1B / 3B-ML (Hume, Llama 3.2 lisansı; 10 dil, Türkçe yok) · Kokoro 82M (8 dil, klon yok). STT: Whisper base→large-v3/turbo. |
| Voicebox kullanım | `data/voicebox.db` → `profiles` tablosu **0 satır**: hiç ses klonlanmamış. Servis kapalı (17493 dinlemiyor). HF önbelleğinde Chatterbox ağırlığı `t3_mtl23ls_v2.safetensors` = **V2**; Resemble bugün **V3** yayınladı (aynı 0.5B, daha yüksek konuşmacı benzerliği, daha az halüsinasyon — kart beyanı). |
| **Speaches** yerel `:8969` (`dxb_speaches_local`) | `/v1/models`: faster-whisper + **`speaches-ai/piper-tr_TR-fahrettin-medium`** (sabit Türkçe ses, klon yok); kart: Kokoro-82M. VPS'te 0.8.3-cpu. |
| Stüdyo | Ses üretmiyor. **CEO emri 2026-09-04:** *"şu yapay sesi iptal et tüm video üretimlerinde reklamdan tut filme kadar. MiniMax H3'ün kendi sesi olsun"*; `voice` iş türü 15 Eylül'de kaldırıldı (STACK.md edge-tts satırı, CEO-OK w7-voice-hand-removed). 11 dil (STUDY 3.7): ar, en, de, fr, es, pt, ja, ko, zh, it, ru — H3'ün kendi sesiyle; **Türkçe o listede yok**. |
| GPU | RTX 5060 Ti **16 GB**, şu an 1.334 MiB dolu (taban). B33 tezgâh doktrini: tek tezgâh, sıra. |
| Daha önce verilmiş hüküm | 14 Eki 88-link turu: "ses klonu kullanılmaz, yalnız motorun kendi sesi" (reader-opus 548, reader-fable 540); batch-6: *"Yüz/ses klonu kişinin kendisi değilse aldatma sayılabilir; kendi kadromuzla ve AI etiketiyle (hüküm CEO'nun)"*. VOICE_INTERACTION_SPEC: Voicebox = "€0 ses kimliği tedariki" diye yazılı, kullanılmamış. |

**Cevap:** Voicebox zayıf değil, **kullanılmamış**. Türkçe klon motoru (Chatterbox Multilingual, MIT) VoiceStudio'nun ticari işe açık Türkçe seçenekleriyle aynı sınıf; eksikler: V2'de kalmış, servis kapalı, stüdyoya bağlı değil ve CEO'nun 4 Eylül emriyle videoda ses yasak.

### 2.2 VoiceStudio nedir, neyi sarar (ölçüldü)

- Masaüstü (Electron) + Docker; klon, **ses tasarımı** (tarifle yeni ses), **video dublajı** (WhisperX → çeviri → klon sığdırma), dikte, transkript, sesli kitap; MCP sunucusu; AI filigran; Linux .deb/AppImage/Docker; **6 GB VRAM tabanı**.
- **Varsayılan motor OmniVoice (k2-fsa):** kod Apache-2.0, **ağırlık CC-BY-NC** (model kartı §License) → **reklam/müşteri işinde kullanılamaz**. Video bunu 02:12'de dürüstçe söylüyor (kanıtlı). 646 dil; Türkçe eğitim verisi **125,36 saat** (646 dil içinde 594. sıra) → Türkçe ince. RTF 0,025 iddiası (kart). VoiceStudio'nun kendi lisans envanteri: **63 model kaydının hiçbirinde `commercial_use: true` yok** — hepsi "unreviewed" ya da "noncommercial".
- Diğer motorları: IndexTTS 2.5 (bilibili lisansı; 100M MAU / 1 milyar RMB altı ticari serbest; **5 dil, Türkçe yok**; 12 GB disk) · CosyVoice 3 (Apache-2.0; 9 dil, Türkçe yok; 5,4 GB; RTX 50 için torch 2.7 cu128 yaması gerekiyor) · **VoxCPM2** (Apache-2.0, **30 dil, Türkçe VAR**, 2B, 48 kHz, ses tasarımı + stil güdümlü klon; RTF ~0,3 RTX 4090 — satıcı) · KittenTTS, supertonic3, MOSS-TTS, dots.tts, Confucius4, gpt-sovits, pockettts, sherpa-onnx.
- Lisans: uygulama AGPL-3.0 — **iç kullanım ve ticari iş serbest**; ücretli "Pro / ticari lisans" yalnız kapalı ürüne gömmek isteyene (LICENSE-NOTICE). Videodaki "**99 $/ay**" depoda yok → **iddia** (voicestudio.sh/pro'ya bakılmadı).
- Hız tablosu (`docs/benchmarks.md`): **"No verified rows yet"** — projenin kendi ölçülmüş hızı yok.

### 2.3 Karşılaştırma — holdingin ölçüleriyle

11 dil = ar en de fr es pt ja ko zh it ru. "Bu makinede hız" sütunu **ölçülmedi** (kurulum yok); satıcı sayısı yazıldı, ⚠ UNVERIFIED.

| Motor | Klon kalitesi (kaynak) | Türkçe | 11 dil | Duygu/kontrol | Hız / VRAM (satıcı) | Reklam satışı lisansı | Bizde |
|---|---|---|---|---|---|---|---|
| **Chatterbox Multilingual V3** (Resemble) | 0.5B; V3 "daha yüksek benzerlik" (kart) | ✓ | **11/11** | exaggeration/cfg ayarı | 0.5B, 16 GB'a rahat | **MIT ✓** | Voicebox'ta V2 ağırlığı önbellekte |
| **VoxCPM2** (OpenBMB) | 2B, 48 kHz, 2M saat veri (kart) | ✓ | **11/11** | tarifle ses tasarımı + stil güdümü | RTF ~0,3 (4090), 2B → sığar | **Apache-2.0 ✓** | Yok (VoiceStudio içinde var) |
| OmniVoice (VoiceStudio varsayılanı) | 646 dil, RTF 0,025 iddiası | ince (125 s) | 11/11 | tarifle tasarım | 6 GB taban | **✗ CC-BY-NC** | Yok |
| Qwen3-TTS 1.7B (+CustomVoice) | güçlü, talimatlı | ✗ | 10/11 (ar yok) | talimat | 1.7B | Apache-2.0 ✓ | Voicebox'ta |
| IndexTTS 2.5 | duygu kontrolü ana vaadi | ✗ | 4/11 | güçlü (süre/duygu) | 12 GB disk | eşik altı ✓ | Yok |
| CosyVoice 3 | talimatlı konuşma | ✗ | ~8/11 | talimat | 5,4 GB | Apache-2.0 ✓ | Yok |
| TADA 3B-ML (Hume) | 10 dil | ✗ | 10/11 | — | 3B | Llama 3.2 topluluk ✓ | Voicebox'ta |
| Kokoro / Piper (Speaches) | klon yok | Piper TR sabit ses | kısmi | yok | CPU | Apache/MIT ✓ | Çalışıyor |
| ElevenLabs (ücretli ikiz) | sektör çıtası | ✓ | ✓ | ✓ | bulut | sözleşme | Yedek: Creator 22 → Pro 99 → Scale 299 $/ay (EVIDENCE.md 24 Eyl) |

**Hüküm:** Holding için en güçlü ve temiz yol **VoxCPM2** (Apache, 30 dil, Türkçe, 48 kHz, ses tasarımı) ile **Chatterbox V3** (MIT) — ikisi de bizim GPU'da ölçülmeden biri seçilmez. VoiceStudio uygulamasının değeri motor değil **dublaj tezgâhı** (WhisperX → çeviri → klon sığdırma → dışa aktarma): bir reklam filminin 11 dil sürümü için işe yarar; müşteri işinde OmniVoice **kapalı**, çeviri motoru NLLB de CC-BY-NC — LLM çevirisi seçilmeli. ElevenLabs CEO kuralınca ücretli yedek kalır.

### 2.4 OS içinde sürekli hat ve ilk test

- **Hat (B43 kolu):** stüdyo işi → ses profili (konsent kaydı zorunlu alan) → motor (Voicebox `/speak` REST + MCP zaten var; Speaches gibi OpenAI-uyumlu uç) → kalite kapısı (her dilde faster-whisper geri-transkript WER + konuşmacı benzerliği) → müşteriye çıkışta onay kapısı (rutin dış iletişim; para çıkışı yok). Otomatik: üretim, WER, benzerlik; CEO'da duran: gerçek kişinin sesi kullanılacaksa konsent belgesi.
- **İlk test (0 $, ~2 saat, onun "evet"inden sonra):** Voicebox'ı aç, önbellekteki Chatterbox V2 ile Türkçe 10 + Arapça/İngilizce 3 cümle, konsentli bir örnek (kendi kadromuzdan) → WER (Speaches) + kulak. Sonra VoxCPM2 kurulumu (B41 talebi, kurulum onun sözüyle) ve aynı cümleler; RTF ve VRAM `nvidia-smi` ile. Çıktı: tek tablo, iki motor.
- **Önce kalkması gereken engel:** 4 Eylül emri "videoda yapay ses yok". Bu rapor onu kaldırmaz; soru §5'te.

## 3. Videodaki diğer araçlar — bizde var mı, denemeye değer mi, hangi satır

| # | Araç (dk) | Ölçüm (1 Kas) | Neyin yerine | Bizde | Hüküm · satır |
|---|---|---|---|---|---|
| 2 | **Odysseus** (02:42) | 94.867 ★ · AGPL-3.0 · push 2026-11-01 · Docker :7011 · sohbet, ajan, derin araştırma, belge, e-posta, not/takvim, "Cookbook" (donanıma göre yerel model önerisi). "PewDiePie yaptı" → **iddia**, depo/org adı taşımıyor. | ChatGPT (kişisel) | Holdingin kendisi bu iş istasyonu (Hamza, sohbet, B69 araştırma). | **İzle** · B22 rakip kuyruğu; Cookbook fikri → B34 yerel işçi model. |
| 3 | **FreeLLMAPI** (05:51) | 45.501 ★ · MIT · README: *"personal experimentation and learning, not production"*; 34 sağlayıcı bedava kota; 19 $/yıl eklenti (video). | Claude Code kotası | **Zaten hüküm var:** study-cards/freellmapi-9router "ToS gri bölge, yalnız temiz kısımlar"; 14 Eki 88-link turu aynı. STACK: ham sağlayıcı anahtarı yok. | **Gerek yok** · kapalı. |
| 4 | **Vane** (09:27) | 37.942 ★ · MIT · **son push 2026-09-01** (2 aydır sessiz) · Perplexica'nın yeni adı. | Perplexity | **Zaten satır:** onun linki 2026-10-15 (HIS-WORDS satır 92: *"sıraya şunu ekler misin… test edin… research tarafına entegre olabilir mi"*). | **Dene** (emir verilmiş, test bekliyor) · o satır + B69 + dxb-research. |
| 5 | **InvokeAI** (11:51) | 28.951 ★ · Apache-2.0 · push 2026-11-01 · katmanlı tuval, inpaint, tarifler; GPU şart. | Midjourney | Stüdyo ComfyUI (:8188 çalışıyor) + FLUX / FLUX.2-klein-4B; eller API ile sürüyor. Invoke aynı modellere insan arayüzü. | **Gerek yok** · B43. |
| 6 | **ACE-Step 1.5** (13:57) | 14.269 ★ · kod MIT, `acestep-v15-sft` ağırlık MIT (HF etiketi) · push 2026-10-11 · 16 GB → "2B sft veya XL turbo + offload", LM 1.7B. Video: "Suno 4.5–5 arası" → yapımcı kendi dener, "o seviyede değil" (18:38, kanıtlı kulak). "50 dilde söz" → iddia. | Suno | Stüdyoda müzik motoru yok (grep 0). Gelir: müşteri filmine telifsiz kendi müzik, stok lisansı gider. | **Dene — müzik hükmünden sonra** · B43 yeni kol; soru §5. |
| 7 | **OpenShorts** (19:30) | 7.396 ★ · MIT · push 2026-11-01 · uzun → 9:16, an seçimi (Gemini ya da yerel LLM), yüz takibi, faster-whisper altyazı, **MCP sunucusu + API**, TikTok/IG/YT'ye planlı yayın; GPU'da 8 dk video ≈ 50 s; dublaj yalnız ElevenLabs anahtarıyla. Bulut: 20 dk/ay filigranlı, 12 $/ay'dan. | Opus Clip (15–29 $/ay) | 14 Eki turunda stüdyonun bedava kesicisi diye **SamurAIGPT/AI-Youtube-Shorts-Generator (5.279 ★)** seçildi; OpenShorts daha canlı, MCP'li, yayın planlı. | **Dene — 14 Eki seçimini değiştirir** · B43 + B28 (aylık kısa video paketi, B17 #2). |
| 8 | **Dyad** (23:51) | 22.147 ★ · Apache-2.0, `src/pro` FSL-1.1 · push 2026-10-31 · yerel uygulama kurucu, Supabase/Neon. | Lovable | Web ofisi Claude Code + ScrollCraft ile yazıyor; Dyad kod yazmayana arayüz. Yapımcı bile "günleri sayılı" diyor (24:58). | **Gerek yok**. |
| 9 | **OpenManus** (26:15) | 58.853 ★ · MIT · push 2026-10-31 · genel ajan (tarama, kod, dosya), kendi anahtarın. | Manus | Hamza + operator + ajanlar; STACK: ikinci ajan çerçevesi yok. | **Gerek yok** · B22'de en fazla izleme. |
| 10 | **Upscayl** (29:06) | 51.559 ★ · AGPL-3.0 · push 2026-10-05 · Real-ESRGAN NCNN Vulkan masaüstü; yüz onarımı yalnız bulutta 25 $/ay. | Topaz Gigapixel | ComfyUI `models/upscale_models`: **RealESRGAN_x4plus.pth + 4x-UltraSharp.pth** — aynı model, API'den. | **Gerek yok** · B43'te var. |

## 4. Konsent — gerçek kişinin sesi

Gerçek bir kişinin sesini izinsiz klonlamak hukuki ve ahlaki çizgidir; nerede ısırır:
1. **Müşteri reklamında ünlü/rakip sesi** → geçmez (aldatma; kişilik hakkı). 
2. **Müşterinin kendi sözcüsü** → yazılı konsent + kullanım kapsamı (hangi diller, ne kadar süre, hangi mecra) + "yapay ses" etiketi. Dublajda **her konuşmacı için ayrı** konsent.
3. **Kendi tasarlanmış sesler** (VoxCPM2/VoiceStudio "voice design": gerçek kişi yok) → temiz; stüdyonun varsayılanı bu olmalı.
4. **CEO'nun sesi Hamza'nın ağzı olarak** (B03/B12) → kendi konsenti, yalnız yerel; sorulur.
5. Hukuk (bilgi; bugün kaynaktan doğrulanmadı): Türkiye'de ses biyometrik = KVKK md. 6 özel nitelikli veri, TCK 134/136; AB Yapay Zekâ Tüzüğü md. 50 deepfake/sentetik içerik için şeffaflık. 14 Eki notu zaten yazılı: *"kişinin kendisi değilse aldatma sayılabilir… AI etiketiyle (hüküm CEO'nun)"*. VoiceStudio AI filigranı ve konsent uyarısı taşıyor; Voicebox RESPONSIBLE_USE.md var — konsent alanı stüdyo kaydına **zorunlu alan** olarak girmeli.

## 5. DXB için en önemli beş şey (sıralı)

1. **Ses tedariki test edilsin: VoxCPM2 ile Chatterbox V3, bizim GPU'da, Türkçe + 11 dil, WER ve benzerlikle.** İkisi de ticari temiz (Apache/MIT); stüdyoya €0 çok dilli ses verir ve ElevenLabs'ı yedeğe iter. Voicebox zaten bunun kabı (REST + MCP), sadece V3'e çekilip açılmalı. Engel: 4 Eylül "videoda yapay ses yok" emri — önce onun sözü.
2. **OpenShorts stüdyoya (B43) → aylık "uzun videodan kısa paket" hattı (B28, B17 #2).** Bu videodan çıkan tek sürekli gelir adayı: müşteri webinar/podcastini girer, 3–15 klip + altyazı + planlı yayın çıkar; MCP'si Hamza'nın eline oturur. 14 Eki'de seçilen SamurAIGPT yerine geçer.
3. **VoiceStudio yalnız dublaj tezgâhı olarak denensin** (STUDY 3.7: bir kampanya, 11 dil). Müşteri işinde OmniVoice ve NLLB kapalı; motor VoxCPM2/Chatterbox, çeviri LLM. ElevenLabs dublajı (EVIDENCE.md: Creator 22 → Business 990 $/ay) karşısında maliyet 0.
4. **ACE-Step 1.5 reklam müziği** — teknik olarak 16 GB'a sığar, MIT; ama müzik İslami sınır sorusudur, onun hükmü olmadan kurulmaz.
5. **Vane testi zaten emirli ve bekliyor** — yeni satır açılmaz; mevcut satır kapatılsın. Diğer beş araç (Odysseus, FreeLLMAPI, InvokeAI, Dyad, OpenManus, Upscayl) için bizde eşdeğer ya da hüküm var: satır açılmaz.

## 6. Ona sorular (önerimle)

- **S1 — Videoda ses:** 4 Eylül emriniz "H3'ün kendi sesi, yapay ses yok" duruyor. Müşteri reklamı ve 11 dil sürümleri için (a) gerçek kişiye dayanmayan **tasarlanmış ses** ve (b) **yazılı konsentli müşteri sözcüsü** klonu açılsın mı? **Önerim:** ikisi açılsın, H3'ün kendi sesi varsayılan kalsın; test ondan sonra.
- **S2 — Müzik (ACE-Step):** reklamda üretilmiş müzik İslami çerçevede nereye kadar — enstrümantal/perküsyon mu, vokal mi, hiç mi? **Önerim:** siz hüküm verene kadar kurulmasın; verirseniz ilk test enstrümantal yatak.
- **S3 — Hamza'nın ağzı:** kendi sesiniz klonlanıp yalnız yerelde Hamza'ya verilsin mi, yoksa tasarlanmış bir ses mi? **Önerim:** tasarlanmış ses; sizin sesiniz isterseniz, konsent sizin.
- **S4 — Lisans sınırı:** VoiceStudio/Upscayl/Odysseus AGPL — iç kullanım serbest; **müşteriye sunulan kapalı bir ürüne gömülmez** kuralı yazılsın mı? **Önerim:** evet, B41 tedarik zinciri kuralı olarak (yeni satır değil, B41'e not).

## 7. Gürültü, hayatta kalan, platform riski

- Videonun yıldız sayıları 6 Ekim; bugün VoiceStudio 97k, Odysseus 95k — ikisi 6–7 aylık depo, hızlı büyüme = kırılgan sürüm hattı (Odysseus `dev` varsayılan dal, `:latest` kayar; VoiceStudio hız tablosu boş).
- FreeLLMAPI sağlayıcı ToS'una yaslanır; yazarı bile "üretim değil" diyor.
- OpenShorts'un dublajı ElevenLabs anahtarı ister — "tam bedava" değil.
- Yapımcının kalite kulağı dürüst: ACE-Step "Suno seviyesinde değil" (18:38), Odysseus "ChatGPT kadar iyi değil" (05:28), Vane "Perplexity kadar güçlü değil" (11:19) — bunlar kanıtlı itiraf, abartı değil.
- İnceleyemediğim: motorların **bu makinedeki** hızı ve kalitesi (kurulum yasağı); voicestudio.sh/pro fiyatı; Odysseus'un yazarı.
