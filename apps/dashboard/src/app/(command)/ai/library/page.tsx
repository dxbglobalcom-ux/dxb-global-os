import Link from "next/link";
import { Panel, StatusBadge, type StatusLevel, HelpTip } from "@/components/primitives";
import { LibraryDetailActions, LibraryLive } from "@/components/ai/library-actions";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /ai/library — Holding Library (E9.5, HOLDING_LIBRARY §7). Kind-grouped
// catalog over v_library_catalog: ALL 20 directive kinds stay visible — empty
// kinds show an honest zero, never fake fullness. Item record = the 11
// directive fields; tabs: usage trend, access grants (CEO edits through
// /api/control/library ONLY), change history, dependencies (list, v1).
// Grants are the enforcement source: the gateway profile compiler reads them.

export const metadata = { title: "Library — DXB" };

const KINDS = [
  "skill", "plugin", "tool", "mcp", "prompt_template", "persona", "policy",
  "governance_rule", "workflow", "sop", "framework", "code_component",
  "design_system", "research", "report", "project_doc", "training",
  "memory_source", "best_practice", "lesson_learned",
] as const;
type Kind = (typeof KINDS)[number];

const REVIEW_LEVEL: Record<string, StatusLevel> = {
  approved: "ok",
  active: "ok",
  draft: "info",
  pending: "warn",
  needs_review: "warn",
  archived: "info",
};

type CatalogRow = {
  id: string;
  kind: Kind;
  name: string;
  version: string | null;
  owner_dept_slug: string | null;
  owner_dept_name: string | null;
  owner_dept_name_tr: string | null;
  owner_employee_slug: string | null;
  owner_employee_title: string | null;
  owner_employee_title_tr: string | null;
  usage_notes: string | null;
  dependencies: string[] | null;
  source_ref: string | null;
  quality_score: number | null;
  review_status: string | null;
  last_used_at: string | null;
  updated_at: string;
  grant_count: number;
  usage_count: number;
  change_count: number;
};

type GrantRow = {
  id: number;
  grantee_kind: "department" | "employee" | "role_level";
  grantee_id: string;
  granted_by: string;
  created_at: string;
  expires_at: string | null;
};

type ChangeRow = { id: number; changed_by: string; change: unknown; changed_at: string };
type UsageRow = { used_at: string; used_by: string | null };

function fmtDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

