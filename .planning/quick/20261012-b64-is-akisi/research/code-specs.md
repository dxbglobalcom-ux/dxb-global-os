# B64 code and specs map: how a job moves through the holding as built

Everything here comes from reading code and specs only. I read no database and ran no tests. Anything that was not run is marked UNVERIFIED.

## A. The path a job takes today, with file:line

**1. Intake**
- **Dashboard.** `/api/intent` inserts the CEO's raw text. It accepts at most 500 characters (`apps/dashboard/src/app/api/intent/route.ts:12,32`) and writes only `text, lang, source, actor`.
- **The table.** `intents.text` has a CHECK of 1 to 500 characters. Its states are `received/classifying/dispatched/failed_dispatch`, with no `done` (`db/migrations/20260710000016_intents_intake.sql:13,17-18`). No later migration changes this; I found no `ALTER TABLE intents` beyond the RLS line at :27.
- **Voice.** `packages/voice/src/intake.ts:183` inserts intents with `source='voice'`. The intake worker skips them on purpose (`packages/orchestrator/src/intent-intake.ts:75-84`, guard at :78).
- **Chat.** Hamza answers with `tools: []` (`chat-drain.ts:150`) and is told never to dispatch, only to point the CEO at the "Görev olarak gönder" button (`chat-drain.ts:4-6,77`). The voice answer also runs with `tools: []` (`packages/voice/src/answer.ts:148`).
- **Claim.** The intake worker claims an intent with SKIP LOCKED and runs classify, then decompose, then dispatch (`intent-intake.ts:60-120`). It drains every 5 s (`scheduler.ts:149`).

**2. Classification.** `packages/kernel/src/classify.ts:15-21,117-160`.
- One structured call on the routing row `orchestration`, subscription mode only (:142-151).
- It returns `{intent_summary, task_class, departments, approval_class, complexity}`.
- `approval_class` is raised from `none` to `internal` whenever a regex finds an outward word such as send, post or publish (:41-49).

**3. Splitting.** `packages/orchestrator/src/decompose.ts`.
- **Single job.** No model call. The task's objective becomes the LLM's one-sentence `intent_summary` (:224-237).
- **Multi job.** One drafting call on the `orchestration` row (:242-252) produces 2 to 10 envelopes (`MAX_ENVELOPES` :45). Dependency depth is at most 5 (:44). The prompt orders "TOTAL ISOLATION" (:183-185). A back-reference lint rejects drafts that point at "the above" (:81-82). One regeneration is allowed, then it throws (:258-277).
- **Correction to the lead's list:** the CEO's raw text never reaches the decomposer or the worker. The draft prompt is given only `JSON.stringify(ci)` (:195), and the single path uses `intent_summary`. His full sentence survives only on the intent row and as a label of at most 120 characters (`intent-intake.ts:28-36,97`).

**4. Dispatch.** `dispatch.ts:28-105`.
- One transaction inserts `queued` tasks, then resolves `depends_on` uuids, then writes one `created` event per task.
- `label/label_tr` carry the CEO's headline. `project_id` is always the dogfood project `dxb-global-os` (`intent-intake.ts:23,38-43,99`), so every CEO job lands in one project.
- One `decision_log` row of type `task_plan` is written per batch (:111-125).

**5. Execution host.**
- `scheduler.ts:640-655` reconciles the task lanes every 10 s.
- Each lane is its own loop with a 3 s rest (`task-lanes.ts:11-25`). There are up to 8 lanes, counted from waiting work and the machine (`scheduler.ts:288-306`).
- Each lane calls `drainTasks` (`worker-loop.ts:81-174`). Leg 1 executes one task, after an hourly subscription-token brake (:97-117). Leg 2 sends `review` tasks to QA, or to escalation when confidence is below 0.6 (:122-146). Leg 3 sends `failed` tasks up the ladder (:150-171).

