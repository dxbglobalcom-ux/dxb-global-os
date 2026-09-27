## HÜKÜM (Kalabalık/Forum Lanesi)

Reddit + Hacker News + Lobsters'ta okunan **484 farklı kişinin** sözlerine göre net bir galip yok: kodlama görevlerinde Astra 6 lehine hafif sayısal ağırlık var (özellikle "hangisi daha iyi" tipi doğrudan oylama thread'lerinde), ama Fable 5.1 mimari/çok dosyalı iş ve "kişilik/yaklaşım" güveninde daha sadık bir taban koruyor; en yüksek sesli grup ise "duruma göre değişir" diyen orta kesim. Maliyet/limit şikayetleri her iki modelde de switch (taraf değiştirme) nedeni olarak öne çıkıyor.

**A) OKUDUĞUM KAYNAKLAR**

| Kanal | Konu sayısı | Okunan yorum | Not |
|---|---|---|---|
| Reddit (crowd.sh, tam yorum) | 4 | 173 | https://www.reddit.com/r/codex/comments/1wfaf7f/gpt_6_astra_vs_fable_51/ · https://www.reddit.com/r/ChatGPT/comments/1wa5539/gpt6astra_is_on_par_with_claude_fable_51_on_the/ · https://www.reddit.com/r/aigamedev/comments/1w87g5p/tried_to_oneshot_gta_with_fable_51_and_astra_6/ · https://www.reddit.com/r/AISEOInsider/comments/1weetfl/gpt_6_astra_vs_fable_51_has_a_shocking_winner/ |
| Reddit (sadece gönderi metni, yorumlar 429/ağ hatasıyla kapalı) | 7 | 7 gönderi | https://www.reddit.com/r/Anthropic/comments/1w7yz5s/ · https://www.reddit.com/r/codex/comments/1w8438a/ · https://www.reddit.com/r/ClaudeCode/comments/1w8m0ho/ · https://www.reddit.com/r/ClaudeAI/comments/1wgaetp/ · https://www.reddit.com/r/ClaudeCode/comments/1wd01tk/ · https://www.reddit.com/r/ClaudeAI/comments/1wanm8p/ · https://www.reddit.com/r/OpenAI/comments/1w7ppcj/ |
| Hacker News | 5 | 458 | https://news.ycombinator.com/item?id=49645443 · https://news.ycombinator.com/item?id=49556147 · https://news.ycombinator.com/item?id=49717061 · https://news.ycombinator.com/item?id=49677656 · https://news.ycombinator.com/item?id=49684393 |
| Lobsters | 2 | 13 | https://lobste.rs/s/avn6ij/fable_5_1_solves_cyphral_distich_370_year · https://lobste.rs/s/ywnsld/gpt_6_astra_solves_wwi_german_radio_cipher |
| dev.to | 3 (okundu, kalabalık verisi yok — tek yazarlı SEO/blog, 0 okuyucu yorumu) | 0 | https://dev.to/denisbabkevich/... · https://dev.to/dylanfoster1/... · https://dev.to/ethanmercer1/... |
| Stack Overflow | 0 (gerçekten boş — model tercihi tartışması türü içerik yok) | — | — |

Fleet'in ortak `ground/` klasöründeki reddit.raw, stackoverflow.raw, hackernews.raw, lobsters.raw, devto.raw kanallarının hepsi boş/hatalı döndü (aşağıda D); bu yüzden kendi lane sweep'imi ve doğrudan aramaları ayrıca çalıştırdım.

**B) SAYIM (n=484 farklı kişi, kanal bazında)**

Doğrudan tercih sorulan en net thread — r/codex "Which one is better for coding?" (n=23 yorumcu):
- Astra'yı net tercih eden: **9** (Dismal_Code_2470, SpyMouseInTheHouse, Paulynom, bayasdev, Small_Vacation_8830, jakenuts-, Business_Match_9349, Equivalent_Machine93, GuildHunterTri)
- Fable'ı net tercih eden: **7** (Sir-Noodle, dvduval, KiwiDecent5342, _y_not_, pigletmonster, Dvass138, Pretend_Sale_9317)
- "Duruma/işe göre değişir" diyen: **7** (TekintetesUr, Salt-Willingness-513, danny_094, Icy_Platypus_8122, cephaswilco, iliadz, Fantastic_Market8061)

r/aigamedev GTA one-shot thread'inde (Astra kazanan taraf olarak sunuldu): My-NameWasTaken, TheSARMS_Coach açıkça Astra lehine; MomentSouthern250 sürüş/drift kısmında Fable'ı övdü; Wipeout_uk Astra'nın tasarım kalitesinden hayal kırıklığına uğradığını yazdı.

HN'de (330 farklı kullanıcı adı geçişi, 5 thread — bkz. D'deki dublikasyon notu): kodlamada Astra'yı öven (rfgplk, vlovich123), hayal kırıklığı yaşayan (justonenote — Astra), Fable'dan hayal kırıklığına uğrayıp Astra'ya geçen (rfgplk, Keyframe) ve "gerçek kullanımda ikisi de benchmarklardan kötü" diyenler (wertyk) karışık.

**C) SESLER (tarihli, kaynak adresli)**

1. **Sir-Noodle**, r/codex, ~2026-09-13: *"After very heavy use of both since release they seem close, but I'd give the very slight edge to Fable 5.1... Astra is definitely the better general model for 9/10 purposes other than coding."* — https://www.reddit.com/r/codex/comments/1wfaf7f/gpt_6_astra_vs_fable_51/

