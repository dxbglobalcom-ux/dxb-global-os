"use client";

// Drill-down live layer (DASH-03): refreshes the RSC tree ONLY when the
// broadcast concerns THIS task — no cross-task subscriptions ever reach the
// page. Carries the page's FreshnessStamp.
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { FreshnessStamp } from "@/components/freshness-stamp";
import { useDxbChannel, type DxbBroadcastPayload } from "@/lib/realtime";

export function TaskLiveRefresh({
  taskId,
  asOfLabel,
  notLiveLabel,
}: {
  taskId: string;
  asOfLabel: string;
  notLiveLabel: string;
}) {
  const router = useRouter();
  const onMessage = useCallback(
    (payload: DxbBroadcastPayload) => {
      const record = payload.record as { task_id?: string } | null;
      if (record?.task_id === taskId) router.refresh();
    },
    [router, taskId],
  );
  const channel = useDxbChannel("task_events", onMessage);
  return <FreshnessStamp state={channel} asOfLabel={asOfLabel} notLiveLabel={notLiveLabel} />;
}