**6. Claim and staffing.**
- `claim_next_task` (`db/migrations/20260726013000_w24_allocation_work_seam.sql:61-83`) only hands out a task whose dependencies are all `done` (:71-72) and whose project is draft or active (:75-77), ordered by priority.
- `assignEmployee` (`worker-shim.ts:664-760`) picks the least-loaded active employee of the department who has an MCP profile, capped by `employee.max_concurrent_runs`. If everyone is busy the task is requeued; if nobody exists it runs agent-less and the pre-gate rejects it.

**7. Worker run.** `runWorkerOnce` (`worker-shim.ts:813-1011`):
- Order: claim, then staff, then the hook pre-gate (:859-874), then a lease heartbeat (:883-891), then `runScope`, then execute, then the post-gate. REVISE re-runs with feedback; ESCALATE throws (:923-992). The critical gate runs once, only when the task's class has `needs_council` (:855,962-981). The task then moves to `review` with its result stored (:995-1002).
- **Prompt** (`defaultExecutor` :358-414): objective, output contract, project purpose and in-run feedback. It contains **no `depends_on` results**, so a dependent task born by the kernel never sees its predecessors' output.
- **Tools.** A staffed run gets its compiled MCP profile (:366-372,447-456). Built-in tools are off; the persona is the system prompt (:431,441); the turn limit is 12, or 40 when media tools are present (:309-310).
- **Correction to the lead's list:** the "no channel" comment (:4-6) holds for the shim module only. A staffed seat with the queue group can call `queue_get`/`queue_list` on any task (`packages/dxb-mcp/src/groups/queue.ts:590-614`) and can use `queue_dispatch`, which adds an "INPUTS FROM THE DISPATCH BOOK" paragraph naming the upstream task ids to read (`dispatch-book.ts:125-134`, `queue.ts:291-296`). Isolation is therefore a property of the kernel decompose path, not of the whole system.

**8. Checking (QA).** `qa.ts:62-134,167-250`.
- One judge call on the routing row `final-approval`, with `tools: []` (:97).
- Its prompt is "Judge ONLY contract satisfaction — do not redo the work" (:79), and it is given the result as text (:83). It never tries the work.
- Pass goes to `done`, or to `awaiting_approval` when `approval_class` is not `none` (:224). Fail goes to `failed` with the notes stored only in the event payload (:200-206).

**9. Escalation.** `escalate.ts:36-43,201-280`.
- The fail count is read from `task_events`. Rungs: 1 retries at the same tier (or a tier bump if confidence was low), 2 bumps the tier, 3 moves to L2, 4 moves to L1, 5 and above is blocked.
- Requeue changes only `model_tier` and the claim fields (:240-253). `agent_id` is kept, no manager or head is ever brought in, and **the QA notes are not written to `tasks.feedback`**. The only writer of that column is `blockTask` (:159-163). A retry therefore runs the same prompt on a stronger model.
- A blocked task gets a CEO report in `tasks.feedback` plus an `audit_log` row (:150-177).

**10. Results, assembly and report-back.**
- The result is stored in `tasks.result` as `{text, evidence, acceptance_map, confidence}` (`worker-shim.ts:543-551,1001`).
- **No code assembles the parts of a job.** `intents.task_ids` is the only link back.
- **No code writes a finished job back into the conversation.** The only `chat_messages` writers are the answer lanes and the morning briefing (`morning-briefing.ts`, built from the view `v_ceo_briefing`, with no model writing it).
- The tasks page selects from `tasks` (`apps/dashboard/src/app/(command)/ops/tasks/page.tsx:60-81`) and contains no `result` or `output_contract` reference (grep: 0). That is C60.

