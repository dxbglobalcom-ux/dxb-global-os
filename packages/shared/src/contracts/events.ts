// EVENT_MODEL §9a envelope + §9b channel catalog — THE single normative
// schema source for live events (EVENT_MODEL §20 names this file). Producers
// (DB triggers, collector) and tests validate against these schemas; the
// dashboard reads envelopes structurally (no @dxb/shared dependency there —
// the schema here stays authoritative, UI types mirror read-only fields).
import { z } from "zod";

// §9b catalog — adding a channel = adding a row to the spec table first.
export const DXB_CHANNELS = [
  "ops:live",
  "approvals",
  "alerts",
  "settings",
  "org",
  "projects",
  "cost",
  "system",
] as const;
export type DxbChannel = (typeof DXB_CHANNELS)[number];

// §9a entity kinds. `decision` is a registered additive append (E8.3 ticket:
// decision_log events on ops:live per OBSERVABILITY_SPEC §9 need an entity;
// appending an enum value = the same freedom as appending a type — field
// deletion/meaning change stays the ⛔ case).
export const EntityKind = z.enum([
  "task",
  "run",
  "workflow_run",
  "employee",
  "setting",
  "approval",
  "alert",
  "project",
  "library_item",
  "decision",
]);
export type EntityKind = z.infer<typeof EntityKind>;

// Naming rule §9b: `entity.verb_past`, English, snake_case.
export const EventType = z
  .string()
  .regex(/^[a-z][a-z_]*\.[a-z][a-z_]*$/, "type must be entity.verb_past snake_case");

export const EventEnvelope = z.object({
  event_id: z.string().uuid(),
  ts: z.string().min(1), // timestamptz ISO from Postgres now()
  type: EventType,
  actor: z.string().min(1), // 'ceo' | 'system' | 'employee:<id>' | free actor slug
  entity: z.object({ kind: EntityKind, id: z.string().min(1) }),
  corr: z.object({
    task_id: z.string().uuid().nullable(),
    run_id: z.string().uuid().nullable(),
    workflow_run_id: z.string().uuid().nullable(),
    project_id: z.string().uuid().nullable(),
  }),
  payload: z.record(z.string(), z.unknown()),
});
export type EventEnvelope = z.infer<typeof EventEnvelope>;

// §18 storm rule: batched publish = the same envelope shape carrying every
// debounced event in payload.batch (E8.3 recorded interpretation: outer
// envelope = latest event's, single event publishes verbatim so the §24
// probe output stays exact).
export const OpsLiveBatchPayload = z.object({
  batch: z.array(EventEnvelope).min(2),
});

export const OpsLiveMessage = EventEnvelope; // batch or single — same envelope

// ops:live types currently produced (append-only list; §9b + OBSERVABILITY §9):
export const OPS_LIVE_TYPES = [
  "run.started",
  "run.progressed",
  "run.waiting_approval",
  "run.paused",
  "run.cancelled",
  "run.succeeded",
  "run.failed",
  "task.event_appended",
  "decision.logged",
] as const;
export type OpsLiveType = (typeof OPS_LIVE_TYPES)[number];
