import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Panel } from "@/components/primitives";
import { MODULE_LIVE, type LiveFamily } from "@/config/module-live";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// Honest module state v2 (E2.2 kuralı + D4 bağlantı kontratı): rota ya
// gerçek veri gösterir ya da hangi roadmap adımının teslim edeceğini
// söyler — VE kendi veri ailesinin canlı sayısını + ilgili canlı yüzeyin
// kapısını gösterir. Salt metin placeholder yasak (§34: "No data" tek
// başına yasak). Dummy widget yasak (§35).

async function familyCount(family: LiveFamily): Promise<number | null> {
  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };
  let q;
  switch (family) {
    case "tasks":
      // Single "active" definition — mirrors v_exec_overview_v1.active_tasks
      // and /ops/tasks (awaiting_approval is the CEO's queue, not machine work).
      q = supabase
        .from("tasks")
        .select("id", head)
        .in("status", ["queued", "claimed", "running"]);
      break;
    case "approvals":
      q = supabase.from("approvals").select("id", head).eq("status", "pending");
      break;
    case "agents":
      q = supabase.from("agents").select("id", head);
      break;
    case "departments":
      q = supabase.from("departments").select("id", head);
      break;
    case "cost":
      q = supabase.from("cost_ledger").select("id", head);
      break;
    case "events":
      q = supabase.from("task_events").select("id", head);
      break;
  }
  const { count, error } = await q;
  return error ? null : (count ?? 0);
}

export async function ModuleWaiting({
  pageKey,
  step,
}: {
  pageKey: string;
  step: string;
}) {
  const dict = getDict(await getLocale());
  const t = dict.command;
  const pages = t.nav.pages as Record<string, string>;
  const title = pages[pageKey] ?? pageKey;
  const live = MODULE_LIVE[pageKey];
  const count = live ? await familyCount(live.family) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">{title}</h1>
      <Panel title={t.moduleWaiting.title}>
        <p className="text-body-s text-ink-secondary">{t.moduleWaiting.body}</p>
        <p className="mt-2 font-data text-caption text-ink-muted">
          {t.moduleWaiting.step}: {step}
        </p>
        {live && count !== null && (
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-edge-neutral pt-4">
            <div>
              <span className="label-caps text-ink-muted">
                {t.moduleWaiting.liveNow}
              </span>
              <span className="live-glow ml-2 font-data text-h2 text-accent-ivory tabular-nums">
                {count}
              </span>
              <span className="ml-1.5 text-body-s text-ink-secondary">
                {pages[live.relatedKey] ?? live.relatedKey}
              </span>
            </div>
            <Link
              href={live.relatedHref}
              className="ml-auto flex items-center gap-1.5 rounded-input px-2 py-1 text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
            >
              {t.moduleWaiting.related}
              <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
            </Link>
          </div>
        )}
      </Panel>
    </div>
  );
}
