# JEV — Research Map (suggested reading order for a frontier model with no prior context)

```
Fundamentals
  → 02_EXECUTIVE_ORIENTATION.md              (what JEV is, 5-minute read)
  → official/company-profile.md               (who built it, funding, age)
↓
Architecture / primitives
  → official/docs/core-concepts.md             (System One, Choice/Score/Noul, Confidence, RLCD)
  → official/blog/introducing-system-one-models-and-jev.md   (founder's own framing + vendor-disclosed benchmark caveats)
↓
API / primitives in practice
  → community/unofficial-services/jevtypesafeai-com.md   (READ THE WARNING FIRST — identity trap)
  → official/github/org-repos.md               (real SDKs, real skills repo, the LLM-comparison adapter)
↓
Examples / real usage
  → videos/video-index-and-section-notes.md    (11 independent explainer videos, section notes)
  → experts/videos/neural-breakdown-avb-livestream.md  (live hands-on exploration + architecture speculation)
  → community/github/ecosystem-overview.md AND community/github/third-party-implementations.md
↓
Production patterns
  → official/evals.md                          (vendor's own workflow-eval methodology)
  → negative-evidence/04_integration-and-api-issues.md   (real production integration failure: genfeed.ai #4906)
  → negative-evidence/06_production-status-and-company.md (uptime, incidents, CEO's own admissions)
↓
Benchmarks
  → benchmarks/*.md                             (7 dated independent benchmark write-ups, 2026-09-16 through 2026-09-23)
  → experts/implementations/zefan-cai-open-jev-reproduction.md  (independent reproduction with its own published numbers)
↓
Limitations
  → official/docs/jev-1.13-model-jaggedness.md  ★ READ THIS BEFORE ANY INTEGRATION DESIGN — vendor's own 10-item failure-mode list, cross-corroborated by independent testing almost point-for-point
  → negative-evidence/00_INDEX.md → 01 through 06  (failed experiments, calibration, bias, integration friction, worse-than-baseline, production status)
  → experts/articles/negative-evidence-collection.md AND experts/articles/*.md (independent critical articles)
  → community/discussions/reddit-hn-findings.md AND community/discussions/hn-landscape.md
↓
Advanced integration
  → 03_CLAIMS_LEDGER.md                         (every load-bearing claim, tagged by verification status)
  → 04_CONFLICTS.md                              (5 unresolved or explained disagreements between sources)
  → 06_DXB_RELEVANCE_MAP.md                      (evidence → opportunity, for Opus to weigh)
```

## Why this order

Fundamentals-first avoids the single most common mistake found IN this research itself: this corpus's own first research pass briefly mis-filed `jevtypesafeai.com` as an official source before catching its own footer disclaimer (see `community/unofficial-services/jevtypesafeai-com.md`). Establishing the real identity and real official channels before touching any API-shaped material prevents that error from propagating further. Limitations are placed deliberately late but before Claims/Conflicts, so a reader has already seen enough positive material to weigh the failure modes against, rather than reading them cold.

## Corpus completeness note

This corpus was built by two concurrent research passes on 2026-09-23 (a Sonnet 5 High "Principal Researcher" session and its own spawned sub-research, working in parallel on the same `JEV/` tree) that turned out to be strongly complementary rather than duplicative — cross-check `00_INDEX.md`'s source catalog for the full merged picture. No content was deleted to resolve the overlap; where the two passes found different facts about the same question (e.g. company funding, jaggedness doc), both are preserved and cross-referenced.
