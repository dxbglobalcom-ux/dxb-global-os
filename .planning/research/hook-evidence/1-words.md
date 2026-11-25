# The tested science of WORDS as hooks (slice: bilim-metin)

**What the evidence says overall**
1. No wording trick is large. Single features move clicks about 2-13 %.
2. Writing 4 variants and testing them is worth about +25 % over the story's average headline. All the rules together are worth about +8 % (F1, F2).
3. Click and purchase often disagree (F7, F15, F18, F19). The library must record which outcome each pattern won.

**My own measurement.** The Upworthy archive is open, CC BY. I downloaded it and measured it:
- I kept only headlines tested against each other on the same story and the same picture. I dropped the window the archive's team flags as badly randomised (25 Jun 2013 – 10 Jan 2014).
- Confirmatory file: 9,936 groups, 156.5 M impressions, 1.82 M clicks. Disjoint exploratory + holdout files: 4,200 groups, 66.2 M impressions, 0.75 M clicks.
- "Mine" below means this measurement, with a 99 % CI. "Rep" is the same effect in the second, disjoint file.
- Feature detectors are keyword lists I wrote. Arms can differ in other ways too, so these are differences inside randomised tests, not single-word manipulations.
- Code and output: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/eae9dc30-29cf-48b1-8218-5b53dd8d5550/scratchpad/hook-kanit/bilim-metin/code/` (`upw.py`, `upw2.py`, `upw-out.txt`, `upw2-out.txt`).

---

## FINDINGS, strongest first

### F1. Write four different headlines and test them; that beats any rule.
- **Who:** data from Matias, Munger, Aubin Le Quéré, Ebersole, *Scientific Data* 2021, nature.com/articles/s41597-021-00934-7; analysis mine. Support: Ye, Yoganarasimhan, Zheng, "LOLA", arXiv 2406.02611 (2024).
- **Proof:** A. Outcome: clicking.
  - True spread of log CTR between headlines of one story and one picture: 0.254 (rep 0.255). The best of 4 true rates is about +30 % over average; the expected gap between best and worst of 4 is 1.69×.
  - After shrinking for noise, the measured winner is worth **+24.6 %** (median arm: 3,141 impressions, 31 clicks).
  - LOLA: an AI guess combined with live adaptive testing beat the plain A/B routine by 5.08 % in clicks, in simulation, at 1,000 impressions per headline.
- **Holds / not:** news and advocacy, US, 2013-15. Chartbeat: 141,000 tests on 293 sites. In repeated identical tests, "a majority changed winners about a quarter of the time" (niemanlab.org/2021/10/how-a-b-testing-can-and-cant-improve-your-headline-writing/; paper DOI 10.1080/21670811.2021.1984266, not opened).
- **As a hook:** olive oil. Write one line each as story, number, surprise and plain fact. Run all four on the same picture and keep the winner. All channels.
- **Quote:** "None of the pure-LLM-based methods can predict the best-performing headline with high accuracy." Read: LOLA sections; Upworthy descriptor sections; Nieman whole.

### F2. Nobody's taste picks the winner, neither people nor AI; a scorer trained on outcomes helps a little.
- **Proof:** A. Outcome: clicking.
  - Students, 202 and 339 people: 45.2 % and 51.6 % correct (chance 50 %) (LOLA appendix).
  - Journalists: 50 % (Shulman, Markowitz, Rogers, *Science Advances* 2024, PMC11152133).
  - GPT-4 prompts: 38-40 %. Embeddings with linear regression: 46.3 %. Fine-tuned Llama-3-8B: 46.9 %. Chance 33 %.
  - Linguistic features only: 54.4 % of pairs, "less than 60 % even for the pairs with the largest difference" (Gligorić et al., F3).
  - Newer models on 188 pre-screened clear-winner tests: GPT-4.1 as a plain reader 61.7 % top-1, versus 42.0 % for a ten-persona panel. Gemini 3.1 Flash-Lite 54.8 % versus 39.1 %. The **persona panel was worse** (Maiorano, arXiv 2609.25010, Nov 2026, one author).
  - Mine: a 38-feature scorer trained on one file. On the other file it got 65.1 % of statistically clear pairs and **+8.0 %** CTR over the average arm. Random choice got −0.4 %, longest headline +1.9 %.
- **Where not:** one publisher. The persona author calls it exploratory. On a supplementary Reddit set the panel won.
- **As a hook:** use a scorer to drop the weakest of 12 drafts, then live-test 4. Never let a score replace the test.
- **Quote:** "journalists performed no better than chance [50% accuracy, M = 3.09…]". Read: LOLA sections, Shulman sections, Maiorano sections.

### F3. A headline about one person ("she", "he", "I") beats a headline about "we".
- **Who:** Gligorić, Lifchits, West, Anderson, *PLOS ONE* 2023, registered report, doi 10.1371/journal.pone.0281682.
- **Proof:** A. 24,333 headline pairs; clicking. Logit coefficients: I +0.24, she/he +0.22, they +0.09, **we −0.15**. The authors re-ran without the bad window and found no difference.
  - Mine: she/her **+12.4 %** [9.4, 15.4], rep +11.0. He/his +9.3, rep +11.2. "A woman / man / teacher / mom…" +9.0, rep +7.2. I/my +5.6, rep +5.3. We/our/us **−4.9**, rep −5.2.
  - Meta ads agree in direction: first-person headlines won 81 % (F13; that study groups "we" with "I").
- **Where not:** TikTok, self-reported "my story" openings ×0.93, 23 accounts for and 22 against (F14). Short video does not reproduce it.
- **As a hook:** not "We press our oil cold" but "She picks the olives at 5 a.m. and presses them before lunch." Caption, headline, spoken.
- **Quote:** "The use of first-person singular pronouns (H6a; β = 0.24…) is positively associated, whereas the use of first-person plural (H6b; β = -0.15…) pronouns is negatively associated with headline success." Read: results and discussion sections.

### F4. A question headline loses clicks; say the statement.
- **Who:** Fang & Wheeler, *Journal of Consumer Psychology*, 9 Jul 2026, doi 10.1002/jcpy.70031. Replication: Ushno, Zenodo preprint 24282470, Nov 2026 (single author, pre-registered).
- **Proof:** A/B. Reddit 53,030 posts, academic titles 3,078,791, Upworthy 22,743 tests, lab 400. Ushno: 465 tests, odds of a click **−13.5 %** (OR 0.8645 [0.8335, 0.8966]; I² 75.8 %). Mine: ends with "?" **−10.8 %** [−12.6, −9.0], rep −13.2, −8.6 % with all features held; "starts with How" −9.1, rep −11.2. HypotheSAEs (Movva et al., ICML 2025) independently finds "asks a question directly to the reader" negative.
- **Where not:** Facebook brand posts 2011-12 (782 companies): questions raised **comments** (odds ×1.69) and cut **likes** (×0.83) (F15). TikTok: question openings ×0.89, no proven loss (F14); a 46,605-hook preprint found questions above direct address on like rate (contradiction a1). Meta fashion ads: question marks made no difference.
- **As a hook:** dentist. Not "Is your gum bleeding normal?" but "Bleeding gums are the first sign; here is the second." A question is for collecting comments.
- **Quote:** "question-framed titles reduce reader engagement because they are viewed as less informative." Read: Fang abstract only; Ushno results and limitations.

### F5. Put a digit in it.
- **Who:** Peters, Markowitz, Shoots-Reinhard, Ely, *Scientific Reports*, accepted 19 Oct 2026, s41598-026-77133-0.
- **Proof:** A. Washington Post 7,371 tests **+3.6 %** clicks. Upworthy 22,664 tests **+5.2 %**. Lab 765 (causal): "3" beats "three" and "several" on stated likelihood to read, a small effect (d = 0.04-0.10). Mine: has a digit +6.1 %, rep +7.6, +8.4 % with all features held. Twitter same-author pairs: numbers help (Tan, Lee, Pang, ACL 2014). Meta fashion ads: a number won 69 % (F13).
- **Where not:** Upworthy **money** −7.3 % (rep −8.2) and **percent** −7.3 % (rep −3.9, not significant). TikTok: a number changes nothing (p = 0.67).
- **As a hook:** furniture: "This chair was sat on 100,000 times before we sold it." On-screen, headline, thumbnail.
- **Quote:** "the presence (vs. absence) of at least one numeral ('3') in tests of headlines increased click-throughs … by 3.6% at The Washington Post and 5.2% at Upworthy". Read: about two thirds.

### F6. Say enough to be understood, hold back enough to be wanted: too vague loses, too complete loses.
- **Who:** Aubin Le Quéré & Matias, *Scientific Reports* 2025, 15:994, registered report.
- **Proof:** A. 8,977 tests, 35,910 headlines, clicking. Interaction −0.058, p < .0013. When the competing headlines are vague, the more concrete one wins; when they are very concrete, the vaguer one wins. Their Table 1 shows why earlier studies conflicted.
- **As a hook:** software. Too vague: "This changed everything." Too full: "Our invoicing tool cut late payments 31 % by SMS reminders." Middle: "One text message cut our late payments by a third."
- **Quote:** "headlines that convey just the right amount of information maximize clickthrough rates at scale." Read: abstract, theory, method, main results.

### F7. An unfinished teaser in front of a price LOSES buyers.
- **Who:** Mandler, Cziehso, Schaefers, Kupfer, Mafael, *Psychology & Marketing* 2024, doi 10.1002/mar.22098.
- **Proof:** C, five experiments. Study 1: **buying** 18.3 % (13/71) with an unfinished teaser versus 33.3 % (24/72) with a finished one, p = .039. Follow-ups show the negative effect holds for paid content, through readers recognising the sales tactic.
- **Where not:** free content is not harmed; curiosity helps there. Students, one real-choice study of 143.
- **As a hook:** cut-off cliffhanger only when the next step is free. At a paid step, finish the sentence: "Get the 7-step recipe" instead of "The secret step is…".
- **Quote:** "an unfinished teaser would have a detrimental effect on revenues generated by paid digital content." Read: main sections.

### F8. Simple, everyday words get clicked and read to the end.
- **Who:** Shulman, Markowitz, Rogers, *Science Advances* 2024, PMC11152133; Berger, Moe, Schweidel, *Journal of Marketing* 2023, doi 10.1177/00222429231152880.
- **Proof:** A for clicks: Washington Post 8,972 tests (r = .055) and Upworthy 22,664 tests (r = .022). Highly significant in the first, tiny in both. B for **reading on**: 649,129 page reads, over 35,000 articles; one SD easier to read gives about **25 % more likely to finish**, anxious language about 14 %; a follow-up experiment showed anxious 80 %, angry 71 %, sad 52 % continue.
- **Where not:** readability alone was null in Gligorić (β = 0.02). Simple is not short: on Upworthy the longest headline beat the shortest by 7.1 % (mine).
- **As a hook:** "Your roof leaks at the corner. Fix it in 20 minutes." Caption, spoken, landing.
- **Quote:** "Consumers are approximately 25% more likely to finish articles that use shorter words and sentences". Read: Shulman most; Berger results.

### F9. Surprise, a turn, and something to look at raise clicks; slogans, colons and shouting lower them.
- **Who:** mine; consistent with HypotheSAEs (Movva et al., ICML 2025, 14,128 test groups, held-out AUC 0.69).
- **Proof:** A, clicking.
  - Up: "until / then / turns out" **+11.4 %**, rep +11.4. Surprise words +10.1, rep +11.4. Video/photo/picture +9.7, rep +11.1. Watch/see/look +8.2, rep +9.0. Secret/truth/reason +6.8, rep +5.5. This/these +6.6, rep +5.6. Superlatives +6.2, rep +5.8.
  - Down: exclamation mark −8.2, rep −13.7. Colon −6.2, rep −9.3. ALL-CAPS word −5.2, rep −5.1. Quote marks −3.2, rep −4.0. Two sentences: zero.
  - HypotheSAEs, change in the chance of being the better headline: discomfort or embarrassment +16 points, being surprised or shocked +16, female subject's journey +14; collective responsibility −13; "initiatives that positively impact a community" −16.
- **Where not:** Meta fashion ads: exclamation marks, caps and superlatives made no difference (F13). This style also meets platform penalties (F10).
- **As a hook:** "He sanded the old table for an hour. Then the wood showed its real colour." On-screen, spoken.
- **Quote (HypotheSAEs):** "situations that evoke discomfort or embarrassment and mentions of offensive behavior increase clicks, while initiatives that positively impact a community decreases them". Read: results sections.

### F10. Clickbait costs shares, likes and trust.
- **Who:** Mukherjee, Dutta, De Bruyn, *JAMS* 2022, PMC8799425; Molina et al., CHI 2021, doi 10.1145/3411764.3445753.
- **Proof:** B. 19,386 articles, 27 publishers, Twitter. Raw shares **−48 %**, likes −41 %. After propensity matching, **48.6 fewer shares** per headline (p < .01). C: in Molina Study 1, non-clickbait got 2.22× the odds of "read more" against modal-type and 1.97× against question-type headlines; lists and wh-words were not worse.
- **Where not:** inside 2013-15 Upworthy, "you won't believe / wait till" still clicked about +10 % (88 tests, not significant at 99 %). Facebook then ranked such posts lower; after the 2017 change, only two such posts reached the old scale (BuzzSumo report, UNVERIFIED-SNIPPET).
- **As a hook:** keep the gap, name the subject: "This oil burns your throat. That is the good sign", never "You won't believe this oil".
- **Quote:** "a clickbait headline elicits on average 48.58 fewer shares than a non-clickbait headline (p < 0.01)". Read: results sections.

### F11. Negative words raise clicks on NEWS, by a little.
- **Who:** Robertson, Pröllochs, Schwarzenegger, Pärnamets, Van Bavel, Feuerriegel, *Nature Human Behaviour* 2023, registered report.
- **Proof:** A. Abstract: 22,743 trials, 370 M impressions. **+2.3 %** CTR per negative word, −1.0 % per positive word. Mine: negative-word presence +3.2, rep +4.3; positive word −0.2 (null). Shares: negative articles 1.91× more likely to be shared (Watson et al., *Scientific Reports* 2024, 95,282 articles; UNVERIFIED-SNIPPET). Outbrain: 65,000 paid links, negative superlatives +30 %, positive −29 % (Poynter, 2014; vendor data).
- **Where not:** the original re-run without the bad window held. But **NYT e-mailing** favoured positive and high-arousal content: anger +34 %, awe +30 %, anxiety +21 % per SD; sadness less (Berger & Milkman, *JMR* 2012, 6,956 articles). **Video ads** are shared for amusement, warmth and inspiration (Tellis et al. 2019, abstract). "Never" and "wrong" pay; fear-selling a product is not what was tested.
- **As a hook:** name the mistake: "The wrong way to store olive oil." Headline, on-screen.
- **Quote:** "For a headline of average length, each additional negative word increased the click-through rate by 2.3%." Read: main results.

### F12. Short, emotional e-mail subjects open more; a first name may not.
- **Who:** bol.com A/B test, *Advances in Social Sciences Research Journal*, article 3635 (minor journal); Sahni, Wheeler, Chintagunta, *Marketing Science* 2018; Defau & Zauner, *Marketing Letters* 2023, replication.
- **Proof:** A. bol.com, 1,409,963 customers, opens: control 24.3 %, personal 25.0 %, emotional 26.1 %, **short (18 characters) 26.9 %**. Sahni: name in subject, opens 9.05 to 10.80 % (+20 %), **leads 0.39 to 0.51 % (+31 %)**, unsubscribes −17 %. Replication: first name **−3.2 %** (not significant); title + surname to politicians **+11.8 %** opens.
- **Where not:** one wording per arm at bol.com; recent opens are distorted by mail-privacy features, so judge on clicks and sales. NextAfter, 555,223 sends: a curiosity subject gave opens 30.7 to 31.5 % (+2.6 %) and **0 % more donations**.
- **As a hook:** "Pressed this morning." rather than "Dear John, start your new year with our fresh oil".
- **Quote (Defau):** "we cannot replicate the findings from Sahni et al. (2018)". Read: Defau results; bol.com results; Sahni abstract; NextAfter page.

### F13. In paid Meta ads: sound like a person, give a number, cut adjectives.
- **Who:** Anyword (vendor of a copy scorer), Oct 2026, anyword.com/blog/meta-ad-copy-ab-test-results.
- **Proof:** D/E. 1,000 fashion A/B tests with a significant winner, over 23 M impressions, clicking. First person won **81 %**, "it's" 88 %, number 69 %, "tried / replaced / swear by" 69 %, winner longer 62 % (76 against 62 characters). Lost: filler words 31 %, "shop" 28 %, the word "review" 7 %. No difference: question, urgency, "% off", superlatives, caps, "you".
- **Where not:** only significant tests are kept, one sector, the vendor sells the cure. Primary text showed almost no pattern.
- **As a hook:** "I slept on this €90 mattress for a month. My back stopped complaining." Only with a true customer.
- **Quote:** "the long winners added specific detail, not adjectives." Read: whole.

### F14. On TikTok the wording of the opener barely matters; what the video gives, and text from second one, matter more.
- **Who:** UseNadia, measured 6 Oct 2026, usenadia.com/hooks (vendor); Nastišin et al., *Marketing and Management of Innovations* 2025, doi 10.21272/mmi.2025.4-04.
- **Proof:** B/D. 25,789 openers, 61 accounts (57 not in English, mostly French), views against the same account's neighbours. Useful takeaway ×1.23 (44 accounts for, 7 against). "If you…" as the opening ×1.36 raw, ×1.29 on the same subject (14 of 16 accounts, p = .004). Text on screen from the first second: 66 % of tops against 57 % of flops (p = .0006). Talking about your own account **×0.74, the only proven family**. "You" ×1.00 with the rest equal. All three levers 39 % hits against 18 % with none. Nastišin, 4,983 hooks: chosen words against views ρ = 0.02, p = .17, **nothing**.
- **Where not:** observational, views not sales, tech/AI-heavy examples. As one of its 18 families "If you…" shows only ×1.03, a signal and not proven. Mine agrees elsewhere: "If you / When you" start +4.6 %, rep +4.6; plain "you" +0.4 %, null.
- **As a hook:** "If your phone dies before dinner, change these two settings." Spoken and on-screen together.
- **Quote:** "The shape of the hook barely moves the needle; what the video gives the viewer weighs far more." Read: Nadia first half; Nastišin results.

### F15. Price and deal words cut likes and comments; warmth lifts them; that is engagement, not sales.
- **Who:** Lee, Hosanagar, Nair, *Management Science* 2018 (working paper PDF at mackinstitute.wharton.upenn.edu); 106,316 Facebook messages, 782 companies.
- **Proof:** B. Platform-corrected odds: PRICE comments ×0.73, likes ×0.67. DEAL ×0.85, ×0.82. EMOTION ×1.29, ×1.29. A photo ×1.68, ×1.92. Informative alone is negative; informative **with** emotion is positive.
- **Where not:** 2011-12, organic. In Meta ads a price in the headline appears in winners (F13).
- **As a hook:** organic: "My father still tastes every barrel." Ad: "This 500 ml bottle is $19, pressed in October."
- **Quote:** "persuasive content in isolation is preferred to purely informative ones." Read: results sections of the working paper.

### F16. Make it already theirs: "waiting for you".
- **Who:** Milkman et al., *PNAS* 2022, PMC8833156.
- **Proof:** A. 689,693 people, 22 texts, **real behaviour (getting a flu shot)**. Average +2.0 points (6.8 %). Best: "A flu shot is waiting for you", two texts 72 h apart, **+2.9 points (+9.9 %; 2.7 points after shrinkage)**. The authors failed to predict it.
- **Where not:** reminders to existing pharmacy customers; not cold ads.
- **As a hook:** "Your check-up slot is waiting for you, Thursday." E-mail, SMS, retargeting.
- **Quote:** "Neither experts nor lay people anticipated that this would be the best-performing treatment". Read: main sections.

### F17. "Most popular" sells when it informs a choice; like-counts on a pushy ad do not.
- **Who:** Cai, Chen, Fang, *AER* 2009; Browne & Jones, Qubit 2017 (PwC-assured method); *Information Systems Research* 2025, doi 10.1287/isre.2021.0606.
- **Proof:** A, **buying**. Restaurant top-5 list: demand for those dishes **+13 to +20 %**. Qubit, revenue per visitor: social proof +2.3 % (119 tests). Against: Facebook field tests, "likes" on call-to-action ads had no effect, and a friend's endorsement **lowered** clicks. Hotel towels: the German replication was null (PLOS ONE 2014), yet seven experiments pooled show +6.2 % (Scheibehenne et al. 2016).
- **As a hook:** "The bottle our regulars reorder most." Only if counted.
- **Quote:** "the demand for those dishes increases by 13 to 20 percent." Read: abstracts; Qubit most.

### F18. Low stock adds a little real revenue; a countdown less; short deadlines can hurt.
- **Who:** Qubit 2017; Barton, Zlatevska, Oppewal, *J. Retailing* 2022; Ladeira et al. 2023; Bertrand et al., *QJE* 2010; Damgaard & Gravert 2017.
- **Proof:** A. Qubit revenue per visitor: stock pointers **+2.9 %** (125 tests), countdown +1.5 % (119), call-to-action wording **−0.3 %**; 90 % of all experiments move revenue under 1.2 %. Lab meta-analyses: intention 0.31 [0.25, 0.37] (Barton, 416 effects; UNVERIFIED-SNIPPET, two secondary pages agree that only 6 effects are from the field); 0.28 (Ladeira; demand-caused scarcity beats supply-caused). Against: South African loan mailing, "demand strongly increases with **longer** deadlines"; Danish charity, about 53,000 donors, deadlines no effect.
- **Where not:** must be true. A false countdown is deception and falls outside the holding's principle.
- **As a hook:** "Only 41 bottles of this harvest left. Last year's ran out in October."
- **Quote (Qubit):** "90% of experiments have an effect of less than 1.2% on revenue". Read: Qubit most; Ladeira results; others abstract.

### F19. Expert and statistic ads get the click; the "because" ad gets the sale.
- **Who:** Haans, Raassens, van Hout, *Marketing Letters* 2013, doi 10.1007/s11002-013-9226-5.
- **Proof:** A/B (search-ad field data; abstract only, N not seen). Expert and statistical evidence: higher **click** rate. **Causal evidence: higher conversion** than the others.
- **As a hook:** first line "Dentists pick this brush" (click); landing first line "Softer bristles bend, so gums stop bleeding" (sale).
- **Quote:** "causal evidence results in higher conversion rates than other types of evidence." Read: abstract.

### F20. Concrete words sell: "the black leather boots", not "those".
- **Who:** Packard & Berger, *J. Consumer Research* 2021, doi 10.1093/jcr/ucaa038.
- **Proof:** B. Service e-mails. +1 SD concreteness gives 90-day **spending** +30 % ($32.73 to $42.80); the conservative model gives **+13 %** ($4). Mechanism: feeling listened to. Upworthy full-model concreteness positive (Banerjee & Urminsky, 2021 exploratory draft; final 2024 *Marketing Science* full text refused).
- **Where not:** correlational, replies rather than cold hooks; F6 shows a ceiling.
- **As a hook:** "The oak drawer that closes without a sound."
- **Quote:** "A one standard deviation increase in concreteness corresponded to a more than $10 (30%) increase in average customer spending". Read: study 2 extract.

### F21. Match the ad's words to what was searched.
- **Who:** Amazon, arXiv 2506.17863 (2025); Reisenbichler et al., *Marketing Science* 2025 (MSI 23-136).
- **Proof:** A. 10,000 keywords: clicks **+8 % mobile, +9 % desktop**, but CTR itself not significant (p = .23, .11): the gain is more impressions. The second paper: keyword-specific AI text plus human edit 2,002 clicks against 1,418 for agency ads (education, B2C).
- **As a hook:** search "quiet dishwasher": headline "Quiet dishwasher, 38 dB".
- **Quote:** "keyword-focused ad copy outperformed template-based ads". Read: experiment sections.

### F22. Personal details in an ad work only when people feel in control.
- **Who:** Tucker, *JMR* 2014 (MIT working paper).
- **Proof:** A for the ad text, natural experiment for the control. Before Facebook's privacy controls personalised text did not win; after, **nearly twice** the clicks.
- **Where not:** Matz et al. *PNAS* 2017 ("up to 40 % more clicks, 50 % more purchases", personality-matched) was **not randomised by user** (Eckles, Gordon, Johnson, PNAS 2018, opened as search extract).
- **As a hook:** call out the situation ("If you rent…"), not the private fact.
- **Quote (abstract):** "users were nearly twice as…" likely to click on personalised ads (search extract; the quoted sentence was cut in what I saw; the body says "twice as likely"). Read: abstract and results.

### F23. Cut the message: 127 words to 49 nearly doubled response.
- **Who:** Rogers & Lasky-Fink, Boston Globe 19 Dec 2020.
- **Proof:** A, reported by the authors. 7,002 school leaders: 2.7 to **4.8 %** clicked (+80 %). Of 148 lay people, 67 % had predicted the long one.
- **As a hook:** e-mail body and caption: one request, under 50 words.
- **Quote:** "Cutting the number of words by two-thirds increased the response rate by 80 percent." Read: article extract.

### F24. A stopped story is resumed, not remembered.
- **Who:** Ghibellini & Meier, *HSS Communications* 2025 (meta-analysis); Lee, Kumar, Sudhir, SSRN 5318650 (2026).
- **Proof:** C. Zeigarnik memory advantage: ratio 0.99, **none**. Ovsiankina resumption: **67 %** return to the interrupted task. B: in serial fiction, "monetization remains concentrated at episodes with stronger continuation incentives".
- **As a hook:** series: stop inside an action the viewer started ("Step 2 of 3, do it with me"). Do not cite Zeigarnik.
- **Quote:** "We found no memory advantage for unfinished tasks but found a general tendency to resume tasks." Read: abstract and discussion; SSRN abstract.

### F25. "Loss beats gain" is not a general law.
- **Who:** O'Keefe & Jensen 2006.
- **Proof:** C meta-analysis. 165 effects, N = 50,780; prevention messages favour gain (r = .046), detection r = −.027 (not significant).
- **As a hook:** dentist prevention: "Keep your own teeth at 70" before "Lose your teeth".
- **Quote:** "loss-framed appeals are not generally more persuasive than gain-framed appeals." Read: abstract and results.

**Practitioner evidence (E), kept apart:** Obama 2012, 13 tested versions of one e-mail: "I will be outspent" beat several runners-up by a projected **$1.5 M** and raised $2.6 M in one day (Alter, WIRED 2013). Selection by test, not by rule.

---

## (a) Contradictions
1. **Question:** loses clicks and Reddit engagement (F4); wins comments (F15); in the 46,605-hook TikTok preprint (Mishra, OSF rj2mz_v1) beats direct address on like rate (0.036) though "how-to" does worst. That data is a convenience sample skewed to popular accounts.
2. **Money/price:** loses on Upworthy and in Facebook likes; wins in Meta shopping ads. Likely context.
3. **"You":** null on Upworthy (mine and Gligorić), null on TikTok, null in Meta ads; one Facebook field study plus lab found involvement up, not in collectivist readers (Cruz et al. 2017, abstract).
4. **Urgency:** small positive on shop pages; null or negative in letters, donations and Meta ads; positive on TikTok like rate (Mishra).
5. **Length:** longer wins in headlines (Upworthy, Meta); shorter in e-mail subjects and bodies.
6. **Negative against positive:** clicks on news against sharing of ads (F11).

## (b) Looked for, not found
- Any randomised test of *spoken* first lines on short video with watch time or sales.
- Any public, large A/B archive of ad copy with purchase outcomes.
- A randomised field test of curiosity against clear ad headlines measured on sales.
- A field replication of Loewenstein's information gap for adverts. Golman and Menon & Soman not opened beyond abstract.
- LinkedIn or Google own-copy experiments (left to the platform slice).

## (c) Refused or partial
- Banerjee & Urminsky 2024 final text; Fang full text; Haans full text; Barton PDF (two hosts); Bloomberg Obama piece; Sahni and AER (abstracts only).
- Reddit PDF (extract read instead); Hugging Face search API (rate limit), so its dataset list is incomplete.
- Disfluent fonts (Meyer et al. 2015: 17 studies pooled, no effect) read as abstract only; it kills "hard-to-read makes people think".

## (d) Datasets for a hook scorer

| Dataset | Size | Outcome | Licence | URL |
|---|---|---|---|---|
| Upworthy Research Archive (**downloaded and used**) | 32,487 tests, 150,817 arms, 538 M impressions | randomised CTR | CC BY 4.0; drop 25 Jun 2013 – 10 Jan 2014 | osf.io/jd64p |
| Yanjo/headlines-ctr | 14.2 k pairs (Upworthy, ready-made) | CTR pairs | not stated | huggingface.co/datasets/Yanjo/headlines-ctr |
| MIND (Microsoft News) | ~160 k articles, 15 M+ impression logs, 1 M users | clicks, not randomised | not confirmed | learn.microsoft.com (azure open-datasets, dataset-microsoft-news) |
| Reddit resubmissions (SNAP) | 132,308 posts, 16,736 images | votes, same image with different titles | not confirmed | snap.stanford.edu/data/web-Reddit.html |
| Webis-Clickbait-17 | Twitter posts rated for clickbait strength | human score (JAMS added shares) | CC BY 4.0 | zenodo.org/records/5530410 |
| AdParaphrase v2.0 (Japanese company, ad texts) | 16,460 ad-text pairs, 10 judges each | human preference, not clicks | CC BY-NC-SA 4.0 | github.com/CyberAgentAILab/AdParaphrase-v2.0 |
| News Popularity, multiple platforms | not confirmed | Facebook, Google+ and LinkedIn feedback | not confirmed | archive.ics.uci.edu/dataset/432 |
| TikTok-10M | 10 M posts with text and counts | views, likes | not confirmed | huggingface.co/datasets/The-data-company/TikTok-10M |
| MicroLens-1M | short videos, titles, covers, user interactions | interactions | not confirmed | recsys.westlake.edu.cn |
| Social Growth Engineers hook list | 4,983 (Nastišin), 46,605 (Mishra) | views, likes, comments | not confirmed, not opened | named in both papers |
| NextAfter experiment library | individual A/B pages | opens, clicks, gifts | web pages, no bulk file | nextafter.com/experiments |

The Washington Post test data were given to researchers under an agreement; the OSF folder (nwsgf) shows only the Upworthy file.

**Not done:** `report.md` was not written, because my harness forbids report files; this message is the whole report. My scripts, outputs and the downloaded papers are in the folder named at the top.