"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
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

// Live Operations v3 (C3/C6/C19 remediation 2026-07-19) — one collapsed row
// per task (the lifecycle chain folds into its latest state); clicking a row
// expands the full chain INLINE below it. No drill into the retired legacy
// task page. Statuses render through the i18n status dictionary — raw enums
// never reach the CEO's eye. Stream contract unchanged: EVENT_MODEL §9b
// ops:live channel + approvals channel, §10 stale→live snapshot re-fetch.

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

function statusKey(e: LiveEvent): string {
  const raw = e.to_status ?? e.event;
  // Event strings like "approval.approved" resolve on their last segment.
  return raw.includes(".") ? (raw.split(".").pop() as string) : raw;
}

function levelFor(e: LiveEvent): StatusLevel {
  return STATUS_LEVEL[statusKey(e)] ?? "info";
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

type FeedGroup = { key: string; latest: LiveEvent; chain: LiveEvent[] };

// Newest-first event list → one group per task (standalone events group alone).
function groupEvents(events: LiveEvent[]): FeedGroup[] {
  const byKey = new Map<string, FeedGroup>();
  const groups: FeedGroup[] = [];
  for (const e of events) {
    const key = e.task_id ?? e.id;
    const existing = byKey.get(key);
    if (existing) {
      existing.chain.push(e);
      if (!existing.latest.objective && e.objective) {
        existing.latest = { ...existing.latest, objective: e.objective };
      }
    } else {
      const group: FeedGroup = { key, latest: e, chain: [e] };
      byKey.set(key, group);
      groups.push(group);
    }
  }
  return groups;
}

function timeShort(iso: string): string {
  // 24h — language-neutral (RULE #0 purity)
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
}

export function LiveFeed({
  initial,
  labels,
  statusLabels,
}: {
  initial: LiveEvent[];
  labels: {
    status: { connecting: string; live: string; stale: string };
    empty: string;
    note: string;
    steps: string;
    approvalsLink: string;
    runNoLabel: string;
  };
  statusLabels: Record<string, string>;
}) {
  const [events, setEvents] = useState<LiveEvent[]>(initial);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const wasStale = useRef(false);

  const statusText = useCallback(
    (e: LiveEvent) => {
      const key = statusKey(e);
      return statusLabels[key] ?? key.replace(/[._]/g, " ");
    },
    [statusLabels],
  );

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

  const groups = groupEvents(events);

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

      {groups.length === 0 ? (
        <p className="text-body-s text-ink-secondary">{labels.empty}</p>
      ) : (
        <ul className="divide-y divide-edge-neutral">
          {groups.map((g) => {
            const open = openKey === g.key;
            const hasChain = g.chain.length > 1;
            return (
              <li key={g.key}>
                <button
                  type="button"
                  onClick={() => setOpenKey(open ? null : g.key)}
                  aria-expanded={open}
                  className="flex h-10 w-full items-center gap-3 px-2 text-left transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
                >
                  {open ? (
                    <CaretDownIcon size={12} className="shrink-0 text-ink-muted" />
                  ) : (
                    <CaretRightIcon size={12} className="shrink-0 text-ink-muted" />
                  )}
                  <span className="font-data text-caption text-ink-muted tabular-nums">
                    {timeShort(g.latest.created_at)}
                  </span>
                  <StatusBadge level={levelFor(g.latest)}>
                    {statusText(g.latest)}
                  </StatusBadge>
                  {/* Full wrap, never "…"; a label-less run row says WHAT it
                      is instead of echoing the status chip (CEO catch: the
                      "Running Running" info-free line). */}
                  <span className="min-w-0 break-words text-body-s text-ink-primary">
                    {g.latest.objective ??
                      (g.latest.kind === "run"
                        ? labels.runNoLabel
                        : statusText(g.latest))}
                  </span>
                  {hasChain ? (
                    <span className="ml-auto shrink-0 text-caption text-ink-muted">
                      {g.chain.length} {labels.steps}
                    </span>
                  ) : (
                    <span className="ml-auto shrink-0 text-caption text-ink-muted">
                      {g.latest.actor}
                    </span>
                  )}
                </button>
                {open && (
                  <div className="space-y-1 border-l-2 border-edge-neutral pb-3 pl-8">
                    {g.latest.objective && (
                      <p className="pt-1 text-body-s text-ink-primary">
                        {g.latest.objective}
                      </p>
                    )}
                    <ul className="space-y-1 pt-1">
                      {[...g.chain].reverse().map((e) => (
                        <li key={e.id} className="flex items-center gap-3">
                          <span className="font-data text-caption text-ink-muted tabular-nums">
                            {timeShort(e.created_at)}
                          </span>
                          <StatusBadge level={levelFor(e)}>
                            {statusText(e)}
                          </StatusBadge>
                          <span className="text-caption text-ink-muted">
                            {e.actor}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {g.latest.kind === "approval" && (
                      <Link
                        href="/approvals"
                        className="inline-block pt-1 text-caption text-ink-secondary underline-offset-2 hover:underline"
                      >
                        {labels.approvalsLink}
                      </Link>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
