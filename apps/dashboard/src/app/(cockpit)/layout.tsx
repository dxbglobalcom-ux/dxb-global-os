import { AppShell } from "@/components/shell/app-shell";
import { HorizonLine } from "@/components/shell/horizon-line";
import { CommandBar } from "@/components/command-bar";
import { IntentStrip } from "@/components/intent-strip";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { periodTotal, postgrestCostSource } from "@/lib/costs";
import { fetchRecentIntents } from "@/lib/intents";

// Cockpit chrome: AppShell + Horizon Line with server-computed initial pulse
// (active tasks · pending approvals · today's cost). The live layer on the
// client moves these by Broadcast deltas — no polling anywhere. Today's cost
// comes from the SAME aggregate module as the costs page (COST-04 single
// source, equality-tested).
export default async function CockpitLayout({ children }: { children: React.ReactNode }) {
  const dict = getDict();
  const supabase = await createClient();

  const [activeRes, pendingRes, todayCost, recentIntents] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("status", ["queued", "claimed", "running"]),
    supabase.from("approvals").select("id", { count: "exact", head: true }).eq("status", "pending"),
    periodTotal(postgrestCostSource(supabase), "today", new Date()),
    fetchRecentIntents(supabase, 5),
  ]);

  // TR/EN rotating placeholders (UI-SPEC §4) — both catalogs interleaved.
  const en = getDict("en").commandBar.placeholders;
  const tr = getDict("tr").commandBar.placeholders;
  const placeholders = en.flatMap((p, i) => (tr[i] ? [p, tr[i]] : [p]));

  return (
    <AppShell
      brand={dict.brand.name}
      labels={dict.nav}
      command={
        <CommandBar
          text={dict.commandBar}
          placeholders={placeholders}
          recent={recentIntents.map(({ id, text }) => ({ id, text }))}
        />
      }
      horizon={
        <>
          <HorizonLine
            labels={dict.horizon}
            initialActiveTasks={activeRes.count ?? 0}
            initialPendingApprovals={pendingRes.count ?? 0}
            initialTodayCostEur={todayCost}
          />
          <IntentStrip intents={recentIntents} statusLabels={dict.intent} />
        </>
      }
    >
      {children}
    </AppShell>
  );
}
