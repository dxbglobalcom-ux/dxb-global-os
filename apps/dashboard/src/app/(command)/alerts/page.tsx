import {
  AlertCenter,
  type AgentOption,
  type AlertRow,
} from "@/components/command/alert-center";
import { Panel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /alerts — E8.4b (OBSERVABILITY_SPEC §5 AlertCenter, GAP-10). Active queue
// from v_alerts_active (severity → unacked → age; pending critical approvals
// ride along, CC-SPEC §4); resolved history straight from alerts. Lifecycle
// ops via /api/control/alerts only.

export const metadata = { title: "Alerts — DXB" };

type ActiveRow = {
  kind: string;
  id: string;
  level: string;
  title: string;
  source: string;
  at: string;
  acknowledged_at: string | null;
  responsible_slug: string | null;
  affected_area: string | null;
  escalated_at: string | null;
  task_id: string | null;
};

type ResolvedRow = {
  id: string;
  level: string;
  title: string;
  source: string;
  at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  affected_area: string | null;
  probable_cause: string | null;
  suggested_action: string | null;
  mitigation: string | null;
  ceo_action: string | null;
  escalated_from: string | null;
  task_id: string | null;
};

type DetailRow = ResolvedRow & { responsible_employee: string | null };

export default async function Page() {
  const locale = await getLocale();
  const t = getDict(locale).command.alerts;
  const supabase = await createClient();

  const [activeRes, detailRes, resolvedRes, agentsRes] = await Promise.all([
    supabase.from("v_alerts_active").select("*").limit(200),
    supabase
      .from("alerts")
      .select(
        "id,level,title,source,at,acknowledged_at,resolved_at,affected_area,probable_cause,suggested_action,mitigation,ceo_action,escalated_from,task_id,responsible_employee",
      )
      .is("resolved_at", null),
    supabase
      .from("alerts")
      .select(
        "id,level,title,source,at,acknowledged_at,resolved_at,affected_area,probable_cause,suggested_action,mitigation,ceo_action,escalated_from,task_id,responsible_employee",
      )
      .not("resolved_at", "is", null)
      .order("resolved_at", { ascending: false })
      .limit(100),
    supabase.from("agents").select("id,slug").order("slug").limit(300),
  ]);

  // v_alerts_active carries the ordering + approval union; the detail query
  // fills the drill fields the view keeps compact.
  const detailById = new Map(
    ((detailRes.data ?? []) as unknown as DetailRow[]).map((d) => [d.id, d]),
  );
  const active: AlertRow[] = ((activeRes.data ?? []) as unknown as ActiveRow[]).map((r) => {
    const d = r.kind === "alert" ? detailById.get(r.id) : undefined;
    return {
      kind: r.kind,
      id: r.id,
      level: r.level,
      title: r.title,
      source: r.source,
      at: r.at,
      acknowledgedAt: r.acknowledged_at,
      resolvedAt: null,
      responsibleSlug: r.responsible_slug,
      affectedArea: r.affected_area,
      probableCause: d?.probable_cause ?? null,
      suggestedAction: d?.suggested_action ?? null,
      mitigation: d?.mitigation ?? null,
      ceoAction: d?.ceo_action ?? null,
      escalatedFrom: d?.escalated_from ?? null,
      taskId: r.task_id,
    };
  });

  const resolved: AlertRow[] = ((resolvedRes.data ?? []) as unknown as ResolvedRow[]).map(
    (r) => ({
      kind: "alert",
      id: r.id,
      level: r.level,
      title: r.title,
      source: r.source,
      at: r.at,
      acknowledgedAt: r.acknowledged_at,
      resolvedAt: r.resolved_at,
      responsibleSlug: null,
      affectedArea: r.affected_area,
      probableCause: r.probable_cause,
      suggestedAction: r.suggested_action,
      mitigation: r.mitigation,
      ceoAction: r.ceo_action,
      escalatedFrom: r.escalated_from,
      taskId: r.task_id,
    }),
  );

  const agents: AgentOption[] = (agentsRes.data ?? []) as AgentOption[];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-h2 text-ink-primary">{t.title}</h1>
        <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
      </header>
      <Panel>
        <AlertCenter
          active={active}
          resolved={resolved}
          agents={agents}
          labels={t.ui}
          locale={locale}
        />
      </Panel>
    </div>
  );
}
