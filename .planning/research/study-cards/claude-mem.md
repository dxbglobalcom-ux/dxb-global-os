# Study Card: claude-mem

> Retroactive backfill (Pitfall 5) completed 2026-07-08 (06-01 Task 1): storage layout + pointer-sync read surface recorded.

- **Tool:** claude-mem (cross-session observation memory: auto-capture hooks, mem-search, timeline)
- **Slug:** claude-mem
- **Category:** Claude Code ecosystem
- **Status:** ADOPT
- **Target Phase:** 6 (Memory Router & Knowledge Stores)
- **Owner (dept/tier):** Cross-session memory, all agents
- **Trigger Type:** hook (auto)
- **Source:** claude-mem plugin (marketplace)
- **Pinned Version:** installed plugin at runtime (marketplace-managed)
- **Purpose:** Session-observation store: captures work observations automatically, injects session context, searchable across sessions. In DXB architecture it remains an AUTONOMOUS hook — **LOCKED (MASTER-PLAN PHASE-06): claude-mem stays OUTSIDE the router write path; the router only pointer-syncs its observations into memory_index. The router NEVER writes into claude-mem.**
- **Official Docs URL:** `/claude-mem:how-it-works` skill

## Storage layout (verified 2026-07-08 on this machine)
- **SQLite DB:** `~/.claude-mem/claude-mem.db` (WAL mode — .db-shm/.db-wal present)
- **Tables:** `observations`, `session_summaries`, `user_prompts`, `sdk_sessions`, `pending_messages` + FTS5 mirrors (`observations_fts`, ...)
- **observations columns (pointer-sync-relevant):** `id` INTEGER PK, `memory_session_id`, `project`, `text`, `type`, `title`, `subtitle`, `facts`, `narrative`, `concepts`, `files_read`, `files_modified`, `prompt_number`, `created_at`, `created_at_epoch`, `content_hash`
- **Vector side:** `~/.claude-mem/chroma/chroma.sqlite3` (Chroma store, plugin-internal — NOT touched by the router)

## Pointer-sync read surface (adapter contract for 06-06)
- Read-only SQL over `~/.claude-mem/claude-mem.db` `observations` (filter `project` = this repo's project slug; order `created_at_epoch`).
- Pointer row in memory_index: `store='claude-mem'`, `ref=<observation id>`, kind/provenance mapped from `type`/`project`; **idempotent by ref** (observation id is stable + `content_hash` guards content identity).
- MCP alternative surface (session-side, not adapter-side): `get_observations([ids])`, `timeline`, `smart_search`.
- Sync cadence: hourly pg-boss schedule `claude-mem-sync` (06-08).

## Known Pitfalls
- Auto-injection adds per-session token load (Pitfall 5/context-rot family) — keep injection scope tuned.
- Provenance/trust tiers do NOT apply inside claude-mem → pointer rows enter memory_index as session-observation provenance; gated decisions must never cite claude-mem content directly (router-recalled trusted facts only).
- DB is live-written by hooks (WAL): adapter opens read-only and tolerates busy/locked with retry; never writes, never migrates that schema.

- **Install Command:** already installed (plugin, auto hooks); no Phase-6 install action
- **Legitimacy Verdict:** OK — in live use since project start

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06; read-surface study completed 2026-07-08)
- [x] INSTALL (plugin active — hooks firing this very session)
- [x] ADOPT (2026-07-08 — pointer-sync-only contract adopted; code lands 06-06)
- [x] EMBED (2026-07-09, 06-08 — hourly `claude-mem-sync` pg-boss schedule registered in outbox-executor scheduler.ts; sync idempotency proven 06-06)
