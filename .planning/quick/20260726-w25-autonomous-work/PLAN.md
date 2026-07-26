# W2.5 — Autonomous work generation (execution ticket)

**Ticket, not a plan.** The plan exists once: `HOLDING-OS-MASTER-PLAN/`.
Roadmap row: `00-NOTE-FACTORY-COMPLETION-ROADMAP-2026-07-26.md` row 2.5 —
"**Autonomous work generation** — all three task-creating paths need a human
today. This is the line between '24/7 OS' and 'very well audited idle system'.
| AGENT_ORCHESTRATION_SPEC | tasks appear and complete with no CEO input in the
window".

Spec pointers: `AGENT_ORCHESTRATION_SPEC` §3 (run lifecycle — dispatch is the
doorway), §4 (employee selection, spawn depth), §13 (authorisation), §14-15
(audit); `REVENUE_ENGINE_SPEC` §7quinquies (the W2.4 seam this continues).

## Measured baseline (2026-07-26 18:2x, this session)

| Fact | Measurement |
|---|---|
| Task-creating paths in code | `packages/orchestrator/src/dispatch.ts:54`, `packages/dxb-mcp/src/groups/queue.ts:41`, `packages/revenue/src/discovery.ts:276` (+ SQL doors: approval centre migration, W2.4 allocation seam) |
| Every one of them starts at a human | dispatch ← intent (CEO chat/voice/dashboard); queue.ts ← an agent already inside a CEO-started run; discovery ← `trigger='ceo'` (`discovery.ts:208` keeps the scheduled lane off by CEO order) |
| Nothing consumes a finished task's own output as the source of the next task | `grep -rn "insertInto(\"tasks\")\|INSERT INTO tasks" packages apps` → 3 hits, none reads `tasks.result` |
| The W2.4 kickoff task therefore terminates | a pilot plan is produced, read by nobody, and the project goes quiet |
| Open work right now | `SELECT count(*) FROM tasks WHERE status IN ('queued','claimed','running')` → 0 |

So the missing path is **machine output → machine work**: the plan a worker
finished becomes the tasks that execute it, with no human in between.

## What ships

1. **`generated_work` table** — `(plan_task_id, step_index, task_id, digest)`
   with `UNIQUE (plan_task_id, step_index)`: idempotency is structural, so a
   second pass over the same plan CANNOT double-open work.
2. **`control_work_generate(p_plan_task_id, p_steps)`** — SECURITY DEFINER door,
   actor `system` or `ceo`. Refusals (never silent): `DISABLED`,
   `PLAN_NOT_DONE`, `PROJECT_NOT_ACTIVE`, `NO_STEPS`, `ALREADY_GENERATED`.
   Per-step skips carry their reason (`unknown_department`, `no_staff`,
   `duplicate`). A cap that truncates is REPORTED, never silent.
3. **Settings keys** — `orchestration.autogen.enabled` (default true: work
   inside a project the CEO already approved is not a new decision) and
   `orchestration.autogen.max_steps` (default 3). Both registered, both in the
   settings surface, so the kill switch is the CEO's.
4. **The plan contract gains its Turkish leg** — the step line becomes
   `<step> | owner: <department> | tr: <Turkish>`; the model that writes the
   plan is the only cheap, accurate translator, and the CEO's board reads
   Turkish (i18n purity).
5. **`packages/orchestrator/src/work-generation.ts`** — finds done plan tasks
   with unharvested steps, parses the STEPS block, calls the door.
6. **Scheduler job** `orchestration.work_generate` on a cadence — the seam runs
   with nobody watching, which is the whole point of the row.

## Boundaries (what this deliberately does NOT do)

- It never creates a project, an objective, an opportunity or an allocation —
  those are CEO decisions and stay CEO decisions.
- It never widens scope: only steps of a plan that a CEO-approved project
  already owns become tasks.
- It never bypasses the approval gate; generated tasks inherit `approval_class`
  discipline and every outward step still stops at the gate.

## Evidence contract

- red-first tests in `tests/c9/work-generation.test.ts` (rolled-back
  transactions on the live DB) covering: refusal when disabled, refusal on an
  unfinished plan, refusal on a paused project, generation with staffing,
  structural idempotency, cap truncation reported, per-step skip reasons.
- `pnpm vitest run` full suite green · `tsc -b` clean · DB suite PASS ·
  `scripts/i18n-purity-check.sh` PASS.
- LIVE window: a real plan task finishes, the scheduled job harvests it with no
  CEO input, the generated tasks are claimed and completed by the resident
  worker, and the measurement is the row's evidence.
- §-spec adaptation + U34 + roadmap row + STATE + commit.
