# Blind audit of the B85 plan: not ready to go to him

The target shape is right, but three findings block the plan: the key turn leaves him without a screen, the change discipline for a live database is not designed, and the approval core is marked "kept as it is" while it has a hole. I ran nothing; every figure below is from files read in the repository copy at `/home/dxb/work` (the path under `DxB Global OS` outside `blind/` was not readable). The company database and anything running were not measured.

## 1. Conditions and risks (written from the brief before the plan was opened)

Conditions:
- **K1:** all 11 scope areas have a target design.
- **K2:** every existing part has a verdict, a writer and an order.
- **K3:** each verdict answers "built right", by measurement.
- **K4:** the standing decisions hold (one Postgres, no Redis, no second runtime or framework, no raw keys, the wall, the gate, A26–A33, writers by error cost).
- **K5:** test-first, an old part leaves only when the new one passes, never half taken apart, company data survives.
- **K6:** alive 7/24 with no token spent at rest.
- **K7:** a kernel answer to context decay.
- **K8:** a one-line order reaches a master as a full brief.
- **K9:** the worker evaluation is decided in the same sitting.
- **K10:** many companies, brands, clients and channels fit without rework.
- **K11:** strong and error-free at capacity.
- **K12:** simple to run, nothing extra.
- **K13:** the table is complete enough to go to him once.
- **K14:** dashboard, voice speed and board additions stay out.
- **K15:** money records are right at the root.
- **K16:** the disabled runtime has a way back.

Risks: verdict bias either way; over-building; a half-dismantled system or lost data at the swap; idle token burn; a worker decision on thin evidence (two of four jobs); a stale, sampled dossier; tests tied to old shapes; a gate that can be bypassed during the transition; isolation retrofitted late; wrong build order; a second plan file.

## 2. The first question

**Built right:** largely yes. Company on every business row, a principal the database enforces, the job with its desk, state and event in one door, one door per kind of act — these answer the three root defects, and I could not refute them.

**Strong:** not yet. The money gate's core is carried with a hole (A3), leases are not fenced (B4), money out has no record (B10), and the brake on his quota is removed before its replacement is measured (B5).

**Simple to run:** mostly. The heaviest piece — a second database, a cross-database data move and a single key turn — has a simpler form the plan already names as its fallback (the note at the end).

## 3. Grade A — blocks the plan

**A1 · "The old chain, packages and battery leave [at stage 5]" (PLAN.md:330-333); dashboard "not judged" (:308) — REFUTED against K5**
- **Finding:** the plan never says what he looks through after the key turn. The standing dashboard reads and writes the old schema; when the old chain leaves, he has no screen, so two of the three faces are gone and his acceptance test cannot be run. It also does not say which chain B32/B81 build against from today.
- **Evidence:** 226 `.from(`/`.rpc(` call sites in 81 files under `apps/dashboard/src`. The chain lists a "surface" subject (PLAN.md:55) with no content.
- **Correction:** make "a surface that reads the new chain" a stated precondition of stage 5, name its owner, and say which chain B32/B81 stand on.

**A2 · "The database and its change discipline" (PLAN.md:55-61) — REFUTED as incomplete against K1**
- **Finding (changes on a live database):** the plan designs the first build from empty, not how a change reaches a database holding live data. Every board row will add schema through this rule. Subject-ordered ledgered files are a baseline; nothing says whether an applied file may be edited, how a later change is filed, or what happens when a re-applied function changes its signature.
- **Finding (reference data):** approval rules, routing rules and the settings registry are "applied idempotently" from files (:57-58), yet "rules change only through the CEO's door" (:168). Either the file overwrites what he changed, or file and company drift — which is B68 again (21 seed rules against 39 live).
- **Evidence:** the settings door upserts at runtime (`20260712010000_settings_control_e61.sql:301-304`).
- **Correction:** write the change rule (forward-only files, applied files immutable by hash, the function re-apply order). Split reference data in two: code-owned vocabularies where the file is the truth, and his policy where the file seeds once and the database is the truth.