**11. Approvals and outbox.**
- A trigger creates a pending `approvals` row of type `task_completion` whenever a task enters `awaiting_approval` (`db/migrations/20260719003000_task_approval_truth_sync.sql:10-35`).
- `decide_approvals` sends approved tasks to `done` and rejected ones to `returned` (`20260724006000_c5_decide_approvals_task_sync.sql:1-7`).
- Because `approval_class` is `internal` or `outward`, every "internal" task also stops at the CEO.
- An approved result triggers no outward action. The outbox has only `email-send-staging` and `test-write-file` actions (`packages/outbox-executor/src/actions/`).
- `classifyOperation` (`kernel/src/approval-gate.ts:18`) has one caller, the workflow approval step (`kernel/src/workflow/steps/approval.ts:20`).

**12. Cost and budgets.**
- Subscription spend is written with tokens only and no EUR (`worker-shim.ts:483-507`; `subscription-cap.ts`). QA spend is written with `source='qa'` (`qa.ts:112-121`).
- The per-task token budget only warns (`packages/hook/src/runtime.ts:70-84`, `action: "warned"`). `budget_max_cost_eur` defaults to 1.0 (`packages/shared/src/envelope.ts:9-12`), but it is never reached on the subscription path because the cost there is 0.
- The monthly hard-stop flag is read into the hook context (`hook-binding.ts:59`).
- The real throttle is the hourly token window (`worker-loop.ts:97-105`).

**13. Model routing.**
- Classify, decompose and QA use their own rows (`orchestration`, `final-approval`).
- Execution uses `resolveExecutionRoute` (`worker-shim.ts:228-300`) in this order: the department's row of the class, the department's row of the tier, the department-less row of the class, then the tier fallback. The employee's brain is a floor (`fn_effective_tier`, :248).
- The model name comes from the catalogue (`sdkModel`, :434).

**14. Personas.** `composeSeatPrompt` and `seatStandingPrompt` load the persona file named by `agents.persona_path` (`worker-shim.ts:332-353`). It applies only when the task is staffed.

**15. Workflow engine.** `packages/kernel/src/workflow/`.
- Step kinds are `agent/approval/review/retry/fallback` (`20260713090000_e91_workflow_engine.sql:172`). Create and update are CEO-only (:97-104).
- An agent step runs its static `cfg.objective` and **does not receive the previous step's output** (`runner.ts:355-362`). Only review steps (:366-372) and fallback agents (:218) do.
- Workflow steps are **not `tasks` rows** (`steps/agent.ts:159,192`), so they skip the task queue, QA, the ladder and the tasks page.
- Cron workflows are registered only inside `registerSchedules`, at scheduler start (`scheduler.ts:767-777,804-808`). A new cron workflow probably needs a restart (UNVERIFIED).
- Event triggers: `dispatchEventTriggers` (`triggers.ts:63`) has no caller anywhere in `packages/`, `apps/` or `scripts/` (grep).
- `v_automation_schedules` is a projection of `pgboss.schedule` (`20260714070000_e121_automations_view.sql:8-10`). A production job would appear there only as `wf:<slug>`.

**16. Recurring work today.**
- The scheduler's cron table is maintenance, HR, revenue scan/score/brief/rollup, briefing and `workGenerate` every 15 min (`scheduler.ts:145-197,749-777`).
- `generateWorkFromPlans` turns a `done` task whose contract contains "STEPS" into staffed tasks through `control_work_generate` (`work-generation.ts:156-207`). It runs exactly once per plan, with a default cap of 3 steps (AGENT_ORCHESTRATION A11-A12).

**17. Media studio.**
- The `media` MCP group creates `media_jobs` rows. Lanes are 1 GPU lane (still, shoot, upscale) and N CPU lanes (assemble, probe) (`outbox-executor/src/media-lane.ts:1-6,58-61`; `media-lanes.ts`; `scheduler.ts:683-707`).
- A seat blocks on `media_wait` while the lease heartbeat keeps its task alive.
- The film chain itself is a per-job dispatch book, not a workflow (WORKFLOW_ENGINE_SPEC:155-166).

