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

// /gov/permissions v1 (E12.1-E) — the PERMISSION_MODEL read surface: who
// can use what. Library grants (the E9.5 grant → compiled-profile chain,
// mutations ONLY through the Library Access tab) + the department gateway
// posture (default-deny least-privilege baseline). Zero grants = honest
// zero: the workforce is pre-activation, nothing has been opened yet.

export const metadata = { title: "Permissions — DXB" };

type GrantRow = {
  id: number;
  grantee_kind: string;
  grantee_id: string | null;
  granted_by: string;
  created_at: string;
  expires_at: string | null;
  library_items: { name: string; kind: string } | null;
};

export default async function PermissionsPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.permissions;
  const supabase = await createClient();

  const [grantsRes, deptRes, agentCountRes] = await Promise.all([
    supabase
      .from("library_grants")
      .select(
        "id, grantee_kind, grantee_id, granted_by, created_at, expires_at, library_items(name, kind)",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("departments").select("slug, display_name, display_name_tr, mcp_profile"),
    supabase.from("agents").select("id", { count: "exact", head: true }),
  ]);

  if (grantsRes.error || deptRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.permissions} state="error">
          <p className="text-body-s text-status-danger">
            library_grants: {grantsRes.error?.message ?? deptRes.error?.message}
          </p>
        </Panel>
      </div>
    );
  }

  const grants = (grantsRes.data ?? []) as unknown as GrantRow[];
  const depts = (deptRes.data ?? []) as {
    slug: string;
    display_name: string;
    display_name_tr: string | null;
    mcp_profile: string;
  }[];

  // Resolve grantee display names in two batched lookups (no N+1).
  const deptIds = new Map<string, string>();
  const agentNames = new Map<string, string>();
  const deptTargets = grants.filter((g) => g.grantee_kind === "department" && g.grantee_id);
  const empTargets = grants.filter((g) => g.grantee_kind === "employee" && g.grantee_id);
  if (deptTargets.length > 0) {
    const res = await supabase
      .from("departments")
      .select("id, slug")
      .in("id", [...new Set(deptTargets.map((g) => g.grantee_id!))]);
    for (const d of (res.data ?? []) as { id: string; slug: string }[])
      deptIds.set(d.id, d.slug);
  }
  if (empTargets.length > 0) {
    const res = await supabase
      .from("agents")
      .select("id, slug")
      .in("id", [...new Set(empTargets.map((g) => g.grantee_id!))]);
    for (const a of (res.data ?? []) as { id: string; slug: string }[])
      agentNames.set(a.id, a.slug);
  }

  const now = Date.now();
  const active = grants.filter(
    (g) => !g.expires_at || Date.parse(g.expires_at) > now,
  ).length;
  const expired = grants.length - active;
  const denyDepts = depts.filter((d) => d.mcp_profile === "default-deny").length;

  const kindLabels = dict.command.library.kinds as Record<string, string>;
  const granteeLabels = t.granteeKinds as Record<string, string>;

  const granteeDisplay = (g: GrantRow) => {
    if (g.grantee_kind === "department")
      return deptIds.get(g.grantee_id ?? "") ?? g.grantee_id ?? "—";
    if (g.grantee_kind === "employee")
      return agentNames.get(g.grantee_id ?? "") ?? g.grantee_id ?? "—";
    return g.grantee_id ?? "—";
  };

  const columns: Column<GrantRow>[] = [
    {
      key: "item",
      label: t.colAsset,
      render: (g) => (
        <span className="block max-w-[28ch] truncate font-data" title={g.library_items?.name}>
          {g.library_items?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "kind",
      label: t.colKind,
      render: (g) =>
        g.library_items ? (kindLabels[g.library_items.kind] ?? g.library_items.kind) : "—",
    },
    {
      key: "grantee_kind",
      label: t.colGranteeKind,
      render: (g) => granteeLabels[g.grantee_kind] ?? g.grantee_kind,
    },
    {
      key: "grantee_id",
      label: t.colGrantee,
      render: (g) => <span className="font-data">{granteeDisplay(g)}</span>,
    },
    {
      key: "expires_at",
      label: t.colExpires,
      render: (g) =>
        g.expires_at ? (
          Date.parse(g.expires_at) > now ? (
            <span className="whitespace-nowrap font-data tabular-nums">
              {new Date(g.expires_at).toLocaleDateString(
                locale === "tr" ? "tr-TR" : "en-GB",
                { day: "2-digit", month: "short" },
              )}
            </span>
          ) : (
            <StatusBadge level="info">{t.expired}</StatusBadge>
          )
        ) : (
          <span className="text-ink-muted">{t.noExpiry}</span>
        ),
    },
    {
      key: "granted_by",
      label: t.colGrantedBy,
      render: (g) => <span className="font-data">{g.granted_by}</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.permissions}{" "}
        <HelpTip text={dict.help.permissions} />
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat label={t.kpiActive} value={String(active)} glow drillHref="/gov/permissions" />
        <Stat label={t.kpiExpired} value={String(expired)} drillHref="/gov/permissions" />
        <Stat
          label={t.kpiDenyDepts}
          value={`${denyDepts}/${depts.length}`}
          drillHref="/ai/mcp"
        />
        <Stat
          label={t.kpiEmployees}
          value={String(agentCountRes.count ?? 0)}
          drillHref="/org/employees"
        />
      </div>

      <Panel title={`${t.grantsTitle} · ${grants.length}`}>
        <p className="mb-3 text-caption text-ink-muted">{t.grantsHint}</p>
        {grants.length === 0 ? (
          <p className="py-2 text-body-s text-ink-secondary">{t.grantsEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <DataGrid
              className="min-w-[880px]"
              columns={columns}
              rows={grants}
              rowKey={(g) => String(g.id)}
            />
          </div>
        )}
      </Panel>

      <Panel title={t.postureTitle}>
        <p className="mb-3 text-caption text-ink-muted">{t.postureHint}</p>
        {/* auto-fit: a column appears only when a full department name fits
            (~26rem incl. badge). Windowed → 1 column (name on one line),
            2xl → 2, ultrawide → 3. No truncation, no second-line wrap. */}
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,26rem),1fr))] gap-x-6 gap-y-2.5">
          {depts.map((d) => {
            const deptName =
              locale === "tr" ? (d.display_name_tr ?? d.display_name) : d.display_name;
            return (
            <li
              key={d.slug}
              className="flex items-baseline justify-between gap-3 text-body-s"
            >
              <Link
                href={`/org/employees?dept=${encodeURIComponent(d.slug)}`}
                className="text-accent-champagne"
              >
                {deptName}
              </Link>
              <StatusBadge
                level={d.mcp_profile === "default-deny" ? "ok" : "warn"}
                className="shrink-0"
              >
                <span className="font-data">{d.mcp_profile}</span>
              </StatusBadge>
            </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
