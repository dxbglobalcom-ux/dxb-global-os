# JEV — Video Corpus (Tier 1/2/3, section notes)

Not: Bu dosyadaki section notes ayrıntılı paraphrase + kısa alıntılardan (<25 kelime)
oluşur. görev1.md §4'ün verbatim-transkript-yasağı CEO tarafından sohbette kaldırıldı
(2026-09-23, "böyle bir kısıtlamayı CEO olarak kaldırdım") — bu yüzden her video için
TAM ham transkript de ayrıca `../transcripts/` altında tutulmaktadır (CLAUDE.md §1,
Kanun A: canlı CEO emri çelişeni siler). Aşağıdaki section notes hâlâ hızlı okuma
için birincil referans; ham transkript doğrulama/alıntı ihtiyacında kullanılır.

---

## V1 — "wtf is jev?" (Syntax / CJ)

- URL: https://youtu.be/QbYBRjOaGOo
- Kanal/konuşmacı: Syntax (sunucu: CJ)
- Tarih: 2026-09 (JEV lansmanından kısa süre sonra; auto-caption `en-orig` mevcuttu)
- Tür: Bağımsız teknik açıklama + demo (Tier 3 — community, ama teknik derinliği yüksek)
- Süre: ~orta uzunluk (transkript ~4000 kelime → tahmini 12-15 dk)
- Neden önemli: JEV'i sıfırdan, kod örnekleriyle anlatan en net bağımsız videolardan biri;
  SDK kullanım örneği (`state` + `choice/score/noul` tipleri) canlı gösteriliyor.
- Kapsadığı JEV özellikleri: System One/System Two ayrımı (Kahneman referansı), üç primitif
  (choice/score/noul = nule), state+questions modeli, agent pipeline'ında "ilk basamak"
  olarak JEV kullanımı, gerçek kullanıcı örnekleri (browser-use ile 7 saniyede uçuş
  rezervasyonu, 1000+ araştırma makalesini 8 sentle sınıflandırma — 256ms/sınıflandırma).

### Section notes (paraphrase)
1. **Giriş / ne olduğu**: JEV, TypeSafe AI'den (kurucu: Diogo Almeida, ChatGPT'nin RLHF
   ortak mucitlerinden) — "System One" kategorisinde, LLM DEĞİL, bir sınıflandırıcı
   (classifier)/karar motoru. VENDOR CLAIM: "geleneksel LLM'lerden 20-200x hızlı,
   40-400x ucuz."
2. **System One / System Two çerçevesi**: Kahneman'ın "Thinking Fast and Slow" kitabından
   ödünç terim — JEV hızlı/otomatik (System 1), Claude/ChatGPT/Gemini gibi LLM'ler yavaş/
   düşünen (System 2) olarak konumlandırılıyor.
3. **Girdi/çıktı modeli**: `state` (serbest metin/veri) + `questions` (sabit seçenekli
   sorular) → her soru için olasılık dağılımı. Üç soru tipi: **noul** (evet/hayır),
   **choice** (N seçenekten biri), **score** (ölçekte derecelendirme).
4. **Kod örneği**: TypeSafe SDK kurulumu, `state` olarak müşteri e-postası, `choice`/`noul`/
   `score` importları, tip-güvenli (strongly typed) çıktı — geleneksel "LLM'e dev prompt
   yaz, structured output umut et, try/catch'e sar" akışına karşı konumlandırılıyor.
5. **Neden farklı (mimari argüman)**: Bugünkü ajan mimarilerinde niyet tespiti/routing genelde
   tek dev bir LLM promptuna sıkıştırılıyor → kırılgan, hataya açık. JEV'in önerisi: her
   karar noktasında ayrı, hızlı, tipli bir çağrı; sonucu deterministik kod ile branch'le.
