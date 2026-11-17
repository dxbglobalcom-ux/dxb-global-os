<!-- B85 preparation dossier · part: the worker engine · read by an Opus 5.5 helper at medium, 2026-11-17 · facts, no verdict.
     Checked by the lead at the source the same evening, eight claims, all held: no is_error in packages/*/src; worker-shim.ts:907 (hook off returns before the gates); TURN_BUDGET at :298; the outbox allowlist (20260726011000:26); the reaper's 'reaped' event; no failed->ready in the outbox executor; the two files' sizes; dxb-scheduler disabled/inactive. The rest is the helper's reading, unchecked. -->

# THE WORKER ENGINE: preparation dossier (B85)

## 1. THE LOAD
- One queue, ordered: his jobs and near-due work, then client deliveries, then lines, then internal work. Masters start by the quota left. No fixed turn, token or cost cap may cut a running job. Every job can be stopped or cancelled. Each job's turns, context and cost are recorded. Source: AGENT_ORCHESTRATION_SPEC A29.
- The owner is the job type's master. Specialists are called through the queue onto a shared job desk, shown by name, with cost written to the job. Source: A27; B64 item 5.
- Four doors for work (Hamza, Reception, calendar, revenue), and a job-type menu routes each job to its master. Source: A26; B64 item 1.
- A job is assembled and its end is reported. Today an intent has no "done" state. Source: B64 item 2.
- The check verifies against the brief by trying the work. Client work gets Sol and Fable, blind to each other. The customer's-eye walkers run beside them. Source: A28.
- All client-bound work meets the critical gate. A missing class or a failed read runs the gate instead of skipping it. Source: A32.
- Value tier sets plan and check depth. Source: A30.
- A failing model is replaced by the backup pair, never by a weaker model. `is_error` counts as a failure. Source: A31; B65; B66.
- A per-task cost line that warns and never stops. Source: B51 move 4.
- How many masters run is read from the 5-hour and weekly subscription windows. A stale read counts as unknown, never zero. Source: B64 item 7.
- Hermes takes work from the holding's queue, night shift included, and results land in the morning brief. Source: A33; B10; B11.
- His eye is on every delivery until he lifts it per job type. Source: B15 (✓ 2026-11-08, A9).
- A research task must finish with a sourced report. Source: B69.
- A worker can ask for a tool mid-task. Source: B41.
- The studios' client jobs run through the engine. Source: B43; B84.
- Revenue lines flow on the revenue engine. Source: B83.
- A smart agent runs every 2–3 days. Source: B82.
- The scheduler is re-enabled and the morning jobs catch up after the machine wakes. Source: B76.
- The engine emits live state: who works on what, idle versus working, last known and next wake. Source: `.claude/CLAUDE.md` first law; A29 §7.

## 2. WHAT STANDS TODAY
**Packages** (src lines):
- **orchestrator (5,037)**
  - `worker-shim` claims and runs one task.
  - `worker-loop` drains three legs.
  - `qa` is the single QA judge.
  - `escalate` is the five-step ladder.
  - `critical-gate` runs challengers.
  - `decompose` and `dispatch` turn an envelope into task rows.
  - `intent-intake` does classify → decompose → dispatch.
  - `work-generation` opens steps from finished plans.
  - `subscription-cap` is the hourly token brake.
  - `select-model` is the SQL routing door; `hook-binding` is glue.
  - `context-budget` handles stepped compression.
  - `chat-drain`, `chat-legs`, `morning-briefing` serve Hamza's chat and the briefing.
  - `ops-live-collector` debounces NOTIFY into Broadcast.
- **outbox-executor (2,555)**: `index` (outbox tick), `scheduler` (the pg-boss host), `task-lanes` and `media-lanes` (lane loops), `media-lane` (GPU jobs), `breaker` and `monthly-cap` (EUR brakes), `ops-live-host`, `actions/*` (two handlers).
- **hr (639)**: persona template, gate and compiler, plus four daily SQL jobs.
- **revenue (689)**: four daily SQL jobs, and `discovery`, which queues research tasks.
- **observability (525)**: `runScope` (agent_runs, buffered tool_calls), `logDecision`, `spill`, `evidence-anchor`.

**Resident service:** one process. `dxb-scheduler.service` runs `pnpm scheduler`, which is `node packages/outbox-executor/dist/main.js` (package.json:9). The unit has Restart=always and OOMPolicy=stop. Live state is `disabled` / `inactive` (`systemctl --user is-enabled|is-active`). It hosts 23 handlers (scheduler.ts:451-742).

**Life of one task:**
1. **Birth.** `dispatch.ts:54`, fed by `intent-intake.ts:75-108`.
2. **Vehicle.** The task.worker tick runs every 10 s (scheduler.ts:640-655). `dispatchLanes()` (288-360) sets 1–8 lane loops, and each loop calls `drainTasks`.
3. **Brake.** `worker-loop.ts:97-105`.
4. **Claim.** `claim_next_task` uses SKIP LOCKED with a 900 s lease (worker-shim.ts:819). The claim event is written at 826, then claimed→running at 838.
5. **Staffing.** `assignEmployee` picks the least-loaded active employee (666-774).
6. **Pre-gate.** 851-876.
7. **Lease heartbeat.** 885-893.
8. **Run.** `runScope` (900). Route at 218-290. Agent SDK `query` at 432-461, or `llmCall` at 516. Tokens go to `cost_ledger` at 502.
9. **In-run gate.** postTask at 944. The REVISE loop is 986-989. The critical gate is 964-983. An ESCALATE verdict throws (991).
10. **Outcome.** →review at 997, →failed at 1008.
11. **QA leg.** `worker-loop.ts:122-146` calls `qa.ts:167-250`, which retries a malformed verdict once and moves the task to done, awaiting_approval or failed. Confidence below 0.6 goes to `escalate`.
12. **Ladder.** `escalate.ts:201-279`. After 5 fails, `blockTask` (125-194) leaves the status at failed and writes an audit row `task.blocked`.
13. **Approval.** Trigger `fn_task_awaiting_approval_bridge` creates an approval with action_type `task_completion` (migration 20260719003000:10-53).
14. **Outbox.** On approve, `enqueue_outbox_on_approve` (20260726011000:23-39) enqueues a row. `tick()` (index.ts:41-110) runs every 15 s (scheduler.ts:452-460).

**Retries:** the ladder, the second QA call, and the reaper's requeue (`operational_core.sql:67-85`). The outbox has none.

**Recorded:** `task_events` per transition, `agent_runs`/`tool_calls`, `decision_log`, `cost_ledger`, `alerts`, `var/scheduler.log`.

## 3. DEFECTS THE BOARD ALREADY NAMES
- **B65.** `is_error` is never checked. The row cites `chat-drain.ts:160`. Inside this part the same gap is at worker-shim.ts:482 and qa.ts:107, and grep finds zero `is_error` in `packages/*/src`.
- **B69.** Research tasks fail the knowledge shelf and QA. The row cites no file:line.
- **B70.** With the hook off, the gate is skipped. The row cites `worker-shim.ts` without a line; the line is 907.
- **B75.**
  - The spill folder does not exist (F-R2-3). `spill.ts:12` defaults to `/var/lib/dxb/obs-spill`, and `ls` says it is absent.
  - The scheduler starts before the database (F-R2-5). The unit has only `After=network-online.target`.
  - Tool calls record no outcome (F-R5-7). worker-shim.ts:471-476 passes only the tool and a params digest, so `ok` and `duration_ms` are null (run-scope.ts:90-91).
  - There is no attempt cap (W-C42-5).
- **B66.** The SQL fallback ignores lane and quality floor (`20260713040000_e71_routing_slots.sql:261`). `fallbackModel()` has no caller.
- **B68.** The routing seed holds 21 rules against 39 live.
- **B62** is the freeze guard. It is not in this part.

## 4. FACTS A DESIGNER MUST KNOW
1. **No approved task result leaves through the outbox.** Approvals of type `task_completion` are not in the SQL allowlist, which holds only `test.write_file` and `email.send.staging` (20260726011000:26). They are audited as `outbox.enqueue_skipped_no_handler`. The same handler list is kept by hand in TypeScript (`actions/index.ts:12-15`) and SQL; a test holds the two together.
2. **The outbox handler runs inside the DB transaction that holds the row lock** (index.ts:43-109).
   - `failed` is terminal: no code moves failed→ready (grep).
   - The "attempts>=3 alert" exists only in comments (index.ts:111, scheduler.ts:456). No migration implements it.
   - An unknown handler causes a rollback: the row stays `ready` with attempts 0 and is retried every tick. `phase4/toctou.test.ts:172-180` asserts this.
3. **Three judges sit in series, coded separately:** hook postTask, the critical gate, then QA. With the hook off, postTask and the critical gate are skipped (907), but QA still runs. B70's "goes out unchecked" is therefore partial.
4. **A status change and its event are two separate statements** (worker-shim.ts:788-812; qa.ts:142-160). `fail_count` is derived only from those events (escalate.ts:12-16).
5. **The reaper writes event `reaped`, not `failed`** (operational_core.sql:80-82). A run that kills the process is therefore requeued without limit.
6. **Several failures are swallowed or let through:**
   - A failed gate-switch read means no critical gate (206-209).
   - A panel that is `unavailable` proceeds (980-982).
   - A failed hook-flag read counts as enabled (`hook/flag.ts:13-15`).
7. **Some state lives only in memory.** The `judging`/`laddering` sets (worker-loop.ts:46-47) are correct only for one process. `activeLanes`/`lastLanes` (scheduler.ts:391-393, 620) are lost on restart. An intent stuck in `classifying` has no recovery path: only `intent-intake.ts` and its defining migration mention that state.
8. **The engine polls.** Idle lanes rest 3 s and look again. Eight self-chaining queues tick every 3–30 s (scheduler.ts:145-204). pg_notify already exists (ops-live-collector.ts:191). The lane and "hands" state is written only to the console log (scheduler.ts:644-651); `task-lanes.ts` has no DB write.
9. **Tasks are born on five paths:** `dispatch.ts:54` (Zod-validated), `revenue/discovery.ts:276`, `dxb-mcp/src/groups/queue.ts:112` and `:248`, `gateway/pin-check.ts:209`, and `control_work_generate` (work-generation.ts:191).
10. **Two paths run a seat:** worker-shim, and the kernel workflow step (scheduler.ts:579-581; evidence-anchor.ts:1-3).
11. **Fixed caps that A29 does not allow:**
    - TURN_BUDGET 4/12/40 (worker-shim.ts:298).
    - Default hour ceiling of 500,000 tokens (scheduler.ts:333).
    - At most 8 lanes (277).
    - execCap 1 per drain (worker-loop.ts:83).
12. **The ladder keeps the same employee.** A requeue keeps `agent_id` (escalate.ts:240-249). QA's notes go to `task_events` (qa.ts:200-206), not to the worker that retries.
13. **Isolation between tasks is forbidden by design.** worker-shim.ts:4-6 says no channel to any other worker or task may be added, which stands against A27's job desk.
14. **The two large files:**

| File | Bytes / lines | Holds | Full-line comments | Commits since 2026-08-01 |
|---|---|---|---|---|
| `worker-shim.ts` | 45,603 / 1,013 | claim, staffing, routing, prompt, SDK call, spend, hook/gate loop, stepped executor, transitions | 269 lines, ≈20 KB (44 %) | 18 |
| `scheduler.ts` | 41,650 / 824 | queue map, cadences, lane SQL, 23 handlers, boot | 307 lines, ≈21.8 KB (52 %) | 18 |

15. **Missed crons are not replayed** (scheduler.ts:65-68). Only the tool check has a catch-up (503-510). The briefing, HR and revenue jobs have none, which is the B76 problem.

## 5. THE TESTS
54 test files touch this part: 52 under `tests/` (c9 11, b51 7, b43 5, phase4 4, e8 3, and 18 more folders), plus 2 in `packages/hr/tests`.

Five sampled for whether they can go red:
- **`phase5/ladder.test.ts`.** Yes. It asserts the literal ladder map and the tier sequence.
- **`c9/outbox-enqueue-allowlist.test.ts`.** Yes. It asserts literal counts of 1 and 0.
- **`phase4/toctou.test.ts`.** Yes, but it pins the endless retry of a row with no handler as correct.
- **`r21/worker-loop.test.ts`.** Yes on DB state. The model executor and the QA judge are stubbed, so the real SDK path is not exercised.
- **`b51/smoke-verdict.test.ts`.** Yes on literals, but it tests a script; it imports only the gate's schema.

NOT COVERED:
- The bodies of `critical-gate`, `decompose`, `chat-*`, `media-lane`, `breaker`, `monthly-cap`, HR/revenue jobs, and the kernel workflow runner were not read.
- APPROVAL_ENGINE, FABLE_5_HOOK, EVENT_MODEL and COST_CONTROL sections were not read.
- Whether any test runs `defaultExecutor` live is UNVERIFIED.
- Whether `.env` sets `OBS_SPILL_DIR` is UNVERIFIED (secret files were not read).
- Live company row counts were not measured.
