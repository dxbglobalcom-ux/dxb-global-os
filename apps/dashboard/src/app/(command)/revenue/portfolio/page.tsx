import Link from "next/link";
import { Panel, StatusBadge, HelpTip } from "@/components/primitives";
import {
  EngineResponsibility,
  type EngineCard,
} from "@/components/revenue/engine-responsibility";
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
type OpportunityRow = { id: string; title: string; engine_slug: string | null };
type EngineRow = {
  slug: string;
  title: string;
  title_tr: string | null;
  lifecycle: string;
  owner_department: string | null;
};
type AgentRow = {
  id: string;
  title: string | null;
  title_tr: string | null;
  department: string;
  brain: string;
  brain_source: "default" | "slot" | "ceo_override";
};

const eur = (n: number | null | undefined) =>
  n == null ? "—" : `€${Number(n).toFixed(2)}`;

export default async function RevenuePortfolioPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.revenue.ui;
  const supabase = await createClient();

  // 10d/10e: engines carry the responsibility chain (owner department →
  // active employees → brains); the model select offers ACTIVE catalog rows
  // only (§4b: banned/testing models are unassignable — the DB fn re-checks).
  const [allocRes, objectivesRes, oppsRes, enginesRes, agentsRes, deptRes, modelsRes] =
    await Promise.all([
      supabase
        .from("portfolio_allocations")
        .select(
          "id, objective_id, opportunity_id, expected_net_eur, committed_at, stopped_at, stop_reason",
        )
        .order("committed_at", { ascending: false }),
      supabase.from("objectives").select("id, title"),
      supabase.from("opportunities").select("id, title, engine_slug"),
      supabase
        .from("revenue_engines")
        .select("slug, title, title_tr, lifecycle, owner_department")
        .order("title"),
      supabase
        .from("agents")
        .select("id, title, title_tr, department, brain, brain_source")
        .eq("employment_status", "active"),
      supabase.from("departments").select("slug").order("slug"),
      supabase
        .from("model_catalog")
        .select("id, display_name")
        .eq("status", "active")
        .eq("banned", false)
        .order("id"),
    ]);

  const firstError =
    allocRes.error ??
    objectivesRes.error ??
    oppsRes.error ??
    enginesRes.error ??
    agentsRes.error ??
    deptRes.error ??
    modelsRes.error;
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
  const opps = (oppsRes.data ?? []) as unknown as OpportunityRow[];
  const oppById = new Map(opps.map((o) => [o.id, o.title]));
  const oppEngineById = new Map(opps.map((o) => [o.id, o.engine_slug]));

  // U21: value stays the frozen id (the control door keys on it), label is the
  // CEO-visible catalog name — no dashboard surface prints a raw model id.
  const models = (
    (modelsRes.data ?? []) as Array<{ id: string; display_name: string | null }>
  ).map((m) => ({ id: m.id, label: m.display_name ?? m.id }));
  const modelNameById = new Map(models.map((m) => [m.id, m.label]));

  // 10d responsibility chain: engine → owner department → active employees
  // (locale-resolved titles, current brain each).
  const engines = (enginesRes.data ?? []) as unknown as EngineRow[];
  const agents = (agentsRes.data ?? []) as unknown as AgentRow[];
  const byDept = new Map<string, AgentRow[]>();
  for (const a of agents) {
    const list = byDept.get(a.department) ?? [];
    list.push(a);
    byDept.set(a.department, list);
  }
  const engineCards: EngineCard[] = engines.map((e) => ({
    slug: e.slug,
    title: (locale === "tr" ? e.title_tr : null) ?? e.title,
    lifecycle: e.lifecycle,
    ownerDept: e.owner_department,
    employees: (e.owner_department ? (byDept.get(e.owner_department) ?? []) : [])
      .map((a) => ({
        id: a.id,
        title: ((locale === "tr" ? a.title_tr : null) ?? a.title) || a.id,
        // §4b truth: seed-default brain is "not assigned", never a chosen model
        brain:
          a.brain_source === "default"
            ? t.brainUnassigned
            : (modelNameById.get(a.brain) ?? a.brain),
      }))
      .sort((x, y) => x.title.localeCompare(y.title)),
  }));
  const engineTitleBySlug = new Map(engineCards.map((e) => [e.slug, e.title]));
  const engineOwnerBySlug = new Map(engines.map((e) => [e.slug, e.owner_department]));
  const departments = ((deptRes.data ?? []) as Array<{ slug: string }>).map((d) => d.slug);

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
            {(() => {
              // 10d: the allocation inherits its engine's responsibility line.
              const slug = oppEngineById.get(a.opportunity_id);
              if (!slug) return null;
              const owner = engineOwnerBySlug.get(slug);
              return (
                <span className="text-caption text-ink-secondary">
                  {t.colEngine}: {engineTitleBySlug.get(slug) ?? slug}
                  {owner ? ` · ${t.respOwner}: ${owner}` : ""}
                </span>
              );
            })()}
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

      {/* 10d/10e — who works on each engine and which model is responsible;
          owner + brain changes ride the audited CEO doors. */}
      <Panel title={t.respTitle}>
        <p className="mb-3 text-caption text-ink-muted">{t.respHint}</p>
        <EngineResponsibility
          engines={engineCards}
          departments={departments}
          models={models}
          labels={{
            owner: t.respOwner,
            noOwner: t.respNoOwner,
            setOwner: t.respSetOwner,
            pickDept: t.respPickDept,
            employees: t.respEmployees,
            brains: t.respBrains,
            showPeople: t.respShowPeople,
            hidePeople: t.respHidePeople,
            changeModel: t.respChangeModel,
            pickModel: t.respPickModel,
            apply: t.respApply,
            working: t.respWorking,
            applied: t.respApplied,
            failed: t.respFailed,
            noPeople: t.respNoPeople,
            lifecycle: t.lifecycleLabels,
          }}
        />
      </Panel>

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
