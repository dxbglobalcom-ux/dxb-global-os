import Link from "next/link";
import {
  DataGrid,
  Panel,
  Stat,
  StatusBadge,
  type Column, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /gov/policies v1 (E12.1-E) — the policy constitution in one view, three
// REAL families: approval_rules (the LOCKED money-out/contract/identity
// gates, E9.3), hook_policies (the 17-standard Fable 5 engine, E10.1 —
// its full board lives on /gov/violations), and governance_rule library
// assets. Approval rules mutate only through control_approvals_action
// change_policy (locked rows reject) — read-only here by design.

export const metadata = { title: "Policies — DXB" };

type RuleRow = {
  id: string;
  operation_pattern: string;
  risk_class: string;
  gate: string;
  locked: boolean;
  enabled: boolean;
  priority: number;
  updated_at: string;
};

type HookAgg = { severity: string; enabled: boolean; cnt: number };

export default async function PoliciesPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.policies;
  const supabase = await createClient();

  const [rulesRes, hookRes, govItemsRes] = await Promise.all([
    supabase
      .from("approval_rules")
      .select("*")
      .order("priority", { ascending: true }),
    supabase.from("hook_policies").select("severity, enabled, cnt:id.count()"),
    supabase
      .from("v_library_catalog")
      .select("id, name, kind, review_status, updated_at")
      .eq("kind", "governance_rule")
      .order("name"),
  ]);

  if (rulesRes.error || hookRes.error || govItemsRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.policies} state="error">
          <p className="text-body-s text-status-danger">
            {rulesRes.error?.message ??
              hookRes.error?.message ??
              govItemsRes.error?.message}
          </p>
        </Panel>
      </div>
    );
  }

  const rules = (rulesRes.data ?? []) as RuleRow[];
  const hookAgg = (hookRes.data ?? []) as unknown as HookAgg[];
  const hookTotal = hookAgg.reduce((a, r) => a + Number(r.cnt), 0);
  const hookBlocking = hookAgg
    .filter((r) => r.severity === "block" && r.enabled)
    .reduce((a, r) => a + Number(r.cnt), 0);
  const govItems = (govItemsRes.data ?? []) as {
    id: string;
    name: string;
    kind: string;
    review_status: string | null;
    updated_at: string;
  }[];

  // approval_rules.risk_class carries the CLASSIFICATION domain (E9.3
  // interp 1: money_out/contract/identity/other), not a severity level.
  const riskLabels = t.riskClasses as Record<string, string>;

  const columns: Column<RuleRow>[] = [
    {
      key: "priority",
      label: t.colPriority,
      align: "right",
      numeric: true,
      render: (r) => r.priority,
    },
    {
      key: "operation_pattern",
      label: t.colPattern,
      // rule 8: no "…" anywhere — patterns wrap instead of truncating
      render: (r) => (
        <span className="block max-w-[36ch] break-all font-data">
          {r.operation_pattern}
        </span>
      ),
    },
    {
      key: "risk_class",
      label: t.colRisk,
      render: (r) => (
        <StatusBadge level={r.risk_class === "critical" ? "critical" : "warn"}>
          {riskLabels[r.risk_class] ?? r.risk_class}
        </StatusBadge>
      ),
    },
    {
      key: "gate",
      label: t.colGate,
      render: (r) => <span className="font-data">{r.gate}</span>,
    },
    {
      key: "locked",
      label: t.colLocked,
      render: (r) =>
        r.locked ? (
          <StatusBadge level="critical">{t.locked}</StatusBadge>
        ) : (
          <StatusBadge level="info">{t.unlocked}</StatusBadge>
        ),
    },
    {
      key: "enabled",
      label: t.colEnabled,
      render: (r) => (
        <StatusBadge level={r.enabled ? "ok" : "warn"}>
          {r.enabled ? t.enabled : t.disabled}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.policies}{" "}
        <HelpTip text={dict.help.policies} />
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiApprovalRules}
          value={String(rules.length)}
          glow
          drillHref="/approvals"
        />
        <Stat
          label={t.kpiLocked}
          value={`${rules.filter((r) => r.locked).length}/${rules.length}`}
          drillHref="/gov/policies"
        />
        <Stat
          label={t.kpiHookStandards}
          value={String(hookTotal)}
          drillHref="/gov/violations"
        />
        <Stat
          label={t.kpiHookBlocking}
          value={`${hookBlocking}/${hookTotal}`}
          drillHref="/gov/violations"
        />
      </div>

      <Panel title={t.rulesTitle}>
        <p className="mb-3 text-caption text-ink-muted">{t.rulesHint}</p>
        {rules.length === 0 ? (
          <p className="py-2 text-body-s text-ink-secondary">{t.rulesEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <DataGrid
              className="min-w-[880px]"
              columns={columns}
              rows={rules}
              rowKey={(r) => r.id}
            />
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title={t.hookTitle}>
          <p className="text-body-s text-ink-secondary">{t.hookSummary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {hookAgg
              .sort((a, b) => a.severity.localeCompare(b.severity))
              .map((r) => (
                <StatusBadge
                  key={`${r.severity}-${r.enabled}`}
                  level={r.severity === "block" ? "danger" : "warn"}
                >
                  {(t.hookSeverities as Record<string, string>)[r.severity] ??
                    r.severity}{" "}
                  {r.cnt}
                  {!r.enabled ? ` (${t.disabled})` : ""}
                </StatusBadge>
              ))}
          </div>
          <Link
            href="/gov/violations"
            className="mt-3 block text-body-s text-accent-champagne"
          >
            {t.hookBoard}
          </Link>
        </Panel>

        <Panel title={t.govTitle}>
          {govItems.length === 0 ? (
            <p className="text-body-s text-ink-secondary">{t.govEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {govItems.map((g) => (
                <li key={g.id} className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/ai/library?kind=governance_rule&item=${g.id}`}
                    className="min-w-0 break-words font-data text-body-s text-accent-champagne"
                  >
                    {g.name}
                  </Link>
                  <span className="whitespace-nowrap font-data text-caption text-ink-muted tabular-nums">
                    {new Date(g.updated_at).toLocaleDateString(
                      locale === "tr" ? "tr-TR" : "en-GB",
                      { day: "2-digit", month: "short" },
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
