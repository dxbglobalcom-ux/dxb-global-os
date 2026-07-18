# E13.1 — F-09 Production Capability Proof (closure evidence)

**Date:** 2026-07-19 ~01:40 (Fable in person)
**Gate:** IMPLEMENTATION_ROADMAP E13.1 audit hardening — "closure evidence = PRODUCTION capability proofs; mock/demo evidence CANNOT close this row" (registered 2026-07-17, disposition table in [[00-CEO-DIRECTIVE-REVENUE-FIRST]]). F-15 leg struck by U19 (Outleteuro cancelled by CEO order 2026-07-19).
**Method:** every claim below cites the read-only measurement executed THIS session against the live database (`docker exec supabase_db_DxB_Global_OS psql -U postgres -d postgres`) or a governed ledger anchor. Evidence classes follow the audit's F-09 taxonomy verbatim. RULE #0-A: no claim without a measurement.

## 1. Evidence-class map for every E13.1 acceptance claim

| Acceptance claim | Evidence class (audit taxonomy) | Evidence (measured) |
|---|---|---|
| L1 unit/integration suite green | Unit test | `pnpm test` → 455 passed / 0 failed (62 files) — run 2026-07-18 ~05:50, recorded in the E13.1 row |
| L2 DB layer green on pristine container | DB probe | `scripts/test/db-suite.sh` → PUSH OK 94=94 · ASSERTS 7/7 · ROLLBACK 46/46 · DB SUITE PASS (E13.1 row) |
| L5 browser suite green incl. authed tier | UI E2E | `playwright test` 17/17 in one run (58.3s), CEO-minted storageState (E13.1 row, 2026-07-18 20:07) |
| **Workforce executes real work unattended** | **Production topology** | §2 below — this document's core proof |
| Outward execution (money/contract/email to the world) | — | **NOT claimed.** See honest boundaries §3 |
| Long-run 24/7 durability | Production smoke ≠ durability | **NOT claimed.** See §3 |

## 2. Production-topology proof (the F-09 core)

All queries run 2026-07-19 ~01:15–01:40 against the live DB; commands reproducible verbatim.

**2.1 Real workforce, real completions — zero exceptions.**
- `select count(*) from agents where employment_status='active'` → **198**  (220 total incl. 21 archived + 1 dormant U17).
- `select count(*) from agents a where a.employment_status='active' and not exists (select 1 from tasks t where t.agent_id=a.id and t.status='done')` → **0** — every active employee holds ≥1 completed task. No promotion without a passed sample (E12.5 wave invariant, SQL-verified at wave exit).

**2.2 Autonomous claim-and-execute (not manual function calls).**
- `select claimed_by, count(*) from tasks where status='done' group by 1` → **resident-worker|218** — ALL 218 done tasks were claimed and driven by the resident worker on its own tick, none hand-driven.
- Tasks: **218 done / 58 failed / 4 open** (3 `awaiting_approval` + 1 `returned` — listed, live gate states, not stuck work; the tasks-vs-approvals display contradiction is C5 in the complaint ledger).
- 206 of the done tasks completed on 2026-07-18 alone (the activation wave), agent_runs spanning 00:04→19:36 UTC.

**2.3 Real model execution across the ladder (4 providers-tiers, real tokens, real escalation).**
- `select model_id, status, count(*) from agent_runs group by 1,2` → 442 runs total, 272 succeeded: sonnet-5 228✓/107✗ · claude-opus-4-8 34✓/10✗ · claude-haiku-4-5 5✓/2✗ · kimi-2.7-code 4✓/51✗. Escalation ladder is pure code (escalate.ts) and was exercised live — kimi failures escalated to sonnet/opus rungs (U18(5) ladder repair born from this wave).
- LiteLLM: `select count(*) from litellm."LiteLLM_VerificationToken"` → **219** virtual keys live (per-employee + per-dept layer U18(2)).

**2.4 Real tool execution (not mocked surfaces).**
- `select count(distinct run_id), count(*) from tool_calls` → **295 tool calls across 198 distinct runs**, 2026-07-17 02:25 → 2026-07-18 19:36. Real servers: `mcp__dxb-mcp__queue_get` 249, claude-mem search 23, `cost_summary` 9, `registry_list`/`memory_recall`/`audit_trace`/`queue_transition`/`audit_append`, plus EXTERNAL hands `mcp__git__git_status`, `mcp__context7__resolve-library-id` (R4.3 staffed E2E: task 61c73f8d, run 2e489baf, tool_calls 4029–4031, results matched ground truth — roadmap R4.3 row).
- Caveat (honest): `tool_calls.ok` is NULL on all 295 rows — the executor records existence/duration but not the ok flag; success is proven at run/task level, not per-call. Recorded as instrumentation debt in the C-series remediation (observability class).

**2.5 Governance engines live in production (not probe rows).**
- Approvals: 114 total, **0 pending** — 113 decided in CEO context via `control_approvals_action` (audit `approval.approve` ×113, commit ff617d2); supersede sweep `fn_approvals_supersede_sweep` live (migration 20260718214000).
- Hooks: **1883 hook_violations** rows — the gate genuinely rejects (std 4/15 etc. exercised at scale during the wave).
- Alerts: 1173 rows; success-supersedes-failure trigger live (A6, migration 20260718210000).
- Ledgers: cost_ledger **1316** rows · audit_log **11744** rows — cost and audit trails written by real runs, not fixtures.
- Workflows: 3 defined / 3 runs (2 succeeded, 1 failed) — executor exercised, thin but real.

## 3. Honest boundaries (F-10 discipline — what these numbers do NOT prove)

1. **revenue_ledger = 0.** No real revenue operation has occurred. Consistent with U19: real business (Outleteuro) cancelled by CEO order; status label = "Holding OS foundation complete; real business pilot cancelled by CEO — future intent reopens it."
2. **Outbox: 113 ready / 1 executed.** Outward provider execution at scale is NOT proven (R6.1 debt, Phase-11-class, re-gated by U19). The 113 ready rows are approval artifacts of the hiring wave, not external sends.
3. **24/7 durability NOT proven.** Measured now: no resident-worker process running (`ps -eo pid,etime,cmd | grep -iE "node.*(worker|orchestrator)"` → only VS Code utilities). The worker ran autonomously THROUGH the wave (218 claims) and exited with it; continuous residency is a VPS-deploy (Phase-7-class) property this laptop topology does not claim. ⚠ UNVERIFIED as a standing capability.
4. **kimi-2.7-code 4/52 success** on this task class — measured model reality, kept honest (CEO C2/C12 orders model roster changes; ledger C-series).

## 4. Verdict

F-09 gate satisfied: the closure claim "the workforce executes real work in the production topology unattended" rests on production-class evidence (§2), every acceptance claim carries its evidence class (§1), and non-proven capabilities are labeled, not implied (§3). E13.1 row moves to ✓ with this note as its F-09 anchor.
