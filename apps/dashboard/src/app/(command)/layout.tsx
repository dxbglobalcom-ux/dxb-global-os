import { AgentDock, type DockTask } from "@/components/command/agent-dock";
import { CommandBar } from "@/components/command/command-bar";
import {
  IntelligenceRail,
  type RailAlert,
  type RailApproval,
  type TickerRow,
} from "@/components/command/intelligence-rail";
import { SessionGuard } from "@/components/command/session-guard";
import { SideNav } from "@/components/command/side-nav";
import { localizeAlertTitle } from "@/lib/alert-title";
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
  const [summaryRes, railRes, dockRes, pauseRes, alertsRes, tickerRes] = await Promise.all([
    supabase
      .from("v_exec_overview")
      .select("active_tasks,pending_approvals,pending_high_risk")
      .single<{
        active_tasks: number;
        pending_approvals: number;
        pending_high_risk: number;
      }>(),
    // E9.3 §5 rail summary: the center view carries the money_out flag and
    // purpose; oldest-first so the rail surfaces what has waited longest.
    supabase
      .from("v_approvals_center")
      .select("id,action_type,operation,purpose,risk_class,created_at,money_out")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(200),
    // Only genuinely in-flight work reaches the dock: a claimed/running task
    // without a live lease is a zombie (wave 3f — a 3-day-old unclaimed seed
    // sat on every screen as green "running").
    supabase
      .from("tasks")
      .select("id,objective,status")
      .in("status", ["claimed", "running"])
      .not("claimed_by", "is", null)
      .gt("lease_expires_at", new Date().toISOString())
      .order("updated_at", { ascending: false })
      .limit(8),
    // Kill-switch visibility (E6.4 / GAP-07): os.global_pause has no
    // settings_values row until first toggled — absent = registry default
    // (false). The paused state must be visible on every page, always.
    supabase
      .from("settings_values")
      .select("value")
      .eq("key", "os.global_pause")
      .eq("scope", "global")
      .maybeSingle<{ value: boolean }>(),
    // E8.4b: rail alerts panel = the real priority head of v_alerts_active
    // (view carries severity → unacked → age order; kind='alert' only here,
    // approvals already own their rail panel).
    supabase
      .from("v_alerts_active")
      .select("kind,id,level,title,at")
      .eq("kind", "alert")
      .limit(25),
    // E12.1: rail live ticker = head of v_live_ops (24h union view, newest
    // first) — the §3 "live ticker" slot; ops:live Broadcast repaints it.
    supabase
      .from("v_live_ops")
      .select("source,source_id,ts,status,event,label,task_id")
      .order("ts", { ascending: false })
      .limit(25),
  ]);
  const paused = pauseRes.data?.value === true;

  const systemOk = !summaryRes.error;
  type RailViewRow = {
    id: string;
    action_type: string;
    operation: string | null;
    purpose: string | null;
    risk_class: string;
    created_at: string;
    money_out: boolean;
  };
  const railRows = (railRes.data ?? []) as unknown as RailViewRow[];
  const approvals: RailApproval[] = railRows.slice(0, 5).map((a) => ({
    id: a.id,
    title: a.purpose ?? a.operation ?? a.action_type,
    risk: a.risk_class,
    created_at: a.created_at,
    moneyOut: a.money_out,
  }));
  const oldestPendingAt = railRows[0]?.created_at ?? null;
  const moneyOutCount = railRows.filter((a) => a.money_out).length;
  const dockTasks: DockTask[] = (dockRes.data ?? []).map((task) => ({
    id: task.id,
    title: task.objective ?? task.id,
    status: task.status,
  }));
  // Alert titles are English machine records; the TR surface localizes the
  // finite generator vocabulary at the server boundary (RULE #0 purity).
  // C3+ rail leg (CEO 2026-07-19 morning): identical alert titles collapse
  // to ONE card carrying ×N — five copies of the same failure are noise.
  const alertGroups = new Map<string, RailAlert & { count: number }>();
  for (const a of (alertsRes.data ?? []) as RailAlert[]) {
    const title = localizeAlertTitle(a.title, locale);
    const seen = alertGroups.get(title);
    if (seen) seen.count += 1;
    else alertGroups.set(title, { ...a, title, count: 1 });
  }
  const railAlerts = [...alertGroups.values()].slice(0, 5);
  const alertCount = alertsRes.data?.length ?? 0;
  // C3+ rail leg: one ticker card per task (or per run when task-less) —
  // the newest event wins; lifecycle chains live on /live, not the rail.
  const tickerGroups = new Map<string, TickerRow>();
  for (const r of (tickerRes.data ?? []) as (TickerRow & { task_id: string | null })[]) {
    // Collapse by what the CEO READS: identical labels (even across sibling
    // tasks) and all label-less system runs each become ONE card — the rail
    // is a headline strip, the full story lives on /live.
    const key = r.label ?? "system-run";
    if (!tickerGroups.has(key)) tickerGroups.set(key, r);
  }
  const ticker = [...tickerGroups.values()].slice(0, 5);

  return (
    <div className="ambient-depth relative flex h-dvh flex-col bg-surface-void font-body text-body-md text-ink-primary">
      <SessionGuard labels={t.session} />
      <CommandBar
        labels={t.bar}
        palette={t.palette}
        systemOk={systemOk}
        activeTasks={summaryRes.data?.active_tasks ?? 0}
        pendingApprovals={summaryRes.data?.pending_approvals ?? 0}
        paused={paused}
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
        {/* pb-24 clears the floating Agent Dock (CC-SPEC §3) — content must
            scroll fully out from under it, never end hidden behind it. */}
        <main className="min-w-0 flex-1 overflow-y-auto p-6 pb-24">{children}</main>
        <IntelligenceRail
          labels={t.rail}
          locale={locale}
          approvals={approvals}
          pendingCount={summaryRes.data?.pending_approvals ?? 0}
          oldestPendingAt={oldestPendingAt}
          moneyOutCount={moneyOutCount}
          alerts={railAlerts}
          alertCount={alertCount}
          alertLevels={t.alerts.ui.levels}
          riskLevels={t.approvals.ui.riskLevels}
          ticker={ticker}
          statusLabels={dict.status}
        />
        <AgentDock label={t.dock.running} tasks={dockTasks} statusLabels={dict.status} />
      </div>
    </div>
  );
}
