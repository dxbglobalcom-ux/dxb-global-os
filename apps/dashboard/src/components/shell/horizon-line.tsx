"use client";

// Horizon Line (UI-SPEC §5, signature): 1px accent gradient under the topbar
// carrying the company pulse — active tasks · pending approvals · today's
// cost · liveness. Live layer: all three dxb:* channels; counters move by
// payload deltas (no polling). Liveness = every channel healthy.
import { useCallback, useMemo, useState } from "react";
import { useDxbChannel, type DxbBroadcastPayload } from "@/lib/realtime";
import { formatEur } from "@/lib/format";

const ACTIVE_TASK_STATES = new Set(["queued", "claimed", "running"]);

export type HorizonLabels = {
  activeTasks: string;
  pendingApprovals: string;
  todayCost: string;
  live: string;
  notLive: string;
};

export function HorizonLine({
  labels,
  initialActiveTasks,
  initialPendingApprovals,
  initialTodayCostEur,
}: {
  labels: HorizonLabels;
  initialActiveTasks: number;
  initialPendingApprovals: number;
  initialTodayCostEur: number;
}) {
  const [activeTasks, setActiveTasks] = useState(initialActiveTasks);
  const [pendingApprovals, setPendingApprovals] = useState(initialPendingApprovals);
  const [todayCost, setTodayCost] = useState(initialTodayCostEur);

  const onTaskEvent = useCallback((payload: DxbBroadcastPayload) => {
    const record = payload.record as { to_status?: string | null; from_status?: string | null } | null;
    if (!record) return;
    const into = record.to_status ? ACTIVE_TASK_STATES.has(record.to_status) : false;
    const outOf = record.from_status ? ACTIVE_TASK_STATES.has(record.from_status) : false;
    if (into !== outOf) setActiveTasks((n) => Math.max(0, n + (into ? 1 : -1)));
  }, []);

  const onApproval = useCallback((payload: DxbBroadcastPayload) => {
    const now = (payload.record as { status?: string } | null)?.status === "pending";
    const before = (payload.old_record as { status?: string } | null)?.status === "pending";
    if (now !== before) setPendingApprovals((n) => Math.max(0, n + (now ? 1 : -1)));
  }, []);

  const onCost = useCallback((payload: DxbBroadcastPayload) => {
    if (payload.operation !== "INSERT") return;
    const value = Number((payload.record as { cost_eur?: string | number } | null)?.cost_eur ?? 0);
    if (Number.isFinite(value)) setTodayCost((total) => total + value);
  }, []);

  const tasksChannel = useDxbChannel("task_events", onTaskEvent);
  const approvalsChannel = useDxbChannel("approvals", onApproval);
  const costChannel = useDxbChannel("cost_ledger", onCost);

  const live = useMemo(
    () =>
      [tasksChannel, approvalsChannel, costChannel].every((c) => c.status === "live"),
    [tasksChannel, approvalsChannel, costChannel],
  );

  const slots = [
    { label: labels.activeTasks, value: String(activeTasks) },
    { label: labels.pendingApprovals, value: String(pendingApprovals) },
    { label: labels.todayCost, value: formatEur(todayCost) },
  ];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, var(--accent) 0%, transparent 78%)" }}
      />
      <div className="flex items-center gap-5 overflow-x-auto px-4 py-1.5 sm:px-6">
        {slots.map((slot) => (
          <span key={slot.label} className="flex shrink-0 items-baseline gap-1.5">
            <span className="font-mono text-micro text-ink" data-numeric>
              {slot.value}
            </span>
            <span className="text-micro text-ink-2">{slot.label}</span>
          </span>
        ))}
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          <span
            aria-hidden
            className={
              live
                ? "size-1.5 rounded-full bg-ok motion-safe:animate-[hl-pulse_2.4s_ease-in-out_infinite]"
                : "size-1.5 rounded-full bg-warn"
            }
          />
          <span className="text-micro text-ink-2">{live ? labels.live : labels.notLive}</span>
        </span>
      </div>
    </div>
  );
}