**18. What the CEO sees live.**
- `ops-live-collector.ts:1-10` debounces `pg_notify('dxb_ops_live')` into Broadcast with a 1 s window. `/live` reads `v_live_ops` (`apps/dashboard/src/app/(command)/live/page.tsx:24`) and `live-ops.ts`.
- Pause and cancel do not exist: `agent_runs.control_signal` is in no migration and no orchestrator code (grep: 0). That is AO §4/G4, recorded as still open (AO A9 :163).

## B. What each owning spec requires, and where the code differs

**AGENT_ORCHESTRATION_SPEC**
- **Contract:** every run is born and closed as an `agent_runs` row (G1, :12). Sub-agent spawns are traced through `parent_run_id` with a reason (G2). Model choice goes through one door (G3). CEO pause, resume, cancel, priority and override reach a running job within seconds (G4). An approval park consumes nothing (G5). The lifecycle is staff, pre-gate, model, run, post-gate, close (:21-33). Employee selection uses department, role level and workload (:57). Spawn depth is limited by `orchestration.max_spawn_depth` (3), and a run has a timeout (:58-60).
- **Differs:** control signals are not built (A9 :163; grep). There is no run timeout in `runWorkerOnce`; only the lease is renewed. Spawning goes through MCP `queue_dispatch` (A19), not `dispatch(parent_run_id)`. A25 (:209) says model selection "still picks by tier", but `worker-shim.ts:265-295` now picks by class first. The spec is stale against the code.

**WORKFLOW_ENGINE_SPEC**
- **Contract:** declarative, CEO-editable workflows with cron, event and manual triggers (:9-21), running on pg-boss with a step loop (:23-38). Snapshot versioning (:63-67). Budget, token and timeout enforced per run (:90). Event triggers through a single matcher (:47).
- **Differs:** the event matcher is not wired (§A.15). Agent steps get no chained input. Steps bypass the task queue and QA. The `workflow.step` split was deferred (A6 :145). The studio's production line is a registered exception: a dispatch book, not a workflow (:155-166).

**PROJECT_OPERATING_SYSTEM_SPEC**
- **Contract:** the project is data and context, not an engine (:21-23). Its tasks, dependencies, milestones and members are drill-down down to the run (G2, :13).
- **Differs:** every intent-born job goes into the single `dxb-global-os` project (`intent-intake.ts:23`). No per-goal project or milestone is created.

**ORGANIZATION_ENGINE_SPEC**
- **Contract:** an 8-level hierarchy with `manager_id` and `director_id` (:11, :37-41). Sub-agents are shown live from `parent_run_id`.
- **Differs:** dispatch and the ladder never use the hierarchy. `manager_id` is read only into the hook context (`hook-binding.ts:44,53`). The "head-review" rung changes only the tier (`escalate.ts:40,237-249`).

**MODEL_ROUTING_SPEC**
- **Contract:** selection goes through rules, health and budget, with a `decision_log` row for each decision (:22-35). The quality law: judgement and anything a human sees is L1 (:127-148). The brain is a floor (:150-167). The critical gate uses challengers, not co-authors (:169). The catalogue is the single source and the class leads (:378-466, P3 :6).
- **Differs:** the code matches P3. The critical gate is told to refute (`critical-gate.ts:4-6`), which conflicts with the CEO's 2026-10-12 note ("verify against the brief, do not refute"); B64 records this as not yet discussed.

**APPROVAL_ENGINE_SPEC (:20-33)**
- **Contract:** operations are classified as autonomous, notify or gated, in the kernel only, and approval releases work to the queue or outbox.
- **Differs:** tasks are gated by the envelope's `approval_class`, not by `classifyOperation`. Nothing releases an approved task result to the outbox.

**COST_CONTROL_SPEC (:15,28,34)**
- **Contract:** a budget chain from holding to company, department and project/employee, alerting at 70/90/100%, hard-stopping new non-critical work at 100% at the kernel door.
- **Differs:** the subscription path has no EUR figure, and the per-task budget only warns.

