---
type: quick
slug: e84b-alert-center
created: 2026-07-13
author: fable-5 (inline, K1)
roadmap: E8.4b
---

# Execution ticket — E8.4b: Notification/Alert center (GAP-10)

**Spec pointers (the plan — no new design here):**
- OBSERVABILITY_SPEC §3 (eşik ihlali → alerts INSERT → alerts Broadcast), §4
  `alerts` + `system_health_snapshots` tables (0022x family), §5 `AlertCenter`
  /alerts + sağ ray, §6 thresholds in settings, §8 `POST /api/control/alerts
  {op:'ack'|'resolve'}`, §9 alert insert/ack/resolve → `alerts` channel
  `{alert_id, level, title}`, §13 ceo yalnız ack/resolve, §17 flush-failure →
  High alert, §21 alert levels carry directive fields, §26/§27 storm+disk
  thresholds (%80/%90 disk, 30dk uzun koşu).
- COST_CONTROL_SPEC R4/§3: %70 Attention, %90 High, %100 non-critical
  hard-stop → Critical (hard-stop mechanism itself = Phase 4, KALIR).
- MODEL_ROUTING_SPEC §9/§17: 2 ardışık fallback → High; zincir tükendi →
  Critical.
- CEO_COMMAND_CENTER_SPEC §4 `v_alerts_active` (alerts + approvals
  risk=critical), §7 alert kartı → kaynak modül, §9 alerts channel consumers.
- API_CONTRACTS row `alerts`: acknowledge, mute → `control_alerts_*`.
- EVENT_MODEL §9a envelope (packages/shared/src/contracts/events.ts, entity
  kind `alert` already registered).
- GAP-AUDIT GAP-10: alarm sahipliği/acknowledge/escalation tanımsız → THIS row
  defines them.
- Roadmap acceptance: alerts sayfası gerçek kayıt listeler; ack → audit satırı.

**Verified live baseline (2026-07-13):**
- `alerts` / `system_health_snapshots` tables DO NOT exist (checked live DB).
- `/alerts` = ModuleWaiting (`pageKey="alerts" step="E8.3"`).
- IntelligenceRail alerts panel = honest placeholder (E2.1 slice).
- alert.raised producer today: `control_audit_mark_reviewed` broadcasts
  DIRECTLY (no table row) — E8.4 boundary said /alerts center → E8.4b.
- Open boundaries owed to this row: E8.1 flush-failure alert; E7.1 2-fallback
  alert.
- budget_state: monthly_cap_eur 100.00, hard_stopped/breaker_tripped flags.
- No health.*/alerts.* settings keys exist.
- pgboss schema live; resident worker = Phase 7 (R3: no new resident service).

**Recorded interpretations / registered adaptations (also appended to
OBSERVABILITY_SPEC §4 adaptation note — CEO-visible):**
1. alerts table gets additive columns beyond spec §4: `dedup_key` (unique
   partial index WHERE resolved_at IS NULL — storm dedup, §26), `run_id` /
   `task_id` / `source_ref jsonb` (the §12 "gevşek bağ" made concrete: corr
   chain for envelope + drill target), `escalated_at`/`escalated_from`
   (GAP-10 escalation), `muted_until` (API_CONTRACTS `mute` op = per-alert
   escalation/visibility snooze).
2. Escalation defined (GAP-10 assignment): unacknowledged alert older than
   per-level deadline (settings `alerts.escalate_after_minutes`, global
   default {attention:240, high:60, critical:15}) → level bumped one step
   (attention→high→critical→emergency), `escalated_from` keeps origin,
   alert.escalated broadcast. Swept by `fn_alerts_evaluate`.
3. Time-based checks (queue age, heartbeat loss, escalation sweep) live in
   `fn_alerts_evaluate()` — Phase-7 pg-boss 'alert-evaluate' job adopts it
   (R3). Until then callable by tests/dev; NOT a fake liveness claim.
4. Heartbeat source = `system_health_snapshots` freshness (table created now,
   0022x completion; probe job = Phase 7). Empty table → no heartbeat alert
   (probe never started — honest pre-Phase-7 state).
5. alert.raised/acknowledged/resolved/escalated broadcasts come from ONE
   producer: alerts-table trigger. `control_audit_mark_reviewed` refit:
   flagged review now INSERTs alerts row (trigger broadcasts) instead of
   direct notify_broadcast — §9 wording ("reviewed_flagged → alert.raised")
   preserved, E8.4 test updated to the trigger envelope.
6. Cost thresholds are directive constants (70/90/100 — COST R4), not
   settings; queue-age/heartbeat/escalation deadlines ARE settings (OBS §6).

**Deliverables:**
1. Migration `20260713080000_e84b_alerts.sql`: alerts + system_health_snapshots
   tables (RLS read authenticated, writes fn/trigger-only) · broadcast trigger
   (raised/acknowledged/resolved/escalated) · source triggers: agent_runs
   failed, cost_ledger threshold (dedup per month+pct), budget_state
   hard-stop/breaker · fn_model_fallback refit (≥2 hops High, exhausted
   Critical) · control_audit_mark_reviewed refit (interp 5) ·
   `fn_alerts_evaluate()` (queue age, heartbeat, escalation) ·
   `control_alerts_action` (ack/resolve/assign/mute; idempotent; audit row
   canonical detail_ref) · v_audit_trail + alerts family branch ·
   `v_alerts_active` (alerts ∪ approvals critical, severity+age order) ·
   settings keys alerts.queue_age_max_minutes / alerts.heartbeat_max_seconds /
   alerts.escalate_after_minutes.
2. packages/observability spill path: best-effort High alert row (E8.1 debt).
3. `/api/control/alerts` route (models-route idiom).
4. `/alerts` page (ModuleWaiting dies): AlertCenter — level colors, filters
   (level/status/source), ack/resolve/mute actions, resolved history, drill
   per source_ref; GovTabs-style none (single route).
5. IntelligenceRail: real alerts panel (v_alerts_active top-5, live via
   `alerts` Broadcast subscription — realtime.ts + "alerts" channel).
6. i18n command.alerts EN/TR; parity guard.

**Evidence contract:**
- vitest `tests/e8/alerts.test.ts`: every source fires (run-fail, cost 70/100
  dedup, fallback ≥2, exhausted, flagged review) · evaluate fn (queue age,
  heartbeat stale, empty-snapshot skip, escalation bump) · ack → audit row
  (ROADMAP ACCEPTANCE) + broadcast · idempotency replay/mismatch · anon zero
  grant · authenticated direct UPDATE denied · v_alerts_active ordering.
- E8.4 audit-surface test updated + green; full e7+e8+phase5+6 regression.
- tsc -b 0 · dashboard tsc --noEmit 0 · i18n purity PASS.
- RULE #0: /alerts EN+TR × 1280+1920 + rail; baselines alerts-*.png + INDEX.
- In-browser roadmap acceptance: /alerts lists real records; ack from UI →
  audit satırı görünür (/gov/audit).

**Boundaries (future rows, not gaps):**
- pg-boss 'alert-evaluate' + 'health-probe' + cost-guard jobs → Phase 7 worker.
- SystemHealthBoard /sys/health + 10.6 indicators → own row.
- CommandBar critical-alert badge → CommandBar row (CCC).
- LiteLLM proxy budget sync alerts → Phase 7.
- Anomaly (3σ) alert → cost-anomaly job, Phase 7.
