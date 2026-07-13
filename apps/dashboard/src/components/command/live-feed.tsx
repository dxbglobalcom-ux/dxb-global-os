"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBadge, type StatusLevel } from "@/components/primitives";
import {
  useDxbChannel,
  type DxbBroadcastPayload,
  type DxbStatus,
} from "@/lib/realtime";
import {
  mapLiveOpsRow,
  mapOpsLiveEnvelope,
  unwrapOpsLive,
  type LiveEvent,
  type LiveOpsRow,
} from "@/lib/live-ops";
import { createClient } from "@/lib/supabase/client";

// Live Operations v2 (E8.3) — the agent-run stream rides the EVENT_MODEL §9b
// ops:live channel (§9a envelopes, 1 s collector batches unwrapped here);
// approvals stay on their 0013 channel. Reconnect contract §10/§21: when the
// channel comes back from stale, the v_live_ops snapshot is re-fetched so the
// feed is consistent within 10 s (missed Broadcasts already live in the
// source tables). Connection state is shown honestly: a stale feed says
// stale (§35 — fake liveliness is a violation). Row drill goes to the
// legacy task detail until /ops/tasks reaches parity at E12.1.

export type { LiveEvent } from "@/lib/live-ops";

const STATUS_LEVEL: Record<string, StatusLevel> = {
  running: "info",
  claimed: "info",
  queued: "info",
  done: "ok",
  succeeded: "ok",
  approved: "ok",
  failed: "danger",
  rejected: "danger",
  cancelled: "danger",
  awaiting_approval: "warn",
  waiting_approval: "warn",
  paused: "warn",
  pending: "warn",
  dormant: "info",
};

function levelFor(e: LiveEvent): StatusLevel {
  return STATUS_LEVEL[e.to_status ?? e.event] ?? "info";
}

function prepend(prev: LiveEvent[], next: LiveEvent[]): LiveEvent[] {
  const seen = new Set(prev.map((e) => e.id));
  const fresh = next.filter((e) => !seen.has(e.id));
  if (fresh.length === 0) return prev;
  // Run envelopes carry model/status only (OBSERVABILITY §9 payload contract);
  // borrow the task objective from an already-rendered event of the same task
  // so the human line stays readable without an extra query.
  for (const e of fresh) {
    if (e.objective === null && e.task_id) {
      const known = prev.find((p) => p.task_id === e.task_id && p.objective);
      if (known?.objective) e.objective = known.objective;
    }
  }
  return [...fresh, ...prev].slice(0, 100);
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
  const wasStale = useRef(false);

  const onOpsLive = useCallback((message: unknown) => {
    const mapped = unwrapOpsLive(message)
      .map(mapOpsLiveEnvelope)
      .filter((e): e is LiveEvent => e !== null);
    if (mapped.length > 0) {
      // Collector batches oldest→newest; the feed renders newest first.
      setEvents((prev) => prepend(prev, mapped.reverse()));
    }
  }, []);

  const onApproval = useCallback((p: DxbBroadcastPayload) => {
    if (!p.record) return;
    const r = p.record as Record<string, unknown>;
    setEvents((prev) =>
      prepend(prev, [
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
      ]),
    );
  }, []);

  // §10 reconnect: stale → live means Broadcasts may have been missed —
  // re-fetch the snapshot (source truth) and merge; the RSC first paint and
  // this re-fetch use the same v_live_ops mapping.
  const refetchSnapshot = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("v_live_ops")
      .select("*")
      .order("ts", { ascending: false })
      .order("source_id", { ascending: false })
      .limit(40);
    if (data) {
      setEvents(((data as unknown as LiveOpsRow[]).map(mapLiveOpsRow)));
    }
  }, []);

  const opsState = useDxbChannel<unknown>("ops:live", onOpsLive);
  const approvalState = useDxbChannel("approvals", onApproval);

  useEffect(() => {
    if (opsState.status === "stale") {
      wasStale.current = true;
    } else if (opsState.status === "live" && wasStale.current) {
      wasStale.current = false;
      void refetchSnapshot();
    }
  }, [opsState.status, refetchSnapshot]);

  const worst: DxbStatus =
    opsState.status === "stale" || approvalState.status === "stale"
      ? "stale"
      : opsState.status === "connecting" || approvalState.status === "connecting"
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
                href={
                  e.task_id
                    ? `/tasks/${e.task_id}`
                    : e.kind === "run"
                      ? "/ops/runtime"
                      : e.kind === "approval"
                        ? "/approvals"
                        : "/ops/runtime"
                }
                className="flex h-10 items-center gap-3 px-2 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
              >
                <span className="font-data text-caption text-ink-muted tabular-nums">
                  {/* 24h — language-neutral (RULE #0 purity) */}
                  {new Date(e.created_at).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hourCycle: "h23",
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
