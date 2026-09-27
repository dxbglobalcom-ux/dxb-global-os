---
title: Negative Evidence Index — JEV / TypeSafe AI
compiled: 2026-09-23
compiled_by: Sonnet 5 High (Principal Researcher role, görev1.md)
scope: "Section 9 of görev1.md — deliberately hunts for failure, not just praise. Every item below is sourced (GitHub repo, HN thread, blog post). Read the linked detail files for full method + numbers before citing a headline claim."
---

# Negative evidence — what nobody's marketing page shows you

JEV launched 2026-09-15/18 (stealth exit, $40M seed, $200M valuation, DCVC lead — see `../official/company-profile.md`). Within about a week, an unusually large and technically serious independent stress-testing community formed (dozens of narrow GitHub repos, mostly single-author, mostly well-instrumented). This file indexes what they found.

## Categories and detail files

| # | Category | File | Headline finding |
|---|---|---|---|
| 1 | Failed experiments | `01_failed-experiments.md` | ARC-AGI: 4/400 solved. Chess from raw FEN: ~950 Elo (worse than random legal-move baseline in some framings). |
| 2 | Calibration problems | `02_calibration-problems.md` | **The richest, most important category.** OOD ECE 4.4x the in-distribution noise floor. Score-type answers: 74% mean confidence at 44.7% actual accuracy. "Don't threshold on the confidence field" — independent researcher's own conclusion. |
| 3 | Bias / edge cases | `03_bias-and-edge-cases.md` | Position bias (answer-order flips accuracy). Language bias (Russian −11pts vs English, 3x worse calibration). Complementary probabilities that don't sum to 1 (0.72 + 0.47 = 1.19). |
| 4 | Integration / API friction | `04_integration-and-api-issues.md` | A real production adapter silently nulled every decision for an unknown period because of an undocumented wire-format mismatch (genfeed.ai #4906). |
| 5 | Vendor lock-in / dependency | `04_integration-and-api-issues.md` (same file, lock-in section) | Single-provider hosting; at least one team deliberately added a second provider specifically to hedge lock-in risk. |
| 6 | Worse than a classic LLM or plain code | `05_worse-than-baseline.md` | Chess and tool-call-hallucination tests where Jev underperforms a rules engine or a general LLM outright. |
| 7 | Production status | `06_production-status-and-company.md` | 99.839% API uptime over 90 days (self-reported status page), one 59-minute outage, one 2-minute API + full console outage 2026-09-20/21. No public postmortem found — product is ~1 week old at time of this research. |
| 8 | Vendor's own admission | `06_production-status-and-company.md` | CEO, publicly: *"It's also possible to be confidently wrong... We can't prove it isn't subsidized."* |

## Why this matters for DXB specifically (evidence → opportunity only, no conclusion — Opus decides)
`06_DXB_RELEVANCE_MAP.md` at the corpus root cross-references each of these against candidate DXB subsystems (memory write gate, verification triage, CEO-escalation gate). The calibration findings (#2) are the single most load-bearing evidence for or against using JEV's `confidence`/`noul` value as an automated gate threshold anywhere the CEO is not in the loop.

## Independently reproduced negative findings are DENSE, not thin
Roughly 25+ distinct third-party GitHub repos were found running adversarial/OOD/bias/calibration probes against Jev within its first week of public availability (see `Yifan-Lan/awesome-jev-robustness` as an index-of-indexes: https://github.com/Yifan-Lan/awesome-jev-robustness ). This is unusual velocity for a week-old product and should itself be read as a signal (community found it interesting/important enough to probe hard, fast) — noted as COMMUNITY OBSERVATION about the ecosystem, not a claim about the product.
