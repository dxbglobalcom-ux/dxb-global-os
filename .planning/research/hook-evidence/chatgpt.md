# ChatGPT's own answer, as its page gave it (2026-11-25 09:35; the page text broke off inside its section 6; the chat was a temporary one and is gone)

ChatGPT said:

I’ll separate causal split-test evidence from observational platform data, and distinguish attention, retention, clicks and actual sales. I’ll also check which datasets expose usable outcome labels.

Searched the web
ChatGPT said:
The science of hooks: what stops people, keeps them watching and makes them buy

The most important distinction in the research is that an attention-winning hook, a retention-winning hook and a sales-winning hook are not necessarily the same hook.

For an AI-native creative production system, this distinction is fundamental. Training a hook-scoring model exclusively on viral videos, click-through rates or three-second views risks producing an engine that optimizes entertainment rather than commercial performance.

The evidence needs to be separated into four outcomes:

Outcome

Appropriate measurement

STOP

Scroll-stop rate, initial gaze, 1–3-second view rate

WATCH

Retention curve, skip probability, watch duration

CLICK

CTR, email opens, outbound clicks

BUY

Purchases, incremental sales, revenue per impression, CPA, ROAS

I rank the evidence by methodological strength, not by the size of the reported effect.

Grade A: Randomized field experiments and controlled A/B archives.

Grade B: Controlled laboratory experiments, preregistered analyses and replicated findings.

Grade C: Large observational platform and advertising-industry datasets.

Grade D: Practitioner or vendor research with measurable outcomes but important methodological limitations.

Random assignment to entire creative variants does not automatically prove that every linguistic or visual feature within those variants independently caused the outcome.

1. Direct answers to the five strategic questions
Does surprise, danger or an event in the first second outperform other openings?

For watching: there is supporting evidence for surprise and suspense, but not proof of universal superiority in the first second.

Teixeira, Wedel and Pieters' 2012 controlled video-ad research distinguishes the attention effects of surprise from the engagement effects of joy. It does not establish that a dangerous event in frame one beats every competing opener, nor does it establish a purchase effect. Research paper.
Sage Journals
+1

For selling: no universal superiority has been established. One particularly relevant 2026 observational working paper examined the opening two seconds of 3,340 TikTok Shop videos. Commercially relevant opening messages showed stronger revenue-per-view results than several conventional attention-oriented approaches.

Which openings appear strongest for selling rather than views?
TikTok Shop — revenue per view by opening type
MediaLabs, October 2026 · 3,340 analysed videos · Observational

Price or offer

1.53×

Bold claim

1.28×

Question

1.27×

Relatable POV

1.05×

Problem call-out

1.00×

Immediate demo

0.89×

Unboxing reveal

0.88×

1.00× = sample average. Not randomized. Revenue and views are estimated.

Original working paper

This is unusually relevant research, but it sampled top-selling videos during a single month. Product category, pricing, creator quality and paid promotion can explain some of the differences. Treat the findings as hypotheses to prioritize, not proven causal multipliers.
MediaLabs Research
+1

What percentage of new ads become winners?
Motion Creative Benchmarks 2026
~5%

Approximate creative winner rate

Unique creatives
578,750
Advertising accounts
6,015
Ad spend
$1.29B
Winner frequency
~1 in 20
Winner definition: at least 10× the account's median creative spend and at least $500 in total spend.

Original benchmark and definition

Importantly, this is a spend-based winner definition, not proof that 5% of all advertisements generate profitable incremental sales. It is useful as an operational creative-testing benchmark, not a universal law.
Motion

How strong is the link between early attention and sales?

There is no defensible universal coefficient that converts a higher three-second view rate into higher sales.

The relationship is mediated by the relevance of the attention, the buying audience, the product, the offer, the persuasive content that follows and the distribution mechanism.

For your scoring system, I would distinguish commercial attention from raw attention. A visually shocking opening that attracts an irrelevant audience may improve retention without improving revenue.

