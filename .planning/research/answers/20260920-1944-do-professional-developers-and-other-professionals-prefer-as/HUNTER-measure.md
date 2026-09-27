Yeterli. Artık raporu hazırlıyorum.

---

**HUKUM:** Bağımsız toplam endekslerde (Artificial Analysis) Fable 5.1 önde, ama OpenAI'nin kendi yayınladığı 11 spesifik/dar bench'te Astra kazanıyor ve görev başına maliyeti 2-2,4x daha düşük — "kim daha iyi" sorusunun tek bir cevabı yok, hangi ekseni ölçtüğünüze bağlı; ikisi de aynı gün grid'de zıt yönlere işaret ediyor.

**A) WHAT I READ**

- **DataCamp**, "GPT-6 Astra vs Claude Fable 5.1: Benchmarks and Pricing", 5 Eylül 2026 — tam makale (47.492 bayt, scrapling-stealth ile canlı çekildi), 14 kalem karşılaştırma tablosu + fiyatlandırma tablosu içeriyor. https://www.datacamp.com/blog/gpt-6-astra-vs-claude-fable-5-1
- **Artificial Analysis** resmi model karşılaştırma sayfası, 20 Eylül 2026'da canlı çekildi (22.024 bayt). https://artificialanalysis.ai/models
- **YouTube**, Agentic Ai kanalı, "GPT-6 Astra vs Claude Fable 5.1: It Won 11 Tests and Still Lost" — 9 dakika 22 saniyelik transkriptin tamamı (yaklaşık 872 görüntülenme), ~11 Eylül 2026 yayınlandı. https://www.youtube.com/watch?v=WFxYFiZVuVU
- **Reddit** (sentinel-team.org arşiv aynası üzerinden, doğrudan Reddit erişimi kapalı kapıydı), AA Intelligence Index'e atıfta bulunan iplik, 5 Eylül 2026 anlık görüntüsü. https://reddit.sentinel-team.org/posts/1w7r3u1/snapshots/2026-09-05T05%3A50%3A11.938816Z
- **Ground sweep** dosyalarından (`google.raw`, `google-deep.raw`, `exa.raw`, `firecrawl.raw`) — hiçbiri kendisi bir skor tablosu içermiyordu, sadece bu iki ana kaynağa (DataCamp, Artificial Analysis) işaret ediyorlardı; onları takip ederek asıl sayılara ulaştım.
- **Zhihu** (`zhihu.raw`) — 10 başlık listelendi (ör. "如何评价 Anthropic 发布的 Claude Fable 5.1?"), ama zaman bütçesi nedeniyle tam metinlerini çekmedim; sayısal skor barındırmıyorlardı, görüş yazıları.

**B) THE COUNT** (n=14 doğrudan karşılaştırılan bench satırı, DataCamp/YouTube'da çapraz doğrulanmış)

| Kazanan | Bench sayısı | Hangileri |
|---|---|---|
| **Astra** | 11/14 | FrontierMath Tier4 v2 (97,6 vs 87,8), GPQA Diamond (96,0 vs 93,7), Terminal-Bench Science 0.1 (64,6 vs 52,6), DeepSWE v1.1 (74,1 vs 67,4), Terminal-Bench 4.0 (57,7 vs 55,8), FrontierCode 1.1 (53,3 vs 50,9), OSWorld 2.0 (72,6 vs 70,2), ScreenSpot-Pro (92,7 vs 87,3), BenchCAD (95,9 vs 84,3 — metodoloji şaibeli, aşağıya bkz.), AutomationBench (41,4 vs 31,4), ExploitBench (100 vs 70) |
| **Fable 5.1** | 3/14 | Humanity's Last Exam+tools (65,0 vs 57,2), AA Intelligence Index max effort (66 vs 61), AA Coding Agent Index (70 Claude Code'da vs 67 Codex'te) |

Maliyet: AA Intelligence Index görev başı — Astra $1,67 / Fable $3,76 (max effort); xhigh'ta $1,20 / $2,72. Fable, Astra'nın **2,25 katı** maliyetli aynı endekste.

**C) THE VOICES**

