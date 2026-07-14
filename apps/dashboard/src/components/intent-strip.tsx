"use client";

// IntentStrip (DASH-02): chip row under the Horizon Line tracking submitted
// intents through their task chains — received → queued → running →
// done/failed. Status rides dxb:task_events correlation (intents.task_ids);
// never a toast. Chip click = drill-down of the chain's root task.
import Link from "next/link";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDxbChannel, type DxbBroadcastPayload } from "@/lib/realtime";
import type { IntentChainStatus, RecentIntent } from "@/lib/intents";

const DOT_TONE: Record<IntentChainStatus, string> = {
  received: "bg-info",
  classifying: "bg-info",
  queued: "bg-info",
  running: "bg-info motion-safe:animate-[hl-pulse_2.4s_ease-in-out_infinite]",
  done: "bg-ok",
  failed: "bg-danger",
  failed_dispatch: "bg-danger",
};

export function IntentStrip({
  intents,
  statusLabels,
}: {
  intents: RecentIntent[];
  statusLabels: Record<IntentChainStatus, string>;
}) {
  const router = useRouter();
  const watched = new Set(intents.flatMap((intent) => intent.taskIds));

  const onMessage = useCallback(
    (payload: DxbBroadcastPayload) => {
      const record = payload.record as { task_id?: string } | null;
      if (record?.task_id && watched.has(record.task_id)) router.refresh();
    },
    // watched derives from props each render; the set identity is irrelevant
    // (deps intentionally narrowed — exhaustive-deps not linted here)
    [router, intents],
  );
  useDxbChannel("task_events", onMessage);

  if (intents.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-line px-4 py-1.5 sm:px-6">
      {intents.map((intent) => {
        const chip = (
          <span className="inline-flex max-w-72 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1">
            <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${DOT_TONE[intent.status]}`} />
            <span className="truncate text-micro text-ink-2">{intent.text}</span>
            <span className="shrink-0 text-micro font-medium text-ink">
              {statusLabels[intent.status]}
            </span>
          </span>
        );
        return intent.rootTaskId ? (
          <Link key={intent.id} href={`/tasks/${intent.rootTaskId}`} className="shrink-0">
            {chip}
          </Link>
        ) : (
          <span key={intent.id} className="shrink-0">
            {chip}
          </span>
        );
      })}
    </div>
  );
}
