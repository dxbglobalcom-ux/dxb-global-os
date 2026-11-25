# Hook evidence, platform and industry slice: measured results with outcomes

Every number was read at the named URL today (2026-11-25) unless marked UNVERIFIED-SNIPPET or CALC (my own calculation). I did not write `report.md`, because the harness bars agents from writing report files; this message is the report. Raw fetches and scripts are in `/tmp/claude-1000/-home-dxb-DxB-Global-OS/eae9dc30-29cf-48b1-8218-5b53dd8d5550/scratchpad/hook-kanit/platform/`: `p/` pages, `s/` searches, `w/` the dataset analysis.

## Short answer
- **Most new ads lose.** On Meta 4.0–8.8 % become winners (578,750 ads). CALC, if ads were independent: for a 90 % chance of one winner, make about 57 ads (small account) to 25 (large account).
- **Stopping is not buying.** System1/TikTok found ads with the highest view-through had 51 % lower conversion lift. Billo's categories that hook best mostly return least. Both scores must be kept.
- **What moved money:** price or offer plus demo (TikTok), human voice (Google), native vertical video with sound (Meta tests), recipient's name in the subject line (Stanford experiment). No hook type wins everywhere.

## Findings, strongest first

**1. Writing the recipient's name in the e-mail subject line raises opens and leads.**
- Who: Sahni, Wheeler, Chintagunta (authors from memory, UNVERIFIED), Stanford GSB working paper. https://www.gsb.stanford.edu/faculty-research/working-papers/personalization-email-marketing-role-non-informative-advertising
- Proof: **A.** Randomised field experiments, three companies, millions of people. Open probability +20 %, sales leads +31 %, unsubscribes −17 %.
- Holds/not: old e-mail era; Apple's privacy changes make opens unreliable today, so trust the leads. Belkins' 5.5 M cold e-mails agree as correlation: opens 46 % vs 35 %, replies 7 % vs 3 %. https://belkins.io/blog/b2b-cold-email-subject-line-statistics
- Hook (e-mail): dentist, "Anna, your check-up slot this week".
- Quote: "increases the probability of the recipient opening it by 20%, which translates to an increase in sales leads by 31%". Read: abstract only.

**2. A headline test works; a headline formula does not.**
- Who: Hagar & Diakopoulos with Chartbeat, Digital Journalism 2021, authors' account at https://www.niemanlab.org/2021/10/how-a-b-testing-can-and-cant-improve-your-headline-writing/ ; Chartbeat's own ~10,000 tests, 100+ publishers, https://chartbeat.com/resources/research/youll-never-guess-how-chartbeats-data-scientists-came-up-with-the-single-greatest-headline/
- Proof: **A.** 141,000 A/B tests, 293 news sites. Measured: clicking.
  - Winner lifts CTR 20 %+, yet repeated identical tests often changed winners.
  - Chartbeat: winner beats average headline by 23 % with 2 variants, by 50 %+ with 5. Only "this/these" words and numbers raised the win chance; long headlines raised scaled CTR; questions, short length and name-dropping did nothing.
- Holds/not: news homepages. The larger study found slight help from negative and shorter headlines, against Chartbeat's "long". AI-written headlines (Jan–Jun 2025) won 27 % against 26 %: https://chartbeat.com/resources/general/what-ai-headline-testing-reveals-about-audience-engagement/
- Hook (headline): write five for one olive-oil page, including "This harvest was pressed 4 hours after picking", and let traffic choose.
- Quote: "no single feature of a headline's writing style makes much of a difference in forecasting success." Read: whole author article, not the paper.