6. **Gerçek örnekler**: (a) Browser-use + JEV ile 7 saniyede uçuş arama/rezervasyon demo'su
   (Playwright MCP gibi ajanlara kıyasla çok daha hızlı vurgulanıyor); (b) 1000+ AI araştırma
   makalesinin kategorilere ayrılması — 8 cent toplam maliyet, 256ms/sınıflandırma
   (VENDOR/COMMUNITY DEMO CLAIM, bağımsız doğrulama yok, kullanıcı deneyimi olarak sunuluyor).
7. **Kapanış**: "Ucuz ve hızlı" mesajı tekrarlanıyor; JEV'in ajan iş akışlarında "trafik
   polisi" / ilk-basamak filtre rolü öneriliyor (sipariş durumu sorgusu → doğrudan tool call,
   belirsiz/öfkeli mesaj → insana triage, jailbreak girişimi → anında blokla).

---

## V2 — "An ex-OpenAI researcher just deleted language from the LLM..." (Fireship, The Code Report)

- URL: https://youtu.be/TbkUKCm3CHQ
- Kanal: Fireship (The Code Report segmenti)
- Tarih: video içinde açıkça belirtiliyor — **21 Eylül 2026** yayın tarihi olarak anons
  ediliyor ("It is September 21st, 2026, and you're watching The Code Report").
- Tür: Bağımsız, hızlı-tempolu teknik özet + eleştiri (Tier 2/3 sınırında — yüksek
  otoriteli bağımsız dev kanalı, ama içerik satirik/yoğun sıkıştırılmış)
- Süre: kısa (~1100 kelime transkript → tahmini 3-4 dk)
- Neden önemli: JEV'i tanıtan videoların en çok izleneni olası; hem VENDOR CLAIM'leri hem
  de ŞÜPHECİ/eleştirel sesleri (prior art iddiaları, OpenJev reproduksiyonu) aynı videoda
  bir arada veriyor — bu repo için hem Tier-1 fact hem CONFLICTS.md girdisi kaynağı.
- Kapsadığı JEV özellikleri: kimlik (Diogo Almeida, TypeSafe AI, **$40M funding** iddiası),
  "system one model" terimi, üç tip (choice/score/noul), tip-güvenlik garantisi, RLCD
  (Reinforcement Learning for Calibrated Decisions) ve "calibrated confidence" kavramı,
  determinism EKSİKLİĞİ (aynı girdi farklı sonuç verebilir), mimari gizliliği (CEO mimariyi
  açıklamıyor, paper "belki gelecekte"), prior-art eleştirisi ve OpenJev reproduksiyonu.

### Section notes (paraphrase)
1. **Kimlik/iddia**: JEV'i TypeSafe AI kurdu, kurucu eski OpenAI araştırmacısı Diogo Almeida
   (instruction-following/ChatGPT hattından). VENDOR CLAIM: $40M funding turu.
2. **Ne olmadığı**: metin yazamaz, kod yazamaz, deneme yazamaz — "large language model"
   değil; "dilin modelden silinmesi" olarak çerçeveleniyor.
3. **Hız/maliyet iddiaları**: VENDOR CLAIM — "200x daha hızlı, 400x daha ucuz, sıfır
   hallüsinasyon, output token'lar ücretsiz." Video bunu açıkça "trust-me-bro benchmarks"
   diye nitelendiriyor — yani sunucu **kendisi de** bu rakamlara şüpheyle yaklaşıyor.
4. **Tip sistemi**: üç şekil — choice, score, noul (evet/hayır). Şema ihlali "matematiksel
   olarak imkânsız" iddiası (VENDOR CLAIM) aktarılıyor.
5. **System One çerçevesi**: Kahneman referansı tekrarlanıyor; JEV=System 1 (hızlı, sezgisel),
   büyük LLM'ler (GPT, Claude) = System 2 (yavaş, çok token harcayan).
