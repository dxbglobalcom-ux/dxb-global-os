---
title: "Typesafe's Jev is the fish at the poker table"
author: backnotprop
organization: independent
date: 2026-09-17
url: https://backnotprop.com/blog/jev-poker/
hn_discussion: yes (2 pts / 1 comment)
classification: INDEPENDENTLY VERIFIED — against a verifiable ground truth (GTO solver), not a subjective or LLM-judged label
authority_score: medium (individual, but methodology is unusually strong — ground truth is a computed solver output, not opinion)
technical_depth: high
relevance_to_dxb: HIGH — this is the single strongest, most damning independent negative result in the entire corpus. Directly relevant to any DXB use of JEV for decisions with real verifiable stakes.
---

## Method
Jev tested against an 8-minute GTO (game-theoretically optimal) solver computation (0.59% exploitability — i.e., the solver's answer is about as close to mathematically optimal as practically achievable) on a heads-up poker flop scenario. 30 varied-framing spots used to control for labeling/wording bias.

## Results
- Jev matched solver-optimal play only **63%** of the time overall.
- In one specific trap spot — Jev holding the effective nuts (a K-Q-J-T-9 straight) where GTO-optimal play is to check 100% of the time (because no worse hand calls a bet, and betting only gets called by hands that beat you) — Jev recommended **shoving all-in 62% of the time** (5 of 5 in one run set) against an opponent range that includes a made flush that beats the straight.

## Key quotes
> "Use ChatGPT to get an answer. Use Jev to get a decision."
> "...you hold the nuts, so shoving four times the pot gets called by nothing you beat."

## Why this is the strongest negative result in the corpus
Unlike most other independent tests (which grade against human-authored or frontier-model-agreement labels — themselves imperfect ground truth), this test grades against a computed, near-optimal game-theoretic solution. There is very little room to argue the ground truth itself is wrong. JEV failed a basic strategic-reasoning task — betting into a situation where it holds the best possible hand and no worse hand would call — despite having full information available in `state`.

## VENDOR CLAIM vs INDEPENDENT
Entirely independent; no TypeSafe claim addressed or contradicted directly (TypeSafe does not market JEV for game-theoretic/strategic reasoning), but this result usefully bounds what "decision-making" competence means for JEV: narrow classification/routing-style decisions, not open-ended strategic reasoning under uncertainty, even when all necessary information is present.