**A3 · Row 10 "Approval core — Kept, carried as it is" (PLAN.md:290, :163-164) — REFUTED**
- **Finding:** "immutable decision" covers the status column only. The payload and action type can be updated after approval, and the executor reads the payload at execution time, so what he approved and what executes can differ with no refusal from the database. The guard does not require `decided_by`. Approved rows are deletable through the purge door. "As it is" also contradicts the plan's own decisions 2–4: `task_id NOT NULL REFERENCES tasks` hangs on a table the plan removes, there is no company column, and the actor is text.
- **Evidence:** the only guards are `BEFORE/AFTER UPDATE OF status` (`20260707000003_approvals_outbox.sql:33,45`; no other trigger on `approvals` in the chain). Task FK at `:3`, `decided_by text` at `:9`. Payload read at `packages/outbox-executor/src/index.ts:50,83`. Purge at `20260724001000_task_purge_queued.sql:58-68`.
- **Correction:** verdict "Repaired", writer F-x. Freeze every column but the decision fields once a row leaves draft, require the deciding principal, and hang the row on job and part.

## 4. Grade B — fix now

**B1 · "Its own database inside the construction engine's cluster" (PLAN.md:27) — UNVERIFIED**
- **Finding:** a bare database gets stubs, not the platform. The stub `auth.uid()` reads a settable variable, so stage 1's "refused from any other principal" would be proven against the forgery mechanism the plan bans. A second database is also a second spelling of the engine address. B76's full run needs the new chain to be the served database, and the plan does not say how it gets there. §8.1's fallback covers only a failed bootstrap.
- **Evidence:** `scripts/bootstrap/preamble.sql:21-32` (no `auth.users`), `:85-91` (realtime is a no-op insert); `tests/construction-engine.ts:30-34`. That the platform services serve only the `postgres` database is my knowledge of the stack, not measured here.
- **Correction:** see the note at the end. Also say where the service logins' passwords come from; a chain cannot carry them.

**B2 · §0 "every service is `postgres`" (PLAN.md:13) — UNVERIFIED by the plan's own §8.3 (:353)**
- **Finding:** stated as fact in the paragraph he reads first, listed as unmeasured later.
- **Correction:** measure it or mark it.

**B3 · Rows 20, 14 and 23 "Kept" — REFUTED for 20 and 14, UNVERIFIED for 23**
- **Settings (row 20):** scope is a text grammar (`'department:' || slug`, `'employee:' || id`, `'global'`) with no company class, and the actors are text. This breaks under per-company slugs and the principal rule.
- **Tool gateway (row 14):** it creates tasks directly and joins `audit_log.payload->>'task_id'` to tasks. It is a work-birth path, not "keys aligned" glue for writer `o`.
- **HR and revenue jobs (row 23):** the job bodies were not read by the dossier. The dossier also lists the gateway's main file bodies and the settings door's approvals writer as not read.
- **Evidence:** `20260711002100_settings_family.sql:24,26,37`; `settings_control_e61.sql:65,90-102`; `packages/gateway/src/pin-check.ts:209`; `tool-lock-watch.ts:84,122,216`; `worker-engine.md:127`; `approval-gate-kernel.md:125`.
- **Correction:** 20 and 14 become "Repaired" with a heavier writer. No row is marked kept on unread code.

**B4 · Row 5 "Leased claim — Kept, moved" — STANDS for the claim itself, REFUTED as a complete carry**
- **Finding:** the skip-locked lease is sound, but the lease is not fenced. A reaped worker's late report succeeds once the task is running again under another worker. With seats in their own processes, an engine crash leaves orphan seats, giving two sessions on one part and double quota. A failed dependency also waits forever, and a purged one counts as satisfied.
- **Evidence:** `worker-shim.ts:788-800` (transition checks id and status only), against the heartbeat's `claimed_by` check at `:885-892`; dependency wall at `20260726013000_w24_allocation_work_seam.sql:71-72`.
- **Correction:** `part_transition` accepts a report only from the part's current run; the engine kills orphan seats at start; a failed dependency blocks with an event.

