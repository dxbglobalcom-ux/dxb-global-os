---
title: "Jev vs. Mistral Small 4 vs. Gemini Flash-Lite for event validation"
author: Jon Reed
organization: Near Here / Furls Digital Ltd (a real production company with a real use case — not a benchmark-only exercise)
date: 2026-09-16
url: https://nearhere.events/blog/typesafe-jev-mistral-gemini-event-validation
classification: INDEPENDENTLY VERIFIED
authority_score: medium — production company, disclosed limits, real (not synthetic) task
technical_depth: medium-high
relevance_to_dxb: medium-high — this is a real accept/reject GATE task (not just classification), structurally closest to a DXB "should this pass through unattended" decision
---

## Method
132 development cases + 21 held-out validation cases, individually-tuned prompts per model, on a real local-event-listing accept/reject task (i.e., a genuine production content-moderation-style gate, not a synthetic benchmark).

## Results (50-case main set)
| Metric | Jev | Gemini Flash-Lite | Mistral Small 4 |
|---|---|---|---|
| Accuracy | 96% (48/50) | 86% | 84% |
| Valid events wrongly rejected | 0/13 | 1/13 | 5/13 |
| Median latency | 0.58s | 3.44s | 2.73s |
| Cost per 1000 | $0.043 | $2.496 | $0.370 |

## Author's own explicit caveat
> "a use-case study, not a general model ranking" — the 21-case holdout is "too small and too narrow to establish a general accuracy advantage."

## Relevance note for DXB
This is the one independent test closest in shape to an unattended accept/reject gate (like a "does this pass through without CEO review" decision). The zero-false-rejection result on valid events is notable, but the author's own N=21 holdout caveat should be taken seriously — this does not establish general reliability at DXB's scale or on DXB's specific content.

## VENDOR CLAIM vs INDEPENDENT
Entirely independent, real production task, no vendor multiplier claims repeated.
