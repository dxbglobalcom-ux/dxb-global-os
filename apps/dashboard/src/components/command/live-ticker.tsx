"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { StatusBadge, type StatusLevel } from "@/components/primitives";
import { subscribeDxb } from "@/lib/realtime";

// Rail live ticker (E12.1 — CC-SPEC §3 "live ticker" slot, the last unbound
// rail content). Server passes the head of v_live_ops; the ops:live
// Broadcast (§9a envelopes, 1 s batched) triggers a debounced server
// refetch — same repaint idiom as the alerts panel, no client cache.

export type TickerRow = {
  source: string;
  source_id: string;
  ts: string;
  status: string | null;
  event: string | null;
  label: string | null;
  /** CEO order 2026-07-26: the live flow reads Turkish on the Turkish page.
   *  Task objectives stay English (language directive) — this is their i18n
   *  surface, filled by whoever creates the task; null falls back honestly. */
  label_tr: string | null;
};

const STATUS_BADGE: Record<string, StatusLevel> = {
  succeeded: "ok",
  running: "info",
  waiting: "warn",
  failed: "danger",
  cancelled: "info",
};

export function LiveTicker({
  rows,
  labels,
  statusLabels,
  locale,
}: {
  rows: TickerRow[];
  labels: { empty: string; viewAll: string; runNoLabel: string };
  statusLabels: Record<string, string>;
  locale: "tr" | "en";
}) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const unsubscribe = subscribeDxb("ops:live", () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 800);
    });
    return () => {
      if (timer.current) clearTimeout(timer.current);
      unsubscribe();
    };
  }, [router]);

  if (rows.length === 0) {
    return <p className="text-body-s text-ink-secondary">{labels.empty}</p>;
  }
  return (
    <>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={`${r.source}-${r.source_id}-${r.ts}`}>
            <Link
              href="/live"
              className="block rounded-input border border-edge-neutral bg-surface-graphite p-2 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
            >
              {/* Full wrap, never "…" — visible ellipsis on a CEO surface is
                  an automatic FAIL (RULE #0 Amendment A1, 2026-07-17). */}
              <div className="min-w-0 break-words text-body-s text-ink-primary">
                {(locale === "tr" ? r.label_tr : null) ?? r.label ?? labels.runNoLabel}
              </div>
              {/* Symmetry ruling: chip pinned left, time pinned right —
                  identical geometry on every card. */}
              <div className="mt-1 flex items-center justify-between gap-2">
                <StatusBadge level={(r.status && STATUS_BADGE[r.status]) || "info"}>
                  {(r.status && statusLabels[r.status]) ?? r.status ?? "—"}
                </StatusBadge>
                <span className="font-data text-caption text-ink-muted tabular-nums">
                  {new Date(r.ts).toLocaleTimeString(undefined, {
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
      <Link href="/live" className="mt-3 block text-body-s text-accent-champagne">
        {labels.viewAll}
      </Link>
    </>
  );
}