1. "Claude Fable 5.1 (max with fb) scores about two points above GPT-6 Astra (max) on AA's Intelligence Index, but costs roughly 2.4x as much per benchmark task." — Reddit kullanıcısı (handle arşivde N/A), 5 Eylül 2026. https://reddit.sentinel-team.org/posts/1w7r3u1/snapshots/2026-09-05T05%3A50%3A11.938816Z
2. "Astra wins the published coding rows by a nose and wins the efficiency argument outright, while Fable 5.1 holds the only independent coding-agent score that clears them both." — DataCamp editöryal metni, 5 Eylül 2026. https://www.datacamp.com/blog/gpt-6-astra-vs-claude-fable-5-1
3. "OpenAI's own benchmark table has Astra ahead of Fable 5.1 almost everywhere, while Artificial Analysis, an independent evaluator, has Fable 5.1 ahead on both of its flagship indices." — aynı DataCamp kaynağı.
4. "Astra has 11 locked-in benchmark wins. But here is the twist... Fable 5.1 still retains the top position in broad, independently aggregated intelligence and coding evaluations." — Agentic Ai (YouTube), 5:13. https://www.youtube.com/watch?v=WFxYFiZVuVU
5. "If you look closely at the footnote for the BenchCAD evaluation in OpenAI's own launch materials, you find a major disclosure: OpenAI evaluated Claude using modified settings, rather than Anthropic's native defaults." — aynı video, 7:31-7:52.
6. "This chart shows the public leaderboard for the deep-sui coding benchmark, ranking Meta's Muse Spark in first place at 75.4%. GPT-6 Astra sits in second at 74.1% and Claude Fable trails in third." — aynı video, 8:43-8:56 (üçüncü aktör karşı-örneği).
7. AA resmi SSS metni (canlı sayfa, 20 Eylül 2026): "Claude Fable 5.1 (Adaptive Reasoning, Max Effort, Default Fallback) currently leads the Artificial Analysis Intelligence Index with a score of 53." https://artificialanalysis.ai/models — **not:** bu "53" rakamı DataCamp'in aktardığı "66"dan farklı; muhtemelen endeks versiyonu (v4.3.2 vs sayfanın statik SSS metninde kalmış eski bir anlık görüntü) uyuşmazlığı — bkz. Blok F.

**D) CLOSED DOORS**

- `lmarena.ai/leaderboard` — JS ile render edilen tablo, statik fetch sadece iskelet HTML'i döndürdü (52.242 bayt, sıfır Astra/Fable eşleşmesi). Tarayıcı kapısı (opencli browser) denenmedi, zaman bütçesi ayrıldı.
- `arxiv`, `crossref`, `europepmc`, `openalex` (ground sweep) — dördü de sadece sorgu metnini yankıladı, alakalı akademik makale yok (beklenen: bu marka isimleri haftalar önce çıktı, akademik literatür henüz yetişmedi).
- `github-issues`, `github-repos`, `github-trending` (ground sweep) — `.judge` dosyasında "OK" işaretli ama içerik taramasında Astra/Fable'a dair sıfır satır.
- `producthunt` (ground sweep) — sadece sorgu metni geri döndü, alakalı içerik yok.
- `quora-forums` (ground sweep) — "We couldn't find any results for..." — Quora'da bu spesifik sorgu için sonuç yok.
- `duckduckgo`, `duckduckgo2`, `hackernews`, `medium`, `substack`, `v2ex`, `weibo`, `producthunt`, `linux-do`, `lobsters`, `juejin`, `linkedin` (ground sweep `.judge`) — BROKEN olarak işaretlendi (araç hatası), denenmedi.
- Zhihu'daki 10 başlık listelendi ama tam cevap metinleri çekilmedi (zaman/bütçe tercihi — başlıklar sayısal skor içermiyordu).

**E) DISTINCT PEOPLE:** 2 (Reddit'te AA endeksine atıf yapan anonim kullanıcı + YouTube video anlatıcısı/analisti). Geri kalan veri kurumsal/vendor kaynaklı (DataCamp editöryal, Artificial Analysis otomatik SSS metni, OpenAI/Anthropic'in kendi yayınladığı tablolar) — bunlar "insan görüşü" değil, ölçüm verisi.

**F) WHAT WOULD FLIP IT**

Üç şey sonucu tersine çevirebilir: (1) **BenchCAD metodoloji şaibesi** — OpenAI'nin Claude'u kendi varsayılan ayarları yerine "modified settings" ile test ettiği itirafı (video 7:31), Astra'nın 11 kazanımından en az birinin adil olmayabileceğini gösteriyor — bunu araştırdım (transkript üzerinden), ama BenchCAD'in orijinal OpenAI launch sayfasındaki tam dipnot metnini doğrudan çekmedim. (2) **AA Intelligence Index sürüm çelişkisi** — DataCamp "66 vs 61" diyor (v4.3.2, 5 Eylül), canlı AA sayfasının statik SSS metni "53" diyor (20 Eylül) — bu ya endeks yeniden kalibre edildi ya da SSS metni JS grafiklerinden geride kaldı; bunu araştırmadım, çözülürse hangi modelin "resmi" lider olduğu değişebilir. (3) **Meta Muse Spark 1.3** DeepSWE'de ikisini de geride bırakıyor (75,4 vs Astra 74,1 vs Fable 3.) — "Astra mı Fable mı" sorusunun kendisi yanlış çerçeveli olabilir; bunu sadece tek bir video aktarımından aldım, birincil deep-sui leaderboard sayfasını doğrudan görmedim.