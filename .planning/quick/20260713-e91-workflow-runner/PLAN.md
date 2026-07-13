---
type: quick
slug: e91-workflow-runner
created: 2026-07-13
author: fable-5 (inline, K1)
roadmap: E9.1
---

# Execution ticket — E9.1: Workflow runner + step handlers + control fns

**Spec pointers (the plan — no new design here):**
- WORKFLOW_ENGINE_SPEC (whole file, 27 headings — the normative source):
  §3 architecture (runner = LIBRARY inside kernel worker, ⛔ not a service),
  §4 data model (DATA_MODEL 4.4 sufficient, NO new tables; step config Zod at
  `packages/shared/src/contracts/workflow-steps.ts`), §5/6 layout
  (`packages/kernel/src/workflow/` — runner, kind-per-file step handlers,
  trigger registrar; pg-boss `workflow.run`/`workflow.step`; cron via
  `schedule('wf:<slug>')`), §8 API (create/update/copy/enable/disable/
  run_now/cancel_run/resume_run; update bumps version; copy = `-copy-n` +
  enabled=false), §9 events (ops:live `run.*` with workflow_run corr; event
  trigger match on type+entity.kind), §10 state machine (running →
  waiting_approval → running → succeeded|failed|cancelled; waiting_approval =
  PARK — no retry counter, no timeout; steps_snapshot frozen at run start;
  current_step per-step for resume), §13 authz (CRUD CEO-only; run_now CEO or
  system; agents can NOT write workflow defs), §14 logging_level semantics,
  §16 security (no secrets in config; B7b: risk high/critical workflow with an
  outbox-bound action step and no approval step → fn REJECTS), §17-19 errors
  (transient→retry policy · policy→escalate · fatal→run failed + alerts row;
  retry `{max_attempts,backoff_s,on_exhaust}`; fallback `{alternate_steps}`;
  budget/token/timeout run-level enforcement, BUDGET_EXCEEDED; review on_fail
  default escalate), §20/21 tests (kind-per-handler units, state machine
  table, 5-step e2e agent→review→approval→agent→end, park proof, snapshot
  proof, resume proof), §24 smoke-wf verified sequence, §25-27 (singleton
  concurrency default — concurrent trigger logged+skipped; disabled workflow
  trigger → skip note; archived employee → fn rejection at step start; resume
  on deleted-step version → snapshot finishes with old steps).
- DATA_MODEL 4.4: `workflows/workflow_steps/workflow_runs` — LIVE since
  20260711002300 incl. `steps_snapshot` + `fk_agent_runs_wfrun`. No DDL on
  these tables in this row.
- API_CONTRACTS 8b row `workflows` + §17 error dictionary + §14 (fn writes
  audit_log with detail_ref) + §13 B-class (auth wall inside fn, 0015 idiom).
- EVENT_MODEL via `packages/shared/src/contracts/events.ts`: entity kind
  `workflow_run` + `run.*` types already registered; envelope shape LOCKED.
- MODEL_ROUTING_SPEC: step `model_role_slot` resolved through
  `fn_select_model` (E7.1, live); direct model id = exception field.
- APPROVAL_ENGINE / 0015: `decide_approvals` LOCKED — money-out gate
  untouched. Approval step INSERTs approvals row (status 'pending').
- OBSERVABILITY: agent step runs inside `runScope({employeeId,
  workflowRunId})` (E8.1 — agent_runs.workflow_run_id chain is the drill
  spine); fatal alert = INSERT INTO alerts (single-producer trigger
  broadcasts, E8.4b).
- Roadmap acceptance: WORKFLOW §24 smoke-wf end to end.

**Verified live baseline (2026-07-13, this session):**
- Tables + snapshot column + fk live (live DB `\d workflow_runs`).
- `control_workflow_*` fns: ZERO (pg_proc scan). Kernel has no workflow/ dir.
- pg-boss lives ONLY in outbox-executor scheduler (one scheduler process owns
  system routines; HR jobs precedent E5.4b for adopting new queues).
- Resident 24/7 worker = Phase 7 (R3). Intent-intake precedent: DB-row state
  + 5s self-chain drain is the established seam for "API wrote a row, worker
  must act".
