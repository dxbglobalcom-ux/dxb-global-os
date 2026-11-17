<!-- B85 structural read · the data model at atom level · an Opus 5.5 helper at xhigh, 2026-11-17 · asked: is this foundation built right. The catalogue figures are the CONSTRUCTION engine's (54422, SELECT only). Section 9 is the helper's reading; the lead decides.
     Checked by the lead in the migrations and the code the same evening, nine claims, all held: fn_default_company_id returns the oldest active company (20260718020000:13-19); the migrations that add company_id name crm_clients and departments (projects not re-checked); departments' primary key is the slug (20260707000002:2); transitions.ts calls itself the only authority; escalate.ts sets a failed task back to queued; 11 updateTable("tasks") sites in 5 files; no package writes task_dependencies; monthly-cap.ts:99-110 adds the proxy's SUM(spend) into the euro total and counts an error as 0; outbox has no created_at; no CREATE TYPE in the chain. The catalogue counts (FKs, indexes, row counts, actor values) were not re-measured by the lead. -->

## B85: the data model at atom level (construction engine 54422, read-only session, plus the code)

**1. ENTITIES**

These things have exactly one table with a real primary key:
- `companies`, `agents`, `workflows`/`workflow_steps`/`workflow_runs`, `approvals`, `model_catalog` (text PK), `routing_rules`.
- `audit_log`, `decision_log`, `alerts`, the settings triad (registry, values, change log).
- `revenue_engines` with `revenue_ledger`, `crm_clients`, `memory_index` with `memory_embeddings`.

All 62 public tables have a PK (catalogue).

**Things held twice or more:**
- **Department key.** The PK is `departments.slug`, and `departments_id_key` makes `id` unique as well. Three FKs point at slug (agents, revenue_ledger, revenue_engines) and four at id (departments.parent_id, routing_rules, library_items, agent_assignments). `tasks.department` (NOT NULL, the claim key), `cost_ledger.department`, `media_jobs.department` and `generated_work.department` are text with no FK. `approvals.department_id` is a uuid with no FK. `library_grants.grantee_id` holds department slugs and employee uuids-as-text in the same column.
- **Department membership.** Both `agents.department` and `agent_assignments`.
- **Persona.** Four places: `personas`, `agents.persona_path`, `agents.persona_version` (text), and `library_items kind='persona'` (213 rows). `persona_version='v2.0-fable'` sits on 213 agents whose `personas.version=1`.
- **Tool.** `tool_pins` (76 rows) and `library_items kind='tool'` are linked only by the name convention `server.tool` (source_ref says "pinned via tool_pins"). C31's wrong-name usage counter is the symptom of this. **Skill:** `agents.skills` jsonb (empty on 219/219) sits beside `library_items kind='skill'` and `library_grants`.
- **Cost.** Four places: `cost_ledger`, `agent_runs.cost_eur`, `voice_calls.cost_eur`, and LiteLLM's `litellm."LiteLLM_SpendLogs"`, summed in code (`monthly-cap.ts:99-110`). `cost_ledger` has no `run_id`.
- **Budget.** Columns (`tasks`, `workflows`, the singleton `budget_state`) and settings jsonb (`hr.employee_budget`, whose value_schema is just `{"type":"object"}`; `employee.budget_limit_eur`; `department.budget_eur`).
- **Agent status.** `agents.status` and `employment_status` disagree on 213 rows (`dormant` against `active`).
- **Task dependencies.** `tasks.depends_on uuid[]` is what `claim_next_task` reads and `dispatch.ts:83` writes. The `task_dependencies` table, which has the FK and the acyclicity trigger, is written by no package; only the dashboard and a bench script name it.
- **Routing model.** `routing_rules.model` and `model_id` are equal on 38/38 rows.
- **Work queues.** Six, each with its own status vocabulary: tasks, media_jobs, outbox, intents, chat_messages (pending), pgboss.

**Held only as text or JSON:**
- Actors (see 4) and `revenue_ledger.client`.
- The link from a workflow run to its approval is `approvals.payload->>'workflow_run_id'` (`kernel/src/workflow/runner.ts:103,473`).
- The outward action's payload lives only in `approvals.payload`.
- Employee history is held in `employee_records` jsonb arrays.
- `memory_index.ref` is a file path.

