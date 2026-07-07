---
phase: 03-state-layer-dxb-mcp-core
plan: 05
subtitle: "Crash test (kill -9), 10/10 lifecycle battery, tracker EMBED, verification evidence"
status: complete
executed_by: "Claude Fable 5 — inline, personally (governance v4)"
completed: 2026-07-07
duration: ~15min
commits:
  - db90b8e: "feat(03-05): kill -9 crash test green + reaper evidence fix (QUEUE-02)"
  - (this commit): "feat(03-05): 10/10 lifecycle battery + tracker EMBED truth-up + 03-VERIFICATION evidence"
requirements: [QUEUE-02]
---

# Plan 03-05 Summary

## What was built

1. **Crash test** (`crash.test.ts` + `crash-worker.mjs`): REAL child process claims with a 2s lease, is SIGKILLed (exit signal asserted), reap returns ≥1, the SAME task is re-claimed by a new worker, `reaped` event carries `was_claimed_by`. Green twice.
2. **Reaper evidence fix (⛔ FABLE-ONLY revision, evidence-driven):** the crash test caught a real bug in the LOCKED reaper — `UPDATE..RETURNING` returns NEW values, so `was_claimed_by` persisted as NULL (evidence chain defeated). Old `claimed_by`/`status` now captured in a `FOR UPDATE SKIP LOCKED` pre-CTE; `from_status` records the true pre-reap status. Migration + master-plan mirror both updated with the rationale inline.
3. **`scripts/phase3-lifecycle-battery.mjs`**: 10 consecutive full lifecycles through the real MCP tool path; iteration 10 runs the returned-path variant; exit-code driven.
4. **Tracker EMBED truth-up:** mcp-sdk/zod/kysely/pg → EMBED (import-proven by grep), supabase-cli → ADOPT (workflow-active), supabase → INSTALL (stack running), supabase-js stays INSTALL (declared, not yet imported — honest state). Card checklists synced; validator green.
5. **03-VERIFICATION.md** — all five gate criteria freshly re-executed with decisive output lines; `status: passed`.

## Verification evidence (executed)

- Crash test → `Tests 1 passed` ×2 (SIGKILL signal asserted; reap ≥1; re-claim same id)
- Battery → `iteration 1..10 OK`, `10/10 PASS`, exit 0
- Fresh gate pass: `reset_rc=0`; seed `153 across 11` = DB `153` dormant v1.0-legacy; `pnpm test` → `Test Files 6 passed (6)`, `Tests 18 passed (18)`
- `node scripts/check-integration-tracker.mjs` → `tracker OK: 57 data rows (53 non-excluded, 4 excluded), 53 study cards`

## Deviations from plan

1. **Reaper SQL fix** — a LOCKED-SQL change, executed under the ⛔ FABLE-ONLY authority with test evidence (see commit db90b8e); this is the intended failure mode of the crash gate: it exists precisely to catch this class of bug before Phase 4 automates reaping.
2. crash-worker written as `.mjs` with raw pg (via @dxb/shared's createRequire) instead of `.ts` — Node strip-types can't resolve `.js`-suffixed TS imports in a standalone spawn; raw SQL claim is protocol-identical for the victim role.

## Fable verdict

**APPROVED — authored and verified personally.** All four must-have truths hold: kill -9 durability proven with non-null evidence payload, 10/10 battery exit 0, tracker reflects import-proven reality, VERIFICATION.md carries freshly-executed proof for every gate criterion.

## Next

Phase 3 closure: Fable reads all five SUMMARYs + 03-VERIFICATION.md → ⛔ FABLE-ONLY phase verdict → STATE/ROADMAP sync → graphify rebuild.
