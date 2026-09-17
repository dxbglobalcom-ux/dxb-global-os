# ARAŞTIRMA RAPORU — Ölçüm Lane'i (leaderboard, benchmark, kurumsal veri, sayı yayınlayan sayfalar)

## A) NE OKUDUM

Zemin (ground/ground-2/ground-3) klasörlerini önce taradım — kendi lane'im için asıl değerli malzeme **ground-2/exa.raw** (60.499 byte, 8 makale) ve **ground-3/exa.raw** (57.021 byte, 8 makale) dosyalarındaydı; ground-3/google-deep.raw ise bu makalelere giden 12+ arama sonucunu doğruladı. arxiv.raw / crossref.raw / europepmc.raw akademik kanalları da açıktı ama sorgu Türkçe cümle kelimelerine bölündüğü için (`all:kodlama OR all:ajanlari OR...`) alakasız sonuçlar döndürdü — bu üç akademik API'de konuyla ilgili tek bir makale bulamadım. github-repos.raw/github-issues.raw sadece repo/issue başlıkları, sayısal veri taşımıyordu.

Fiilen okuduğum 16 ayrı, tarihli, yazarlı ölçüm/karşılaştırma makalesi:
1. contracollective.com (27 Ağu 2026) — Terminal-Bench 2.1 skorları + JetBrains verisi sentezi
2. blog.jetbrains.com, Mikhail Bogdanov (1 Ağu 2026) — JetBrains Developer Ecosystem Survey, birincil kaynak
3. langchain.com State of Agent Engineering (12 Haz 2026) — 1.300+ kişilik anket
4. levievs.com, Vadim Leviev (18 May 2026) — 6 aylık production merge/defect verisi
5. keyholesoftware.com (2 Eyl 2026) — SDLC evre bazlı adopsiyon
6. northflank.com (7 May 2026) — kurumsal pilot→production oranları
7. theagenticprotocol.com, TheAgenticHQ (22 Tem 2026) — Anthropic 2026 enterprise raporu vaka çalışmaları
8. gautamkhorana.com, Gautam Khorana (1 May 2026) — 6 aylık kişisel kullanım günlüğü
9. codecourier.dev, Nico Jaroszewski (28 Ağu 2026) — fiyat karşılaştırması
10. guntherpopp.de (6 Ağu 2026) — kontrollü A/B görev testi (Opus 5 / GPT-5.6 / Grok 4.5)
11. codewithseb.com, Sebastian Sleczka (19 Nis 2026) — token/süre/rework tablosu
12. braingrid.ai, Nico Acosta (17 Tem 2026)
13. dev.to/unfiltered_anshul (8 Eyl 2026) — tek görev karşılaştırması
14. dev.to/bilalshahdev (16 Eyl 2026)
15. dev.to/maxstravion (16 Eyl 2026) — token/maliyet telemetri raporu (Codex+Claude)
16. medium.com/design-bootcamp, Debashis Nayak (24 Mar 2026)

Google-deep sonuçlarındaki 30+ ek karşılaştırma makalesi (medium/writertripathi, vallettasoftware, levelup.gitconnected, nxcode.io, sobonix.com, morphllm.com, verdent.ai) başlık/snippet düzeyinde görüldü ama tam metni açılmadı — zaman bütçesi diğer 8 kaynağa ayrıldı.

## B) SAYIM (n=16 makale, kurumsal/anket verisi ile çapraz doğrulanmış)