**B5 · Row 22 "Fixed guards — Removed" and "beyond row 22 stops at him" (PLAN.md:302, :312) — REFUTED on procedure, UNVERIFIED on substance**
- **Finding:** B85.md says any removal or weakening of a guard stops at him; §10 does not list row 22. Only the turn cap is covered by his word. The hourly token brake is his own setting, and it is the only brake on the subscription path. Its replacement, "capacity from the windows", has no measured way to be read by a resident engine without a session, and it is not in §8.
- **Evidence:** `B85.md:128`; `subscription-cap.ts:42-45,95-114`; `B64.md:53` ("the status line already captures them").
- **Correction:** add the read to §8 and row 22 to §10. Keep the token brake until the window read is proven. Say what "unknown" admits.

**B6 · "Everything else in A29 stands" (PLAN.md:246) — REFUTED**
- **Finding:** A29 item 11 says Hamza's day is one append-only session, compacted into a summary that keeps every decision, "never rebuilt from scratch each turn". Plan §3 item 6 assembles each turn from stored state and drops the compaction item 11 relies on.
- **Evidence:** `AGENT_ORCHESTRATION_SPEC.md:220`.
- **Correction:** name item 11 in §10.2 or keep it.

**B7 · The verdict table against K2 — REFUTED as complete**
- **No verdict row for:**
  - `packages/shared` (the one pool, contracts, audit writer);
  - the intake chain (`classify`, `intent-intake`, `decompose`, `dispatch`, `work-generation`);
  - Hamza's chat lane (`chat-drain`, `chat-legs`, `morning-briefing`);
  - `critical-gate`;
  - the audit trail itself;
  - alerts;
  - CRM tables becoming `clients`;
  - the projects family;
  - the revenue tables beyond the ledger;
  - the `control_*` doors and views he changes things through;
  - pg-boss's schema.
- **No row and no writer for:** the data move, the key turn and the stage 0 bench tools.
- **Writers:** B85.md gives the data move and the money path to Fable 5.2 at xhigh, yet row 12, the process that actually pays, is F-h.
- **Evidence:** `B85.md:55-56`; 12 `packages/*/package.json`; PLAN.md:279-308.
- **Correction:** add the rows; row 12 and the data move at F-x.

**B8 · Row 8 "Kernel workflow runner — Removed" (PLAN.md:288) — UNVERIFIED against the approved text**
- **Finding:** the approved text names the line card as `workflows.trigger`, with versions and undo, and the pattern as a `workflows` row. The target has `job_patterns` but no line entity (owner, schedule, budget, target, autonomy step), though its budget chain ends at "job and line". The removal is not in §10, and WORKFLOW_ENGINE_SPEC is not in §L's list.
- **Evidence:** `WORKFLOW_ENGINE_SPEC.md:175-176`.
- **Correction:** add the line card to §D, and list the change in §10 and §L.

**B9 · "Append-only for everyone… never purged" (PLAN.md:66-67) — STANDS as a principle, incomplete**
- **Finding:** his purge door exists on his own complaint and has a dashboard route. The plan does not say what "remove from my list" becomes. TRUNCATE is not named. A retention door cannot archive past a trigger that refuses everyone. Tests today sweep their own rows, so the plan needs a stated isolation method.
- **Evidence:** `20260724001000_task_purge_queued.sql:1-7`; `apps/dashboard/src/app/api/control/purge/route.ts`.
- **Correction:** state all four.

**B10 · Money records (PLAN.md:195-198) — REFUTED as complete against K15**
- **Finding:** cost rows "hang on a run", so money out that is not a model call (ad spend, a payment, marketplace fees) has no record. These are the gate's own subjects, and "realised net" needs them. There is also no reversal rule for an append-only ledger and no rule for summing currencies at holding level.
- **Evidence:** `20260707000004_cost_audit.sql:1-14` (model, mode and tokens only); `20260712011000_revenue_pnl_e65.sql:24-39`.
- **Correction:** name the record an executed outward money act writes, the reversal row, and the consolidation rule.