**Not represented:** any human or service principal, and a holding-level risk register (only `project_risks`; I did not check whether the board covers it).

**2. RELATIONS**

- There are 91 FKs, all validated: 71 NO ACTION, 14 CASCADE, 6 SET NULL.
- 59 of the 91 have no index led by their column. Examples: `tasks.agent_id`, `tasks.parent_task_id`, all 6 FKs on `approvals`, `agent_runs.employee_id`, `cost_ledger.task_id`.
- 29 reference-like columns have no FK. Relations live in arrays (`intents.task_ids`, `tasks.depends_on`) and in jsonb: `audit_log.payload->>'task_id'` is joined to tasks (`gateway/src/tool-lock-watch.ts:84,122,216`), `audit_log.detail_ref` (1,349 rows), `alerts.source_ref`, and `escalate.ts:225-231` reads the failure reason out of `task_events.payload`.

**Dangerous cascades:**
- Deleting a library item cascades to `library_change_log` and `library_usage_log`, which erases append-only history (against DATA_MODEL §12).
- `chat_sessions` cascades to `chat_messages` and `ceo_briefings`, so deleting a session erases the CEO's conversation.
- `tasks` cascades to `generated_work.plan_task_id`. That table is the dedupe record (UNIQUE(plan_task_id, step_index)), so once it is gone the same work can be generated again.
- `tasks` cascades to `revenue_scout_runs`.
- On `media_jobs`, task and employee are SET NULL, so a delete loses who and what produced an output.

**3. THE HOLDING'S SHAPE**

- **`company_id` is on 3 of 62 tables:**
  - `departments` (nullable).
  - `projects` (nullable; 1 of 2 rows is NULL).
  - `crm_clients`, NOT NULL with DEFAULT `fn_default_company_id()`, which returns the oldest active company. Once a second company exists, every new client silently lands in the first.
- **The core tables carry none:** tasks, agent_runs, approvals, outbox, cost and revenue ledgers, agents, workflows, memory, audit. A company is reachable only through department slug text.
- **Keys are global.** The PK on department slug and the UNIQUE slugs on agents, projects and workflows mean two companies cannot both have a `sales` department.
- **One holding-wide budget.** `budget_state` is a singleton (CHECK(id)). `companies` has no currency, jurisdiction or parent.
- **No row separation.** All 56 SELECT policies are `USING (true)`.
- **Clients cannot be isolated.** There is no `client_id` on tasks, projects, approvals, media_jobs, memory or revenue. `crm_requests.task_id` is the only link from a client to work, and deals link to nothing downstream.
- **A job owned by a master cannot be expressed.** There are five partial groupings: `intents.task_ids`, `parent_task_id`, projects, `generated_work`, and workflow_runs. None of them carries owner, client, company and money together, so B64's job desk would be a sixth unless they are folded into it.

**4. WHO ACTED**

- 19 actor columns are free text; 8 are uuid FKs to agents.
- `audit_log.actor` holds: `ceo` 1,375 times, `fable-5` 213 times (a model name), `persona-gate`, `migration-b51`, and an agent slug (`finance-financial-analyst`). 20 rows say `ceo` with `actor_type='system'`.
- `fn_org_actor()` and `control_approvals_action` (lines 28-31) record `'ceo'` for any account that has `auth.uid()`. `approvals.decided_by` is the literal `'ceo'` (lines 128, 135).
- `approvals.decided_by` and `opportunities.halal_verdict_by` are both text.
- The `personas.author` CHECK lists model names.
- So no: not every act joins to a real principal. B73 owns the permission side; this is the record side.

**5. STATE**

- Statuses are text with CHECK: 86 CHECKs, all validated, and 0 enum or domain types.
- The database guards transitions only on `approvals` (`guard_approval_transition`) and on locked `approval_rules`. That guard does not require `decided_by`.
- The task transition law lives in TypeScript (`dxb-mcp/src/transitions.ts:1-11`, which calls itself "the ONLY authority"). Yet `escalate.ts:239-255` moves failed→queued, which that map forbids.
- There are at least 11 `updateTable("tasks")` sites across 5 files, plus `claim_next_task`, which writes no event. Status and `task_events` are separate writes, so they can disagree.
- The same notion is spelled differently per queue: done, succeeded, executed, answered.

