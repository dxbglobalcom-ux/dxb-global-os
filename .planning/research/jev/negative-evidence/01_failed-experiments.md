---
title: Failed experiments and severe out-of-lane breakdowns
classification: INDEPENDENTLY VERIFIED (each is a disclosed, reproducible third-party test)
---

# Failed experiments

## wondertwins/jev-benchmark — chess from raw FEN
- Asked Jev to play chess directly from FEN board notation (no legal-move list given, no engine assist).
- Result: ~950 Elo — worse than a plain rules-based legal-move-only baseline in some framings. Confirms JEV is not a general reasoning/planning substrate; it is a narrow classification/typed-decision primitive.

## simonmesmith/jev-arc-agi-v1-experiment
- 400 ARC-AGI (abstraction/reasoning corpus) tasks.
- Result: 4/400 solved. ARC-AGI requires open-ended visual/symbolic pattern induction — far outside JEV's designed lane (typed classification over a given `state`).

## etsabary/jev-deterministic-benchmark
- Sequential state-mutation tracking task: 13.2% accuracy.
- Exact counting task: 33.3% accuracy.
- JEV is not reliable at multi-step deterministic state tracking or counting — consistent with Flavio Copes's independently-sourced "where Jev breaks" list (math, dates, large contexts, counting) in `../experts/articles/2026-09-23-flaviocopes-jev-deep-dive.md`.

## backnotprop poker test (also filed under benchmarks — cross-referenced)
See `../benchmarks/2026-09-17-backnotprop-jev-poker.md`. Matched GTO-solver-optimal play only 63% of the time; in a textbook "you hold the nuts" trap spot, recommended an all-in shove 62% of the time against a hand that should never call. Strongest single failure case in this whole corpus — a fully-specified, verifiable-against-ground-truth strategic reasoning task where JEV performed close to or below a naive heuristic.

## Relevance note
None of these are DXB-shaped tasks. They establish the BOUNDARY of JEV's competence (narrow typed classification, not general reasoning, not multi-step state tracking, not game-theoretic/strategic reasoning). DXB's candidate uses (routing, gating, triage — see `06_DXB_RELEVANCE_MAP.md`) sit closer to JEV's designed lane than these failure cases do, but the deterministic-state-tracking failures (etsabary) are a caution for any DXB workflow that would ask JEV to track sequential state rather than classify a single snapshot.