**B11 · The holding's shape (PLAN.md:74-81) — UNVERIFIED against K10**
- **Finding:** his examples are never walked through the tables: is a studio a company or a cupboard, is a brand a company, where does a sales channel hang. Departments are "shared" yet "unique inside their company".
- **Correction:** one short walk of his five examples through the rows, before the table goes to him.

**B12 · Stage acceptance (PLAN.md:322-328) — incomplete against K8 and K11**
- **Finding:** there is no acceptance test for his one stated requirement, the one-line order arriving as a full brief with the creative demands. The book's effect is a hypothesis from one job. Also missing: a seat refused another client's desk and memory; a service role refused a direct table write; the fencing case.
- **Correction:** add them.

**B13 · Tools that act in the world (PLAN.md:135-136, :171-172) — UNVERIFIED**
- **Finding:** a rule table cannot tell from a tool name that a browser click is a payment step. A browser seat holds session credentials outside "the only process that holds outward credentials". Hermes's steps are not run by the seat runner. A13's override line has no home.
- **Evidence:** `APPROVAL_ENGINE_SPEC.md:186,188`.
- **Correction:** state the mechanism, or mark it §8.

**B14 · Risk 3 "drawn before the rival synthesis" (PLAN.md:364-366) — conflict of sources, not settled by me**
- **Finding:** his yes was "part by part… after the Excel walk and B22's synthesis", and B64.md records "No design work starts until he has read it". The plan answers with a risk note and a single key turn. I did not measure where B22 stands today.
- **Evidence:** `B85.md:27-28`; `B64.md:62`.
- **Correction:** one line in §10, and state the build's start condition.

## 5. Claims that stand after attempted refutation

| Claim | Evidence |
|---|---|
| 113 of 188 migration files are not atomic | 75 files carry a top-level `BEGIN;`; `bootstrap-db.sh:34,63-64` |
| 13 model call sites | 7 `query(` and 6 `llmCall(` in `packages/*/src` |
| Production code forges the CEO's claim | `packages/hook/src/knowledge-shelf.ts:36` |
| Every `DXB_*` variable reaches an agent's child | `packages/kernel/src/sdk-isolation.ts:129-130`; its comment (`:120-121`) says the tool child needs the database URL, so row 13 changes the tool server's process model |
| Outbox executor: handler inside the lock, no order, no retry, unknown handler spins | `outbox-executor/src/index.ts:43-109` |
| Rows 2, 3, 4, 19 "Rewritten" | slug primary key and no currency or parent (`20260711002000_org_family.sql:11-25`); text actors (`approvals_outbox.sql:9`, `cost_audit.sql:19`); revenue with text client and euro only (`revenue_pnl_e65.sql:29-36`) |
| Context band 12,000–16,000 with its own summariser | `orchestrator/src/context-budget.ts:24`, called at `worker-shim.ts:610` |
| Two processes is an exception that needs his yes | `SYSTEM_ARCHITECTURE.md:20,51`; the executor's own header already says credentials belong to it alone (`index.ts:2`) |
| Stack decisions respected; idle makes zero model calls by design; the persona question left as a measurement; the test lock | `STACK.md:121`; PLAN.md:138-139; `B85.md:106-108,118-120` |

Row 1's "Rewritten" stands as a consequence of rows 2–4, not of the chain's own defects.

## 6. Grade C — older than this work

- The daemons' live database login has been unverified since the dossier.
- The off-site backup has failed nightly since 2026-09-25, and stage 5 depends on its restore drill (B72).
- The dossier's catalogue counts are the construction engine's and were not re-measured by the lead.
- APPROVAL_ENGINE R2 still contradicts A9.

## 7. More than the job needs

- Commit-safe event reading by transaction horizon (PLAN.md:127) is needed only if something derives state by tailing events. If the state rows are the truth and a reconnect re-reads a snapshot, it can go. The plan should say which.
- A second database with a cross-database data move — see the note.

## 8. Note, said once

Build the new chain as its own schema namespace inside the one database on each engine, which is the plan's own fallback. The real sign-in and realtime are then present on the bench, the engine address stays spelled once, the data move is one in-database transaction, and the key turn can be undone until the old schema is dropped.