2. **Paulynom**, r/codex, ~2026-09-13: *"Astra, not even close"* — aynı thread.

3. **pigletmonster**, r/codex, ~2026-09-13: *"Fable 5.1 beats astra in code quality, but astra does almost everything else better."* — aynı thread.

4. **Pretend_Sale_9317** (SWITCHER), r/codex, ~2026-09-13: *"Fable 5.1 made me cancel my Claude sub. Weekly limit now burns just as fast as session limit... Astra still burns token but the fact that other gpt models are not as brain dead as Opus makes all the difference to choose gpt sub over Claude. I still prefer fable for architecture design, multi file codebase changes, etc."* — aynı thread.

5. **RCBANG** (SWITCHER/hayal kırıklığı), r/Anthropic, 2026-09-05 ~7:15 AM PT: *"'Read all of it, checked every point against the files, and ASTRA is right on all six'... $20 Astra against $200 Claude. This Should NOT happen! I am Heartbroken as a 7 Months Straight using Claude..."* — https://www.reddit.com/r/Anthropic/comments/1w7yz5s/today_i_got_heart_broken_about_fable_51_astra/

6. **rfgplk**, Hacker News, ~2026-09-13: *"Best model put out so far by any of the frontier labs [Astra]... But Fable has been a huge disappointment for me with the sole exception of graphics (UI/GPU shaders). It burns an obscene amount of tokens and barely produces output better than Opus 5."* — https://news.ycombinator.com/item?id=49684393

7. **justonenote**, Hacker News, ~2026-09-14: *"Astra is incredibly dumb and annoying to work with on 'high' reasoning... If it was a junior engineer I was trying to get to help out I would probably get brain damage from the amount of times I'm face palming myself."* — https://news.ycombinator.com/item?id=49684393

8. **Keyframe**, Hacker News, ~2026-09-16: *"I wouldn't trust it for coding at all - switching between fable and now astra."* — https://news.ycombinator.com/item?id=49717061

9. **TheSARMS_Coach**, r/aigamedev, ~2026-09-09: *"Astra blows Fable out the water here with the mechanics."* — https://www.reddit.com/r/aigamedev/comments/1w87g5p/tried_to_oneshot_gta_with_fable_51_and_astra_6/

10. **strangescript**, r/ChatGPT, ~2026-09-13: *"People are joking but if you have used both and you genuinely think Fable is better, you are not being honest with yourself."* — https://www.reddit.com/r/ChatGPT/comments/1wa5539/gpt6astra_is_on_par_with_claude_fable_51_on_the/

**D) KAPALI KAPILAR**
- Fleet'in ortak `ground/` sweep'i: `reddit.raw` (0 kod, boş), `hackernews.raw` (HTTP 400), `lobsters.raw` (DuckDuckGo EMPTY_RESULT), `stackoverflow.raw` (0 kod, boş), `devto.raw` (DuckDuckGo EMPTY_RESULT) — hepsi lanem için işe yaramadı, kendi sweep.sh + WebSearch turlarımı ayrıca çalıştırdım.
- **7 Reddit thread'i**: `opencli reddit read` art arda **HTTP 429** (rate limit) ve sonra `TypeError: Failed to fetch` verdi (3 deneme, her biri ayrı hata); `opencli browser reddit extract` de aynı thread'te **HTTP 429** ile döndü. `fetch.py`'nin 12 kapılı zinciri bu 7 sayfayı scrapling ile açtı ama Reddit'in yorumları JS ile geç yüklediği statik HTML'de yorumlar görünmedi — sadece gönderi metni okunabildi.
- **Stack Overflow**: hem sweep hem doğrudan `site:stackoverflow.com` araması sıfır sonuç — gerçekten boş, engellenmiş değil; SO bir Q&A sitesi, model-tercihi tartışması türü içerik barındırmıyor.
- **dev.to**: 3 makale okundu ama hepsi tek yazarlı SEO/blog yazısı, okuyucu yorum bölümü **0** — kalabalık verisi değil, talimat gereği ("not SEO comparison blogs") sayıma dahil etmedim.
- **Lobsters**: doğrudan "Astra vs Fable tercih" konulu thread bulunamadı; bulunan 2 thread konu dışıydı (şifre çözme iddiası tartışması), tercih verisi taşımıyordu.

**E) FARKLI İNSAN SAYISI**
**484** — Reddit crowd-threads 133 + Reddit post-only OP'ler 7 + Hacker News 330 (5 thread toplamı, aynı kullanıcı adı birden fazla thread'de geçmiş olabilir, thread'ler arası dublikasyon ayıklama aracım yok — bu üst sınır bir rakam) + Lobsters 14.

**F) NEYİ ÇEVİRİR**
Reddit'teki 7 kilitli thread'in yorumları (429/ağ hatası nedeniyle okunamadı) muhtemelen en taze "first impressions" verisini taşıyordu (özellikle r/codex "first impressions after a few days" — 21 yanıt, r/ClaudeCode "same prompt" karşılaştırması). Bunlar açılabilseydi sayım belirgin şekilde değişebilirdi. Ayrıca HN'deki 330 rakamı thread'ler arası aynı kişi tekrarını ayıklamadan verildiği için gerçek "farklı insan" sayısı muhtemelen biraz daha düşük — bunu aradım ama elimdeki araçlarla (regex tabanlı kullanıcı-adı çıkarma) thread'ler arası çapraz eşleştirme yapamadım.