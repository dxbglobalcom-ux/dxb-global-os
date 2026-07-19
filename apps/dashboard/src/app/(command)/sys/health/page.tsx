import Link from "next/link";
import { Panel, Stat, StatusBadge, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /sys/health v1 (E12.1-F) — the health board (OBSERVABILITY family):
// active alerts by level, the alert-evaluate thresholds (settings-driven,
// E8.4b), system liveliness from real event streams, and the VPS snapshot
// slot (system_health_snapshots — written by the P7 health-probe job;
// empty = honest empty, the page never invents a green light).

export const metadata = { title: "Health — DXB" };

const LEVEL_BADGE: Record<string, "info" | "warn" | "danger" | "critical"> = {
  informational: "info",
  attention: "warn",
  high: "danger",
  critical: "critical",
  emergency: "critical",
};

export default async function HealthPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.health;
  const supabase = await createClient();

  const [alertsRes, settingsRes, lastEventRes, lastRunRes, snapCountRes] =
    await Promise.all([
      supabase.from("v_alerts_active").select("kind, level").eq("kind", "alert"),
      supabase
        .from("settings_values")
        .select("key, value")
        .in("key", [
          "alerts.queue_age_max_minutes",
          "alerts.heartbeat_max_seconds",
          "alerts.escalate_after_minutes",
        ])
        .eq("scope", "global"),
      supabase
        .from("task_events")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("agent_runs")
        .select("started_at")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("system_health_snapshots")
        .select("at", { count: "exact", head: true }),
    ]);

  if (alertsRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.health} state="error">
          <p className="text-body-s text-status-danger">
            v_alerts_active: {alertsRes.error.message}
          </p>
        </Panel>
      </div>
    );
  }

  const alerts = (alertsRes.data ?? []) as { level: string }[];
  const byLevel = new Map<string, number>();
  for (const a of alerts) byLevel.set(a.level, (byLevel.get(a.level) ?? 0) + 1);
  const settings = new Map(
    ((settingsRes.data ?? []) as { key: string; value: unknown }[]).map((s) => [
      s.key,
      s.value,
    ]),
  );
  const lastEventAt = (lastEventRes.data as { created_at: string } | null)?.created_at;
  const lastRunAt = (lastRunRes.data as { started_at: string } | null)?.started_at;
  const snapCount = snapCountRes.count ?? 0;

  const timeFmt = (iso: string | null | undefined) =>
    iso
      ? new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        })
      : "—";

  const levelLabels = dict.command.alerts.ui.levels as Record<string, string>;
  const alertsCritical =
    (byLevel.get("critical") ?? 0) + (byLevel.get("emergency") ?? 0);

  const thresholds: { key: string; label: string; unit: string }[] = [
    { key: "alerts.queue_age_max_minutes", label: t.thQueueAge, unit: t.unitMinutes },
    { key: "alerts.heartbeat_max_seconds", label: t.thHeartbeat, unit: t.unitSeconds },
    { key: "alerts.escalate_after_minutes", label: t.thEscalate, unit: t.unitMinutes },
  ];

  // alerts.escalate_after_minutes is a per-level jsonb map ({attention: 240,
  // high: 60, critical: 15}); scalars render as-is.
  const thresholdText = (value: unknown, unit: string): string => {
    if (value !== null && typeof value === "object") {
      const order = ["attention", "high", "critical", "emergency"];
      const entries = Object.entries(value as Record<string, unknown>).sort(
        (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
      );
      return entries
        .map(([level, v]) => `${levelLabels[level] ?? level} ${String(v)}`)
        .join(" · ")
        .concat(` ${unit}`);
    }
    return `${String(value)} ${unit}`;
  };

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.health}{" "}
        <HelpTip text={dict.help.health} />
      </h1>
        <Link href="/alerts" className="text-body-s text-accent-champagne">
          {t.viewAlerts}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiActiveAlerts}
          value={String(alerts.length)}
          glow
          drillHref="/alerts"
        />
        <Stat label={t.kpiCritical} value={String(alertsCritical)} drillHref="/alerts" />
        <Stat
          label={t.kpiLastEvent}
          value={timeFmt(lastEventAt)}
          drillHref="/live"
        />
        <Stat
          label={t.kpiSnapshots}
          value={String(snapCount)}
          drillHref="/fin/capacity"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title={t.alertMixTitle}>
          {alerts.length === 0 ? (
            <p className="text-body-s text-ink-secondary">{t.alertMixEmpty}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[...byLevel.entries()].map(([level, n]) => (
                <Link key={level} href="/alerts">
                  <StatusBadge level={LEVEL_BADGE[level] ?? "info"}>
                    {levelLabels[level] ?? level} {n}
                  </StatusBadge>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel title={t.livelinessTitle}>
          <ul className="space-y-2 text-body-s">
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-ink-secondary">{t.lastTaskEvent}</span>
              <span className="font-data text-ink-primary tabular-nums">
                {timeFmt(lastEventAt)}
              </span>
            </li>
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-ink-secondary">{t.lastAgentRun}</span>
              <span className="font-data text-ink-primary tabular-nums">
                {timeFmt(lastRunAt)}
              </span>
            </li>
          </ul>
        </Panel>
      </div>

      <Panel title={t.thresholdsTitle}>
        <p className="mb-3 text-caption text-ink-muted">{t.thresholdsHint}</p>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-3">
          {thresholds.map((th) => (
            <li
              key={th.key}
              className="flex items-baseline justify-between gap-3 text-body-s"
            >
              <span className="text-ink-secondary">{th.label}</span>
              <span className="font-data text-ink-primary tabular-nums">
                {settings.has(th.key) ? thresholdText(settings.get(th.key), th.unit) : "—"}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Honest boundary: VPS gauges + fn_alerts_evaluate cadence ride the
          P7 health-probe / alert-evaluate jobs (E8.4b boundary records). */}
      <p className="text-caption text-ink-muted">{t.boundaryNote}</p>
    </div>
  );
}
