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

// /ops/automations v1 (E12.1-F) — everything that fires WITHOUT a human:
// the 9 live pg-boss schedules (v_automation_schedules projection) +
// cron/event-triggered workflows (E9.x engine; manual-trigger workflows
// live on /ops/workflows) + the intent-intake pipeline counter. Schedules
// are code-registered (kernel boot) — read-only here by design.

export const metadata = { title: "Automations — DXB" };

type ScheduleRow = {
  name: string;
  cron: string;
  timezone: string | null;
  updated_on: string;
};

type WorkflowRow = {
  id: string;
  slug: string;
  name: string;
  // §9 trigger contract (packages/kernel/src/workflow/types.ts): jsonb {kind, ...}
  trigger: { kind: string } | null;
  enabled: boolean;
  version: number;
};

export default async function AutomationsPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.automations;
  const supabase = await createClient();

  const [schedRes, wfRes, intentsRes] = await Promise.all([
    supabase.from("v_automation_schedules").select("*").order("name"),
    supabase
      .from("workflows")
      .select("id, slug, name, trigger, enabled, version")
      .neq("trigger->>kind", "manual")
      .order("slug"),
    supabase.from("intents").select("id", { count: "exact", head: true }),
  ]);

  if (schedRes.error || wfRes.error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.automations} state="error">
          <p className="text-body-s text-status-danger">
            {schedRes.error?.message ?? wfRes.error?.message}
          </p>
        </Panel>
      </div>
    );
  }

  const schedules = (schedRes.data ?? []) as ScheduleRow[];
  const workflows = (wfRes.data ?? []) as WorkflowRow[];

  const timeFmt = (iso: string) =>
    new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

  const schedColumns: Column<ScheduleRow>[] = [
    {
      key: "name",
      label: t.colJob,
      render: (r) => <span className="font-data">{r.name}</span>,
    },
    {
      key: "cron",
      label: t.colCron,
      render: (r) => <span className="font-data">{r.cron}</span>,
    },
    {
      key: "timezone",
      label: t.colTimezone,
      render: (r) => <span className="font-data">{r.timezone ?? "—"}</span>,
    },
    {
      key: "updated_on",
      label: t.colUpdated,
      align: "right",
      numeric: true,
      render: (r) => (
        <span className="whitespace-nowrap font-data tabular-nums">
          {timeFmt(r.updated_on)}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.automations}{" "}
        <HelpTip text={dict.help.automations} />
      </h1>
        <Link href="/ops/workflows" className="text-body-s text-accent-champagne">
          {t.viewWorkflows}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiSchedules}
          value={String(schedules.length)}
          glow
          drillHref="/ops/automations"
        />
        <Stat
          label={t.kpiTriggeredWf}
          value={String(workflows.length)}
          drillHref="/ops/workflows"
        />
        <Stat
          label={t.kpiTriggeredWfOn}
          value={String(workflows.filter((w) => w.enabled).length)}
          drillHref="/ops/workflows"
        />
        <Stat
          label={t.kpiIntents}
          value={String(intentsRes.count ?? 0)}
          drillHref="/live"
        />
      </div>

      <Panel title={`${t.schedulesTitle} · ${schedules.length}`}>
        <p className="mb-3 text-caption text-ink-muted">{t.schedulesHint}</p>
        {schedules.length === 0 ? (
          <p className="py-2 text-body-s text-ink-secondary">{t.schedulesEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <DataGrid
              className="min-w-[720px]"
              columns={schedColumns}
              rows={schedules}
              rowKey={(r) => r.name}
            />
          </div>
        )}
      </Panel>

      <Panel title={t.workflowsTitle}>
        {workflows.length === 0 ? (
          // Honest zero: no cron/event workflow defined yet — the composer
          // on /ops/workflows creates them; nothing is staged here.
          <p className="py-2 text-body-s text-ink-secondary">{t.workflowsEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {workflows.map((w) => (
              <li key={w.id}>
                <Link
                  href="/ops/workflows"
                  className="flex items-center justify-between gap-3 rounded-input border border-edge-neutral bg-surface-graphite p-2 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
                >
                  <span className="min-w-0 truncate text-body-s text-ink-primary">
                    {w.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-data text-caption text-ink-secondary">
                      {(t.triggers as Record<string, string>)[w.trigger?.kind ?? ""] ??
                        w.trigger?.kind ??
                        "—"}
                    </span>
                    <StatusBadge level={w.enabled ? "ok" : "info"}>
                      {w.enabled ? t.enabled : t.disabled}
                    </StatusBadge>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
