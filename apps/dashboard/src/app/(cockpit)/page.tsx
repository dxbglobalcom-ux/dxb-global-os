import { Suspense } from "react";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { TaskBoard, type FeedEvent, type WaitingTask } from "@/components/task-board";
import { AgentRoster, type RosterAgent } from "@/components/agent-roster";
import { TvModeToggle } from "@/components/tv-mode";

// Cockpit home (UI-SPEC §5, exception-first LOCKED): asymmetric 12-col —
// left 8 "Beni bekleyenler" + "Az önce değişti", right 4 agent roster.
// Pure projection: RSC fetches initial state, the client layer only listens
// to dxb:* Broadcast. No equal-card grid, no firehose.
const WAITING_STATES = ["awaiting_approval", "failed", "review"];

export default async function CockpitPage() {
  const dict = getDict();
  const supabase = await createClient();

  const [waitingRes, eventsRes, pendingRes, agentsRes, agentLoadRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id,objective,department,status,updated_at")
      .in("status", WAITING_STATES)
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("task_events")
      .select("id,task_id,event,from_status,to_status,actor,created_at,tasks(objective)")
      .order("id", { ascending: false })
      .limit(12),
    supabase.from("approvals").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("agents").select("id,slug,department,role,status").order("department"),
    supabase
      .from("tasks")
      .select("agent_id,id.count()")
      .in("status", ["claimed", "running"])
      .not("agent_id", "is", null),
  ]);

  const waiting: WaitingTask[] = waitingRes.data ?? [];
  const events: FeedEvent[] = (eventsRes.data ?? []).map((row) => ({
    id: String(row.id),
    task_id: row.task_id,
    event: row.event,
    from_status: row.from_status,
    to_status: row.to_status,
    actor: row.actor,
    created_at: row.created_at,
    objective: (row.tasks as { objective?: string } | null)?.objective ?? null,
  }));

  const loadByAgent = new Map(
    ((agentLoadRes.data ?? []) as Array<{ agent_id: string; count: number }>).map((r) => [
      r.agent_id,
      r.count,
    ]),
  );
  const agents: RosterAgent[] = (agentsRes.data ?? []).map((agent) => ({
    slug: agent.slug,
    department: agent.department,
    role: agent.role,
    status: agent.status,
    activeTasks: loadByAgent.get(agent.id) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Suspense fallback={null}>
          <TvModeToggle enterLabel={dict.tv.enter} exitLabel={dict.tv.exit} />
        </Suspense>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <TaskBoard
          waiting={waiting}
          events={events}
          pendingApprovals={pendingRes.count ?? 0}
          statusLabels={dict.status}
          text={{
            waitingTitle: dict.cockpit.waitingTitle,
            waitingEmpty: dict.cockpit.waitingEmpty,
            pendingApprovalsRow: dict.cockpit.pendingApprovalsRow,
            goToApprovals: dict.cockpit.goToApprovals,
            changedTitle: dict.cockpit.changedTitle,
            changedEmpty: dict.cockpit.changedEmpty,
            asOf: dict.cockpit.asOf,
            notLiveSince: dict.cockpit.notLiveSince,
          }}
        />
      </div>
      <div className="lg:col-span-4">
        <AgentRoster
          agents={agents}
          text={{
            rosterTitle: dict.cockpit.rosterTitle,
            rosterActive: dict.cockpit.rosterActive,
            rosterDormant: dict.cockpit.rosterDormant,
            rosterShowAll: dict.cockpit.rosterShowAll,
            rosterTasksShort: dict.cockpit.rosterTasksShort,
          }}
        />
      </div>
      </div>
    </div>
  );
}
