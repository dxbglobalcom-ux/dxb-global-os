import { AuditTrail, type AuditRow } from "@/components/gov/audit-trail";
import { GovTabs } from "@/components/gov/gov-tabs";
import { Panel, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /gov/audit — E8.4 (AUDIT_AND_LOGGING_SPEC §7/§8): unified time-stream on
// audit_log through v_audit_trail (detail_ref resolved server-side in one
// query), filters actor/entity/date/risk, row → family-record drill.
// Query+evidence surface — the live stream is /live's job (spec işbölümü).

export const metadata = { title: "Audit Trail — DXB" };

type TrailRow = {
  id: number;
  actor: string;
  actor_type: string;
  action: string;
  task_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  ref_table: string | null;
  ref_id: string | null;
  ref_summary: Record<string, unknown> | null;
  ref_risk: string | null;
};

export default async function Page() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.audit;
  const supabase = await createClient();

  const { data } = await supabase
    .from("v_audit_trail")
    .select("*")
    .order("id", { ascending: false })
    .limit(300);

  const rows: AuditRow[] = ((data ?? []) as unknown as TrailRow[]).map((r) => ({
    id: r.id,
    actor: r.actor,
    actorType: r.actor_type,
    action: r.action,
    taskId: r.task_id,
    payload: r.payload,
    createdAt: r.created_at,
    refTable: r.ref_table,
    refId: r.ref_id,
    refSummary: r.ref_summary,
    refRisk: r.ref_risk,
  }));

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-h2 text-ink-primary">
        {t.title}{" "}
        <HelpTip text={dict.help.audit} />
      </h1>
          <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
        </div>
        <GovTabs active="trail" labels={t.tabs} />
      </header>
      <Panel>
        <AuditTrail rows={rows} labels={t.ui} locale={locale} />
      </Panel>
    </div>
  );
}
