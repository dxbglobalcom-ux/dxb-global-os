# Grup `ses` — okuyucu opus — 1 Kasım 2026

## Kısa cevap (önce bu)

- **"Voice Studio" = VoiceStudio** (github.com/debpalash/VoiceStudio). **"Odysseus Free Yarın" = iki ayrı araç:** Odysseus (PewDiePie'nin kendi bilgisayarında çalışan ChatGPT benzeri çalışma alanı) ve **FreeLLMAPI** ("Free L-L-M API" kulağa "Free Yarın" gibi gelmiş). Araçların hepsi videonun açıklamasında link olarak duruyor: 10 depo.
- **Bizdeki ses zayıf mı?** Zayıf olan alet değil, **kullanılmaması ve yanlış yerde koşan eski motor.** Voicebox 0.5.0 kurulu ve içinde Türkçe konuşan Chatterbox Multilingual (MIT) duruyor; fakat **0 ses profili, 17 Ağustos'tan beri tek bir üretim** var (`data/voicebox.db`, salt okuma). Muhittin Bey'in her gün duyduğu Hamza sesi Speaches içindeki **Piper `tr_TR-fahrettin-medium`, işlemcide** koşuyor (konteyner `dxb_speaches_local`, `0.8.3-cpu`, bugün de "Up 3 days"). B12'nin "ses hâlâ kötü" dediği budur.
- **Holding için en güçlü açık kaynak motor: VoxCPM2** (OpenBMB, Apache-2.0, reklam satışında serbest). Türkçe dahil 30 dil konuşuyor, stüdyonun 11 dilinin hepsi içinde. Tarifle yeni ses tasarlıyor, klonlanan sese "(neşeli, biraz hızlı)" gibi üslup veriyor, 48 kHz çıkış veriyor, 5-10 dakikalık kayıtla LoRA ince ayarı yapılabiliyor. Üreticinin kendi tablosunda Türkçe ses benzerliği 87,1, ElevenLabs'ınki 59,6. Bu sayılar **üreticinin iddiası**. Aynı tabloda **Arapça anlaşılırlık zayıf** (WER %13,0), Körfez pazarı için ayrıca denenmesi gerekiyor. Bizim kartımızdaki hızı ölçülmedi.
- **VoiceStudio'ya geçmek gerekmez.** VoiceStudio bir motor değil, ~19 motoru saran bir kabuk. Varsayılan motoru OmniVoice'un ağırlıkları **CC-BY-NC**, yani ticari kullanımı yasak; videodaki sunucu da bunu söylüyor. Kabuğun kendi lisans envanteri, kayıtlı 63 modelin **hiçbirini** ticari açıdan temizlenmiş saymıyor. Değeri, dublaj hattında (sesi orijinale zamanlayan dublaj, vokal ayırma, konuşmacı ayırma, filigran) yatıyor.
- **Videodaki diğer 9 araçtan** gerçek iş yalnız **OpenShorts**'ta var: müşterinin uzun videosundan aylık kısa video paketi çıkarmak. Upscayl zaten kurulu. **ACE-Step geçmez**: 18 Ekim 2026 tarihli İslami hükmünüz müziği dışarıda bırakıyor. Kalanların bizde dengi var ya da kanunla dışarıda (ikinci ajan çatısı yasak).

## 1. Video künyesi

"Replace: Suno AI, ChatGPT, Perplexity, Lovable, Manus, Opus Clip & more" · The Next New Thing (sunucu Andrew Warner) · 6 Ekim 2026 · 32:30 · 395.598 izlenme · **sponsor: Zapier** (00:19, açıklamada da var). Transkript tam okundu (yerel faster-whisper-small, `$J/transcripts/v8-GZtLsvklYBI.txt`). Açıklamada 10 deponun linki ve zaman damgaları duruyor.

Videonun iddiaları ölçümle karşılaştırıldı:

| Videodaki iddia | Ölçülen (1 Kasım 2026) | Hüküm |
|---|---|---|
| VoiceStudio 54 bin yıldız, Nisan'da Hindistan'da bir CTO 10 günde başlattı | 97.487 yıldız, oluşturulma 2026-04-09, son sürüm v0.5.7 (2026-10-26) | kanıtlı (yıldız video çekildikten sonra arttı) |
| VoiceStudio "Pro ayda $99" | voicestudio.sh: Pro "$99/yıl veya $199", **"Coming soon"**, kapalı kaynaklı ayrı bir derleme | **hatalı** (aylık değil, henüz satışta değil) |
| OmniVoice ticari değil | HF kartı: kod Apache-2.0, **model CC-BY-NC** | kanıtlı |
| Odysseus 91 bin yıldız, PewDiePie'nin | 94.867 yıldız, **AGPL-3.0** (basında MIT yazıyor, depo bugün AGPL) | kanıtlı; lisans düzeltildi |
| FreeLLMAPI "$19 yıllık tek seferlik" | çelişkili cümle; depo MIT, 45.501 yıldız | iddia |
| Meta Manus'u $2 milyara aldı, Çin bozdu | doğrulanmadı | iddia (bizim kararı değiştirmez) |
| ACE-Step "Suno 4.5-5 seviyesinde" | sunucunun kendisi "o seviyede bile değil" diyor | abartı (üreticinin iddiası) |
| Upscayl yüz onarımı yalnız bulutta, $25/ay | doğrulanmadı | iddia |

## 2. Ses klonlama — derinlemesine

### Bugün holdingde ne var (salt okuma ile ölçüldü)

- **Voicebox 0.5.0** — `/home/dxb/voicebox/voicebox-main` (jamiepine/voicebox, commit 2026-07-26, MIT). Sardığı motorlar `backend/backends/` içinde: Qwen3-TTS 1.7B/0.6B (10 dil; Türkçe ve Arapça yok), Qwen CustomVoice, **Chatterbox Multilingual** (23 dil, Türkçe ve 11 dilin hepsi var), Chatterbox Turbo (yalnız İngilizce, duygu etiketli), LuxTTS (İngilizce), HumeAI TADA 1B/3B (Türkçe yok, lisans Llama 3.2), Kokoro 82M (Türkçe yok), Whisper STT ve yerel Qwen3 dil modeli. **İndirilmiş olan yalnız Chatterbox** (`~/.cache/huggingface/hub/models--ResembleAI--chatterbox`, 3,0 GB). Veritabanında `profiles` 0, `generations` 1 (qwen, en), son yazım 17 Ağustos.
- **Speaches 0.8.3-cpu** — duyma `faster-whisper-small`, konuşma Piper `tr_TR-fahrettin-medium`. Kart bağlı değil (B12 ölçümü, 20 Ağustos). B12'deki "işi karta taşı" hamlesi hâlâ yapılmadı.
- **Şema:** `voice_identities` (migration 20260717080000) bir ajana bir motor ve bir profil bağlıyor. **Kimin sesi olduğu, rızası, kapsamı ve süresi için alan yok** (bkz. §4).
- **Stüdyo:** video seslendirmesi 4 Eylül 2026'dan beri kapalı (*"şu yapay sesi iptal et tüm video üretimlerinde… MiniMax H3'ün kendi sesi olsun"*, STACK.md). Ses çekimin kendi sesi; uzun anlatımlı bölümün nasıl seslendirileceği açık soru (B43, denetim F010). MiniMax H3 11 dil konuşuyor, **Türkçe konuşmuyor** (24 Eylül çalışması, §3.7).
- **Kart:** RTX 5060 Ti 16.311 MiB, şu an 1.366 MiB dolu. B33'e göre ses katı (7,3 GB) ile H3 üretimi (~14,9 GB) karta aynı anda sığmıyor. Klon motoru bu yüzden **sıralı bir misafir** olarak çalışır, H3 ile yan yana değil.

### Voicebox'ta 0.5.0'dan beri ne değişti

Yeni etiketli sürüm yok: en son sürüm hâlâ v0.5.0 (2026-04-25), son push 2026-10-07. Bizim commit'imizden sonra ana dala girenler:

- OmniVoice motoru (ticari olmayan ağırlıklar),
- Qwen VoiceDesign (tarifle ses tasarlama),
- OpenAI uyumlu `/v1/audio/speech` ve `/v1/models` (Speaches ile aynı arayüz; Hamza'ya takmak kolaylaşır),
- dışarıdaki bir dil modeline bağlanma,
- MP3/M4B dışa aktarma ve Linux CUDA derleme tarifi.

**VoxCPM2 Voicebox'ta yok.**

### Karşılaştırma — açık kaynak sahası (lisans ve dil HF/GitHub'dan bugün okundu; kalite sayıları ayrıca belirtilmedikçe üreticinin beyanı)

| Motor | Lisans (ağırlık) | Türkçe | 11 dil (ar,en,de,fr,es,pt,ja,ko,zh,it,ru) | Duygu ve kontrol | VRAM / hız | Reklam satışı |
|---|---|---|---|---|---|---|
| **VoxCPM2** 2B (OpenBMB) | Apache-2.0 | var | 11/11 (Arapça WER %13 — zayıf) | tarifle ses tasarımı, parantez içi üslup, LoRA ince ayarı | ~8 GB; 4090'da RTF ~0,3 (beyan) | **serbest** |
| **Chatterbox Multilingual** (bizde) | MIT | var | 11/11 | yalnız "exaggeration/cfg" düğmesi; PerTh filigranı gömülü | 3,2 GB model | **serbest** |
| MOSS-TTS (OpenMOSS) | Apache-2.0 | var | 11/11 | süre ve fonem kontrolü, uzun anlatım | ana model 8B → 16 GB kartta sıkışık | serbest |
| Fish Audio S2 Pro | Fish Research License | var | 11/11 | serbest metinli `[etiket]` ile en ince kontrol; çoğu dilde en düşük WER | 4B, RTF 0,195 (beyan) | **yasak**, ücretli lisans gerekir |
| OmniVoice (VoiceStudio varsayılanı) | CC-BY-NC | var | 600+ | tasarım, klon | RTF 0,025 (beyan) | **yasak** |
| Qwen3-TTS 1.7B | Apache-2.0 | yok | 9/11 (ar yok) | VoiceDesign | — | serbest |
| CosyVoice3 0.5B | Apache-2.0 | yok | 8/11 | talimat | — | serbest |
| IndexTTS-2 | özel lisans | yok (zh/en) | 2/11 | duygu ve süre ayrık | — | belirsiz |
| F5-TTS | CC-BY-NC | — | — | — | — | yasak |
| XTTS-v2 (Coqui kapandı) | CPML | var | çoğu | — | — | yasak |
| ElevenLabs (ücretli ikiz) | ticari | var | 11/11 | v3 etiketleri | bulut | Starter $6/ay, Creator $22/ay (profesyonel klon dahil), Pro $99/ay |

VoxCPM2'nin kendi MiniMax-MLS tablosundan sayılar (üreticinin iddiası):

- **Türkçe:** WER VoxCPM2 0,817 · ElevenLabs 0,699 · Fish S2 0,870. Benzerlik VoxCPM2 87,1 · Fish 83,5 · MiniMax 77,9 · ElevenLabs 59,6.
- **Arapça:** WER VoxCPM2 13,05, ElevenLabs ile MiniMax ~1,67.
- 11 dilin hepsinde benzerlikte birinci VoxCPM2, anlaşılırlıkta çoğu dilde Fish S2.

**Hüküm:**

1. Satışa izin veren lisanslar içinde **VoxCPM2 en güçlü genel aday**: Türkçe kalitesi, ses tasarımı, üslup kontrolü ve Apache lisansı bir arada.
2. **Arapçada** Chatterbox ya da ücretli ikiz (ElevenLabs) ayakta kalır; gerçek reklam metniyle ölçülmeden karar verilmez.
3. Kalite tavanı Fish S2 Pro'da, ama ticari lisans parası gerektirir; ücretli ikiz kuralı gereği yedekte durur.
4. Voicebox'ı atmak gerekmiyor: sorun kabukta değil, motorda ve kullanılmamasında.

⚠ DOĞRULANMADI: kalite ve hız sayılarının hepsi üreticinin beyanı. Bizim kartta ve sizin kulağınızda ölçülmedi.

### İlk deneme (onay kapısı içinde, €0)

Üç kısa reklam metni (Türkçe, Körfez Arapçası, İngilizce; her biri ~20 sn) × üç motor: Chatterbox ML (kurulu), VoxCPM2 (kurulumu sizin "evet"inize bağlı), ElevenLabs ücretsiz katmanı (yalnız deneme için; ücretsiz katmanda ticari lisans yok).

- **Ses kaynağı:** gerçek bir kişinin sesi değil. Tasarlanmış bir ses kullanılır ya da sizin kendi sesiniz, sizin izninizle.
- **Ölçülenler:** WER (whisper large-v3-turbo ile), RTF ve VRAM (bu kartta), sizin kör dinlemedeki tercihiniz.
- **Süre:** yarım gün oturum işi.
- **Sonrası:** kazanan motor `voice_identities.engine` içine yazılır. Hamza'nın sesi (B12) ve stüdyonun dublaj sorusu bu sonuçla karara bağlanır.

### İşletim sisteminin içinde sürekli hat olarak

Persona ya da marka → ses kimliği (tasarlanmış ses veya rıza belgeli klon) → stüdyoda "anlatım/dublaj" işi → tezgâh kuyruğu (B33 kapı bekçisi, misafir olarak) → motor → metne karşı WER kontrolü (kalite kapısı) → filigran ve "yapay zekâ sesi" etiketi → stüdyo ekranında sizin kabul ya da ret tıkınız → teslim.

Hat şu noktalarda size durur:

- gerçek bir kişinin sesi (rıza ve sözleşme),
- ücretli motor (para çıkışı),
- yeni bir persona sesinin dünyaya çıkışı (kimlik).

## 3. Videodaki diğer araçlar

| Araç (ne yerine) | Gerçek proje | Bizde var mı / dengi | Değer mi | Tahta |
|---|---|---|---|---|
| **Odysseus** (ChatGPT) | odysseus-dev/odysseus, 94.867★, AGPL-3.0, 2026-11-01 | Hamza ve pano, Claude Code | Gerek yok: yerel sohbet çalışma alanı, bizim çekirdekte dengi var | — |
| **FreeLLMAPI** (Claude Code limitleri) | tashfeenahmed/freellmapi, 45.501★, MIT, 2026-10-31; 34 sağlayıcının ücretsiz katmanlarını birleştiriyor | LiteLLM + OpenRouter; taslak çalışma kartı var (`study-cards/freellmapi-9router.md`, "ToS gray zones") | Gerek yok: ücretsiz katmanlar girdiyi eğitimde kullanabilir (şirket verisi sızar), ToS gri. Ucuz iş için B34 yerel modeli var | B34 / B51 |
| **Vane** (eski Perplexica) (Perplexity) | ItzCrazyKns/Vane, 37.942★, MIT, 2026-09-01 | dxb-research + agent-reach + scrapling (B46 kapandı); 8 Ekim turunda W092 olarak incelendi | Gerek yok | B30 |
| **InvokeAI** (Midjourney) | invoke-ai/InvokeAI, 28.951★, Apache-2.0, 2026-11-01 | ComfyUI (H3 orada), Flux Krea çalışma kartı | Gerek yok: aynı modellere başka bir arayüz. Katmanlı tuval ve yeniden koşturulabilir tarif fikri İzle | B43 |
| **ACE-Step 1.5** (Suno) | ace-step/ACE-Step-1.5, 14.269★, MIT (ağırlık MIT), 2026-10-11; ≥4 GB VRAM | yok | **Geçmez**: 18 Ekim 2026 hükmünüz "müzik… istemiyorum" (`islamic-exclusions-sponsors-and-work-2026-10-18`) | — |
| **OpenShorts** (Opus Clip) | mutonby/openshorts, 7.396★, MIT, 2026-11-01; Docker, 8 GB RAM, GPU isteğe bağlı, kart olmadan klip başına 5-8 dk | yok. 8 Ekim turunda (W005) aynı iş için AI-Youtube-Shorts-Generator önerilmişti | **Dene**: müşterinin uzun videosundan (webinar, podcast) aylık dikey kısa video paketi. Otomatik paylaşım üreticinin ücretli upload-post servisinden geçiyor; o adım kapıda durur | B43 / B28, B17 |
| **Dyad** (Lovable) | dyad-sh/dyad, 22.147★, Apache-2.0 (`src/pro` ayrı lisans), 2026-10-31 | Claude Code + Web-Studio | Gerek yok | — |
| **OpenManus** (Manus) | FoundationAgents/OpenManus, 58.853★, MIT, 2026-10-31 | Claude Agent SDK | Gerek yok: CLAUDE.md §5 "ikinci ajan çatısı yok" | — |
| **Upscayl** (Topaz Gigapixel) | upscayl/upscayl, 51.559★, AGPL-3.0, 2026-10-05; Vulkan | **kurulu** v18.17.1 + Video2X + SeedVR2 + RealESRGAN/4x-UltraSharp (`~/DEVIR-STUDIO-ARACLARI.md`) | Var | B43 |

## 4. Rıza — gerçek bir kişinin sesi

Bir kişinin sesini izni olmadan klonlamak hukuken ve ahlaken sınırdır; videodaki sunucu bile "beni biraz tedirgin ediyor" diyor (01:41). VoiceStudio ve VoxCPM2'nin kendi metinleri de izinsiz klonlamayı yasaklıyor. Bizde dört yerde değiyor:

1. **Müşterinin sözcüsü ya da ünlü yüzü:** yazılı rıza gerekir; kapsam (hangi diller, hangi kampanya), süre ve geri alma hakkı yazılır. Bu bir sözleşmedir, yani onay kapısında size durur. Ses kişisel veridir; kimlik tanımaya yarıyorsa KVKK'da özel nitelikli veri sayılır. AB YZ Yasası 50. madde yapay ses için etiket ister (2 Ağustos 2026'dan beri yürürlükte; hukukçuya teyit ettirilmeli).
2. **Şema açığı:** `voice_identities` tablosunda sesin kimden geldiği ve rıza belgesi için alan yok. Gerçek bir sesten klon üretmeden önce bu kayıt eklenmeli; satırsız klon üretilmemeli.
3. **Oluşturulan influencer ve personalar** (31 Ekim notunuzdaki 1. madde): gerçek bir kişinin sesi değil, **tarifle tasarlanmış ses** kullanılırsa rıza sorunu doğmaz. Yine de "yapay zekâ persona" açıklaması sorusu sizindir (aşağıda).
4. **Kendi sesiniz:** rıza sizindir. Hamza'ya ya da tanıtımlara sizin sesiniz verilecekse bunu yalnız siz söylersiniz.

Ek koruma: Chatterbox çıktısında PerTh filigranı zaten gömülü. Seçilecek motorda filigran yoksa VoiceStudio'nun filigran adımı ya da ayrı bir filigran eklenmeli.

## 5. Holding için en önemli beş şey (sıralı)

1. **Hamza'nın sesi bugün Piper ile işlemcide konuşuyor; bu tek başına "ses kötü" şikâyetinin kaynağı.** B12'nin karta taşıma hamlesi hâlâ yapılmadı. Konuşma tarafına VoxCPM2 ile Chatterbox ML kör dinleme denemesi eklenirse aynı iş hem gecikmeyi hem kaliteyi çözer.
2. **VoxCPM2, satışa izinli lisanslar içinde Türkçenin ve 11 dilin en güçlü adayı.** Ses tasarımı sayesinde rıza gerektirmeyen marka ve persona sesleri üretilebilir. Ölçülmeden kullanılmaz; ilk deneme €0 ve yarım gün.
3. **Stüdyonun Türkçe açığı:** H3 Türkçe konuşmuyor, video seslendirmesi de 4 Eylül hükmüyle kapalı. Türkçe dublaj ya da anlatım ancak sizin yeni kararınızla açılır (soru 1).
4. **OpenShorts ile müşteriye "uzun videodan aylık kısa video paketi"** ajansın (B28) hızlı ve ucuz bir ürünü olur. Önce kendi bir uzun videomuzda denenir.
5. **Rıza kaydı şemada yok.** Klon işine girmeden önce `voice_identities`'e kaynak ve rıza alanları eklenmeli; yoksa ilk müşteri işinde hukuki risk doğar.

## 6. Sizin sorularınız (öneriyle)

1. **4 Eylül "yapay ses iptal" hükmü dublajı da kapsıyor mu?** Gerekçe kaliteydi (edge-tts robot sesi). Öneri: önce aynı reklamı H3'ün kendi sesiyle ve VoxCPM2 Türkçe dublajıyla dinleyin; karar sizin kulağınızla verilsin.
2. **VoxCPM2'yi tezgâha misafir olarak kurup üç motorlu kör denemeyi yapalım mı?** (~8 GB, H3 ile sıralı, €0.) Öneri: evet.
3. **Yapay zekâ persona ya da influencer sesi kullanılırsa "yapay zekâdır" açıklaması yapılacak mı?** Şüpheli olan nokta şu: izleyici gerçek bir insan sandığında aldatma riski doğar; AB kuralı da etiket istiyor. Öneri: açıklansın.
4. **Ücretli ikiz:** açık kaynak motor bir dilde yetmezse (ilk aday Arapça) ElevenLabs Creator ($22/ay) mı, Fish Audio ticari lisansı mı? Öneri: denemeden sonra, yalnız eksik kalan dil için.
5. **Hamza'ya ya da tanıtımlara sizin kendi sesiniz verilsin mi?** Karar yalnız sizin.

## İncelenemeyenler

- Motorların bu kartta gerçek hızı ve sesi: kurulum yasaktı, ⚠ DOĞRULANMADI.
- Şirket veritabanında `voice_identities` satırları: bu turda bakılmadı.
- `rednote-hilab/dots.tts` HF kartı kimlik doğrulaması istedi, okunamadı.
- VoiceStudio Pro'nun lisans sayfası (`voicestudio.sh/pricing`) 404 döndü; fiyat ana sayfadan okundu.
