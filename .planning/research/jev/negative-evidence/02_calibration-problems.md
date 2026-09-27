---
title: Calibration problems — the richest negative-evidence category
classification: COMMUNITY OBSERVATION / INDEPENDENTLY VERIFIED (each repo is a self-run, disclosed experiment; none are TypeSafe-run)
relevance_to_dxb: CRITICAL — any DXB use of JEV as an automated gate (memory write, human-escalation, verification triage) lives or dies on whether `confidence` actually means what it says
---

# Calibration problems

This is the category where the most independent, technically rigorous work concentrated in JEV's first week. Read `../benchmarks/2026-09-18-lindfors-jev-vs-deepseek-policy-docs.md` first (positive calibration finding) — the studies below are the counter-evidence and the boundary conditions.

## scienthoon/jev-ood-calibration
https://github.com/scienthoon/jev-ood-calibration — 4,621 API calls, ~$0.06 total cost.
- On public benchmarks (OpenBookQA): well calibrated, ECE 0.024.
- On out-of-distribution synthetic support tickets: ECE 0.107 — **4.4x the noise floor**.
- Per-type miscalibration DIRECTION differs: `Choice` is over-confident (temperature T=1.30). `Score` is severely over-confident (T=1.92) — mean stated confidence 0.74 while actual accuracy was only 44.7%. `Boolean`/`Noul` is UNDER-confident (T=0.66) — the opposite direction.
- Probabilities cluster at round numbers: quantized to steps of ~0.01; of 2,000 OpenBookQA probability values, 1,051 were exactly 0.
- Author's own stated conclusion, verbatim: **"Don't threshold on the confidence field."**

## AnthusAI/Jev-Calibration
https://github.com/AnthusAI/Jev-Calibration — 8,801 sentiment-classification examples.
- Raw ECE 0.117. Platt scaling (post-hoc correction) brings it to 0.052; isotonic regression to 0.008.
- Miscalibration is NOT a simple sigmoid shape (a standard, easily-correctable pattern) — harder to fix with a single global correction.
- At the `Choice` type specifically: accuracy sat at 50–57% while stated confidence stayed roughly flat — confidence carried almost no signal about correctness in that band.

## jujumilk3/jev-calibration-audit
https://github.com/jujumilk3/jev-calibration-audit
- KoBBQ ambiguous-bias-question set: with an "unknown" option present, the model picked "unknown" on ~95% of 300 genuinely ambiguous items (arguably appropriate — refusing to guess). With the "unknown" option REMOVED, accuracy on those same ambiguous items dropped to **0.000** (from a prior high when "unknown" was available) — i.e., forced to choose, it committed to a wrong, confident stereotype-aligned answer 100% of the time on that subset.
- Also 79% of answers matched the dataset's known stereotype direction, at 0.79 average confidence — high confidence tracking bias, not correctness.
- Separately: a 400-item inconsistency gap found between `Noul` and `Choice` answers to logically equivalent questions.

## KantaHayashiAI/jev-does-not-play-dice
- Fair-die probability question: `Choice` type answered with 82.9% confidence while actual accuracy was 19% (fair-die base rate ~16.7%, so confidence was wildly miscalibrated). `Noul` type, asked the equivalent yes/no framing, correctly landed near the true 1-in-6 rate.
- Signal: the SAME underlying question, asked via a different primitive type, produces very different calibration quality — primitive choice matters.

## Adilmp/does-jev-confidence-mean-anything
- civil_comments dataset: at 75% stated confidence, only ~10% of those items were actually genuinely problematic (real positive rate far below stated confidence).

## willkelly/jev-evaluation
- Random 3-SAT satisfiability questions: "probability barely moves while true rate spans 0 to 1" — the model's stated probability was nearly constant regardless of the actual ground-truth satisfiability rate across problem instances. Near-total decoupling of confidence from reality on this task class.

## colinmcnamara.com (Archer Hume) — own test
https://colinmcnamara.com/blog/jev-system-one-decision-models
- Own ECE ≈ 0.09 across a mixed task set. Sentiment task: UNDER-confident (94.0% actual accuracy, confidence stated lower). News classification: OVER-confident (88.2% actual accuracy). An open-weight comparison model in the same test achieved a better 0.04 ECE.
- Also found: position bias interacts with primitive-type choice — the SAME factual question asked as `Noul` returned 0.22, asked as `Choice` returned 0.01 at 0.97 stated confidence — i.e., two different framings of an identical underlying question gave contradictory, both-confident answers.
- Also found: complementary/exhaustive questions do not reliably sum to 1 — one concrete example: two complementary probabilities came back as 0.72 and 0.47 (sum 1.19, should be ≤1.0 for genuinely complementary options).

