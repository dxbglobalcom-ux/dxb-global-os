"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { StatusBadge, type StatusLevel } from "@/components/primitives";
import {
  useDxbChannel,
  type DxbBroadcastPayload,
  type DxbStatus,
} from "@/lib/realtime";

// Live Operations feed (E3.3) — real task_events + approvals over the
// existing dxb:* Broadcast channels (0013 triggers; postgres_changes
// forbidden). Connection state is shown honestly: a stale feed says
// stale (§35 — fake liveliness is a violation). Row drill goes to the
// legacy task detail until /ops/tasks reaches parity at E12.1.

export type LiveEvent = {
  id: string;
  kind: "task" | "approval";
  task_id: string | null;
  event: string;
  to_status: string | null;
  actor: string;
  objective: string | null;
  created_at: string;
};

const STATUS_LEVEL: Record<string, StatusLevel> = {
  running: "info",
  claimed: "info",
  queued: "info",
  done: "ok",
  approved: "ok",
  failed: "danger",
  rejected: "danger",
  awaiting_approval: "warn",
  pending: "warn",
  dormant: "info",
};

function levelFor(e: LiveEvent): StatusLevel {
  return STATUS_LEVEL[e.to_status ?? e.event] ?? "info";
}

export function LiveFeed({
  initial,
  labels,
}: {
  initial: LiveEvent[];
  labels: {
    status: { connecting: string; live: string; stale: string };
    empty: string;
    note: string;
  };
}) {
  const [events, setEvents] = useState<LiveEvent[]>(initial);

  const onTaskEvent = useCallback((p: DxbBroadcastPayload) => {
    if (p.operation !== "INSERT" || !p.record) return;
    const r = p.record as Record<string, unknown>;
    setEvents((prev) =>
      [
        {
          id: `t-${r.id}`,
          kind: "task" as const,
          task_id: (r.task_id as string) ?? null,
          event: String(r.event ?? ""),
          to_status: (r.to_status as string) ?? null,
          actor: String(r.actor ?? ""),
          objective: null,
          created_at: String(r.created_at ?? new Date().toISOString()),
        },
        ...prev,
      ].slice(0, 100),
    );
  }, []);

  const onApproval = useCallback((p: DxbBroadcastPayload) => {
    if (!p.record) return;
    const r = p.record as Record<string, unknown>;
    setEvents((prev) =>
      [
        {
          id: `a-${r.id}-${String(r.status)}`,
          kind: "approval" as const,
          task_id: (r.task_id as string) ?? null,
          event: `approval.${String(r.status ?? p.operation.toLowerCase())}`,
          to_status: (r.status as string) ?? null,
          actor: String(r.action_type ?? "approval"),
          objective: null,
          created_at: String(r.created_at ?? new Date().toISOString()),
        },
        ...prev,
      ].slice(0, 100),
    );
  }, []);

  const taskState = useDxbChannel("task_events", onTaskEvent);
  const approvalState = useDxbChannel("approvals", onApproval);

  const worst: DxbStatus =
    taskState.status === "stale" || approvalState.status === "stale"
      ? "stale"
      : taskState.status === "connecting" || approvalState.status === "connecting"
        ? "connecting"
        : "live";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <StatusBadge
          level={worst === "live" ? "ok" : worst === "stale" ? "danger" : "info"}
        >
          {labels.status[worst]}
        </StatusBadge>
        <span className="text-caption text-ink-muted">{labels.note}</span>
      </div>

      {events.length === 0 ? (
        <p className="text-body-s text-ink-secondary">{labels.empty}</p>
      ) : (
        <ul className="divide-y divide-edge-neutral">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={e.task_id ? `/tasks/${e.task_id}` : "/approvals"}
                className="flex h-10 items-center gap-3 px-2 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
              >
                <span className="font-data text-caption text-ink-muted tabular-nums">
                  {new Date(e.created_at).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <StatusBadge level={levelFor(e)}>
                  {e.to_status ?? e.event}
                </StatusBadge>
                <span className="truncate text-body-s text-ink-primary">
                  {e.objective ?? e.event}
                </span>
                <span className="ml-auto shrink-0 text-caption text-ink-muted">
                  {e.actor}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
