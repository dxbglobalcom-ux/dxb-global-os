import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel, StatusBadge, type StatusLevel } from "@/components/primitives";
import { PayloadView } from "@/components/approvals/approval-card";
import {
  ApprovalActions,
  type EmployeeOption,
  type ModelOption,
  type RuleOption,
} from "@/components/command/approval-actions";
import type { CenterViewRow } from "@/lib/approvals-center";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /approvals/[id] — ApprovalDetail (E9.3, APPROVAL_ENGINE §5 R3 detail set):
// full context (readable payload — R5), alternatives, decision history
// (decision_log + previous_reviews + the decided fields), related files/
// tasks, previous reviews, cost impact, risk impact, context age (§26).
// Pending rows carry the 7-action island (control_approvals_action seam).

export const metadata = { title: "Approval — DXB" };

const RISK_LEVEL: Record<string, StatusLevel> = {
  low: "info",
  medium: "warn",
  high: "danger",
  critical: "critical",
};

type DecisionLogRow = {
  id: number;
  decided_by: string;
  decision: string;
  rationale: string;
  created_at: string;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="contents">
      <dt className="label-caps text-ink-muted">{label}</dt>
      <dd className="break-words text-body-s text-ink-secondary">{children}</dd>
    </div>
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const t = getDict(locale).command.approvals;
  const d = t.detail;
  const riskLabels = t.ui.riskLevels as Record<string, string>;
  const statusLabels = t.statuses as Record<string, string>;
  const classLabels = t.ui.classes as Record<string, string>;
  const reviewTypeLabels = d.reviewTypes as Record<string, string>;
  const actionLabels = t.ui.actions as Record<string, string>;
  const supabase = await createClient();

  const [rowRes, decisionsRes, employeesRes, modelsRes, rulesRes] = await Promise.all([
    supabase.from("v_approvals_center").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("decision_log")
      .select("id,decided_by,decision,rationale,created_at")
      .eq("approval_id", id)
      .order("id", { ascending: true }),
    supabase
      .from("agents")
      .select("id,slug")
      .neq("employment_status", "archived")
      .order("slug")
      .limit(300),
    supabase
      .from("model_catalog")
      .select("id,display_name")
      .eq("banned", false)
      .eq("status", "active")
      .order("quality_score", { ascending: false }),
    supabase
      .from("approval_rules")
      .select("id,operation_pattern,risk_class,gate,locked,enabled")
      .order("priority"),
  ]);

  const row = rowRes.data as unknown as CenterViewRow | null;
  if (!row) notFound();

  const decisions = (decisionsRes.data ?? []) as DecisionLogRow[];
  const employees = (employeesRes.data ?? []) as EmployeeOption[];
  const models: ModelOption[] = ((modelsRes.data ?? []) as { id: string; display_name: string }[]).map(
    (m) => ({ id: m.id, displayName: m.display_name }),
  );
  const rules: RuleOption[] = (
    (rulesRes.data ?? []) as {
      id: string;
      operation_pattern: string;
      risk_class: string;
      gate: string;
      locked: boolean;
      enabled: boolean;
    }[]
  ).map((r) => ({
    id: r.id,
    operationPattern: r.operation_pattern,
    riskClass: r.risk_class,
    gate: r.gate,
    locked: r.locked,
    enabled: r.enabled,
  }));

  const reviews = Array.isArray(row.previous_reviews)
    ? (row.previous_reviews as Array<Record<string, unknown>>)
    : [];
  const alternatives = Array.isArray(row.alternatives)
    ? (row.alternatives as Array<Record<string, unknown>>)
    : [];
  const isPending = row.status === "pending";
  const ageHours = Math.round(Number(row.age_seconds) / 3600);
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  // DESIGN §16: money_out record carries the gold double edge + lock cue.
  const frame = row.money_out ? "border-2 border-double border-edge-champagne" : undefined;

  return (
    <div className="mx-auto max-w-[1100px] space-y-4">
      <header className="flex flex-wrap items-center gap-3">
        <Link href="/approvals" className="text-body-s text-accent-champagne hover:underline">
          ← {t.title}
        </Link>
        <h1 className="font-display text-h2 text-ink-primary">
          {row.purpose ?? row.operation ?? row.action_type}
        </h1>
        <StatusBadge level={RISK_LEVEL[row.risk_class] ?? "warn"}>
          {riskLabels[row.risk_class] ?? row.risk_class}
        </StatusBadge>
        {row.money_out && <span className="label-caps text-accent-champagne">{t.ui.moneyOut}</span>}
        {row.expired && <span className="label-caps text-status-danger">{t.ui.expired}</span>}
        {!row.expired && row.stale && (
          <span className="label-caps text-status-warn">{t.ui.stale}</span>
        )}
        <span className="ml-auto label-caps text-ink-muted">
          {d.status}: {statusLabels[row.status] ?? row.status}
        </span>
      </header>

      <div className={frame ? `rounded-panel ${frame}` : undefined}>
        <Panel title={d.contextTitle}>
          <dl className="grid gap-x-6 gap-y-1.5 md:grid-cols-[max-content_1fr]">
            <Field label={t.ui.operation}>
              <span className="font-data">{row.operation ?? row.action_type}</span>
            </Field>
            {row.requester_slug && (
              <Field label={t.ui.requester}>
                {row.requester_slug}
                {locale === "tr"
                  ? row.requester_title_tr && ` · ${row.requester_title_tr}`
                  : row.requester_title && ` · ${row.requester_title}`}
              </Field>
            )}
            {row.department && (
              <Field label={t.ui.department}>
                {(locale === "tr" ? row.department_display_tr : row.department_display) ??
                  row.department}
              </Field>
            )}
            {row.project_name && <Field label={d.project}>{row.project_name}</Field>}
            <Field label={d.classLabel}>
              {classLabels[row.operation_class ?? "other"] ?? (row.operation_class ?? "—")}
            </Field>
            {row.cost_estimate !== null && (
              <Field label={t.ui.costEstimate}>
                <span className="font-data tabular-nums">
                  €{Number(row.cost_estimate).toFixed(2)}
                </span>
              </Field>
            )}
            {row.deadline && (
              <Field label={t.ui.deadline}>
                <span className="font-data tabular-nums">{fmt(row.deadline)}</span>
              </Field>
            )}
            {row.task_budget_ceiling_eur !== null && (
              <Field label={t.ui.taskBudgetCeiling}>
                <span className="font-data tabular-nums">
                  €{Number(row.task_budget_ceiling_eur).toFixed(2)}
                </span>
              </Field>
            )}
            {!row.deadline && row.task_due_at && (
              <Field label={t.ui.taskDue}>
                <span className="font-data tabular-nums">{fmt(row.task_due_at)}</span>
              </Field>
            )}
            {row.model_to_use && (
              <Field label={d.modelToUse}>
                <span className="font-data">{row.model_to_use}</span>
              </Field>
            )}
            {row.affected_systems && row.affected_systems.length > 0 && (
              <Field label={d.affectedSystems}>{row.affected_systems.join(", ")}</Field>
            )}
            {row.recommended_action && (
              <Field label={t.ui.recommended}>{row.recommended_action}</Field>
            )}
            {row.reasoning_summary && <Field label={t.ui.reasoning}>{row.reasoning_summary}</Field>}
            <Field label={d.contextAge}>
              <span className="font-data tabular-nums">
                {ageHours}
                {t.ui.hours}
              </span>{" "}
              · {fmt(row.created_at)}
            </Field>
            {row.delegated_to_slug && (
              <Field label={t.ui.delegated}>{row.delegated_to_slug}</Field>
            )}
          </dl>

          <div className="mt-3">
            <PayloadView payload={row.payload ?? {}} open text={t.ui.payloadText} />
          </div>
        </Panel>
      </div>

      {alternatives.length > 0 && (
        <Panel title={d.alternativesTitle}>
          <ul className="space-y-1">
            {alternatives.map((a, i) => (
              <li key={i} className="text-body-s text-ink-secondary">
                {typeof a === "object" && a !== null
                  ? Object.entries(a)
                      .map(([k, v]) => `${k}: ${String(v)}`)
                      .join(" · ")
                  : String(a)}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {(row.affected_files?.length ?? 0) > 0 || row.task_id ? (
        <Panel title={d.relatedTitle}>
          <div className="space-y-1">
            {row.task_id && (
              <Link
                href={`/tasks/${row.task_id}`}
                className="block text-body-s text-accent-champagne hover:underline"
              >
                {d.taskLink}: {row.task_objective ?? row.task_id} →
              </Link>
            )}
            {(row.affected_files ?? []).map((f) => (
              <div key={f} className="font-data text-body-s text-ink-secondary">
                {f}
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel title={d.historyTitle}>
        {decisions.length === 0 && reviews.length === 0 && !row.decided_at ? (
          <p className="text-body-s text-ink-muted">{d.historyEmpty}</p>
        ) : (
          <ol className="space-y-2">
            {reviews.map((r, i) => (
              <li key={`review-${i}`} className="flex flex-wrap items-baseline gap-2">
                <span className="label-caps text-ink-muted">
                  {reviewTypeLabels[String(r.type)] ?? String(r.type ?? "review")}
                </span>
                <span className="text-body-s text-ink-secondary">
                  {[r.note, r.to, r.model, r.verdict]
                    .filter((v) => typeof v === "string" && v)
                    .join(" · ") || "—"}
                </span>
                {typeof r.at === "string" && (
                  <span className="font-data text-caption tabular-nums text-ink-muted">
                    {fmt(r.at)}
                  </span>
                )}
              </li>
            ))}
            {decisions.map((dl) => (
              <li key={`dl-${dl.id}`} className="flex flex-wrap items-baseline gap-2">
                <span className="label-caps text-accent-champagne">
                  {actionLabels[dl.decision] ?? dl.decision}
                </span>
                <span className="text-body-s text-ink-secondary">{dl.rationale}</span>
                <span className="font-data text-caption tabular-nums text-ink-muted">
                  {dl.decided_by} · {fmt(dl.created_at)}
                </span>
              </li>
            ))}
            {row.decided_at && (
              <li className="flex flex-wrap items-baseline gap-2">
                <span className="label-caps text-ink-primary">
                  {actionLabels[row.decided_action ?? ""] ?? row.decided_action}
                </span>
                {row.decision_note && (
                  <span className="text-body-s text-ink-secondary">{row.decision_note}</span>
                )}
                <span className="font-data text-caption tabular-nums text-ink-muted">
                  {row.decided_by} · {fmt(row.decided_at)}
                </span>
              </li>
            )}
          </ol>
        )}
        {row.modifications && Object.keys(row.modifications).length > 0 && (
          <div className="mt-3 border-t border-edge-neutral pt-2">
            <div className="label-caps text-ink-muted">{d.modificationsTitle}</div>
            <ul className="mt-1 space-y-0.5">
              {Object.entries(row.modifications).map(([k, v]) => (
                <li key={k} className="font-data text-body-s text-ink-secondary">
                  {k}: <span className="text-accent-champagne">{String(v)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      {isPending && (
        <Panel>
          <ApprovalActions
            approvalId={row.id}
            payload={row.payload ?? {}}
            moneyOut={row.money_out}
            delegatedToSlug={row.delegated_to_slug}
            employees={employees}
            models={models}
            rules={rules}
            labels={t.actionsUi}
          />
        </Panel>
      )}
    </div>
  );
}