## primeline.cc
- Direct claim (not independently re-verified by this corpus's researcher, flag as COMMUNITY OBSERVATION pending further check): "Choice confidence is a fixed formula" — i.e., the returned `confidence` value for the `choice` primitive may be a deterministic function of the returned probability distribution (e.g., top-probability minus runner-up, or similar) rather than an independently model-learned confidence signal. If true, this would mean `confidence` for `choice` carries no MORE information than the `probabilities` map already returned — worth independent verification before DXB relies on it as a distinct signal.

## Hacker News discussion (thread id 49717558, multiple commenters: jacobgold, 8note, bigglebear)
- Community pushback on the "zero hallucinations" marketing framing: the schema-validity guarantee (JEV cannot return malformed JSON / an out-of-schema value) is being conflated by some readers with "cannot be wrong." Commenters explicitly note JEV "can absolutely be confidently wrong" — it just cannot be wrong in a way that breaks your parser.

## TypeSafe's own CEO, in public writing (flowtivity.ai interview/quote — VENDOR SOURCE, but a rare vendor admission against interest, worth preserving verbatim)
> "It's also possible to be confidently wrong (and all future models will be smarter still and still have that possibility)."
> "We can't prove it isn't subsidized; we'll need the long-term to prove the sustainability of our pricing."

Classify this quote as VENDOR SOURCE but flag it specially: it is the vendor conceding the exact failure mode independent researchers above measured. This is unusually candid and should carry real weight — a vendor volunteering "our confidence numbers can be wrong" is different from a vendor's benchmark claim.

## Han-chung Lee / "Valeriy M." — second-hand, unverified large-N calibration failure claim
Han-chung Lee, LinkedIn post, 2026-09-21 (https://frutik.github.io/awesome-search/Articles/Jev-and-the-Return-of-AI-ML-Engineering mirrors/discusses it): argues "calibration is a property relative to a distribution, so a blanket claim has no referent," and relays — SECOND-HAND, **original source not linked, not independently located in this research** — a claim attributed to "Valeriy M." of "16,500 predictions across eight datasets" finding "calibration failures on seven of the eight." **Classify as UNVERIFIED lead, not a confirmed finding** — the underlying study was not found or read directly in this research pass (see `../05_OPEN_QUESTIONS.md` item 1, the single highest-priority open research gap in this corpus). Do not cite the "7 of 8 datasets" figure as established without locating the primary source first.

## truestandard.ai (Arun Agrahri, 2026-09-20) — fact-checking test: a MIXED finding, not purely negative
https://truestandard.ai/blog/can-jev-fact-check-claims — tested Jev as a fact-checker in three stages: a 28-sentence draft (84 judgments), 108 hand-labeled claim-source pairs, and 13 real claims given with no source attached.
- On the 13 sourceless real-world claims (which structurally require live web search Jev cannot perform): Jev **correctly abstained on 12 of 13**, returning uncertainty in the 0.51–0.82 range rather than a false confident answer — arguably CORRECT, honest behavior for a model with no search capability, not a calibration failure.
- On the 84 structural/shape judgments (claim-source matching, not requiring external verification): **84 of 84 correct.**
- Article explicitly cross-references TypeSafe's own jaggedness doc (date/numeric/negation weaknesses) as relevant to why fact-checking specifically is a poor fit.
- Author's own conclusion: Jev is useful for **triage and source-matching**, not for **independent fact-checking** (which requires live retrieval it cannot do).
- **Relevance for DXB**: this is actually a positive calibration signal (honest abstention under genuine uncertainty) alongside a correct scope observation (JEV has no web-search capability, so tasks requiring external verification are structurally out of scope, not a calibration defect).

## Net read for DXB relevance mapping (evidence only, no architectural conclusion — see rule in görev1.md §14)
- Calibration quality is TASK- AND PRIMITIVE-TYPE DEPENDENT, not a single global property of "JEV." `Score` appears to be the worst-calibrated primitive across multiple independent studies (scienthoon, colinmcnamara). `Noul` is inconsistently under- or well-calibrated depending on the study.
- No independent study found a DXB-shaped task (routing / memory-write / escalation-style binary or narrow-choice gate) tested end-to-end for calibration. The closest analog is Lindfors' stance/argument classification (good calibration) and scienthoon's OOD ticket routing (poor calibration, ECE 0.107) — these point in OPPOSITE directions, which is itself the key finding: **calibration quality cannot be assumed and must be measured on DXB's own task distribution before any unattended gate use.**
