---
title: "Jev 1.13 in Practice: I Tested a Decision Model Against Rules and a Local LLM"
author: Marcelo Taparelli
organization: independent (Agência Catus/EVAG, student at UniBF, Brazil)
date: 2026-09-23
url: https://dev.to/marcelotaparelli/jev-113-in-practice-i-tested-a-decision-model-against-rules-and-a-local-llm-3p1c
source_type: independent benchmark (blog/dev.to)
classification: INDEPENDENTLY VERIFIED (author's own measured data)
official_independent_community: independent
skill_level_of_author: intermediate-advanced (disclosed methodology, disclosed limits)
authority_score: medium — named individual, single-author, no institutional affiliation, but rigorous disclosed method
technical_depth: high
relevance_to_dxb: high — closest published head-to-head vs rules-engine AND local LLM on a triage/classification task (structurally close to DXB's routing/gate candidates)
---

## Method
70 frozen synthetic ops-ticket examples. Three approaches compared on 3-way category/priority/risk classification:
1. Deterministic rules engine
2. Local LLM (Ollama)
3. Jev 1.13 via OpenRouter Decisions API

## Results (author's own measurement)
| Metric | Jev | Local LLM (Ollama) | Deterministic rules |
|---|---|---|---|
| Category accuracy | 1.0000 | 0.9571 | 0.8286 |
| Priority accuracy | 0.9857 | — | — |
| Risk accuracy | 0.9571 | — | 0.9571 (tied) |
| Exact-tuple match (all 3 fields) | 0.9429 (66/70) | — | — |

- Latency: mean 569.4ms, p50 545.5ms, p95 712.2ms, max 1142.2ms.
- Cost: $0.003789618 total for 90,229 input tokens across the run. Zero API failures.
- Calibration (exploratory, author flags small-N caveat): Brier scores 0.0005 / 0.0386 / 0.0800 across the three fields; ECE 0.0054 / 0.0329 / 0.0226.

## Critical quote
> "Confidence is not semantic correctness" — one wrong HIGH-risk call carried 0.86 confidence.

## Author's own conclusion (not my synthesis)
Keeps Jev at benchmark-only status, not production-ready off this data alone — "material for guiding the next evaluation, not for justifying a production replacement."

## Limitations (self-disclosed by author)
- N=70, single-author-labeled ground truth, synthetic (not real production tickets).
- Single run per method (no repeated-trial variance reported here, unlike LiteLLM's 3-run design).

## VENDOR CLAIM vs INDEPENDENT split
Nothing in this piece repeats a TypeSafe number uncritically — this is a first-party independent measurement end to end.
