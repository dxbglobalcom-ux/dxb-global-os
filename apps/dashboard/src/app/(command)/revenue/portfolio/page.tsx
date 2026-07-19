import Link from "next/link";
import { Panel, StatusBadge, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /revenue/portfolio v1 (R1.4, REVENUE_ENGINE_SPEC §7) — allocations vs
// objectives: which halal opportunities carry which target, expected vs
// realized (drill to P&L), stopped rows with reasons kept visible (history
// truth). Mutations (allocate/rotate/stop) are the CEO-only control seam —
// v1 is the read surface; Control Mode actions arrive with the E12 idiom.

export const metadata = { title: "Portfolio — DXB" };

type AllocationRow = {
  id: string;
  objective_id: string;
  opportunity_id: string;
  expected_net_eur: number | null;
  committed_at: string;
  stopped_at: string | null;
  stop_reason: string | null;
};
type ObjectiveRow = { id: string; title: string };
type OpportunityRow = { id: string; title: string };

const eur = (n: number | null | undefined) =>
  n == null ? "—" : `€${Number(n).toFixed(2)}`;

export default async function RevenuePortfolioPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.revenue.ui;
  const supabase = await createClient();

  const [allocRes, objectivesRes, oppsRes] = await Promise.all([
    supabase
      .from("portfolio_allocations")
      .select(
        "id, objective_id, opportunity_id, expected_net_eur, committed_at, stopped_at, stop_reason",
      )
      .order("committed_at", { ascending: false }),
    supabase.from("objectives").select("id, title"),
    supabase.from("opportunities").select("id, title"),
  ]);

  const firstError = allocRes.error ?? objectivesRes.error ?? oppsRes.error;
  if (firstError) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.revenuePortfolio} state="error">
          <p className="text-body-s text-status-danger">{firstError.message}</p>
        </Panel>
      </div>
    );
  }

  const allocations = (allocRes.data ?? []) as unknown as AllocationRow[];
  const objectiveById = new Map(
    ((objectivesRes.data ?? []) as unknown as ObjectiveRow[]).map((o) => [o.id, o.title]),
  );
  const oppById = new Map(
    ((oppsRes.data ?? []) as unknown as OpportunityRow[]).map((o) => [o.id, o.title]),
  );

  const active = allocations.filter((a) => a.stopped_at == null);
  const stopped = allocations.filter((a) => a.stopped_at != null);

  const timeFmt = (iso: string) =>
    new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

  const AllocationList = ({ rows }: { rows: AllocationRow[] }) => (
    <ul className="space-y-2">
      {rows.map((a) => (
        <li
          key={a.id}
          className="rounded-input border border-edge-neutral bg-surface-graphite p-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="min-w-0 flex-1 truncate text-body-s text-ink-primary">
              {oppById.get(a.opportunity_id) ?? a.opportunity_id}
            </span>
            <span className="font-data text-body-s text-accent-champagne tabular-nums">
              {t.colExpected}: {eur(a.expected_net_eur)}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/revenue/objectives"
              className="text-caption text-ink-secondary underline-offset-2 hover:text-accent-champagne"
            >
              {t.colObjective}: {objectiveById.get(a.objective_id) ?? a.objective_id}
            </Link>
            <span className="font-data text-caption text-ink-muted tabular-nums">
              {t.colCommitted}: {timeFmt(a.committed_at)}
            </span>
            {a.stopped_at && (
              <>
                <span className="font-data text-caption text-ink-muted tabular-nums">
                  {t.colStopped}: {timeFmt(a.stopped_at)}
                </span>
                <StatusBadge level="warn">
                  {t.colReason}: {a.stop_reason ?? "—"}
                </StatusBadge>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.revenuePortfolio}{" "}
        <HelpTip text={dict.help.portfolio} />
      </h1>

      {allocations.length === 0 ? (
        <Panel title={t.portfolioTitle}>
          <p className="text-body-s text-ink-secondary">{t.portfolioEmpty}</p>
          <p className="mt-3 border-t border-edge-neutral pt-2 text-caption text-ink-muted">
            {t.boundariesNote}
          </p>
        </Panel>
      ) : (
        <div className="space-y-4">
          <Panel title={`${t.activeAllocations} (${active.length})`}>
            {active.length === 0 ? (
              <p className="text-body-s text-ink-secondary">{t.portfolioEmpty}</p>
            ) : (
              <AllocationList rows={active} />
            )}
          </Panel>
          {stopped.length > 0 && (
            <Panel title={`${t.stoppedAllocations} (${stopped.length})`}>
              <AllocationList rows={stopped} />
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
