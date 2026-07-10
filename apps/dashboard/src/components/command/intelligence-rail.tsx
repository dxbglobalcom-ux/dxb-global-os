import Link from "next/link";
import { Panel, StatusBadge } from "@/components/primitives";

// Intelligence Rail — right layer (CC-SPEC §3). E2.1 slice: real
// pending-approval feed from the approvals table. The critical-alert
// stream and live ticker land with the observability layer (E8) and
// are shown as an honest in-build card, never as fake liveliness (§35).

export type RailApproval = {
  id: string;
  title: string;
  risk: string | null;
  created_at: string;
};

export function IntelligenceRail({
  labels,
  approvals,
  pendingCount,
}: {
  labels: {
    title: string;
    approvalsTitle: string;
    approvalsEmpty: string;
    alertsTitle: string;
    alertsWaiting: string;
    viewAll: string;
  };
  approvals: RailApproval[];
  pendingCount: number;
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
                      {new Date(a.created_at).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
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
        <p className="text-body-s text-ink-muted">{labels.alertsWaiting}</p>
      </Panel>
    </aside>
  );
}
