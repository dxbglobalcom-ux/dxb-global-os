# Study Card: GBrain

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 21).

- **Tool:** GBrain — Garry Tan's opinionated agent "brain": knowledge base + signal detection + ingestion + cron + identity/access, exposed as 30+ MCP tools
- **Slug:** gbrain
- **Category:** Memory/knowledge
- **Status:** STUDY
- **Target Phase:** ref only (pattern source) — runtime adoption has NO target phase; would require CEO decision
- **Owner (dept/tier):** Memory system (architecture reference)
- **Trigger Type:** ref
- **Source:** https://github.com/garrytan/gbrain — MIT; production brain behind the author's OpenClaw/Hermes fleet (146,646 pages, 24,585 people, 5,339 companies, 66 cron jobs cited)
- **Pinned Version:** n/a (reference study)
- **Purpose (as studied):** Pattern mine, not a component. Pluggable engines (PGLite embedded / Postgres+pgvector on Supabase — same substrate we run), hybrid search, content ingestion + enrichment pipelines, signal detection, scheduled reports, access control; `claude mcp add gbrain -- gbrain serve` zero-server local mode.
- **Official Docs URL:** https://github.com/garrytan/gbrain/blob/master/docs/INSTALL.md

## Key API / Usage Notes

- **Verdict: DO NOT ADOPT as runtime.** Direct collision with MEMORY_ARCHITECTURE (our four-layer memory + pgvector + memory_source bridge is BUILT and live). Running a second brain = two sources of truth — forbidden by the single-state-store rule.
- **What we mine from it (ref value):** signal-detection loop shape (ingest → enrich → signal → report cron) maps onto our Revenue Engine scan cadence; people/company graph schema ideas for CRM enrichment; MCP surface design (30+ tools over one brain) as a gateway-pattern reference.
- COG-second-brain / claude-brain forks: same verdict, same reason.

## Known Pitfalls

1. Adopting "just a piece" still imports its schema/engine — extraction must be pattern-level (rewrite in our stack per D6), never dependency-level.
2. Its Supabase mode expects its own schema on the instance — never point it at our production DB even for experiments; a scratch instance only.

- **Install Command:** none (ref) — any experiment: isolated scratch env, never production Supabase.
- **Legitimacy Verdict:** OK — MIT, credible author/production story; excluded from runtime by architecture law, kept as pattern reference.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass; verdict = ref-only)
- [ ] INSTALL (n/a — ref)
- [ ] ADOPT (pattern citations in future Revenue Engine scan design)
- [ ] EMBED
