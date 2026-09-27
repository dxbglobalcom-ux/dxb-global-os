---
title: Cases where JEV underperforms a classic LLM or plain code
classification: INDEPENDENTLY VERIFIED / one contested academic-priority dispute (flagged as such)
---

# Worse than baseline

## Robustness: JEV more fragile than a general LLM on the same adversarial test
**Iskandeur/system1-system2**: one adversarial payload flipped JEV's answer on 26/80 test utterances. The SAME adversarial test against a general-purpose LLM (GPT) held 80/80 correct. On this specific axis, JEV was measurably worse than the general model it's positioned to replace for narrow decisions.

## Tool-call hallucination in a "no tool needed" setting
**baibizhe/jev-decision-benchmarks**: on the When2Call benchmark's "no-tool-needed" cases, JEV hallucinated a nonexistent tool call in 76% of them. This directly cuts against the "zero hallucinations" marketing framing (see `../experts/articles/2026-09-21-kdnuggets-awan-jev-critique.md` for the independent clarification that "zero hallucinations" means schema-validity only, not semantic correctness).

## Missing an explicit "none of the above" option
**priorbench/jev**: with no explicit "none" option provided, 0 of 30 genuinely out-of-scope inputs were flagged as out-of-scope — the model always picked one of the given (wrong) options rather than signaling "none of these apply."

## Chess: worse than a plain rules engine
See `01_failed-experiments.md` (wondertwins/jev-benchmark) — ~950 Elo from raw FEN, worse than a baseline that just enforces legal moves.

## Marketing multiplier vs reality
See `../benchmarks/2026-09-22-islam-jev-multiplier-reality-check.md` and `../experts/articles/` — independent re-tests consistently found real-world speed/cost multiples in the 4–7x / 30–65x range, well below TypeSafe's own headline 193x/444x figures (which were measured against multi-step frontier-model agentic workflows, not single-call mid-tier-model baselines — an apples-to-oranges comparison per Islam's analysis).

## Contested: "not architecturally new" claim (community dispute, unresolved — logged, not adjudicated)
Hacker News (user `niutech`): claims an open-source project "now called Laya" predates JEV by about a year with a similar architecture. Separately, user `nandakishor_ml` claims to have published a similar architecture on arXiv about a year earlier (associated PyPI package `hallunox`). Countered by user `verdverm`, who argues the cited prior paper describes an embeddings+RAG+orchestrator system, not the same typed-primitive architecture, and questions its academic rigor. **This is an unresolved community dispute over novelty/priority, not a performance finding** — logged here for completeness per görev1.md's "keep conflicts, don't delete" rule; see root `04_CONFLICTS.md`.

## Relevance note for DXB
The adversarial-fragility and tool-hallucination findings are the two most direct "worse than the thing it's meant to replace" results. Neither is in a DXB-shaped task, but both argue against using JEV UNSUPERVISED in any adversarial-input-exposed surface (e.g., anything touching external/untrusted content) without independent DXB-specific testing.
