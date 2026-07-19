import { LiveFeed } from "@/components/command/live-feed";
import { Panel, HelpTip } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { mapLiveOpsRow, type LiveEvent, type LiveOpsRow } from "@/lib/live-ops";
import { createClient } from "@/lib/supabase/server";

// Live Operations v2 (E4.5 snapshot + E8.3 live stream) — server snapshot
// from the 0025x catalog view v_live_ops (agent_runs + task_events union,
// 24h window, label carries the task objective / model id) + client
// Broadcast layer on the EVENT_MODEL §9b ops:live channel (agent runs,
// task events, decisions — 1 s collector batches) with approvals on their
// 0013 channel.

export const metadata = { title: "Live Operations — DXB" };

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

  const initial: LiveEvent[] = ((data ?? []) as unknown as LiveOpsRow[]).map(mapLiveOpsRow);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">{t.title} <HelpTip text={dict.help.live} /></h1>
      <Panel>
        <LiveFeed initial={initial} labels={t} statusLabels={dict.status} />
      </Panel>
    </div>
  );
}
