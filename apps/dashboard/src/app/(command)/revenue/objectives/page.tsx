import { Panel, StatusBadge, type StatusLevel, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";
import { ObjectiveDoor } from "@/components/revenue/objective-door";

// /revenue/objectives v1 (R1.4, REVENUE_ENGINE_SPEC §7) — the Objective
// Contract register: every economic target with status machine, metric,
// period, proposer and evidence refs. Progress numbers come from
// v_objective_progress (realized = ledger − cost); the contract fields from
// the objectives base table (authenticated read, mutations control-fn only).

export const metadata = { title: "Objectives — DXB" };

type ObjectiveRow = {
  id: string;
  title: string;
  amount_eur: number;
  metric: string;
  period: string | null;
  capital_limit_eur: number;
  status: string;
  proposed_by: string | null;
  evidence_refs: unknown[];
  created_at: string;
};
type ProgressRow = {
  id: string;
  realized_net_eur: number;
  gap_eur: number;
  days_left: number | null;
  net_unverified: boolean;
};

const OBJECTIVE_BADGE: Record<string, StatusLevel> = {
  draft: "info",
  proposed: "warn",
  active: "ok",
  achieved: "ok",
  missed: "danger",
  closed: "info",
};

const eur = (n: number | null | undefined) => `€${Number(n ?? 0).toFixed(2)}`;

/** Postgres daterange text ("[2026-07-17,2026-08-17)") → display. */
function formatPeriod(period: string | null, locale: string): string | null {
  if (!period) return null;
  const m = period.match(/^[[(]([^,]*),([^)\]]*)[)\]]$/);
  if (!m) return period;
  const fmt = (s: string) =>
    s
      ? new Date(s).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
  return `${fmt(m[1])} → ${fmt(m[2])}`;
}

export default async function RevenueObjectivesPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.revenue.ui;
  const supabase = await createClient();

  const [objectivesRes, progressRes] = await Promise.all([
    supabase
      .from("objectives")
      .select(
        "id, title, amount_eur, metric, period, capital_limit_eur, status, proposed_by, evidence_refs, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("v_objective_progress")
      .select("id, realized_net_eur, gap_eur, days_left, net_unverified"),
  ]);

  const firstError = objectivesRes.error ?? progressRes.error;
  if (firstError) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.revenueObjectives} state="error">

          <p className="text-body-s text-status-danger">{firstError.message}</p>
        </Panel>
      </div>
    );
  }

  const objectives = (objectivesRes.data ?? []) as unknown as ObjectiveRow[];
  const progressById = new Map(
    ((progressRes.data ?? []) as unknown as ProgressRow[]).map((p) => [p.id, p]),
  );
  const statusLabels = t.statusLabels as Record<string, string>;

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.revenueObjectives}{" "}
        <HelpTip text={dict.help.objectives} />
      </h1>

      <Panel title={t.objectivesTitle}>
        <ObjectiveDoor
          labels={{
            title: t.doorTitle,
            hint: t.doorHint,
            amountLabel: t.doorAmount,
            nameLabel: t.doorName,
            namePlaceholder: t.doorNamePlaceholder,
            activateLabel: t.doorActivate,
            submit: t.doorSubmit,
            submitting: t.doorSubmitting,
            created: t.doorCreated,
            failed: t.doorFailed,
            capitalNote: t.doorCapitalNote,
          }}
        />

        {objectives.length === 0 ? (
          <p className="text-body-s text-ink-secondary">{t.objectivesEmpty}</p>
        ) : (
          <ul className="space-y-3">
            {objectives.map((o) => {
              const p = progressById.get(o.id);
              const period = formatPeriod(o.period, locale);
              // CEO design ruling 2026-07-17: minimal card — no evidence path,
              // no metric echo, proposer shown ONLY when it is a Hamza/agent
              // proposal (D4); self-evident CEO fields stay silent.
              const proposal = o.proposed_by && o.proposed_by !== "ceo";
              return (
                <li
                  key={o.id}
                  className="rounded-input border border-edge-neutral bg-surface-graphite p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-body text-ink-primary">{o.title}</span>
                    <span className="flex items-center gap-2">
                      {proposal && (
                        <StatusBadge level="info">
                          {t.colProposedBy}: {o.proposed_by}
                        </StatusBadge>
                      )}
                      <StatusBadge level={OBJECTIVE_BADGE[o.status] ?? "info"}>
                        {statusLabels[o.status] ?? o.status}
                      </StatusBadge>
                    </span>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4">
                    <div className="min-w-0">
                      <dt className="label-caps text-ink-muted">{t.kpiTarget}</dt>
                      <dd className="font-data text-body-s text-ink-primary tabular-nums">
                        {eur(o.amount_eur)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="label-caps text-ink-muted">{t.kpiRealized}</dt>
                      <dd className="font-data text-body-s text-ink-primary tabular-nums">
                        {p ? eur(p.realized_net_eur) : "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="label-caps text-ink-muted">{t.kpiGap}</dt>
                      <dd className="font-data text-body-s text-ink-primary tabular-nums">
                        {p ? eur(p.gap_eur) : "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="label-caps text-ink-muted">{t.kpiDaysLeft}</dt>
                      <dd className="font-data text-body-s text-ink-primary tabular-nums">
                        {p?.days_left != null ? p.days_left : "—"}
                      </dd>
                    </div>
                  </dl>

                  {(period || p?.net_unverified) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {period && (
                        <span className="font-data text-caption text-ink-muted tabular-nums">
                          {period}
                        </span>
                      )}
                      {p?.net_unverified && (
                        <StatusBadge level="warn">{t.netUnverified}</StatusBadge>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
