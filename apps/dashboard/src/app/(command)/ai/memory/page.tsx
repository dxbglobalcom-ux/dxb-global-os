import Link from "next/link";
import {
  DataGrid,
  FilterBar,
  Panel,
  Stat,
  StatusBadge,
  type Column, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /ai/memory v1 (E12.1) — MEMORY_ARCHITECTURE §7: store cards (record count,
// last write, quality signal) → filtered list → record detail (provenance +
// source-run bridge). Read surface only: control_memory_* mutations are the
// spec's own registered Dalga-4 additions (§8), recorded boundary — no fake
// action buttons. Inventory cards join library_items(kind='memory_source')
// (§4 bridge 1; claude-mem row registered through control_library_action).

export const metadata = { title: "Memory — DXB" };

const STORES = ["claude-mem", "obsidian", "graphify", "notebook", "pgvector"] as const;
// CEO measurement 2026-07-25 (C24 precedent — construction vs company):
// store 'claude-mem' = pointer archive of Fable's BUILD sessions (9.6k rows,
// 2026-07-10..24), not company knowledge. It leaves the headline figures and
// the default list; it stays reachable behind its own panel.
const COMPANY_STORES = ["obsidian", "graphify", "notebook", "pgvector"] as const;
const CONSTRUCTION_STORE = "claude-mem";
const KINDS = ["fact", "relation", "artifact", "procedure"] as const;
const TIERS = ["trusted", "quarantined"] as const;
const ROW_LIMIT = 100;

type IndexRow = {
  id: string;
  kind: string;
  store: string;
  ref: string;
  trust_tier: string;
  confidence: number;
  scope: string;
  run_id: string | null;
  superseded_by: string | null;
  created_at: string;
};

type DetailRow = IndexRow & {
  provenance: Record<string, unknown>;
  expires_at: string | null;
};

export default async function MemoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    store?: string;
    kind?: string;
    tier?: string;
    q?: string;
    id?: string;
  }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.memory;
  const tf = dict.command.filters;
  const supabase = await createClient();

  const store = STORES.includes(params.store as (typeof STORES)[number])
    ? params.store
    : undefined;
  const kind = KINDS.includes(params.kind as (typeof KINDS)[number])
    ? params.kind
    : undefined;
  const tier = TIERS.includes(params.tier as (typeof TIERS)[number])
    ? params.tier
    : undefined;
  const q = (params.q ?? "").trim().slice(0, 120) || undefined;
  const detailId = /^[0-9a-f-]{36}$/.test(params.id ?? "") ? params.id : undefined;

  let listQuery = supabase
    .from("memory_index")
    .select(
      "id, kind, store, ref, trust_tier, confidence, scope, run_id, superseded_by, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(ROW_LIMIT);
  if (store) listQuery = listQuery.eq("store", store);
  // default view = company memory; construction pointers only when asked for
  else listQuery = listQuery.neq("store", CONSTRUCTION_STORE);
  if (kind) listQuery = listQuery.eq("kind", kind);
  if (tier) listQuery = listQuery.eq("trust_tier", tier);
  if (q) listQuery = listQuery.ilike("ref", `%${q}%`);

  const [aggRes, invRes, listRes, detailRes] = await Promise.all([
    supabase
      .from("memory_index")
      .select("store, trust_tier, cnt:id.count(), last:created_at.max()"),
    supabase
      .from("library_items")
      .select("name, usage_notes, updated_at")
      .eq("kind", "memory_source"),
    listQuery,
    detailId
      ? supabase.from("memory_index").select("*").eq("id", detailId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (aggRes.error || invRes.error || listRes.error || detailRes.error) {
    const message =
      aggRes.error?.message ??
      invRes.error?.message ??
      listRes.error?.message ??
      detailRes.error?.message;
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.memory} state="error">
          <p className="text-body-s text-status-danger">memory_index: {message}</p>
        </Panel>
      </div>
    );
  }

  type AggRow = { store: string; trust_tier: string; cnt: number; last: string };
  const agg = (aggRes.data ?? []) as unknown as AggRow[];
  const byStore = new Map<
    string,
    { total: number; trusted: number; last: string | null }
  >();
  for (const row of agg) {
    const s = byStore.get(row.store) ?? { total: 0, trusted: 0, last: null };
    s.total += Number(row.cnt);
    if (row.trust_tier === "trusted") s.trusted += Number(row.cnt);
    if (!s.last || (row.last && row.last > s.last)) s.last = row.last;
    byStore.set(row.store, s);
  }
  const inventory = new Map(
    (
      (invRes.data ?? []) as {
        name: string;
        usage_notes: string | null;
        updated_at: string;
      }[]
    ).map((r) => [r.name, r]),
  );
  const companyStats = COMPANY_STORES.map((s) => byStore.get(s)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );
  const totalRecords = companyStats.reduce((a, s) => a + s.total, 0);
  const trustedRecords = companyStats.reduce((a, s) => a + s.trusted, 0);
  const liveStores = companyStats.filter((s) => s.total > 0).length;
  const lastWrite = companyStats.reduce<string | null>(
    (a, s) => (s.last && (!a || s.last > a) ? s.last : a),
    null,
  );
  const construction = byStore.get(CONSTRUCTION_STORE) ?? {
    total: 0,
    trusted: 0,
    last: null,
  };

  const rows = (listRes.data ?? []) as IndexRow[];
  const matched = listRes.count ?? rows.length;
  const detail = (detailRes.data ?? null) as DetailRow | null;

  // §4 bridge 2: memory row → source agent_run → employee.
  let detailRun:
    | {
        id: string;
        model_id: string | null;
        status: string;
        started_at: string;
        slug: string | null;
      }
    | null = null;
  if (detail?.run_id) {
    const runRes = await supabase
      .from("agent_runs")
      .select("id, model_id, status, started_at, employee_id")
      .eq("id", detail.run_id)
      .maybeSingle();
    if (runRes.data) {
      const run = runRes.data as {
        id: string;
        model_id: string | null;
        status: string;
        started_at: string;
        employee_id: string | null;
      };
      let slug: string | null = null;
      if (run.employee_id) {
        const agentRes = await supabase
          .from("agents")
          .select("slug")
          .eq("id", run.employee_id)
          .maybeSingle();
        slug = (agentRes.data as { slug: string } | null)?.slug ?? null;
      }
      detailRun = {
        id: run.id,
        model_id: run.model_id,
        status: run.status,
        started_at: run.started_at,
        slug,
      };
    }
  }

  const selfHref = (over: Record<string, string | undefined>) => {
    const merged = { store, kind, tier, q, id: detailId, ...over };
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) query.set(k, v);
    const s = query.toString();
    return `/ai/memory${s ? `?${s}` : ""}`;
  };

  // locale-pinned: a browser/server-default short month would leak an EN
  // month name onto the TR screen (RULE #0 purity; rail precedent).
  const dateFmt = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        })
      : "—";

  const tierBadge = (tr: string) => (
    <StatusBadge level={tr === "trusted" ? "ok" : "warn"}>
      {tr === "trusted" ? t.tierTrusted : t.tierQuarantined}
    </StatusBadge>
  );

  const kindLabels = t.kinds as Record<string, string>;

  const columns: Column<IndexRow>[] = [
    {
      key: "ref",
      label: t.colRef,
      render: (r) => (
        <Link
          href={selfHref({ id: r.id })}
          className="block max-w-[38ch] break-all font-data text-accent-champagne"
        >
          {r.ref}
        </Link>
      ),
    },
    { key: "kind", label: t.colKind, render: (r) => kindLabels[r.kind] ?? r.kind },
    {
      key: "store",
      label: t.colStore,
      render: (r) => <span className="font-data">{r.store}</span>,
    },
    { key: "trust_tier", label: t.colTier, render: (r) => tierBadge(r.trust_tier) },
    {
      key: "confidence",
      label: t.colConfidence,
      align: "right",
      numeric: true,
      render: (r) => Number(r.confidence).toFixed(2),
    },
    {
      key: "scope",
      label: t.colScope,
      render: (r) => <span className="font-data">{r.scope}</span>,
    },
    {
      key: "created_at",
      label: t.colWhen,
      align: "right",
      numeric: true,
      render: (r) => (
        <span className="whitespace-nowrap">{dateFmt(r.created_at)}</span>
      ),
    },
  ];

  const provenanceEntries = detail
    ? Object.entries(detail.provenance ?? {}).filter(([, v]) => v != null)
    : [];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.memory}{" "}
        <HelpTip text={dict.help.memory} />
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiRecords}
          value={String(totalRecords)}
          glow
          drillHref="/ai/memory"
        />
        <Stat
          label={t.kpiTrusted}
          value={
            totalRecords > 0
              ? // one decimal — 5924/5931 must read 99.9%, not a rounded 100%
                `${((trustedRecords / totalRecords) * 100).toFixed(1)}%`
              : "—"
          }
          drillHref={selfHref({ tier: "trusted", id: undefined })}
        />
        <Stat
          label={t.kpiStores}
          value={`${liveStores}/${COMPANY_STORES.length}`}
          drillHref="/ai/library?kind=memory_source"
        />
        <Stat label={t.kpiLastWrite} value={dateFmt(lastWrite)} drillHref="/ai/memory" />
      </div>

      {/* §7 store cards: record count + last write + quality signal; the
          library inventory row (§4 bridge 1) supplies the description.
          Company stores only — the construction archive sits in its own
          panel below (C24 separation, CEO ruling 2026-07-25). */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COMPANY_STORES.map((s) => {
          const stat = byStore.get(s);
          const inv = inventory.get(s);
          const selected = store === s;
          return (
            <Link
              key={s}
              href={selfHref({ store: selected ? undefined : s, id: undefined })}
            >
              <Panel title={s} state={selected ? "selected" : "default"} hoverable>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-data text-h3 text-ink-primary tabular-nums">
                    {stat?.total ?? 0}
                  </span>
                  <span className="whitespace-nowrap font-data text-caption text-ink-muted tabular-nums">
                    {stat && stat.total > 0
                      ? `${((stat.trusted / stat.total) * 100).toFixed(1)}% ${t.tierTrustedShort}`
                      : "—"}
                  </span>
                </div>
                <p className="mt-1 text-caption text-ink-muted">
                  {t.lastWrite}: {dateFmt(stat?.last ?? null)}
                </p>
                {inv?.usage_notes && (
                  <p
                    className="mt-2 break-words text-caption text-ink-secondary"
                    title={inv.usage_notes}
                  >
                    {inv.usage_notes}
                  </p>
                )}
              </Panel>
            </Link>
          );
        })}
      </div>

      {/* Construction archive — Fable's build-session observation pointers.
          Not company knowledge; never auto-read by employees (recall is
          call-only). Kept out of the headline numbers and the default list. */}
      <Panel
        title={t.constructionTitle}
        state={store === CONSTRUCTION_STORE ? "selected" : "default"}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="font-data text-h3 text-ink-primary tabular-nums">
            {construction.total}
          </span>
          <span className="font-data text-caption text-ink-muted tabular-nums">
            {t.lastWrite}: {dateFmt(construction.last)}
          </span>
        </div>
        <p className="mt-2 max-w-[90ch] break-words text-body-s text-ink-secondary">
          {t.constructionBody}
        </p>
        <div className="mt-3">
          <Link
            href={selfHref({
              store: store === CONSTRUCTION_STORE ? undefined : CONSTRUCTION_STORE,
              id: undefined,
            })}
            className="text-body-s text-accent-champagne"
          >
            {store === CONSTRUCTION_STORE ? t.constructionHide : t.constructionView}
          </Link>
        </div>
      </Panel>

      {detail && (
        <Panel title={`${t.detailTitle} · ${detail.store}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="max-w-[80ch] break-all font-data text-body-s text-ink-primary">
              {detail.ref}
            </p>
            <Link
              href={selfHref({ id: undefined })}
              className="whitespace-nowrap text-body-s text-accent-champagne"
            >
              {t.detailClose} ✕
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-body-s md:grid-cols-4">
            <div>
              <div className="label-caps text-ink-muted">{t.colKind}</div>
              <div className="text-ink-primary">
                {kindLabels[detail.kind] ?? detail.kind}
              </div>
            </div>
            <div>
              <div className="label-caps text-ink-muted">{t.colTier}</div>
              <div>{tierBadge(detail.trust_tier)}</div>
            </div>
            <div>
              <div className="label-caps text-ink-muted">{t.colConfidence}</div>
              <div className="font-data tabular-nums">
                {Number(detail.confidence).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="label-caps text-ink-muted">{t.colScope}</div>
              <div className="font-data">{detail.scope}</div>
            </div>
            <div>
              <div className="label-caps text-ink-muted">{t.colWhen}</div>
              <div className="font-data tabular-nums">{dateFmt(detail.created_at)}</div>
            </div>
            <div>
              <div className="label-caps text-ink-muted">{t.detailExpires}</div>
              <div className="font-data tabular-nums">{dateFmt(detail.expires_at)}</div>
            </div>
            {detail.superseded_by && (
              <div className="col-span-2">
                <div className="label-caps text-ink-muted">{t.detailSuperseded}</div>
                <Link
                  href={selfHref({ id: detail.superseded_by })}
                  className="font-data text-accent-champagne"
                >
                  {detail.superseded_by.slice(0, 8)}
                </Link>
              </div>
            )}
          </div>

          {provenanceEntries.length > 0 && (
            <div className="mt-4 border-t border-edge-neutral pt-3">
              <div className="label-caps text-ink-muted">{t.detailProvenance}</div>
              <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-body-s md:grid-cols-2">
                {provenanceEntries.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3">
                    <dt className="font-data text-ink-muted">{k}</dt>
                    <dd
                      className="min-w-0 break-all font-data text-ink-secondary"
                    >
                      {typeof v === "string" ? v : JSON.stringify(v)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-4 border-t border-edge-neutral pt-3">
            <div className="label-caps text-ink-muted">{t.detailRun}</div>
            {detailRun ? (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-body-s">
                <span className="font-data text-ink-primary">
                  {detailRun.slug ?? "—"}
                </span>
                <span className="font-data text-ink-secondary">
                  {detailRun.model_id ?? "—"}
                </span>
                <StatusBadge level={detailRun.status === "succeeded" ? "ok" : "info"}>
                  {(dict.status as Record<string, string>)[detailRun.status] ?? detailRun.status}
                </StatusBadge>
                <span className="font-data text-caption text-ink-muted tabular-nums">
                  {dateFmt(detailRun.started_at)}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-body-s text-ink-secondary">{t.detailNoRun}</p>
            )}
          </div>

          <p className="mt-4 border-t border-edge-neutral pt-3 text-caption text-ink-muted">
            {t.mutationsBoundary}
          </p>
        </Panel>
      )}

      <Panel title={`${t.listTitle} · ${matched}`}>
        <form action="/ai/memory" method="get" className="mb-3 flex flex-wrap items-center gap-2">
          {store && <input type="hidden" name="store" value={store} />}
          {kind && <input type="hidden" name="kind" value={kind} />}
          {tier && <input type="hidden" name="tier" value={tier} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder={t.searchPlaceholder}
            className="w-64 rounded-input border border-edge-neutral bg-surface-graphite px-2.5 py-1 text-body-s text-ink-primary placeholder:text-ink-muted focus:border-edge-champagne focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-input border border-edge-neutral px-2.5 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
          >
            {t.searchAction}
          </button>
        </form>

        {/* C9 list-page standard: kind + trust tier ride the FilterBar (store
            selection stays on the §7 cards above — progressive disclosure). */}
        <div className="mb-3">
          <FilterBar
            clearLabel={tf.clear}
            groups={[
              {
                param: "kind",
                label: tf.kind,
                kind: "chips",
                value: kind ?? "",
                defaultValue: "",
                options: [
                  { value: "", label: tf.all },
                  ...KINDS.map((k) => ({
                    value: k,
                    label: kindLabels[k] ?? k,
                  })),
                ],
              },
              {
                param: "tier",
                label: t.colTier,
                kind: "chips",
                value: tier ?? "",
                defaultValue: "",
                options: [
                  { value: "", label: tf.all },
                  { value: "trusted", label: t.tierTrusted },
                  { value: "quarantined", label: t.tierQuarantined },
                ],
              },
            ]}
          />
        </div>

        {rows.length === 0 ? (
          <p className="py-4 text-body-s text-ink-secondary">{t.empty}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <DataGrid
                className="min-w-[880px]"
                columns={columns}
                rows={rows}
                rowKey={(r) => r.id}
              />
            </div>
            <p className="mt-2 text-right font-data text-caption text-ink-muted tabular-nums">
              {t.showing} {rows.length} {t.of} {matched}
            </p>
          </>
        )}
      </Panel>
    </div>
  );
}
