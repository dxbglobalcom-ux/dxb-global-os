# Study Card: Graphify (RETROACTIVE)

> Retroactive backfill (Pitfall 5): verified active before the tracking program existed (this project's own planning graph, 472 nodes).

- **Tool:** Graphify (any-input → persistent knowledge graph; god nodes, community detection, query/path/explain)
- **Slug:** graphify
- **Category:** Memory/knowledge
- **Status:** INSTALL
- **Target Phase:** 6 (Memory Router & Knowledge Stores)
- **Owner (dept/tier):** Memory — knowledge graph
- **Trigger Type:** skill / mcp
- **Source:** graphify skill (~/.claude/skills/graphify) + gsd-graphify integration
- **Pinned Version:** installed skill at runtime
- **Purpose:** Knowledge-graph store of the Phase 6 memory composition: answers "what is related and how" (vs pgvector's "what is similar"). Already indexing this repo (.planning/graphs/); Phase 6 wires it behind memory-router adapters.
- **Official Docs URL:** ~/.claude/skills/graphify/SKILL.md
- **Key API / Usage Notes:** `/graphify` build, `/graphify query <term>`, `graphify status` freshness check; GSD projects use `/gsd-graphify build` at phase completion (repo rule).
- **Known Pitfalls:** stale graph = wrong navigation — rebuild when >1 phase behind HEAD (repo CLAUDE.md rule); Phase 6 routing-quality spike measures whether graph answers beat vector answers for relation queries before full adoption.
- **Install Command:** already installed and active — Phase 6 adds router adapter only
- **Legitimacy Verdict:** OK — in live use on this repo

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06)
- [x] INSTALL (verified active — tracker Status INSTALL)
- [ ] ADOPT
- [ ] EMBED
