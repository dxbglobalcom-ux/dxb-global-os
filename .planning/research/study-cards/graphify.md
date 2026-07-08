# Study Card: Graphify

> Retroactive backfill (Pitfall 5) completed 2026-07-08 (06-01 Task 1): adapter-facing invocations + graph locations + idempotency now recorded.

- **Tool:** Graphify (any-input → persistent knowledge graph; god nodes, community detection, query/path/explain)
- **Slug:** graphify
- **Category:** Memory/knowledge
- **Status:** ADOPT
- **Target Phase:** 6 (Memory Router & Knowledge Stores)
- **Owner (dept/tier):** Memory — knowledge graph
- **Trigger Type:** skill / mcp
- **Source:** graphify skill (~/.claude/skills/graphify) + CLI binary `~/.local/bin/graphify` + gsd-graphify integration
- **Pinned Version:** installed skill+CLI at runtime (skill dir is the source of truth; no semver published)
- **Purpose:** Knowledge-graph store of the Phase 6 memory composition: answers "what is related and how" (vs pgvector's "what is similar"). Already indexing this repo; Phase 6 wires it behind the memory-router `graphify` adapter for `relation`-kind memories.
- **Official Docs URL:** ~/.claude/skills/graphify/SKILL.md

## Key API / Usage Notes (adapter contract for 06-06)

**Graph locations (both live in this repo):**
- `graphify-out/graph.json` — canonical CLI default (SKILL.md fast path checks exactly this)
- `.planning/graphs/` — gsd-graphify build output (graph.json + graph.html + GRAPH_REPORT.md), refreshed at phase completion (`/gsd-graphify build`)

**Write (add node):** graphify has NO programmatic single-node-add API — build/update is corpus-driven (`/graphify <path>`, `/graphify add <url>` for URLs, `--update` incremental). Adapter design therefore: a `relation`-kind memory is written as a note under `memory-store/relation/` (same fs mechanics as the obsidian adapter) and the graph ingests it at the next build cycle; the adapter records the ref and, when the CLI is available, triggers an incremental update. Exact invocation recorded for 06-06: `execFile('graphify', ['update', <corpus-path>])` — no shell interpolation. **(Corrected 2026-07-09 at 06-06 EMBED: live `graphify --help` shows the subcommand form `update <path>` ("re-extract code files and update the graph (no LLM needed)"); the earlier `[<corpus-path>, '--update']` note was stale.)**

**Read (query):**
- CLI direct (no LLM): `graphify path "A" "B" --graph graphify-out/graph.json`, `graphify explain "X" --graph graphify-out/graph.json`
- Skill-level: `/graphify query "<question>"` (BFS; `--dfs`, `--budget N`) — session-side, not adapter-side
- Adapter-side primary read: parse `graphify-out/graph.json` directly (JSON nodes/edges) — deterministic, no LLM dependency.

**Idempotency:** rebuild regenerates deterministically from corpus (same input → same graph); `add` appends the source to `./raw` then updates — re-adding identical content deduplicates at corpus level. Adapter writes are idempotent by ref (note path).

## Known Pitfalls
- Stale graph = wrong navigation — rebuild when >1 phase behind HEAD (repo CLAUDE.md rule).
- `graphify query` rich traversal lives in the SKILL (LLM-assisted); the bare CLI ships `path`/`explain`/`diagnose` — the adapter must not depend on skill-only behavior. JSON read is the stable machine surface.
- 06-02 routing-quality spike gates full adoption: if relation-recall via graph underperforms (<16/20 composite), Fable decides composition (defer graphify OR notebook) before 06-06 builds the adapter.

- **Install Command:** already installed and active — Phase 6 adds router adapter only
- **Legitimacy Verdict:** OK — in live use on this repo

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06; adapter contract filled 2026-07-08)
- [x] INSTALL (verified active — CLI at ~/.local/bin/graphify, graphs present in-repo)
- [x] ADOPT (2026-07-08 — adapter contract above adopted; spike 06-02 may still defer)
- [x] EMBED (2026-07-09, 06-06 — adapter live behind the door; round-trip green in tests/phase6/adapters-roundtrip.test.ts; incremental ingest scheduled at 06-08)
