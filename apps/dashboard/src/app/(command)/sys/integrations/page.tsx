import Link from "next/link";
import { Panel, Stat, StatusBadge } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /sys/integrations v1 (E12.1-F) — outward connection surfaces that exist
// TODAY: the approval-gated outbox (the only door outward actions leave
// through), the CRM tables (Phase-3 lineage), and the revenue ledger's
// source column (E6.5 — external writers dock here). Planned integrations
// (WooCommerce, bank feeds, e-mail send) are listed as recorded boundaries
// with their landing step — named, not simulated.

export const metadata = { title: "Integrations — DXB" };

export default async function IntegrationsPage() {
  const dict = getDict(await getLocale());
  const t = dict.command.integrations;
  const supabase = await createClient();

  const [outboxRes, crmClientsRes, crmDealsRes, crmReqRes, revSourcesRes] =
    await Promise.all([
      // v_outbox_status (20260714080000): status-only projection — the
      // outbox table itself stays closed to authenticated.
      supabase.from("v_outbox_status").select("status, cnt:id.count()"),
      supabase.from("crm_clients").select("id", { count: "exact", head: true }),
      supabase.from("crm_deals").select("id", { count: "exact", head: true }),
      supabase.from("crm_requests").select("id", { count: "exact", head: true }),
      supabase.from("revenue_ledger").select("source, cnt:id.count()"),
    ]);

  if (outboxRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.integrations} state="error">
          <p className="text-body-s text-status-danger">
            outbox: {outboxRes.error.message}
          </p>
        </Panel>
      </div>
    );
  }

  const outbox = (outboxRes.data ?? []) as unknown as { status: string; cnt: number }[];
  const outboxTotal = outbox.reduce((a, r) => a + Number(r.cnt), 0);
  const revSources = (revSourcesRes.data ?? []) as unknown as {
    source: string;
    cnt: number;
  }[];
  const crmTotal =
    (crmClientsRes.count ?? 0) + (crmDealsRes.count ?? 0) + (crmReqRes.count ?? 0);

  const planned: { name: string; step: string }[] = [
    { name: t.plannedWoo, step: "MASTER_PLAN Phase 11" },
    { name: t.plannedBank, step: "REVENUE (E6.5 source column ready)" },
    { name: t.plannedEmail, step: "outbox executor · P7" },
    { name: t.plannedLitellm, step: "COST A1/A2 · P7" },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.integrations}
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat label={t.kpiOutbox} value={String(outboxTotal)} glow drillHref="/approvals" />
        <Stat label={t.kpiCrm} value={String(crmTotal)} drillHref="/sys/integrations" />
        <Stat
          label={t.kpiRevenueSources}
          value={String(revSources.length)}
          drillHref="/fin/pnl"
        />
        <Stat label={t.kpiPlanned} value={String(planned.length)} drillHref="/sys/integrations" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title={t.outboxTitle}>
          <p className="mb-3 text-caption text-ink-muted">{t.outboxHint}</p>
          {outbox.length === 0 ? (
            <p className="text-body-s text-ink-secondary">{t.outboxEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {outbox.map((r) => (
                <li
                  key={r.status}
                  className="flex items-baseline justify-between gap-3 text-body-s"
                >
                  <span className="text-ink-secondary">
                    {(t.outboxStatuses as Record<string, string>)[r.status] ?? r.status}
                  </span>
                  <Link
                    href="/approvals"
                    className="font-data text-accent-champagne tabular-nums"
                  >
                    {r.cnt}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t.crmTitle}>
          <ul className="space-y-2 text-body-s">
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-ink-secondary">{t.crmClients}</span>
              <span className="font-data text-ink-primary tabular-nums">
                {crmClientsRes.count ?? 0}
              </span>
            </li>
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-ink-secondary">{t.crmDeals}</span>
              <span className="font-data text-ink-primary tabular-nums">
                {crmDealsRes.count ?? 0}
              </span>
            </li>
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-ink-secondary">{t.crmRequests}</span>
              <span className="font-data text-ink-primary tabular-nums">
                {crmReqRes.count ?? 0}
              </span>
            </li>
          </ul>
          <p className="mt-3 border-t border-edge-neutral pt-2 text-caption text-ink-muted">
            {t.crmHint}
          </p>
        </Panel>
      </div>

      <Panel title={t.revenueTitle}>
        {revSources.length === 0 ? (
          <p className="text-body-s text-ink-secondary">{t.revenueEmpty}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {revSources.map((r) => (
              <li key={r.source}>
                <StatusBadge level="ok">
                  <span className="font-data">{r.source}</span> {r.cnt}
                </StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={t.plannedTitle}>
        <ul className="space-y-2">
          {planned.map((p) => (
            <li
              key={p.name}
              className="flex flex-wrap items-baseline justify-between gap-3 text-body-s"
            >
              <span className="text-ink-secondary">{p.name}</span>
              <span className="flex items-center gap-2">
                <StatusBadge level="info">{t.plannedBadge}</StatusBadge>
                <span className="font-data text-caption text-ink-muted">{p.step}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
