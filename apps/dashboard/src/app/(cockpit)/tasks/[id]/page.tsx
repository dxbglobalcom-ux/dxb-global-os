import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/panel";
import { StatusChip } from "@/components/task-board";
import { AuditTimeline, type AuditRow } from "@/components/audit-timeline";
import { TaskLiveRefresh } from "@/components/task-live-refresh";
import { formatEur } from "@/lib/format";

// Task drill-down (DASH-03, master plan step 8): ONE task's audit chronology
// — header (title + state chip + cost-so-far) over the vertical timeline.
// No firehose: every query and the live filter are pinned to this id.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const dict = getDict();
  const supabase = await createClient();

  const [taskRes, auditRes, costRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id,objective,department,status,created_at")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("audit_log")
      .select("id,actor,actor_type,action,payload,created_at")
      .eq("task_id", id)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true }),
    supabase.from("cost_ledger").select("cost_eur.sum()").eq("task_id", id),
  ]);

  const task = taskRes.data;
  if (!task) notFound();

  const rows: AuditRow[] = (auditRes.data ?? []).map((row) => ({
    id: String(row.id),
    actor: row.actor,
    actor_type: row.actor_type,
    action: row.action,
    payload: (row.payload ?? {}) as Record<string, unknown>,
    created_at: row.created_at,
  }));

  const costSoFar =
    Number((costRes.data as Array<{ sum: number | string | null }> | null)?.[0]?.sum ?? 0) || 0;

  const t = dict.task;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 flex-1 truncate text-page-title text-ink">{task.objective}</h1>
        <StatusChip status={task.status} label={dict.status[task.status as keyof typeof dict.status] ?? task.status} />
      </div>
      <p className="text-micro text-ink-2">
        {task.department} · <span className="font-mono" data-numeric>{formatEur(costSoFar)}</span> {t.costSoFar} ·{" "}
        <Link href="/" className="text-accent hover:text-accent-press">
          {t.back}
        </Link>
      </p>

      <Panel
        title={t.timelineTitle}
        stamp={
          <TaskLiveRefresh
            taskId={id}
            asOfLabel={dict.cockpit.asOf}
            notLiveLabel={dict.cockpit.notLiveSince}
          />
        }
      >
        <AuditTimeline rows={rows} emptyLabel={t.timelineEmpty} payloadLabel={t.payload} />
      </Panel>
    </div>
  );
}
