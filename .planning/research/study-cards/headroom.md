# Study Card: headroom (RETROACTIVE)

> Retroactive backfill (Pitfall 5): verified active before the tracking program existed.

- **Tool:** headroom (token-compression proxy in front of LLM calls)
- **Slug:** headroom
- **Category:** Claude Code ecosystem
- **Status:** STUDY
- **Target Phase:** 5 — [ASSUMED: proxy sits in front of worker LLM calls, i.e. orchestrator/kernel loop]
- **Owner (dept/tier):** Token-compression proxy before worker LLMs
- **Trigger Type:** hook / proxy
- **Source:** headroom project (verified active in environment)
- **Pinned Version:** installed at runtime; pin at Phase 5 adoption
- **Purpose:** Compression layer mandated by CEO token-discipline constraint: sits between orchestrator and worker-model calls (OpenRouter path) to cut prompt tokens without quality loss.
- **Official Docs URL:** project README (record at Phase 5 study step)
- **Key API / Usage Notes:** proxy-style interception; Phase 5 must define exactly WHERE in the LiteLLM chain it sits (before LiteLLM = compress once for all providers; evaluate at Phase 5 study pass).
- **Known Pitfalls:** compression of prompts carrying schemas/contracts can break structured outputs — exempt schema-bearing calls; quality-never-drops rule audits compressed vs uncompressed on golden tasks before adoption.
- **Install Command:** already active — formal wiring decision at Phase 5
- **Legitimacy Verdict:** OK as tool; wiring position UNDECIDED (Phase 5 gate)

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06; wiring study owed at Phase 5)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
