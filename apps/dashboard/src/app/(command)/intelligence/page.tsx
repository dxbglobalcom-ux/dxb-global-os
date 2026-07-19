import Link from "next/link";
import { Panel, Stat, StatusBadge, type StatusLevel, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /intelligence v1 (E12.1) — the Intelligence Feed: the CEO's "what does the
// company know right now" surface. Four REAL sources, no synthesis theater:
// v_morning_briefing (07:00 briefing blocks, 0018 lineage) · v_alerts_active
// priority head · v_decision_log recent decisions · v_live_ops tail. Every
// number drills to its owning module (CC-SPEC drill-down map).

export const metadata = { title: "Intelligence — DXB" };

const ALERT_BADGE: Record<string, StatusLevel> = {
  informational: "info",
  attention: "warn",
  high: "danger",
  critical: "critical",
  emergency: "critical",
};

type BriefingRow = { sort: number; block: string; payload: Record<string, unknown> };
type AlertRow = { id: string; level: string; title: string; at: string; source: string };
type DecisionRow = {
  id: number;
  decided_by: string | null;
  decision: string;
  confidence: number | null;
  risk: string | null;
  employee: string | null;
  created_at: string;
};
type LiveRow = {
  source: string;
  source_id: string;
  ts: string;
  status: string | null;
  event: string | null;
  label: string | null;
};

export default async function IntelligencePage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.intelligence;
  const supabase = await createClient();

  const dayAgo = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const [briefingRes, alertsRes, decisionsRes, decisions24Res, liveRes] =
    await Promise.all([
      supabase.from("v_morning_briefing").select("sort, block, payload").order("sort"),
      supabase
        .from("v_alerts_active")
        .select("kind, id, level, title, at, source")
        .eq("kind", "alert")
        .limit(8),
      supabase
        .from("v_decision_log")
        .select("id, decided_by, decision, confidence, risk, employee, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("v_decision_log")
        .select("id", { count: "exact", head: true })
        .gte("created_at", dayAgo),
      supabase
        .from("v_live_ops")
        .select("source, source_id, ts, status, event, label")
        .order("ts", { ascending: false })
        .limit(10),
    ]);

  const firstError =
    briefingRes.error ?? alertsRes.error ?? decisionsRes.error ?? liveRes.error;
  if (firstError) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.intel} state="error">
          <p className="text-body-s text-status-danger">{firstError.message}</p>
        </Panel>
      </div>
    );
  }

  const briefing = (briefingRes.data ?? []) as unknown as BriefingRow[];
  const alerts = (alertsRes.data ?? []) as unknown as AlertRow[];
  const decisions = (decisionsRes.data ?? []) as unknown as DecisionRow[];
  const live = (liveRes.data ?? []) as unknown as LiveRow[];

  const block = (name: string) =>
    briefing.find((b) => b.block === name)?.payload ?? {};
  const overnight = block("overnight_work") as {
    by_status?: Record<string, number>;
    recent_done?: { objective?: string }[];
    total_events?: number;
  };
  const briefApprovals = block("approvals") as {
    pending_total?: number;
    by_risk?: Record<string, number>;
    oldest?: { purpose?: string; action_type?: string }[];
  };
  const cost24 = block("cost_24h") as {
    total_eur?: number;
    top_departments?: { department: string; total_eur: number }[];
  };

  const timeFmt = (iso: string) =>
    new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

  const statusLabels = dict.status as Record<string, string>;
  const riskLabels = dict.command.approvals.ui.riskLevels as Record<string, string>;

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.intel}{" "}
        <HelpTip text={dict.help.intelligence} />
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiAlerts}
          value={String(alerts.length)}
          glow
          drillHref="/alerts"
        />
        <Stat
          label={t.kpiApprovals}
          value={String(briefApprovals.pending_total ?? 0)}
          drillHref="/approvals?state=pending"
        />
        <Stat
          label={t.kpiDecisions24h}
          value={String(decisions24Res.count ?? 0)}
          drillHref="/gov/decisions"
        />
        <Stat
          label={t.kpiOvernight}
          value={String(overnight.total_events ?? 0)}
          drillHref="/live"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* 07:00 briefing blocks (v_morning_briefing, 0018 lineage) */}
        <Panel title={t.briefOvernight}>
          {Object.keys(overnight.by_status ?? {}).length === 0 ? (
            <p className="text-body-s text-ink-secondary">{t.briefEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(overnight.by_status ?? {}).map(([status, n]) => (
                <li
                  key={status}
                  className="flex items-baseline justify-between gap-3 text-body-s"
                >
                  <span className="text-ink-secondary">
                    {statusLabels[status] ?? status}
                  </span>
                  <Link
                    href={`/ops/tasks?state=${encodeURIComponent(status)}`}
                    className="font-data text-accent-champagne tabular-nums"
                  >
                    {n}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {(overnight.recent_done ?? []).length > 0 && (
            <div className="mt-3 border-t border-edge-neutral pt-2">
              <div className="label-caps text-ink-muted">{t.briefRecentDone}</div>
              <ul className="mt-1 space-y-1">
                {(overnight.recent_done ?? []).slice(0, 5).map((d, i) => (
                  <li key={i} className="truncate text-body-s text-ink-secondary">
                    {d.objective ?? "—"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        <Panel title={t.briefApprovals}>
          <div className="flex items-baseline justify-between gap-3 text-body-s">
            <span className="text-ink-secondary">{t.kpiApprovals}</span>
            <Link
              href="/approvals?state=pending"
              className="font-data text-accent-champagne tabular-nums"
            >
              {briefApprovals.pending_total ?? 0}
            </Link>
          </div>
          {Object.keys(briefApprovals.by_risk ?? {}).length > 0 && (
            <ul className="mt-2 space-y-1">
              {Object.entries(briefApprovals.by_risk ?? {}).map(([risk, n]) => (
                <li
                  key={risk}
                  className="flex items-baseline justify-between gap-3 text-body-s"
                >
                  <span className="text-ink-secondary">{riskLabels[risk] ?? risk}</span>
                  <span className="font-data text-ink-primary tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          )}
          {(briefApprovals.oldest ?? []).length === 0 &&
            (briefApprovals.pending_total ?? 0) === 0 && (
              <p className="mt-2 text-body-s text-ink-secondary">{t.briefNoApprovals}</p>
            )}
        </Panel>

        <Panel title={t.briefCost}>
          <div className="flex items-baseline justify-between gap-3 text-body-s">
            <span className="text-ink-secondary">{t.briefCostTotal}</span>
            <Link
              href="/fin/costs?range=today"
              className="font-data text-accent-champagne tabular-nums"
            >
              €{Number(cost24.total_eur ?? 0).toFixed(2)}
            </Link>
          </div>
          {(cost24.top_departments ?? []).length > 0 && (
            <ul className="mt-2 space-y-1">
              {(cost24.top_departments ?? []).slice(0, 5).map((d) => (
                <li
                  key={d.department}
                  className="flex items-baseline justify-between gap-3 text-body-s"
                >
                  <span className="truncate text-ink-secondary">{d.department}</span>
                  <span className="font-data text-ink-primary tabular-nums">
                    €{Number(d.total_eur).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title={t.alertsTitle}>
          {alerts.length === 0 ? (
            <p className="text-body-s text-ink-secondary">{t.alertsEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li key={a.id}>
                  <Link
                    href="/alerts"
                    className="flex items-center justify-between gap-3 rounded-input border border-edge-neutral bg-surface-graphite p-2 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
                  >
                    <span className="min-w-0 truncate text-body-s text-ink-primary">
                      {a.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <StatusBadge level={ALERT_BADGE[a.level] ?? "info"}>
                        {(dict.command.alerts.ui.levels as Record<string, string>)[
                          a.level
                        ] ?? a.level}
                      </StatusBadge>
                      <span className="font-data text-caption text-ink-muted tabular-nums">
                        {timeFmt(a.at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t.decisionsTitle}>
          {decisions.length === 0 ? (
            <p className="text-body-s text-ink-secondary">{t.decisionsEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {decisions.map((d) => (
                <li key={d.id}>
                  <Link
                    href="/gov/decisions"
                    className="block rounded-input border border-edge-neutral bg-surface-graphite p-2 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
                  >
                    <div className="truncate text-body-s text-ink-primary">
                      {d.decision}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-data text-caption text-ink-secondary">
                        {d.employee ?? d.decided_by ?? "—"}
                      </span>
                      {d.confidence != null && (
                        <span className="font-data text-caption text-ink-muted tabular-nums">
                          {Number(d.confidence).toFixed(2)}
                        </span>
                      )}
                      <span className="font-data text-caption text-ink-muted tabular-nums">
                        {timeFmt(d.created_at)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title={t.liveTitle}>
        {live.length === 0 ? (
          <p className="text-body-s text-ink-secondary">{t.liveEmpty}</p>
        ) : (
          <ul className="divide-y divide-edge-neutral">
            {live.map((r) => (
              <li key={`${r.source}-${r.source_id}-${r.ts}`}>
                <Link
                  href="/live"
                  className="flex items-center justify-between gap-3 py-2 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
                >
                  <span className="min-w-0 truncate text-body-s text-ink-primary">
                    {r.label ?? r.event ?? r.source}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {r.status && (
                      <StatusBadge
                        level={
                          r.status === "succeeded"
                            ? "ok"
                            : r.status === "failed"
                              ? "danger"
                              : "info"
                        }
                      >
                        {statusLabels[r.status] ?? r.status}
                      </StatusBadge>
                    )}
                    <span className="font-data text-caption text-ink-muted tabular-nums">
                      {timeFmt(r.ts)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