**OBSERVABILITY_SPEC**
- **Contract:** the 20 questions per run are answered from `agent_runs`, `tool_calls` and `decision_log` (AO §7 :62-66).
- **Differs:** nothing shows a job, meaning the goal and its tasks, as one unit.

## C. Open board rows the flow design must answer

- **B64** (board :144; `.planning/board-rows/B64.md`): the CEO gives a goal, not an "intent"; the 500-character box goes. Parts are isolated, nothing assembles or reports the end, the check must test against the brief, no production programs run, and spoken items are left unprocessed.
  - Correction to its record: besides the blocked report, an `awaiting_approval` task also reaches him as an approval row (§A.11).
  - Isolation is not universal: the dispatch book passes inputs.
- **B51** (:141; row file :60; `.planning/quick/20261009-masa-b51/PLAN.md`): the checking seat, the cost meter and the per-task ceiling are still open. CEO order of 2026-10-12: the splitter is the nameless `orchestration` row, not Hamza, and "giving him that hand has no plan and no row". PLAN.md:59 also says that Hamza dispatching from chat is "a separate job".
- **C60** (:209): one place per task showing state, owner and result. The tasks page has the data and never shows the result (confirmed by grep).
- **B41** (:127): a worker cannot ask for a missing tool mid-task. Code mode (A23) and the ergonomic layer (A24) are registered but not built. Hamza's and every employee's built-in tools (leg of 2026-10-04) are not built.
- **B15** (:113): the autonomy dial does not exist. The four-box test (repeats weekly, automatic gate, done end to end, objective done) decides which jobs skip approval. This governs the "internal goes to the CEO" default.
- **B43** (:138): the studio road (seats, lanes, dispatch book, clock) is built. The screen is not drawn. The production line is not a CEO-editable entity (WORKFLOW_ENGINE:164-166).
- **B28** (:133): the client ad agency has nothing built and no client. This is the continuous client line the flow must host.
- **C39** (:172): the company doctor, with Hamza as the single door to a system-health team. The team is not built.
- **C40** (:173): the mutate, measure, keep-if-better loop against a locked score is not built. It is relevant for recurring improvement lines.
- **B10** (:98): night and resident work watched live on his dashboard. Waits on the V2 screens.
- **HAMZA IN V2** (:261): one Hamza, with hands. He delegates to the owner and brings the result back into the same conversation, and the send-as-task button goes. Unbuilt: `answer.ts:148` and `chat-drain.ts:150` still pass `tools: []`.

## D. Keep, change, missing

**Keep (sound machinery to build on)**
- `tasks` as the single business queue, with `claim_next_task` SKIP LOCKED, the dependency wall and the project-pause predicate (`20260726013000…:61-83`).
- Self-sizing lanes (`task-lanes.ts`, `scheduler.ts:288`), the lease heartbeat (`worker-shim.ts:883`) and the in-process judging/laddering sets (`worker-loop.ts:46-47`).
- The hook pre- and post-gates with evidence anchored to real `tool_calls` (`worker-shim.ts:926-951`).
- Compiled MCP tool profiles per seat (:366-372), persona as system prompt (:332-353) and SDK isolation.
- Routing as data with class-first selection and the brain floor (:228-300). The catalogue and succession door (MODEL_ROUTING A-2026-10-10).
- The dispatch book as a graph of seats with inputs, budgets and `due_at` (`dispatch-book.ts`, `queue.ts:174-310`).
- The approval trigger bridge and `decide_approvals` sync. The outbox as the only side-effect process.
- `task_events`, `decision_log`, `audit_log` and the ops:live debounce.
- The workflow engine's snapshot, park and resume (`runner.ts`). The `generated_work` exactly-once ledger.
- The deterministic ladder with a hard stop (`escalate.ts`).

