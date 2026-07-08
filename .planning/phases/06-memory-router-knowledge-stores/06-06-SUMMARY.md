---
phase: 06-memory-router-knowledge-stores
plan: 06
status: complete
completed: 2026-07-09
duration: ~20min
tasks_completed: 3/3
commits:
  - "(this commit) feat(06-06): all four stores wired — graphify/notebook adapters, claude-mem pointer sync, per-store round-trips"
---

# 06-06 SUMMARY — graphify + notebook adapters, claude-mem pointer sync, round-trips

**Executed inline by Fable 5 (governance v5 — no subagent).** Master step 8: the spike-confirmed composition (CONFIRMED 20/20 — NO deferral, all four stores in scope) is fully wired behind the single door; every store proves write→memory_index→recall with executed evidence.

## What closed

- **`adapters/graphify.ts`** — card contract followed exactly: graphify has NO programmatic node-add API (corpus-driven), so a relation-kind memory IS a corpus note under `memory-store/relation/<indexId>.md` (obsidian fs mechanics reused: frontmatter, uuid-validated path, `wx` no-overwrite); ref = note path, idempotent by ref; graph ingests at the next build cycle. `readRelationByRef` = deterministic disk read (no skill/LLM dependency — card pitfall honored). `updateGraphIncremental()` = `execFile('graphify', ['update', corpusPath])`, exported for the 06-08 cron, deliberately NOT on the write path (a possibly-slow CLI must never sit inside the rule-4 transaction).
- **`adapters/notebook.ts`** — open-notebook REST per live OpenAPI (documented surface, verified this session): `POST /api/notes {title, content, note_type:'ai'}` → server-assigned note id = ref; `GET/DELETE /api/notes/{id}`; base URL env `DXB_NOTEBOOK_URL` default `http://127.0.0.1:5055` (local-only, T-06-19); 10s timeout; container down → **typed `NotebookDownError`** with the compose-up pointer — recall/commit stay loud when the service sleeps.
- **`adapters/claude-mem.ts`** — pointer sync ONLY (LOCKED): read-only SQL over `~/.claude-mem/claude-mem.db` observations via `node:sqlite` (no new dependency), WAL busy-retry, project-filtered; `syncClaudeMem(db,{since?,dbPath?,project?})` inserts memory_index pointer rows (kind=fact, store='claude-mem', ref=observation id, agent-origin trusted per rule 1), idempotent by ref, returns `{scanned, inserted, skipped}`; exported for the 06-08 hourly cron. `readObservationByRef` composes body from title/subtitle/narrative/facts (`text` is NULL in current live rows — verified). **NO write surface toward claude-mem exists** (grep-proven).
- **write-policy registry** — graphify/notebook entries real; the not-wired guard/error class deleted (spike deferred nothing → the error path is zombie code; its pre-write-failure duty is carried by the failing-adapter atomicity negative). `SERVER_ASSIGNED_REF` mechanism: notebook's ref placeholder is updated to the returned doc id INSIDE the same rule-4 transaction; fs/pgvector stores keep the hard ref-mismatch error.
- **recall registry** — `makeRefReader(store, resolve)` generalizes the 06-05 obsidian reader: obsidian/graphify → disk, notebook → `readDoc`, claude-mem → `readObservationByRef`; broken refs stay loud + audited (`memory_ref_broken`). Trust/superseded/expiry filtering unchanged (SQL layer, LOCKED).

## Decisive evidence (executed)

- ✓ Build + exports: `pnpm build` clean → `SYNC_OK REGISTRY_OK` (syncClaudeMem on dist index)
- ✓ Registry clean: `! grep -rn "StoreNotWiredError" packages/memory-router/src/` → `NO_UNWIRED_ENTRIES` (no spike-deferred store exists)
- ✓ No router→claude-mem write: `! grep "writeObservation\|commitToClaudeMem"` → `NO_CLAUDE_MEM_WRITE`
- ✓ Round-trip suite: `vitest run adapters-roundtrip` → `7 passed (7)` — per store: **pgvector** (index row + TTL + embedding row + recall body), **obsidian** (note on disk + recall), **graphify** (corpus note at ref, frontmatter `kind: "relation"`, no TTL, recall), **notebook** (server-assigned ref ≠ index id, ref updated in-tx, `GET` returns body verbatim, recall)
- ✓ claude-mem sync counts: first run `{scanned:2, inserted:2, skipped:0}`, second run `{scanned:2, inserted:0, skipped:2}` (idempotency evidence), `since` filter `{scanned:1, inserted:0, skipped:1}`; pointer rows trusted/fact; readByRef body carries title+narrative+facts
- ✓ Cross-adapter atomicity negative: `DXB_NOTEBOOK_URL` → dead port → commit rejects **typed** `NotebookDownError`, zero orphan memory_index rows (provenance-agent sweep)
- ✓ Suite fails LOUD when notebook is down: beforeAll throws with the compose.local.yml pointer (never skips)
- ✓ Full regression: `pnpm vitest run` → `21 passed (21)`, `99 passed | 13 skipped (112)` (was 93|13 at 06-05: +7 round-trip, −1 obsolete not-wired test)
- ✓ Live CLI check: `graphify --help` → `update <path>   re-extract code files and update the graph (no LLM needed)`

## ⚠ UNVERIFIED (honest tier)

- `updateGraphIncremental()` has NOT been executed against a real corpus (the CLI invocation shape is verified via `--help` only); first scheduled run lands with the 06-08 cron — runtime behavior of `graphify update memory-store/relation` remains to be observed there.

## Deviations recorded (Fable, CEO-visible)

1. **Study-card correction (graphify):** the card's recorded invocation `execFile('graphify', [<path>, '--update'])` was STALE — live `graphify --help` ships the subcommand form `update <path>`. Adapter uses `['update', corpusPath]`; the card is corrected in place with the evidence line (process rule: no guessing — live surface wins, card stays truthful).
2. **Plan-text "node queryable" adjusted to card contract:** the graphify physical-artifact assertion is the corpus note on disk (the node's source of truth) — per the card, graph ingestion is build-cycle, not per-write; a per-commit graph rebuild would put a heavy CLI inside the door's transaction.
3. **Obsolete poisoning test removed:** "relation commit throws StoreNotWiredError before any row" tested the 06-04 seam this plan removes; its atomicity duty is carried by the failing-adapter negative (plan omission — poisoning.test.ts wasn't in files_modified but had to change).
4. **claude-mem sync in tests runs against a FIXTURE SQLite db** (plan-sanctioned option): syncing the real 1,8xx-observation store belongs to the 06-08 cron with a since-watermark, not a mid-phase mass insert.
5. **Pointer rows get `expires_at: null`** (plan silent): rule-5 TTL is door policy; pointers mirror the observation's own lifetime — compaction semantics arrive with 06-08.

## Downstream contracts armed

- `syncClaudeMem` + `updateGraphIncremental` → **06-08** cron schedules (hourly claude-mem sync; graph ingest cadence) + compaction battery
- `NotebookDownError` typed surface → Phase 7 VPS placement decision can distinguish "down" from "broken"
- MEM-02/MEM-03 store-integration claims now hold with per-store executed evidence (master step 8 gate line)
