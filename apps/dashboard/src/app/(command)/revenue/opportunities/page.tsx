import { Panel, StatusBadge, type StatusLevel, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { fill, fmtEur, isCapitalBlocked } from "@/lib/revenue-capital";
import { createClient } from "@/lib/supabase/server";

// /revenue/opportunities v1 (R1.4, REVENUE_ENGINE_SPEC §7) — the pipeline
// board: state columns in machine order, halal badge on every card (the G2
// gate is VISIBLE, never implicit), 12-dim score breakdown for scored rows.
// Source: v_opportunity_pipeline (engine titles joined). Empty state honest:
// the first daily scan time is stated, no dummy cards (§35).

export const metadata = { title: "Opportunities — DXB" };

type PipelineRow = {
  id: string;
  title: string;
  title_tr: string | null;
  state: string;
  halal_verdict: string;
  score: number | null;
  score_dims: Record<string, number> | null;
  capital_required_eur: number;
  region: string | null;
  channel: string | null;
  engine_slug: string;
  engine_title: string;
  engine_title_tr: string;
  created_by: string | null;
  created_at: string;
};

const STATE_ORDER = [
  "discovered",
  "scored",
  "shortlisted",
  "piloting",
  "scaling",
  "retired",
  "rejected",
] as const;

const HALAL_BADGE: Record<string, StatusLevel> = {
  pending: "info",
  halal: "ok",
  haram: "danger",
  review: "warn",
};

export default async function RevenueOpportunitiesPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.revenue.ui;
  const supabase = await createClient();

  // The ceiling and the objective it comes from arrive as ONE row
  // (v_revenue_capital_ceiling, migration 20260726016000): the number is
  // fn_revenue_capital_limit()'s — U32 keeps it the single source — and the
  // name sits beside it, so the board can never attribute a ceiling to the
  // wrong objective. A limit with no visible origin is a number the CEO
  // cannot act on.
  const [pipelineRes, ceilingRes] = await Promise.all([
    supabase
      .from("v_opportunity_pipeline")
      .select(
        "id, title, title_tr, state, halal_verdict, score, score_dims, capital_required_eur, region, channel, engine_slug, engine_title, engine_title_tr, created_by, created_at",
      ),
    supabase.from("v_revenue_capital_ceiling").select("limit_eur, objective_title").limit(1),
  ]);

  const ceiling = ceilingRes.data?.[0] as
    | { limit_eur: number | null; objective_title: string | null }
    | undefined;
  const capitalLimit = Number(ceiling?.limit_eur ?? 0);
  const activeObjective = ceiling?.objective_title ?? null;

  if (pipelineRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.revenueOpportunities} state="error">
          <p className="text-body-s text-status-danger">
            {pipelineRes.error.message}
          </p>
        </Panel>
      </div>
    );
  }

  const rows = (pipelineRes.data ?? []) as unknown as PipelineRow[];
  const stateLabels = t.stateLabels as Record<string, string>;
  const halalLabels = t.halalLabels as Record<string, string>;
  const dimLabels = t.dimLabels as Record<string, string>;

  const byState = STATE_ORDER.map((state) => ({
    state,
    items: rows.filter((r) => r.state === state),
  })).filter((col) => col.items.length > 0);

  const blockedCount = rows.filter((r) =>
    isCapitalBlocked(r.capital_required_eur, capitalLimit, r.state),
  ).length;

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.revenueOpportunities}{" "}
        <HelpTip text={dict.help.opportunities} />
      </h1>

      {rows.length === 0 ? (
        <Panel title={t.pipelineTitle}>
          <p className="text-body-s text-ink-secondary">{t.pipelineEmpty}</p>
          <p className="mt-3 border-t border-edge-neutral pt-2 text-caption text-ink-muted">
            {t.boundariesNote}
          </p>
        </Panel>
      ) : (
        <>
          {/* The ceiling line, W2.3b. The G4 refusal used to live only in
              audit_log, so a candidate stopped by MONEY looked exactly like one
              stopped by merit — and the CEO is the only person who can raise the
              ceiling. The line states the number, where it came from, and how
              many candidates are waiting on it. */}
          <p
            data-testid="capital-ceiling"
            className="text-caption text-ink-secondary"
          >
            <span className="font-data tabular-nums">
              {fill(t.capitalLimitLine, { limit: fmtEur(capitalLimit) })}
            </span>
            {" — "}
            <span className="text-ink-muted">
              {activeObjective
                ? fill(t.capitalLimitFrom, { title: activeObjective })
                : t.capitalLimitNoObjective}
            </span>
            {blockedCount > 0 ? (
              <>
                {" · "}
                <span className="text-status-warn">
                  {/* one form per count: "1 candidate(s)" is the kind of
                      machine-shaped text the CEO reads as sloppiness */}
                  {blockedCount === 1
                    ? t.capitalBlockedCountOne
                    : fill(t.capitalBlockedCount, { n: blockedCount })}
                </span>
              </>
            ) : null}
          </p>
          <p className="text-caption text-ink-muted">{t.boundariesNote}</p>
          <div className="space-y-4">
            {byState.map((col) => (
              <Panel
                key={col.state}
                title={`${stateLabels[col.state] ?? col.state} (${col.items.length})`}
              >
                <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
                  {col.items.map((r) => {
                    const blocked = isCapitalBlocked(
                      r.capital_required_eur,
                      capitalLimit,
                      r.state,
                    );
                    return (
                    <li
                      key={r.id}
                      className={`rounded-input border bg-surface-graphite p-3 ${
                        blocked ? "border-status-warn/50" : "border-edge-neutral"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0 flex-1 text-body-s text-ink-primary">
                          {/* The scout writes both legs while it still has the
                              source page in front of it; the CEO's screen shows
                              his. An untranslated row falls back rather than
                              rendering blank (honest over pretty). */}
                          {(locale === "tr" ? r.title_tr : r.title) || r.title}
                        </span>
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                          {blocked ? (
                            <StatusBadge level="warn">{t.capitalBlocked}</StatusBadge>
                          ) : null}
                          <StatusBadge level={HALAL_BADGE[r.halal_verdict] ?? "info"}>
                            {halalLabels[r.halal_verdict] ?? r.halal_verdict}
                          </StatusBadge>
                        </div>
                      </div>

                      {blocked ? (
                        <p
                          data-testid="capital-blocked-detail"
                          className="mt-1.5 text-caption text-status-warn"
                        >
                          {fill(t.capitalBlockedDetail, {
                            needed: fmtEur(r.capital_required_eur),
                            limit: fmtEur(capitalLimit),
                          })}
                        </p>
                      ) : null}

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-caption text-ink-secondary">
                          {locale === "tr" ? r.engine_title_tr : r.engine_title}
                        </span>
                        <span
                          className={`font-data text-caption tabular-nums ${
                            blocked ? "text-status-warn" : "text-ink-muted"
                          }`}
                        >
                          {t.colCapital}: {fmtEur(r.capital_required_eur)}
                        </span>
                        {r.region && (
                          <span className="text-caption text-ink-muted">{r.region}</span>
                        )}
                        <span className="font-data text-caption tabular-nums">
                          {r.score != null ? (
                            <span className="text-accent-champagne">
                              {t.colScore}: {Number(r.score).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-ink-muted">{t.unscored}</span>
                          )}
                        </span>
                      </div>

                      {r.score_dims && (
                        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 border-t border-edge-neutral pt-2 md:grid-cols-3">
                          {Object.entries(r.score_dims).map(([dim, val]) => (
                            <div
                              key={dim}
                              className="flex items-baseline justify-between gap-2"
                            >
                              <dt className="truncate text-caption text-ink-muted">
                                {dimLabels[dim] ?? dim}
                              </dt>
                              <dd className="font-data text-caption text-ink-secondary tabular-nums">
                                {Number(val).toFixed(0)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </li>
                    );
                  })}
                </ul>
              </Panel>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