- `fn_select_model(p_role_slot, ...)` live; `runScope` accepts employeeId +
  workflowRunId; alerts.level CHECK (informational..emergency), source free.
- agents: status + employment_status + persona_version columns (active +
  persona v2 gate inputs).

**Recorded interpretations / registered adaptations (appended to
WORKFLOW_ENGINE_SPEC adaptation note — CEO-visible):**
1. **run_now/resume enqueue path:** control fn cannot call pg-boss `send()`
   (Postgres-side). Adaptation: fn writes the run row state; the kernel
   drain (`drainWorkflowRuns`, driven by the scheduler's pg-boss
   `workflow.run` self-chain — intent-intake emsal) picks up actionable runs.
   pg-boss stays the execution vehicle; §3 trigger→job semantics preserved.
2. **Approval resume without touching 0015:** spec §6 says the approval
   decision re-queues the run. `decide_approvals` is LOCKED; adaptation: the
   drain scans `waiting_approval` runs whose linked approvals row is decided
   — approved → resume from parked step+1; rejected → run `failed`
   (reason APPROVAL_REJECTED). Mechanically identical outcome; 0015 untouched.
   E9.3 (Approval Center) may later move this to an explicit hook.
3. **B7b detection key:** "outbox'a giden aksiyon" made concrete: an agent
   step whose config carries `outbox_action` (action_type intended for the
   outbox executor). risk high/critical + such a step with NO approval step
   at an earlier seq → create/update REJECTED (`VALIDATION_FAILED`,
   detail names the seq). Money-out can never enter a workflow without an
   approval gate in front.
4. **Singleton skip surface:** concurrent run_now/trigger on a
   singleton workflow returns `{ok:true, skipped:true}` + audit row
   `workflow.run_skipped` (spec: "loglanır + atlanır" — an error would be a
   queue, which is opt-in `'queue'` only).
5. **token_limit enforcement source:** LiteLLM run-tagged counter is Phase-7
   wiring; until then tokens_in+tokens_out summed from agent_runs of the run
   (same enforcement seam, best available counter — single-source cost rule
   respected, budget check reads agent_runs.cost_eur sum).
6. **workflow.step job type:** long-step timeout isolation is a P7 runtime
   concern; library exposes per-step execution so the P7 worker can split
   steps into `workflow.step` jobs without API change. This row runs steps
   in-process (test DB + smoke).

**Deliverables:**
1. `packages/shared/src/contracts/workflow-steps.ts` (+ index export)
2. `supabase/migrations/20260713090000_e91_workflow_engine.sql`
   (control_workflow_action + workflow_runs ops:live broadcast trigger)
3. `packages/kernel/src/workflow/{runner,triggers}.ts` +
   `steps/{agent,approval,review,retry,fallback}.ts` (+ kernel index export)
4. outbox-executor scheduler: workflow queue registration (code-side; resident
   run = P7) · dashboard `/api/control/workflows/route.ts`
5. `tests/e9/workflow-runner.test.ts` (+ contracts test if split)

**Evidence contract (Evidence-Before-Done):**
- §24 sequence: steps_snapshot column check · create smoke-wf via fn →
  ok:true · run_now → run_id · runner drains → workflow_runs.status
  succeeded (test + psql print).
- vitest tests/e9 green: kind-per-handler · state machine table · 5-step e2e
  · park ≠ retry/timeout · snapshot mid-edit · resume_from · B7b reject ·
  singleton skip · BUDGET_EXCEEDED · idempotency replay + MISMATCH · anon
  zero grant · alerts row on fatal.
- Full regression (e7+e8+e9+phase5+phase6) green ×1 AND alerts count returns
  to 0 after run (suite self-cleanup).
- `tsc -b` 0 · dashboard tsc 0.
- UI surfaces (Workflow Settings 17 kalem) = E9.2 — NOT claimed here.

**Boundaries (owed to other rows):** §6.4 17-item Settings UI + run history
panel → E9.2 · Approval Center full page → E9.3 · resident pg-boss worker
boot + LiteLLM token counter → P7 · Live Ops workflow filter chip → E9.2.
