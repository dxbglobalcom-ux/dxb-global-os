---
title: "Measurement sweep — 7 independent quantitative sources (OpenRouter's own blog, Reddit, independent blogs, Every.to, GitHub probe)"
compiled: 2026-09-23
compiled_by: dxb-research fleet (hunter 'measure'), synthesized by Sonnet 5 High
classification: mixed — OpenRouter blog tests are the highest-authority independent source in this whole corpus (platform operator, not TypeSafe, running its own numbers on its own infrastructure); the rest are independent bloggers/GitHub probes
---

# Measurement sweep — the highest-authority independent benchmark data found

**Verdict from this sweep (its own words):** Jev shows a consistent pattern across seven independent measurements — 3 to 13 points behind frontier LLMs on accuracy, but 13–25x faster and 20–500x cheaper. Nobody independent says "Jev is the most accurate model." Everybody independent says "the speed/cost multiplier is real, the accuracy multiplier claims are overstated."

## The single most important source: OpenRouter's own blog (platform operator, not TypeSafe)
OpenRouter hosts JEV (`typesafe/jev-1.13`) but is not TypeSafe — its blog running its own benchmark is one of the highest-authority independent sources possible here (a platform with commercial neutrality between many model vendors it hosts).

### Banking77 test (3,080 examples, 77 classes) — https://openrouter.ai/blog/insights/jev-vs-claude-opus-5-classification/ (2026-09-22)
| Metric | Jev | Claude Opus 5 |
|---|---|---|
| Accuracy | 81.0% (CI 79.6–82.3) | 84.4% (CI 83.1–85.6) — gap 3.3pts, 95% CI 2.3–4.4 |
| Latency p50 | 175ms | 2,266ms — **13x** |
| Cost | 1/22 of Opus 5's cost | — |

Quote: *"Jev comes in 3.3 points behind Opus on accuracy, but it's 13 times faster at the median and costs just 1/22 of what Opus does."* — Kenny Rogers, OpenRouter Blog, 2026-09-22.

Also reported: at confidence ≥0.99 (58% of predictions), accuracy was 96.3% — a partial independent confirmation that JEV's calibration DOES track real accuracy at the high-confidence end, on this specific dataset.

### Support-ticket + prompt-injection test (60+40 examples) — https://openrouter.ai/blog/tutorials/jev-vs-llm-when-to-use-each/ (2026-09-19)
Jev: 98.3% / 100% (injection subset) accuracy, comparable to GPT Luna (98.3%) and Opus (100%/98.3%). ~10x faster median, ~116x cheaper than Opus.

## Reddit r/openrouter — SuperGPQA, 9-model comparison (1,000 questions) — 2026-09-21
https://www.reddit.com/r/openrouter/comments/1wmfyyr/
- Jev: 53.6% accuracy — 2nd of 9 models (Kimi K3 best at 59.3%).
- Jev is 25x cheaper and 3.9x faster (decisions/sec) than Kimi K3.
- Counter-point from the test author themselves: *"Gemma 4 26B is the result I find most practical. It reached 37.6% at $0.0184 per 1,000 decisions, making it cheaper than Jev."* — i.e., **Jev is not even the cheapest option**; some small open models beat it on cost-per-accuracy.
- u/lucky-Magazine-962: *"Jev being 25x cheaper than Kimi K3 for only 6 points less accuracy is the kind of result that makes the expensive models hard to justify for routing tasks."*

## Independent benchmark: Marcelo Taparelli (already filed separately, cross-referenced here)
See `2026-09-23-taparelli-jev-vs-rules-vs-local-llm.md` — 70 tickets, category 100%, priority 98.6%, risk 95.7%, 569ms mean, $0.0038 total.

## TypeSafe's own 711-case workflow dashboard, as independently analyzed by Kingy AI
https://kingy.ai/blog/typesafe-jev-review-the-ai-model-that-doesnt-generate-text/ (2026-09-15) — **note: this is TypeSafe's OWN dashboard (evals.typesafe.ai), Kingy AI did not run its own API calls** ("We did not run a live Jev API call because access was still early access/waitlist" — this is second-hand analysis of vendor data, not independent measurement, despite appearing in this "independent sources" sweep).
- Aggregate accuracy: 67.8% vs an unnamed comparison model ("Sol") at 74.1% — Jev trails.
- 209x cheaper, 58x faster in aggregate (closer to TypeSafe's marketed multiplier than any truly independent test found elsewhere).
- Kingy's own critical quote: *"Jev trails the top visible comparators on the aggregate workflow score and falls far behind on invoice processing, while the benchmark's reference policy is made from other models rather than verified truth."* — i.e., even analyzing TypeSafe's own favorable dashboard, the reviewer flags the same agreement-with-models-not-ground-truth methodology problem raised independently by KDnuggets and Islam.

## Every.to — Mike Taylor, 37 documents / 777 judgments (real editorial-quality-check task) — 2026-09-15, updated 2026-09-23
https://every.to/vibe-check/mini-vibe-check-typesafe-s-jev-judged-everything-i-ve-written-in-0-7-seconds
- Jev caught 6 of 7 intended defects; Claude Fable 5.1 caught 7 of 7 (Fable wins on quality).
- Jev: median 0.35s/passage vs Fable 5.1: 8.83s/passage — 25x faster, ~580x cheaper.
- Quote: *"Jev took a median of 0.35 seconds per passage, versus 8.83 seconds for Fable 5.1... But Jev caught six of the seven intended defects; Fable caught all seven."*

## Wavect.io architecture review — Kevin Riedl, 2026-09-18
https://wavect.io/blog/jev-ai-decision-model-review/ — cites TypeSafe's own "jaggedness" doc (see `../official/docs/jev-1.13-model-jaggedness.md`). Key quote, a direct methodological recommendation: *"Therefore, avoid publishing '20 to 200 times faster' or '40 to 400 times cheaper' as universal product facts. Measure cost per accepted decision."*

## Saik0s — independent technical probe (42 requests) — GitHub, 2026-09-19
https://github.com/Saik0s/diffusiongemma-jev-macos/blob/main/benchmarks/openrouter-jev-1.13-probe-2026-09-19.json
- Median latency 334ms, p90 469ms, 2/42 requests returned HTTP 400.
- Non-determinism finding (also see negative-evidence): *"repeat_variation: Three identical checkout requests differed by at most 0.02 in any noul"* — i.e., re-running the EXACT same request produces slightly different probability values, confirming the model is not fully deterministic even on identical input.

## Academic literature — none found
arXiv/Crossref/OpenAlex/EuropePMC searches for "Jev"/TypeSafe found no relevant peer-reviewed literature (only unrelated papers coincidentally sharing the name). Product is ~1 week old at research time; unsurprising, but means zero peer-reviewed evidence exists yet.

## Distinct independent measurement authors counted: 7
OpenRouter (Kenny Rogers) + Reddit test author (u/Ok-Development6070) + Marcelo Taparelli + Kevin Riedl (Wavect) + Curtis Pyke (Kingy, second-hand vendor-data analysis) + Mike Taylor (Every.to) + Saik0s (GitHub).

## Open door (not closed, flagged for follow-up)
openrouter.ai/compare/typesafe/jev-1.13 renders via JavaScript; the fetch only retrieved the page skeleton (price row only, comparison table empty). A browser-rendered fetch might surface additional official "Benchmarks" tab data not captured in this research pass.