**6. MONEY AND TIME**

- Money is numeric everywhere, with 0 float columns.
- There are 17 `*_eur` columns and 0 currency columns.
- Model prices are $/Mtok (`DATA_MODEL.md:412`). `monthly-cap.ts:99-110` adds LiteLLM's `SUM(spend)` straight into the euro total and counts an error as 0 (line 106). That LiteLLM's unit is USD is UNVERIFIED here.
- Precision caps: `budget_state.monthly_cap_eur` is numeric(8,2), so at most 999,999.99; `tasks.budget_max_cost_eur` is numeric(8,4).
- DEFAULT 0 hides "unknown" in more places than the `agent_runs` case B64 A5 names: `cost_ledger.cost_eur`, `voice_calls.cost_eur` (`voice/src/answer.ts:368` writes 0), `opportunities.capital_required_eur`, and `objectives.capital_limit_eur`.
- `revenue_ledger` has no gross/net/tax split.
- Time: 92 columns, all timestamptz or date, 0 without a zone; the server runs in UTC. 15 tables have `updated_at` and no trigger maintains any of them. `revenue_ledger.occurred_on` is a date with no zone.

**7. INTEGRITY AT THE ATOM**

**Missing UNIQUE or idempotency keys:**
- `revenue_ledger` has no unique key on (source, evidence_ref), so a Stripe or bank replay books revenue twice.
- `cost_ledger` and `intents` have no idempotency key.
- Approvals per workflow step can duplicate; `runner.ts:473` copes by taking `ORDER BY created_at DESC LIMIT 1`.
- `library_items` UNIQUE(kind, name, version) does not apply to its 506 NULL-version rows.

**Nullable but should not be:** `agent_runs.employee_id` and `model_id`, `cost_ledger.task_id` and `agent_id`, `decision_log.run_id`, `tool_calls.run_id`, and `company_id` on departments and projects.

**Queues:**
- Task claim: sound.
- Outbox claim (`outbox-executor/src/index.ts:43-56`) filters `status='ready'` with no index and no ORDER BY. The `outbox` table has no `created_at` at all.

**Unschemed data:** 54 jsonb columns and 0 shape constraints. `vector(1536)` fixes the embedding dimension.

**8. WHAT IS SOUND**

- One Postgres with pgvector inside it. pg-boss is confined to system routines and business work stays in `tasks` (`scheduler.ts:1-4`).
- A PK on every table: uuid for entities, identity bigint for the 13 log tables.
- Money in numeric, time in timestamptz, CHECKed vocabularies, every FK validated, NO ACTION by default.
- The approval→outbox core:
  - a transition guard in the database and an immutable decision;
  - the outbox row is enqueued by trigger in the same transaction;
  - UNIQUE(`approval_id`) and UNIQUE(`idempotency_key`);
  - the approval is re-checked at execution time (`index.ts:61`).
- `claim_next_task`: SKIP LOCKED, a matching partial index, and leases.
- The settings triad with `value_schema` and `undo_of`.
- Versioned personas; acyclicity guards on managers, task dependencies and model fallback; deduplicated alerts; `control_idempotency`.

**9. THE VERDICT I WOULD DEFEND**

Redraw the logical model on the same engine. Keep the physical conventions and the approval/outbox core.

1. **Tenancy is absent at the root.** Only 3 of 62 tables carry `company_id`, the slug keys are global, every policy is `true`, and the default sends every client to the first company. The holding's scale axis is many companies and clients, and that cannot be added by bolting on a column.
2. **There is no identity of actors.** 19 text actor columns, and `'ceo'` is written for any signed-in account. That includes the money gate and the halal verdict.
3. **One thing lives in many places, kept in step by convention.** Work items (6 queues, dependencies held twice), cost (4 places, euro columns with dollar inputs added in), persona (4), tool (2), department (slug and id). The task state law is in TypeScript and is already bypassed.

Each repair touches nearly every core table and every code path that writes it, so this is not additive work. This is my reading; the decision is yours.

NOT COVERED: the company engine (54322), so every figure here is from construction, which holds 0 to 1,835 rows per table; the 34 views; the pgboss and auth schemas; whether each code path keeps a status change and its event in one transaction; LiteLLM's spend unit; whether the board covers a holding risk register; behaviour at real data volumes.