2. Evidence register: 27 quantitative findings

These are 27 findings, not 27 independent studies. Several come from the same experimental archive, so they must not be counted as independent replications.

Source verification notation:

Opened: I successfully accessed the source page and its supporting content.

Abstract: I accessed the published abstract but did not verify the complete experimental tables.

Snippet: The result was available through search indexing, but full-source verification was unsuccessful.

Tier A — Randomized field experiments and controlled headline archives

#

Tested pattern

Researcher, year and N

Outcome and effect size

Failure, limitation or boundary

Source

1

Adding a negative word can increase headline engagement.

Robertson et al., 2023; 22,743 experiments, ~105,000 variants, 370M+ impressions

CTR +2.3% per negative word, relative

News consumption, not sales or video retention

Published abstract

2

Positive wording does not necessarily attract more clicks.

Robertson et al., 2023; same archive

CTR −1.0% per positive word

Another registered analysis did not confirm a significant positive-language penalty

Paper — snippet

3

Addressing the recipient by name can increase email opens.

Sahni, Wheeler & Chintagunta, 2018; millions of recipients across three companies; exact main-arm N not verified

Opens 9.05% → 10.80%, approximately +20%

Failed to replicate in a 2023 student experiment

Stanford — abstract

4

Subject-line personalization can improve downstream lead generation.

Sahni et al., 2018; same research programme

Sales leads 0.39% → 0.51%, +31%

Leads are not completed purchases

Stanford — abstract

5

The familiar first-name personalization technique can lose effectiveness.

Personalized Subject Lines replication, 2023; two randomized experiments; exact N not verified

Student email opens −3.2%, statistically insignificant

Different audience, period and campaign context

Springer — opened

6

Formal personalization with title and surname can still improve opening rates.

Same 2023 replication; politician sample

Opens +11.8%; CTR +14%, but insignificant

More opens did not establish reliably more clicks

Springer — opened

7

A first-person singular narrative can improve headline competitiveness.

Linguistic Effects registered report, 2023; 24,333 confirmatory headline comparisons

Winner log-odds coefficient +0.241

News headlines only; not purchase conversion

Full paper — opened

8

A third-person singular narrative can outperform less personal phrasing.

Same registered report and N

Winner log-odds +0.216

Does not prove that adding a person to every hook improves results

Full paper

9

Collective first-person phrasing is associated with weaker headlines.

Same registered report and N

Winner log-odds −0.149

Did not show a significant effect in the initial exploratory sample

Full paper

10

Directly addressing the reader with “you” is not a reliable headline advantage.

Same registered report and N

Winner log-odds +0.051, p=0.044

Failed the preregistered significance threshold of 0.01

Full paper

11

Longer headlines sometimes perform better than shorter ones.

Same registered report and N

Winner log-odds approximately +0.07

Conflicts with the universal “shorter is better” rule; complexity and length are different variables

Full paper

12

Concealing too much information in a curiosity headline can reduce engagement.

When Curiosity Gaps Backfire, 2025; 8,977 confirmatory experiments

Increasing concreteness was predicted to benefit 8.7% of headlines and harm 50.9%

Nonlinear effect; these percentages describe applicable headline groups, not CTR lift

Nature — snippet

13

Simple linguistic rules have limited power to identify winning headlines.

Linguistic Effects registered report, 2023; 24,333 comparisons

54.42% held-out winner-prediction accuracy versus 50% chance

Strong statistical significance, but weak practical predictive power

Full paper — opened

The headline evidence is especially useful because it contains both positive results and failed hypotheses.
PMC
+4

Finding 13 is particularly important for AI creative engineering: even with thousands of randomized comparisons, a relatively simple language-feature model achieved only about 54% pairwise accuracy. A rule-based hook checklist should not be mistaken for a reliable winner-prediction engine.

Tier B/C — Video advertising and commercial hook performance

