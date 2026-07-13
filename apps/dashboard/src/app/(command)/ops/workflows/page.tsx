import {
  WorkflowCenter,
  type AgentRunUi,
  type EmployeeOption,
  type RunRowUi,
  type StepRowUi,
  type WorkflowRowUi,
} from "@/components/command/workflow-center";
import { Panel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /ops/workflows — E9.2 (WORKFLOW_ENGINE_SPEC §7, madde 6.4's 17 items).
// Definitions + runs read from the 0023x tables (RLS read policies,
// 20260711002300); every mutation goes through /api/control/workflows.

export const metadata = { title: "Workflows — DXB" };

type AgentRunRaw = {
  id: string;
  workflow_run_id: string | null;
  status: string;
  model_id: string | null;
  started_at: string;
  tokens_in: number;
  tokens_out: number;
  employee_id: string | null;
};

export default async function Page() {
  const locale = await getLocale();
  const t = getDict(locale).command.workflows;
  const supabase = await createClient();

  const [wfRes, stepsRes, runsRes, agentRunsRes, employeesRes, slotsRes, modelsRes] =
    await Promise.all([
      supabase.from("workflows").select("*").order("name"),
      supabase.from("workflow_steps").select("workflow_id,seq,kind,config"),
      supabase
        .from("workflow_runs")
        .select("id,workflow_id,status,triggered_by,current_step,started_at,ended_at")
        .order("started_at", { ascending: false })
        .limit(200),
      supabase
        .from("agent_runs")
        .select("id,workflow_run_id,status,model_id,started_at,tokens_in,tokens_out,employee_id")
        .not("workflow_run_id", "is", null)
        .order("started_at", { ascending: false })
        .limit(400),
      // HR gate mirror (the fn is the wall): non-archived + persona v2 only.
      supabase
        .from("agents")
        .select("id,slug,department,employment_status,persona_version")
        .neq("employment_status", "archived")
        .like("persona_version", "v2%")
        .order("slug")
        .limit(400),
      supabase.rpc("fn_routing_slots"),
      supabase.from("model_catalog").select("id,display_name").eq("status", "active").order("id"),
    ]);

  const employees: EmployeeOption[] = ((employeesRes.data ?? []) as EmployeeOption[]).map(
    ({ id, slug, department }) => ({ id, slug, department }),
  );
  const slugById = new Map(employees.map((e) => [e.id, e.slug]));
  const agentRuns: AgentRunUi[] = ((agentRunsRes.data ?? []) as AgentRunRaw[]).map((r) => ({
    id: r.id,
    workflow_run_id: r.workflow_run_id,
    status: r.status,
    model_id: r.model_id,
    employee_slug: r.employee_id ? (slugById.get(r.employee_id) ?? null) : null,
    started_at: r.started_at,
    tokens_in: r.tokens_in,
    tokens_out: r.tokens_out,
  }));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-h2 text-ink-primary">{t.title}</h1>
        <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
      </header>
      <Panel>
        <WorkflowCenter
          workflows={(wfRes.data ?? []) as WorkflowRowUi[]}
          steps={(stepsRes.data ?? []) as StepRowUi[]}
          runs={(runsRes.data ?? []) as RunRowUi[]}
          agentRuns={agentRuns}
          employees={employees}
          slots={(slotsRes.data ?? []) as string[]}
          models={(modelsRes.data ?? []) as { id: string; display_name: string | null }[]}
          labels={t.ui}
          locale={locale}
        />
      </Panel>
    </div>
  );
}
