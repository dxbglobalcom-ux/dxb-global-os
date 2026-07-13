---
type: quick
slug: e83-ops-live
closed: 2026-07-13
author: fable-5 (inline, K1)
roadmap: E8.3
---

# Summary — E8.3: `ops:live` Broadcast triggers + Live Ops v2

## Delivered

1. **Envelope contract** `packages/shared/src/contracts/events.ts` — EVENT_MODEL
   §9a Zod (single normative source, §20), §9b channel list, ops:live type list.
   `entity.kind` +`decision` (registered additive append, ticket).
2. **Migration `20260713060000_e83_ops_live_triggers.sql`** (0022x family) —
   `fn_opslive_notify` (pg_notify + 8000-byte guard) + 3 envelope-building
   triggers: agent_runs (run.started/progressed/waiting_approval/paused/
   cancelled/succeeded/failed), task_events (task.event_appended), decision_log
   (decision.logged, OBSERVABILITY §9 payloads). §15 log+continue: trigger
   never blocks the source write. Applied 2× idempotent.
3. **Collector** `packages/orchestrator/src/ops-live-collector.ts` — LISTEN
   dxb_ops_live, 1 s window (§9b), n=1 verbatim / n>1 payload.batch (§18),
   publishes via notify_broadcast('ops:live'); loss-tolerant (§17). §26 held:
   no new resident service — dev host `scripts/dev/ops-live-collector.mjs`;
   Phase-7 resident worker adopts it (boundary).
4. **Probe** `scripts/dev/event-probe.mjs` (§24) — real CEO session on the
   private channel (proves §13 RLS join), prints envelopes as JSON lines.
5. **Live Ops v2** — realtime.ts +ops:live (generic payload), live-feed.tsx
   consumes envelopes (batch unwrap, run/task/decision mapping, objective
   backfill from rendered events), §10 reconnect snapshot re-fetch;
   `lib/live-ops.ts` shared mapper (RSC + client identical); note strings
   EN/TR updated. `@dxb/shared` gains `createListenClient` (single-access-path
   rule holds — structural ListenClient type, pg never leaks).

## Evidence (all executed)

- §24 sequence: trigger list shows `trg_broadcast_opslive_{runs,task_events,decisions}`;
  probe printed `{"type":"task.event_appended",…}` within the window (raw line in ticket log).
- `tests/e8/ops-live.test.ts` **6/6**: §9a Zod on every envelope · run.* type map ·
  decision corr via run FK · **10 rapid INSERTs → ≤2 publishes, batch=10** (§21) ·
  single event verbatim (§24 contract) · real claim path dispatch→runWorkerOnce→
  run.started+run.succeeded+task.event_appended on the channel.
- Full regression e7+e8+phase5+phase6: **15 files, 90 passed / 0 failed** · `tsc -b` 0 ·
  dashboard `tsc --noEmit` 0 · `i18n-purity-check.sh` PASS.
- RULE #0 pass: /live EN+TR × 1280+1920 rendered in real browser; live-delivery
  proven in-browser (agent_runs INSERT → row at feed top, no reload, 15:02:35);
  baselines `references/design-bank/live-*.png` + INDEX rows (PENDING CEO eye).

## Fixed in-pass (spec-gap rule 5 / "broken = fix now")

- **routing_rules coding slot drift**: found `coding=fable-5` (decision_log 340,
  12:26 — E7.2 design-pass panel demo left unreconciled). Restored to registry
  default `claude-opus-4-8` through the governed path (fn_update_routing as ceo,
  audit 2895, rationale records the reconciliation). E7.1 battery green again —
  the battery did its designed job (fails loudly on registry divergence).
  Follow-up discipline: panel demo mutations in eye-tests must be restored
  before session close.
- Stray `ops-live-collector.mjs` from the §24 acceptance run duplicated
  publishes and flaked the debounce test — killed; test additionally hardened
  to count only its own task's publishes (parallel-suite safe).

## Boundaries recorded (future rows, not gaps)

- Collector into resident worker loop → Phase 7 (dev script until then).
- Health snapshot events on ops:live (60 s) → E8 health probe row.
- `alerts` channel + flush-failure alert → E8.4b.
- Decision drill target /gov/decisions parity → E8.4.
- run row drill `/ops/tasks/[id]` → E12.1 (legacy /tasks/[id] until then).