**3. On Meta Reels, vertical video with sound inside the safe zone beats a still image on cost.**
- Who: Meta, "Reels Ads Guide" (2024), cached copy https://margosolution.com/wp-content/uploads/2025/05/META-Reels-Ads-Guide.pdf ; "Performance Playbook", https://nowbam.com/wp-content/uploads/2024/09/Reels-Performance-Playbook.pdf
- Proof: **A/D.** Meta profits. Measured: cost per result, buying.
  - 15 split tests: −34.5 % cost per result vs stills (99.9 % confidence); −15 % vs non-vertical silent video (70 % confidence, per the Zappush-type summary in my search, UNVERIFIED-SNIPPET).
  - 10 lift studies (Apr–May 2023): adding native video with one of {human, text sticker, voice, lo-fi, hook} gave ROAS +13 %, CPA −16 %, conversion rate +29 %.
  - 11 advertisers (Nov 2022): "up to" 51 % better cost per incremental conversion.
- Holds/not: a bundle; the hook's own share is not separable. The 10-study test ADDED assets, so part is variety.
- Hook (visual + spoken): furniture, vertical phone shot, owner's voice: "Watch this sofa become a bed in six seconds."
- Quote: "led to 13% higher ROAS, 16% improvement in CPA, 29% higher CVR and 11% higher reach." Read: whole playbook; section of guide.

**4. Price, demo and a promotion shown together lift TikTok sales most.**
- Who: TikTok Marketing Science, Retail performance creative analysis, May 2023, https://ads.tiktok.com/business/library/TikTok_Works_Performance_Creative_1_Pager.pdf
- Proof: **D.** N not published; TikTok profits. Measured: conversion.
  - Product use shown +175 %; price + demo + promotion +149 %; CTA with price +87 %; 1–2 brand cues +56 %; all five levers 2.3x.
- Holds/not: retail, lower funnel; whole ad, not only the opening. The footnote for +175 % (source 4) is missing.
- Hook (visual + on-screen): olive oil poured on bread, text "€9 · 500 ml · this week".
- Quote: "When you include a clear price point, demo the product and mention a promotion - this creates a substantial +149% conversion lift." Read: whole.

**5. Offer, urgency, price and newness hooks win most often on Meta; storytelling and authority least.**
- Who: Motion, Creative Benchmarks 2026, https://content.motionapp.com/hubfs/Benchmarks-Report-2026.pdf (counts also at https://go.motionapp.com/benchmarks )
- Proof: **B.** 578,750 ads, 6,015 advertisers, $1.29 B, Sep 2025–early Jan 2026. Outcome: "winner" = ad spend ≥10x the account's median ad (SPEND, not ROAS). Motion sells the tool.
  - Hit rate: newness 11.37 % (83 winners), sale announcement 11.35 % (only 16), price anchor 10.89 % (71), **urgency 9.73 % (4,855), offer only 9.29 % (4,798)**, FOMO 9.20, confession 8.74 (675), exclusivity 8.44, **curiosity 7.77 (2,402)**, bold claim 7.19, contrarian 7.01, relatability 6.85, contrast 6.78, direct address 6.65, authority 6.40.
  - Share of spend ÷ share of ads: giveaway 2.29, price anchor 2.00, offer 1.42, confession 1.41, urgency 1.31, curiosity 1.29, storytelling 0.95, reasons-why 0.92.
- Holds/not: Black Friday season; the authors say other seasons may differ. Small accounts differ. AI tagging. Tables verified by eye on the page image.
- Hook (on-screen/caption): software, "New: invoices that chase themselves"; furniture, "Was 1,200, now 799, until Sunday".
- Quote: "Hooks that signal immediacy, clarity, or a concrete reason to act tend to surface often." Read: whole.

**6. Visual openings on Meta: unboxing, offer banner, behind-the-scenes and founder win more often than review, listicle and split screen.**
- Who: same report. Proof: **B.**
  - Hit rate: unboxing 9.83 %, offer-first banner 8.68, behind the scenes 8.64, founder 8.57, POV 8.28, **demo 8.11 (5,563 winners)**, testimonial 6.57, before/after 6.07, listicle 5.30, review 4.89.
  - Asset: text-only 11.60 %, product image with text 8.75, UGC 7.56, high production 6.97, carousel 4.45. Spend ratio 1.97 / 1.23 / 1.00 / 0.79 / 0.50.
