---
title: JEV Research Corpus — Master Index
purpose: "Entry point for Claude Opus 5.5 High to decide whether/how JEV (TypeSafe AI) integrates with DXB Global OS, per görev1.md. Built by Claude Sonnet 5 High as Principal Researcher / Evidence Curator — this session does not make the architectural call."
compiled: 2026-09-23
identity_confirmed: "Jev — TypeSafe AI's first 'System One' typed-decision model (Choice/Score/Noul primitives, calibrated confidence). Founder: Diogo Almeida (ex-OpenAI, RLHF co-inventor). NOT an LLM, cannot generate free text."
---

# JEV Research Corpus

**Start here.** If you read nothing else, read `02_EXECUTIVE_ORIENTATION.md` (5 min), then `official/docs/jev-1.13-model-jaggedness.md` (the vendor's own failure-mode disclosure — the single most load-bearing document in this corpus), then `06_DXB_RELEVANCE_MAP.md`.

Full suggested reading order with rationale: `01_RESEARCH_MAP.md`.

## ⚠ Identity warning (read before trusting any pricing/API claim)

`jevtypesafeai.com` is **not** TypeSafe AI — it is an unaffiliated third-party reseller (confirmed from the site's own disclosure text) charging roughly 10x TypeSafe's real price. Real official channels: `typesafe.ai` (marketing), `docs.typesafe.ai` (docs), `console.typesafe.ai` (product/API keys), `evals.typesafe.ai` (benchmarks). Full detail: `community/unofficial-services/jevtypesafeai-com.md`.

## Corpus provenance

This corpus was assembled by **five concurrent research passes** on 2026-09-23 (all Sonnet 5 High, under the same `görev1.md` directive): one dedicated to independent experts/benchmarks, one to video/transcripts, one to negative evidence/community, one dedicated to official sources (this one ran 27 minutes / 384K tokens and returned **no usable output** — a measured fact, not a gap glossed over; its ground was covered instead by the expert/benchmark pass and by this session's own direct verification, below), plus one `dxb-research` fleet run (crowd/rival/counter/measure lanes, 71 distinct people counted across 5 threads).

**Process note, stated plainly rather than hidden:** the expert/benchmark research pass wrote its findings directly into this `JEV/` folder, which is a deviation from this project's own "one session, one author" law (`.claude/CLAUDE.md` §2 — subagents audit and gather, they do not write repo content). The presiding Sonnet 5 High session (this document's actual author of record) treated that output as an unverified draft, not a finished deliverable: independently re-verified the single most load-bearing fact in the whole corpus directly against primary sources (the `jevtypesafeai.com` vs `typesafe.ai` identity question, by fetching `typesafe.ai/blog/...` and `jevtypesafeai.com` directly — confirmed correct, including the exact `$0.042/MTok` input / free-output pricing figure, re-fetched a second time directly from `typesafe.ai`), audited the top-level synthesis files (`00`–`06`) line by line, ran an automated cross-reference integrity check (171 internal links checked, 1 genuinely broken reference found and fixed, the rest were bare-filename mentions that resolve fine by basename), and cross-checked the other three passes' scratchpad output against what had been merged into the repo (found fully merged, plus one conflict — C6 below — that had been identified but not yet escalated, now added).

Full 11-video verbatim transcripts (`transcripts/`, ~224KB) are retained in this corpus. görev1.md §4's original no-verbatim-copyright restriction was briefly enforced (one pass deleted a ~256KB raw-transcript folder that violated it) and then **rescinded by the CEO directly in conversation, 2026-09-23** ("yanlış yazılmış o iptal, böyle bir kısıtlamayı CEO olarak kaldırdım") — per `.claude/CLAUDE.md` §1/LAW A, a live CEO order deletes what contradicts it. All 11 transcripts were re-fetched (9 via `youtube-transcript-api`, 2 restored from session cache); one video's real YouTube ID (RepoChad, `RPpQacmBe4A`) was resolved and title-verified during the re-fetch, where the corpus had previously only had a third-party aggregator slug. Total distinct primary sources catalogued: **60+** (official docs, launch blog, GitHub org + ~30 community repos, 11 independent videos with both paraphrased section notes and full raw transcripts, 7 dated independent benchmark write-ups, 6 negative-evidence category files, 5+ independent critical articles, HN + Reddit discussion mapping, company/funding profile, one fleet run).

## Source catalog by authority level

### Tier 1 — Official (TypeSafe AI's own material)
- `official/docs/core-concepts.md` — System One, primitives, confidence, patterns, AI primer (RLHF/RLVR/RLCD)
- `official/docs/jev-1.13-model-jaggedness.md` ★ — vendor's own 10-item failure-mode disclosure, cross-corroborated by independent testing
- `official/blog/introducing-system-one-models-and-jev.md` — founder's launch post, with the vendor's own self-disclosed benchmark caveats
- `official/evals.md` — vendor's published workflow-eval methodology (4 named workflows)
- `official/github/org-repos.md` — real SDKs (Python/JS), the `skills` agent-integration repo, the `system-one-adapter-python` LLM-comparison wrapper
- `official/company-profile.md` — founding, funding ($40M seed, DCVC, $200M valuation), founders (Diogo Almeida, Erik Gafni, Sasha Sheng), launch date (~2026-09-15/18)

### Tier 2 — Independent experts / serious technical testing
- `experts/articles/` — 6 files: negative-evidence collection (poker/vision/calibration/vendor-lock-in tests) + 5 dated independent technical articles (Forkast, FourWeekMBA, KDnuggets, Flavio Copes deep-dive, Tom's Hardware)
- `experts/implementations/zefan-cai-open-jev-reproduction.md` — independent LoRA reproduction with published benchmarks
- `experts/videos/neural-breakdown-avb-livestream.md` — live, unscripted, hands-on technical exploration with real early-access API keys
- `benchmarks/` — 7 dated independent benchmark write-ups (2026-09-16 through 2026-09-23), covering event validation, poker strategy, policy-document calibration, vision/drawing classification, cost/speed vs. Haiku, agentic-loop comparison, multiplier reality-check, rules-engine/local-LLM comparison
- `negative-evidence/00_INDEX.md` → `01`–`07` — organized by category: failed experiments (ARC-AGI, chess), calibration problems (the richest category — now also including a real fleet-driven prompt-injection/OpenRouter-latency/real-money-trading-loss sweep, `07_fleet-counter-evidence.md`), bias/edge cases, integration/API friction, worse-than-baseline, production status + company admissions
- `benchmarks/00_fleet-measure-summary.md` — a separate `dxb-research` fleet sweep of 7 more independent quantitative sources, headlined by **OpenRouter's own blog** running its own Banking77 test (3,080 examples) against Claude Opus 5 — the single highest-authority independent benchmark in this corpus, since OpenRouter is Jev's host but not TypeSafe itself
- `community/discussions/crowd-sentiment-sweep.md` + `rival-ecosystem-reception.md` — a second, larger community-sentiment sweep (~1,304 distinct people read across Reddit/HN/Lobsters, plus a dedicated r/codex + community.openai.com "rival ecosystem" pass — includes a concrete reported Astra/Codex compatibility bug)
- `case-studies/typesafe-pharmacy-consensus-kernel.md` ★ — **the single highest-DXB-relevance source in the entire corpus**: an independent, formally-specified (TLA+), quorum-voting, chaos-tested production pattern for using Jev safely on a high-stakes decision, with an honestly-reported statistical confidence bound (not a bare accuracy number)
- `experts/videos/00_VIDEO_INDEX.md` — a second, more thorough video pass: verified metadata (via `yt-dlp`) for all 11 videos, full raw transcripts for all of them (vs. partial coverage in `videos/video-index-and-section-notes.md`), plus one additional obscure-but-critical video (the pharmacy case study above) found by depth rather than view count

### Tier 3 — Community
- `videos/video-index-and-section-notes.md` — 11 independent YouTube explainer videos with metadata + section notes (Syntax, Fireship, RepoChad, Rob Shocks, AI WITH Rithesh, Alex Hitt, Adam Gardner, Codevolution, Gary Explains, Dutch Startup TV, Don Johnson pharmacy case study)
- `community/github/ecosystem-overview.md` + `third-party-implementations.md` — ~30+ community repos: 9+ competing "awesome-jev" lists, 7+ independent open-source reproductions (von, SemIf/Kev, mini-jev, open-alternative-jev, openJev-verdict-2.0, Laya), production-integration examples (MCP tools, browser agents, a live crypto-trading bot)
- `community/discussions/` — HN discussion landscape (35+ threads, 9 days) + Reddit findings (skepticism pattern, "too good to be true" reactions, a resolved published-evals conflict)
- `community/unofficial-services/jevtypesafeai-com.md` — the identity-trap finding, with full captured docs from the unofficial site for reference

## Recommended reading order

See `01_RESEARCH_MAP.md` for the full path with rationale. Short version: **Fundamentals → Architecture → Examples → Production patterns → Benchmarks → Limitations → Claims/Conflicts → DXB relevance.**

## The 15 most critical sources (if time is short)

1. `02_EXECUTIVE_ORIENTATION.md` — orientation
2. `official/docs/jev-1.13-model-jaggedness.md` — vendor's own limitations, cross-corroborated
3. `official/blog/introducing-system-one-models-and-jev.md` — founder's claims + vendor's own caveats
4. `official/docs/core-concepts.md` — how it actually works
5. `official/company-profile.md` — who/funding/age
6. `community/unofficial-services/jevtypesafeai-com.md` — the identity trap
7. `03_CLAIMS_LEDGER.md` — every load-bearing claim, tagged
8. `04_CONFLICTS.md` — 5 unresolved/explained disagreements (calibration is the big one)
9. `negative-evidence/02_calibration-problems.md` — the richest, most consequential negative-evidence category
10. `negative-evidence/04_integration-and-api-issues.md` — a real production failure
11. `community/github/ecosystem-overview.md` — the open-source-alternative landscape (vendor-lock-in question)
12. `experts/videos/neural-breakdown-avb-livestream.md` — independent architecture speculation
13. `videos/video-index-and-section-notes.md` (V9, "Jev vs Laya") — the prior-art story
14. `06_DXB_RELEVANCE_MAP.md` — evidence mapped to DXB opportunity points (not conclusions)
15. `05_OPEN_QUESTIONS.md` — what remains genuinely unknown

## Topics covered (taxonomy, per görev1.md §6)

What it is / problem solved ✓ · architecture (undisclosed, speculation only) ⚠ · input/output model ✓ · Choice/Score/Noul ✓ · probability/confidence semantics ✓ · latency ✓ · pricing ✓ · deployment (hosted only, no self-host from TypeSafe) ✓ · API ✓ · SDK ✓ · supported languages (English-primary, non-English variable — see calibration findings) ✓ · model behavior / jaggedness ✓ · calibration (contested, see Conflict #2) ⚠ · determinism (confirmed non-deterministic) ✓ · reliability / uptime (self-reported only) ⚠ · concurrency/scaling (not directly tested in this corpus) ✗ · observability (status.typesafe.ai exists) ✓ · security (adversarial-content vulnerability documented) ✓ · privacy (not directly investigated) ✗ · limitations ✓ · failure modes ✓ · vendor lock-in (mitigated by open alternatives, not eliminated) ✓ · benchmarks (extensive, mixed vendor/independent) ✓ · real-world implementations ✓ · production readiness (mixed evidence) ✓ · integration patterns ✓ · agent/model/context routing, memory gating, tool permission, verification triage, confidence gating, human escalation, multi-agent systems (all addressed in `06_DXB_RELEVANCE_MAP.md`) ✓

**✗ = genuine gap, not investigated in this pass** — concurrency/scaling behavior under load, and privacy/data-handling practices, were not directly tested or documented by any source found. Flag for a follow-up research pass if either becomes decision-relevant.

## Missing / incomplete research areas

Full detail in `05_OPEN_QUESTIONS.md`. Headline gaps: the primary source behind the 16,500-prediction calibration-failure study was never located (only second-hand); no head-to-head Jev-vs-open-alternative benchmark exists; `typesafe.ai/manifesto` and several FAQ accordion answers were never fetched; individual Pattern and workflow-eval detail pages were not fetched; Twitter/X was not searched (time constraint, not "nothing found").

## Handoff statement

This corpus answers, from material gathered and cross-checked on 2026-09-23: what JEV is, who built it, how it works, what it costs and how fast it is (vendor claim vs. independent re-measurement), where it demonstrably breaks (vendor-acknowledged and independently reproduced), what the open-source alternative landscape looks like, and where its capabilities could plausibly intersect with DXB's own architecture — without recommending whether DXB should adopt it. That decision, and any deeper technical or legal due diligence it requires, belongs to Claude Opus 5.5 High, per görev1.md.
