import { GovTabs } from "@/components/gov/gov-tabs";
import {
  PolicyBoard,
  ViolationStream,
  ViolationsLive,
  type PolicyRow,
  type ViolationRow,
} from "@/components/gov/violations-board";
import { Panel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /gov/violations — E10.1 (FABLE_5_HOOK_SPEC §5 "İhlal akışı UI", §14 "hook
// neden reddetti her zaman UI'dan okunabilir"): the append-only hook_violations
// feed + the 17-standard policy board. Policy mutations go ONLY through
// /api/control/hook (fn_hook_set_policy — §13 CEO wall). The stream fills once
// E10.2 binds the gates to the spawn path; until then the zero state is honest.

export const metadata = { title: "Hook Violations — DXB" };

type DbViolation = {
  id: number;
  run_id: string | null;
  policy_id: string;
  gate: string;
  detail: string;
  action_taken: string;
  created_at: string;
  hook_policies: {
    standard_no: number;
    title_en: string;
    title_tr: string;
  } | null;
};

type DbPolicy = {
  id: string;
  standard_no: number;
  gate: string;
  severity: string;
  enabled: boolean;
  version: number;
  title_en: string;
  title_tr: string;
};

export default async function Page() {
  const locale = await getLocale();
  const dict = getDict(locale).command;
  const t = dict.violations;
  const supabase = await createClient();

  const [{ data: violationData }, { data: policyData }] = await Promise.all([
    supabase
      .from("hook_violations")
      .select("*, hook_policies(standard_no, title_en, title_tr)")
      .order("id", { ascending: false })
      .limit(300),
    supabase
      .from("hook_policies")
      .select("*")
      .order("standard_no", { ascending: true })
      .order("id", { ascending: true }),
  ]);

  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  });

  const rows: ViolationRow[] = ((violationData ?? []) as unknown as DbViolation[]).map((r) => ({
    id: r.id,
    runId: r.run_id,
    policyId: r.policy_id,
    policyTitle:
      (locale === "tr" ? r.hook_policies?.title_tr : r.hook_policies?.title_en) ?? r.policy_id,
    standardNo: r.hook_policies?.standard_no ?? null,
    gate: r.gate,
    detail: r.detail,
    actionTaken: r.action_taken,
    createdAt: fmt.format(new Date(r.created_at)),
  }));

  const policies: PolicyRow[] = ((policyData ?? []) as unknown as DbPolicy[]).map((p) => ({
    id: p.id,
    standardNo: p.standard_no,
    gate: p.gate,
    severity: p.severity,
    enabled: p.enabled,
    version: p.version,
    title: locale === "tr" ? p.title_tr : p.title_en,
  }));

  return (
    <div className="space-y-4">
      <ViolationsLive />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-h2 text-ink-primary">{t.title}</h1>
          <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
        </div>
        <GovTabs active="violations" labels={dict.audit.tabs} />
      </header>
      <Panel>
        <h2 className="mb-3 font-display text-h3 text-ink-primary">{t.ui.streamTitle}</h2>
        <ViolationStream rows={rows} labels={t.ui} />
      </Panel>
      <Panel>
        <h2 className="mb-3 font-display text-h3 text-ink-primary">{t.ui.policiesTitle}</h2>
        <PolicyBoard policies={policies} labels={t.ui} />
      </Panel>
    </div>
  );
}
