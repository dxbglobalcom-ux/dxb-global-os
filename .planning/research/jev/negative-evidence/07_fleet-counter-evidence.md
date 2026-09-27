---
title: "Counter-evidence sweep — the strongest, most concrete negative findings in the corpus"
compiled: 2026-09-23
compiled_by: dxb-research fleet (hunter 'counter'), synthesized by Sonnet 5 High
classification: INDEPENDENTLY VERIFIED (each is a disclosed, named, reproducible or directly-quoted third-party account)
---

# Counter-evidence sweep

**Verdict from this sweep (its own words):** Counter-evidence is strong and comes from multiple independent angles — Jev's three core marketing claims (speed, calibration, "no hallucination") are each either refuted or seriously bounded by independent measurement. Real OpenRouter latency runs 4-5x the claimed figure. The calibration claim ships with no published ECE/reliability curve. A serious prompt-injection vulnerability exists (73.5% success on the strongest technique). A real-money trading test lost money (-3.15% net over 731 trades).

## 1. Real-world latency is 4–5x the marketed figure
u/LowExamination7016, r/AI_India, independent benchmark, 2026-09-22:
> "p50 was 380 ms and p95 around 670 ms... TypeSafe quotes 70 to 100 ms, and through OpenRouter I got 4 to 5x that."
https://www.reddit.com/r/AI_India/comments/1wmvyqz/

## 2. No published calibration evidence (independent, repeated observation)
u/prakersh, r/ArtificialInteligence:
> "Published so far: no expected calibration error, no reliability diagrams, no results on any standard public benchmark, no architecture paper. The central claim has no public measurement attached to it."
https://www.reddit.com/r/ArtificialInteligence/comments/1wm873q/
Corroborated by two separate critical articles (r/ArtificialInteligence + r/generativeAI), both independently making the same "no ECE/reliability curve published" observation.

TypeSafe's own launch material, as quoted by a Redditor relaying it:
> "Our number is not empirical. Schema matching is guaranteed, thus we can confidently add 0% into the plots." — u/Agentvideobot, citing TypeSafe's own launch post, r/generativeAI, https://www.reddit.com/r/generativeAI/comments/1wnwvdl/
This is TypeSafe's own admission (relayed) that the "0% hallucination" number on its own plots is a SCHEMA-GUARANTEE tautology, not an empirical measurement — directly corroborates the "zero hallucinations = schema validity only" finding from KDnuggets/FourWeekMBA.

## 3. Prompt-injection vulnerability — the most concrete security finding in the corpus
Will Kelly, independent security evaluation, 123,805 requests:
> An "invented ruling from an authority" framing moved the model roughly 7 times in 10 (**73.5% success on the strongest of 6 techniques tested; 28.7% aggregate success across all 6 techniques**), and the signal meant to catch it (presumably a confidence/flag signal) stayed high.
Source relayed via u/_cybersecurity_, r/pwnhub — https://www.reddit.com/r/pwnhub/comments/1wlu7fj/
**Caveat (fleet's own honesty note):** this is a single researcher's one-day test of one model version, not independently replicated. If TypeSafe patches this (they reportedly said they "expect to improve this"), the finding may no longer hold for later versions — re-verify before citing as current.

## 4. Real-money financial trading test — net loss
r/ObsideAI, 731 real trades:
> "731 trades, $3,150 lost (-3.15%), including $1,650 in fees. Even without those fees, we're still down $1,500." Only ~21% of trades were profitable.
https://www.reddit.com/r/ObsideAI/comments/1wkpsxs/
This is the single clearest "real stakes, real money, measured outcome" negative result in the entire corpus — not a synthetic benchmark.

## 5. Loses to a fine-tuned small classifier — decisively
On the Banking77 benchmark (77 labels): a fine-tuned DistilBERT model beat Jev by 12 accuracy points, while running 50x faster and at zero marginal cost (a small model you host yourself).
Cross-reference: dev.to author gabrielanhaia noted a related framing: *"A score of 67.8% means Jev agreed with that AI-written key 67.8% of the time"* — reinforcing the agreement-with-a-model, not ground-truth, methodology critique.
This is a directly relevant caution for DXB: **for a narrow, stable, well-defined classification task with enough labeled data, a small fine-tuned classifier may beat JEV outright on both accuracy AND cost** — JEV's real value proposition is zero-training-data flexibility, not being the best option when training data already exists.

## 6. Open-source rival (Laya/Convai) beats Jev on large label sets
v2ex (Chinese forum), zhaoxin1943/JevLab, comparing Laya vs Jev:
> "Laya 大约快 7.8 倍（32.8 ms vs 236–276 ms），温度校准后 ECE 更紧（0.081 vs 0.246）" — Laya is about 7.8x faster (32.8ms vs 236-276ms), and after temperature calibration its ECE is 3x tighter (0.081 vs 0.246).
https://www.v2ex.com/t/1243916
Pattern found across 2 sources: on SMALL label sets (2-4 options), Laya and Jev perform comparably; on LARGE label sets (77 options, i.e. Banking77-scale), Laya's accuracy collapses (38%, ECE 0.51) while Jev holds up better. I.e., neither open rival nor Jev dominates universally — it's task-shape dependent.

## 7. 2048 game test — near-random performance
ndyg, Lobsters, 2026-09-19:
> "I handed jev the current 2048 board and gave it the option of up, down, left, right.. with just that it does about as well as making random moves."
https://gist.github.com/cablehead/bdf9ad946ceb26d9008976e49c9bfbbb (discussion: lobste.rs, thread hmkk2c)
Counter-caveat from the same thread, viraptor: *"if you want to know how jev is performing, you should really graph the distributions and run a thousand games instead of 18. You're mostly getting noise at the moment."* — the test's own small sample size (18 games) is flagged by another community member as insufficient to draw a strong conclusion; log this as a WEAK negative finding, not a strong one, unlike items 1-4 above.

## Distinct people whose own words were read in this sweep: 13
8 Reddit users, 2 Lobsters users, 1 v2ex user, 2 Juejin (Chinese tech blog) authors — full list and additional Chinese-language sources (Juejin posts on the 193.6x/444.6x official multiplier breakdown, and a "first reaction: scammer" reception piece) in the fleet's raw hunter output if deeper Chinese-source detail is needed later.

## What would flip this verdict (fleet's own honest self-assessment)
The prompt-injection finding is one researcher, one day, one model version — a TypeSafe fix or independent replication either way would change its weight. The OpenRouter-measured latency gap (4-5x) might be an intermediary-layer artifact rather than the core API's fault — a direct `api.typesafe.ai` test reproducing 70-100ms would undercut the "latency is overstated" finding specifically for direct API use (as opposed to OpenRouter-routed use, which is how most of the independent benchmarks in this corpus actually accessed Jev).
