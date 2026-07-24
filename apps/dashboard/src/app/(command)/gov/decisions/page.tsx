import { DecisionLogs, type DecisionRow } from "@/components/gov/decision-logs";
import { GovTabs } from "@/components/gov/gov-tabs";
import { Panel, HelpTip } from "@/components/primitives";
import { decisionAgingOrFilter } from "@/lib/decisions";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /gov/decisions — E8.4 (AUDIT_AND_LOGGING_SPEC §7): Decision Logs tab, the
// 8 questions of directive madde 10.2 as column headers, fed by
// v_decision_log (decision_log + run→employee/task context in one query).

export const metadata = { title: "Decision Logs — DXB" };

type ViewRow = {
  id: number;
  decided_by: string;
  decision: string;
  rationale: string;
  data_used: string[] | null;
  alternatives: unknown;
  confidence: number | null;
  risk: string | null;
  approval_id: string | null;
  outcome: string | null;
  created_at: string;
  run_id: string | null;
  task_id: string | null;
  employee: string | null;
  task_objective: string | null;
};

export default async function Page() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.decisions;
  const audit = getDict(locale).command.audit;
  const supabase = await createClient();

  // 9c decision aging (CEO order 2026-07-24): machine records auto-withdraw
  // from the CEO's view after DECISION_MACHINE_AGING_DAYS; the CEO's own
  // rows never age. The decision_log table keeps everything (archive).
  const { data } = await supabase
    .from("v_decision_log")
    .select("*")
    .or(decisionAgingOrFilter(new Date()))
    .order("id", { ascending: false })
    .limit(300);

  const rows: DecisionRow[] = ((data ?? []) as unknown as ViewRow[]).map((r) => ({
    id: r.id,
    decidedBy: r.decided_by,
    decision: r.decision,
    rationale: r.rationale,
    dataUsed: r.data_used,
    alternatives: r.alternatives,
    confidence: r.confidence === null ? null : Number(r.confidence),
    risk: r.risk,
    approvalId: r.approval_id,
    outcome: r.outcome,
    createdAt: r.created_at,
    runId: r.run_id,
    taskId: r.task_id,
    employee: r.employee,
    taskObjective: r.task_objective,
  }));

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-h2 text-ink-primary">
        {t.title}{" "}
        <HelpTip text={dict.help.decisions} />
      </h1>
          <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
        </div>
        <GovTabs active="decisions" labels={audit.tabs} />
      </header>
      <Panel>
        <DecisionLogs rows={rows} labels={t.ui} locale={locale} />
      </Panel>
    </div>
  );
}
