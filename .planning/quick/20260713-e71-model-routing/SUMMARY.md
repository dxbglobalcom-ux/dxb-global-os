---
type: quick
slug: e71-model-routing
status: complete
completed: 2026-07-13
author: fable-5 (inline, K1)
commit: pending (single atomic commit)
---

# Summary — E7.1: table-driven model routing

## What shipped

| # | Change | File(s) |
|---|--------|---------|
| 1 | Migration (0021x family, idempotent 2×): 13 role-slot rows in routing_rules (global, priority 100, defaults = live settings registry: primary=fable-5, fast_task/low_cost=claude-haiku-4-5, other 10=claude-opus-4-8) · model_catalog fallback chain (fable→opus→sonnet; haiku→sonnet) + metadata completion (context_window fable-5=1M measured; speed_score ordinal seed; cost/quality stay NULL — zero fabrication, LiteLLM wiring fills) · `fn_select_model` (rule scan: dept beats global, priority DESC; guardrails: active/banned/mechanical_only/context/cost-cap; budget hard-stop gate with critical exemption; decision_log `routing_decision` with eliminated candidates) · `fn_model_fallback` (chain walk ≤4, guardrails per hop, decision_log `routing_fallback`, loud CHAIN_EXHAUSTED) · `fn_update_routing` (assign_role ceo-only + set_catalog_status system-allowed, control_idempotency + audit_log + decision_log + `settings` Broadcast) · settings delegate flip: 13 `orchestrator.*_model` keys → `delegate='routing'` (spec §7 single source; CHECK extended) | `db/migrations/20260713040000_e71_routing_slots.sql` |
| 2 | Orchestrator table-reading selection: `selectModel()` / `fallbackModel()` typed wrappers (no model name in code), `ROLE_SLOTS` vocabulary, `RoutingRefusedError` | `packages/orchestrator/src/select-model.ts`, `index.ts` |
| 3 | Verification suite: 8 tests — 13-slot resolution against registry defaults (single-source proof), §24 smoke, decision_log rows, mechanical-on-verdict-slot elimination, banned-mechanism proof (Sonnet stays free), fallback chain + exhaustion, hard-stop gate + critical exemption | `tests/e7/routing-slots.test.ts` |

## Registered adaptations (spec-visible)

- A1: slot defaults follow the LIVE E6.1 registry (primary=fable-5), i.e. the spec §4 footnote applied; handover day flips fable-5 → disabled (spec §26).
- A2: catalog cost/quality columns stay NULL until LiteLLM wiring — no invented prices.
- A3: §4b (`agents.brain_source` + `fn_update_agent_brain`) deliberately NOT here — lands with its dashboard surface (E7.2/E12 employee card).

## Evidence (executed)

- Migration 2×: RUN1 `INSERT 0 13` / `UPDATE 13`; RUN2 all `0` — idempotent.
- DB battery (13 blocks): all 13 slots resolve; unknown slot → VALIDATION_FAILED; haiku-on-review eliminated `mechanical_only model on verdict-capable slot` (opus chosen); banned test-row eliminated `model banned`; assign_role as system → PERMISSION_DENIED (ceo-only); set_catalog_status as system → ok + audit 2425; fallback fable→opus decision 21, sonnet exhausted decision 22 blocked_no_model, haiku→sonnet decision 23; hard-stop: non-critical BUDGET_HARD_STOP / critical passes; marketing dept override sonnet beats global opus; delegate: 13/13 keys `routing`, control_settings_set refuses.
- CEO-actor battery (jwt-claims simulation, transactional ROLLBACK, zero residue): banned → MODEL_BANNED, testing → MODEL_NOT_ACTIVE (§4c), haiku-on-review → MODEL_MECHANICAL_ONLY, happy path assign coding→sonnet → rule updated + `fn_select_model('coding')`='claude-sonnet-5' + audit 2426; delegated key refused for ceo too; post-rollback coding restored to opus, 0 probe rows.
- `vitest run tests/e7/routing-slots.test.ts` → **8/8 passed**.
- Regression `tests/phase5/routing-data.test.ts` → 5/5 passed (5 live-SDK opt-in skips by design) — slot rows don't disturb kernel legacy task_class routing.
- `tsc --noEmit -p packages/orchestrator` → exit 0.
- Raw-key scan (spec §24/5): `grep -rn "sk-ant\|sk-or" packages/ apps/ --include="*.ts"` → **0**.
- Probe hygiene: leftover models/rules/idempotency = 0, hard_stopped restored false; decision_log/audit_log rows kept (append-only logs, same rule as every E6 battery).

## Out of scope (recorded boundaries)

- `v_model_stats` + Model Orchestration Panel + simulator + §4c onboard drawer → E7.2.
- §4b agent-brain dashboard change → with its UI seam.
- 2-consecutive-fallback alert → E8.4b alert source.
- LiteLLM proxy runtime call path (virtual keys) → Phase 7 VPS.
- No UI surface touched → RULE #0 design pass N/A.
