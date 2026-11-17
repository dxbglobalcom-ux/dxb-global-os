<!-- B85 preparation dossier · part: the approval gate, the kernel and the model gateway · read by an Opus 5.5 helper at high, 2026-11-17 · facts, no verdict.
     Checked by the lead at the source the same evening, ten claims, all held: fn_classify_operation has one TypeScript caller (approval-gate.ts:23, used by steps/approval.ts:20); the workflow approval step parks with status pending whatever the classifier returns; no canUseTool or PreToolUse in packages/*/src; the locked-rule guard fires BEFORE UPDATE OR DELETE only; hook.enabled is off for any value but true and on when the read fails (flag.ts:12-15); clampOutward raises none to internal only; fn_select_model is called without the employee (agent.ts:121); subscription cost recorded as 0 and the made-up confidence 0.3 (executor.ts); 7 query() and 6 llmCall sites; packages/gateway/src is 2,289 lines (the lead's 2,673 counted files outside src). The rest is the helper's reading, unchecked. -->

# THE APPROVAL GATE, THE KERNEL AND THE MODEL GATEWAY: preparation dossier (B85)

## 1. THE LOAD

- APPROVAL_ENGINE §2 R1: `money_out` never reaches the outbox without a human decision, and settings cannot switch this off.
- APPROVAL_ENGINE §3 ⛔: the kernel classifies every operation from a rule table, in one place, into `autonomous`, `notify` or `gated`. An agent cannot declare itself autonomous.
- APPROVAL_ENGINE R4/R6/R7: the CEO has 7 actions; the fatigue guard proposes policy; every decision is linked to decision_log and to the outbox or task.
- APPROVAL_ENGINE A9: every client delivery waits for his eye until he lifts that for its job type. A pass streak is kept per job type.
- APPROVAL_ENGINE A10: `contract.*` splits. Inside the approved price policy and standard contract it runs autonomous and logged; outside them it is gated.
- APPROVAL_ENGINE A11: every step is checked before it runs. Hermes and browser-using employees meet the gate, and at a payment step the work stops for him.
- APPROVAL_ENGINE A12: `email.send` leaves the gated set.
- APPROVAL_ENGINE A13: when his word conflicts with a rule, he is warned once, the exception is logged as an `override` line, and the rule stays.
- APPROVAL_ENGINE §13: decisions are the CEO's alone. A delivery release may come through Hamza's chat or voice.
- B32 (leg of 2026-11-17): one approval inbox on his phone, which also takes human-check stops from sites.
- B15: a per-employee autonomy level that actually changes what the employee may do, with the change audited.
- B08 and MODEL_ROUTING §4b/R8/§4f: a per-employee brain switch, audited. Guardrails are absolute, and the brain is a floor.
- MODEL_ROUTING R4 and A-2026-10-14 items 4–5: the backup is by role (Opus 5.5 ⇄ Fable 5.1). Every switch is logged naming who really did the work, work never falls to a weaker model, and Hermes waits instead of switching.
- MODEL_ROUTING R5: no raw provider keys; LiteLLM virtual keys only. One exception: a key for Hermes alone. Jev goes through LiteLLM's `vercel_ai_gateway/` route.
- MODEL_ROUTING A-2026-10-14 item 1: the job's master picks model and effort per part, with a one-line reason. Item 3: masters never run below `high`. Item 6: a "model room" page for each new model.
- §4e and B51: Sol 6.1 `high` reads all client-bound work; Fable also reads money and contract work. B51 also asks for a per-task cost line (a warning, never a stop), a cost meter, removal of the dead council, and a ruler that goes red when a customer-facing class has no checker.
- B64 v2: no department budgets; the master of the job type owns the job.
- B05: real Stripe, DocuSign and Gmail-send integrations. B34: a local model lane that drafts only. B41: a tool can be requested and granted mid-task. B71: port 4000 (LiteLLM) closed to the network. B76: one full end-to-end run on the construction copy, then the key turn.
- B83's specific load on this part: UNVERIFIED (I did not read its row file).

## 2. WHAT STANDS TODAY

**Naming trap:** `packages/gateway` (2,289 lines of `src/*.ts`; the 2,673 figure in the brief was not reproduced) is the MCP **tool** gateway, not a model gateway. The model gateway is the LiteLLM proxy, reached through `packages/shared/src/litellm.ts`.

**kernel**
- `approval-gate.ts`: `classifyOperation` → `fn_classify_operation`; if the call returns nothing it answers `gated`.
- `policy.ts`: `loadPolicy` and `route` over `routing_rules`; a miss throws `NoRouteError`.
- `models.ts`: `resolveModel` and `sdkModel` over `model_catalog`, including the fallback chain.
- `classify.ts`: the LLM intent classifier.
- `sdk-isolation.ts`: keeps company calls free of construction files.
- `workflow/`: runner, triggers, executor (both SDK and LiteLLM paths), and the agent, review and approval steps.

**hook:** the pre-task and post-task gates, runtime monitors, the `hook.enabled` flag, violations and escalation.

**gateway:** pin-check, drift and lock review, the lock watch, inventory, the profile generator, library profiles, and `runtime-profile` (the SDK tool surface).

**shared:** `getDb` (the only pg pool), LiteLLM chat, embeddings and admin keys, `appendAudit`, contracts, and DB types.

**Importers:**
- kernel: orchestrator (5 files), outbox-executor (2), voice (1).
- gateway: kernel, orchestrator, outbox-executor.
- hook: kernel, orchestrator (2).
- shared: 9 packages plus the dashboard.

**Approval path, task lane:**
1. `classify.ts:99-164`: the LLM sets `approval_class`.
2. `classify.ts:41-46`: a regex can raise it.
3. `decompose.ts:87`: the class can only be raised.
4. The worker runs with its MCP tools mounted (`runtime-profile.ts:130-154`).
5. `qa.ts:224`: `none` → done; anything else → `awaiting_approval`.
6. An agent may open a draft with `approval_submit_draft` (`dxb-mcp/src/groups/approval.ts:18-41`).
7. The CEO decides through `decide_approvals` (`20260724006000`) or `control_approvals_action` (`20260713110000:153`).
8. `trg_outbox_enqueue` (`20260726011000:23-39`) → outbox-executor (`actions/index.ts:13-14`).

**Approval path, workflow lane:**
1. `runner.ts:339-352`
2. `steps/approval.ts:20` (`classifyOperation`) and an insert at `:27` with status `pending`
3. The run parks.
4. `drainWorkflowRuns` (`runner.ts:468-495`) resumes it, matching on the approval's `payload->>'workflow_run_id'`.

**Model call path:**
1. `route()` (by task class) or `fn_select_model` (`steps/agent.ts:121`).
2. `executor.ts:50-62` decides the mode.
3. Subscription: `sdkModel` → `query()` (`executor.ts:116`).
4. API: `llmCall` (`litellm.ts:103`) with the department key `DXB_LITELLM_KEY_<DEPT>` (`litellm.ts:86-100`) to `127.0.0.1:4000` (`litellm.ts:24`).

**SQL:**
- `20260707000003`: `approvals`, `outbox`, guard trigger, enqueue trigger.
- `20260710000015` and `20260724006000`: `decide_approvals`.
- `20260713110000`: `approval_rules`, `fn_classify_operation`, `control_approvals_action`.
- `20260726011000`: the enqueue allowlist.
- `20260708000009`: `routing_rules`.
- `20260726002000`: `fn_select_model`.
- `20260713080000:273`: `fn_model_fallback`.

## 3. DEFECTS THE BOARD ALREADY NAMES

- **B65:** an error answer is taken as finished work, because `is_error` is never checked. The row cites `chat-drain.ts:160`. The same pattern is in `classify.ts:99` and `executor.ts:166`; a grep for `is_error` across kernel, hook, shared and gateway finds nothing.
- **B66:** the SQL fallback ignores lane and tier floor. The row cites `e71_routing_slots.sql:261`. The live definition is now `e84b_alerts.sql:273`; it still checks only status, banned and mechanical_only.
- **B68:** the seed holds 21 rows against 39 live. I measured the seed's 21; the live 39 is UNVERIFIED (I did not read the company database).
- **B70:** with the hook off, the quality gate is skipped (row cites `worker-shim.ts`). The same pattern is at `steps/agent.ts:247`.
- **B71:** LiteLLM listens on `0.0.0.0:4000`.
- **B73:** every signed-in account counts as the CEO: `20260713110000:178-181`, and the same line appears in 16 migration files. `decide_approvals` stamps `'ceo'` without checking who calls (`c5:36`) and is executable by `authenticated` (`0015:73`).
- **B75:** the engine hides failures. The row cites no file:line in this part.

## 4. FACTS A DESIGNER MUST KNOW

1. The rule table is used in one place only. The only caller of `fn_classify_operation` is `steps/approval.ts:20`; there is no SQL caller. On the task lane, the gate is the LLM's `approval_class` (`classify.ts`, `qa.ts:224`).
2. That workflow step ignores the gate the classifier returns and parks anyway (`approval.ts:20-27`). A workflow with no approval step has no gate at all.
3. Agents create their own drafts with an `action_type` and `risk_class` they choose themselves, and nothing classifies them (`dxb-mcp approval.ts:25-39`).
4. There is no gate per tool call: `canUseTool` and `PreToolUse` appear nowhere in packages. Finance has `stripe`, `revolut` and `wise` granted as `"*"` (`grants.json`). Today they are not mounted only because they are missing from the server catalogue (`finance.mcp.json` mounts only `dxb-mcp`). Playwright is mounted for engineering and quality.
5. The outbox runs only `test.write_file` and `email.send.staging` (`20260726011000:26`). Any other approved action leaves only an audit row.
6. A locked rule can be beaten by an INSERT: the guard fires only BEFORE UPDATE or DELETE (`20260713110000:78-80`). Test `e9/approval-center.test.ts:128-139` asserts that a priority-5 `notify` rule beats the locked `payment` rule.
7. The two decision doors behave differently: `decide_approvals` updates the linked task (`c5:41-47`), and `control_approvals_action` does not.
8. `clampOutward` raises `none` only to `internal`, never to `outward` (`classify.ts:46`).
9. The hook flag fails open on any value that is not `true` (`flag.ts:12`). With the hook off, both the pre-gate and the post-gate are skipped, including the halal screen (`agent.ts:225-247`). The review step runs no hook at all (`review.ts`).
10. When escalation to the CEO fails to create its approval row, the failure is swallowed and `approvalId` stays null (`violations.ts:104-128`). The same happens to violation records (`violations.ts:35`).
11. Model calls are not in one place: 7 `query()` sites and 6 `llmCall` sites across 5 packages. The kernel executor and `worker-shim` each implement both paths separately.
12. Routing policy lives in several places: `routing-seed.json`, migrations that insert rows directly, `routing_rules`, `model_catalog`. There are two routers (`route()`, `fn_select_model`). The mode is read from `routing_rules.mode` first and the catalogue lane second (`executor.ts:50-62`).
13. The workflow path never passes the employee to `fn_select_model` (8 arguments at `agent.ts:121`), so the CEO's per-employee brain override (`p_agent_id`, `brain_floor.sql:126`) is never applied. The comment at `agent.ts:77` says it is.
14. The SDK `fallbackModel` switches model silently mid-run, and the run stays recorded under the primary (`models.ts:104-136`). Subscription cost is recorded as 0 (`executor.ts:174`). An answer that is not JSON is given a made-up confidence of 0.3 (`executor.ts:204`).
15. LiteLLM keys are per department (`litellm.ts:86-100`), while B64 v2 removes department budgets. The `local` lane exists in the code (`models.ts:11`), but no code calls it.

## 5. THE TESTS

58 of the 195 `*.test.ts` files touch this part. The biggest groups are b51, phase7, c9, b43, e9, e10, phase5 and phase4. None was run.

| Test | Could it go red? |
|---|---|
| `e9/approval-center.test.ts:116-126` (literal ops expect `money_out`/`gated`) | Yes; the expected values are independent of the code. |
| `e9/approval-center.test.ts:128-139` | Yes, but it locks in fact 6 as the expected behaviour. |
| `phase5/routing-data.test.ts:79-84` (test-inserted probe rows) | Yes. Its live classify block runs only when `DXB_LIVE_SDK=1` (`:21`, `:148`). |
| `e10/hook.test.ts:413-428` (bad database URL, expects REJECT) | Yes. |
| `b64/routing-door-closed.test.ts:123` | Yes, but it asserts B73's "signed-in means CEO" as correct. |

LiteLLM budget enforcement (`phase4/budget-stop.test.ts:25`) is skipped unless `LITELLM_MASTER_KEY` is set.

NOT COVERED: the full bodies of `pin-check.ts`, `generate-profiles.ts` and `library-profiles.ts`; the full rule list in `hook/pre-task.ts`; the `settings_control_e61` approvals writer; the `fn_select_model` body beyond the override step; the B64, B15, B41 and B83 row files; COST_CONTROL_SPEC, PERMISSION_MODEL and FABLE_5_HOOK_SPEC; the codex-cli lane in `critical-gate.ts`; all live company-database counts.
