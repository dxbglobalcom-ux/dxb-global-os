import { LiveFeed, type LiveEvent } from "@/components/command/live-feed";
import { Panel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// Live Operations v2 (E4.5) — server snapshot from the 0025x catalog view
// v_live_ops (agent_runs + task_events union, 24h window, label carries the
// task objective / model id) + client Broadcast layer on the existing
// dxb:task_events / dxb:approvals channels. ops:live agent-run Broadcast
// stream arrives at E8.3; run rows appear here as soon as E8 writers land.

export const metadata = { title: "Live Operations — DXB" };

type LiveOpsRow = {
  source: "run" | "task_event";
  source_id: string;
  ts: string;
  status: string | null;
  task_id: string | null;
  workflow_run_id: string | null;
  actor: string;
  event: string;
  label: string | null;
};

export default async function LivePage() {
  const dict = getDict(await getLocale());
  const t = dict.command.live;
  const supabase = await createClient();

  const { data } = await supabase
    .from("v_live_ops")
    .select("*")
    .order("ts", { ascending: false })
    .order("source_id", { ascending: false })
    .limit(40);

  const initial: LiveEvent[] = ((data ?? []) as unknown as LiveOpsRow[]).map(
    (r) => ({
      id: `${r.source === "run" ? "r" : "t"}-${r.source_id}`,
      kind: r.source === "run" ? "run" : "task",
      task_id: r.task_id,
      event: r.event,
      to_status: r.status,
      actor: r.actor,
      objective: r.label,
      created_at: r.ts,
    }),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">{t.title}</h1>
      <Panel>
        <LiveFeed initial={initial} labels={t} />
      </Panel>
    </div>
  );
}
