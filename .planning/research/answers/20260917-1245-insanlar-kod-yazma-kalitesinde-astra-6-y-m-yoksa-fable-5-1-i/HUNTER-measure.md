All confirmed. I have enough to compile my measurement-lane report now.

## A) NE OKUDUM

- **ZenMux blog** (zenmux.ai, 2026-09-11, ~2.400 kelime): OpenAI'ın yayınladığı 7 benchmark tablosu + fiyat/bağlam karşılaştırması — tam okundu.
- **Contra Collective blog** (contracollective.com, 2026-09-04, ~1.500 kelime): Terminal-Bench 4.0 / Science 0.1 / DeepSWE karşılaştırması + Opus 5 referans skoru — tam okundu.
- **Arbisoft blog** (arbisoft.com, 2026-09-07, exa.raw'dan): Artificial Analysis Coding Agent Index + Arena WebDev leaderboard + maliyet/token tablosu — tam okundu.
- **Zenmux/Arena.ai blog parçası** (parallel.raw, 2026-09-17): Arena.ai'nin "Image-to-WebDev" leaderboard'unun 16 Eylül 2026 yenilemesi — tam okundu.
- **dev.to** (Dylan Foster, tarihsiz/Eylül 2026, sayfa 03-dev.to.md, 205 satır): 8 ayrı benchmark tablosu (kodlama + akıl yürütme) — tam okundu.
- **AlphaSense** (alpha-sense.com, Daniel Campos, 2026-09-14, parallel.raw'dan alıntı): karar-destek/araştırma değerlendirmesi, kod kalitesi değil ama ilgili — kısmen okundu (alıntı).
- Akademik kapılar (arxiv, crossref, openalex, europepmc) her iki dilde de tarandı — **sıfır ilgili sonuç** (aşağıda D).
- github-issues, github-repos, hackernews, stackoverflow — **boş `[]`** döndü, konuyla ilgili hiçbir kayıt yok.

## B) SAYIM (n=6 bağımsız/yarı-bağımsız ölçüm kaynağı, kod kalitesi eksenli)

| Ölçüt | Kaynak | Astra | Fable 5.1 | Kazanan |
|---|---|---|---|---|
| Terminal-Bench 4.0 | OpenAI (ZenMux/Contra/dev.to) | 57.7–57.9% | 55.8% | Astra (dar fark) |
| DeepSWE v1.1 | OpenAI (ZenMux/dev.to) | 74.1% | 67.4% | Astra |
| Terminal-Bench Science 0.1 | OpenAI | 64.6% | 52.6% | Astra (belirgin) |
| AutomationBench | OpenAI | 41.4% | 31.4% | Astra |
| GPQA Diamond / FrontierMath | OpenAI | 96.0% / 97.6% | 93.7% / 87.8% | Astra |
| Humanity's Last Exam (araçlı) | OpenAI+Anthropic | 57.2% | 65.0% | **Fable** |
| Anthropic'in kendi CursorBench 3.2.0 | Anthropic | — | 73.4% | Fable (kendi ölçümü) |
| Artificial Analysis Coding Agent Index | Arbisoft/AA | 67 (Codex) | 70 (Claude Code) | **Fable** |
| Artificial Analysis Intelligence Index v4.2 | Arbisoft | 55 | 57 | Fable (dar) |
| Artificial Analysis Intelligence Index (dev.to'nun aktardığı sürüm) | dev.to | 61.2 | 65.7 | Fable — **iki kaynak farklı sayı veriyor, aynı endeks adı altında** |
| Arena WebDev leaderboard (5 Eylül) | LMArena, 650k+ oy / 126 model | 1.797 | 1.762 | Astra (dar) |
| Arena.ai Image-to-WebDev (16 Eylül yenileme) | Arena.ai | 1.733 (#1) | 1.710 (#2) | Astra (dar) |
| Ortalama görev başı maliyet | AA (Arbisoft) | $4.72 | $9.18 | Astra (~2× ucuz) |
| Görev başı token | AA (Arbisoft) | 4.0M | 7.1M | Astra |
| Görev başı süre | AA (Arbisoft) | 26.8 dk | 24.0 dk | Fable (biraz hızlı) |

**Genel tablo (n=6 kaynak, kod-spesifik karşılaştırma yapan): 4/6 kaynak net ağırlığı Astra'ya veriyor (OpenAI'ın kendi yayınladığı seri + iki Arena/LMArena leaderboard'u); 2/6 kaynak (Artificial Analysis'i öne çıkaranlar) ağırlığı Fable'a veriyor.** Hiçbir kaynak "kesin kazanan" demiyor — hepsi "maliyete ve iş yüküne göre seç" sonucuna varıyor.

## C) SESLER (verbatim alıntılar, benchmark yazarlarından)

1. *"On Terminal-Bench 4.0, Astra reads 57.7 percent against Fable 5.1 at 55.8 percent... Read it as a tie on capability, not a decisive win for Astra."* — Contra Collective, 2026-09-04
2. *"A public leaderboard scored under someone else's conditions is a hypothesis, not a decision."* — Contra Collective, 2026-09-04
3. *"Fable 5.1 leads the Artificial Analysis Coding Agent Index 70 to 67. Astra leads Arena's WebDev leaderboard 1,797 to 1,762."* — Arbisoft, 2026-09-07
4. *"No published benchmark measures whether a software team will accept either model's code without revision."* — Arbisoft, 2026-09-07
5. *"GPT-6 Astra secured the top rank with a score of 1733 points. Claude Fable 5.1 followed closely at 1710 points."* — Arena.ai leaderboard yenilemesi, 2026-09-16
6. *"Anthropic reports a 73.4% result on its own CursorBench 3.2.0 evaluation and describes Fable 5.1 as its most capable model for ambitious coding projects."* — dev.to / Dylan Foster
7. *"Fable 5.1 posts the best evidence score we have recorded and ties Opus 5, our production model, with no statistically significant gap... with 31% fewer searches, 43% fewer steps, and 47% fewer tokens."* — Daniel Campos, AlphaSense, 2026-09-14
8. *"These results support task-specific routing rather than a blanket winner."* — ZenMux, 2026-09-11
9. *"A benchmark point that costs more to earn is not the same point."* — Contra Collective, 2026-09-04
10. *"Cost per completed job depends on measured token consumption and success rate for the target workload."* — ZenMux, 2026-09-11

## D) KAPANAN KAPILAR

- **arxiv (TR sorgu)**: 7.321 sonuç ama alakasız — anahtar kelime araması "astra", "fable" gibi genel kelimeleri robotik/kozmoloji makaleleriyle eşleştirdi. **Kapalı** (alakasızlık).
- **arxiv (EN sorgu)**: aynı sorun — Astra adlı robotik makaleleri, Fable simülasyonları (astrofizik) döndü, ilgili tek makale yok. **Kapalı**.
- **openalex**: TR sorguda joker karakter hatası verdi; EN sorguda `count: 0`. **Kapalı** (konu akademik literatürde yok).
- **europepmc**: TR'de 0 sonuç; EN'de 1 alakasız tıp özeti (beslenme kongresi). **Kapalı**.
- **crossref**: 4 milyon+ sonuç ama en üstteki 5 kayıt bile alakasız (GPT-4 ders kitapları). Bu konu — iki modelin Eylül 2026 lansmanı — akademik yayın döngüsüne henüz girmemiş, beklenen bir kapanış. **Kapalı**.
- **github-issues / github-repos / hackernews / stackoverflow (API kanalları)**: hepsi boş `[]` döndürdü — konuyla ilgili hiçbir mühendislik forumu kaydı API üzerinden gelmedi. **Kapalı** (not: Reddit/Twitter/dev.to gibi başka kanallar aynı konuyu doldurdu, bu yüzden konu "yok" değil, bu API'lerin kapsamı dar).
- **LMArena'nın kendi metin/kodlama arena'sı (chat.lmsys.org tarzı klasik Elo tablosu)**: taranan hiçbir dosyada doğrudan bulunamadı — sadece üçüncü taraf blogların *aktardığı* Arena WebDev / Image-to-WebDev sayıları var. Kaynağın kendisi ziyaret edilmedi. **Yarı-kapalı** — sayı var ama birincil kaynak yok, ikinci elden.
- **SWE-bench Verified** (kod ajanlarının en çok atıf alan bağımsız leaderboard'u): toplanan hiçbir dosyada bu isim hiç geçmiyor. Bu, ölçüm setindeki gerçek bir boşluk.

## E) OKUNAN AYRI İNSAN SAYISI

Bu bir ölçüm/benchmark taraması olduğu için "kalabalık" değil, **isimlendirilmiş yazar sayısı: 2** (Daniel Campos — AlphaSense; Dylan Foster — dev.to) + **isimsiz kurumsal yazarlık: 3** (ZenMux ekibi, Contra Collective ekibi, Arbisoft ekibi) + **1 otomatik/kurumsal leaderboard** (Arena.ai — insan yazarı yok, otomatik skor). Toplam 6 farklı yayıncı kaynağı, insan sesi olarak 2 isimli yazar.

## F) NEYİ ÇEVİRİRDİ

Bulguyu tersine çevirecek şey: **SWE-bench Verified'ın kendisine gitmek** (bu ölçüm setinde hiç yok) — çünkü topluluğun en çok güvendiği bağımsız kod-ajanı leaderboard'u bu, ve iki modelin de orada nerede durduğunu hiçbir kaynak aktarmıyor. İkinci kırılma noktası: Artificial Analysis Intelligence Index'in **iki farklı kaynakta iki farklı sayı** vermesi (Arbisoft: 55/57, dev.to: 61.2/65.7) — bu ya sürüm farkı (v4.2 vs başka) ya da bir kaynağın hatası; ben bunu doğrulamak için Artificial Analysis'in kendi sitesine gitmedim (lanem "arama motorları/API" idi, canlı site ziyareti yapmadım). Bunu aramaya gittim mi? **Hayır** — süre/kapsam sınırım nedeniyle birincil kaynağa (artificialanalysis.ai, lmarena.ai) doğrudan gitmedim, sadece üçüncü taraf blogların aktardığı sayılarla çalıştım. Bu, raporun en zayıf noktası.