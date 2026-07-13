import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel, StatusBadge, type StatusLevel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /gov/audit/[id] — E8.4 (CEO_COMMAND_CENTER drill map: "Audit satırı →
// /gov/audit/[id] tam kayıt + ilgili değişiklik diff'i"). Full audit record:
// raw payload, resolved detail_ref family record, task bridge. diff_summary
// (not full diff — §16, commit_sha is the git bridge) rides ref_summary.

export const metadata = { title: "Audit Record — DXB" };

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

const RISK_LEVEL: Record<string, StatusLevel> = {
  low: "ok",
  medium: "warn",
  high: "danger",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="contents">
      <dt className="label-caps text-ink-muted">{label}</dt>
      <dd className="break-all font-data text-body-s text-ink-secondary">{children}</dd>
    </div>
  );
}

function KeyValueGrid({ obj }: { obj: Record<string, unknown> }) {
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
      {Object.entries(obj).map(([k, v]) => (
        <Field key={k} label={k}>
          {v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v)}
        </Field>
      ))}
    </dl>
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const locale = await getLocale();
  const t = getDict(locale).command.audit;
  const supabase = await createClient();

  const { data } = await supabase
    .from("v_audit_trail")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();
  if (!data) notFound();
  const row = data as unknown as TrailRow;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-h2 text-ink-primary">
            {t.recordTitle} <span className="font-data tabular-nums">#{row.id}</span>
          </h1>
          <p className="mt-1 font-data text-body-s text-ink-secondary">
            {new Date(row.created_at).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB")}
          </p>
        </div>
        <Link href="/gov/audit" className="text-body-s text-accent-champagne hover:underline">
          ← {t.backToTrail}
        </Link>
      </header>

      <Panel>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2">
          <Field label={t.ui.colActor}>
            <span className="inline-flex items-center gap-2">
              <StatusBadge level={row.actor_type === "ceo" ? "info" : row.actor_type === "agent" ? "ok" : "warn"}>{t.ui.actorTypes[row.actor_type as keyof typeof t.ui.actorTypes] ?? row.actor_type}</StatusBadge>
              {row.actor}
            </span>
          </Field>
          <Field label={t.ui.colAction}>{row.action}</Field>
          {row.ref_risk && (
            <Field label={t.ui.colRisk}>
              <StatusBadge level={RISK_LEVEL[row.ref_risk] ?? "info"}>{t.ui.risks[row.ref_risk as keyof typeof t.ui.risks] ?? row.ref_risk}</StatusBadge>
            </Field>
          )}
          {row.task_id && (
            <Field label={t.ui.taskLink}>
              <Link href={`/tasks/${row.task_id}`} className="text-accent-champagne hover:underline">
                {row.task_id}
              </Link>
            </Field>
          )}
        </dl>
      </Panel>

      <Panel>
        <h2 className="label-caps mb-3 text-ink-muted">{t.ui.drillPayload}</h2>
        <KeyValueGrid obj={row.payload} />
      </Panel>

      <Panel>
        <h2 className="label-caps mb-3 text-ink-muted">
          {t.ui.drillRefRecord}
          {row.ref_table ? ` — ${t.ui.entities[row.ref_table as keyof typeof t.ui.entities] ?? row.ref_table} #${row.ref_id}` : ""}
        </h2>
        {row.ref_summary ? (
          <KeyValueGrid obj={row.ref_summary} />
        ) : (
          <p className="text-body-s text-ink-muted">{t.ui.drillNoRef}</p>
        )}
      </Panel>
    </div>
  );
}
