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
};

export type LiveEvent = {
  id: string;
  kind: "task" | "approval" | "run" | "decision";
  task_id: string | null;
  event: string;
  to_status: string | null;
  actor: string;
  objective: string | null;
  created_at: string;
};

export function mapLiveOpsRow(r: LiveOpsRow): LiveEvent {
  return {
    id: `${r.source === "run" ? "r" : "t"}-${r.source_id}`,
    kind: r.source === "run" ? "run" : "task",
    task_id: r.task_id,
    event: r.event,
    to_status: r.status,
    actor: r.actor,
    objective: r.label,
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
      objective: (env.payload.model as string) ?? null,
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
      objective: null,
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
      objective: (env.payload.kind as string) ?? null,
      created_at: env.ts,
    };
  }
  return null; // unknown ops:live type — types are append-only, ignore quietly
}