**Adopsiyon (JetBrains, Mayıs–Tem 2026, en güvenilir birincil kaynak):**
- Profesyonel geliştiricilerin **%90**'ı haftada en az bir kez AI kodlama ajanı kullanıyor, **%68**'i günlük kullanıyor
- **Claude Code**: %18 (Ocak 2026) → **%39** (May-Tem 2026) küresel; ABD'de **%47**; kullanıcıların **%31**'i için "en çok kullanılan tek araç" (kullanımdan-birincil-araca dönüşüm ~%80)
- **Codex**: farkındalık %27→%65, kullanım %3→**%16** (yaklaşık 5x büyüme)
- **GitHub Copilot**: kullanım %29→**%21** (düşüş), farkındalık hâlâ %79 (en yüksek)
- **Cursor**: farkındalık %69→%75 ama kullanım %18→**%12** (düşüş); Çin'de %28→%16 (en sert düşüş)
- **OpenCode** (açık kaynak): %7 kullanım, %42 mindshare
- **Google Antigravity**: %6, Hindistan'da %10→%15 (Cursor'a yakın)

**Benchmark yakınsaması (Terminal-Bench 2.1, Artificial Analysis, Ağu 2026):** GPT-5.6 Sol ~%89,5, Claude Opus 5/Claude Code ~%89,1, Grok 4.6 ~%88,4 — 1 puanlık fark, "gürültü" olarak nitelendiriliyor.

**Production'a geçiş oranları:** Northflank'e göre kurumsal AI agent pilotlarının **%88'i asla production'a geçmiyor**; Gartner 2027'ye kadar agentic AI projelerinin **%40+'ının iptal edileceğini** öngörüyor. LangChain anketinde (n=1.300+) **%57,3'ü** production'da agent çalıştırıyor (geçen yıl %51). Keyhole Software: sadece **%13'ü** tam SDLC boyunca AI kullanıyor, **%22'si** gerçek "coding agent" (basit otomatik tamamlamanın ötesinde) dağıtmış.

**Bağımsız görev testleri (token/süre/rework, tekrarlanan üç ayrı kaynakta benzer desen):**
- codewithseb.com: Claude Code 33K token/47sn/%0 rework vs Cursor 180K/52sn/%0 vs Codex 95K/4dk12sn/%0 (basit görev); debug görevinde Claude Code %0 rework, Cursor %20, Codex %50
- dev.to/unfiltered_anshul: Claude Code 42dk/$0,15/2 küçük düzeltme; Cursor 28dk/$0,08/3 düzeltme; Codex 35dk/$0,03/5 düzeltme
- guntherpopp.de kontrollü test: Opus 5 ~80dk (en kapsamlı, 155 otomatik test) / GPT-5.6 Codex ~35dk (üretime hazır değildi, düzeltme gerekti) / Cursor+Grok 4.5 ~10dk (%5 aylık bütçe, en hızlı ama en az test)

## C) SESLER (verbatim alıntılar, yazar + tarih)

1. "Claude Code has continued to grow at an unprecedented pace... It is used twice as often as GitHub Copilot" — Mikhail Bogdanov, blog.jetbrains.com, 1 Ağu 2026
2. "88% of enterprise AI agent pilots never reach production. Gartner predicts over 40% of agentic AI projects will be canceled by 2027 due to unclear business value and inadequate risk controls, not model quality." — northflank.com, 7 May 2026
3. "A one point spread at the top of a benchmark is not a ranking, it is a tie, and it means the benchmark has stopped being a useful way to pick a tool." — contracollective.com, 27 Ağu 2026
4. "On our cross-file refactors, the merge-unchanged rate for both Cursor and Claude Code sits between 26% and 31%, roughly two to three times Copilot rate on the same class of work." — Vadim Leviev, levievs.com, 18 May 2026
5. "Two other vendors removed after eight weeks: merge rate below 18%, defect-escape rate too high to justify the seat cost." — Vadim Leviev, levievs.com, 18 May 2026
6. "I ran about £340 worth of Claude API calls in February alone... That's not ruinous, but it needs to go on the invoice somewhere." — Gautam Khorana, gautamkhorana.com, 1 May 2026
7. "Codex CLI (OpenAI) was the cheapest per task (~$0.03 in API costs vs ~$0.12 for Claude). It produced working code but needed the most manual patching." — dev.to/unfiltered_anshul, 8 Eyl 2026
8. "Cursor with Grok 4.5 surprised me the most... xAI's positioning of the model as 'comparable to Opus, but much faster' is still somewhat too optimistic, but the direction is right." — guntherpopp.de, 6 Ağu 2026
9. "Quality is the production killer, with 32% citing it as a top barrier... 46% of companies say connecting agents to their actual systems is the hardest part." — Debashis Nayak (LangChain verisini aktarıyor), medium.com, 24 Mar 2026
10. "Activations that issued waits accounted for more than a quarter of the parent's recorded tokens." — dev.to/maxstravion, 16 Eyl 2026 (Codex çoklu-worker telemetri raporu)

