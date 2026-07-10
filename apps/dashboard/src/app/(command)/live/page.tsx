import { LiveFeed, type LiveEvent } from "@/components/command/live-feed";
import { Panel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

// Live Operations v1 (E3.3) — server snapshot of the last 40 task_events
// (with task objectives) + client Broadcast layer on the existing
// dxb:task_events / dxb:approvals channels. ops:live agent-run stream
// arrives at E8.3.

export const metadata = { title: "Live Operations — DXB" };

type EventRow = {
  id: number;
  task_id: string;
  event: string;
  to_status: string | null;
  actor: string;
  created_at: string;
  tasks: { objective: string | null } | null;
};

export default async function LivePage() {
  const dict = getDict();
  const t = dict.command.live;
  const supabase = await createClient();

  const { data } = await supabase
    .from("task_events")
    .select("id,task_id,event,to_status,actor,created_at,tasks(objective)")
    .order("id", { ascending: false })
    .limit(40);

  const initial: LiveEvent[] = ((data ?? []) as unknown as EventRow[]).map(
    (r) => ({
      id: `t-${r.id}`,
      kind: "task",
      task_id: r.task_id,
      event: r.event,
      to_status: r.to_status,
      actor: r.actor,
      objective: r.tasks?.objective ?? null,
      created_at: r.created_at,
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
