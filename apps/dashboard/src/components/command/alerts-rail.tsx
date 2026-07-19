"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { StatusBadge, type StatusLevel } from "@/components/primitives";
import { subscribeDxb } from "@/lib/realtime";

// Rail alerts panel body (E8.4b — CC-SPEC §3 "critical alerts" slot).
// Server passes the real priority head of v_alerts_active; the `alerts`
// Broadcast triggers a debounced server refetch so a raise/ack/resolve
// repaints the rail without any client cache (§10).

export type RailAlert = {
  id: string;
  level: string;
  title: string;
  at: string;
  /** identical-title collapse count (C3+ rail leg) — 1 when unique */
  count?: number;
};

const LEVEL_BADGE: Record<string, StatusLevel> = {
  informational: "info",
  attention: "warn",
  high: "danger",
  critical: "critical",
  emergency: "critical",
};

export function AlertsRail({
  alerts,
  activeCount,
  labels,
}: {
  alerts: RailAlert[];
  activeCount: number;
  labels: { empty: string; viewAll: string; levels: Record<string, string> };
}) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const unsubscribe = subscribeDxb("alerts", () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 400);
    });
    return () => {
      if (timer.current) clearTimeout(timer.current);
      unsubscribe();
    };
  }, [router]);

  if (alerts.length === 0) {
    return <p className="text-body-s text-ink-secondary">{labels.empty}</p>;
  }
  return (
    <>
      <ul className="space-y-2">
        {alerts.map((a) => (
          <li key={a.id}>
            <Link
              href="/alerts"
              className="block rounded-input border border-edge-neutral bg-surface-graphite p-2 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
            >
              {/* Full wrap, never "…" (standing order 8). */}
              <div className="min-w-0 break-words text-body-s text-ink-primary">
                {a.title}
                {(a.count ?? 1) > 1 && (
                  <span className="ml-1.5 font-data text-caption text-ink-muted tabular-nums">
                    ×{a.count}
                  </span>
                )}
              </div>
              {/* Symmetry ruling: chip pinned left, time pinned right. */}
              <div className="mt-1 flex items-center justify-between gap-2">
                <StatusBadge level={LEVEL_BADGE[a.level] ?? "info"}>
                  {labels.levels[a.level] ?? a.level}
                </StatusBadge>
                <span className="font-data text-caption text-ink-muted tabular-nums">
                  {new Date(a.at).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23",
                  })}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {activeCount > alerts.length && (
        <Link href="/alerts" className="mt-3 block text-body-s text-accent-champagne">
          {labels.viewAll} ({activeCount})
        </Link>
      )}
    </>
  );
}
