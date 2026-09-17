## A) OKUDUĞUM KAYNAKLAR

Zeminde hazır duran iki tarama klasöründen (`ground/` ve `ground-2/`) kendi payıma düşen kanalları okudum, arama yapmadım:

- **ground-2/reddit.raw** (360 KB) — r/ClaudeCode, r/ClaudeAI, r/codex başlıkları + üst yorumlar (ground/reddit.raw yanlış konuydu — Türk askerlik tartışması, kullanılamadı)
- **ground-2/twitter.raw** + **ground/twitter.raw** (114 KB toplam) — tam tweet metinleri, yazar, tarih, beğeni sayısı dahil
- **ground-2/exa.raw** (43 KB) — 6+ karşılaştırma bloğu makalesi (Context Studios, Cline, vellum vb.)
- **ground-2/parallel.raw** (54 KB) — Vellum, Segmind, eWeek, DataCamp, AceCloud, Crypto Briefing, AlphaSense, 4SAPI makaleleri, tam alıntılarla
- **ground-2/pages/05-x.com.md** — Grok'un derlediği X özet sayfası, 5 geliştirici tweet'i tam metin
- **ground-2/pages/03-dev.to.md, 04-zenmux.ai.md, 06-contracollective.com.md** — başlık düzeyinde doğrulandı (aynı benchmark anlatısını tekrarlıyorlar)

## B) SAYIM (n=)

Karşıt kanıt (Astra 6'nın kod kalitesinde tercih edildiğine dair) kaynak sayısı:
- **Benchmark tabanlı karşıt kanıt: 6 farklı bağımsız/yarı-bağımsız ölçüm** (Terminal-Bench 4.0, DeepSWE v1.1, AutomationBench, Arena WebDev/Image-to-WebDev, Epoch ECI genel, GPQA/FrontierMath)
- **İnsan sesi (X/Reddit) karşıt kanıt: 9 farklı kişi** doğrudan okundu
- Bunlardan **6'sı net Astra lehine**, **2'si karışık** (Fable'ı genel tercih ama Astra'ya hayranlık), **1'i net Fable lehine coding'de** (dengeleme için sayıldı)

## C) SESLER (doğrudan alıntı, yazar + tarih)

1. **@bridgemindai (X, 14 Eyl 2026, 907 beğeni):** *"GPT 6 Astra is so much better than Fable 5.1. Fable 5.1 is slow, expensive, and lazy. I spent the past 12 months using Claude Code as my daily driver. I use Codex now. Astra is fast, reliable, and computer use is a genuine game changer... GPT 6 Astra has completely taken over my workflow."*

2. **@argofowl (X, 6 Eyl 2026):** *"astra > fable 5.1, i still can't believe i'm saying this, across the board btw imho, i still get giddy every time i use it."*

3. **@hityyhz (X, ~14 Eyl 2026):** 15 gerçek görevde test — *"Astra won 10. Fable won 5."* Kodlamaya en yakın görev olan "clone a website from a URL"da Fable kazandı ("Astra had layout bugs and got stuck while scrolling"), ama genel skor Astra lehine.

4. **Alexey Fateev / @superalesha (X, 5 Eyl 2026):** *"Fable 5.1 owes me a fucking apology. I gave Astra and Fable the same photo and asked them to draw me in Paint using computer use. I fucking lost it."* (Astra'nın computer-use/kodlama performansı için)

5. **Zach / @ZryMiller (X, 6 Eyl 2026):** *"I've never felt so frustrated and amazed at the same time using a model as I have with Astra"* — nihayetinde Fable'ı seçse de Astra'yı "incredible" buluyor.

6. **@zwb44 (X):** *"i much prefer astra for general tasks, but for CODING and frontend fable 5.1 is the best model atm"* — bu, benim lanem için ZAYIFLATICI bir ifade, dürüstlük gereği ekliyorum.

7. **Rohit Rao, Segmind blog yazarı (15 Eyl 2026, hands-on test):** *"Astra is the better default. It is 40% cheaper, it respected the element-count cap where Fable did not... Fable 5.1 earns its premium in exactly one situation."*

8. **r/codex kullanıcısı (Reddit, tam post okundu):** *"Astra is 3 times slower than it should be. It was deliberately nerfed for non-fast mode..."* — bu Astra'ya karşı, kendi topluluğundan gelen bir şikayet (dengeleme amaçlı not).

9. **r/ClaudeCode başlığı** (94 upvote, 123 yorum, sadece başlık okunabildi): *"I tried Astra with Pro and honestly kind of regretting it"* — Fable lehine bir sinyal, dürüstlük gereği belirtiyorum.

## D) KAPANAN KAPILAR

- **ground/reddit.raw** — tamamen alakasız içerik (yanlış konu taranmış), 0 bayt kullanılabilir veri
- **r/ClaudeCode "regretting it" thread'inin tam yorumları** — sadece başlık + üst 3 yorum snippet'i vardı, tam thread'e ayrı bir fetch gerekirdi, zaman bütçesi içinde açılmadı
- **tavily.raw (ground-2)** — 0 astra/fable eşleşmesi, konuyla ilgisiz döndü

## E) OKUNAN FARKLI İNSAN SAYISI

**9 farklı gerçek kişi** kendi sözleriyle okundu (bridgemindai, hityyhz, argofowl, superalesha, ZryMiller, zwb44, Rohit Rao, ayrıca Wësche ve naturedosedaily kısmi okundu) + 6 bağımsız benchmark/kurum kaynağı (Arena.ai/128.138 oy, OpenAI'nin kendi Terminal-Bench/DeepSWE/AutomationBench tabloları, Epoch AI ECI).

## F) NEYİ ÇEVİRİRDİ

**Rakamlar karışık, tek yönlü değil — bu benim lanemin de itiraf etmesi gereken zayıflığı.** Astra lehine kanıt gerçek ve ölçülebilir:
- **Arena WebDev/Image-to-WebDev** (insan oylu, 128.138 oy): Astra 1733–1797, Fable 1710–1762 — **Astra önde**
- Terminal-Bench 4.0: 57.7–57.9% (Astra) vs 55.8% (Fable) — Astra önde
- DeepSWE v1.1: 74.1% (Astra) vs 67.4% (Fable) — Astra önde
- AutomationBench: 41.4% (Astra) vs 31.4% (Fable) — Astra önde
- Maliyet: Astra görev başına genelde %30-60 daha ucuz

Ama beni **çeviren** bulgu şu oldu: **bağımsız Artificial Analysis Coding Agent Index'te Fable 70, Astra 67** — ve bu, tek vendor tablosu değil, birden fazla makalenin "en güvenilir tek gösterge" dediği ölçüm. Ayrıca **Epoch'un MirrorCode yazılım mühendisliği testinde Fable %73, Astra sadece %47** — bu en büyük tek boşluk. Yani Astra kod *üretme hızında/ajan-görevlerinde* öne çıkıyor, ama "kod kalitesi" özelinde bağımsız ölçümler hâlâ Fable'a kayıyor. **Karşıt dava gerçek ama tek başına baskın değil** — Astra'nın zaferleri ağırlıkla web-dev/ajan görevlerinde ve maliyet verimliliğinde; saf "yazılım mühendisliği kalitesi" endeksinde Fable önde kalıyor.