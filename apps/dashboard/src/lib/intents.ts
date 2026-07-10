// Intent chain status derivation (DASH-02 IntentStrip). An intent's chip
// state is its row status until dispatch, then the WORST/most-informative
// state of its task chain: failed > running > queued > done.
export type IntentChainStatus =
  | "received"
  | "classifying"
  | "queued"
  | "running"
  | "done"
  | "failed"
  | "failed_dispatch";

export type RecentIntent = {
  id: string;
  text: string;
  status: IntentChainStatus;
  taskIds: string[];
  rootTaskId: string | null;
  created_at: string;
};

const RUNNING_STATES = new Set(["claimed", "running", "review", "awaiting_approval"]);

export function deriveChainStatus(
  intentStatus: string,
  taskStatuses: string[],
): IntentChainStatus {
  if (intentStatus === "received" || intentStatus === "classifying") return intentStatus;
  if (intentStatus === "failed_dispatch") return "failed_dispatch";
  if (taskStatuses.length === 0) return "queued";
  if (taskStatuses.some((s) => s === "failed")) return "failed";
  if (taskStatuses.some((s) => RUNNING_STATES.has(s))) return "running";
  if (taskStatuses.every((s) => s === "done")) return "done";
  return "queued";
}

type PostgrestClient = {
  from(table: string): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select(columns: string): any;
  };
};

export async function fetchRecentIntents(
  supabase: PostgrestClient,
  limit = 5,
): Promise<RecentIntent[]> {
  const { data: intents, error } = await supabase
    .from("intents")
    .select("id,text,status,task_ids,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !intents) return [];

  const allTaskIds = (intents as Array<{ task_ids: string[] }>).flatMap((i) => i.task_ids);
  const statusById = new Map<string, string>();
  if (allTaskIds.length > 0) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id,status")
      .in("id", allTaskIds);
    for (const task of (tasks ?? []) as Array<{ id: string; status: string }>) {
      statusById.set(task.id, task.status);
    }
  }

  return (intents as Array<{ id: string; text: string; status: string; task_ids: string[]; created_at: string }>).map(
    (intent) => ({
      id: intent.id,
      text: intent.text,
      taskIds: intent.task_ids,
      rootTaskId: intent.task_ids[0] ?? null,
      created_at: intent.created_at,
      status: deriveChainStatus(
        intent.status,
        intent.task_ids.map((id) => statusById.get(id)).filter((s): s is string => !!s),
      ),
    }),
  );
}
