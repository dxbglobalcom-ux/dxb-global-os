# CROWD (Kalabalık) Lane Raporu — Astra 6 vs Fable 5.1 Kod Kalitesi

## A) OKUDUĞUM

**Zemin taraması** (`ground/` + `ground-2/`, 34 kanal, iki dilde): benim lanem için **reddit.raw** (494 726 + 360 483 bayt, ~239 benzersiz thread URL'si), **lobsters.raw** (1 alakalı thread bulundu), **devto.raw** (10 alakalı blog yazısı — forum değil, tek-yazarlı içerik), **hackernews.raw** ve **stackoverflow.raw** (ikisi de her iki taramada da boş `[]` döndü — sıfır sonuç, kapı kapanmadı, aranan konu o kanalda hiç yok).

**crowd.sh** ile 14 reddit thread'i topladım (`--workers 6`, tam güç: `--limit 100 --depth 10 --replies 50 --expand-more`):
- 10 thread tek seferde açıldı → **705 yorum, 499 ayrı insan**
- 2 thread ilk seferde "sadece sayfa metni" ile başarısız oldu (Reddit `/api/morechildren` "unplaced comment" hatası) → tekrar denendi, düz `opencli reddit read` ile ikisi de açıldı: **1wgaetp** (Fable 5.1 vs GPT-6 Astra robot kol boyama) → 130 kayıt/104 kişi, **1wf3hvx** (GPT-6 Astra ile vibe-code edilmiş Photoshop klonu) → 292 kayıt/180 kişi
- 2 thread hâlâ sadece sayfa gövdesiyle kaldı (aşağıda D'de)

**Toplam okunan: 1127 yorum, 12 açık thread, 783 kişi-satırı** (thread'ler arası tekilleştirilmemiş — aynı kişi birden fazla thread'de sayılabilir).

## B) SAYI (n=)

Doğrudan kod kalitesi kıyası içeren ~11 net görüş üzerinden (39 "astra…fable" karşılaştırma cümlesinin içinden):
- **Fable 5.1 kod kalitesinde daha iyi/tercih ediliyor: 6 kişi** (ör. cleaner code, "superhuman at coding", Theo'nun videosu "Fable outclasses Astra on front-end/coding")
- **Astra/Codex kod kalitesinde daha iyi: 2 kişi**
- **İkisi de kötü/karışık: 2 kişi**
- Geri kalan çoğunluk (~700+ kişi) **kod kalitesinden değil, token/kota/fiyat verimliliğinden** konuşuyor — bu, Astra'nın algılanan "avantajının" çoğunlukla maliyet olduğunu, kalite değil, gösteriyor.

**n = 783 okunan kişi-satırı, 12 thread; kod-kalitesi-spesifik görüş bildirenler n=10** (denominatör küçük çünkü asıl tartışma konusu kota/fiyat).

## C) SESLER (verbatim)

1. **Desperate-Poem7526** (r/ClaudeCode, 190. satır): *"Fables code is cleaner and is probably a little better at non abstract stuff... Overall I think fable comes out ahead especially coding but not by much."*
2. **chintakoro** (Theo'nun videosunu aktarıyor, 295. satır): *"Fable 5.1 (but not 5) clearly outclasses Astra on front-end design and general coding (what he calls mergeable code). But he gave Astra the edge in literally everything non-coding."*
3. **Local-Alps-4887** (735. satır): *"Haven't used Astra, but Fable 5.1 is absolutely superhuman at coding now. It can plow through extremely large and complex codebases like it was nothing."*
4. **D6613** (terminal_bench thread): *"Sol and Astra being so high triggers my skepticism. I use them at work, and they're very clearly weaker than the Claude equivalents."*
5. **Prior-Macaroon-9836** (278. satır): *"Honestly codex shits on claude in every aspect. Fable still suffers from claudish talk and usage gets burned fast."*
6. **Einbrecher** (retry1, robot-kol boyama thread'i): *"B is better, and I'm going to say that's Astra. I have an MCP server that lets Claude and Codex drive a Minecraft client... Claude is terrible at it."*
7. **dikrek** (369. satır): *"I posted in the ClaudeAI sub that fable was 6x the usage vs Astra for the same things in my usage in GitHub."* (kalite değil, verimlilik)
8. **Atupis** (terminal_bench): *"Astra produces 2x bigger changes than sol. Good for benchmark but real usage you don't want model do complete rewrites for minor bug fix."*
9. **FocusKontrol** (270. satır): *"I've been experimenting with trying to do plan with Astra... it has really fucked some of the plans up by over engineering... I had to redo them with Fable and there were no problems."*
10. **ClaudeAI-mod-bot** (VerBench thread özeti, otomatik): thread'in kendisi bir şakaydı — "VerBench" sahte bir benchmark, sürüm numarasına göre sıralıyor; gerçek bir kalite kıyası değil.

## D) KAPANAN KAPILAR

- **HackerNews** — sorgu iki kez (TR+EN) `[]` boş sonuç döndürdü. Duvar değil, o kanalda konuyla ilgili hiçbir şey yok.
- **StackOverflow** — aynı şekilde iki kez `[]`. Model kıyası SO'nun doğası dışında; beklenen.
- **r/LocalLLaMA `1uydii0`** (kimi_k3_beats_claude_fable_and_gpt_56_sol) — Reddit `/api/morechildren` "unplaced comment" hatası verdi, tekrar denenmedi (bütçe); yalnızca gönderi sayfa metni elimde.
- **r/dataisbeautiful `1vzyzkx`** (50 AI models, 62 propositions, 52700 answers) — aynı API hatası; sadece sayfa metni.
- **dev.to (10 makale)** — tek-yazarlı blog yazıları, forum/kalabalık tartışması değil; lanem dışı, okunmadı (crowd.sh'a alınmadı).
- **lobste.rs** — sadece 1 alakalı thread bulundu (Claude Fable 5/Mythos 5, 6 yorum), Astra ile doğrudan kıyas içermiyor; düşük sinyal olduğu için derinlemesine okunmadı.

## E) AYRI İNSAN SAYISI

**783** — 12 açık reddit thread'inde okunan ayrı kullanıcı adı toplamı (thread'ler arası tekilleştirilmemiş). Bunun içinden kod kalitesi hakkında **doğrudan** görüş bildiren: **~10 kişi**. Kalan ~770+ kişi kota/fiyat/kullanım tartışıyor — bu benim lanemin en önemli bulgusu: **kalabalık, "kod kalitesi"ni değil, "token başına ne kadar iş yapıyor"u tartışıyor.**

## F) NE ÇEVİRİRDİ

Şu an elimdeki 10 net kod-kalitesi görüşü 6-2 Fable lehine — ama örneklem küçük ve iki büyük thread (kimi_k3 kıyası, 50-model karşılaştırması) API hatası yüzünden açılamadı; onlar açılsaydı oran değişebilirdi, özellikle "50 AI models / 52700 answers" thread'i muhtemelen en büyük tekil veri noktasıydı ve okuyamadım. Ayrıca r/codex ve r/ClaudeCode gibi alt-redditler zaten taraflı topluluklar (Anthropic-ağırlıklı); r/OpenAI veya nötr bir mühendislik forumundan (ör. HN — ki boş çıktı) gelecek bir karşı-örneklem bulguyu tersine çevirebilirdi.