The next findings concern video specifically. Their commercial relevance is higher, but the causal certainty is generally lower.

#

Tested pattern

Researcher, year and N

Outcome and effect size

Failure, limitation or boundary

Source

14

Opening with on-screen text is associated with more conversions.

TikTok, 2021; thousands of auction ads, exact N undisclosed

Text within 7 seconds: +43% conversion

Not validated in Brazil, Japan or North America; not specifically first-second evidence

TikTok — opened

15

Multiple scenes outperform an uninterrupted sales presentation in some ecommerce ads.

TikTok, 2021; same study

+38% conversion

Scene changes were not independently randomized

TikTok

16

Combining spoken product explanation with a visible offer is associated with more conversions.

TikTok, 2021; same study

+87% conversion

Not validated in Europe or Brazil

TikTok

17

Making the offer or desired action explicit in text is associated with higher conversion.

TikTok, 2021; ecommerce subset

+80% conversion

Full-ad attribute rather than an isolated hook experiment

TikTok

18

Early suspense can increase viewing duration.

TikTok/Lumen, 2021; exact N not verified

+16% watch time

No corresponding purchase uplift established

Creative Codes — snippet

Tier C/D — Opening-specific sales observations

All the following MediaLabs results come from its October 2026 working paper. The researchers analysed 3,340 videos from a larger collection of 13,309 top-selling TikTok Shop videos across 29 product categories.

The outcome is estimated revenue per view relative to the sample average, not randomized incremental sales.

#

Opening pattern

Subgroup N

Measured commercial outcome

Limitation

Source

19

Lead with a price, discount or offer.

193

1.53× revenue/view; 90% interval 1.37–1.71

Price and product-category confounding

MediaLabs — opened

20

Lead with a bold claim.

478

1.28×; interval 1.20–1.37

Claim strength and product quality are not controlled

MediaLabs

21

Open with a question.

184

1.27×; interval 1.13–1.43

Does not establish which questions work best

MediaLabs

22

Starting directly with a product demonstration does not necessarily maximize sales.

242

0.89×; interval 0.80–0.98

Observational; not evidence against demonstrations later in the ad

MediaLabs

23

An unboxing reveal is not automatically an effective sales opener.

122

0.88×; interval 0.76–1.02

Interval includes average performance

MediaLabs

24

Borrowed viral, film or television footage can underperform commercially.

41

0.76×; interval 0.60–0.97

Small sample; differences between creators may explain the effect

MediaLabs

25

Product close-ups may improve revenue efficiency.

147

1.15×; interval approximately 1.00–1.32

Borderline evidence; not a universal opening rule

MediaLabs

26

AI-generated opening footage has not demonstrated reliable commercial superiority.

20

1.37×; interval 1.00–1.87

Very small subgroup; inconclusive

MediaLabs

27

Only a small minority of creatives receive substantially scaled advertising spend.

Motion, 2026; 578,750 creatives

Approximately 5% winners

Spend-based outcome, not incremental profitability

Motion — opened

TikTok For Business Blog
+3

Evidence-quality caveat: Findings 14–18 do not have a fully disclosed numerical sample size in the material I verified. Findings 19–26 have sample sizes and outcomes but come from an unreplicated observational vendor working paper. Neither group should receive the same evidential weight as randomized field experiments.

3. The first-second hook: what can actually be concluded?

Opening mechanism

Evidence for watching

Evidence for selling

Surprise

Supporting controlled research

Insufficient direct evidence

Danger or threat

Not established for first-second video openings

Insufficient

Unexpected event

Plausible attention mechanism

Insufficient

Suspense

Positive watch-time evidence

Insufficient

Commercial offer

Insufficient direct retention evidence

Positive observational evidence

Bold product claim

Insufficient direct retention evidence

Positive observational evidence

Relevant question

Positive commercial observations

Positive observational evidence

Unrelated viral footage

Not established in the cited data

