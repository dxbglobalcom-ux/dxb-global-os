import { HelpTip } from "@/components/primitives";
import { ModelsTable, type ModelStatsRow } from "@/components/ai/models-table";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /ai/models — E7.2 (MODEL_ROUTING_SPEC §7): the catalog with the full R3
// meta set from v_model_stats (real agent_runs aggregates — fake scores
// forbidden, §35). Mutations ride /api/control/models only.

export const metadata = { title: "Models — DXB" };

type StatsRow = {
  id: string;
  display_name: string | null;
  provider: string;
  context_window: number | null;
  cost_in_per_mtok: number | null;
  cost_out_per_mtok: number | null;
  speed_score: number | null;
  quality_score: number | null;
  status: string;
  banned: boolean;
  mechanical_only: boolean;
  fallback_of: string | null;
  runs_30d: number;
  success_rate_30d: number | null;
  cost_30d_eur: number;
  active_runs: number;
  assigned_employees: number;
  slot_assignments: number;
};

export default async function Page() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.aiModels;
  const supabase = await createClient();

  const { data } = await supabase
    .from("v_model_stats")
    .select("*")
    .order("id")
    .returns<StatsRow[]>();

  const models: ModelStatsRow[] = (data ?? []).map((r) => ({
    id: r.id,
    displayName: r.display_name,
    provider: r.provider,
    contextWindow: r.context_window,
    costIn: r.cost_in_per_mtok === null ? null : Number(r.cost_in_per_mtok),
    costOut: r.cost_out_per_mtok === null ? null : Number(r.cost_out_per_mtok),
    speedScore: r.speed_score,
    qualityScore: r.quality_score,
    status: r.status,
    banned: r.banned,
    mechanicalOnly: r.mechanical_only,
    fallbackOf: r.fallback_of,
    runs30d: r.runs_30d,
    successRate30d: r.success_rate_30d === null ? null : Number(r.success_rate_30d),
    cost30dEur: Number(r.cost_30d_eur),
    activeRuns: r.active_runs,
    assignedEmployees: r.assigned_employees,
    slotAssignments: r.slot_assignments,
  }));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-h2 text-ink-primary">
        {t.title}{" "}
        <HelpTip text={dict.help.models} />
      </h1>
        <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
      </header>
      <ModelsTable models={models} labels={{ ...t.ui, statuses: t.statuses, locale }} />
    </div>
  );
}
