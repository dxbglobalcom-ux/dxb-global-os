<!-- B85 structural read · are the specs a true yardstick · an Opus 5.5 helper at high, 2026-11-17. Part 5's table is the helper's reading; the lead decides.
     Checked by the lead at the source the same evening, ten claims, all held: permission_ceilings, fn_permission_check, v_effective_permissions, cost_rollups and control_signal each have no hit in db/migrations or packages/*/src; MEMORY_ARCHITECTURE does not name embeddinggemma; SECURITY_MODEL does not name B73; packages/voice/src writes no decision_log; Hamza's two lanes write no agent_runs; APPROVAL_ENGINE_SPEC R2 (:13, the 1,000 $ first delivery) still stands beside A9 (:184, every delivery) — this is one of the four sentences still asked of him (STATE, the limit sweep (c)); MASTER_PLAN :36 still says 19 migrations, 18 tables. The rest is the helper's reading, unchecked. -->

**B85: whether the written contracts in HOLDING-OS-MASTER-PLAN can serve as the yardstick**

Every foundation spec has a base text written on 2026-07-10, with later adaptations added at the end. The newer adaptations are mostly current. Most base texts describe July, and several adaptations themselves describe a target that is not built yet. Only SYSTEM_ARCHITECTURE and SECURITY_MODEL were rewritten in place; even so, SECURITY_MODEL O5 is now stale (part 2).

**1. Inventory**

"Base" is the `git blame` date of each spec's core line. "Last" is `git log -1`.

| Spec | Bytes | Last | Base | Adaptations |
|---|---|---|---|---|
| DATA_MODEL | 32,503 | 10-28 | 07-10 (:17, :324) | 9 (B43, B51, B64 A1–A7) |
| EVENT_MODEL | 13,932 | 10-14 | §9b edited 10-14 | 2 sections (B43, B64 items 1–4) |
| APPROVAL_ENGINE_SPEC | 23,474 | 11-08 | 07-10 (:33) | 14 (A1–A13 + B43) |
| PERMISSION_MODEL | 16,660 | 10-26 | 07-10 (:57) | 5 inline (G1-bis/ter, G2-bis, §4-bis, §16-bis) |
| SECURITY_MODEL | 14,545 | 10-14 | rewritten 10-14 | 0 marked; header exception + O5/O7 notes |
| MODEL_ROUTING_SPEC | 82,928 | 11-16 | 07-10 (:24) | 6 A-2026-* sections + 2 inline in §3 + §4b–4f orders |
| AGENT_ORCHESTRATION_SPEC | 77,316 | 11-16 | 07-10 (:23) | A1–A33 + depth ruling |
| FABLE_5_HOOK_SPEC | 26,579 | 10-28 | 07-10 (:42) | A1–A19 |
| MEMORY_ARCHITECTURE | 13,903 | 10-26 | 07-10 (:17) | A1–A3 |
| COST_CONTROL_SPEC | 24,415 | 10-28 | 07-10 (:22) | A1–A9 + §4bis |
| VOICE_INTERACTION_SPEC | 58,557 | 11-01 | V-rules edited 10-26 | 7 inline markers; §24bis–sexies |
| MASTER_PLAN | 20,522 | 11-01 | 07-10 (:36) | 0 |
| SYSTEM_ARCHITECTURE | 31,651 | 10-26 | rewritten (LAW A blocks) | 4 inline |

**2. Core claims tested**

**DATA_MODEL**
- §3/§1 "19 migrations, 18 tables": FALSE. There are 188 files and 62 tables (dossier `database.md` §2).
- §4/§20 migration families `0020x…0026x`: FALSE. The chain uses timestamp names (`ls db/migrations`: 0 files start with `0`).
- §20 "`-- ROLLBACK` in every file": FALSE. 101 of 188 have one (dossier §4.5).
- §11 "writes only through SECURITY DEFINER; authenticated plus a CEO claim read": FALSE.
  - anon holds TRUNCATE on 34 tables (dossier §3, B73).
  - Any `auth.uid()` counts as `'ceo'` (`20260713110000_approval_center.sql:178-179`).
- §12 append-only logs: TRUE in grants. In practice it is defeated, because only `postgres` holds UPDATE/DELETE and the kernel likely logs in as `postgres` (dossier §4.1; the daemon role is UNVERIFIED).
- §4.1 `personas.body_md` as the persona text (`DATA_MODEL.md:80`): SUPERSEDED. The file is the source (`dxb-persona/SKILL.md:49`, `persona.ts:88`).
- A1 "text capped at 500": stale. The cap was lifted to 20,000 (`20261014040000_b64_goal_not_intent.sql:25`).
- A5 `cost_eur NOT NULL DEFAULT 0`: TRUE as written, still unbuilt.

**EVENT_MODEL**
- G1/R4 "no postgres_changes": TRUE. The only mention is a comment (`realtime.ts:9`).
- One helper, `notify_broadcast`: TRUE (`20260711002500_api_support.sql:29`).
- §9b "closed dictionary", every channel listed: FALSE.
  - Code broadcasts on `revenue` ×19, `ops` ×4, `voice` ×3 and `finance` ×2. None of these is in §9b.
  - `reception`, `cost`, `system` and `approvals` are never sent through it.
  - The legacy channels `dxb:task_events`, `dxb:approvals` and `dxb:cost_ledger` (`realtime.ts:4`) are not in it either.
  - The event types `job.*`, `inbound.*` and `run.brain_switched` have 0 hits (target only).

**APPROVAL_ENGINE_SPEC**
- §3 ⛔ "the kernel classifies every operation from the rule table": FALSE.
  - The only caller of the rule table is the workflow step (`steps/approval.ts:20`).
  - The task lane uses the LLM's `approval_class` (`qa.ts:224`).
  - Agents choose their own `risk_class` (dossier gate facts 1–3).
- §16 "the locked rule cannot be beaten": FALSE. An INSERT goes around the guard (`20260713110000:78-80`).
- §13 "the decision is the CEO's alone": FALSE in code. Any signed-in account counts as the CEO (`:178`).
- A2 "no outbox write path for anon/authenticated": UNVERIFIED against the dossier's anon TRUNCATE ×34. I did not check whether `outbox` is among the 34.
- A9 (every delivery waits for his eye): this is the current rule. It is not built.

**PERMISSION_MODEL**
- §3/§4 "the ceiling matrix is DATA", `permission_ceilings`, `fn_permission_check`, `v_effective_permissions`, `permission_denials`, `mcp_profiles`: FALSE. All have 0 hits in db/migrations, packages, scripts, tests and the dashboard.
- §4-bis "the seed keeps its 60 cells": FALSE. No seed exists.
- §1 "permission truth is in the DB": FALSE (B73).

**SECURITY_MODEL**
- O5 "fn_update_routing open to anon (open gap)": stale. It was closed by `20261014010000_b64_routing_door_closed.sql:256` (bench chain; company UNVERIFIED).
- O5/O6 are presented as the backbone holding: FALSE. B73's wider holes are not mentioned (0 hits for "B73").
- O7 "redact.ts gate on memory": FALSE. There is no `redact` in `write-policy.ts`.
- O8: same as DATA_MODEL §12.

**MODEL_ROUTING_SPEC**
- §3 ⛔ "rules in the DB; code only interprets; one `select_model`": FALSE.
  - There are two routers: `route()`/`resolveExecutionRoute` (`worker-shim.ts:218`) and `fn_select_model`.
  - Rules also live in the seed JSON.
  - `selectModel` in the orchestrator has no caller (`index.ts:85` only).
- "Every decision goes to decision_log('routing_decision')": FALSE on the task lane. Only the SQL `fn_select_model` writes it (`brain_floor.sql:155`); the worker logs only employee-selection (`worker-shim.ts:709`).
- R4 backup by role: target (OPEN). The code is still the `fallback_of` chain (B66).
- A-2026-10-10 "the catalogue is the one place for model ids": TRUE for ids (`models.ts:88`).

**AGENT_ORCHESTRATION_SPEC**
- §3 "task = pg-boss job": SUPERSEDED by its own A1 (`:145`), yet still standing.
- §3 step 3 `fn_select_model`: FALSE on the main lane.
- §3 step 5 "SDK with a LiteLLM key": FALSE on the subscription path (dossier `executor.ts:116`).
- §4/G4 `agent_runs.control_signal` pause/cancel: FALSE. It has 0 hits in packages and migrations.
- G1 "no run without an agent_runs row": FALSE for Hamza. `chat-drain.ts` and `voice/answer.ts` have 0 `runScope`/`agent_runs`.

**FABLE_5_HOOK_SPEC**
- `packages/hook` as a library with rules in the DB: TRUE.
- §17 fail-closed on an engine error: TRUE (`flag.ts:13-15`). Separately, a flag value other than `true` switches every gate off, the halal screen included (B70).
- §6 "the token budget only warns": FALSE. TURN_BUDGET is 4/12/40 (`worker-shim.ts:298`).
- §7 chain "worker → master → Hamza → CEO": target only. The code ladder still has `head-review` (`escalate.ts:272`).

**MEMORY_ARCHITECTURE**
- G1 `KIND_STORE` fixed: TRUE (`write-policy.ts:61-66`).
- "The router never guesses the store": FALSE. A recall with no kind triggers an LLM classify call (dossier fact 4).
- G2/§16 redaction: FALSE.
- §3 four stores "KALIR": SUPERSEDED. The approved board decision "V2 memory" (board line 274, 2026-08-01, Graphify leaves the company's memory) is not in the spec: 0 hits for "embeddinggemma".

**COST_CONTROL_SPEC**
- §3 `cost_rollups`, `cost-rollup`/`cost-guard`/`cost-anomaly` jobs, `cost.stop_noncritical`: FALSE. All have 0 hits.
- §4bis describes the real brake (`budget_state.hard_stopped`).
- §3 "cost_ledger written by an agent_runs-close trigger": FALSE. The worker writes it in code (dossier, `worker-shim.ts:502`).
- R5 per-department LiteLLM key budgets: TRUE in code (`litellm.ts:86-100`) but at odds with B64 v2 A5.

**VOICE_INTERACTION_SPEC**
- V7 "persona in the DB record": FALSE/SUPERSEDED (file, `persona.ts:88`).
- V4 interruption: FALSE (`jarvis-daemon.ts:466`).
- V10 "every call writes decision_log": FALSE. 0 `decision_log` in `packages/voice/src` and in the three voice migrations.
- V2 "one brain, no parallel state": FALSE in part. Hamza's lanes run with `tools: []` and write no runs.

**MASTER_PLAN**
- §3.1 "19 migrations / 18 tables": FALSE.
- §7 (12 July deadline) and §8 (matrix v6): dead. Superseded by v20 (`CLAUDE.md`, AGENT_ORCH G6).

**SYSTEM_ARCHITECTURE**
- R1 (the July chain runs while B64 replaces it) and the B36 two-database wall: TRUE as written.
- R3 single write seam: FALSE in part (B73).
- R5 "no new resident service": it has one registered exception (Hermes, `:199`).

**3. Dead text still standing (LAW A defects)**
- **DATA_MODEL:** the header at :4 and §1 (the "18 tables" rule), §3, the §4 family numbering, §20, §22's commands, and the §4.1 `personas.body_md` contract. A1's "capped at 500" is stale.
- **APPROVAL_ENGINE_SPEC:**
  - R2 (:13) says only the first delivery of a deal ≥ 1,000 $ or of a new service type reaches him.
  - The B43 block (:178) repeats that ("the one delivery that waits").
  - Both contradict A9 (:184, every delivery). The R2 text even calls that delivery class "A9", which points at the rule that replaced it.
  - The §3 classifier diagram is presented as fact.
- **AGENT_ORCHESTRATION_SPEC:** §3's "task (pg-boss job)" and §4's "priority → pg-boss priority" remain despite A1 (:145).
- **COST_CONTROL_SPEC:** the §3 job design remains beside §4bis.
- **MEMORY_ARCHITECTURE:** §3 "KALIR", which conflicts with the approved V2 memory.
- **SECURITY_MODEL:** O5's "open gap" text, already closed on the bench chain.
- **VOICE_INTERACTION_SPEC:** V7, which conflicts with the persona-file architecture.
- **MASTER_PLAN:** §3.1, §7 and §8.
- **PERMISSION_MODEL:** §4-bis, which claims a seed that does not exist.

**4. Foundation subjects no spec states as structure**
- **Actor identity:** how the database knows ceo, system, agent, or "the CEO's word via Hamza".
  - PERMISSION G1 names the classes, and API_CONTRACTS :112 says "`auth.uid()` CEO check".
  - Three actor functions exist (`fn_org_actor`, `fn_succession_actor`, the effective-role fallback in `20261014050000`), and no spec defines them.
  - B73 shows the result.
- **Tenancy across companies and clients:** "tenant" appears only in SECURITY S4 ("tek-tenant VPS"). `company_id` sits on departments/projects in DATA_MODEL drafts, but no spec states data separation per company or client, although B83's H1 asks for a monthly tenant report.
- **The job/desk work model:** stated only as a record contract (DATA_MODEL A3, "schema at build"). There is no state machine, no relation to `tasks`, `intents` or `workflow_runs`, and no single place for task state (board C60).
- **The migration/schema-change discipline:** atomicity, function redefinition and data in migrations. DATA_MODEL §20 is the only text, and it is dead.
- **The resident runtime:** the one scheduler process, its queues, cadences, missed-run catch-up and in-memory state. These appear only as adaptation rows (AGENT_ORCH A1/A5) and the dossier, not as a spec.
- **Prompt/context assembly as a foundation part** (`prompt-core.ts`): no spec found. I searched only the named specs plus API_CONTRACTS.

**5. Yardstick verdict**

| Spec | Usable today | Why |
|---|---|---|
| DATA_MODEL | only its adaptations | Base describes the July 18-table database; drafts never built |
| EVENT_MODEL | only its adaptations | Envelope true; catalogue misses four live channels |
| APPROVAL_ENGINE_SPEC | only its adaptations | Classifier and locked-rule claims false; R2 contradicts A9 |
| PERMISSION_MODEL | no | Core ceiling matrix and its functions do not exist |
| SECURITY_MODEL | no | Backbone claimed holding; B73 holes unrecorded; O5 stale |
| MODEL_ROUTING_SPEC | only its adaptations | Single-router, rules-in-DB claim false; catalogue adaptation true |
| AGENT_ORCHESTRATION_SPEC | only its adaptations | §3 lifecycle dead; A1–A33 carry the real contract |
| FABLE_5_HOOK_SPEC | yes, with corrections | Library, DB rules, fail-closed true; turn-cap rule unmet |
| MEMORY_ARCHITECTURE | no | Redaction false; approved V2 memory not written in |
| COST_CONTROL_SPEC | only its adaptations | §3 job design never built; §4bis/A5–A9 current |
| VOICE_INTERACTION_SPEC | only its adaptations | V7, V4 and V10 false; B12/B64 sections current |
| MASTER_PLAN (architecture) | no | July inventory, July deadline and the superseded model matrix |
| SYSTEM_ARCHITECTURE | yes | Rewritten in place; claims tested hold, except R3 |

NOT COVERED: WORKFLOW_ENGINE_SPEC, AUDIT_AND_LOGGING_SPEC, ORGANIZATION_ENGINE_SPEC, API_CONTRACTS and OBSERVABILITY_SPEC were inventoried by headings only and their claims were not tested. Every company-engine fact is unmeasured, including whether `20261014010000` is applied there. Whether `outbox` is among anon's 34 TRUNCATE tables is unchecked. The daemon's database login is unchecked (`.env` not read). MODEL_ROUTING §4b–4f and A-2026-07/09 bodies, AGENT_ORCH A6–A25 bodies and VOICE §24bis–quinquies were not read in full. Adaptation counts are heading and ID greps, not a line-by-line count.
