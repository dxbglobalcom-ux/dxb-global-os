---
phase: 05-kernel-orchestrator-core-loop
plan: 02
status: complete
completed: 2026-07-08
duration: ~15min
tasks_completed: 3/3
commits:
  - "(migration commit) feat(05-02) routing_and_deps migration + types"
  - "(seed commit) feat(05-02) routing-seed.json + seeder"
  - "(summary commit) docs(05-02)"
---

# 05-02 SUMMARY — routing_and_deps migration + brain-map seed + BLOCKING schema push

**Executed inline by Fable 5 (governance v5 — no subagent).**

## What closed

Master-plan PHASE-05 §4 step 2: LOCKED migration applied to the live DB, §3 brain map lives as 19 data rows, dependency-aware `claim_next_task` proven with observed rows.

## Decisive evidence (executed)

- ✓ LOCKED SQL byte-faithful: extracted region (CREATE TABLE routing_rules → `$$ LANGUAGE sql;`) diffed against PHASE-05 §3 block → **`LOCKED-DIFF EMPTY ✓`** (empty diff output).
- ✓ `pnpm build` exit 0 after RoutingRulesTable + tasks.depends_on (Generated<string[]>) + DB map registration.
- ✓ Seed integrity node check → `TASK2 NODE CHECK PASS`; council rows exactly: `strategy, architecture, final-approval, content.outbound` (LOCKED cost decision held).
- ✓ `supabase db reset` exit 0 — `Applying migration 20260708000009_routing_and_deps.sql...` then `Finished supabase db reset`.
- ✓ Re-seed: `classified personas: 153 across 11 departments`; `SELECT count(*) FROM agents` → **153** (corpus not lost).
- ✓ Routing seed: `routing rules: inserted 19 / total 19`; second run → **`inserted 0 / total 19`** (idempotency executed).
- ✓ `SELECT count(*) FROM routing_rules` → **19** (≥ 8).
- ✓ `\df claim_next_task` → `public | claim_next_task | SETOF tasks | p_worker_id text, p_departments text[], p_lease_seconds integer DEFAULT 900`.
- ✓ Dependency-claim live proof (psql via supabase_db container):
  - A=`ec136705-…`, B=`305e03eb-…` (B.depends_on={A}), both status queued
  - claim 1 → returned **A only** (B correctly blocked)
  - A→done; claim 2 → returned **B**
  - proof rows deleted (`PROOF TASKS CLEANED`)
- ✓ Full suite after push: `Test Files 12 passed (12)`, `Tests 45 passed | 3 skipped (48)`.

## Deviations (recorded)

- **ADAPT-1:** filename `20260708000009_routing_and_deps.sql` (master plan says `0008…`; logical slot 0008 consumed by Phase-4 revoke_truncate; Supabase CLI timestamp naming per 03-02 precedent). SQL content unchanged.
- **ADAPT-2:** api-mode model strings use LiteLLM-verified names (kimi-2.7 → `kimi-2.7-code`, deepseek-v4 → `deepseek-v4-flash`, qwen → `qwen3.6-flash`, minimax-3 → `minimax-m3`).
- **ADAPT-3:** orchestration-group effort `medium-high` is not a legal CHECK value → `high`.
- **Render note (not a deviation):** content.outbound seed line pins only sonnet-5 (polish); draft/humanizer stage models are unpinned in the master line — pipeline recorded as data in `match.pipeline`, model=sonnet-5, needs_council=true. No model invented.

## Discovery (operational)

`supabase db reset` drops the `litellm` Prisma schema (Phase-4 shared-DB decision). **After every reset: `docker restart dxb_litellm`** — Prisma recreates 66 tables in ~30s; until then velocity tests fail with `relation "litellm.LiteLLM_SpendLogs" does not exist`. First test run post-reset failed 5 tests for exactly this reason; green after restart. Also: proof INSERTs must set `status='queued'` explicitly (default is `'inbox'`).
