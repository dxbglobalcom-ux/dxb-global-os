import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { ApprovalsInbox } from "@/components/approvals/inbox";
import type { InboxApproval } from "@/lib/approvals";

// Approvals inbox (GATE-03, master plan step 5): server-fetches pending
// drafts with their task context; the client island groups by risk_class
// and stays live over dxb:approvals. B7b: money-IN never creates an
// approvals row upstream, so this surface only ever shows gated OUTWARD
// actions — the money-OUT badge is derived per row.
export default async function ApprovalsPage() {
  const dict = getDict();
  const supabase = await createClient();

  const { data } = await supabase
    .from("approvals")
    .select("id,task_id,action_type,payload,risk_class,created_at,tasks(department,objective)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const rows: InboxApproval[] = (data ?? []).map((row) => {
    const task = row.tasks as { department?: string; objective?: string } | null;
    return {
      id: row.id,
      task_id: row.task_id,
      action_type: row.action_type,
      payload: (row.payload ?? {}) as Record<string, unknown>,
      risk_class: row.risk_class,
      created_at: row.created_at,
      department: task?.department ?? null,
      objective: task?.objective ?? null,
    };
  });

  const a = dict.approvals;
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-page-title text-ink">{a.title}</h1>
      <ApprovalsInbox
        rows={rows}
        text={{
          groupHigh: a.groupHigh,
          groupMedium: a.groupMedium,
          groupLow: a.groupLow,
          approve: a.approve,
          confirmApprove: a.confirmApprove,
          reject: a.reject,
          rejectNotePlaceholder: a.rejectNotePlaceholder,
          approveAll: a.approveAll,
          moneyOut: a.moneyOut,
          highBadge: a.highBadge,
          payload: a.payload,
          details: a.details,
          fields: a.fields,
          empty: a.empty,
          emptyAction: a.emptyAction,
          fatigue: a.fatigue,
          errorPanelTitle: a.errorPanelTitle,
          asOf: dict.cockpit.asOf,
          notLiveSince: dict.cockpit.notLiveSince,
        }}
      />
    </div>
  );
}
