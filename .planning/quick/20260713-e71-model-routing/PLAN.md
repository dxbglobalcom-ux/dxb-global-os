---
type: quick
slug: e71-model-routing
created: 2026-07-13
author: fable-5 (inline, K1)
roadmap: E7.1
spec: HOLDING-OS-MASTER-PLAN/MODEL_ROUTING_SPEC.md
---

# Plan — E7.1: table-driven model routing (slots + fn_select_model + orchestrator read)

## Scope (roadmap E7.1 verbatim)

model_catalog seed completion + routing_rules role-slot expansion + orchestrator
table-reading selection. Evidence: routing test slot → expected model; fallback
chain writes decision_log.

## Live baseline (verified)

- `model_catalog`: 4 rows (fable-5, claude-opus-4-8, claude-sonnet-5,
  claude-haiku-4-5), governance columns live (0021h), **no fallback chain, no
  metadata beyond display_name/flags**.
- `routing_rules`: 25 legacy task_class rows; role_slot/model_id columns live
  (0021h) but **0 slot rows**.
- `decision_log` live (Phase-5), 0 routing rows. `budget_state.hard_stopped`
  = Phase-4 hard-stop flag (COST spec: "mevcut mekanizma KALIR").
- 13 `orchestrator.*_model` keys in settings_registry (category `models`,
  editable) — spec §7: settings section must DELEGATE to routing (no double
  source).
- No fn_select_model / fn_update_routing / brain_source anywhere.

## Tasks

1. **Migration `20260713040000_e71_routing_slots.sql`** (0021x family):
   - Seed 13 role-slot rows in routing_rules (global, priority 100, model per
     the live settings-registry defaults: primary=fable-5, fast_task/low_cost=
     claude-haiku-4-5, rest=claude-opus-4-8). Legacy NOT NULL columns filled
     with slot-mirror values (`task_class='slot.<name>'` — no classifier emits
     these, kernel legacy routing unaffected).
   - Fallback chain seed: fable-5→opus→sonnet; haiku→sonnet (walk = follow
     `fallback_of`; acyclic trigger already live).
   - Catalog metadata: context_window fable-5=1000000 (measured); cost/quality
     stay NULL (zero-fabrication — LiteLLM wiring fills them, recorded);
     speed_score relative ordinal seed (CEO/QA adjustable per spec §26).
   - `fn_select_model(role_slot, department_id, risk, min_context, est_cost,
     run_id, critical, log)` — rule scan (dept-specific beats global, priority
     DESC), guardrails (status=active, banned=false, mechanical_only only on
     fast_task/low_cost), budget hard-stop gate (critical exempt), decision_log
     `routing_decision` with eliminated candidates in `alternatives`.
   - `fn_model_fallback(failed_model, role_slot, reason, run_id, critical)` —
     chain walk depth ≤4, guardrails re-applied per hop, decision_log
     `routing_fallback`; exhausted → CHAIN_EXHAUSTED + `blocked_no_model`
     outcome row.
   - `fn_update_routing(op, payload, idempotency_key)` — `assign_role` (ceo
     only) + `set_catalog_status` (ceo any / system status-only per spec §13);
     guardrails absolute (banned/testing/mechanical), audit_log + decision_log
     `routing_change` + `settings` Broadcast; control_idempotency idiom.
   - Settings delegate flip: registry delegate CHECK +'routing'; 13 model keys
     → delegate='routing' (spec §7 — single source; settings UI already renders
     delegated keys read-only; control_settings_set refuses them).
2. **Orchestrator TS**: `packages/orchestrator/src/select-model.ts` —
   `selectModel()` / `fallbackModel()` wrappers over the fns (table-reading,
   no model name in code), exported from index.
3. **Tests** `tests/e7/routing-slots.test.ts` (root vitest, sequential DB
   suite): 13 slots resolve; spec §24 smoke (execution → opus); decision_log
   rows; mechanical-on-verdict-slot elimination; banned test-row elimination
   (mechanism proof); fallback chain + exhaustion; hard-stop gate + critical
   exemption; assign_role guardrail refusals. All probes cleaned.
4. **Docs**: roadmap E7.1 row, STATE, SUMMARY; single atomic commit
   `feat(E7.1)`.

## Out of scope (recorded)

- `v_model_stats`, panel/simulator/onboard drawer → E7.2.
- §4b `agents.brain_source` + `fn_update_agent_brain` → lands with the
  employee-control surface (E7.2/E12 employee card) — needs its UI seam.
- 2-consecutive-fallback alert → E8.4b alert source.
- LiteLLM proxy runtime call path → Phase 7 VPS.

## No UI surface touched → RULE #0 design pass N/A (no visual deliverable).
