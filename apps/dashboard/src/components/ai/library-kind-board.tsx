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

// LibraryKindBoard (E12.1-D) — shared RSC for the kind-scoped Intelligence
// pages (/ai/skills, /ai/plugins, /ai/knowledge, /ai/mcp): one
// v_library_catalog query, KPI strip, sortable inventory grid; every row
// drills into the Holding Library item record (E9.5 detail tabs — the
// single mutation door stays there). No kind-scoped page invents state the
// library does not have.

export type CatalogRow = {
  id: string;
  kind: string;
  name: string;
  version: string | null;
  owner_dept_slug: string | null;
  owner_dept_name: string | null;
  owner_dept_name_tr: string | null;
  quality_score: number | null;
  review_status: string | null;
  last_used_at: string | null;
  updated_at: string;
  grant_count: number;
  usage_count: number;
};

export async function LibraryKindBoard({
  kinds,
  pageTitle,
  helpText,
  showKindColumn = false,
  footnote,
  extra,
}: {
  kinds: string[];
  pageTitle: string;
  helpText?: string;
  showKindColumn?: boolean;
  footnote?: string;
  extra?: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.libraryBoard;
  const supabase = await createClient();

  const res = await supabase
    .from("v_library_catalog")
    .select(
      "id, kind, name, version, owner_dept_slug, owner_dept_name, owner_dept_name_tr, quality_score, review_status, last_used_at, updated_at, grant_count, usage_count",
    )
    .in("kind", kinds)
    .order("kind")
    .order("name");

  if (res.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={pageTitle} state="error">
          <p className="text-body-s text-status-danger">
            v_library_catalog: {res.error.message}
          </p>
        </Panel>
      </div>
    );
  }

  const rows = (res.data ?? []) as CatalogRow[];
  const granted = rows.filter((r) => r.grant_count > 0).length;
  const used = rows.filter((r) => r.usage_count > 0).length;
  const reviewed = rows.filter((r) => r.review_status === "approved").length;

  const kindLabels = dict.command.library.kinds as Record<string, string>;
  const dateFmt = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
          day: "2-digit",
          month: "short",
        })
      : "—";

  const columns: Column<CatalogRow>[] = [
    {
      key: "name",
      label: t.colName,
      render: (r) => (
        <Link
          href={`/ai/library?kind=${encodeURIComponent(r.kind)}&item=${r.id}`}
          className="block max-w-[32ch] truncate font-data text-accent-champagne"
          title={r.name}
        >
          {r.name}
        </Link>
      ),
    },
    ...(showKindColumn
      ? [
          {
            key: "kind",
            label: t.colKind,
            render: (r) => kindLabels[r.kind] ?? r.kind,
          } as Column<CatalogRow>,
        ]
      : []),
    {
      key: "version",
      label: t.colVersion,
      render: (r) => <span className="font-data">{r.version ?? "—"}</span>,
    },
    {
      key: "owner_dept_slug",
      label: t.colOwner,
      render: (r) =>
        r.owner_dept_slug ? (
          <Link
            href={`/org/employees?dept=${encodeURIComponent(r.owner_dept_slug)}`}
            className="text-accent-champagne"
          >
            {locale === "tr"
              ? (r.owner_dept_name_tr ?? r.owner_dept_name ?? r.owner_dept_slug)
              : (r.owner_dept_name ?? r.owner_dept_slug)}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      key: "review_status",
      label: t.colReview,
      render: (r) =>
        r.review_status ? (
          <StatusBadge level={r.review_status === "approved" ? "ok" : "warn"}>
            {(t.reviewStatuses as Record<string, string>)[r.review_status] ??
              r.review_status}
          </StatusBadge>
        ) : (
          <StatusBadge level="info">{t.reviewNone}</StatusBadge>
        ),
    },
    {
      key: "grant_count",
      label: t.colGrants,
      align: "right",
      numeric: true,
      render: (r) => r.grant_count,
    },
    {
      key: "usage_count",
      label: t.colUsage,
      align: "right",
      numeric: true,
      render: (r) => r.usage_count,
    },
    {
      key: "updated_at",
      label: t.colUpdated,
      align: "right",
      numeric: true,
      render: (r) => (
        <span className="whitespace-nowrap font-data tabular-nums">
          {dateFmt(r.updated_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">{pageTitle}{helpText ? <> <HelpTip text={helpText} /></> : null}</h1>
        <Link
          href={`/ai/library?kind=${encodeURIComponent(kinds[0])}`}
          className="text-body-s text-accent-champagne"
        >
          {t.viewLibrary}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiItems}
          value={String(rows.length)}
          glow
          drillHref={`/ai/library?kind=${encodeURIComponent(kinds[0])}`}
        />
        <Stat
          label={t.kpiGranted}
          value={`${granted}/${rows.length}`}
          drillHref="/gov/permissions"
        />
        <Stat label={t.kpiUsed} value={`${used}/${rows.length}`} drillHref="/ai/library" />
        <Stat
          label={t.kpiReviewed}
          value={`${reviewed}/${rows.length}`}
          drillHref="/ai/library"
        />
      </div>

      <Panel title={`${pageTitle} · ${rows.length}`}>
        {rows.length === 0 ? (
          <p className="py-4 text-body-s text-ink-secondary">{t.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <DataGrid
              className="min-w-[880px]"
              columns={columns}
              rows={rows}
              rowKey={(r) => r.id}
            />
          </div>
        )}
      </Panel>

      {extra}

      {footnote && <p className="text-caption text-ink-muted">{footnote}</p>}
    </div>
  );
}
