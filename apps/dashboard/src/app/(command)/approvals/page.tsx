import { ApprovalCenter } from "@/components/command/approval-center";
import { Panel } from "@/components/primitives";
import {
  mapCenterRow,
  mapFatigueRow,
  type CenterViewRow,
  type FatigueViewRow,
} from "@/lib/approvals-center";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /approvals — Approval Center (E9.3, APPROVAL_ENGINE §5/§7). Pending +
// recent decisions in ONE query (v_approvals_center); fatigue metrics from
// v_approval_fatigue (R6 — a view, never a table). Quick decisions ride the
// LOCKED 0015 path (actions.ts, KALIR); the 7-action surface is the detail
// page. GATE-03 inbox grew into this center — the readable-payload work
// carried over (R5).

export const metadata = { title: "Approvals — DXB" };

export default async function ApprovalsPage() {
  const locale = await getLocale();
  const t = getDict(locale).command.approvals;
  const supabase = await createClient();

  const [pendingRes, decidedRes, fatigueRes] = await Promise.all([
    supabase
      .from("v_approvals_center")
      .select("*")
      .eq("status", "pending")
      .limit(200),
    supabase
      .from("v_approvals_center")
      .select("*")
      .neq("status", "pending")
      .order("decided_at", { ascending: false })
      .limit(50),
    supabase.from("v_approval_fatigue").select("*"),
  ]);

  const pending = ((pendingRes.data ?? []) as unknown as CenterViewRow[]).map(mapCenterRow);
  const decided = ((decidedRes.data ?? []) as unknown as CenterViewRow[]).map(mapCenterRow);
  const fatigue = ((fatigueRes.data ?? []) as unknown as FatigueViewRow[]).map(mapFatigueRow);

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <header>
        <h1 className="font-display text-h2 text-ink-primary">{t.title}</h1>
        <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
      </header>
      <Panel>
        <ApprovalCenter
          pending={pending}
          decided={decided}
          fatigue={fatigue}
          labels={t.ui}
          locale={locale}
        />
      </Panel>
    </div>
  );
}