## D) KAPANAN KAPILAR

- **arxiv.org API**: sorgu Türkçe soru cümlesinin tek tek kelimelerine bölünmüş (`all:kodlama OR all:ajanlari OR...`), sonuç tamamen alakasız (NTIRE 2026 görsel tespit yarışması vb.) — konuyla ilgili tek makale yok.
- **crossref.raw / europepmc.raw**: aynı bozuk sorgu sorunu, akademik hakemli kaynak bulunamadı.
- **google.raw (ground/ground-3)**: JSON parse hatası ("Expecting value") — dosya bozuk/boş geldi, google-deep.raw'dan telafi edildi.
- **github-trending.raw**: genel trend listesi, "AI coding agent üretim kullanımı" ile doğrudan ilgisiz sonuçlar (Ghidra, Tinycast vb.) döndürdü.
- Google-deep'te listelenen ~10 ek karşılaştırma makalesi (vallettasoftware, morphllm, nxcode.io, sobonix, verdent.ai, medium/writertripathi, medium/hamzaaziz) yalnızca başlık/snippet düzeyinde görüldü, tam metin çekilmedi — zaman bütçesi kısıtı nedeniyle "okunmadı" sayılmalı.

## E) OKUNAN AYRI KİŞİ SAYISI

**16** — hepsi isimli/tarihli yazarlı ölçüm/karşılaştırma makalesi (blog yazarı, teknik analist). Bu lane "crowd" (Reddit/X yorumları) değil "measurement" (sayı yayınlayan sayfalar) olduğu için kişi sayısı düşük ama her biri doğrudan test verisi veya birincil anket verisi taşıyor; JetBrains ve LangChain raporları ayrıca 1.300+ ve on binlerce geliştiriciyi temsil eden anket sonuçları içeriyor (bu, 16 rakamına dahil değil, ayrıca not edilmeli).

## F) SONUCU TERSİNE ÇEVİRECEK BULGU

En kritik gerilim şu: **Terminal-Bench 2.1'de üç model (GPT-5.6 Sol, Claude Opus 5, Grok 4.6) 1 puan farkla eşit** — yani "hangisi en iyi" sorusunun benchmark cevabı yok, cevap workflow uyumuna kayıyor. Bunu tersine çevirecek bulgu: Eğer bir sonraki Terminal-Bench veya SWE-bench turunda modellerden biri **5+ puanlık** bir sıçrama yaparsa (ör. bir sonraki Opus/GPT sürümü), "hepsi eşit, seçim workflow'a bağlı" anlatısı çöker ve adopsiyon verisi (JetBrains %39 Claude Code) yeniden ham yetenek skoruna göre şekillenebilir. Bunu aradım ama Eylül 2026 itibarıyla (bugünün tarihi) böyle bir sıçrama bildiren kaynak bulamadım — mevcut veri "yakınsama" anlatısını destekliyor. İkinci potansiyel çevirici: Northflank'in "%88 pilot production'a geçmiyor" rakamı sadece genel "enterprise AI agent" için, spesifik olarak "coding agent" alt kümesi için ayrıştırılmış bir oran bulamadım — bu ayrım netleşirse kodlama ajanlarının production-geçiş oranı görünenden çok daha yüksek çıkabilir.