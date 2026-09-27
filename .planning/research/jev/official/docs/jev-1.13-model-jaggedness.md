---
title: "Jev-1.13 Model Strengths and Weaknesses" (the official "jaggedness" doc)
organization: TypeSafe AI (official documentation)
url: https://docs.typesafe.ai/model-jaggedness/jev-1.13
classification: VENDOR CLAIM — but a rare, self-critical vendor disclosure of the model's OWN weaknesses, not a marketing claim
authority_score: highest possible for identifying failure modes — this is the vendor's own documented limitation list, and it independently corroborates multiple third-party findings almost point-for-point
technical_depth: high
relevance_to_dxb: CRITICAL — read this file before any DXB integration design. It is the single most load-bearing document in the corpus for "how to use JEV correctly."
---

# Jev-1.13 — official vendor-documented failure modes

TypeSafe itself publishes this list. It is unusually candid for vendor documentation and should be weighted heavily — a vendor volunteering nine specific failure modes, with concrete mitigation guidance, is a strong positive signal about TypeSafe's engineering honesty, even though the content itself is all NEGATIVE (limitations).

## Core framing
> Jev-1.13 excels at "System One tasks" involving fast, intuitive judgments. The model demonstrates strong calibration and common-sense reasoning abilities. However, it struggles with tasks requiring "additional levels of indirection" and tends toward literal interpretations with poor numeric precision.

## The nine (numbered ten in source, one is a sub-point) documented failure modes

1. **Literal reading** — answers exactly what's asked, does not infer intent; takes "scoping words, negations, and implied conditions... at face value." Mitigation: state exact conditions explicitly, split ambiguous questions into discrete literal queries.
2. **Math and counting** — cannot reliably count items; "error grows with the size" of a collection; "recognizes the shape of an answer rather than tallying." Mitigation: do arithmetic in code, never ask JEV to count.
3. **Numeric representations** — underperforms on hex/RGB-style encoded numeric values vs semantic descriptions; "cannot reliably judge whether two values are near each other."
4. **Date/time comparison** — "reads dates as text, not as ordered quantities"; mixed formats and relative references are unreliable. Mitigation: extract date components as discrete choices, do comparison in code.
5. **Indirection** — double negatives / complex indirection reduce accuracy; direct phrasing performs better.
6. **Irrelevant context** — large `state` with unrelated detail acts as a distractor. Mitigation: filter/trim inputs before submission.
7. **Adversarial content** — the model does NOT treat `state` as hostile by default, so injected instructions or misleading framing can influence output. Explicit vendor warning: **"Test thoroughly before deployment."**
8. **Contradictory instructions** — conflicting criteria/instructions create confusion. Mitigation: align criteria and instructions with clear, precise language.
9. **Structural invariants** — the model does NOT guarantee mathematical relationships hold between related questions: **"P(noul) and 1 - P(not noul) may not be directly comparable."** Explicit vendor warning: don't transfer confidence thresholds across question types.
10. **Text generation** — JEV is not designed for free-text generation; it is "very slow" and underperforms at it. Mitigation: use extraction with bounded choice sets instead of asking for generated text.

## Vendor's own top-level practical guidance
Avoid asking JEV something code can compute exactly. Avoid hiding multiple judgments inside a single question. Avoid excessive/irrelevant context. Never assume structural mathematical identities (e.g. complementary probabilities) hold across separate queries.

## Cross-corroboration with independent research (this is the key value of this file)
This official document independently PREDICTS/EXPLAINS several third-party findings elsewhere in this corpus, almost point for point:
- #2/#4 (math/counting/dates) ↔ `etsabary/jev-deterministic-benchmark` (13.2%/33.3% on state-tracking/counting) and Flavio Copes's "where Jev breaks" list — see `../../negative-evidence/01_failed-experiments.md` and `../../experts/articles/2026-09-23-flaviocopes-jev-deep-dive.md`.
- #6/#7 (irrelevant context / adversarial content) ↔ `zkousama/jagged` (96.5%→26.5% under injected instruction) and `Iskandeur/system1-system2` (26/80 flipped by one adversarial payload) — see `../../negative-evidence/03_bias-and-edge-cases.md`.
- #9 (structural invariants / Noul-Choice mismatch) ↔ colinmcnamara.com's own finding of a Noul/Choice contradiction on a logically identical question, and complementary probabilities summing to 1.19 instead of 1.0 — see `../../negative-evidence/02_calibration-problems.md` and `03_bias-and-edge-cases.md`.

**This convergence between an independent, adversarial community's own testing and the vendor's own published limitations list is unusually strong evidence quality** — it means the negative findings in this corpus are not cherry-picked community complaints; TypeSafe itself documents the same failure surface.

## Relevance note for DXB
Any DXB integration design MUST treat this document as a primary design constraint, not optional reading: never ask JEV to count/do arithmetic/compare dates, always pin a model version and never compare confidence thresholds across question types, always assume `state` needs to be treated as potentially adversarial if it can contain any externally-sourced or user-influenced content, and never assume two related questions' probabilities are mathematically consistent.
