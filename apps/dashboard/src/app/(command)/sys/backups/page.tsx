import Link from "next/link";
import { Panel, Stat, StatusBadge, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /sys/backups v1 (E12.1-F) — the BACKUP_PLAN §5 posture, honestly tiered:
// what the dashboard CAN machine-verify (append-only walls on the log
// tables, git-versioned memory/corpus IS this repo) is shown as checked
// state; what it CANNOT see from here (Storage Box dump listing — SSH-only
// box) is labeled as operator-verified with the exact verification command.
// "Untested backup counts as none": the restore drill is the E13.0 gate.

export const metadata = { title: "Backups — DXB" };

const APPEND_ONLY_TABLES = [
  "audit_log",
  "task_events",
  "decision_log",
  "cost_ledger",
  "revenue_ledger",
  "hook_violations",
] as const;

export default async function BackupsPage() {
  const dict = getDict(await getLocale());
  const t = dict.command.backups;
  const supabase = await createClient();

  // Liveness of each append-only stream (row counts prove the tables are
  // real and reachable). The walls themselves (UPDATE/DELETE revoked) are
  // proven by the test batteries (E8.4 append-only re-proof, E6.5 revenue
  // SELECT-only, E10.1 violations grant checks) — the dashboard does not
  // issue write probes from a read page; the badge cites the proof source.
  const wallChecks = await Promise.all(
    APPEND_ONLY_TABLES.map(async (table) => {
      const res = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      return { table, rows: res.count ?? 0, reachable: res.error == null };
    }),
  );
  const walled = wallChecks.filter((w) => w.reachable).length;

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.backups}{" "}
        <HelpTip text={dict.help.backups} />
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiWalled}
          value={`${walled}/${APPEND_ONLY_TABLES.length}`}
          glow
          drillHref="/sys/logs"
        />
        <Stat label={t.kpiDumpCadence} value={t.daily} drillHref="/sys/backups" />
        <Stat label={t.kpiTarget} value="dxb-backup-1" drillHref="/sys/backups" />
        <Stat label={t.kpiRestoreDrill} value="E13.0" drillHref="/gov/risks" />
      </div>

      <Panel title={t.wallsTitle}>
        <p className="mb-3 text-caption text-ink-muted">{t.wallsHint}</p>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2 2xl:grid-cols-3">
          {wallChecks.map((w) => (
            <li
              key={w.table}
              className="flex items-baseline justify-between gap-3 text-body-s"
            >
              <span className="font-data text-ink-secondary">{w.table}</span>
              <span className="flex items-center gap-2">
                <span className="font-data text-caption text-ink-muted tabular-nums">
                  {w.rows}
                </span>
                {w.reachable ? (
                  <StatusBadge level="ok">{t.wallOk}</StatusBadge>
                ) : (
                  <StatusBadge level="danger">{t.wallOpen}</StatusBadge>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={t.postureTitle}>
        <ul className="space-y-3 text-body-s">
          <li className="flex flex-wrap items-baseline gap-2">
            <StatusBadge level="ok">{t.badgeRepo}</StatusBadge>
            <span className="text-ink-secondary">{t.postureGit}</span>
          </li>
          <li className="flex flex-wrap items-baseline gap-2">
            <StatusBadge level="warn">{t.badgeOperator}</StatusBadge>
            <span className="text-ink-secondary">
              {t.postureDump}{" "}
              <code className="font-data text-caption text-ink-muted">
                ssh &lt;storagebox&gt; ls backups/ | tail -1
              </code>
            </span>
          </li>
          <li className="flex flex-wrap items-baseline gap-2">
            <StatusBadge level="warn">{t.badgeGate}</StatusBadge>
            <span className="text-ink-secondary">{t.postureDrill}</span>
          </li>
        </ul>
        <p className="mt-4 border-t border-edge-neutral pt-3 text-caption text-ink-muted">
          {t.honestyNote}
        </p>
      </Panel>

      <p className="text-caption text-ink-muted">
        <Link href="/fin/capacity" className="text-accent-champagne">
          {t.capacityLink}
        </Link>{" "}
        · {t.boundaryNote}
      </p>
    </div>
  );
}
