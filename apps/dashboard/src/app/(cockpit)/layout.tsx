import { AppShell } from "@/components/shell/app-shell";
import { HorizonLine } from "@/components/shell/horizon-line";
import { getDict } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

// Cockpit chrome: AppShell + Horizon Line with server-computed initial pulse
// (active tasks · pending approvals · today's cost). The live layer on the
// client moves these by Broadcast deltas — no polling anywhere.
export default async function CockpitLayout({ children }: { children: React.ReactNode }) {
  const dict = getDict();
  const supabase = await createClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [activeRes, pendingRes, costRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("status", ["queued", "claimed", "running"]),
    supabase.from("approvals").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("cost_ledger").select("cost_eur.sum()").gte("created_at", startOfDay.toISOString()),
  ]);

  const todayCost = Number(
    ((costRes.data as Array<{ sum: number | string | null }> | null)?.[0]?.sum ?? 0) || 0,
  );

  return (
    <AppShell
      brand={dict.brand.name}
      labels={dict.nav}
      horizon={
        <HorizonLine
          labels={dict.horizon}
          initialActiveTasks={activeRes.count ?? 0}
          initialPendingApprovals={pendingRes.count ?? 0}
          initialTodayCostEur={todayCost}
        />
      }
    >
      {children}
    </AppShell>
  );
}
