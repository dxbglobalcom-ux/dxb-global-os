import Link from "next/link";
import { Panel, StatusBadge } from "@/components/primitives";
import { AlertsRail, type RailAlert } from "./alerts-rail";

// Intelligence Rail — right layer (CC-SPEC §3). E2.1 slice: real
// pending-approval feed from the approvals table. E8.4b: the alerts panel
// binds to the real priority head of v_alerts_active (severity → unacked →
// age) and repaints from the `alerts` Broadcast. Live ticker lands with its
// own row.

export type RailApproval = {
  id: string;
  title: string;
  risk: string | null;
  created_at: string;
};

export type { RailAlert };

export function IntelligenceRail({
  labels,
  approvals,
  pendingCount,
  alerts,
  alertCount,
  alertLevels,
}: {
  labels: {
    title: string;
    approvalsTitle: string;
    approvalsEmpty: string;
    alertsTitle: string;
    alertsEmpty: string;
    viewAll: string;
  };
  approvals: RailApproval[];
  pendingCount: number;
  alerts: RailAlert[];
  alertCount: number;
  alertLevels: Record<string, string>;
}) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-edge-neutral bg-surface-obsidian p-4 xl:flex">
      <div className="label-caps text-ink-muted">{labels.title}</div>

      <Panel title={labels.approvalsTitle}>
        {approvals.length === 0 ? (
          <p className="text-body-s text-ink-secondary">{labels.approvalsEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {approvals.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/approvals?state=pending`}
                  className="block rounded-input border border-edge-neutral bg-surface-graphite p-2 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
                >
                  <div className="truncate text-body-s text-ink-primary">{a.title}</div>
                  <div className="mt-1 flex items-center gap-2">
                    {a.risk && (
                      <StatusBadge level={a.risk === "critical" ? "critical" : "warn"}>
                        {a.risk}
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
    </aside>
  );
}
