import { Panel, Stat } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { periodTotal, postgrestCostSource } from "@/lib/costs";
import { createClient } from "@/lib/supabase/server";

// Executive Overview v0 (E2.1 slice) — real counters on the existing
// schema; every number is a drill door (CC-SPEC madde 2B). The full
// widget grid over v_exec_overview lands at E3.2; until then this page
// states that honestly instead of rendering dummy widgets (§35).

export const metadata = { title: "Executive Overview — DXB" };

export default async function OverviewPage() {
  const dict = getDict();
  const t = dict.command.overview;
  const w = dict.command.moduleWaiting;
  const supabase = await createClient();

  const [activeRes, pendingRes, todayCost] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("status", ["queued", "claimed", "running"]),
    supabase
      .from("approvals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    periodTotal(postgrestCostSource(supabase), "today", new Date()),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">{t.title}</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat
          label={t.statActiveTasks}
          value={String(activeRes.count ?? 0)}
          drillHref="/ops/tasks?state=active"
        />
        <Stat
          label={t.statPendingApprovals}
          value={String(pendingRes.count ?? 0)}
          drillHref="/approvals?state=pending"
        />
        <Stat
          label={t.statTodayCost}
          value={todayCost.toFixed(2)}
          unit="EUR"
          drillHref="/fin/costs?range=today"
        />
      </div>

      <Panel title={w.title}>
        <p className="text-body-s text-ink-secondary">{t.waitingBody}</p>
        <p className="mt-2 font-data text-caption text-ink-muted">
          {w.step}: E3.2
        </p>
      </Panel>
    </div>
  );
}
