# Study Card: ruflo (RETROACTIVE)

> Retroactive backfill (Pitfall 5): installed before the tracking program existed.

- **Tool:** ruflo (swarm/hooks/memory MCP suite: memory_store, memory_search, hooks_route, swarm_init, agent_spawn, witness manifest)
- **Slug:** ruflo
- **Category:** Claude Code ecosystem
- **Status:** STUDY
- **Target Phase:** 5 — [ASSUMED: kernel-overlap evaluation fits the orchestrator core loop phase]
- **Owner (dept/tier):** Swarm/hooks/memory — evaluate overlap with kernel
- **Trigger Type:** mcp-profile / hook
- **Source:** ruflo-core plugin (MCP server plugin:ruflo-core:ruflo)
- **Pinned Version:** installed plugin at runtime
- **Purpose:** Candidate infrastructure for swarm orchestration and memory routing. Source doc's own instruction: STUDY — evaluate overlap with the DXB kernel before adopting; the kernel must not have two competing swarm layers.
- **Official Docs URL:** plugin README; `/ruflo-status`, `/ruflo-doctor`
- **Key API / Usage Notes:** memory_store/memory_search MCP tools; swarm_init/agent_spawn; witness manifest (ADR-103 signed fix tracking).
- **Known Pitfalls:** functional overlap with Phase 5 orchestrator and Phase 6 memory router — Phase 5 study pass must produce an explicit adopt/reject decision (⛔ Fable decision); do not wire both silently.
- **Install Command:** already installed (plugin) — no action until Phase 5 study pass
- **Legitimacy Verdict:** OK as installed tool; architectural adoption UNDECIDED (Phase 5 gate)

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06; overlap evaluation still owed at Phase 5)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
