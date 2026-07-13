---
type: quick
slug: e84b-alert-center
closed: 2026-07-13
author: fable-5 (inline, K1)
roadmap: E8.4b
---

# Summary — E8.4b: Notification/Alert center (GAP-10)

## Delivered

1. **Migration `20260713080000_e84b_alerts.sql`** (applied 2× idempotent):
   `alerts` + `system_health_snapshots` (0022x family completion; adaptations
   A1-A5 registered in OBSERVABILITY_SPEC §4 note) · `trg_alerts_broadcast` —
   the ONE alerts-channel producer (raised/acknowledged/resolved/escalated,
   §9a envelope, §15 broadcast failure never blocks the write) · real alarm
   sources: agent_runs-failed trigger, cost 70/90/100 thresholds (COST R4
   directive constants, per-month dedup), budget hard-stop + velocity breaker,
   `fn_model_fallback` refit (≥2 hops High / chain exhausted Critical —
   ROUTING §9/§17, E7.1 debt), `control_audit_mark_reviewed` refit (flagged
   review INSERTs the alerts row; single-producer discipline) ·
   `fn_alerts_evaluate()` — queue age / heartbeat loss / escalation sweep
   (settings-driven: `alerts.queue_age_max_minutes` 30,
   `alerts.heartbeat_max_seconds` 300, `alerts.escalate_after_minutes`
   {attention 240, high 60, critical 15}; Phase-7 pg-boss 'alert-evaluate'
   adopts — R3 no new resident service) · `control_alerts_action`
   (ack/resolve/assign/mute; idempotent; audit row with canonical detail_ref;
   resolved-wall) · `v_alerts_active` (severity → unacked → age, muted hidden,
   ∪ pending critical approvals per CC-SPEC §4) · v_audit_trail + alerts
   family branch.
2. **packages/observability**: spill path now raises a best-effort High alert
   (`dedup obs-spill`) — E8.1 boundary debt paid; `alerts` in @dxb/shared
   db-types.
3. **`/api/control/alerts`** (models-route idiom) · **`/alerts`** AlertCenter
   (ModuleWaiting died): active/resolved views, level+source filters,
   ack/resolve/mute/assign actions, per-source drill map (CC-SPEC §7),
   `alerts` Broadcast → debounced server refetch · **IntelligenceRail** alerts
   panel = real head of v_alerts_active, live via the same channel
   (realtime.ts +`alerts`).
4. i18n `command.alerts` + rail `alertsEmpty` + audit `entities.alerts`
   EN/TR (parity 830 = 830).

## Evidence (all executed)

- `tests/e8/alerts.test.ts` **12/12**: run-fail alert + envelope corr · cost
  70/90/100 each once + dedup (ROLLBACK probe, zero residue) · budget flags →
  critical · fallback depth-2 High + exhausted Critical (ROLLBACK) · evaluate
  fn: queue-age attention + heartbeat-loss high + empty-snapshots honest skip
  + single-step escalation with alert.escalated · **ack → audit satırı +
  v_audit_trail alerts drill (ROADMAP ACCEPTANCE)** · resolve/assign/mute +
  resolved-wall · idempotent replay + IDEMPOTENCY_MISMATCH + exactly one
  audit row · anon zero grant, evaluate ceo-blocked, authenticated direct
  UPDATE `permission denied` · view ordering + mute-hide + approval leg.
- E8.4 `audit-surface.test.ts` updated to the single-producer envelope, 8/8.
- Full regression e7+e8+phase5+phase6: **17 files, 110 passed / 0 failed,
  twice consecutively** + `SELECT count(*) FROM alerts` → **0 after a full
  regression run** (suites now self-clean their induced alerts).
- `tsc -b` 0 · dashboard `tsc --noEmit` 0 · i18n purity PASS.
- **In-browser acceptance**: real queue-age alert (9 genuinely stale battery
  tasks, oldest 2026-07-09) listed on /alerts → ack from the UI with a note →
  `audit_log` row `alert.ack` actor=ceo → /gov/audit top row drills to the
  alerts family record. Probe ack reverted afterwards (eye-test mutation
  hygiene memory) — the alert waits unacknowledged for the CEO.
- RULE #0 pass: /alerts + rail EN+TR × 1280+1920 real browser; TR drill
  labels verified; baselines `alerts-*.png` in INDEX (PENDING CEO eye).

## Fixed in-pass (rule 5 / broken = fix now)

- **Suite-induced alert pollution**: E8.4b's new triggers turned existing
  test batteries into alert factories (run-fail probes, e7 hard-stop toggle,
  fallback probes, obs spill). Extended afterAll cleanups in 8 suites
  (e7 routing-slots, e8 obs-wrapper/ops-live/log-decision/audit-surface,
  phase5 ladder/decompose/council, phase6 context-rot) — proven by
  alerts=0 after a full regression run. Swept 5 pre-patch orphan alerts +
  16 aborted-cleanup residue rows (old battery Live-Ops rows untouched).

## Recorded interpretations

Ticket `.planning/quick/20260713-e84b-alert-center/PLAN.md` §interpretations;
spec-side note appended to OBSERVABILITY_SPEC §4 (A1-A5). Notable: alert
title/cause strings are ENGLISH system artifacts (language directive), UI
chrome fully bilingual — same data-vs-chrome rule as audit payloads.

## Boundaries recorded (future rows, not gaps)

- pg-boss `alert-evaluate` + `health-probe` + `cost-guard`/rollup/anomaly
  jobs → Phase 7 resident worker (fn seams ready).
- SystemHealthBoard `/sys/health` (10.6's 12 indicators) → own E8/E12 row.
- CommandBar critical-alert badge → CCC CommandBar row.
- LiteLLM budget-sync alert → Phase 7.
