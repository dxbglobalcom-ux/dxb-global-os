import Link from "next/link";
import { Panel, StatusBadge } from "@/components/primitives";
import { AlertsRail, type RailAlert } from "./alerts-rail";
import { LiveTicker, type TickerRow } from "./live-ticker";

// Intelligence Rail — right layer (CC-SPEC §3). E2.1 slice: real
// pending-approval feed from the approvals table. E8.4b: the alerts panel
// binds to the real priority head of v_alerts_active (severity → unacked →
// age) and repaints from the `alerts` Broadcast. E12.1: the live ticker
// binds to the head of v_live_ops and repaints from ops:live — the §3 rail
// content set (approval özeti · critical alerts · live ticker) is complete;
// contextual controls ride the widget/control row (E12.2).

export type RailApproval = {
  id: string;
  title: string;
  risk: string | null;
  created_at: string;
  moneyOut: boolean;
};

export type { RailAlert, TickerRow };

export function IntelligenceRail({
  labels,
  locale,
  approvals,
  pendingCount,
  oldestPendingAt,
  moneyOutCount,
  alerts,
  alertCount,
  alertLevels,
  riskLevels,
  ticker,
  statusLabels,
}: {
  labels: {
    title: string;
    approvalsTitle: string;
    approvalsEmpty: string;
    alertsTitle: string;
    alertsEmpty: string;
    tickerTitle: string;
    tickerEmpty: string;
    runNoLabel: string;
    viewAll: string;
    moneyOut: string;
    oldest: string;
  };
  locale: string;
  approvals: RailApproval[];
  pendingCount: number;
  oldestPendingAt: string | null;
  moneyOutCount: number;
  alerts: RailAlert[];
  alertCount: number;
  alertLevels: Record<string, string>;
  riskLevels: Record<string, string>;
  ticker: TickerRow[];
  statusLabels: Record<string, string>;
}) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-edge-neutral bg-surface-obsidian p-4 xl:flex">
      <div className="label-caps text-ink-muted">{labels.title}</div>

      <Panel title={labels.approvalsTitle}>
        {/* E9.3 §5 rail summary: pending count + oldest + money_out badge */}
        {pendingCount > 0 && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-data text-body-s tabular-nums text-ink-primary">
              {pendingCount}
            </span>
            {moneyOutCount > 0 && (
              <StatusBadge level="warn">
                {labels.moneyOut} {moneyOutCount}
              </StatusBadge>
            )}
            {oldestPendingAt && (
              <span className="font-data text-caption tabular-nums text-ink-muted">
                {labels.oldest}{" "}
                {/* locale-pinned: a short month name from the browser default
                    would leak an EN month onto the TR screen (RULE #0) */}
                {new Date(oldestPendingAt).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hourCycle: "h23",
                })}
              </span>
            )}
          </div>
        )}
        {approvals.length === 0 ? (
          <p className="text-body-s text-ink-secondary">{labels.approvalsEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {approvals.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/approvals/${a.id}`}
                  className={`block rounded-input border bg-surface-graphite p-2 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne ${
                    a.moneyOut ? "border-edge-champagne" : "border-edge-neutral"
                  }`}
                >
                  <div className="line-clamp-2 text-body-s text-ink-primary" title={a.title}>
                    {a.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {a.moneyOut && (
                      <span className="label-caps text-accent-champagne">{labels.moneyOut}</span>
                    )}
                    {a.risk && (
                      <StatusBadge level={a.risk === "critical" ? "critical" : "warn"}>
                        {riskLevels[a.risk] ?? a.risk}
                      </StatusBadge>
                    )}
                    <span className="font-data text-caption text-ink-muted tabular-nums">
                      {/* 24h — language-neutral (no AM/PM leaking English
                          onto the TR screen; RULE #0 purity) */}
                      {new Date(a.created_at).toLocaleTimeString(undefined, {
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
        )}
        {pendingCount > approvals.length && (
          <Link
            href="/approvals?state=pending"
            className="mt-3 block text-body-s text-accent-champagne"
          >
            {labels.viewAll} ({pendingCount})
          </Link>
        )}
      </Panel>

      <Panel title={labels.alertsTitle}>
        <AlertsRail
          alerts={alerts}
          activeCount={alertCount}
          labels={{ empty: labels.alertsEmpty, viewAll: labels.viewAll, levels: alertLevels }}
        />
      </Panel>

      <Panel title={labels.tickerTitle}>
        <LiveTicker
          rows={ticker}
          labels={{
            empty: labels.tickerEmpty,
            viewAll: labels.viewAll,
            runNoLabel: labels.runNoLabel,
          }}
          statusLabels={statusLabels}
        />
      </Panel>
    </aside>
  );
}
