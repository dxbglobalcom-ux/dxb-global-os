---
type: quick
slug: e83-ops-live
created: 2026-07-13
author: fable-5 (inline, K1)
roadmap: E8.3
spec: HOLDING-OS-MASTER-PLAN/EVENT_MODEL.md (§5, §9, §13-18, §24, §26) + OBSERVABILITY_SPEC.md §9 + CEO_COMMAND_CENTER_SPEC.md §9
---

# Plan — E8.3: `ops:live` Broadcast triggers + Live Ops v2 live agent stream

## Scope (roadmap E8.3 verbatim)

`ops:live` Broadcast triggers + Live Ops v2 live agent stream.
Acceptance: EVENT_MODEL §24 probe command.

## Live baseline (verified)

- `notify_broadcast(channel, type, payload)` live (0025x) — single publish door,
  `dxb:` prefix, RLS policy `dxb_ceo_broadcast_read` (0013) covers `dxb:%`.
- 0013 triggers live: `trg_broadcast_task_events/approvals/cost_ledger`
  (broadcast_changes shape, LOCKED channels — stay).
- Obs tables live (0022x): agent_runs (status CHECK: running/waiting_approval/
  paused/cancelled/failed/succeeded), decision_log, tool_calls, file_changes.
- E8.1 runScope + E8.2 logDecision write the source-truth rows.
- `apps/dashboard` Live page = E4.5 v_live_ops snapshot + dxb:task_events
  delta; comment says "ops:live arrives at E8.3".
- `packages/shared/src/contracts/events.ts` does NOT exist yet (EVENT_MODEL
  §20 names it as the single envelope source) — first producer lands here,
  so the contract file is THIS row's work, not a prior-row gap.
- No supabase CLI in PATH; established idiom = `docker exec supabase_db_DxB_Global_OS psql`.

## Tasks (all spec-pointed, zero new design)

1. `packages/shared/src/contracts/events.ts` — §9a envelope Zod (single source).
2. Migration `20260713060000_e83_ops_live_triggers.sql`: envelope-building
   triggers on agent_runs / task_events / decision_log → `pg_notify('dxb_ops_live', envelope)`
   (§26 decision: NOTIFY collector, no new resident service; §15: trigger
   logs+continues, never blocks the write). Names `trg_broadcast_opslive_*`
   (§24 probe lists `trg_broadcast_%`).
3. `packages/orchestrator/src/ops-live-collector.ts` — LISTEN collector,
   1 s window (§9b debounce), flush through `notify_broadcast('ops:live', …)`;
   n=1 → envelope verbatim (§24 probe contract), n>1 → same envelope +
   `payload.batch=[...]` (§18).
4. `scripts/dev/event-probe.mjs` (named by §24) + `scripts/dev/ops-live-collector.mjs`.
5. Live Ops v2: `realtime.ts` + `live-feed.tsx` consume `ops:live` envelopes
   (runs + task events + decisions, batch unwrap) + reconnect snapshot
   re-fetch (§10/§21 10 s consistency).
6. Tests `tests/e8/ops-live.test.ts` + full regression + tsc.

## Interpretations recorded (not deviations)

- §18 batch wording "aynı zarf, çoklu olay" → outer message = latest event's
  envelope carrying `payload.batch=[all envelopes]`; single event publishes
  verbatim (keeps §24 probe output exact).
- Envelope `entity.kind` gains `decision` (additive append — same freedom as
  type append §9b; field deletion/meaning change would be the ⛔ case).
- OBSERVABILITY §9 wants decision events on `ops:live` → `decision.logged`.

## Evidence contract

- §24 sequence executed verbatim (triggers listed, probe prints
  `{"type":"task.event_appended",…}` within debounce window).
- §21 debounce measure: 10 rapid INSERTs → ≤2 publishes (realtime.messages count).
- Envelope Zod validation green for every published type.
- Full regression + `tsc -b` 0.
- RULE #0 Design Verification Pass on /live (EN+TR × ≥2 widths + checklist + i18n purity).
