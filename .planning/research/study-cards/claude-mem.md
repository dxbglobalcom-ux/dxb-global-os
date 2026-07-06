# Study Card: claude-mem (RETROACTIVE)

> Retroactive backfill (Pitfall 5): installed before the tracking program existed.

- **Tool:** claude-mem (cross-session observation memory: auto-capture hooks, mem-search, timeline)
- **Slug:** claude-mem
- **Category:** Claude Code ecosystem
- **Status:** STUDY
- **Target Phase:** 6 (Memory Router & Knowledge Stores)
- **Owner (dept/tier):** Cross-session memory, all agents
- **Trigger Type:** hook (auto)
- **Source:** claude-mem plugin (marketplace)
- **Pinned Version:** installed plugin at runtime
- **Purpose:** Session-observation store: captures work observations automatically, injects session context, searchable across sessions. In DXB architecture it remains an AUTONOMOUS hook — one of the five stores behind the Phase 6 memory router, synced to memory_index by pointer only (MASTER-PLAN PHASE-06 LOCKED decision: not moved behind the router).
- **Official Docs URL:** `/claude-mem:how-it-works` skill
- **Key API / Usage Notes:** observation search via mem-search skill / MCP tools (get_observations, timeline, smart_search); session_start context injection.
- **Known Pitfalls:** auto-injection adds per-session token load (project Pitfall 5/context-rot family) — keep injection scope tuned; provenance/trust tiers do NOT apply inside claude-mem, so gated decisions must never cite claude-mem content directly (router-recalled trusted facts only).
- **Install Command:** already installed (plugin, auto hooks)
- **Legitimacy Verdict:** OK — in live use since project start

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
