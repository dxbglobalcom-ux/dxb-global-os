# E10.2 — Spawn-path binding + hook_version stamp — SUMMARY

**Roadmap row:** E10.2 ✓ 2026-07-14 (K1 Fable in person). Acceptance met: **spawn → `agents.hook_version` dolu** (NULL→v1 SQL readback in tests/e10/spawn-binding).

## What shipped

- **Migration `20260714040000_e102_spawn_binding.sql`** (applied 2×, idempotent): `agent_runs.hook_version` (§27) + `agent_runs.hook_result` (§14), ops:live run envelope payload gains `hook_result` (§9), §21 backfill (non-archived NULL→v1), `hook.enabled` global → **true** (E10.1 seed promise closed).
- **`packages/orchestrator/src/hook-binding.ts`** (new): dispatch glue — flag resolve (employee→global, fail-closed direction), HookCtx assembly from real rows, idempotent `stampHookVersion`, executor-declared evidence extraction (never fabricated), `hook_result` builder, §22 `hook:disabled` attention alert.
- **`runWorkerOnce` bound** (worker-shim): preTask before the run is born (block REJECT → task `failed(policy)`, zero `agent_runs` rows), stamp on PASS, std 11 purpose injection, post-exec runtime monitors, §19 REVISE loop with feedback re-execution, exhaust → ESCALATE (§7 chain + approval in `hook_result`), run `succeeded` ONLY through post-gate PASS (std 9).
- **Observability**: `RunScope` opens with `hookVersion`, closes with `hook_result` (R2 closure column).
- **UI**: `/org/employees` "Fable 5 Hook" column (§5 row 3; archived = neutral); `/gov/violations` zero-state promise copy closed. i18n EN+TR (1266=1266 parity).
- **Adaptations A9–A14** registered in FABLE_5_HOOK_SPEC (CEO-visible).

## Evidence (✓ VERIFIED)

| Claim | Evidence |
|---|---|
| Stamp on spawn | tests/e10/spawn-binding 6/6 — NULL→v1 readback |
| §21 zero unbound active | SQL probe in suite + post-migration psql → 0 |
| Run never born on pre-REJECT | zero agent_runs rows + failed(policy) + violation row |
| REVISE→ESCALATE | max_rounds+1 executions, feedback carried, approval_id + hook_escalation rows |
| §22 flag-off alerted | old path + `hook:disabled` attention alert |
| §9 envelope | LISTEN capture: run.succeeded payload hook_result.hook_version=v1 |
| Regression | 48 files **342/0** (pre-hook suites pinned loud via `pinHookOff` — A13) |
| Types/purity | tsc -b 0 root+dashboard; i18n purity PASS 1266=1266 |
| Residue | violations 0 · alerts = 1 genuine queue-age · flag TRUE · e102t rows 0 |

## ⚠ UNVERIFIED (human eye)

9 baselines `e102-*.png` in references/design-bank (INDEX PENDING CEO eye). In-pass RULE #0 catch fixed: 1280 column crush hid the hook column → `min-w-[960px]` real scroll + archived Unbound de-alarmed.

## Boundaries (recorded, CEO-visible)

Workflow-executor hook adoption + mid-run monitor taps + evidence-protocol default executor → P7 worker unification (A9/A14). Pre-gate <100ms metric → P7 health row.
