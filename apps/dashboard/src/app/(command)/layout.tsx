import { AgentDock, type DockTask } from "@/components/command/agent-dock";
import { CommandBar } from "@/components/command/command-bar";
import {
  IntelligenceRail,
  type RailApproval,
} from "@/components/command/intelligence-rail";
import { SideNav } from "@/components/command/side-nav";
import { getDict } from "@/lib/i18n";
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
  const dict = getDict();
  const t = dict.command;
  const supabase = await createClient();

  const [activeRes, pendingRes, railRes, dockRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("status", ["queued", "claimed", "running"]),
    supabase
      .from("approvals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
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

  const systemOk = !activeRes.error && !pendingRes.error;
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
    <div className="flex h-dvh flex-col bg-surface-void font-body text-body-md text-ink-primary">
      <CommandBar
        labels={t.bar}
        systemOk={systemOk}
        activeTasks={activeRes.count ?? 0}
        pendingApprovals={pendingRes.count ?? 0}
      />
      <div className="relative flex min-h-0 flex-1">
        <SideNav labels={t.nav} />
        <main className="min-w-0 flex-1 overflow-y-auto p-6">{children}</main>
        <IntelligenceRail
          labels={t.rail}
          approvals={approvals}
          pendingCount={pendingRes.count ?? 0}
        />
        <AgentDock label={t.dock.running} tasks={dockTasks} />
      </div>
    </div>
  );
}
