---
title: "JEV Classifier: 5.43x as Fast as Haiku, 96% Lower Cost"
author: Moe Khalil
organization: LiteLLM (AI gateway/proxy vendor — commercial interest in routing narratives, disclosed)
date: 2026-09-20 (updated 2026-09-18)
url: https://docs.litellm.ai/blog/jev-auto-router-benchmark
source_type: independent benchmark (vendor blog, but not TypeSafe — a downstream infra vendor)
classification: INDEPENDENTLY VERIFIED (author's own measured data), but author has commercial interest in "fast cheap routing" narrative — note conflict of interest
official_independent_community: independent (third party to TypeSafe, but not neutral — LiteLLM sells a routing product)
authority_score: medium-high — named author, disclosed org, disclosed full methodology + caveats
technical_depth: high
relevance_to_dxb: high — directly benchmarks JEV as a MODEL ROUTER against Claude Haiku, which is precisely the "model routing" candidate DXB already has (db/seed/import-routing-rules.ts)
---

## Method
80 authored test cases × 3 runs each (240 calls total) per model. JEV vs Claude Haiku. Single-author-authored ground-truth labels — explicitly flagged by the author as NOT independently reviewed. Bootstrap resampling for CIs.

## Results (own measurement)
| Metric | Jev | Claude Haiku |
|---|---|---|
| Latency p50 | 126.81ms | 688.40ms (5.43x slower) |
| Latency p95 | 231.16ms | 896.94ms |
| Tier-match accuracy | 228/240 (95%) | 177/240 (73.75%) |
| Cost per call | $0.0000321 | $0.000827 (96.12% higher) |

## Caveats stated by the author (important — do not drop)
> "We did not grade generated answers or establish general LLM-quality equivalence."
> Labels were authored without independent review.
> "This is a ratio of aggregate statistics, not an average of per-request ratios."

## VENDOR CLAIM vs INDEPENDENT split
The headline "5.43x / 96%" figures are this author's OWN measurement (INDEPENDENTLY VERIFIED by this author, on their own test set) — not a repetition of TypeSafe's marketing multiplier (193x/444x, see 03_CLAIMS_LEDGER). Treat this as a real but narrow-scope, single-labeler, commercially-interested data point.

## Conflict-of-interest note
LiteLLM is a routing/gateway product; a result favorable to "route to a cheap/fast typed-decision model" supports LiteLLM's own product thesis. Weight accordingly — does not invalidate the numbers, but the choice of Haiku as the sole comparator (not a broader model set) and the framing skew toward LiteLLM's routing use case.
