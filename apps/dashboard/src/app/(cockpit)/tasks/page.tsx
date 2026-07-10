import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/panel";
import { StatusChip } from "@/components/task-board";
import { FreshnessStamp } from "@/components/freshness-stamp";
import { timeHM } from "@/lib/format";

// Tasks index: the sidebar's /tasks target. Exception-first stays on the
// cockpit home — this page is the deliberate "look at everything" view, a
// bounded recency list (not a live firehose: no Broadcast subscription here,
// drill-down owns liveness).
const PAGE_SIZE = 50;

export default async function TasksIndexPage() {
  const dict = getDict();
  const supabase = await createClient();

  const { data } = await supabase
    .from("tasks")
    .select("id,objective,department,status,updated_at")
    .order("updated_at", { ascending: false })
    .limit(PAGE_SIZE);

  const tasks = data ?? [];
  const t = dict.tasksList;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-page-title text-ink">{t.title}</h1>
      <Panel
        title={`${tasks.length} · ${t.showingRecent}`}
        stamp={
          <FreshnessStamp
            state={{ status: "live", lastAt: new Date() }}
            asOfLabel={dict.cockpit.asOf}
            notLiveLabel={dict.cockpit.notLiveSince}
          />
        }
      >
        <ul className="divide-y divide-line">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 py-3">
              <span className="font-mono text-micro text-ink-2" data-numeric>
                {timeHM(new Date(task.updated_at))}
              </span>
              <Link
                href={`/tasks/${task.id}`}
                className="min-w-0 flex-1 truncate text-body text-ink hover:text-accent"
              >
                {task.objective}
              </Link>
              <span className="text-micro text-ink-2">{task.department}</span>
              <StatusChip
                status={task.status}
                label={dict.status[task.status as keyof typeof dict.status] ?? task.status}
              />
            </li>
          ))}
          {tasks.length === 0 && <li className="py-3 text-body text-ink-2">{t.empty}</li>}
        </ul>
      </Panel>
    </div>
  );
}
