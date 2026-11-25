# Video and picture openings: what stops, holds and SELLS

Working folder: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/eae9dc30-29cf-48b1-8218-5b53dd8d5550/scratchpad/hook-kanit/bilim-video`. `report.md` there is a short form. This message is the full report, because my harness forbids a second full copy.

## The three answers

**(1) Does an event, danger or surprise in the first second beat other openings?**
- **For watching: partly yes.** Early surprise lowers skipping more than late surprise (F8). The funniest moment inside the first 5 s raises ad liking when the ad is skippable (F8).
- **For selling: only in one form.** A "start mid-action, hold back the answer" opening tied to the product had 20 % lower cost per order in one vendor dataset (F4). Nothing I found shows that bare surprise or danger sells more.
  - Surprised and fearful faces go with *lower* engagement on TikTok (F1) and *lower* livestream sales (F13).
  - Borrowed shock clips sold at 0.76× (F5). Surprise opening words had no detectable ROI gain (M1).
  - Viral views cut persuasion when the ad was outrageous, but not when it was funny (F9).
  - Fear openers were average as a class and strong only with proof (F14).
- **Not proven either way:** I found no randomised field test of "event/danger in second 1" with sales as the outcome.

**(2) How strong is the link between early attention and sales? Is "80 % of the sale is the hook" supported?**
- **Not supported by anything I found.** Early attention is a gate, and only a weak predictor of money.
  - Hook rate explained about 1 % of cost-per-order differences (F4).
  - First-3-second click rate explained 0.66 % of ROI rank variance (M1).
  - Likes, comments and shares vs sales change: ρ = −0.0075, −0.02, −0.0074 (F1).
- **Share of conversions:** the median TikTok sales ad had 11 % of its conversions on playback seconds 0–2 and 77 % after second 6 (M2).
- **The gate is real:** the same median ad keeps 46 / 28 / 21 % of viewers at 1 / 2 / 3 s.
- **Whole creative:** it is credited with 49 % of sales lift (56 % in digital) across almost 500 packaged-goods campaigns (Nielsen/NCS 2017; secondary page read: https://www.marketingcharts.com/advertising-trends-80662). That is the entire ad, so it is not a figure for the hook.
- **Probable origin of "80":** David Ogilvy 1963, about print headlines: "If you haven't done some selling in your headline, you have wasted 80 per cent of your client's money" (https://pagelint.dev/research/cl-1-single-dominant-h1; book itself not opened). That it is the origin is my inference.

**(3) Which openings win for selling rather than for views?** In order of evidence:
- The engaging moment IS the product (F1).
- Product visible early, brand name later and briefly (F7).
- Price, bold-claim or question hooks on TikTok Shop (F5).
- Contrast/comparison, or a specific result (F6).
- Mid-action with an open question tied to the product (F4).
- A line that filters for buyers (F4, F6).

**Wins views but not sales:** generic curiosity, trend sounds, borrowed clips, outrageous content.

---

## Own measurements (I ran these on public data; observational, not peer-reviewed)

**M1 — Douyin beauty ads with real ROI.**
1. Once the product and offer are fixed, the opening line's *type* hardly moves ROI.
2. AdsTrace, https://huggingface.co/datasets/Xiuze/AdsTrace. Scripts `at.py`, `at2.py`.
3. Grade B. N = 2,833 ads; 2,735 compared inside 37 product×promotion cells of 10+.
   - First-3-s click rate vs ROI: ρ = −0.08. Vs conversion rate: ρ = −0.44, partly arithmetic, since clicks are its denominator.
   - Top quarter of first-3-s CTR: ROI ×0.94, CVR ×0.57. Bottom quarter: ×1.01, ×1.31.
   - Every opening-line class has an ROI interval that includes 1: question ×0.97, offer ×1.00, warning ×0.98, regret/urgency ×1.03 [0.98–1.07], surprise words ×1.11 [0.96–1.29] (n = 67).
   - First-person "I" openings: CVR ×0.88 [0.81–0.95].
   - The product×promotion cell alone explains 9 % of ROI variance.
4. Beauty in one product family, China. Opening classes were assigned by my keyword rules on the transcript. The clicks are measured; watch time is not in the set.
5. Change the offer or product framing before polishing the sentence. Olive oil: open on "2 litres, harvested October" rather than a different way of asking a question. Spoken.
6. Read: dataset card plus the data.

**M2 — TikTok Top Ads second by second.**
1. Most sales-ad conversions come from those who stay past the hook.
2. TTCC v0.2.0, https://huggingface.co/datasets/liangyuch/ttcc-v0_2_0. Scripts `tt.py`–`tt3.py`.
3. Grade B. N = 6,114 (validation split); 1,558 sales-objective ads with full curves.

| By playback second | Clicks (median) | Conversions (median) |
|---|---|---|
| 3 s | 26 % | 11 % (IQR 6–21) |
| 6 s | 40 % | 23 % |
| 10 s | 57 % | 42 % |

   - 2-s retention vs CTR rank: ρ = 0.22 overall, 0.35 for conversion campaigns, 0.32 for product sales, −0.32 for video-view campaigns.
   - One third of the best-retention quarter still has below-median CTR.
4. Top Ads only (survivors), US. The curves are normalised per ad, so conversions cannot be compared across ads.
5. Use the 3 s to select and promise; place the proof and the ask at 4–10 s. Dentist: smile result at 0 s, price and booking at 6 s. Visual and on-screen.
6. Read: dataset card plus the data.

---

## Findings, strongest first

**F1. Engagement sells only when the engaging part is the product.**
- 2. Yang, Zhang & Zhang, "Engagement That Sells", *Marketing Science* 44(2), 2025 — https://pubsonline.informs.org/doi/pdf/10.1287/mksc.2021.0107; 2022 working paper — https://marketing.wharton.upenn.edu/wp-content/uploads/2023/02/02.16.2023-Yang-Jeremy-PAPER.pdf
- 3. Grade B (difference-in-differences on Taobao sales). BUYING.
  - Published: 259 treated products; the PE score alone explains 3 % of variance in sales lift (p < 0.01). Total engagement and amount of product shown are both insignificant.
  - Working paper (2,685 videos): +1 % PE score went with +2.58 % revenue.
  - Engagement starts low in the first second and peaks within the first 6.
- 4. China, 2019. Stronger for impulsive, hedonic, cheap goods. The working paper's *negative* effect of product placement became insignificant in print. Surprise and fear faces are negative for engagement; happy and sad faces positive.
- 5. Put the product inside the striking moment. Olive oil: the green oil hits the hot pan at the peak of the sizzle. Visual.
- 6. "Sales difference has no significant correlation with observed engagement (ρ=−0.0075, p=0.90 for likes…)". Read: sections.

**F2. Meta's own study of the first 3 seconds: they matter for conversions, but the winning type changes by sector.**
- 2. Zhang (Univ. of Maryland) with Zhang, Hill & Awadelkarim (Meta), arXiv 2602.22299, 2026 — https://arxiv.org/pdf/2602.22299
- 3. Grade B. Conversions per dollar. E-commerce 100–150k videos; CPG 75–100k; healthcare 25–50k; auto 10–25k; entertainment 10–25k. R² of hook features *plus targeting*: 0.21 / 0.50 / 0.33 / 0.66 / 0.25.
  - Top hook features: e-commerce interactive content; healthcare demo/product; CPG visual appeal and humour; auto visual appeal and realism; entertainment humour and celebrity.
  - Voice loudness and power matter, with an optimum.
- 4. R² is mixed with targeting, so it is NOT "the hook's share". In healthcare a crude pixel baseline beat it (0.42). Correlational; Meta only.
- 5. Dentist: open on the procedure or result itself. Furniture: make the viewer choose ("left or right?"). Visual/spoken.
- 6. "'Demo/Product' is the leading methodology in Healthcare, whereas 'Visual appeals' excels in the Consumer Packaged Goods sector." Read: whole.

**F3. Nothing in the creative works alone.**
- 2. Hartnett, Kennedy, Sharp & Greenacre, *J. Advertising* 45(1), 2016 — https://research.monash.edu/en/publications/creative-that-sells-how-advertising-execution-affects-sales/
- 3. Grade B. 312 TV ads, 150+ devices, short-term sales. BUYING.
- 4. Packaged goods. Many 1986 winners did not replicate.
- 5. Never sell a single "magic hook"; test bundles. All channels.
- 6. "No single creative device can do much alone to explain sales effectiveness." Read: abstract.

**F4. "False bangers": the best hooks win clicks and lose buyers; mid-action with a held-back answer is the exception.**
- 2. Galvor, Oct 2026 — https://galvor.ai/newsletters/decode/false-bangers-why-your-best-hook-isnt-always-your-best-ad/
- 3. Grade E (pooled Meta ad data; **N not disclosed**). BUYING.
  - Hook rate explained ~1 % of cost-per-order differences, hold rate ~4 %. Top hooks: +70 % clicks, about a third fewer buyers per click. 41 of 100 top-hook ads still cost more per order than typical.
  - Mid-action + answer saved: −20 % cost per order, 1.6× hook rate. Mid-action + funny: −19 %, 1.9×. Problem acted out as a scene: −16 %, 1.7×.
  - Product in the first 3 s: lower hook rate, but about 16 more ads in every 100 beat typical cost. Among high-hook ads, product shown working: 65 % won, against 53 %.
- 4. India-heavy examples; vendor; no randomisation.
- 5. Furniture: a full glass of red wine tips over a white sofa, cut before it lands; the stain-proof fabric is the answer. Visual.
- 6. "The opening caught attention, but often from people who were never going to buy." Read: whole.
- **Same pattern elsewhere:**
  - Pear Growth (1,393 UK TikTok Shop videos): strongest hooks 3.3× clicks, but orders per 1,000 impressions 0.70 vs 0.53 — https://www.peargrowth.com/blog/tiktok-shop-video-hooks-hook-rate
  - Billo (88,329 Meta ads, $122M, 14 sectors): best-hook sector (Toys, 28.79 %) was 12th in ROAS; best-ROAS sector (Baby) was 12th in hook rate — https://billo.app/creative-insider/data-insights/video-ad-roas-benchmarks-h1-2026/
  - Haven (~$5M, 100+ ads): curiosity hooks had high CTR and low conversion; "If you've been thinking about…" hooks more than doubled conversion in the best case — https://www.havenhq.ai/blog/demystifying-creative-performance-what-we-learned-from-5m-across-100-video-ads

**F5. On TikTok Shop, price, claim and question openings sell most per view.**
- 2. Coherence/MediaLabs (ContentIQ) working papers, 1 Oct 2026 — *Price and bold-claim hooks…* (PDF in my folder as `ciq.pdf`, from bbxbsocdethwhpvddtun.supabase.co, "openings-that-sell/v1"); https://medialabs-co.com/research/the-first-second ; https://medialabs-co.com/research/paid-and-organic-video
- 3. Grade B/E (estimated sales, not peer-reviewed). 3,340 watched videos. SALES PER VIEW, 90 % ranges:

| Opening | × market |
|---|---|
| Price/deal | 1.53 (1.37–1.71) |
| Bold claim | 1.28 (1.20–1.37) |
| Question | 1.27 (1.13–1.43) |
| Relatable POV | 1.05 |
| Problem call-out | 1.00 |
| Straight into demo | 0.89 |
| Unboxing reveal | 0.88 |
| Borrowed TV/viral clip | 0.76 |
| Face + text + product in second 1 | 1.08 (1.02–1.14) |
| Only one of the three | 0.88 |

  - Sound: on-camera speech 1.14; trending sound 0.76. Tone: enthusiastic 1.08; emotional 0.50.
- 4. US, one month, winners only. Model AUC 0.64. It contradicts itself: in its model "product in first second" has an odds ratio of 0.62. Among organic videos bold claim leads (1.4×); among ads price leads (1.5×).
- 5. Software: face + product screen + text "Your invoices done for €9 a month". On-screen/spoken.
- 6. "Attention captured with unrelated material may not carry through to purchase." Read: whole.

**F6. Swapping only the opening changes cost per sale; contrast wins, trends lose.**
- 2. Hyperbeam — https://blog.hyperbeamads.com/blog/case-study-ugc-hooks-ab-test-results ; Advize, 2026 — https://getadvize.ai/blogs/12-meta-ad-hooks-tested-3-formats-most-purchases
- 3. Grade E. CPA against the average hook (50 hooks, 12 brands, $500+ each): contrarian −34 %, comparison −28 %, personal story −24 %, problem −18 %, social proof −8 %, product reveal +2 %, whisper/ASMR +6 %, trend +22 %. Advize: 3 of 12 openings made 68 % of purchases (direct contrast, specific result, credibility challenge); 9 won clicks without proportional purchases.
- 4. $500 per hook is too little for firm per-hook conclusions; no intervals published. Advize: one skincare brand.
- 5. Olive oil: "I threw out my €20 bottle after this taste test." Spoken.
- 6. "The only variable was the opening hook." Read: whole / most.

**F7. Show the product early, the brand name late and briefly.**
- 2. Williams et al. (Otago/Ehrenberg-Bass), *Int. J. Market Research*, 2022 — https://doi.org/10.1177/14707853221134258 ; https://www.otago.ac.nz/news/newsroom/later-brand-reveal-in-advertisements-leads-to-better-sales ; https://www.research-live.com/article/features/whats-in-a-name-creating-successful-advertising/id/5119892
- 3. Grade B. 312 TV ads, 60+ brands, 5 countries, single-source sales; several models agree. BUYING. No single effect size on the pages I read.
- 4. TV, known packaged goods. For *recall* the opposite holds (see contradictions).
- 5. Furniture: the sofa bed opens by itself; logo at the end. Visual.
- 6. "Usually, television advertisements will start by showing the brand… we discovered marketers should consider showing the product first and revealing the brand later." Read: abstract + two articles.

**F8. Early surprise reduces skipping; joy that rises keeps people; peaks should repeat.**
- 2. Teixeira, Wedel & Pieters, *JMR* 2012 — http://www.economicsofattention.com/site/assets/files/1054/emotion-induced_engagement-_teixeira_et_al-_jmr.pdf ; Sun, Univ. of Georgia dissertation — https://openscholar.uga.edu/record/3427
- 3. Grade C. 58 people × 28 ads; watching/zapping. Surprise focuses the eyes more (29 % of explained attention); change in joy explains 58 % of explained zapping. Sun: a joke's peak inside 5 s gave higher ad liking when skippable; a later peak was funnier when non-skippable.
- 4. Students, laboratory; no sales. The authors warn of selection (the bored have already left).
- 5. Dentist: second 0, a child laughs in the chair. New small peak every 3–5 s. Visual.
- 6. "Early surprise more strongly reduces zapping than surprise later on. However, these findings may also be caused by a selection effect." Read: sections / Sun abstract.

**F9. More viral means less persuasive, unless it is viral by humour or about the product.**
- 2. Tucker, *Marketing Science* 34(2), 2015 — https://dspace.mit.edu/entities/publication/b36934cd-34db-45dc-9c3e-1813f9e4715c
- 3. Grade A/C (random exposure vs placebo, survey). 400 ads, 24,000 responses. Persuasion 10 % lower per million views.
- 4. Purchase intent, not sales. Exceptions: many comments, or comments naming the product.
- 5. Let people comment on the product: "Is this oil or perfume?" Caption.
- 6. "…they attracted views due to humor rather than because they were outrageous." Read: abstract.

**F10. Entertainment helps after the brand is seen, not before; too much hurts.**
- 2. Teixeira, Picard & el Kaliouby, *Marketing Science* 2014 — economicsofattention.com (`teix2014.txt`)
- 3. Grade C. 178 people, 82 ads, 3,487 observations. Smile → viewing interest: linear. Smile → purchase intent: inverted U.
- 4. Food and drink; intent.
- 5. Show the product first, then the joke. Visual.
- 6. "The latter is positively associated with purchase intent while the former is not." Read: sections.

**F11. Say what it is instantly for short views; mystery needs time; a false front backfires.**
- 2. Elsen, Pieters & Wedel, "Thin Slice Impressions", *JMR* 2016 — https://journals.sagepub.com/doi/10.1509/jmr.13.0398
- 3. Grade C/A: two laboratory experiments and one field experiment, 100 ms to 30 s. Ad evaluation.
- 4. Print-type ads; liking, not sales.
- 5. Thumbnail or static: the product recognisable at a glance. Never bait with another identity.
- 6. "False front ads… are evaluated positively after brief exposures but negatively after longer exposure durations." Read: abstract.

**F12. Act-now content moves site traffic and sales; facts and emotion cut clicks but raise sales.**
- 2. Liaukonyte, Teixeira & Wilbur, *Marketing Science* 2015 — HBS PDF (`ltw.pdf`); Guitart & Stremersch, *JMR* 2021 — https://personal.eur.nl/stremersch/artikels/Guitart%20and%20Stremersch%20JMR%202020.pdf ; Dall'Olio & Vakratsas, *JM* 2023 — https://www.ama.org/2022/03/09/the-impact-of-creative-strategy-on-advertising-elasticity/
- 3. Grade B. BUYING. (a) 1,224 ads, 20 brands, $3.4bn. (b) 2,317 car ads, 144 models: facts sell cheap cars, emotion sells expensive ones. (c) 2,251 ads, 91 grocery brands: experiential content (how to use it) > facts > emotion.
- 4. TV; whole ads, not openings.
- 5. Clicks alone misjudge factual openings. Cheap furniture: price and dimensions first. Luxury: feeling first.
- 6. "Information-focus and emotion-focus ad content actually reduce website traffic while simultaneously increasing purchases." Read: sections / AMA article.

**F13. Seller's face and voice: calm face, aroused voice, moderate empathy.**
- 2. Bharadwaj et al., *J. Marketing* 2022 — https://journals.sagepub.com/doi/10.1177/00222429211013042 ; Yao et al., SSRN 5657931 (2025); Luo, Berger, Fang & Huang, SSRN 7530660 (forthcoming *Management Science*)
- 3. Grade B + A. BUYING. 99,451 pitches: every emotion including happiness and surprise has a negative U on sales, worst mid-pitch. Taobao Live: vocal arousal raises sales (field + experiment). Almost 4,000 TikTok livestream videos + a randomised field experiment with 6,000 customers: inverted U for empathy.
- 4. Livestream, hedonic goods; not second 1. Google's "smiling characters in first 5 s" raised *brand* metrics (F18): a contradiction on a different outcome.
- 5. Straight face, energetic voice. Spoken.
- 6. "Salespeople should sell with a straight face." Read: abstracts.

**F14. Fear/warning openers: average as a class; aim at a habit, with proof.**
- 2. Ad Radar, Oct 2026 — https://ad-radar.dev/blog/warning-hooks
- 3. Grade E. 156 warning openers among 2,443 high-spend ads; outcome = estimated spend rank. Top tier 10.3 % (board ~10 %); to solution-aware buyers 16.3 %; with strong proof 25 % (n = 12); "If your [symptom]" 0 of 12.
- 4. Winners only, estimated spend, not sales. Meta restricts shocking content and personal attributes.
- 5. "After 19 years repairing boilers: this one switch costs you €300." Spoken.
- 6. "A warning is a claim, and the viewer discounts it until the ad shows something." Read: most.

**F15. Simple, short shots hold eyes; pace has an optimum.**
- 2. *JAMS* 2025 — https://link.springer.com/article/10.1007/s11747-025-01137-x ; Kickstarter study 2026 — https://link.springer.com/article/10.1007/s10660-026-10193-6 ; Kinzinger et al., EMAC 2025 — https://proceedings.emac-online.org/pdfs/A2025-125728.pdf ; Yang et al., *JMR* 2022 — https://journals.sagepub.com/doi/10.1177/00222437211067802
- 3. Grade C: 2,520 viewings × 42 public-service videos. Grade B: 5,297 campaigns, funds raised = PAYING, inverted U, most campaigns below the peak. 3,000+ ads, inverted U. 27,000+ TV ads, higher energy less tuning out (about 5,079 more TVs staying to 75 %).
- 4. Energy failed for food and beauty placed in sports. Taobao feed: variety of shot length and step-by-step guides lowered link clicks (about −3 points at low user fit; 74,797 raw exposures; https://www.mdpi.com/0718-1876/21/10/381).
- 5. One subject per frame, quick cuts. Visual.
- 6. "Short and visually simple scenes elicit higher levels of attentional synchrony." Read: abstracts / sections.

**F16. Faces: no universal rule.**
- 2. *Marketing Letters* 2026 — https://link.springer.com/article/10.1007/s11002-026-09839-0 ; Hitfactor — https://docs.hitfactorapp.com/labs/2026-thumbnails-with-faces/ ; Netflix — https://netflixtechblog.com/selecting-the-best-artwork-for-videos-through-a-b-testing-f6155c4595f6
- 3. Grade B: 3,498 skippable ads, face share in first 5 s β = −0.69 (p < .001) on qualified views, mostly utilitarian products. Grade B (plan locked in advance): 1.25M YouTube thumbnails, within channel −6.4 % views (−9.3 to −3.3). Grade A/D: Netflix tests, *expressive* faces that convey the tone win.
- 4. TikTok Shop sales: face 1.05× vs 0.94× (F5).
- 5. Social selling: face + product. Utilitarian YouTube ad or thumbnail: object or result.
- 6. "Managers should be cautious about assuming that facial presence necessarily increases early viewer engagement." Read: sections.

**F17. A hand *using* the product raises its value; a hand beside it does not.**
- 2. Luangrath et al., *JMR* 2022 — https://journals.sagepub.com/doi/10.1177/00222437211059540
- 3. Grade C (eight studies: images, GIFs, VR). Psychological ownership and product valuation; not field sales.
- 4. Weaker if the touch tells nothing about the product.
- 5. Furniture: a hand presses the cushion and it springs back. Visual/thumbnail.
- 6. "It is not enough to show a hand in an advertisement; the hand must be touching a product." Read: abstract.

**F18. Skippable YouTube: the brand in 5 s buys recall and costs viewers; humour wins both.**
- 2. Google, "The First 5 Seconds", 2015 — thinkwithgoogle PDF (`ytfive.pdf`); Maruti test 2017 (`unskipbrand.pdf`); Teixeira et al., *Marketing Science* 2010 — http://www.economicsofattention.com/site/assets/files/1083/teixeira-_et_al-_m2m_optimal_branding.pdf
- 3. Grade D: thousands of ads, 16 countries, no numbers. Maruti: consideration +11 % and +10.4 % with early branding (original: none); view-through 30/29/27 %. Grade C/A: brand in short pulses, zapping 67 % vs 74 % (p = .002), about 1,998 viewers, 31 ads.
- 4. Brand measures, not sales. Suspense and emotion raised recall.
- 5. Logo on the product, never floating; short flashes.
- 6. "Humor took the cake." Read: whole.

**F19. Attention measured in seconds predicts sales, but about 2 s is too little.**
- 2. Nelson-Field, WARC 2021 — https://srh.agency/assets/documents/Moving-to-a-positive-attention-economy-with-Attention-Adjusted-Net-Reach-_-WARC.pdf ; Mars ACE — https://aibusiness.com/ml/case-study-candy-giant-mars-uses-ai-to-test-which-ads-lead-to-sales ; McGranaghan, Liaukonyte & Wilbur, *Marketing Science* 2022 — kennethcwilbur.com PDF (`mlw.pdf`)
- 3. Grade D/E: active seconds vs choice index r = .82; Mars signals ~85 % accurate on sales yes/no, 3–4-star content from ~40 % to >70 %. Grade B: 4M exposures; attention predicts brand search lift.
- 4. Vendor studies; r = .82 appears to be aggregate, the unit of analysis is not stated. Mars uses the whole second-by-second curve, not the hook.
- 5. Design for 3–5 s of active attention, not one jolt.
- 6. "A blunt reminder that two seconds of attention is not enough." Read: sections.

**F20. Positive anticipation at onset forecasts views; unease forecasts quitting.**
- 2. Tong, Acikalin, Genevsky, Shiv & Knutson, *PNAS* 2020 — https://pmc.ncbi.nlm.nih.gov/articles/PMC7104008/
- 3. Grade C. First-4-s brain activity predicts watch share (NAcc β = .039; anterior insula β = −.047; both p < .001) and forecasts YouTube view frequency and duration.
- 4. Views, not sales. Counts against disgust/anxiety openings.
- 5. Promise a reward, not discomfort. Visual.
- 6. "Increased NAcc and decreased AIns." Read: abstract + results lines.

**F21. The same video with a new opening: split screen > big number > face > headline card.**
- 2. Sociovate, Nov 2026 — https://www.sociovate.com/blog/short-form-video-hooks-skip-rate . *The Second Decision*, SocArXiv — https://doi.org/10.31235/osf.io/c2evy_v1
- 3. Grade E: Instagram trial posts, 2 stories, 816–1,141 plays where given. Skip rate 24.5–29 % / 30–33 % / 34–35 % / 43.6 % / old slow openings 55–85 %. Grade B: Shorts (N = 1,734, three creators): on "promise" channels, extra loss at 10–20 % of the runtime went with ~39 % fewer daily views (1 SD); losing people at the very start went with *more* views.
- 4. Tiny tests; no sales. A hook-scoring tool failed: 93.8 points lost 65–75 %, 59.6 points kept the best retention.
- 5. Dentist: split screen before/after + "€0 for check-up". On-screen.
- 6. "The topic decided total plays more than the opening did." Read: whole / abstract.

**F22. Creator vs brand film: creators win attention; sales results split.**
- 2. Vonnimedia — https://www.vonnimedia.com.au/blog/what-is-ugc ; Ntousi et al., *Systems* 2025 — https://doi.org/10.3390/systems13020124
- 3. Grade E: $5.7M, 7 brands, hook rate 22.6 vs 18.1 %, ROAS 2.08 vs 3.78. Grade B ("field experiment", one publisher): directed customer videos had higher conversion rate and ROAS (p < .01), while brand ads had slightly higher CTR.
- 4. Not randomised across funnel stage (Vonnimedia); one publisher (Ntousi).
- 5. Run both in one campaign and judge on cost per sale.
- 6. "UGC wins attention. Brand wins the sale." Read: sections.

---

## (a) Contradictions between sources
- **Brand early or late:** late for packaged-goods *sales* on TV (F7) and for sharing (Tellis et al. 2019, https://journals.sagepub.com/doi/10.1177/0022242919841034). Early for *recall/awareness* (Google; System1/TikTok). Rule I would take: product at once, brand name later, logo on the product.
- **Product in second 1:** Galvor and the simple ContentIQ tables say yes; ContentIQ's model (0.62), straight-to-demo (0.89×) and Hyperbeam's product reveal (+2 % CPA) say no. Product visible is fine; product *as the whole message* is weak.
- **Question hooks:** 1.27× on TikTok Shop; ×0.97 (no effect) on Douyin; unspecific questions lost in Advize.
- **Known claims:** "71 % decide in 3 s" is reversed: 71 % *stayed* 3 s in a simulated feed, 7,280 people, against 25.44 % live on Meta (https://ethosengine.io/insights/three-second-hook-rule-what-platforms-measure, secondary). TikTok's "90 % in 6 s" is ad recall, not sales. The 43 % "purchase intent" lift quoted by VidMob is TikTok's survey figure.
- **Influencer videos, first 30 s:** Rajaram & Manchanda find brand mentions lower comment sentiment; human images +0.4 %, packaged goods −0.7 % like-sentiment per 1 % size; rapid speech no effect (https://arxiv.org/pdf/2012.12311).

## (b) Looked for, not found
- A randomised field test of opening types with sales as outcome, beyond small vendor tests.
- Any measurement of the hook's share of sales.
- Controlled sales evidence for "pattern interrupt", subtitles, sound on/off, before/after, or an event cut before it resolves (F4 is the nearest). On-screen text in second 1: no clear effect (1.01× vs 0.97×).
- Peer-reviewed Douyin/Kuaishou first-3-s *sales* study; the Chinese pages found were vendor posts.
- A published archive of YouTube thumbnail A/B outcomes. Lumen's profit chart: PDF obtained, numbers not extracted — UNVERIFIED.

## (c) Refused or partial
- Paywalled or abstract only: SAGE (several), Tandfonline (*How Video Cover Images…*), Emerald, WARC.
- DVJ's 3,000-ad logo-timing study: login wall. DSpace PDF of Tucker: HTML returned. NCS e-book: PDF did not download.
- SARA skip dataset: text not extracted. Attention Council PDF: digits lost in extraction, so I used none. Católica thesis on Meta narratives: unreadable text layer.
- Hugging Face API rate-limited me; file downloads worked. One of my own commands was stopped by the cost gate and rewritten.

## (d) Public datasets with outcomes

| Dataset | Size, outcome | Licence | URL |
|---|---|---|---|
| TTCC v0.2.0 | 61,789 TikTok ads, video + per-second CTR/CVR/conversion/retention; ~1 TB, metrics columns readable alone | research-only | https://huggingface.co/datasets/liangyuch/ttcc-v0_2_0 |
| TTCC v0.1.0 | 935 ads, same schema | licence not checked | https://huggingface.co/datasets/liangyuch/ttcc-v0_1_0 |
| AdsTrace | 2,833 Douyin ads, per-second CTR, **ROI**, CVR, frames, audio, transcripts | CC BY-NC 4.0 | https://huggingface.co/datasets/Xiuze/AdsTrace |
| SnapUGC | 90,000 (ECCV paper); 120,651 (ICCV challenge); ECR = share watching >5 s. Best challenge score 0.710 vs baseline 0.660 | not stated on page | https://github.com/dasongli1/SnapUGC_Engagement ; https://arxiv.org/html/2509.02969 |
| KWAI-AD-AudVis | 85,432 ads, top/bottom CTR | CC BY 4.0 | https://doi.org/10.5281/zenodo.4023389 |
| Tsinghua ShortVideo | 153,561 videos, 10,000 users, behaviour | not checked | https://github.com/tsinghua-fib-lab/ShortVideo_dataset |
| MicroLens-1M | user–video interactions + videos | not checked | https://github.com/westlake-repl/MicroLens |
| LAMBDA | 2,205 ads, 1,749 people, long-term memory | not checked | https://arxiv.org/abs/2309.00378 |
| Hitfactor thumbnails | replication repo for the 1.25M-video study; contents not inspected | not checked | https://github.com/HitFactorApp/youtube-thumbnail-face-study |
| TikTok hook lines | 46,605 hooks with engagement (paper); download page gave no data to me | paper CC BY 4.0 | https://doi.org/10.31235/osf.io/rj2mz_v1 |

**For a scorer:** SnapUGC trains *stop/stay*; TTCC trains *stay → click → conversion moment*; AdsTrace tests *money*. A scorer trained only on hook rate would, on this evidence, select for views rather than buyers.