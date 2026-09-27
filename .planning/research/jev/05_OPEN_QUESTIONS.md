# JEV — Open Questions (research gaps this corpus did not close)

Per görev1.md §16's stopping test: for each item below, the honest answer to "can Opus understand this without going back online" is **not fully** — these are named gaps, not silently skipped ones.

## High-priority (would change Opus's decision meaningfully)

1. **Is JEV actually well-calibrated or not?** The single most consequential open question (`04_CONFLICTS.md` Conflict #2). This corpus has one independent positive result (lindfors.no, one task) and one independent negative result (frutik.github.io, second-hand attribution of a 16,500-prediction, 8-dataset study), plus several more negative findings in `negative-evidence/02_calibration-problems.md`. **The primary "Valeriy M." calibration study was never located and read directly** — only a second-hand summary was available. Locating and reading it directly is the single highest-value next research step.
2. **Does JEV meaningfully outperform the open-source reproductions (von, SemIf/Kev, openJev-verdict-2.0), or are they roughly equivalent for DXB-shaped tasks?** No head-to-head independent benchmark of Jev vs. any specific open alternative was found (`04_CONFLICTS.md` Conflict #5). This directly affects whether any future integration should target the hosted TypeSafe API or a self-hosted alternative.
3. **What exactly does TypeSafe's official architecture/training-data page say (if any exists beyond the jaggedness doc)?** No architecture paper, weights, or training-data disclosure exists anywhere in this corpus — confirmed absent by multiple independent sources (Fireship, RepoChad), not just unfetched. This is a genuine information gap in the world, not a gap in this research pass.
4. **What does `typesafe.ai/manifesto` say?** Referenced by the official AI-primer doc, never fetched in this pass.
5. **The FAQ accordion answers on the launch blog post were never captured** (six questions visible, answers hidden behind client-side JS): "Why was a new training algorithm needed?", "What use cases is Jev good for?", "Is Jev just a smaller LLM?", "How does Jev perform against public benchmarks?", "Where does our training data come from?", "These results are kinda crazy - how is it possible?" (`official/blog/introducing-system-one-models-and-jev.md`).

## Medium-priority (would add useful nuance)

6. **Individual pages for the four named Patterns** (Speculative Fan-Out, Confidence-Gated Routing, Composite Scoring, Intent Routing) were summarized from one table only — the detail pages at `docs.typesafe.ai/patterns/*` were not fetched.
7. **The four workflow-eval detail pages** (`evals.typesafe.ai/security_incidents.html`, `/agent_trace_observability.html`, `/invoice_processing.html`, `/customer_service.html`) were not fetched — only the overview page. Per-example data, disagreement examples, and full queries live there.
8. **`typesafe-ai/system-one-adapter-python`** (the LLM-comparison wrapper used in TypeSafe's own benchmarks) was catalogued but not cloned/read — auditing its implementation directly would let Opus judge for itself whether the LLM baseline in TypeSafe's own comparisons is handicapped.
9. **`typesafe-ai/skills`** (1,986★, the official Claude Code/Codex agent-skill package) was catalogued but not read — directly relevant to how DXB's own `.claude/skills/` architecture would integrate, if at all.
10. **Vercel's actual, direct statement** (if any exists) about production use of Jev — only a second-hand video mention was found (`03_CLAIMS_LEDGER.md` #19).
11. **The "gev-1.0" rival model and the JevBench leaderboard** (`anyeval.com/eval/jevbench`, mentioned in `community/discussions/hn-landscape.md`) were flagged but not investigated — an independent, ongoing public scoring venue, if real and maintained, would be a valuable recurring evidence source.
12. **The Laya project's own README/announcement** was never directly read — only two secondary video accounts of the Jev-vs-Laya prior-art story exist in this corpus (`04_CONFLICTS.md` Conflict #5, `videos/` V9).
13. **`Yifan-Lan/awesome-jev-robustness`** (flagged in `negative-evidence/00_INDEX.md` as an "index of indexes" of ~25+ adversarial/robustness testing repos) was named but not crawled — likely the single highest-density remaining source of additional negative evidence if a further research pass is warranted.

## Low-priority / explicitly out of scope

14. Twitter/X discussion — not searched in this pass (time constraint acknowledged directly by the researching sub-agent; genuinely UNKNOWN, not "no discussion exists").
15. Non-English-language community discussion beyond the one Norwegian-language test (lindfors.no) — not systematically searched.
16. Xiaoyuzhou (Chinese podcast platform) — out of scope per standing DXB project rule (no Groq key setup).

## What this corpus is confident is NOT an open question

- **JEV's core identity, founder, company, and API shape** — extremely well corroborated across 10+ independent sources (official docs, 11 videos, GitHub, press).
- **`jevtypesafeai.com`'s unofficial status** — confirmed directly from the site's own disclosure text, not inferred.
- **The existence of real, serious, fast independent adversarial testing** — corroborated by dozens of distinct GitHub repos and blog posts within JEV's first ~9 days of public availability.
