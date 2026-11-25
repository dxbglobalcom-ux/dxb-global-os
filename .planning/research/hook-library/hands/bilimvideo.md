**1. Counts**
- Openings: 5 (TEST 5, MONEY 0, TENFOLD 0). Rules: 50 (9 solid, 31 usable, 10 weak; 17 have buying as the outcome, several of those only from an abstract).
- Checker: `openings.jsonl ok 5 {'TEST': 5}` · `rules.jsonl ok 50 {'-': 50}` · `ROWS 55 BAD 0`. Ledger: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/el/bilimvideo/ledger.txt`
- `rd/*.txt` are whitespace-collapsed copies with "<" written as "﹤", because the checker eats text between "<" and ">".

**2. Read**
- Whole body, no reference lists: Yang, Zhang & Zhang published 2025 (`engagement.txt`); `decodehook.txt`; Teixeira 2012 and 2014; Tucker 2015 (author's manuscript, MIT DSpace; appendix table not); MIT IDE brief; Downy PDF (no row: ad wording not given); Google video-experiments post 2021.
- Most, theory or appendices skipped: `engage.txt` (the 2022 working paper of the same study; appendix robustness seen to I.7); Tellis (the MSI working paper, not the journal version); JAMS 2025; Tong 2020; voices; `rctshort.txt` (2023 preprint of Marketing Science 2025); Marketing Letters faces paper; Zhang, Peng & Tan 2026. Rows on the last two and on Tucker say "whole"; treat as whole body, theory and appendix tables excepted.
- Sections only: Rajaram (`unboxing.txt`, results); Teixeira 2010 (results and experiment); slow motion; Sun dissertation; Elsen thesis by OCR (ch. 2 and 3 discussions); TMIS; linkclick; Kickstarter; DCGC; Affectiva/Mars.
- Abstract or press only: Williams 2022 (second-hand), Hartnett 2016, Luangrath, Bharadwaj, Chan (full text on disk), Liaukonyte, EMAC, Luo, Yao, Cho, SocArXiv.
- Not read: guitart, mlw, venkat, krishnan, danmaku, snapugc, lmm, nativev, presdur body, msi, Bellman 2026 beyond its introduction, System1 emotions.
- `voc2.txt` is not a paper. `tongpmc.txt` is a schizophrenia paper; the right file is `tongfull.txt`.

**3. The ten strongest** (only 5 openings with words or picture came out; 6–10 are rules)
1. "Hi, Esha, I hope you're enjoying chemical-free… Have you seen our new range…": clicks +9.4 points vs personal image, +6.5 vs generic video (randomised, 21,328 customers). The line is one example of the winning arm.
2. A dog riding a motorcycle (AI clip before an unchanged product film): 99 %-watched 2.25 % vs 1.10 % with no clip; purchases per view 0.072 % vs 0.002 %, but about 44 % fewer views (my conversion of a log −0.574).
3. Hotel film, normal speed dropping into slow motion: relaxers' interest 2.75 vs 2.22 of 5; stated price $152.70 vs $140.49 (600 randomised).
4. "The Energy Boost For Your Hair" with a picture that plainly shows hair: product known after 0.1 s 97 % vs 17 % (riddle) vs 4 % (false front), averaged over nine brands.
5. "Honey, isn't that the dog's towel?" by second 4: skippable-ad liking 5.06 vs 4.58 (weak).
6. ByteDance, randomised, 84 million users: lead lift 112 %; exposed people converted 8× more outside the app (raw), 4× by the causal split. Leads, not sales.
7. Yang: the average paid creator video lifted sales 2,017 RMB (p=.50) against a 19,530 RMB fee; only "the exciting part is the product" predicts lift (R² 3 %).
8. Teixeira 2010: brand in short repeated flashes 67 % vs 74 % zapped (p=.002, 130 people randomised).
9. Voices: a second voice, calm pace: $47.98 vs $44.18 stated price (randomised); the +39 % on Kickstarter is only correlation.
10. Tellis: brand at the start costs 30–36 % of shares, two independent samples.

**Would I stake a client's money? (full answer per row)**
- **Yes, as a construction or measurement rule:** Yang (product in the peak); ByteDance (count results outside the app); plain picture for glances; opening A/B tests (30 % lower median CPA when a winner exists, Google, winners only).
- **Test first:** impossible action, voices, slow motion, early joy, Affectiva (signal, F1 .745 vs .610 chance), Meta sector ranking.
- **No:** faces-first (YouTube budget not seen), joke before second 5, Kickstarter cuts, DCGC, YouTube comment sentiment.

**4. Corrections to `2-video.md`, and surprises**
- It says no field test of "event in second 1" with sales exists. One now does (Zhang, Peng & Tan; Douyin and Kuaishou). Viewers were not randomised, and 12 videos per type and orders are tiny. Most of the sales gap is AI clip vs none (0.055 % plain AI vs 0.072 %). An AI label cuts the watching gain from 1.2 to 0.2 points. An odd **look** (dog made of vegetables) loses clicks and seconds.
- F2 Meta: the paper does **not** show that the first 3 seconds matter for conversions. R² includes age, gender, advertiser size and zip code; no effect size per hook type.
- F8: Teixeira's 72 % and 58 % are shares of *explained* zapping. Holding the payoff for the last second is the worst of five shapes (simulated). Sun's early joke is not significant in her second study and does nothing for the brand.
- F9 Tucker: beauty of the picture (+0.0746, p<.01) is a surer exception than humour (p<.10). Ads named in comments lose nothing; 10 % per million views is about 0.7 points of a 6.6-point lift (mine).
- F10 is stated intent, 40 % of people turn down significantly. F15: the JAMS frame effects are 12 % per SD of clutter, 5 % per second of scene; gaze only, 30 people, forced viewing.
- F18: Teixeira 2010 also says brands appearing **later** cause **more** leaving (except the extremes), opposite to how it is usually quoted.
- Early surprise for sharing: not significant on any network; 11 of 345 ads (Tellis A3).
- F22: the "field experiment" (Ntousi) compared pre-tested winning creator ads with brand ads at different times and audiences; not randomised.
- **Brand timing conflict stays, by goal:** late for sharing (Tellis) and for known packaged goods' sales (Williams); early for intent (Teixeira 2014); product visible from the start has support in Williams and Yang.

**5. Not obtained**
- Closed, no open copy found: Williams 2022 (SAGE), Hartnett 2016 and her thesis "Advertisements that sell" (UniSA catalogue), Elsen JMR 2016 with its field experiment, Luangrath, Bharadwaj. A copy of the JMR Elsen paper sits on `sage.cnpereading.com`; I did not use it.
- Seller prices: not looked up. First to buy: Williams 2022 (the only product-early/brand-late *sales* result, still without an effect size), then Bharadwaj.
- Already downloaded but not open: Springer "The missing big idea" (JAMS 2026; my fetch returned a one-page file); SSRN thumbnails/empathy papers (abstract pages only); Rafieian & Católica PDFs in `dl/`, unread.
- The search found no other 2024–26 randomised opening test with sales.