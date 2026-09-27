---
title: "An early-access test of TypeSafe's Jev: calibrated judgments for half a cent"
author: Emil Lindfors
organization: independent (evolutionary economist / economic geographer, independent researcher interest in AI architectures)
date: 2026-09-18
url: https://lindfors.no/blog/a-first-look-at-typesafes-jev/
hn_discussion: yes (1 pt)
source_type: independent benchmark (personal blog)
classification: INDEPENDENTLY VERIFIED
official_independent_community: independent
authority_score: medium-high — disclosed full methodology, confidence intervals, used Claude Fable 5.1 as an independent reference labeler in two passes (unusually rigorous ground-truth process)
technical_depth: high
relevance_to_dxb: high — this is the strongest evidence found on CALIBRATION specifically (confidence value actually matching real accuracy), which is the exact property DXB would need for any "auto-handle vs escalate to CEO" gate
---

## Method
Jev 1.13.0 vs DeepSeek V4.1 Flash (reasoning on/off) on 24 Norwegian salmon-farming-tax hearing documents, 11 questions per document (stance: 4-choice, respondent type: 6-choice, 8 binary arguments, 5-level substance scale). Ground truth: Claude Fable 5.1 used as independent reference labeler, two passes.

## Results (own measurement)
| Metric | Jev | DeepSeek (no reasoning) | DeepSeek (reasoning) |
|---|---|---|---|
| Stance accuracy | 20/24 | 20/24 | 22/24 |
| Arguments accuracy | 0.86 | 0.89 | 0.88 |
| Substance exact-level match | 19/24 | 14/24 | 14/24 |
| Cost per 1000 docs | $0.22 | $1.31 | $3.08 |
| Median latency | 0.32s | 2.7s | 26s |

At confidence ≥ 0.9, Jev's arguments accuracy was 14/15.

## Calibration finding — the single most important quote in this whole corpus for DXB purposes
> "When Jev said about 0.8, the reference agreed at least 80 percent of the time. When DeepSeek with reasoning on wrote down 0.8, the reference agreed half the time."

This is a DIRECT, independently-measured calibration comparison: Jev's stated confidence tracked real agreement; a reasoning LLM's stated confidence did not (was essentially uninformative at the 0.8 mark).

## Caveat (self-disclosed)
Careful/precise question wording DEGRADED calibration: ECE moved from 0.040 → 0.116 when questions were phrased more carefully vs simply. Small-sample CIs are wide (±15 points) given N=24 documents.

## VENDOR CLAIM vs INDEPENDENT split
Entirely independent measurement; no TypeSafe multiplier claims repeated here.
