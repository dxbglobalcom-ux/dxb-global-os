import { AgentDock, type DockTask } from "@/components/command/agent-dock";
import { CommandBar } from "@/components/command/command-bar";
import {
  IntelligenceRail,
  type RailApproval,
} from "@/components/command/intelligence-rail";
import { SessionGuard } from "@/components/command/session-guard";
import { SideNav } from "@/components/command/side-nav";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// CommandShell — the single shell of the Executive Command Center
// (CC-SPEC §3, ⛔ shell is ONE: every §31 page is a module inside this
// canvas, never its own template). Five layers: command bar / side nav /
// canvas / intelligence rail / agent dock. All figures are real DB reads
// (§35: fake metrics forbidden). Broadcast liveliness lands at E8;
// TV mode wiring lands with the widget system (E12).
// Typeface note: display/body slots fall back to Geist until the ⛔
// display-family decision at the CEO eye test (DESIGN_SYSTEM §7);
// self-hosted Inter arrives with that pass — no network fonts.

export default async function CommandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command;
  const supabase = await createClient();

  // Counters come from the same single-round-trip view as the Overview
  // page (SYS_ARCH §8) — head-count queries returned bogus zeros in the
  // RSC layout (2026-07-11 fix; page and bar can never disagree again).
  // E4.5: source is the 0025x catalog view (v1 stays as compat alias).
  const [summaryRes, railRes, dockRes] = await Promise.all([
    supabase
      .from("v_exec_overview")
      .select("active_tasks,pending_approvals,pending_high_risk")
      .single<{
        active_tasks: number;
        pending_approvals: number;
        pending_high_risk: number;
      }>(),
    supabase
      .from("approvals")
      .select("id,action_type,risk_class,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("tasks")
      .select("id,objective,status")
      .in("status", ["claimed", "running"])
      .order("updated_at", { ascending: false })
      .limit(8),
  ]);

  const systemOk = !summaryRes.error;
  const approvals: RailApproval[] = (railRes.data ?? []).map((a) => ({
    id: a.id,
    title: a.action_type,
    risk: a.risk_class,
    created_at: a.created_at,
  }));
  const dockTasks: DockTask[] = (dockRes.data ?? []).map((task) => ({
    id: task.id,
    title: task.objective ?? task.id,
    status: task.status,
  }));

  return (
    <div className="ambient-depth relative flex h-dvh flex-col bg-surface-void font-body text-body-md text-ink-primary">
      <SessionGuard labels={t.session} />
      <CommandBar
        labels={t.bar}
        systemOk={systemOk}
        activeTasks={summaryRes.data?.active_tasks ?? 0}
        pendingApprovals={summaryRes.data?.pending_approvals ?? 0}
        locale={locale}
      />
      <div className="relative flex min-h-0 flex-1">
        <SideNav
          labels={t.nav}
          counters={{
            active_tasks: summaryRes.data?.active_tasks ?? 0,
            pending_approvals: summaryRes.data?.pending_approvals ?? 0,
            pending_high_risk: summaryRes.data?.pending_high_risk ?? 0,
          }}
        />
        <main className="min-w-0 flex-1 overflow-y-auto p-6">{children}</main>
        <IntelligenceRail
          labels={t.rail}
          approvals={approvals}
          pendingCount={summaryRes.data?.pending_approvals ?? 0}
        />
        <AgentDock label={t.dock.running} tasks={dockTasks} />
      </div>
    </div>
  );
}