Negative commercial association

Immediate demonstration

Context-dependent

Mixed evidence

The conclusion is not that surprise hooks are ineffective. It is that the available evidence does not justify automatically ranking surprise, danger or a dramatic event above every other opening.

An important missing experiment would compare the following with the same audience, product, offer, body and CTA:

Proposed controlled hook experiment
Variant A

Unexpected event

A sudden visual change

Variant B

Benefit first

The customer outcome

Variant C

Offer first

Price or commercial incentive

Variant D

Product evidence

Visible proof of performance

Identical remainder of the advertisement

Same body, duration, audio strategy, offer and CTA

Stop

Watch

Click

Buy

This experiment would answer the commercial question much more directly than comparing unrelated viral videos.

4. Public datasets for training and testing a hook scorer

These are the most relevant public resources I identified. They should not all be treated as equivalent sources of ground truth.

1. Upworthy Research Archive

Highest priority for text

32,487 experiments, approximately 538 million impressions and 8.18 million clicks.

Includes headline text, impressions, clicks, experiment identifiers and image identifiers.

Ideal for within-experiment headline ranking and CTR prediction.

Limitation: no sales, actual image files or video-retention data.

Dataset download · Data documentation · GitHub

2. KuaiRand

Highest priority for watch behaviour

27,285 users, 32 million video IDs, 322 million total interactions and approximately 1.19 million randomly exposed interactions.

Includes viewing duration, engagement signals, video features and randomized exposure data.

Limitation: not a complete raw-video-to-purchase dataset. Requires suitable visual features or linked media to score the opening frames directly.

Official dataset · GitHub

3. MicroLens

Multimodal video training

Public versions include 50,000-user and 100,000-user subsets with raw multimodal content.

Useful for analysing video frames, audio, text and associated engagement interactions.

Limitation: the public interaction data does not provide complete per-viewer retention curves or sales outcomes. Repository identified through search indexing.

Official GitHub repository · Alternative repository

4. KuaiRec

4.68 million interactions in its small, nearly fully observed user-video matrix.

Useful for watch-ratio prediction, exposure-bias research and evaluation of recommendation models.

Limitation: raw opening footage and purchases are not established as available. Dataset statistics obtained from indexed research.

GitHub repository

PubMed Central (PMC)
+5
Critical data-quality warning: Upworthy

The archive maintainers published an update in June 2024 identifying potential randomization problems in approximately 22% of the original experiments.

They recommend excluding affected experiments from confirmatory research. They also report that previously published findings examined with six research teams were not materially altered.

If you build a training pipeline on Upworthy, incorporate the archive's randomization-risk flags rather than blindly consuming the complete CSV.

Original archive quality warning.
The Upworthy Research Archive

What is still missing from public datasets?

I did not verify a comprehensive public dataset containing all of these fields together:

Original advertisement video and its first frames.

Frame-level attention measurements.

Second-by-second retention.

Impression and click counts.

Purchases, revenue and acquisition costs.

Randomized hook variants with identical advertisement bodies.

That missing combination represents an opportunity to develop a proprietary dataset through your own creative production and advertising infrastructure.

5. How good are existing hook prediction models?
Measured predictive performance

Headline winner prediction

54.42%
Registered 2023 research · held-out pairwise accuracy · chance = 50%

TikTok sales prediction

0.641 AUC
MediaLabs 2026 · time-split evaluation · possible outcome leakage
Accuracy and AUC are different metrics and should not be directly compared.

Sources: Registered headline study and MediaLabs working paper.

The MediaLabs researchers explicitly disclose possible outcome leakage in their predictive model. Its measured AUC therefore should not be adopted as a clean benchmark for a production system.

The larger point is that statistically useful hook signals exist, but reliable prediction remains difficult.

6. Recommended architecture for an AI-native Hook Intelligence Engine

Based on the evidence, I would not build a single-model system that simply gives every video a hook

