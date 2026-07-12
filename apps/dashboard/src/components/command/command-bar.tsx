import Link from "next/link";
import { StatusBadge } from "@/components/primitives";
import { LiveClock } from "./live-clock";
import { LocaleSwitch } from "./locale-switch";
import { LogoutButton } from "./logout-button";
import type { Locale } from "@/lib/i18n";

// Global Command Bar — top layer (CC-SPEC §3, §11). E2.1 renders the
// REAL slice: brand, live system status (DB reachability from the
// server fetch), active-task and pending-approval counters (drillable —
// every number is a door), clock, read-only mode chip. Global search +
// ⌘K palette wire up when v_global_search lands (E4); emergency
// controls and the CONTROL badge arrive with Control Mode (E6) — in
// read-only mode mutation affordances are not rendered at all
// (DESIGN_SYSTEM §13), so nothing here is a dead button.

export function CommandBar({
  labels,
  systemOk,
  activeTasks,
  pendingApprovals,
  locale,
}: {
  labels: {
    systemOk: string;
    systemDegraded: string;
    activeTasks: string;
    pendingApprovals: string;
    readOnly: string;
    language: string;
    logout: string;
  };
  systemOk: boolean;
  activeTasks: number;
  pendingApprovals: number;
  locale: Locale;
}) {
  return (
    <header className="flex h-12 items-center gap-4 border-b border-edge-neutral bg-surface-obsidian px-4">
      <Link href="/overview" className="flex items-center gap-2">
        <span className="font-display text-h3 text-ink-primary">DXB</span>
        <span className="label-caps text-accent-brushed">Command Center</span>
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <StatusBadge level={systemOk ? "ok" : "danger"}>
          {systemOk ? labels.systemOk : labels.systemDegraded}
        </StatusBadge>
        <Link
          href="/ops/tasks?state=active"
          className="rounded-input px-2 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:bg-surface-carbon hover:text-ink-primary"
        >
          <span className="font-data text-ink-primary tabular-nums">{activeTasks}</span>{" "}
          {labels.activeTasks}
        </Link>
        <Link
          href="/approvals?state=pending"
          className={`rounded-input px-2 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined hover:bg-surface-carbon ${
            pendingApprovals > 0 ? "text-accent-champagne" : "text-ink-secondary"
          }`}
        >
          <span className="font-data tabular-nums">{pendingApprovals}</span>{" "}
          {labels.pendingApprovals}
        </Link>
        <span className="label-caps rounded-input border border-edge-neutral px-2 py-1 text-ink-muted">
          {labels.readOnly}
        </span>
        <LocaleSwitch locale={locale} ariaLabel={labels.language} />
        <LiveClock />
        <LogoutButton label={labels.logout} />
      </div>
    </header>
  );
}
