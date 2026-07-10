"use client";

// TaskBoard (UI-SPEC §5 left column, exception-first LOCKED): "Beni
// bekleyenler" (states needing the CEO) + "Az önce değişti" (live
// dxb:task_events feed). No all-tasks firehose. New feed rows flash the
// value-pulse (§6). Color is never alone — every chip is icon+label.
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  ArrowUUpLeftIcon,
  CheckIcon,
  EyeIcon,
  HandGrabbingIcon,
  HourglassIcon,
  PlayIcon,
  QueueIcon,
  TrayIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Panel } from "@/components/panel";
import { FreshnessStamp } from "@/components/freshness-stamp";
import { useDxbChannel, type DxbBroadcastPayload } from "@/lib/realtime";
import { timeHM } from "@/lib/format";

type StatusKey =
  | "inbox"
  | "queued"
  | "claimed"
  | "running"
  | "review"
  | "awaiting_approval"
  | "done"
  | "failed"
  | "returned";

const STATUS_STYLE: Record<StatusKey, { tone: string; Icon: typeof CheckIcon; pulse?: boolean }> = {
  inbox: { tone: "text-info", Icon: TrayIcon },
  queued: { tone: "text-info", Icon: QueueIcon },
  claimed: { tone: "text-info", Icon: HandGrabbingIcon },
  running: { tone: "text-info", Icon: PlayIcon, pulse: true },
  review: { tone: "text-warn", Icon: EyeIcon },
  awaiting_approval: { tone: "text-warn", Icon: HourglassIcon },
  done: { tone: "text-ok", Icon: CheckIcon },
  failed: { tone: "text-danger", Icon: XCircleIcon },
  returned: { tone: "text-warn", Icon: ArrowUUpLeftIcon },
};

export type WaitingTask = {
  id: string;
  objective: string;
  department: string;
  status: string;
  updated_at: string;
};

export type FeedEvent = {
  id: string;
  task_id: string;
  event: string;
  from_status: string | null;
  to_status: string | null;
  actor: string;
  created_at: string;
  objective: string | null;
};

export function StatusChip({ status, label }: { status: string; label: string }) {
  const style = STATUS_STYLE[status as StatusKey] ?? STATUS_STYLE.inbox;
  const { Icon } = style;
  return (
    <span className={`inline-flex items-center gap-1 text-micro ${style.tone}`}>
      <Icon size={14} aria-hidden className={style.pulse ? "motion-safe:animate-[hl-pulse_2.4s_ease-in-out_infinite]" : undefined} />
      {label}
    </span>
  );
}

export function TaskBoard({
  waiting,
  events,
  pendingApprovals,
  statusLabels,
  text,
}: {
  waiting: WaitingTask[];
  events: FeedEvent[];
  pendingApprovals: number;
  statusLabels: Record<string, string>;
  text: {
    waitingTitle: string;
    waitingEmpty: string;
    pendingApprovalsRow: string;
    goToApprovals: string;
    changedTitle: string;
    changedEmpty: string;
    asOf: string;
    notLiveSince: string;
  };
}) {
  const [feed, setFeed] = useState<FeedEvent[]>(events);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());

  const onMessage = useCallback((payload: DxbBroadcastPayload) => {
    if (payload.table !== "task_events" || payload.operation !== "INSERT" || !payload.record) return;
    const r = payload.record as Record<string, string | null>;
    const row: FeedEvent = {
      id: String(r.id),
      task_id: String(r.task_id),
      event: String(r.event),
      from_status: r.from_status ?? null,
      to_status: r.to_status ?? null,
      actor: String(r.actor),
      created_at: String(r.created_at),
      objective: null,
    };
    setFeed((prev) => [row, ...prev.filter((e) => e.id !== row.id)].slice(0, 12));
    setFreshIds((prev) => new Set(prev).add(row.id));
    window.setTimeout(
      () =>
        setFreshIds((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        }),
      700,
    );
  }, []);

  const channel = useDxbChannel("task_events", onMessage);
  const stamp = (
    <FreshnessStamp state={channel} asOfLabel={text.asOf} notLiveLabel={text.notLiveSince} />
  );

  return (
    <div className="flex flex-col gap-5">
      <Panel title={text.waitingTitle} stamp={stamp}>
        <ul className="divide-y divide-line">
          {pendingApprovals > 0 && (
            <li className="flex items-center gap-3 py-3">
              <span className="font-mono text-body text-ink" data-numeric>
                {pendingApprovals}
              </span>
              <span className="text-body text-ink-2">{text.pendingApprovalsRow}</span>
              <Link
                href="/approvals"
                className="ml-auto inline-flex h-8 items-center rounded-full bg-accent px-4 text-micro font-medium text-on-accent transition-colors duration-[var(--dur-fast)] hover:bg-accent-press"
              >
                {text.goToApprovals}
              </Link>
            </li>
          )}
          {waiting.map((task) => (
            <li key={task.id} className="flex items-center gap-3 py-3">
              <StatusChip status={task.status} label={statusLabels[task.status] ?? task.status} />
              <Link
                href={`/tasks/${task.id}`}
                className="min-w-0 flex-1 truncate text-body text-ink hover:text-accent"
              >
                {task.objective}
              </Link>
              <span className="text-micro text-ink-2">{task.department}</span>
            </li>
          ))}
          {waiting.length === 0 && pendingApprovals === 0 && (
            <li className="py-3 text-body text-ink-2">{text.waitingEmpty}</li>
          )}
        </ul>
      </Panel>

      <Panel title={text.changedTitle}>
        <ul className="divide-y divide-line">
          {feed.map((event) => (
            <li
              key={event.id}
              className={`flex items-center gap-3 py-2.5 ${
                freshIds.has(event.id) ? "motion-safe:animate-[value-pulse_600ms_ease-out]" : ""
              }`}
            >
              <span className="font-mono text-micro text-ink-2" data-numeric>
                {timeHM(new Date(event.created_at))}
              </span>
              <Link
                href={`/tasks/${event.task_id}`}
                className="min-w-0 flex-1 truncate text-body text-ink hover:text-accent"
              >
                {event.objective ?? event.event}
              </Link>
              {event.to_status && (
                <StatusChip
                  status={event.to_status}
                  label={statusLabels[event.to_status] ?? event.to_status}
                />
              )}
            </li>
          ))}
          {feed.length === 0 && <li className="py-3 text-body text-ink-2">{text.changedEmpty}</li>}
        </ul>
      </Panel>
    </div>
  );
}