6. **Determinism uyarısı — ÖNEMLİ NEGATIVE/NUANCE bulgusu**: Video açıkça belirtiyor:
   "it's not even deterministic... you could send it the exact same question in the exact
   same context and get different results" — yani tip-güvenliği (şema garantisi) ile
   kararın DETERMİNİSTİK/DOĞRU olması FARKLI şeyler; bu ayrım DXB relevance/claims ledger
   için kritik.
7. **RLCD / kalibre güven**: JEV, "calibrated confidence" skoru veriyor (ör. %60 → "%60
   ihtimalle doğru"), bu "Reinforcement Learning for Calibrated Decisions (RLCD)" ile
   eğitildiği iddia ediliyor. VENDOR CLAIM, bağımsız doğrulama videoda YOK.
8. **Mimari gizliliği — NEGATIVE EVIDENCE**: "nobody knows for sure [how it works]... CEO
   says the architecture is staying close to the chest, with a paper possibly coming in the
   future, maybe" — şeffaflık eksikliği açıkça eleştiriliyor.
9. **Prior-art eleştirisi — CONFLICT/NEGATIVE**: Video, JEV'in "zero-shot classifier"lardan
   (ör. Jin Yang'ın on yılı aşkın süredir var olan çalışmaları) farksız olduğunu söyleyen
   eleştirmenleri aktarıyor; ayrıca bir geliştiricinin "bir yıl önce yayınladığı paper'ın
   JEV ile aynı şey olduğunu" iddia ettiğini belirtiyor (isim netleşmedi, CONFLICTS.md'ye
   "kaynağı belirsiz iddia" olarak düşülmeli).
10. **OpenJev reproduksiyonu — bağımsız kanıt**: Bir geliştiricinin, dondurulmuş bir Qwen-4B
    modelinden tek bir forward-pass'te seçenek olasılıklarını okuyarak JEV arayüzünü
    yeniden ürettiğini (OpenJev), yeni eğitim gerekmediğini, bir RTX 3090'da çalıştığını ve
    tarayıcıda çalışan bir WebGPU demosu olduğunu aktarıyor. **Bu, "JEV benzersiz bir
    mimariye mi ihtiyaç duyuyor yoksa mevcut açık modellerle mi taklit edilebiliyor"
    sorusunun doğrudan kanıtı — DXB relevance map'te mutlaka işaretlenmeli.**
11. Video reklam segmentiyle (Mux sponsorluğu) kapanıyor — JEV içeriğiyle ilgisiz, atlanabilir.

---

## V3 — "JEV Breakdown: The First AI Model Built For Code" (System One Models community site)

- URL: https://systemonemodels.org/examples/videos/jev-breakdown-the-first-ai-model-built-for-code/
- Yayın: 2026-09-16
- Tür: Video AGGREGATOR sayfası (YouTube'a link veriyor, kendi barındırdığı video değil) —
  "sitede bulunan en çok izlenen JEV videosu" olarak tanımlanıyor.
- İçerik notu: Choice/Score/Noul primitifleri TypeSafe playground'unda canlı gösteriyor,
  hız ve maliyet rakamlarını "caveat'larıyla birlikte" ele alıyor (sitenin kendi özeti).
- STATUS: Bağımsız video ID/kanal adı bu sayfadan doğrudan çıkarılamadı — orijinal YouTube
  linkini bulmak için ek arama gerekli. **TRANSCRIPT UNAVAILABLE** (kaynak sayfası video
  embed'i, transkript sağlamıyor). Bu satır 00_INDEX.md'de "eksik araştırma alanı" olarak
  işaretlenmeli.

---

## V4 — "Jev Explained: System One Models Model That Doesn't Generate Text" (AI Stack Engineer / "AI To Be Aware Of" brief)

- URL: https://www.ai-to-be-aware-of.com/videos/17466
- Kanal/konuşmacı: "AI Stack Engineer" (Building Agentic Systems)
- Tarih: 2026-09-19
- Tür: Kısa video özeti/brifing sitesi (Tier 3 — community aggregator, otomatik/AI-üretimi
  özet olma ihtimali yüksek, video'nun kendisi değil)
- İçerik: JEV'in "metin üretmeyen" doğasını, sabit soru tipi yapısını, hız/maliyet
  iddialarını ve gerçek dünya uygulamalarına hızlı adaptasyonunu özetliyor. Kurucu adını
  "Diego Almeida" olarak yazıyor (Fireship videosundaki "Diogo Almeida" ile YAZIM FARKI —
  CONFLICTS.md'ye düşülmeli, muhtemelen transliterasyon hatası, resmi kaynaktan (TypeSafe
  blog) doğrulanmalı).
- STATUS: **TRANSCRIPT UNAVAILABLE** — sayfa bir brief/analiz, orijinal video transkripti
  sağlamıyor. Orijinal YouTube kaynağı bu fork'ta bulunamadı.

---

## V5 — RepoChad Podcast: "Jev: The Schema-Safe AI That Could Change Automation Forever!"

- Orijinal YouTube: kanal `repochad` (channel id: `UCtyEhOTxGx45sljlfryc6jw`), video slug
  `vRPpQacmBe4A` — **yt-dlp bu ID ile "video unavailable" döndürdü** (11 karakterlik YouTube
  ID'sine indirgeme sırasında slug bozulmuş olabilir; kaynak sayfası
  https://readpodcast.ai/en/youtube/repochad-cUCtyEhOTxGx45sljlfryc6jw/jev-the-schema-safe-ai-that-could-change-automation-forever-vRPpQacmBe4A
  403 döndürdü, WebFetch ile erişilemedi). **Doğru video ID/URL bir sonraki araştırma
  turunda YouTube'da "RepoChad Jev" araması ile doğrulanmalı.**
- Yayın tarihi: 2026-09-16 (sayfa üstünde "9/16/2026" olarak görünüyor), 55.580 izlenme
  (o anki görüntüleme sayısı, büyüme oranı bilinmiyor).
- Tür: Bağımsız teknik podcast/breakdown kanalı (Tier 2 — "technical breakdowns of AI
  models, inference engines, backend pipelines" odaklı, ciddi teknik derinlik iddiası var)
- Neden önemli: Bulunan TÜM kaynaklar arasında en sayısal/technical olanı — spesifik
  latency aralığı, fiyatlandırma, sınırlamalar ve canlı demo isimleri (Doom bot, Wiki
  Racing) veriyor. Bölüm başlıkları (chapters) net: 0:00 Giriş, 1:12 Nasıl çalışır (RLCD,
  sıfır şema ihlali), 3:15 Hız/fiyat/routing mimarisi, 4:36 Canlı demolar, 6:03
  Sınırlamalar ve gelecek.

### Section notes (aggregator sayfasından paraphrase — kendi tam transkripti değil, üçüncü el özet)
1. **Kimlik/tez**: TypeSafe AI'nin tezi — yazılım otomasyonundaki temel darboğaz "string"in
   kendisi; çözüm metin üretimini tamamen bırakmak. JEV bir LLM değil; "distilled/küçültülmüş
   LLM" olarak adlandırılmayı da reddediyor (VENDOR framing).
2. **Mimari iddiası**: state (ham metin/kod/log) + sabit şema → TEK paralel geçişte tipli
   değer + kalibre olasılık. Uçtan uca gecikme **70-500ms** (VENDOR CLAIM).
3. **Sert sınırlar**: serbest metin/kod üretemiyor, doğrudan-seçim (direct choice) tavanı
   **255 seçenek**.
4. **"Sıfır şema hatası" iddiasının kapsamı**: iddia, çıktının HER ZAMAN doğru olduğu değil,
   arayüzün fiziksel olarak şema dışı bir şekil üretemediği anlamına geliyor — yanlış KARAR
   hâlâ mümkün (örnek: müşteri kaybı riskini "düşük" diye yanlış etiketleyebilir). Bu yüzden
   her cevaba kalibre bir olasılık ekleniyor.
5. **RLCD**: RLHF (insan tercihine göre eğitim) ve RLVR'dan (deterministik doğrulayıcılara
   göre eğitim — matematik/derleyici çıktısı gibi) farklı olarak, RLCD "bulanık iş mantığı"
   (moderasyon, routing, risk skorlama) için tasarlanmış — bu alanların ucuz programatik
   doğrulayıcısı yok.
6. **Şeffaflık eksikliği — NEGATIVE**: RLCD loss formülasyonu, mimari, parametre ölçeği,
   compute bütçesi TAMAMEN gizli tutuluyor. Eğitim verisi sadece "proprietary ve sentetik"
   olarak tanımlanıyor — dışarıdan hiçbir görünürlük yok.
7. **Fiyatlandırma (VENDOR CLAIM)**: input token'lar milyon başına 4 cent (~$42/milyar),
   output token'lar ücretsiz (paralel örnekleyici sayesinde "ölçmeye değmeyecek kadar ucuz"
   iddiası).
8. **Performans karşılaştırması — METODOLOJİ ZAYIFLIĞI (NEGATIVE)**: Öne çıkan workflow
   testlerinde JEV, GPT 5.6 Terror/GPT6 Astra/Fable 5.1 gibi "sınır" modellere karşı 193.6x
   hız, 44.6x maliyet avantajı gösteriyor İDDİASI — AMA bu rakamlar yazarın kendi
   laptopundan, ABD Batı Kıyısı'ndan, yazara coğrafi olarak yakın sunuculara ping atılarak
   ölçülmüş; karşılaştırma LLM'leri "özel bir olasılık adaptörüne sarılmış" halde
   kıyaslanmış. **Bu, DXB'nin kendi latency ölçümü yapmadan bu rakamlara güvenmemesi
   gerektiğinin doğrudan kanıtı.**
9. **Canlı demolar**: Doom bot ve Wiki Racing demoları JEV'in gerçek zamanlı karar alma
   yeteneğini göstermek için kullanılmış (detaylar bu özet sayfasında yok, orijinal video
   izlenerek doğrulanmalı).
10. **Kapanış sorusu**: Sunucu, izleyicilere JEV'in mevcut LLM routing katmanlarının yerini
    alıp alamayacağını, yoksa 255-seçenek tavanı ve katı şema gereksinimlerinin pipeline'ları
    fazla rijit hale getirip getirmediğini soruyor — açık soru, konsensüs yok.

---

## V6 — "JEV Breakdown: The First AI Model Built For Code" (Rob Shocks)

- URL: https://youtu.be/2Bs0Ink_-Uo · Kanal: Rob Shocks
- Tür: Bağımsız teknik özet (Tier 3)
- Neden önemli: Vercel gibi büyük production şirketlerinin Jev'den "olağanüstü sonuçlar" aldığını
  aktarıyor — bu bağımsız (üçüncü el) bir production-adoption iddiası, DXB relevance için not edildi.
- Bulgular: JEV'in "tek cümle bile yazamayan" ama üretimde etkileyici olan bir model olarak
  çerçevelenmesi; Vercel referansı VENDOR/COMMUNITY CLAIM — bağımsız doğrulama yok (Vercel'in kendi
  ağzından bir açıklama bu fork'ta bulunamadı — UNKNOWN, ayrı doğrulama gerekir).

## V7 — "Jev AI Is INSANE… 193× Faster Than LLMs?!" (AI WITH Rithesh)

- URL: https://youtu.be/JZknBu3u8C0 · Kanal: AI WITH Rithesh
- Tür: Bağımsız teknik özet (Tier 3), başlıktaki "?!" şüpheci bir çerçeveleme sinyali veriyor
- Sayısal detaylar (resmi rakamlarla ÇAPRAZ DOĞRULANDI): input $0.042/1M token (4.2 cent), yanıt
  süresi "yarım saniyenin altı" (70-500ms resmi rakamıyla uyumlu), "40 ila 200 kat daha hızlı,"
  "193.6x hızlı / 444.6x ucuz" (resmi blog rakamıyla birebir eşleşiyor — bu video resmi launch
  blog'unu doğrudan kaynak almış, CROSS-CONFIRMED ama BAĞIMSIZ ÖLÇÜM DEĞİL, ikincil aktarım).
  "Accuracy per dollar" ve "yaklaşık yarım yüzde" gibi ince notlar da resmi eval sayfasının
  dilini yansıtıyor.

## V8 — "Jev Ultrafast GitHub: How TypeSafe AI Makes Browser Agents Faster" (Alex Hitt)

- URL: https://youtu.be/NFKHLhAvj1g · Kanal: Alex Hitt
- Tür: Bağımsız teknik derinlemesine (Tier 2/3) — browser-agent mimarisi odaklı
- Odak: Geleneksel "algıla-düşün-eyle" (perceive-reason-act) döngüsüne dayanan vision-language
  browser ajanlarının üretimde neden kırılgan/yavaş olduğunu anlatıyor, Jev'in yapısal-state-tabanlı
  yaklaşımının bu darboğazı nasıl azalttığını tartışıyor. **DXB relevance:** `operator` skill /
  browser automation hattı için doğrudan ilgili — browser-agent hızlandırma DXB'nin kendi
  `mcp__claude-in-chrome__*` ve Playwright kullanımlarıyla örtüşen bir alan.

## V9 — "TypeSafe AI Jev vs. Laya (what they are and the controversy so far)" (Adam Gardner)

- URL: https://youtu.be/OLgiHBlDhWU · Kanal: Adam Gardner
- Tür: Bağımsız — doğrudan CONFLICTS.md'ye giren prior-art tartışmasını ele alıyor (Tier 2)
- **KRİTİK BULGU:** "Laya," Jev'den YAKLAŞIK BİR YIL ÖNCE aynı orijinal geliştirici tarafından
  yapılmış bir çözümün, Jev lansmanına tepki olarak AÇIK KAYNAK haline getirilmiş hali —
  "the original producer, maintainer, developer has open-sourced Laya because he says and feels
  that his solution was a year ago." Bu, Fireship videosundaki (V2) isimsiz "bir yıl önce paper
  yayınlayan geliştirici" iddiasını DOĞRULUYOR ve İSİMLENDİRİYOR (Laya = o proje).
  Konuşmacının kendi deneyimi: "Laya'yı kendi (zayıf) Mac'imde çalıştıramadım ama Jev'den
  gerçekten etkilendim" — yani hem prior-art tartışmasını aktarıyor hem de pratik
  kullanılabilirlik açısından Jev'i öne çıkarıyor (dengeli, iki taraflı bir kaynak).
- **DXB relevance:** Laya açık kaynak ve muhtemelen self-hostable bir alternatif — 06 DXB
  relevance map'te "vendor lock-in olmayan alternatif" sorusu için doğrudan kanıt.

## V10 — "What is Jev and How to Use it?" (Codevolution)

- URL: https://youtu.be/ZgXej_9isxY · Kanal: Codevolution (tanınmış bir eğitim/tutorial kanalı)
- Tür: Bağımsız eğitim içeriği (Tier 3, ama kanal otoritesi yüksek — yerleşik bir dev-eğitim kanalı)
- Yapı: "Jev nedir, neden çıktı, ne zaman kullanmalı, ne zaman KAÇINMALI" sorularını sırayla
  cevaplıyor — **"ne zaman kaçınmalı" bölümü explicit olarak sınırlamaları ele alıyor**, negatif
  kanıt için ayrıca taranmaya değer (bu pass'te tam işlenmedi — OPEN ITEM).
- Kaynak, launch'ın X/Twitter'da "30 milyon görüntülenme" aldığını aktarıyor (VIRALLIK İDDİASI,
  bağımsız doğrulama yok, X'in kendi analitikleri görülmedi — UNVERIFIED).

## V11 — "Jev From TypeSafe is a New Class of AI Model that is FAST and CHEAP - But There is a Caveat!" (Gary Explains)

- URL: https://youtu.be/qdji39XXgEY · Kanal: Gary Explains (bilinen, uzun soluklu bağımsız teknoloji
  açıklama kanalı — orta-yüksek otorite)
- Tür: Bağımsız teknik özet + eleştiri (Tier 2/3) — başlıktaki "But There Is A Caveat!" açıkça
  dengeleyici bir çerçeve kuruyor
- Kurucu geçmişi: "co-inventor of ChatGPT, previously worked at Google Brain and at OpenAI" —
  Google Brain geçmişi diğer video/kaynaklarda GEÇMEDİ, resmi kaynaktan (typesafe.ai/docs, Google
  Scholar profili) ayrıca doğrulanmalı — **OPEN ITEM**, muhtemelen doğru (Google Brain → OpenAI
  geçişi dönemin birçok araştırmacısında yaygın) ama bu corpus'ta ayrı doğrulanmadı.
- Başlıktaki "caveat" video içinde fiyatlandırma/kapasite sınırlarına (255 seçenek tavanı,
  metin üretememe) işaret ediyor — V5/V7 ile aynı temel sınırlamaları tekrarlıyor, yeni bir
  negatif bulgu eklemiyor (CROSS-CONFIRMATION, yeni bilgi değil).

---

## Bulunan ama VİDEO OLMAYAN, negative-evidence fork'una devredilmesi gereken kaynaklar
(Bu fork video'ya odaklı; aşağıdakiler makale/blog, video değil — repo'ya bir başka fork/parent
tarafından işlenmeli, burada sadece iz bırakıyorum:)

- `https://frutik.github.io/awesome-search/Articles/Jev-and-the-Return-of-AI-ML-Engineering` —
  "Lee" imzalı, değerlendirme/alignment mühendisi tarafından yazılmış düşmanca ama spesifik
  eleştiri. Kalibrasyon iddiasını hedef alıyor, 16.500 tahminlik bağımsız bir kalibrasyon
  testinde 8 veri setinden 7'sinde kalibrasyon başarısızlığı bulunduğunu aktarıyor (Valeriy
  M'nin çalışması, ikinci elden aktarım — orijinal doğrulanmalı). En kritik NEGATIVE EVIDENCE
  adaylarından biri.
- `https://truestandard.ai/blog/can-jev-fact-check-claims` — JEV'e 13 iddia verilip 12'sinde
  "canlı arama gerekiyor" diye reddettiğini, fact-checker olarak KULLANILAMAYACAĞINI gösteren
  bağımsız deney. TypeSafe'in kendi yayınladığı "jaggedness" (9 bilinen zayıflık) sayfası da
  burada aktarılıyor — resmi kaynaktan doğrudan doğrulanmalı (Tier 1'e taşınabilir).
- `https://zefan-cai.github.io/open-jev/` ve `https://huggingface.co/AlexWortega/openjev` —
  iki bağımsız açık-kaynak JEV reproduksiyonu (Qwen tabanlı). Video değil ama "expert
  implementations" kategorisine giriyor.

---

## Aranıp BULUNAMAYAN video türleri
- TypeSafe AI'nin KENDİ resmi YouTube kanalı / kurucu konferans konuşması: bu fork'ta
  doğrudan bulunamadı (yalnızca blog post `typesafe.ai/blog/introducing-system-one-models-
  and-jev` bulundu, video değil). **UNKNOWN — ayrı bir araştırma turu gerekir.**
- Xiaoyuzhou (Çin podcast) — kapsam dışı, aranmadı (proje kuralı).
