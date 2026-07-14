# E10.2 — Spawn-path binding + hook_version stamp (execution ticket)

**Spec pointer (the plan):** HOLDING-OS-MASTER-PLAN/FABLE_5_HOOK_SPEC.md — §3 (orchestrator.dispatch binding points), §6 (block reject = run never born, task failed(policy)), §9 (`run.finished` payload `hook_result`), §13/§22 (`hook.enabled` flag family; flag-off period temporary AND alerted), §14 (gate decisions land on agent_runs at close), §21 (active employees with NULL `hook_version` = 0), §27 (a run carries its STARTING hook version) + E10.2 boundary line (spawn binding · `agents.hook_version` stamp · employee-card hook status field §5 row 3 · `run.finished.hook_result`). Roadmap row: IMPLEMENTATION_ROADMAP E10.2 — acceptance: **spawn → `agents.hook_version` dolu**.

**Scope carriers:** migration 20260714040000 · `packages/orchestrator` (hook-binding + worker-shim dispatch) · `packages/observability` run-scope closure columns · `/org/employees` hook status column · `/gov/violations` stale zero-state copy · tests/e10 spawn-binding suite · legacy pre-hook suites pinned to flag-off scope.

**Evidence contract (all machine-checked):**
1. ROADMAP ACCEPTANCE: employee `hook_version` set NULL → spawn through `runWorkerOnce` (flag on) → `agents.hook_version` = current version (SQL readback in test).
2. §21: `SELECT count(*) FROM agents WHERE employment_status='active' AND hook_version IS NULL` → 0.
3. Pre-gate REJECT → run never born (no agent_runs row for the task) + task `failed` with policy payload + violation row.
4. Evidence-less done → REVISE re-execution rounds → ESCALATE → run `failed`, task `failed`, `hook_result.verdict='ESCALATE'`.
5. PASS → run `succeeded` with `hook_result.verdict='PASS'` + `agent_runs.hook_version` filled (§27).
6. `run.failed`/`run.succeeded` ops:live envelope carries `hook_result` (§9).
7. Flag off → old path + `hook:disabled` attention alert (§22).
8. Full regression green · tsc -b 0 (root+dashboard) · i18n purity PASS · RULE #0 pass on touched routes (EN+TR × 1280+1920, baselines e102-*.png).

Deviations, if forced, are registered in FABLE_5_HOOK_SPEC "Registered adaptations — E10.2". No design decisions live in this file.
