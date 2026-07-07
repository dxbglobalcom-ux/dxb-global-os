---
phase: 03-state-layer-dxb-mcp-core
plan: 03
subtitle: "@dxb/shared contract layer — LOCKED TaskEnvelope + single Kysely client"
status: complete
executed_by: "Claude Fable 5 — inline, personally (governance v4)"
completed: 2026-07-07
duration: ~8min
commits:
  - (this commit): "feat(03-03): @dxb/shared contracts — LOCKED TaskEnvelope (zod-v4 prefault) + single Kysely/pg client + 13-table DB map (QUEUE-01)"
requirements: [QUEUE-01]
---

# Plan 03-03 Summary

## What was built

1. **`envelope.ts`** — LOCKED TaskEnvelope, master-plan verbatim with ONE recorded adaptation: zod v4 changed `.default({})` semantics (default value now used as-is, inner defaults skipped) — `.prefault({})` restores the exact v3/LOCKED behavior (empty budget → {200000, 1.0}). Proven by tests.
2. **`db-types.ts`** — hand-written Kysely `DB` interface, 13 tables mirroring the migrations 1:1 (Generated for DB-defaulted columns, Numeric as pg string, jsonb as unknown — Zod refines at MCP boundary).
3. **`db.ts`** — the ONE `getDb()` lazy singleton (PostgresDialect over pg.Pool, env-driven `DXB_DATABASE_URL`, session-mode note) + `closeDb()` for tests; actionable error never echoes the URL.
4. Tests: `envelope.test.ts` (5 cases incl. objective<20 rejection + LOCKED defaults) + `db-guard.test.ts` (missing-env throw).

## Verification evidence (executed)

- `pnpm build` → `build_rc=0`
- `pnpm test` → `Test Files 3 passed (3)`, `Tests 7 passed (7)` (incl. "rejects objective shorter than 20 chars" and defaults {200000, 1.0})
- Single-Pool grep gate: `grep -rn 'new pg.Pool(|new Pool(' packages/ | grep -v db.ts` → no hits (exit 1)

## Deviations from plan

1. **zod v4 `.prefault({})`** replacing LOCKED `.default({})` on budget — semantic-preserving adaptation (⛔ FABLE decision, in-line commented); without it the LOCKED defaults silently break under the pinned zod 4.4.3.
2. Live `SELECT 1` smoke deferred to 03-04's lifecycle tests (plan allowed this — wave-2 ordering).

## Fable verdict

**APPROVED — authored and verified personally.** All three must-have truths hold: LOCKED envelope enforcing floors/defaults (test-proven), one-and-only typed DB path (grep-gated), workspace build+test green.

## Next

Wave 3: 03-04 — dxb-mcp server (queue/registry/audit/cost full + 4 stubs + redaction).
