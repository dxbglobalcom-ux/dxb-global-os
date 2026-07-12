import { notFound } from "next/navigation";
import {
  SettingsShell,
  type ChangeLogRow,
  type ModelOption,
  type ScopeEntity,
  type SectionMeta,
  type SettingRowData,
  type SettingValueRow,
} from "@/components/settings/settings-shell";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /sys/settings/[section] — E6.2 (SETTINGS_AND_CONTROL_SPEC §3, §7). One
// RSC round of reads: registry rows for the section, every stored value
// for those keys (all scopes — the shell resolves the chain client-side),
// recent change_log (undo material), scope entity lists, model catalog
// (model_ref value space) and live entity counts for the Impact Preview.
// All figures are real DB reads (§35). Writes never happen here — the
// shell calls the E6.1 seam.

export const metadata = { title: "Settings — DXB" };

// The 7 REAL registry categories (E6.1 seed). Registered adaptation of
// §18's 22 sections — see the shell header comment; empty sections are a
// §35 violation, so only seeded categories render.
const SECTIONS = [
  "global_os",
  "models",
  "orchestrator",
  "departments",
  "employees",
  "workflows",
  "hr",
] as const;

type RegistryRow = {
  key: string;
  category: string;
  value_schema: SettingRowData["schema"];
  risk: SettingRowData["risk"];
  requires_approval: boolean;
  cost_impact: string | null;
  affected_areas: string[] | null;
  locked: boolean;
  delegate: string | null;
  scope_types: string[];
  description_en: string;
  description_tr: string;
};

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!(SECTIONS as readonly string[]).includes(section)) notFound();

  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.settingsUi;
  const supabase = await createClient();

  const [registryRes, allKeysRes, deptRes, agentRes, modelRes, taskCount, approvalCount, workflowCount] =
    await Promise.all([
      supabase
        .from("settings_registry")
        .select(
          "key, category, value_schema, risk, requires_approval, cost_impact, affected_areas, locked, delegate, scope_types, description_en, description_tr",
        )
        .eq("category", section)
        .order("key"),
      supabase.from("settings_registry").select("category"),
      supabase.from("departments").select("id, slug, name_en").order("slug"),
      supabase
        .from("agents")
        .select("id, slug, department")
        .order("slug")
        .limit(500),
      supabase
        .from("model_catalog")
        .select("id, display_name, mechanical_only")
        .eq("banned", false)
        .neq("status", "disabled")
        .order("id"),
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .in("status", ["queued", "claimed", "running"]),
      supabase
        .from("approvals")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.from("workflows").select("id", { count: "exact", head: true }),
    ]);

  const registry = (registryRes.data ?? []) as RegistryRow[];
  const keys = registry.map((r) => r.key);

  const [valuesRes, historyRes] = await Promise.all([
    supabase
      .from("settings_values")
      .select("key, scope, value")
      .in("key", keys.length > 0 ? keys : ["-"]),
    supabase
      .from("settings_change_log")
      .select("id, key, scope, old_value, new_value, changed_by, changed_at, undo_of")
      .in("key", keys.length > 0 ? keys : ["-"])
      .order("changed_at", { ascending: false })
      .limit(100),
  ]);

  const sectionCounts = new Map<string, number>();
  for (const row of (allKeysRes.data ?? []) as Array<{ category: string }>) {
    sectionCounts.set(row.category, (sectionCounts.get(row.category) ?? 0) + 1);
  }
  const sections: SectionMeta[] = SECTIONS.map((slug) => ({
    slug,
    count: sectionCounts.get(slug) ?? 0,
  }));

  const rows: SettingRowData[] = registry.map((r) => ({
    key: r.key,
    category: r.category,
    schema: r.value_schema,
    risk: r.risk,
    requiresApproval: r.requires_approval,
    costImpact: r.cost_impact,
    affectedAreas: r.affected_areas ?? [],
    locked: r.locked,
    delegate: r.delegate,
    scopeTypes: r.scope_types,
    descriptionEn: r.description_en,
    descriptionTr: r.description_tr,
  }));

  const values: SettingValueRow[] = ((valuesRes.data ?? []) as Array<{
    key: string;
    scope: string;
    value: unknown;
  }>).map((v) => ({ key: v.key, scope: v.scope, value: v.value }));

  const history: ChangeLogRow[] = ((historyRes.data ?? []) as Array<{
    id: number;
    key: string;
    scope: string;
    old_value: unknown;
    new_value: unknown;
    changed_by: string;
    changed_at: string;
    undo_of: number | null;
  }>).map((h) => ({
    id: h.id,
    key: h.key,
    scope: h.scope,
    oldValue: h.old_value,
    newValue: h.new_value,
    changedBy: h.changed_by,
    changedAt: h.changed_at,
    undoOf: h.undo_of,
  }));

  const departments: ScopeEntity[] = ((deptRes.data ?? []) as Array<{
    id: string;
    slug: string;
    name_en: string | null;
  }>).map((d) => ({ id: d.id, label: d.name_en ?? d.slug }));

  const employees: ScopeEntity[] = ((agentRes.data ?? []) as Array<{
    id: string;
    slug: string;
    department: string | null;
  }>).map((a) => ({
    id: a.id,
    label: a.department ? `${a.slug} (${a.department})` : a.slug,
  }));

  const models: ModelOption[] = ((modelRes.data ?? []) as Array<{
    id: string;
    display_name: string | null;
    mechanical_only: boolean;
  }>).map((m) => ({
    id: m.id,
    displayName: m.display_name ?? m.id,
    mechanicalOnly: m.mechanical_only,
  }));

  const counts: Record<string, number> = {
    departments: departments.length,
    agents: employees.length,
    workflows: workflowCount.count ?? 0,
    tasks: taskCount.count ?? 0,
    approvals: approvalCount.count ?? 0,
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-h2 text-ink-primary">{t.title}</h1>
        <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
      </header>
      <SettingsShell
        sections={sections}
        section={section}
        rows={rows}
        values={values}
        history={history}
        departments={departments}
        employees={employees}
        models={models}
        counts={counts}
        labels={t}
        locale={locale}
      />
    </div>
  );
}
