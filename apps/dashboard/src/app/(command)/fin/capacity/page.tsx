import Link from "next/link";
import { Panel, Stat, StatusBadge } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /fin/capacity v1 (E12.1-C) — CapacityBoard (COST spec §5): "capacity" =
// money + hardware together. Work-pressure figures come from live public
// tables (queued tasks, in-flight runs, running workflows, queue-age
// alerts). VPS resource gauges (RAM/CPU/disk) read system_health_snapshots
// — written by the P7 health-probe job; until it runs the panel shows an
// honest empty state, never invented gauges.

export const metadata = { title: "Capacity — DXB" };

type SnapshotRow = {
  at: string;
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  queue_depth: number | null;
  db_health: string | null;
  api_health: string | null;
};

export default async function CapacityPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.capacity;
  const supabase = await createClient();

  const [queuedRes, runningRes, wfRes, queueAlertRes, snapRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "queued"),
    supabase
      .from("agent_runs")
      .select("id", { count: "exact", head: true })
      .eq("status", "running"),
    supabase
      .from("workflow_runs")
      .select("id", { count: "exact", head: true })
      .eq("status", "running"),
    supabase
      .from("alerts")
      .select("id", { count: "exact", head: true })
      .eq("source", "queue")
      .is("resolved_at", null),
    supabase
      .from("system_health_snapshots")
      .select("at, cpu, ram, disk, queue_depth, db_health, api_health")
      .order("at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const firstError =
    queuedRes.error ?? runningRes.error ?? wfRes.error ?? queueAlertRes.error ?? snapRes.error;
  if (firstError) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.capacity} state="error">
          <p className="text-body-s text-status-danger">{firstError.message}</p>
        </Panel>
      </div>
    );
  }

  const snap = (snapRes.data ?? null) as SnapshotRow | null;
  const queued = queuedRes.count ?? 0;
  const running = runningRes.count ?? 0;
  const wfRunning = wfRes.count ?? 0;
  const queueAlerts = queueAlertRes.count ?? 0;

  const timeFmt = (iso: string) =>
    new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

  const gauge = (label: string, value: number | null) => (
    <div key={label}>
      <div className="flex items-baseline justify-between gap-3 text-body-s">
        <span className="text-ink-secondary">{label}</span>
        <span className="font-data text-ink-primary tabular-nums">
          {value == null ? "—" : `${Number(value).toFixed(0)}%`}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-input bg-surface-anthracite">
        <div
          className={`h-full rounded-input ${
            (value ?? 0) >= 90
              ? "bg-status-danger"
              : (value ?? 0) >= 70
                ? "bg-status-warn"
                : "bg-accent-champagne"
          }`}
          style={{ width: `${Math.max(2, Math.min(100, value ?? 0)).toFixed(0)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
          {dict.command.nav.pages.capacity}
        </h1>
        <Link href="/sys/health" className="text-body-s text-accent-champagne">
          {t.viewHealth}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiQueued}
          value={String(queued)}
          glow
          drillHref="/ops/tasks?state=queued"
        />
        <Stat label={t.kpiRunning} value={String(running)} drillHref="/live" />
        <Stat
          label={t.kpiWorkflows}
          value={String(wfRunning)}
          drillHref="/ops/workflows"
        />
        <Stat label={t.kpiQueueAlerts} value={String(queueAlerts)} drillHref="/alerts" />
      </div>

      <Panel
        title={t.vpsTitle}
        action={
          snap ? (
            <span className="font-data text-caption text-ink-muted tabular-nums">
              {timeFmt(snap.at)}
            </span>
          ) : undefined
        }
      >
        {snap ? (
          <div className="space-y-3">
            {gauge(t.gaugeCpu, snap.cpu)}
            {gauge(t.gaugeRam, snap.ram)}
            {gauge(t.gaugeDisk, snap.disk)}
            <div className="flex flex-wrap items-center gap-3 border-t border-edge-neutral pt-3 text-body-s">
              <span className="text-ink-secondary">{t.dbHealth}</span>
              <StatusBadge level={snap.db_health === "ok" ? "ok" : "warn"}>
                {snap.db_health ?? "—"}
              </StatusBadge>
              <span className="text-ink-secondary">{t.apiHealth}</span>
              <StatusBadge level={snap.api_health === "ok" ? "ok" : "warn"}>
                {snap.api_health ?? "—"}
              </StatusBadge>
              <span className="font-data text-caption text-ink-muted tabular-nums">
                {t.snapQueueDepth}: {snap.queue_depth ?? "—"}
              </span>
            </div>
          </div>
        ) : (
          // Honest zero: the health-probe pg-boss job lands at P7 (E8.4b
          // boundary) — no snapshot rows exist yet, so no gauges exist yet.
          <p className="py-2 text-body-s text-ink-secondary">{t.vpsEmpty}</p>
        )}
      </Panel>

      <p className="text-caption text-ink-muted">{t.boundaryNote}</p>
    </div>
  );
}
