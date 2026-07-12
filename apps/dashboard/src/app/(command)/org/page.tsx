import { OrgTree, type OrgNode } from "@/components/org/org-tree";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /org — E6.3 v1 (ORGANIZATION_ENGINE_SPEC §4/§7, roadmap "read-only graph
// → sonra drag-drop"). One RSC read of v_org_graph (company → departments
// by parent_id → employees by manager chain); the tree itself is the
// client component. Mutations never happen here — the E6.3 seam is
// /api/control/org, wired to the graph in v2 together with drag-drop.

export const metadata = { title: "Organization — DXB" };

type GraphRow = {
  node_id: string;
  kind: "company" | "department" | "employee";
  label: string;
  role_level: string | null;
  parent_node_id: string | null;
  status: string;
  department: string | null;
  model: string | null;
  director_slug: string | null;
  slug: string | null;
  title_tr: string | null;
};

export default async function Page() {
  const locale = await getLocale();
  const t = getDict(locale).command.orgTree;
  const supabase = await createClient();

  const { data } = await supabase
    .from("v_org_graph")
    .select(
      "node_id, kind, label, role_level, parent_node_id, status, department, model, director_slug, slug, title_tr",
    )
    .limit(1000)
    .returns<GraphRow[]>();

  // Label follows the UI locale (design brief A2: EN primary, TR full
  // secondary): label = EN canonical title; title_tr overrides on TR locale.
  const nodes: OrgNode[] = (data ?? []).map((r) => ({
    nodeId: r.node_id,
    kind: r.kind,
    label: locale === "tr" && r.title_tr ? r.title_tr : r.label,
    roleLevel: r.role_level,
    parentNodeId: r.parent_node_id,
    status: r.status,
    department: r.department,
    model: r.model,
    directorSlug: r.director_slug,
    slug: r.slug,
  }));
  const employeeCount = nodes.filter((n) => n.kind === "employee").length;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-h2 text-ink-primary">{t.title}</h1>
        <p className="mt-1 text-body-s text-ink-secondary">
          {t.subtitle}{" "}
          <span className="font-data tabular-nums text-ink-primary">
            {employeeCount}
          </span>{" "}
          {t.employees}.
        </p>
      </header>
      <OrgTree nodes={nodes} labels={t} locale={locale} />
    </div>
  );
}
