# B43 — THE VIRTUAL CREATOR (the studio's own presenter accounts, Islamic lifestyle first) · PLAN

**Status: PROPOSED, NOT APPROVED.** Written 2026-09-25 from ~23:00 (the commit carries the time) by the Fable 5.1 chief-engineer session on his order (below); four Opus 5.5 reader subagents measured the outside repositories, none of them Fable, on his word. <!-- OPEN: B43 --> No file outside this folder changes until he says yes; the studio itself is untouched (plan → his approval → build; nothing in the studio changes before his word). Nothing is installed: every outside skill enters through the customs gate (B41 · INTEG-01) as an audited fork, never a blind install. Body in Turkish because he reads it (precedent: B43's SIGNAL plan).

**His words, verbatim, in order (2026-09-25 evening, session orders, not laws):**
1. *"bu skillleri araştır iyi yoksa çok daha iyileri var mı bul dxb stüdyonun belki islami içeriklerinde influcerlar oluşturulacak onlara islami yaşam tarzı vs teşvik ettirilecek."*
2. *"şunu oku ve hangi satıra ekleyebiliriz bak. ama önce değerlendir sen planı hazırlayıp ilgili satıra ekle."*
3. *"bu kısmıda sen yap lütfen … yani fable halletsin. işi opus 5.5 medium ve max'e gerekli olduğu yerlerde alt ajanlar açıp dağıtabilirsin. alt ajanların fable olmasın dikkat."*
4. *"Bu higgsfieldlar bence sadece higgsfieldlar kullanılınca işe yarıor olabilir. Lakin reverse engineering ile dxb için bazı önemli skillerde üretebilirsiniz belki bilmiyorum ben mühendis değilim CEO'yum ama hedeflerimiz içinde gelir üretim kısımlarından biri bu işler."* — measured true (§4-A: all 8 official skills call only Higgsfield's CLI; §4-B: 15 of 33 OSideMedia folders are Higgsfield-only) and it is this plan's method: nothing of theirs is installed; the craft inside is extracted and rewritten as DxB skills for our own engine (§4-F).

The text he pasted was another AI's evaluation of a 7-skill "AI influencer cheat sheet" and its proposal of a "DXB Virtual Creator OS". §1 measures that text; §2 maps its diagram onto what the holding already has; §3–§5 are the architecture he asked for; §6 names where the text breaks his own laws; §7 his decisions.

---

# SANAL SUNUCU — STÜDYONUN KENDİ HESAPLARI, ÖNCE İSLAMİ YAŞAM TARZI — PLAN

## İki cümle (tahta kuralı 7)

1. **Ekranınızda ne olacak:** Stüdyonun kendi hesabında, profilinde açıkça *"sanal karakter — DxB Studio yapımı"* yazan, İslam'ı yaşayan ve vaaz vermeyen bir sunucu her gün bir kısa video yayınlar (sabah rutini, namaz etrafında kurulan gün, helal yemek, aile, sadaka, Ramazan) — yüzünü hesap açılmadan önce, dinî cümle içeren her videoyu yayından önce siz görürsünüz ve her videonun yedi gün sonraki gerçek sonucu tahminin yanında durur.
2. **Bunu kanıtlayan tek komut:** `node scripts/studio/creator-proof.mjs --today`. Şunu basar: "sunucu <ad> · kimlik ölçeri son 20 karede %X aynı yüz · bugün N video yayınlandı, N'inin N'inde açıklama satırı var, N'i dinî cümle taşıyor ve N'i CEO gözünden geçti · 7. gün satırı olan video sayısı M · dış maliyet $Y". Açıklama satırı eksikse ya da (karar 3 geçerli olduğu sürece) dinî cümleli bir video CEO gözünden geçmemişse 1 ile çıkar. Cetvel Faz 1'de, işten önce yazılır.

## Bir sayfada — sizin okuyacağınız kısım

**Ne kuruyoruz:** stüdyonun kendi hesabında yaşayan, yapay olduğunu profilinde söyleyen bir sunucu. Gece motor (SIGNAL) o alanın en çok tutan videolarını okur, sabah senaryo çıkar, tezgâh (MiniMax H3) videoyu çeker, motorun kendi sesiyle konuşur, dinî cümle varsa önce sizin gözünüzden geçer, yayınlanır, yedi gün sonra gerçek sonucu tahminin yanına yazılır. Bu zincirin halkalarının çoğu bugün evde var; dört halka yeni.

**Zaten evde olan:** kadro ve kimlik uzmanı · SIGNAL (okuma, senaryo, ölçüm, hafıza) · üç üretim kulvarı (tezgâh, RunPod, dış eller) · motor sesi · süreklilik kuralı · onay kapısı · "yasal temiz etiket" paketi.

**Yeni olan dört şey:** ① kimlik kilidi ölçülerek seçilir (tezgâhın referans kareleri mi, tezgâhta Fizgig ile eğitilmiş kimlik mi, Higgsfield Soul ID mi) · ② sunucunun kamu kimliği ve profil cümlesi *"sanal karakter — DxB Studio yapımı"*; hesap açmak sizin onayınızla · ③ SIGNAL'de "Müslüman yaşam tarzı üreticileri" masası · ④ İslami editör kontrolü: makine ayetin/hadisin var ve doğru alıntılanmış olduğunu kontrol eder, hüküm sizde.

**Dışarıdan alınan:** önce motorumuzun **kendi** deposu — MiniMax'in resmî `h3-prompt-writing` skill'i ve karakteri tutma yolu (Ref2VA); size gönderilen metin buna hiç bakmamıştı. Sonra en çok yıldızlı resmî Higgsfield deposundan (★1.139) ve kimlik kilidi en derin topluluk deposundan (OSideMedia ★636; yıldızda onu yalnız Seedance 2.0'a çakılı beshuaxian ★863 geçiyor) yalnız motordan bağımsız **bilgi** — kimlik/hareket ayrımı, iki görsel tabanı, "RELIGHT", oyunculuk görevi, hata→çözüm tablosu — gümrükten geçip fork'lanır; hiçbir şey olduğu gibi kurulmaz. Kimlik kartı şeması küçük bir depodan (ugc-creator), yerel kimlik eğitimi Fizgig'den (H3 için LoRA, ses dahil, $0). Mark Tilbury'nin paketi 4 skill (7 değil), ikisi Higgsfield'ın kendi ekibinden; fikir alınır, temel yapılmaz. "Çok daha iyisi" yok: daha yıldızlı depolar daha sığ. Kendi yazacaklarımız: İslami editör kontrolü, sunucunun kimlik kartı, yönetmen kuralları, cetvel.

**Sizin kanununuza çarpan dört yer (metinden):** "Layla, 27" — kadro kanunu (erkekler ve yaşlı teyzeler) · "Voice ID" — ses kanunu (motorun kendi sesi) · Flux ve körlemesine kurulum — yerel motor kanunu ve gümrük kapısı · metnin C2PA imzası — 2026-08-27'de *"şimdilik geçelim"* dediğiniz iş; plan yalnız profil cümlesi ve platformun kendi etiketini öneriyor.

**Sizden beş karar — her birinde önerim:**
1. **Sunucu kim?** Önerim: kadrodan bir erkek, yeni bir casting çekimiyle gözünüze gelir. Sebep: kanunun içinde, $0, erkek Müslüman yaşam tarzı üreticisi dünyada gerçek bir kategori. Kadın sunucu ancak kanunu değiştirirseniz.
2. **Sınır:** yapay bir karakterin namazı, Kur'an'ı anlatması sizin İslami sınırınızın içinde mi? Önerim: ilk 30 gün yalnız yaşanan pratik (rutin, alışkanlık, şükür, sadaka), ayet/hadis öğretimi yok; öğretim ancak siz "olur" derseniz ve her seferinde birebir alıntıyla. Sebep: hüküm sizin; plan "evet"i varsayamaz. Bir de hak sorusu: Diyanet meallerini paylaşmıyor, öteki Türkçe mealler "ticari dışı" diyor — Türkçe ayet meali yayınlamak hukuk sorusu, ölçüm değil (§4-D).
3. **Dinî cümle içeren her video yayından önce gözünüzden geçsin mi?** Önerim: evet, ilk 30 gün; sonra sayıya bakıp karar verirsiniz. Sebep: ilk günlerde makinenin ne kaçırdığını ancak sizin gözünüz gösterir.
4. **Higgsfield Plus (€47–59/ay) alınsın mı?** Önerim: şimdi değil; önce tezgâh yarısı ölçülür ($0). Sebep: kimlik ölçeri tezgâhta yetiyorsa para gereksiz; yetmezse fiyatıyla önünüze gelir.
5. **Sıra:** Önerim: sunucu kimliği (Faz 1–2) hemen, SIGNAL'i beklemeden; içerik SIGNAL masası açılana kadar elle yöntemle. Sebep: kimlik işi SIGNAL'e bağlı değil; SIGNAL onaylanana kadar beklemek hesabı boş bırakır.

**Yöntem, sizin sözünüzle (2026-09-25):** *"reverse engineering ile dxb için bazı önemli skillerde üretebilirsiniz"* — evet: Higgsfield'ın skill'leri ancak Higgsfield'da çalışıyor (ölçüldü: resmî sekizin sekizi yalnız onların komut aracını çağırıyor); biz onların skill'ini değil, içindeki ustalığı alır, bizim motor (MiniMax H3) için DxB skill'i olarak yeniden yazarız. Motorun kendi resmî skill'i de var, temel o olur.

**Gelir bağı:** bu hesap gelir çalışmasının bir kalemidir — markalar stüdyoyu bu hesaptan bulur (SIGNAL planı §2, madde 2), kitle oluşunca dijital ürün kalemi eklenir (§4-E: Ramazan planlayıcısı, 30 günlük alışkanlık defteri, 9–27 $). İkinci hesap, ikinci masa: aynı zincir.

**Maliyet:** tezgâh $0; Higgsfield yalnız siz derseniz; yeni servis yok.

---
*Buradan aşağısı mühendisin kendi listesi, size değil: ölçümler, tablolar, komutlar.*

## 1. Değerlendirme — yapıştırılan metin ölçüldü (R = bu oturumda okundu · U = ölçülemedi)

| Metnin dediği | Ölçülen |
|---|---|
| "Official Higgsfield Skills" 9 skill | **R** `higgsfield-ai/skills` var: ★1.139, 224 fork, son itme 2026-09-14; kökte **8** skill klasörü (generate, soul-id, product-photoshoot, brandkit, marketplace-cards, websites, video-explainer, youtube-thumbnail) — metnin saydığı `game-generation` yok. Soul ID: **ücretli plan (Basic+) ister**, CLI + tarayıcıda `higgsfield auth login`, 5–20 yüz fotoğrafı, `reference_id` döner (SKILL.md, R). Ayrıntı §4-A. |
| OSideMedia skill "32 sub-skill, 631 star" | **R** ★636, 112 fork, son itme 2026-08-23, `skills/` altında **33** klasör + `shared/`; `evals/`, `tests/`, `DISCIPLINE.md`, `production-benchmarks.md` var. Kimlik/hareket ayrımı ("Identity Block / Motion Block") ve "iki görsel tabanı: yüz + tam boy" kuralları `skills/higgsfield-soul/SKILL.md`'de (R). Ayrıntı §4-B. |
| ugc-creator ("compile one") | **R** `0xAnni/ugc-creator` ★3, 1 fork, son itme 2026-07-12; JSON kimlik kartı + 6 katmanlı prompt derleyici; Kling 3.0'ı fal.ai üzerinden çağırır (SKILL.md, R). Benimsenme küçük — bağımlılık değil, fikir. |
| PicsArt "gen-ai-persona-creation" | **R** `PicsArt/gen-ai-skills/skills/gen-ai-persona-creation` ★5, MIT; Picsart'ın ücretli CLI'sını süren bir araç, prompt paketi değil; video adımı Seedance 2.0'a çakılı. Metnin "talking-head yok, ses yok" tespiti doğru. |
| Mark Tilbury'nin 7 skill'lik paketi | **R** Video: *"I Tried The LAZIEST Way to Make Money With AI"*, 2026-09-21, 3,27 milyon izlenme. Açıklamadaki Dropbox paketi indirildi (659 KB): **4 skill**, 7 değil — `content-engine`, `ugc-influencer-video`, `digital-product`, `charsheet-soul`; ikisi (`ugc-influencer-video`, `charsheet-soul`) PDF'e göre *"Higgsfield'ın kendi ekibinden biri tarafından bu iş birliği için geliştirildi"*. Metnin saydığı `base-character-prompt / scene-still / silent-scene / talking-scene / voice-prompt` paketin içinde yok — başka bir ekranın adları. PDF'in kendi kuralları: *"under $99 to set up, no real face or voice"*, *"tell people it's AI. In the bio, and with the platform's AI creator setting"*; bağlantı `mcp.higgsfield.ai/mcp`; yazar Ultra planı kullanmış. |
| Kenza Layli · TikTok/YouTube/Meta kuralları | **R** — §4-D: Kenza 159 bin Instagram (2024'te ≈ 200 bin), TikTok 47,2 bin; TikTok kuralı 2026-09-24'ten beri yürürlükte, YouTube otomatik etiket 2026-05-27, Instagram'da hesap düzeyinde "AI-generated profile" etiketi var, AB md. 50 2026-08-02'den beri. Metin burada doğru. |
| Skills.sh güvenlik uyarıları (OSideMedia için) | **U** skills.sh okunmadı; bizim kendi ön-denetimimiz §4-B'de (sır okuma yok; iki şey sökülür). |
| "Çok daha iyileri var mı?" | Sayıyla: resmî depo en büyük (★1.139); `beshuaxian/higgsfield-seedance2-jineng` ★863 ama Seedance **2.0**'a çakılı ve son itme 2026-04-09 (beş ay eski — B42'nin yakalamak için var olduğu bayatlık); `AKCodez` ★378 (15/19 dosyası beshuaxian'ın kopyası), `rediumvex` ★384 (içerik 2026-04-13'te durmuş). Metnin ilk ikisi ölçümde ayakta. **Metnin hiç bakmadığı asıl kaynak:** motorumuzun kendi deposu `MiniMax-AI/MiniMax-H3` (★9.208) `h3-prompt-writing` skill'i ve Ref2VA referans moduyla — §4-C. |
| "DXB Virtual Creator OS" çizimi | Kutuların çoğunun altında bugün holdingde bir şey duruyor (§2). Yeni olan dört şey §3. |
| "Layla, 27, Dubai" · "Voice ID" · Flux/`npx install` | **Sizin kanunlarınızla çelişir** — §6. |

**Hüküm:** metin olguda büyük ölçüde doğru (bir sayı eksik, bir skill fazla, paket 7 değil 4), mimaride büyük ölçüde zaten evde olanı yeniden çiziyor, üç yerde sizin kanununuza çarpıyor. Skorlama tablosu bir görüştür, ölçüm değil; buraya alınmadı.

## 2. Harita — çizimdeki her kutunun altında bugün ne duruyor (yeniden kurulmasın)

| Çizimdeki kutu | Holdingde bugün | Boşluk |
|---|---|---|
| Persona Bible · Actor Card · Wardrobe · Location | Kadro motorun içinde doğar (metinle casting çekimi, üç kare referans — Ahmet DXB-A-010, James DXB-A-011); kimlik uzmanı koltuğu `personas/media-studio/media-character-identity.md` (referans seti, bağlama modu, benzerlik ölçeri); persona kapısı `dxb-persona` | Kimlik kartının **yapılandırılmış veri** olması (ugc-creator fikri) ve Soul ID karşılaştırması — §3 L1 |
| Soul ID · Voice ID | Yerelde kimlik = referans kareler; ses = motorun kendi sesi (sizin kanununuz 2026-09-04) | Soul ID ölçülmedi; Voice ID kanuna aykırı (§6) |
| Trend Intelligence · Audience Research · Hook Library · Editorial Calendar | SIGNAL planı (Faz 0–4: okuma, kalıplar, "önemli 5 kalıp"; masalar) — onaysız | SIGNAL'e bu sunucu için bir masa — §3 L3 |
| Script / Story Engine | SIGNAL Faz 6 (senaryo stüdyosu); stüdyo beyni Fable 5.1 xhigh (sizin hükmünüz) | — |
| Islamic Source Check | Anayasa: İslami sınırlar yalnız sizin (`MASTER_PLAN.md` §11); `halal_verdict` kapısı | Ayet/hadis **varlık ve doğru alıntı** kontrolü makineyle — §3 L4; hüküm sizde |
| Creative Director | Stüdyo beyni + yönetmen/storyboard koltukları; yol: T2V ve I2V, tek çekim yeter ise tek çekim | Sunucu videoları için prompt derleme kuralları (§4'ten alınan) |
| STILL (Nano Banana / Soul) · VIDEO (Seedance / Kling) | Üç kulvar: ① kendi tezgâhımız MiniMax H3 (her şeyi baştan sona; Kanun D taslak önce) · ② RunPod · ③ dış eller: Higgsfield MCP (Plus, €47–59/ay, alınmadı), MiniMax H3 API, fal H3 Max — `.planning/quick/20260903-media-studio-founding/EVIDENCE-external-hands-2026-09-14.md` | Dış eller kodda yok (B43 bacak 6, sırasını bekliyor) |
| VOICE | Motorun kendi sesi (H3) — kanun | Dış kulvarda (Kling/Seedance) ses sorusu açık — §6 |
| Consistency QA | Süreklilik kuralı (12 dosya), `tests/b43/road-consistency.test.ts`, kimlik ölçeri, B39 kalite hakemi | — |
| Sharia / Brand QA | §11 + sizin gözünüz; marka kısıtı yok (2026-09-03); motor asla yazı çizmez | Dinî cümle içeren video için gözünüz — §7 |
| Virality Score | SIGNAL Faz 4 kalıpları; gelir çalışması kalem 3.3 "yayın öncesi puan" | — |
| Human Approval Gate | Onay kapısı: hesap açmak kimlik adımı; para çıkışı; işaretlediğiniz konular | — |
| Instagram / TikTok / YT | outbox yürütücü hatları; rutin dış iletişim kendiliğinden (h18) | Hesap yok — kimlik adımı, sizin onayınız |
| ANALYTICS · MEMORY LOOP | SIGNAL Faz 8 (7. gün tahmin vs gerçek) · Faz 7 (hafıza + Hamza) | — |
| AI-disclosure | Gelir çalışmasının "yasal temiz etiket" paketi; C2PA imzası **ertelendi** (2026-08-27, *"yapay zeka ürünüdürü şimdilik geçelim"* — karar sizin; SocialForge B31'in ücretli tezgâhında) | Profil cümlesi ve platform ayarı — §3 L2 |

## 3. Yeni olan dört şey (bu plan bunları kurar, başka bir şey kurmaz)

- **L1 — Kimlik kilidi, ölçülerek seçilir.** Aynı sunucu, aynı 5 senaryo, üç yol: (a) tezgâh — H3'ün kendi **Ref2VA referans modu** ile casting karelerine bağlı üretim (bugünkü yolun, motorun resmî skill'iyle yazılmış hâli; $0); (b) tezgâh — **Fizgig ile H3 LoRA** (görünüş, ses dahil; $0 dış maliyet, kart saati; Apache-2.0); (c) Higgsfield Soul ID — casting karelerinden eğitilmiş kimlik modeli (`--soul-id`; ücretli plan, sizin para kapınız; kareler evden çıkar). Kimlik ölçeri üç yolun 20'şer karesini sayar; seçim sizin gözünüzün. Kimlik kartı bundan sonra **sürümlü yapılandırılmış veri** olur (ugc-creator'ın kart şeması, §4-C), persona dosyasının yanında; machina'nın kuralı kabul maddesidir: sunucu 10/10 test karesini geçene kadar **taslak**, geçmeden tek sahne üretilmez.
- **L2 — Sunucunun kamu kimliği.** `dxb-persona` kapısıyla yazılır: ad, yaş, şehir, dünya görüşü, konular, **asla-listesi** (fetva vermez, hüküm vermez, âlim değildir, haram ürün tanıtmaz), profil cümlesi *"sanal karakter — DxB Studio yapımı"* ve platformun yapay zekâ etiketi her gönderide. Hesap açmak kimlik adımıdır: sizin onayınızla.
- **L3 — SIGNAL'de bir masa: "Müslüman yaşam tarzı üreticileri".** O alanın en gürültülü hesapları gece okunur, kalıplar ve senaryo oradan gelir; metindeki içerik dağılımı (%35 yaşam tarzı · %20 İslami alışkanlık · %15 eğitici · %15 eğlence · %10 özenilen · %5 ticari) **kural değil varsayım**, Faz 8'in tahmin-gerçek satırları ölçer. SIGNAL onaylanmadan bu masa açılamaz; o zamana kadar paketteki `content-engine`'in basit yöntemi (3–5 arama, kalıp çıkar, üretilebilirlik süzgeci) elle yürür.
- **L4 — İslami editör kontrolü (sıfırdan bizim).** Senaryodaki her dinî iddia çıkarılır → ayet/hadis **var mı ve doğru mu alıntılanmış** (Kur'an ve hadis kaynak API'leri, §4-D) → alıntı doğruysa ve hüküm içermiyorsa yeşil, hüküm içeriyorsa **sizin gözünüze** (anayasa: sınır yalnız sizin). Makine izin verilebilirliğe karar vermez, veremez.

## 4. Skill skill — hangisi GitHub'dan (denetimden sonra fork), hangisi sıfırdan bizim, hangi model/API hangi aşamada

### 4-A. Resmî Higgsfield skill'leri (`higgsfield-ai/skills`, 8 skill, v0.12.0, HEAD `d071406` 2026-09-11) — birinci okuyucu (Opus 5.5) ölçtü; rapor `EVIDENCE-official-higgsfield.md`

**Sekizi de yalnız `higgsfield` komut satırı aracını (CLI) çağırır, MCP'yi değil** (`CLAUDE.md:78`). Stüdyonun yolu MCP olduğu için "AL" demek klasörü kurmak değil, **yordamı ve prompt kurallarını MCP üstünden yeniden yazmak** demektir.

| Skill | Karar | Neden / hangi aşama |
|---|---|---|
| `higgsfield-generate` | **AL (yordam)** | Görsel + video: model yönlendirme, referans yuvaları, Seedance 2.5 `omni_reference`, Kling ilk/son kare. Seed Audio ve ses kısımları **dışarıda** (ses kanunu). "İş öncesi maliyet tahmini yapma" cümlesi (`SKILL.md:48`) bizim "fiyat işten önce" kuralımıza aykırı — üstüne yazılır. |
| `higgsfield-youtube-thumbnail` | **AL (yordam)** | Paketleme: referans karelerden yüzü tutan kimlik kilidi promptu; başlık bindirmesi 0 kredi. |
| `higgsfield-soul-id` | **BELKİ — L1 ölçümüyle** | 5–20 yüz fotoğrafı (ideal 8–12), açı/ışık/ifade/mesafe **çeşitli**, tek kişi, ≥ 1024 px; "aynı poz tekrarı" istenmiyor — tek casting çekiminin kareleri buna uymayabilir. Ücretli plan ("Basic+"; Plus'a adıyla eşlendiği yazmıyor, U). Eğitim `--soul-2` / `--soul-cinematic`, 15–45 dk, `--soul-id` ile yeniden kullanım. **Üretilmiş bir sunucunun karelerini kabul edip etmediği yazmıyor (U).** |
| `higgsfield-product-photoshoot` | BELKİ | Yalnız ürün görseli (B28 masaları için); bu planın işi değil. |
| Virality Predictor (`brain_activity`) | BELKİ | Paketleme kalite kontrolü; SIGNAL'in kendi yayın öncesi puanı varken ikincil. |
| `brandkit` · `marketplace-cards` · `websites` · `video-explainer` | **ALMA** | video-explainer: anlatım Seed Audio, fotogerçekçi değil, kendisi "talking head için değil" diyor; brandkit şablonu sabitlenmemiş bir Google Slides bağlantısından canlı çeker. |

**Eğitimsiz yol var:** referans kareler + `seedance_2_0 --audio` — motorun kendi sesiyle üretilmiş sesi dış kulvara taşıyabilir (ses kanunuyla uyumlu olabilecek tek dış yol; dudak eşlemesi U, Faz 1'de denenir). Depo `soul_cinematic`'in video mu görsel mi ürettiğinde kendiyle çelişiyor — video hükmü buna dayandırılmaz.

**Gümrük ön-denetimi (R, 20 bulgu):** 8 skill'in 7'si araç yoksa kendiliğinden `curl … | sh` çalıştırmayı söylüyor (yalnız brandkit sorar); kurulum betiği sağlama (checksum) doğrulamıyor (sürüm `checksums.txt` taşıdığı hâlde), `sudo` ile `/usr/local/bin`'e yazıyor, Hugging Face'in aracıyla çakışabilecek bir `hf` kısayolu açıyor; CLI deposunda kaynak kod yok, yalnız indirilen ikili dosyalar; giriş belirteci `~/.config/higgsfield/credentials.json`'da; **referans olarak verilen her yerel dosya — kadronun kareleri dahil — Higgsfield'a yüklenir** (ne tutulduğu, eğitimde kullanılıp kullanılmadığı U). Yapay zekâ etiketi / C2PA üzerine tek satır yok; "watermark" geçen yerler modele **hiç eklememesini** söylüyor — etiketi biz koyarız. Deponun kendi `./setup` betiği yayımlandığı hâliyle bitmiyor (9 skill listeliyor, 8 var, `exit 1`). Lisans MIT. Manifestte kanca, MCP sunucusu, komut yok. **Sonuç:** klasör kurulmaz; yordam MCP'ye çevrilir; CLI ancak sizin sözünüzle ve sağlama doğrulanarak.

### 4-B. OSideMedia (`higgsfield-ai-prompt-skill`, 33 klasör) — ikinci okuyucu (Opus 5.5) salt-okur klon `c0b73ab` (v3.35.0, 2026-08-22) üzerinde ölçtü; rapor `EVIDENCE-osidemedia.md`

| Karar | Klasörler |
|---|---|
| **FORK, gümrükten sonra** (16; dördü kısmen) | acting · audio (kısmi) · camera · character-design · facs · image-shots · pipeline (kısmi) · prompt · recipes · scene-engine · seedance (kısmi) · seedance-2-5 · shotlist-director · soul (kısmi) · style · troubleshoot · + `shared/negative-constraints.md` |
| **Yalnız Higgsfield'a özgü** (15) | apps, assist, canvas, cinema, content-factory, gpt-image-2, marketing-studio, mixed-media, models, moodboard, motion-design, motion, stack, vibe-motion, workspaces |
| **Atla** (2) | recall (sessizce davranma talimatı), seedance-vfx |

**Depo MiniMax H3 için prompt doktrini taşımıyor** (`CHANGELOG.md:610`, `model-guide.md:49`): fork edilen her kural bizim motorda **ölçülmeden** kural olmaz (Faz 3'ün kabul maddesi). Üç kural kaynak olarak bir "MiniMax H3 skill corpus" adını veriyor (`shotlist-director:165`, `seedance-2-5:212`, `troubleshoot:324`) — bizim motor için birincil kaynak ipucu, yeri bulunmadı (U).

Alınacak somut kurallar (R, dosya:satır): kimlik bloğu (görünüş) / hareket bloğu (kamera + eylem) ayrımı (`soul:100-109`) · video modeline asla tek görsel verilmez, taban bir yüz + bir tam boy, nötr gri; portre bir daha modelden geçirilmez; her yeni durum yeni adlı sayfa (`soul:368,261,280,584`) · referans plakaları cilt gerçekçiliği tam, fotoğrafik ışık sıfır; her çekime 10 alanlı "Character Anchor Block" (`soul:291-316, 541-576`) · tam boy paneller başsız kesilir, yüz yalnız yakın plandır (`character-design:124,181-205`) · karakter başına 150–220 kelimelik ana profil; her tikin tetiği; gözlere görev verilir; ses promptu kelimesi kelimesine (`acting:282-395,410`) · üretim başına 3–4 yüz ifadesi FACS kas koduyla (AU6+AU12 gerçek gülüş, AU12 tek başına zoraki); her replikte önce/sırasında/sonra vuruş (`facs:113,218,357,406,442`) · her referans görsele rol, dışlama ve sadakat derecesi; karakter sayfaları "sahnesini sızdırır" (gri fon sahneye girer) (`seedance-2-5:166-255`) · tek küresel stil ön eki, bir varlık sözlüğü, 15 sn'lik promptlar; kesim süreleri toplamı tam süre; art arda üç kesim aynı plan büyüklüğü ve kamera hareketini paylaşmaz (`shotlist-director:122-255`, `camera:194-213`).

**Gümrük ön-denetimi (R):** sır okuyan/gönderen yok; Python standart kütüphane + `fpdf`, ağ çağrısı yok, `.env` / ev dizini / `~/.claude` okuması yok. Fork'ta **sökülecek iki şey:** `.claude/settings.json:4-10` — `git push`, her `python3`, her `gh` komutunu ve `Edit(.claude/**)`'ı önden izinli kılıyor; `recall:8-10,49,104-110` ve `content-factory:49,163,195` — "kullanıcıya söylemeden sessizce davran" talimatları. `content-factory` Meta Ads'e **bütçeyle** yayın verir — reklam harcaması, sizin kapınız; zaten alınmıyor. Lisans MIT (`LICENSE:1-3`), ama üçüncü taraflardan çevrilmiş bölümlerin lisansı adlandırılmamış (`CHANGELOG.md:480`) — gümrük raporuna yazılır. U: kuralların H3'te tutup tutmadığı; Plus planındaki MCP'nin Soul ID / Elements / Cinema Studio'yu açıp açmadığı (bazıları Business/Team, `soul:848`).

### 4-C. Alan taraması — üçüncü okuyucu (Opus 5.5), GitHub API ve açık sayfalar, 2026-09-25; rapor `EVIDENCE-field-sweep.md`

**Cevap: ölçülen iki paketin yerine geçecek "çok daha iyisi" yok.** Daha yüksek yıldızlı depolar tutarlı biçimde daha sığ kimlik kilidi taşıyor; daha iyi olan, boşluk dolduran **dar parçalar**. Stüdyo için sıra:

| # | Aday | Ölçü | Ne | Karar |
|---|---|---|---|---|
| 1 | **`MiniMax-AI/MiniMax-H3`** (resmî) | ★9.208 | Motorumuzun **kendi** `h3-prompt-writing` skill'i; **Ref2VA referans modu** (`<Subject N>` / `<Picture N>` + tutma analizi) — H3'ün karakteri tutma yolu budur | **FORK, gümrükten sonra** — bizim motorun birincil kaynağı; lisans (MiniMax H3 Community License, okunmadı, U) gümrük maddesi |
| 2 | `0xAnni/ugc-creator` | ★3, MIT | Kimlik kartı JSON: zorunlu `actor_id, name, face, eyes (asimetriyle), skin_tone_hex, hair, jawline (asimetriyle), distinguishing_marks (yerine sabitlenmiş), prompt_seed`; seçimlik `origin, age_range, skin_notes, outfit_variations[], voice_notes, negative_defaults[]`; 6 katman, kimlik kilidi hep önce; kilit merdiveni: kart → 6 kareli yüz paketi → cref/PuLID/InstantID/IP-Adapter (0,6–0,8) → Kling v3 `elements` (fal.ai, `FAL_KEY`, ≈ 0,084 $/sn) → 20–40 görselden LoRA | **FORK, gümrükten sonra** — kart şeması ve katman fikri; fal.ai betiği **alınmaz** (üçüncü bir ücretli yol olurdu) |
| 3 | `machina-exm/film-studio-skills` | ★140, lisans yok | Her varlığa "pasaport" ve kayıt satırı; karakter 10/10 test karesini geçene kadar **taslak** kalır, geçmeden sahne üretilmez — bulunan en iyi **harcama kapısı**, motordan bağımsız | **FİKİR** (lisanssız, fork edilemez) — Faz 1'in kabul maddesine girer |
| 4 | Tilbury'nin iki Higgsfield-yazımı skill'i | lisans yok | §4-E | **FİKİR** |
| 5 | **Fizgig** | ★421, Apache-2.0 | H3 için **LoRA eğitir, ses dahil**; ComfyUI H3 düğümleri için referans modülleri — bulunan tek **yerel** Soul ID karşılığı; benzerlik sayıları README'nin kendi iddiası (U) | **FORK, gümrükten sonra** — L1'in üçüncü yolu (tezgâhta, $0, kart saati) |
| 6 | `PicsArt/gen-ai-skills/…/gen-ai-persona-creation` | ★5, MIT, skills.sh'ta 293 kurulum | Picsart'ın **ücretli** `gen-ai` CLI'sını süren araç; sabit görünüş bloğu + 2×2 dört açılı casting kartı; video adımı Seedance 2.0'a çakılı | **FİKİR** (dört açılı kart) |
| — | `beshuaxian` ★863 · `AKCodez` ★378 · `rediumvex` ★384 | — | beshuaxian: Seedance 2.0, tek günlük sürüm 2026-04-09, lisans yok, kimlik kilidi içeriği yok; AKCodez: 19 skill'inin 15'i beshuaxian'la aynı git blob, kalan 4'ünden 3'ü Playwright ile Higgsfield web arayüzünü sürüyor, biri (ugc-hot-girl) yalnız prompt; rediumvex: içerik 2026-04-13'ten beri değişmemiş, prompt'tan ibaret | **ATLA** |
| — | `manju-laoli` ★874 (H3 Ref2VA dalı ve 4 görünüşlü varlık kilidi iddiası) · smixs · lanshu · seedance-tvc-director · Krea'nın H3 influencer yazısı | — | yalnız açıklama/dosya ağacından okundu | **U** — Faz 0 gümrüğünde okunur |

İki kural birden çok kaynakta aynı: **referans görsel yalnız kimliği taşır**, "şunu alma" cümlesiyle (ışığını, fonunu alma); **karakter sayfası kilitli yazılı bir tariften üretilir ve o tariften yeniden üretilir, elle düzenlenmez.**

### 4-D. Kaynaklar ve kurallar — dördüncü okuyucu (Opus 5.5) birinci el sayfalardan ölçtü, 2026-09-25; rapor `EVIDENCE-islamic-sources-and-rules.md`

**Kur'an ve hadis kaynakları (L4'ün veri tabanı):**

| Kaynak | Anahtar | Diller | Not |
|---|---|---|---|
| Al Quran Cloud `api.alquran.cloud/v1` | **yok** | Arapça + `en.sahih` + `tr.diyanet` tek GET'te; 10 Türkçe meal; anahtarsız metin arama (`uyuklama` → 2:255) | 12 istek/sn; şartlar (2026-06-14) "ücretsiz ve anahtarsız" — **birinci seçenek** |
| Quran.com v4 `api.quran.com/api/v4` | yok (eski uç) | 5 Türkçe meal (Diyanet 77, Elmalılı 52 …) | Quran Foundation kendi sayfasında "eski, kimliksiz API" diyor, OAuth2'ye işaret ediyor; kapanış tarihi yok (U) — **yedek** |
| fawazahmed0 hadith-api (jsDelivr CDN) | **yok** | 10 koleksiyonun 8'inde Türkçe; hadis başına derecelendiren adı (Albani, Arnavut …) | Unlicense; Türkçe baskıların yazarı "Unknown", kaynağı yok; Arapça Buhari derecesiz geldi — **hadis için birinci, kaynak notu şart** |
| hadithapi.com | ücretsiz anahtar (kayıt) | Arapça, Urduca, İngilizce; Sahih/Hasan/Zayıf süzgeci | Türkçe yok |
| sunnah.com | anahtar GitHub issue ile | U | — |
| Diyanet (kuran.diyanet, hadislerleislam) | **API yok** | — | Kur'an API anahtarı ilk 30 sayfayla sınırlı; sayfa "metin ve veri setleri şirketlerle, vatandaşlarla, geliştiricilerle paylaşılmaz" diyor; Hadislerle İslâm yalnız web sayfası/PDF, "tüm hakları saklıdır" |
| `api.hadith.gading.dev` | — | — | ölü (adres çözülmüyor; zaten yalnız Endonezce) |

**Hak sorusu (çözülmedi, hukuk kararı):** Tanzil, Al Quran Cloud'un sunduğu aynı 10 Türkçe meal için "yalnız ticari olmayan kullanım" diyor; Al Quran Cloud yalnız çevirmen adını istiyor; Diyanet paylaşmıyor. Ticari bir stüdyonun hangi Türkçe meali yayınlayabileceği ölçümle değil hakla çözülür — Faz 3'ten önce sizin sözünüz ya da hukuk. Makinenin yapabildiği: ayetin/hadisin **var olduğu, adlı bir baskıdan kelimesi kelimesine alıntılandığı ve adlı derecelendiricilerin ne dediği**; yapamadığı: helal/haram hükmü (`MASTER_PLAN.md:166`: "no agent may debate, reinterpret, or optimize around them").

**Platform kuralları (birinci el, R):**

| Platform | Kural | Tarih | Ceza |
|---|---|---|---|
| TikTok | Gerçekçi görünen yapay kişi/sahne etiketlenir (AIGC etiketi ya da kendi altyazı/çıkartma/filigranı); C2PA Content Credentials'tan otomatik etiket | Topluluk Kuralları sürümü 2026-08-25, **yürürlük 2026-09-24** | "kaldırılabilir, kısıtlanabilir ya da etiketlenebilir" |
| YouTube | Gerçekçi yapay içerik Studio'da "AI use" ile beyan edilir; tespit edilen fotogerçekçi yapay içeriğe otomatik etiket (oynatıcının altında; Shorts'ta bindirme) | blog 2026-05-27 | zorla etiket, kaldırma, Partner Programı'ndan askı |
| Meta / Instagram | Fotogerçekçi yapay video ve gerçekçi yapay ses (yapay seslendirme dahil) etiketlenir; görsel zorunlu değil; **hesap için "AI-generated profile" etiketi var** — sanal sunucuya birebir uyar | sayfa tarihi U | "cezalar olabilir" |
| AB Yapay Zekâ Yasası md. 50(4) | Deepfake yayınlayan bunu açıklar; "açıkça sanatsal… kurgusal" işte hafif yükümlülük; tümüyle uydurulmuş bir kişinin sayılıp sayılmadığı md. 3(60) "var olan kişilere benzer" tanımına bağlı | **2 Ağustos 2026'dan beri** | — |

Komisyon'un gönüllü kodunda Meta ve Google imzacı listesinde; TikTok, ByteDance ve YouTube listede görünmüyor (R, liste sayfası). **Sonuç:** profil cümlesi + her gönderide platformun yapay zekâ etiketi + Instagram'da "AI-generated profile" — planın L2'si tam bunu yapar; C2PA ertelendi (2026-08-27, §6 madde 5); paketin PDF'i de aynı şeyi söylüyordu.

**Emsal (R):** Kenza Layli — profil "First Moroccan Meta Humans powered by AI… By @phoenixai.ai"; Instagram bugün 159 bin takipçi (CNN 2024-07-11'de ≈ 200 bin; ≈ −%20), TikTok 47,2 bin (yaklaşık aynı); yapımcı Phoenix AI (Myriam Bessa), yarışma Fanvue. Yani alan gerçek, büyüme kendiliğinden değil.

### 4-E. Mark Tilbury paketi (indirildi, okundu — R; `EVIDENCE-tilbury-pack.md`)

| Skill | Ne | Bizde | Karar |
|---|---|---|---|
| `charsheet-soul` (97 satır; Higgsfield ekibinden) | İki geçişli kimlik: önce sıkı portre (bir daha üretilmez), sonra 3 panelli kart; 2–3 "işaret çapası"; erkeklerde LEAN bloğu; **"Modest block is mandatory"** (kapalı, vücut vurgusu yok); No-IP; Soul 2.0'ın 10 ölçülmüş düzeltmesi (≤ 3.500 karakter, olumsuz cümle işlemez, güçlü özellik üç kez yazılır, takı sayıyla) | Kimlik uzmanının referans seti; motorumuz H3 | **FİKİR ALINIR** — çapa, modest blok, "üç kez yaz" kuralları kimlik uzmanının koltuğuna, motordan bağımsız cümleler olarak; Soul'a özgü düzeltmeler yalnız dış kulvar için |
| `ugc-influencer-video` (123 satır; Higgsfield ekibinden) | Prompt bölümlerinin sabit sırası (öncelik → referans anahtarı → **RELIGHT** → görüntü kalitesi → kamera "canlı, asla tripod" → **ACTING TASK** (sonuç değil görev) → fizik → tutarlılık → ses → zamanlı kırılım); No-IP; "Known failure → fix" tablosu (yapıştırılmış çıkartma yüz, sihirle beliren prop, gün doğumu hızlandırması, ölü cam göz, yüz kayması, kukla oyun, yanlış dil) | Yönetmen/storyboard koltukları; süreklilik kuralı | **FİKİR ALINIR** — bölüm sırası ve hata→çözüm tablosu yönetmen koltuğuna; `@audio1` ses kilidi bize aykırı (ses motorun) |
| `content-engine` (173 satır) | Niş araştırması → kanıtlı kısa video iskeletleri → **üretilebilirlik süzgeci** (tek karakter, sabit sahne, 15–40 sn, el-nesne etkileşimi yok, kalabalık yok) → çekilebilir kart; platform güvenliği (sağlık/para iddiası yok) | SIGNAL (çok daha derin: gece okuma, kalıp, tahmin-gerçek) | **SIGNAL gelene kadar elle yöntem**; üretilebilirlik süzgeci SIGNAL Faz 6'ya kural olarak girer |
| `digital-product` (160 satır) | Karakterden 9–27 $'lık dijital ürün (rehber, 30 günlük program, çalışma defteri); "sistem satar, bilgi satmaz"; güvenlik geçişi | Gelir çalışmasında yok | **SONRA** — sunucu kitle kazanınca bir gelir kalemi (Ramazan planlayıcısı, 30 günlük alışkanlık defteri); şimdi değil |

### 4-F. Sıfırdan bizim yazacaklarımız

| Skill / parça | Ne | Neden bizim | Yazar |
|---|---|---|---|
| `dxb-islamic-editorial` | İddia çıkarma → ayet/hadis varlık ve alıntı doğrulama (§4-D API'leri) → hüküm içeren cümleyi CEO gözüne işaretleme; Türkçe/İngilizce/Arapça | Dünyada böyle bir skill ölçülmedi; sınır anayasal | builder (max) — para/onay yolu |
| Sunucunun persona dosyası + kimlik kartı (JSON) | L2; alanlar: kimlik, yüz, beden, saç, giysi (modest), ses = motor, kamera, gerçekçilik çapaları, referans paketi, **sürüm** | Kadro bizim, kimlik kanunu bizim | baş mühendis (`dxb-persona`), kimlik uzmanı koltuğu |
| `dxb-creator-director` | §4-A/B/E'den alınan motordan bağımsız prompt derleme kuralları (kimlik/hareket ayrımı, RELIGHT, ACTING TASK, hata→çözüm) H3'ün kendi prompt diline çevrilmiş; dış kulvar için Higgsfield sözlüğü | Yerel motor H3, dünyanın kuralları Higgsfield/Kling için yazılmış | builder (max) |
| `scripts/studio/creator-proof.mjs` | İki cümlenin cetveli | Cetvel işten önce | builder-lean (medium) |
| SIGNAL masası "Müslüman yaşam tarzı üreticileri" | L3 | SIGNAL bizim | SIGNAL'in kendi fazları |

## 5. Aşama → model / API (bugün ölçülü kayıtlardan; yeni bir servis yok)

| Aşama | Yerel / ücretsiz yol (önce) | Dış yol (kalite isteyince; sizin para kapınız) |
|---|---|---|
| Alan okuma, kalıp, senaryo | SIGNAL: B48 Instagram köprüsü $0 · Speaches $0 · Claude Code aboneliği (başsız oturum) · stüdyo beyni Fable 5.1 xhigh | — |
| Kimlik (casting, referans) | Tezgâh: MiniMax H3 metinden casting çekimi; Ref2VA referans modu (resmî skill); Fizgig LoRA (ses dahil); kimlik ölçeri | Higgsfield Soul ID (ücretli plan; L1 ölçümü; kareler evden çıkar) |
| Görsel (kart, hero kare) | MiniMax H3 (yerelde Flux yok — kanun) | Higgsfield MCP: Nano Banana 2 / Soul (dışarıda Flux serbest) |
| Video | ① tezgâh H3, Kanun D: 640×1152 taslak önce · ② RunPod | ③ Higgsfield MCP (Kling 3 / Seedance 2.5 / Veo) · MiniMax H3 API · fal H3 Max |
| Ses | H3'ün kendi sesi (kanun; TTS yok) | ⚠ Kling/Seedance klibinde ses kanunla çelişir — §6 |
| Yazı/altyazı | Motor yazı çizmez; post'ta gerçek dosyadan | aynı |
| Dinî doğrulama | §4-D API'leri (ücretsiz olanlar) + sizin gözünüz | — |
| Etiket | Profil cümlesi + platform yapay zekâ ayarı (+ Instagram'ın hesap etiketi); C2PA ertelendi (2026-08-27 — karar sizin) | SocialForge (B31, ücretli) yalnız ertelemeyi kaldırırsanız |
| Yayın | outbox hatları (hesap açılınca) | — |
| Ölçüm | SIGNAL Faz 8 (7. gün) | — |

## 6. Sizin kanunlarınızla çelişenler — adlandırıldı, çözülmedi (karar sizin)

1. **"Layla, 27, Dubai"** — kadro kanununuz (`avatar-cast-men-and-elderly-women-only-2026-09-03`; eki `cast-law-client-may-order-female-content-2026-09-15`): holdingin kendi kadrosu **erkekler ve yaşlı teyzeler**; kadın sunuculu içerik yalnız müşteri isterse, sorumluluk onun. Bu hesap stüdyonun kendi hesabı: Layla ancak siz kanunu değiştirirseniz olur. Yaşlı kadın yarısı: Safiye kadroda kalır (sizin sözünüz 2026-09-14, `avatars-safiye-kenan-deniz-stay-2026-09-14`); motorda doğan yaşlı kadın sunucu B43 bacak (11)'de, henüz yok.
2. **"Voice ID / voice-prompt"** — ses kanununuz (`tts-cancelled-engine-voice-only-2026-09-04`): her üretimde motorun kendi sesi, TTS yok. Dış kulvarda (Kling/Seedance) ses yok ya da motor dışı; oraya konuşan video ancak sizin sözünüzle.
3. **Flux / `npx install` / Higgsfield CLI** — yerelde H3 her şeyi yapar, Flux yalnız dışarıda (`flux-local-engine-only-everything-made-here-2026-09-14`); hiçbir şey denetimsiz kurulmaz (gümrük kapısı B41; `.planning/research/STACK.md` önce okunur); kalite kademesi: ücretsiz önce, ücretli kalite isteyince fiyatıyla önünüze. **Ve bir gerçek:** Higgsfield'a referans olarak verilen her dosya (kadronun kareleri dahil) evden çıkar, ne tuttukları yazmıyor — Soul ID ölçümü bu bilgiyle yapılır; gizlilik konusu 2026-08-31'de kapandı (`client-confidentiality-settled-2026-08-31`), bu bir itiraz değil, yalnız olgu.
4. **"Human Islamic reviewer"** — bu holdingde o insan sizsiniz; bir başkasını ancak siz adlandırırsınız.
5. **Yapay zekâ etiketi ve C2PA** — 2026-08-27 hükmünüz (*"yapay zeka ürünüdürü şimdilik geçelim"*, `remote-operation-and-disclosure-deferred-2026-08-27`): AB md. 50 ve C2PA işi açılmaz, "şimdilik". Plan yalnız profil cümlesi + platformun kendi etiketini öneriyor, çünkü TikTok 2026-09-24'ten beri etiketsiz gerçekçi yapay kişiyi kaldırabiliyor (§4-D); C2PA ancak ertelemeyi siz kaldırırsanız, SocialForge ücretli (B31), fiyatıyla önünüze gelir.

## 7. Sizin kararınız gereken (düz yazı; tıklama kutusu size ulaşmıyor; önerilerim "Bir sayfada"da)

1. **Sunucu kim:** kadrodan bir erkek (yeni casting çekimi, gözünüze gelir) mi, yaşlı bir teyze (önce B43 bacak (11) — motorda doğan yaşlı kadın sunucu — kurulur) mi, yoksa kadın bir sunucu için kadro kanununu değiştiriyor musunuz. Önerim: erkek, kanunun içinde.
2. **Sınır:** fotogerçekçi bir yapay karakterin namazı, Kur'an'ı, sadakayı anlatması sizin İslami sınırınızın içinde mi — bu yalnız sizin hükmünüz; plan "evet"i varsayamaz. Önerim: ilk 30 gün yalnız yaşanan pratik, öğretim sizin sözünüzle.
3. **Dinî cümle içeren her video yayından önce gözünüzden geçer** — bu planın önerisi; siz "hayır, şu koşulla makine geçirsin" derseniz L4 ona göre yazılır. Önerim: ilk 30 gün evet.
4. **Higgsfield Plus (€47–59/ay)** — L1'in Soul ID yarısı ve dış kulvar için; para çıkışıdır. Onsuz L1 yalnız tezgâh yarısıyla ölçülür ($0). Önerim: şimdi değil.
5. **Sıra:** SIGNAL Faz 0–4'ten sonra mı (masa hazır olur), yoksa şimdi elle yöntemle mi başlansın. Önerim: kimlik hemen, içerik elle, SIGNAL gelince masa.

## 8. Fazlar (onaydan sonra; `dxb-team1` ya da `dxb-crew`; kabul maddesi işten önce yazılır; kodu builder yazar; her faz tek commit)

| # | Faz | Ne | Kabul (komut → beklenen) |
|---|---|---|---|
| 0 | Gümrük | §4'teki fork adaylarının denetim raporu (dosya dosya: ağ çağrısı, dosya okuma, kabuk); STACK.md okundu | rapor dosyası; "install" sıfır; B41 kapısı yeşil |
| 1 | Cetvel + kimlik ölçümü (L1) | `creator-proof.mjs` önce; aynı sunucu, 5 senaryo × 3 yol (Soul ID yolu yalnız karar 4 "evet" ise; değilse 2) × 20 kare | ölçer her yol için bir yüzde basar; gözünüz seçer (Kanun B) |
| 2 | Persona + kimlik kartı (L2) | `dxb-persona` kapısı; JSON kart; asla-listesi; profil cümlesi | `pnpm persona:gate` yeşil; kart şeması testte |
| 3 | Skill'ler (§4-F) | `dxb-islamic-editorial` + `dxb-creator-director` + fork'lar | 20 örnek cümlede: var olmayan ayet/hadis 0 geçer; hüküm cümlesi %100 işaretlenir |
| 4 | İlk 7 video | Kanun D taslak; her biri gözünüze; hesap açma = kimlik adımı, onayınız; etiket her gönderide | 7 video · 7 açıklama satırı · dinî cümleli olanların hepsi göz kaydıyla |
| 5 | Döngü | SIGNAL Faz 8'e bağlanır; 7. gün satırları; içerik dağılımı varsayımı ölçülür | 7 videonun 7'sinde tahmin-gerçek satırı |

## 9. Maliyet

Tezgâh: $0 (elektrik dışında). Kur'an/hadis API'leri: ücretsiz olanlar seçilir (§4-D). Higgsfield Plus: €47–59/ay, **alınmadı**, sizin kararınız. Claude aboneliği: var. Yeni servis, yeni kuyruk: yok.

## 10. Bu planın yapmadıkları

- Hiçbir şey kurmaz, yüklemez, hesap açmaz; her dış skill gümrükten geçer, fork'lanır, olduğu gibi çalıştırılmaz.
- Sınırı ne genişletir ne daraltır; hüküm vermez; fetva veren karakter yazmaz.
- Gerçek bir insanın yüzünü ya da sesini kullanmaz (paketin de kuralı); yapay olduğunu saklamaz.
- Marka reklamı yapmaz (o B28'in masası); haram ürün tanıtmaz.
- Ücretsiz yol dururken ücretliyi seçmez; ücretli, fiyatıyla önünüze gelir.
