# JEV (TypeSafe Jev) — Community Discussion (Tier 3, COMMUNITY OBSERVATION)

Toplama tarihi: 2026-09-23. Reddit (opencli), HN algolia API üzerinden toplandı. Twitter/X'te
doğrudan Jev'e özel arama yapılamadı (zaman kısıtı) — bu UNKNOWN, "Twitter'da tartışma yok" DEĞİL.

## Reddit bulguları

1. **r/codex — "typesafe ai jev is 100x cheaper than luna-max and terra-high and 71x faster"**
   https://www.reddit.com/r/codex/comments/1whmrui/ — 2026 (Just_Lingonberry_352), 49 yorum.
   Yazarın kendi sözü: **"honestly im doubtful if this is even real... I am skeptical"** —
   şüpheci bir başlangıç noktası, VENDOR CLAIM'in topluluk tarafından sorgulandığının kanıtı.
   Referans verdiği r/typesafe_ai postu: "this is too good to be true" (1whmmkl) — subreddit'in
   kendi adı "r/typesafe_ai" var, yani şirketin/topluluğun resmi-yakın bir subreddit'i mevcut.

2. **r/SideProject — "I built a side project to test TypeSafe's Jev model... scores your project idea"**
   https://www.reddit.com/r/SideProject/comments/1wiw6tk/ (stemonte), score 242, 131 yorum —
   EN YÜKSEK ETKİLEŞİMLİ bulunan post. POZİTİF/nötr: "runs all requests in parallel and returns
   a score... doesn't talk, only numerical/quantitative output." Bağımsız demo: killmyidea.stemonte.io.
   Bu, gerçek 3.parti implementasyon örneği — DXB relevance map'e girebilir (idea/proje skorlama).

3. **r/aigossips — "Jev can give you the wrong answer and still meet its 'zero hallucinations' claim"**
   https://www.reddit.com/r/aigossips/comments/1wkmpij/ (call_me_ninza), score 13, 10 yorum.
   **EN ÖNEMLİ BULGU — VENDOR CLAIM vs gerçek anlam ayrımı:**
   - TypeSafe'in "zero hallucinations" iddiası şu anlama geliyor: Jev, önceden tanımlanmış
     seçenek kümesinin DIŞINA çıkamaz (yeni bir kategori "uyduramaz"), AMA yine de VERİLEN
     seçeneklerden YANLIŞ olanı seçebilir. Yani "hiç halüsinasyon yok" ≠ "hiç yanlış cevap yok" —
     pazarlama dili teknik gerçeği yanıltıcı şekilde basitleştiriyor. **Bu CLAIMS_LEDGER'a
     VENDOR CLAIM olarak, ve bu Reddit yorumu da COMMUNITY OBSERVATION/clarification olarak girilmeli.**
   - Eğitim yöntemi RLCD (Reinforcement Learning for Calibrated Decisions) doğrulandı (2. kaynaktan
     bağımsız, flaviocopes.com'daki teknik derinlemesine incelemeyle örtüşüyor — CROSS-CONFIRMED).
   - **ÇELİŞKİ NOTU:** Bu yorum "published evaluation checks agreement with reference models
     across four workflows" diyor — yani TypeSafe'in YAYINLANMIŞ bir eval'i VAR. Bu,
     jev-negative-evidence.md madde 1'deki backnotprop iddiasıyla ("TypeSafe skipped published
     evals in this release") ÇELİŞİYOR. CONFLICTS.md'ye taşınmalı: olası açıklama — backnotprop'un
     bahsettiği "bu release"deki eval'ler ile bu yorumdaki "dört workflow'da referans model
     karşılaştırması" farklı şeyler olabilir (release-specific eval yok ama genel model card eval'i var).
   - **Kurucu ipucu:** Yorumda link verilen newsletter başlığı: "why someone who helped build
     ChatGPT went on to build Jev" (ninzaverse.beehiiv.com) — TypeSafe kurucusunun OpenAI/ChatGPT
     geçmişi olduğuna dair bağımsız bir iddia. Resmi kaynaklarla (jev-official-company.md) çapraz
     doğrulanmalı — bu fork bunu doğrulamadı, sadece LEAD olarak not ediyor.

## Twitter/X

Zaman kısıtı nedeniyle bu fork'ta taranmadı. **UNKNOWN — ayrı bir araştırma turu gerekir.**

## Genel değerlendirme

Reddit'teki en dikkat çekici desen: topluluk TypeSafe'in performans/maliyet iddialarına karşı
**şüpheci** yaklaşıyor ("too good to be true", "doubtful if this is even real") — bu, VENDOR CLAIM
kategorisinin neden ayrı tutulması gerektiğini doğrudan destekliyor. Aynı zamanda gerçek bağımsız
implementasyon örnekleri de var (idea scoring side-project) — ürün gerçek kullanım görüyor, sadece
iddialarının doğrulanması bağımsız/akademik düzeyde henüz yok.