// List column stays date-only: the time is not load-bearing there and the
// full stamp clips mid-value at 1280 (detail panel carries the full form).
function fmtDateShort(iso: string | null, locale: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; item?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.library;
  const supabase = await createClient();

  const activeKind = KINDS.includes(params.kind as Kind) ? (params.kind as Kind) : null;
  const tab = ["usage", "access", "history", "deps"].includes(params.tab ?? "")
    ? (params.tab as "usage" | "access" | "history" | "deps")
    : "access";

  const { data: catalogData } = await supabase
    .from("v_library_catalog")
    .select("*")
    .order("kind", { ascending: true })
    .order("name", { ascending: true });
  const catalog = (catalogData ?? []) as unknown as CatalogRow[];

  const counts = new Map<string, number>();
  for (const row of catalog) counts.set(row.kind, (counts.get(row.kind) ?? 0) + 1);

  const items = activeKind ? catalog.filter((r) => r.kind === activeKind) : [];
  const selected = params.item ? (catalog.find((r) => r.id === params.item) ?? null) : null;

  // Detail tabs: one targeted fetch per surface, only for the open record.
  let grants: GrantRow[] = [];
  let changes: ChangeRow[] = [];
  let usage: UsageRow[] = [];
  let employees: { id: string; slug: string }[] = [];
  let departments: { slug: string }[] = [];
  if (selected) {
    const [g, c, u, e, d] = await Promise.all([
      supabase
        .from("library_grants")
        .select("id, grantee_kind, grantee_id, granted_by, created_at, expires_at")
        .eq("item_id", selected.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("library_change_log")
        .select("id, changed_by, change, changed_at")
        .eq("item_id", selected.id)
        .order("changed_at", { ascending: false })
        .limit(30),
      supabase
        .from("library_usage_log")
        .select("used_at, used_by")
        .eq("item_id", selected.id)
        .order("used_at", { ascending: false })
        .limit(500),
      supabase
        .from("agents")
        .select("id, slug")
        .neq("employment_status", "archived")
        .order("slug"),
      supabase.from("departments").select("slug").order("slug"),
    ]);
    grants = (g.data ?? []) as GrantRow[];
    changes = (c.data ?? []) as ChangeRow[];
    usage = (u.data ?? []) as UsageRow[];
    employees = (e.data ?? []) as { id: string; slug: string }[];
    departments = (d.data ?? []) as { slug: string }[];
  }

  const kindHref = (k: Kind) => `/ai/library?kind=${k}`;
  const itemHref = (r: CatalogRow, tabName = tab) =>
    `/ai/library?kind=${r.kind}&item=${r.id}&tab=${tabName}`;

  const deptName = (r: CatalogRow) =>
    (locale === "tr" ? r.owner_dept_name_tr : r.owner_dept_name) ?? r.owner_dept_slug;

  // 14-day usage trend buckets (usage tab).
  const dayMs = 86_400_000;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const trend = Array.from({ length: 14 }, (_, i) => {
    const start = today.getTime() - (13 - i) * dayMs;
    return usage.filter((u) => {
      const ts = new Date(u.used_at).getTime();
      return ts >= start && ts < start + dayMs;
    }).length;
  });
  const trendMax = Math.max(1, ...trend);

  return (
    <div className="mx-auto max-w-[1500px] space-y-4">
      <LibraryLive />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-h2 text-ink-primary">
        {t.title}{" "}
        <HelpTip text={dict.help.library} />
      </h1>
          <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
        </div>
        <span className="font-data text-body-s tabular-nums text-ink-muted">
          {catalog.length} {t.ui.totalItems}
        </span>
      </header>

      {/* ── kind rail: all 20 kinds, zero-kinds honest, never hidden (§7) ── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {KINDS.map((k) => {
          const n = counts.get(k) ?? 0;
          const active = activeKind === k;
          return (
            <Link
              key={k}
              href={kindHref(k)}
              className={`rounded-panel border px-3 py-2 transition duration-[var(--t-fast)] ease-refined ${
                active
                  ? "border-edge-champagne bg-surface-graphite"
                  : "border-edge-neutral bg-surface-onyx hover:border-edge-bright"
              }`}
            >
              {/* No truncate: kind labels like "Yönetişim kuralları" were
                  clipping to "…" at 1280 (RULE #0 A1) — labels wrap instead. */}
              <span className={`block break-words text-body-s ${n === 0 ? "text-ink-muted" : "text-ink-primary"}`}>
                {t.kinds[k]}
              </span>
              <span
                className={`font-data text-body-s tabular-nums ${
                  n === 0 ? "text-ink-muted" : active ? "text-accent-champagne" : "text-ink-secondary"
                }`}
              >
                {n === 0 ? t.ui.zeroRecords : `${n} ${t.ui.records}`}
              </span>
            </Link>
          );
        })}
      </div>

      {!activeKind ? (
        <Panel>
          <p className="py-10 text-center text-body-s text-ink-muted">{t.ui.pickKind}</p>
        </Panel>
      ) : (
        // 2-col only from 2xl: below that the shell rails leave too little
        // width — the list column would crush its own table (CEO catch,
        // 2026-07-14 eye test).
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* ── item list ─────────────────────────────────────────────── */}
          <Panel className="min-w-0">
            {items.length === 0 ? (
              <p className="py-10 text-center text-body-s text-ink-muted">{t.ui.noItems}</p>
            ) : (
              <div className="overflow-x-auto">
                {/* List = scan surface: name · owner · review · updated.
                    Version (406/439 empty), access and usage counts are
                    info-thin at row level (CEO minimalism ruling — zeros are
                    noise); the detail panel's fields + Erişim/Kullanım tabs
                    carry them. min-w keeps columns readable in a narrow
                    container — the wrapper then scrolls instead of clipping. */}
                <table className="w-full min-w-[520px] text-left text-body-s">
                  <thead>
                    <tr className="label-caps text-ink-muted">
                      <th className="px-2 py-2">{t.ui.colName}</th>
                      <th className="px-2 py-2">{t.ui.colOwner}</th>
                      <th className="px-2 py-2">{t.ui.colReview}</th>
                      <th className="px-2 py-2">{t.ui.colUpdated}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <tr
                        key={r.id}
                        className={`border-t border-edge-neutral/60 ${
                          selected?.id === r.id ? "bg-surface-graphite" : "hover:bg-surface-graphite/50"
                        }`}
                      >
                        <td className="max-w-[360px] px-2 py-2">
                          {/* No truncate: "…" on a CEO surface is an automatic
                              FAIL (RULE #0 A1) — slugs wrap at their dashes. */}
                          <Link href={itemHref(r)} className="block break-words text-ink-primary hover:text-accent-champagne">
                            {r.name}
                          </Link>
                        </td>
                        {/* No width cap: the longest department display name
                            measures 43 chars (~300px) — a cap hard-clips
                            letters (RULE #0 A1). The name column wraps, so
                            this column may take its natural width. */}
                        <td className="whitespace-nowrap px-2 py-2 text-ink-secondary">
                          {deptName(r) ?? t.ui.unowned}
                        </td>
                        <td className="px-2 py-2">
                          {r.review_status ? (
                            <StatusBadge level={REVIEW_LEVEL[r.review_status] ?? "info"}>
                              {(t.ui.reviewStatuses as Record<string, string>)[r.review_status] ??
                                r.review_status}
                            </StatusBadge>
                          ) : (
                            <span className="text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 font-data text-ink-muted">
                          {fmtDateShort(r.updated_at, locale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* ── item record: the 11 directive fields + tabs (§7) ───────────
              order-first below 2xl: single-column mode stacks panels, and a
              record hiding UNDER a 200+-row list is unreachable (CEO catch,
              2026-07-18 eye session — "card renders way at the bottom").
              At 2xl the grid goes 2-col and order-none restores it as the
              right-hand column. */}
          {selected && (
            <Panel className="order-first min-w-0 self-start 2xl:order-none">
              <div className="space-y-4">
                <div>
                  <p className="label-caps text-ink-muted">{t.ui.detailTitle}</p>
                  <h2 className="mt-1 break-all font-display text-h4 text-ink-primary">{selected.name}</h2>
                  <p className="mt-1 text-body-s text-ink-secondary">
                    {t.kinds[selected.kind]}
                    {selected.version ? ` · ${selected.version}` : ""}
                  </p>
                </div>

                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-body-s sm:grid-cols-2">
                  <div>
                    <dt className="label-caps text-ink-muted">{t.ui.fields.owner}</dt>
                    <dd className="text-ink-primary">
                      {selected.owner_employee_slug
                        ? `${selected.owner_employee_slug}${
                            (locale === "tr" ? selected.owner_employee_title_tr : selected.owner_employee_title)
                              ? ` (${locale === "tr" ? selected.owner_employee_title_tr : selected.owner_employee_title})`
                              : ""
                          }`
                        : t.ui.unowned}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-ink-muted">{t.ui.fields.department}</dt>
                    <dd className="text-ink-primary">{deptName(selected) ?? t.ui.unowned}</dd>
                  </div>
                  <div>
                    <dt className="label-caps text-ink-muted">{t.ui.fields.quality}</dt>
                    <dd className="font-data tabular-nums text-ink-primary">
                      {selected.quality_score ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-ink-muted">{t.ui.fields.review}</dt>
                    <dd className="text-ink-primary">
                      {selected.review_status
                        ? ((t.ui.reviewStatuses as Record<string, string>)[
                            selected.review_status
                          ] ?? selected.review_status)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps text-ink-muted">{t.ui.fields.lastUpdate}</dt>
                    <dd className="font-data text-ink-primary">{fmtDate(selected.updated_at, locale)}</dd>
                  </div>
                  <div>
                    <dt className="label-caps text-ink-muted">{t.ui.fields.usageHistory}</dt>
                    <dd className="font-data tabular-nums text-ink-primary">
                      {selected.usage_count} {t.ui.usageTotal}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="label-caps text-ink-muted">{t.ui.fields.usageArea}</dt>
                    <dd className="text-ink-secondary">{selected.usage_notes ?? "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="label-caps text-ink-muted">{t.ui.fields.source}</dt>
                    <dd className="break-all font-data text-body-s text-ink-secondary">
                      {selected.source_ref ?? "—"}
                    </dd>
                  </div>
                </dl>

                {/* tabs */}
                <div className="flex flex-wrap gap-2 border-b border-edge-neutral pb-2">
                  {(["usage", "access", "history", "deps"] as const).map((name) => (
                    <Link
                      key={name}
                      href={itemHref(selected, name)}
                      className={`rounded-input border px-3 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined ${
                        tab === name
                          ? "border-edge-champagne text-accent-champagne"
                          : "border-edge-neutral text-ink-secondary hover:text-ink-primary"
                      }`}
                    >
                      {t.ui.tabs[name]}
                    </Link>
                  ))}
                </div>

                {tab === "usage" && (
                  <div className="space-y-2">
                    {selected.usage_count === 0 ? (
                      <p className="text-body-s text-ink-muted">{t.ui.noUsage}</p>
                    ) : (
                      <>
                        <div className="flex h-24 items-end gap-1" aria-hidden>
                          {trend.map((n, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-t bg-accent-champagne/70"
                              style={{ height: `${Math.max(4, (n / trendMax) * 100)}%`, opacity: n === 0 ? 0.15 : 1 }}
                              title={`${n}`}
                            />
                          ))}
                        </div>
                        <p className="font-data text-body-s tabular-nums text-ink-muted">
                          {trend.reduce((a, b) => a + b, 0)} / {t.ui.last14d} · {selected.usage_count}{" "}
                          {t.ui.usageTotal}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {tab === "access" && (
                  <LibraryDetailActions
                    itemId={selected.id}
                    grants={grants.map((g) => ({
                      id: g.id,
                      granteeKind: g.grantee_kind,
                      granteeId: g.grantee_id,
                      grantedBy: g.granted_by,
                      createdAt: fmtDate(g.created_at, locale),
                      expiresAt: g.expires_at,
                      expiresLabel: g.expires_at
                        ? new Date(g.expires_at) < new Date()
                          ? t.ui.expired
                          : `${t.ui.expires} ${fmtDate(g.expires_at, locale)}`
                        : t.ui.permanent,
                    }))}
                    employees={employees}
                    departments={departments.map((d) => d.slug)}
                    labels={{
                      grantAdd: t.ui.grantAdd,
                      grantRevoke: t.ui.grantRevoke,
                      granteeKind: t.ui.granteeKind,
                      granteeId: t.ui.granteeId,
                      expiresAt: t.ui.expiresAt,
                      granteeKinds: t.ui.granteeKinds,
                      grantedBy: t.ui.grantedBy,
                      noGrants: t.ui.noGrants,
                      gatewayNote: t.ui.gatewayNote,
                      errorPrefix: t.ui.errorPrefix,
                    }}
                  />
                )}

                {tab === "history" && (
                  <div className="space-y-2">
                    {changes.length === 0 ? (
                      <p className="text-body-s text-ink-muted">{t.ui.noChanges}</p>
                    ) : (
                      changes.map((c) => (
                        <div key={c.id} className="rounded-panel border border-edge-neutral p-2">
                          <p className="font-data text-body-s text-ink-muted">
                            #{c.id} · {c.changed_by} · {fmtDate(c.changed_at, locale)}
                          </p>
                          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all font-data text-body-s text-ink-secondary">
                            {JSON.stringify(c.change, null, 1)}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {tab === "deps" && (
                  <div>
                    {!selected.dependencies || selected.dependencies.length === 0 ? (
                      <p className="text-body-s text-ink-muted">{t.ui.noDeps}</p>
                    ) : (
                      <ul className="space-y-1 text-body-s text-ink-secondary">
                        {selected.dependencies.map((d) => (
                          <li key={d} className="break-all font-data">
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
