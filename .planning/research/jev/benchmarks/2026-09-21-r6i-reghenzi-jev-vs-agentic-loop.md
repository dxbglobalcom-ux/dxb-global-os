---
title: "Replacing an agentic classification loop with Jev: 7x faster"
author: Sam Reghenzi
organization: independent (blog.r6i.it)
date: 2026-09-21
url: https://blog.r6i.it/typesafe-jev-vs-agentic-loop.html
hn_discussion: yes (2 pts)
classification: INDEPENDENTLY VERIFIED — and unusually self-critical of its own headline number
authority_score: medium-high — nuanced, discloses a likely confound in its own favor and corrects for it
technical_depth: high
relevance_to_dxb: HIGH — this is the only independent test that directly compares JEV's single-pass typed decision against a multi-step AGENTIC tool-calling loop, which is closer to how DXB's own agent/subagent architecture actually works
---

## Method
50-product classification task (Amazon/Shopify taxonomies). Old system: GPT-5.2 agentic multi-turn tool-calling loop + separate judge model. New system: single-pass typed `Choice` call via Jev.

## Results
- Mean latency: 9.62s (agentic) vs 1.38s (Jev) — a 7x figure, but the author explicitly flags this as **"probably generous"**: the old system ran 5 parallel threads (contention likely inflated its latency), the new system ran sequential.
- Model calls per task: 7.22 → 3.18. Tokens: 8,380 → 5,400. 72% of final classification paths were identical between the two systems.

## Key structural critique (the most important finding for DXB)
`path_score` (JEV's confidence for a multi-level taxonomy choice) is a geometric mean of edge probabilities along the decision path — it measures how CONCENTRATED the decision was, not whether it was CORRECT. One example: an out-of-taxonomy item was approved at 0.65 confidence.

> "A depth failure costs you precision; a branch failure costs you the entire subtree" — because JEV commits to a single-pass tree top-down, once it picks the wrong branch at the top level, "no amount of further descent can recover," unlike an agentic loop which can backtrack.

## Relevance note for DXB
This is the closest independent analog to DXB's own multi-agent, tool-permission-routed architecture. The core lesson — single-pass typed decisions cannot self-correct a wrong top-level branch the way an agentic loop with backtracking can — is a direct architectural caution for any DXB routing decision with irreversible downstream consequences (e.g., which agent/tool a task gets routed to) if JEV were used as a one-shot top-level router rather than one signal among several.

## VENDOR CLAIM vs INDEPENDENT
Entirely independent; the author corrects for a methodological confound in JEV's favor rather than reporting the more flattering raw number uncritically — treat this as one of the more trustworthy sources in the corpus for that reason.