**Change (what blocks the flow the CEO described)**
- The 500-character intake and the "intent" vocabulary (`20260710000016…:13`, `route.ts:12`).
- The CEO's raw brief is replaced by an LLM summary before any worker sees it (`decompose.ts:195,228-233`).
- Kernel-born dependents get no upstream results (`worker-shim.ts:375-414`), while the dispatch book does. There are two splitting doors with different contracts.
- QA reads text with no tools (`qa.ts:79,97`) and its notes never reach the retry (`escalate.ts:240-253`). Retries change only the model.
- The critical gate's posture is to refute (`critical-gate.ts:4-6`).
- Voice intents are parked forever (`intent-intake.ts:78`). Hamza has no tools in chat or voice (`answer.ts:148`, `chat-drain.ts:150`).
- `internal` approval class equals a CEO approval, and keyword-raising inflates it (`classify.ts:41-49`; `qa.ts:224`).
- One dogfood project for all CEO jobs (`intent-intake.ts:23`).
- Workflow agent steps get no chained input and are not tasks (`runner.ts:355`; `steps/agent.ts:192`). Cron workflows register only at start (`scheduler.ts:808`).
- Dependents of a blocked task wait forever, because a blocked task stays `failed` and the claim needs `done` (`…:71-72`; behaviour UNVERIFIED by test).

**Missing**
- A job or goal entity spanning its tasks, with owner, state, done and result. `intents` has no `done`, and no assembly step exists.
- Report-back of a finished job into the chat or voice conversation (no `chat_messages` writer for it).
- A per-goal brief carrying done-criteria and acceptance tests that the checker runs. QA has no tools and no test harness.
- Production programs: the event trigger is not wired (`triggers.ts:63`, no caller), and no recurring content or client line exists as a workflow or as a stored dispatch template (WORKFLOW_ENGINE:166).
- Run control signals (pause/cancel), a run timeout and a per-job EUR/cost ceiling (B51 move 4).
- A changing mandate, meaning editing a live job's brief or plan. Nothing re-plans a running job; only the CEO-only workflow `update` creates a new version for new runs.
- Any use of managers or heads in delegation or review.

## E. Constraints the design must respect

- **STACK.md.** Do not use LangChain, LangGraph, CrewAI or AutoGen as the orchestration core (`.planning/research/STACK.md:117`). No Redis, BullMQ or Celery (:105,118). Temporal and Inngest only if multi-day replay ever becomes a measured pain (:106). No raw provider keys: LiteLLM virtual keys or the subscription SDK only (:109,124). pg-boss needs a session-mode 5432 connection, never transaction pooling (:150). Subscription runs are tagged into the same ledger (:142).
- **Code-level rules.**
  - Phase-3 LOCKED two-queues rule: business work lives in `tasks`, and pg-boss is only the drain vehicle (AO A1 :145).
  - No new resident service (SYSTEM_ARCHITECTURE R5, quoted in AO A1 and in WORKFLOW_ENGINE :35). The workflow engine and the lanes live inside the one scheduler.
  - `TaskEnvelope` is LOCKED; extra fields ride beside it, as `deps` and `task_class` do (`dispatch.ts:22-25`, `decompose.ts:32-35`).
  - Escalation ladder changes are "FABLE-ONLY". The fail count comes only from events, and no counter table is allowed (`escalate.ts:12-16`).
  - The outbox core loop is LOCKED (`outbox-executor/src/index.ts:4-14`).
  - Workflow definitions are CEO-only, and agents cannot write them (`e91…:97-104`).
  - Quality law: anything a human sees is L1; a lower tier's output is input only (MODEL_ROUTING §4d).
  - Model ids live only in the catalogue (A-2026-10-10).
  - Classify and decompose are subscription-only (`classify.ts:146-151`, `decompose.ts:245-250`).
  - The approval gate covers money out, contracts, ad spend and identity (project CLAUDE.md §2).
  - No LLM in the dashboard process (`route.ts:5-10`, `chat-drain.ts:8-10`).
- **Governance.** "The plan exists once": no new spec, only registered adaptations inside AGENT_ORCHESTRATION or WORKFLOW_ENGINE. B22 holds design until its synthesis is read (B64 row, :144).