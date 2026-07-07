---
phase: 04-safety-rails-gates-cost-audit
plan: 03
status: complete
completed: 2026-07-08
executor: "Claude Fable 5 — inline, personally (governance v4; no subagents)"
requirements: [GATE-02]
---

# 04-03 Summary — Outbox executor LOCKED core + double-fire/TOCTOU proofs + 0008 hardening

## What happened

- **Task 1 — executor core (⛔ LOCKED) + actions registry + test.write_file.** Master-plan §3 tick() transcribed verbatim into `packages/outbox-executor/src/index.ts` with exactly the three mandated adaptations, each marked `[ADAPT-x]` in code: (a) `getDb()` instead of the notation-only `import { db }` (single-client rule), (b) audit append per branch as in-transaction audit_log INSERTs, actor `system:outbox` — select list gains `approvals.task_id` solely for the causal chain, (c) `executed_at: sql\`now()\`` (DB-side time). Handler registry refuses unknown action_type loudly; v1 handler `test.write_file` confines writes under `tmp/outbox-proof/` (absolute-path + traversal guards) and is write-once per idempotency key (marker line).
  ✓ VERIFIED: `pnpm build` green; `pnpm vitest run tests/phase4/toctou.test.ts` → `Tests 5 passed (5)`.
- **Task 2 — e2e + double-fire + TOCTOU tests.**
  ✓ VERIFIED (toctou.test.ts, 5 tests): full e2e draft→finalize→CLI approve→tick() → file exists with content, outbox `executed`/`attempts=1`, audit chain for the task ≥3 (`approval.submit_draft`, `approval.approve`, `outbox.executed` all present); TOCTOU corruption row (outbox 'ready' over a still-'pending' approval, inserted directly) → `failed` with the exact re-check error `approval not in approved state at execution time`, handler never ran (no file), `outbox.execute_failed_recheck` audited; unknown action_type → tick rejects `/no handler for nope.unknown/`, transaction rollback proven (row stays `ready`, attempts=0); traversal payload `../escape.txt` → `failed` `/refuses path escaping/`, nothing written outside; absolute path refused.
  ✓ VERIFIED (double-fire.test.ts, 2 runs): `Promise.all([tick(), tick()])` on one ready row → status `executed`, `attempts=1`, file contains exactly ONE idempotency marker, exactly one `outbox.executed` audit row — SKIP LOCKED single-claim proven, green twice (flake check).
  ✓ VERIFIED (whole workspace): `Test Files 9 passed (9)`, `Tests 33 passed (33)`.
- **Task 3 — 0008 revoke TRUNCATE (⛔ decision recorded in the migration).** `REVOKE TRUNCATE ON task_events, audit_log, cost_ledger FROM PUBLIC, anon, authenticated, service_role;` — evidence chain unwipeable via any API-path role; postgres superuser keeps the operational escape.
  ✓ VERIFIED: `supabase db reset` exit 0 over 8 migrations; personas reseeded (153); `\dp task_events` shows no `D` on anon/authenticated/service_role lines; `information_schema.role_table_grants` lists TRUNCATE **only** for `postgres` across all three tables; post-reset `docker restart dxb_litellm` → `healthy` (04-02 pitfall procedure applied); final whole-suite re-run green (33/33).

## Deviations (recorded, no scope change)

1. **`tmp/` added to .gitignore** — proof artifacts from test.write_file must never enter history (not in the plan's file list; hygiene).
2. **Executor package gains `kysely`, `zod`, `@types/node` deps + tsconfig `types: ["node"]`** — required by the LOCKED loop (sql tag), payload validation, and fs/path usage; plan named package.json among files_modified.

## Key outcomes for the rest of Phase 4

- GATE-02 is machine-proven on a harmless action: one row, one effect, once — TOCTOU closed in ONE transaction, double-fire closed by SKIP LOCKED.
- 04-04 wires pg-boss schedules around the exported `tick()` (15s cron) in `scheduler.ts`; `runOnce()` exists for tests/ops.
- Stripe/DocuSign/Gmail handlers deliberately DO NOT exist until Phase 11 (registry contains only test.write_file).