- Holds/not: differs by sector. Testimonial carries 13.35 % of spend at ratio 1.00, so it is average, not weak.
- Hook (visual): dentist, the dentist herself unboxing the new scanner; plain text slide "Your crown in one visit".
- Quote: "The visual styles that attract the most spend are not always the ones that become winners most efficiently." Read: whole.

**7. Win rate: how many hooks must be tried.**
- Motion (**B**), winner share by monthly spend: <$10K 4.03 %, $10–50K 6.47, $50–200K 8.13, $200K–1M 8.64, $1M+ 8.80. Half of ads die before 28 days. Winners take 23 % of spend (smallest accounts) to 64 % (largest). Top-quartile accounts ship more: 54.6 a week vs 18.9 at $1M+.
- AppsFlyer 2025 (**B**): 1.1 M video variations, 1,300 apps, $2.4 B: top 2 % take 53 % (games) / 43 % (others). The 2024 edition: 2 % take 68 %, "one successful ad may require a whopping 50 ad variants". https://www.appsflyer.com/resources/reports/creative-optimization-report-2025 , https://www.appsflyer.com/resources/reports/creative-optimization-2024-report/
- Brkfst.io claims 2 % (**E**, N unstated). https://www.brkfst.io/how-many-ads-should-you-actually-be-testing-on-meta/
- Websites: Optimizely 127,000 tests, ~12 % win (section read: https://bdjknm.files.cmp.optimizely.com/download/9dbe7b14942111eea7b41a8a51acfb25 ); ConversionTeam 2,288 tests, 19.1 % significant, copy/messaging highest raw win at 60.0 % but only 40 tests, imagery 45.7 % (https://www.conversionteam.com/ab-test-win-rate/ ).
- CALC, 1−(1−p)^n: 50 % / 90 % chance of a winner: p=2 % → 35 / 114 ads; 4 % → 17 / 57; 6.5 % → 11 / 35; 8.1 % → 9 / 28; 8.8 % → 8 / 25. Hooks cut on one body are correlated, so real need is higher.
- Use: the office quotes a testing volume, never "one perfect hook".
- Quote: "Higher hit rates may … signal that someone isn't testing enough" (shortened). Read: Motion whole, others section.

**8. Stopping and buying can run in opposite directions.**
- System1 + TikTok, "The Long and the Short (form) of It", 2025, https://system1group.com/creative-effectiveness-tiktok : 887 ads, 84,788 users, 239 brand-lift and 119 conversion-lift studies. Highest vs lowest view-through: **conversion lift −51 %**. Heavy "salesmanship" ads: conversion +88 %, but brand image −23 % and brand awareness −50 %. Dull ads −27 % conversion. **B/D.**
- Billo H1 2026, https://billo.app/creative-insider/data-insights/hook-rate-benchmarks-h1-2026/ and https://billo.app/creative-insider/data-insights/video-ad-roas-benchmarks-h1-2026/ : 88,329 Meta sales video ads, $122 M. Mean hook rate 25.44 %. Toys best hook (28.79 %), ROAS 1.62 (12th); Baby 22.56 % hook, best ROAS 4.99. **B.** CALC across its 14 categories: Spearman −0.24, p=0.42, so direction only, not proof.
- VidMob, 1,116,280 videos (2020): direct gaze at opening gave CTR +1.47 %, view rate −6.67 %. https://vidmob.com/hubfs/Vidmob_May2024/Pdf/vidmob-focus-on-eye-gaze-how-a-models-gaze-can-impact-ad-performance.pdf
- Hook: for B2B, name the buyer ("Dental-clinic owners: …"), and accept fewer stops.
- Quote (System1): "higher view-through doesn't mean more conversions." Read: System1 web summary only; Billo whole; VidMob section.

**9. But early retention does go with a better click rank (measured now on an open dataset).**
- My analysis of 3,668 ads from TTCC v0.2.0 (6 of its 97 file parts), US TikTok Top Ads, Apr–May 2026, https://huggingface.co/datasets/liangyuch/ttcc-v0_2_0
- Proof: **B, unreviewed, selected (only top ads).** Outcome: clicking.
  - Median audience left at 1 s 38 %, 2 s 22 %, 3 s 16 %, 6 s 8.5 %.
  - Conversion ads: ones holding 34–88 % at 2 s are in the top-10 % CTR band **34 %** of the time, vs **3 %** for those under 15 % (463 ads each). Spearman retention vs CTR rank at 2 s: 0.25–0.30 by length; at 6 s: 0.29–0.34.
  - Median share of all clicks in the first 2 s 38 %, first 6 s 60 %; of conversions 11 % and 27 %. I read curve index 0 as second 0.
  - Caption: numbers, questions, "you" and offers made no difference (p 0.2–1.0); emoji captions ranked better (median top-25 % vs top-36.5 %, p=0.001, one ad per brand), exploratory, style-confounded.
- So a first-second scorer is learnable, but it explains a modest part of clicks and has no sales outcome.

**10. Branding in the first 2 seconds nearly triples memory, and does not cost attention when done well.**
- Who: System1/WPP Media/TikTok, Creator Effectiveness Playbook, 2026, https://pages.system1group.com/hubfs/The%20Creator%20Effectiveness%20Playbook%20-%20WPP%20Media_System1_TikTok.pdf ; 1,217 paid ads, 8 markets, 182,550 TikTok users, $70.5 M.
- Proof: **B.** 337 campaigns with measured lift: strong 2-second branding, creator ads +196 % brand memory, brand ads +47 %; high emotion +101 % to +114 %. Emotion + early branding explain 54.6 % of memory lift; engagement rate 0.2 %. Most entertaining ads +82 % six-second attention.
- Holds/not: memory, not sales. Conflict: Google 2016 (16 countries, "thousands" of TrueView ads) found early brand = more recall AND more skipping, unless the logo sits on the product. 39 % of creator ads show no brand cue.
- Hook (visual): olive-oil tin in the hand that opens the scene, brand spoken in the first line; "spoken brand name" had the top memory lift among cues (chart read from extracted text, UNVERIFIED value).
- Quote: "Strong Early Branding nearly triples Brand Memory Lift." Read: sections.

**11. A human voice in the ad lifts YouTube conversions; on-screen text and early brand a little.**
- Google Ads Help, "Creative guidance on YouTube", US, July 2026, https://support.google.com/google-ads/answer/18061165?hl=en . **D**, N unpublished, Google profits. Conversions, Demand Gen skippable in-stream: human voice +12 %, brand in first 5 s +4 %, text overlay +3 %.
- Hook (spoken): "I run a small workshop, and this chair takes us nine days."
- Quote: "Including a human voice drives 12% higher conversions on average (US, July 2026)." Read: section.

**12. Everyday people, direct to camera, hook better on TikTok than celebrities or logos.**
- VidMob x TikTok, 1,678 ads, 7.3 B impressions, 2023: https://vidmob.com/resource/tiktok-hook-analysis . **B.** Talking head: 2-s view-through +14 %, 6-s +5 %. Celebrity −13 % (6 s), logo overlay −14 %, product shot +17 %, outdoors −26 %.
- Toluna/MetrixLab for TikTok: 150 ads, 7,163 users, 163 coded features, https://tolunacorporate.com/building-brand-success-through-effective-hooks/ . **C.** Creators 1.7x more likely to hook than celebrities; text in first 5 s +26 % brand love; brand as hero +20 % purchase intent; a payoff better than the hook promised gives 2x purchase intent.
- Holds/not: System1 (finding 10) sees "someone talking directly to you" as lower attention. View-through is not sales.
- Hook (visual): dentist in her own surgery, close to the lens, holding the aligner.
- Quote: "Ads containing celebrities … had a -13% decrease in 6sVT". Read: whole.

**13. People in Reels ads: higher click rate.**
- Meta, Performance Playbook: human presence CTR +27 % (1.2 M Reels ads in the body, 2.2 M in the footnote; they disagree). https://nowbam.com/wp-content/uploads/2024/09/Reels-Performance-Playbook.pdf . **D.** Person plus expressive audio: 8 % more conversions per dollar; multiple audio types 21 % more (Meta inside AppsFlyer 2025).
- Conflict: AppsFlyer 2024 finds UGC ads +22 % installs-per-mille on social for non-games, but games WITHOUT UGC +20 %, so it depends on channel and sector.
- Hook (visual): face enters frame in the first second.
- Read: whole / section.

**14. The written hook beats the spoken-only hook, in organic short video.**
- Postdom, Oct 2026, 1,272 TikToks and Reels, 160 accounts, https://postdom.com/research/what-makes-a-video-go-viral (CSV, CC BY 4.0). **B, small.** Same-account comparison, views: on-screen hook 1.79x (95 % 1.22–2.69); spoken-only 0.62x; "as a dentist…" 3.16x (1.15–7.86; 30 videos); first-person story 1.74x (1.14–2.72); open loop 1.46x (1.13–1.89). Question 0.87, POV 0.86, secret 0.99, myth 1.13, how-to 1.16 and list-count 1.47 are not clear. Product close-up opening 0.56x; caption ending in a question 0.17x (23 videos). Hook length: no effect.
- Holds/not: best and worst videos oversampled; 88 % TikTok. Seller of video tools.
- Hook (on-screen + visual): "As a furniture maker, I never buy this kind of wood", shot in the workshop.
- Quote: "These multipliers are directional, because each account's best and worst videos were oversampled." Read: section + CSV.

**15. B2B video on LinkedIn: real people and memes beat the generic ad.**
- LinkedIn Creative Labs, 2025, 13,000+ B2B video ads, https://business.linkedin.com/content/dam/business/marketing-solutions/global/en_US/site/pdf/wp/2025/the-art-and-science-of-video.pdf . **D**, engagement or dwell, not leads: meme +111 %, real person +14 %, authentic emotion (brand awareness) +78 %, expert +40 %, supers +18 %, bold colours +15 %; top-of-funnel dwell: expert speaker +31 %, brand mention +48 %.
- Holds/not: LinkedIn profits; "generic ads" undefined.
- Hook: software, named engineer to camera: "We deleted 40 % of our tickets with one rule."
- Quote: "engagement lift … 111%" (extract). Read: sections.

**16. Attention scores trained on people relate to sales, in the sellers' own tests.**
- Realeyes/Adverteyes, Nov 2024, https://adverteyes.ai/adverteyes-ai-metrics-linked-to-sales-and-brand-lift-performance/ : 96 TV creatives, higher attention potential +30 % sales lift (p<3x10⁻⁵); 101 e-commerce creatives, +67 % purchase rate but p<0.15, not significant; 88 YouTube creatives +25 % brand lift (p<0.012). **B, vendor.** Kantar LINK: 970 cases; high predicted short-term sales = index 133, low 73; https://www.kantar.com/inspiration/advertising-media/can-ad-testing-really-predict-sales-impact
- Use: whole-ad predictors exist and validate; none isolates the hook. Read: whole.

**17. YouTube titles: short, negative and number-free did better, thumbnails with faces did not.**
- 1of10, 300,000 high-performing 2025 videos, 52,000 channels, views ÷ channel median: https://1of10.com/blog/what-actually-makes-a-youtube-video-go-viral-in-2025/ . **B.** ≤30 characters ~60 % more views; negative +22 % vs positive; numbers −11 %; text on thumbnail −19 %; faces no overall difference, help only above 200 K subscribers.
- Holds/not: survivors compared with survivors, so not causal. Vendor.
- Hook (title): "Never Buy This Olive Oil".
- Quote: "viral videos vs other viral videos". Read: section.

**18. Snap: call to action in the first 2 seconds, high contrast, little text.**
- VidMob/Snap 2022: 3,846 CPG, 2,882 finance, 7,572 entertainment ads, https://mediashotz.co.uk/what-makes-ads-perform-best-on-snapchat-vidmob-survey/ . **B.** CTA in 2 s: swipe-up +64 % for CPG, and +71 % (its category line was cut off in my extract, UNVERIFIED); contrast +40 % entertainment; <5 % text: CPG view rate +85 %.
- Hook: contrast product frame, "Swipe for the tester pack". Read: section.

**19. Pinterest pins: a 5–8 word overlay earns about 2x the clicks of no text.**
- GenSumo, 148,000+ pins, 2025–26, https://gensumo.com/research/pinterest-pin-design-report/ . **B, weak**: observational, vendor. No text 100, 1–4 words 135, **5–8 words 210**, 15+ words 108; 2:3 shape +45 % impressions vs square; person in lifestyle +23 % close-ups vs product only.
- Hook (caption on pin): "Oak table, 4 ways for small rooms". Read: section.

**20. Reels, simulated feed: product shown more than once and brand kept short.**
- Meta + Toluna, DE/UK/IT/TR, 100 ads x 100 people, secondary report https://ppc.land/meta-and-toluna-study-finds-emojis-lift-reels-purchase-intent-2-5x/ (May 2026). **C.** Likelihood of top-20 % purchase intent: hook with sight and sound 1.5x; product more than once 2.7x, with context 5.3x; brand ≤25 % of length 4.8x; CTA 1.9x; emoji 2.5x.
- Holds/not: 100 ads against 65 features is fragile. Intent, not purchase. **Covers Turkey.**
- Hook (visual): bottle opened, poured, tasted in the first five seconds. Read: section.

**21. The TikTok "2 seconds 50 % / 6 seconds 90 %" claim, traced.**
- Primary place: TikTok for Business, "Resonance" page, https://ads.tiktok.com/business/en-US/blog/resonance-key-factor-ad-effectiveness : "50% of the impact … in the first 2 seconds, and the first 6 seconds capture 90% cumulative impact on Ad Recall and around 80% for Awareness"; source line "Value of a View Internal Meta-Analysis, 2021". TikTok's own Creative Codes sheet dates the same claim to a 2020 guide. **D**, no N, no method published. It is **recall**, not watching or buying. Also in the sheet: suspense +16 % watch time, surprise 1.7x view-through (Lumen, US SMB 2021, N unstated). https://www.discover-tiktok.com/hubfs/Creative_Codes_One_Pagers.pdf
- The often-quoted "71 % decide in 3 seconds" is reversed: EyeSee's 60 ads, 7,280 people, says 71 % STAYED three seconds in a simulated feed. https://www.eyesee-research.com/knowledge/new-tiktok-creative-insights

**22. Meta's three text hooks (value promise, statement of intent, question): case studies only.**
- https://business.meta.com/news/the-science-of-the-hook-how-to-supercharge-your-reels-performance/ (Dec 2025). **E.** Castlery "I'm going to show you how I transformed my space": cost per purchase −78 %, confounded with partnership ads; Mapfre questions: assisted quotes +36 %; KiwiCo ROAS +30 %. None isolates the hook. Read: whole.

**23. E-mail subject length means nothing; emoji, coin flip.**
- Mailchimp: 12 billion sends, 2012, R² <0.12, https://jacobfilipp.com/maildata/this-just-in-subject-line-length-means-absolutelynothing/index.html . **B.** Phrasee: 470,000-person randomised test, emoji version won 60 % of tests, overall inconclusive, https://cdn2.hubspot.net/hubfs/4094824/Phrasee_EmojiOrEnoji.pdf . **A, weak.** Belkins finds 2–4 words best and Backlinko (12 M outreach mails) finds LONG best: the pair confirms Mailchimp.

**24. Landing page headline tests: small gains.**
- GoodUI, 650 tests: headline changes median +4.3 % (17 tests), home/landing screens +6.0 % (144), sales metric +2.1 %; "empowering headline" +5.9 % over 7 tests. https://goodui.org/insights/ . **A/B**; median test could only detect 10.3 %, and most per-pattern results are paywalled. Promise single digits, not doubles.

## (a) Contradictions
- View-through vs conversion: finding 8 against 9 (9 is clicks inside top ads; 8 is conversion lift).
- Direct-to-camera: VidMob + and LinkedIn + ; System1's playbook −.
- Early brand: System1, Toluna, Google 2026 + ; Google 2016 skipping; Creative Codes "subtle".
- Numbers: win in Chartbeat's headlines, lose on YouTube titles, nothing in TTCC captions.
- Storytelling: Motion weak (spend, holiday), Postdom 1.74x views, AppsFlyer social-media apps best D7 retention (8.4 %).
- Question hooks: Meta cases praise; Postdom 0.87x and TTCC no effect.
- BuzzSumo 100 M (shares; 11 words/65 characters best, https://buzzsumo.com/blog/most-shared-headlines-study/ ): its 2017 and 2020 top Facebook phrases overlap 0 %, so phrases expire.

## (b) Looked for, not found
Any published randomised "same body, different hook" data set with sales; a published hook-rate-to-ROAS correlation with a method (Billo has the data, does not publish ad-level); a primary for "47 % / 1.7 seconds" in today's feeds; Varos, Triple Whale, Smartly, Sensor Tower, Vidyard, HubSpot or Pencil hook results; X; Conductor and Outbrain primaries (only retellings); thumbnail A/B data with N; Wistia hook data (its 2026 report has 13 M videos but no opening analysis that I saw). "Hook formula" posts (10,000-ad Reddit list) have no outcome: left out.

## (c) Sources that refused
Exa and Tavily free limits (intermittent); parallel partly; thinkwithgoogle / business.google.com article pages returned only navigation (ABCD 2026, Shorts tips); Unskippable Labs was read only in part, as search extracts; TikTok quicktok "Power Creative Elements" HTTP 500; Pencil PDF 404-size; ACM paper 10.1145/3648188.3677048 abstract-level only; GoodUI pattern results members-only; Wistia report only section.

## (d) Datasets / libraries with outcomes (tested today without login unless said)
| Set | Size, outcome | Licence | Opened today |
|---|---|---|---|
| TTCC v0.2.0 https://huggingface.co/datasets/liangyuch/ttcc-v0_2_0 | 61,789 TikTok ads with video, CTR rank, per-second retention/CTR/CVR/click curves | "research only" label | **Yes**; tabular columns read remotely |
| emdashthree TT ads https://huggingface.co/datasets/emdashthree/TT-4-Million-plus-viral-ads-winning | 4.46 M, views/likes/saves, caption, on-screen text (winners only) | MIT (card) | Yes |
| lingbow engagement https://huggingface.co/datasets/lingbow/tiktok-video-engagement-1m | 1.04 M videos, 4,926 creators, daily panel (creator-relative) | CC BY-NC 4.0 | Yes |
| Upworthy archive https://upworthy.natematias.com/about-the-archive.html | 32,487 headline experiments, clicks; some Jun 2013–Jan 2014 tests may not be truly random (authors' 2024 notice) | Open | Yes |
| Postdom CSV https://postdom.com/research/what-makes-a-video-go-viral/data/summary.csv | 59-feature summary of 1,272 videos | CC BY 4.0 | Yes |
| ugcagent hooks CSV https://ugcagent.app/research/tiktok-hooks/tiktok-hooks-library-2026.csv | 76 real hooks with views or ad run-days | not stated | Yes |
| TikTok Creative Center Top Ads | CTR rank, curves | TikTok terms | Shell opens; ad cards did not render in my text fetch, so login need UNVERIFIED |
| Meta Ad Library | run start date (proxy for success), no CTR | Meta terms | **Yes**: ~5,000 results for "olive oil" |
| TikTok Ad Library, Snap Ads Gallery, LinkedIn, Pinterest Ads Repository, Google Transparency | creative and dates, little outcome | each | Search pages open without login; results not exercised |
| Motion calculator https://go.motionapp.com/benchmarks | hit rate by sector and spend | vendor | Yes (page); linked ad boards sit on its app domain, not tested |

**Scorer suggestion (inference, not measured):** train on TTCC 2 s/6 s retention and CTR rank, and test on our own sales data, because no public set carries sales. Treat hook score and offer/price score as two outputs (finding 8).