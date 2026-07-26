// Live Ops shared shapes (server snapshot + client refetch use the same
// mapping — EVENT_MODEL §10 reconnect re-fetch must render identically to
// the RSC first paint). Plain module: imported by both the RSC page and the
// client LiveFeed island.

export type LiveOpsRow = {
  source: "run" | "task_event";
  source_id: string;
  ts: string;
  status: string | null;
  task_id: string | null;
  workflow_run_id: string | null;
  actor: string;
  event: string;
  label: string | null;
  label_tr: string | null;
};

export type LiveEvent = {
  id: string;
  kind: "task" | "approval" | "run" | "decision";
  task_id: string | null;
  event: string;
  to_status: string | null;
  actor: string;
  /** Short headline, artifact language (tasks.label). NOT the objective: a
   *  task objective is the worker's instruction and can run to a page. */
  label: string | null;
  /** Same headline on the CEO's Turkish page (tasks.label_tr). */
  label_tr: string | null;
  created_at: string;
};

/** The one line a feed row shows, per locale. Turkish page prefers the Turkish
 *  headline and falls back to the artifact one — a fallback the CEO can read is
 *  better than a blank row, and the view already resolves most of them. */
export function lineFor(e: LiveEvent, locale: string): string | null {
  return (locale === "tr" ? (e.label_tr ?? e.label) : e.label) ?? null;
}

export function mapLiveOpsRow(r: LiveOpsRow): LiveEvent {
  return {
    id: `${r.source === "run" ? "r" : "t"}-${r.source_id}`,
    kind: r.source === "run" ? "run" : "task",
    task_id: r.task_id,
    event: r.event,
    to_status: r.status,
    actor: r.actor,
    label: r.label,
    label_tr: r.label_tr,
    created_at: r.ts,
  };
}

// ops:live §9a envelope as read by the cockpit. The normative Zod schema is
// packages/shared/src/contracts/events.ts (EVENT_MODEL §20) — the dashboard
// has no @dxb/shared dependency, so this mirrors the read-only fields only.
export type OpsLiveEnvelope = {
  event_id: string;
  ts: string;
  type: string;
  actor: string;
  entity: { kind: string; id: string };
  corr: {
    task_id: string | null;
    run_id: string | null;
    workflow_run_id: string | null;
    project_id: string | null;
  };
  payload: Record<string, unknown> & { batch?: OpsLiveEnvelope[] };
};

// §18 storm rule: a batched publish carries every debounced event in
// payload.batch; a single event arrives verbatim.
export function unwrapOpsLive(message: unknown): OpsLiveEnvelope[] {
  const env = message as OpsLiveEnvelope | null;
  if (!env || typeof env !== "object" || typeof env.type !== "string") return [];
  if (Array.isArray(env.payload?.batch)) return env.payload.batch;
  return [env];
}

export function mapOpsLiveEnvelope(env: OpsLiveEnvelope): LiveEvent | null {
  if (env.type.startsWith("run.")) {
    return {
      id: `r-${env.entity.id}-${env.type}-${env.event_id}`,
      kind: "run",
      task_id: env.corr.task_id,
      event: env.type,
      to_status: (env.payload.status as string) ?? null,
      actor: (env.payload.employee as string) ?? env.actor,
      // A run envelope carries the model, not the work's headline; the feed
      // borrows the headline from an already-rendered event of the same task.
      label: (env.payload.model as string) ?? null,
      label_tr: null,
      created_at: env.ts,
    };
  }
  if (env.type === "task.event_appended") {
    return {
      id: `t-${env.payload.task_event_id ?? env.event_id}`,
      kind: "task",
      task_id: env.corr.task_id,
      event: (env.payload.event as string) ?? env.type,
      to_status: (env.payload.to_status as string) ?? null,
      actor: env.actor,
      label: null,
      label_tr: null,
      created_at: env.ts,
    };
  }
  if (env.type === "decision.logged") {
    return {
      id: `d-${env.payload.decision_id ?? env.event_id}`,
      kind: "decision",
      task_id: env.corr.task_id,
      event: env.type,
      to_status: null,
      actor: env.actor,
      label: (env.payload.kind as string) ?? null,
      label_tr: null,
      created_at: env.ts,
    };
  }
  return null; // unknown ops:live type — types are append-only, ignore quietly
}
