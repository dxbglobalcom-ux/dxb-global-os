import { Panel } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";
import {
  renderWidget,
  type ExecOverview,
} from "@/components/widgets/registry";
import { WidgetGrid } from "@/components/widgets/widget-grid";
import {
  activeDashboard,
  defaultLayout,
  LAYOUT_KEY,
  LAYOUT_SCOPE,
  LayoutSchema,
  WIDGET_TYPES,
  type Layout,
  type WidgetType,
} from "@/components/widgets/types";

// Executive Overview v3 (E12.2 widget system over the E3.2/C-Hibrit v2
// composition). Data stays a single round-trip on v_exec_overview; the
// composition is now DATA — settings_values(scope='ceo_dashboard') via the
// WidgetRegistry (CC-SPEC R8/§10/§11). Absent/corrupt layout row falls back
// to the default layout (yesterday's composition, verbatim). The critical
// system banner is SHELL state, not a widget — it can never be removed.

export const metadata = { title: "Executive Overview — DXB" };

export default async function OverviewPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  // Widget renderers take the FLAT string family; the nested `widgets`
  // strings belong to the grid island.
  const { widgets: tw, ...t } = dict.command.overview;
  const supabase = await createClient();

  const [{ data, error }, layoutRow] = await Promise.all([
    supabase.from("v_exec_overview").select("*").single<ExecOverview>(),
    supabase
      .from("settings_values")
      .select("value")
      .eq("scope", LAYOUT_SCOPE)
      .eq("key", LAYOUT_KEY)
      .maybeSingle<{ value: unknown }>(),
  ]);

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={t.title} state="error">
          <p className="text-body-s text-status-danger">
            v_exec_overview: {error?.message ?? "no row"}
          </p>
        </Panel>
      </div>
    );
  }

  // Stored layout governs when valid; anything else = honest default (a
  // corrupt row must degrade, never crash the cockpit — CC-SPEC §17).
  let layout: Layout = defaultLayout();
  if (layoutRow.data?.value) {
    const parsed = LayoutSchema.safeParse(layoutRow.data.value);
    if (parsed.success) layout = parsed.data;
    else console.warn("[overview] stored layout invalid — default used:", parsed.error.issues[0]);
  }
  const dash = activeDashboard(layout);
  const orderedLayout: Layout = {
    dashboards: layout.dashboards.map((d) => (d.id === dash.id ? dash : d)),
  };

  // Server-render EVERY registered widget once (same single data row); the
  // island shows only layout members and can un-hide additions instantly.
  const content = Object.fromEntries(
    WIDGET_TYPES.map((type) => [type, renderWidget(type, { data, t })]),
  ) as Record<WidgetType, React.ReactNode>;

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-h1 text-ink-primary">{t.title}</h1>
        {data.last_activity_at && (
          <span className="font-data text-caption text-ink-muted tabular-nums">
            {t.lastActivity}:{" "}
            {new Date(data.last_activity_at).toLocaleString(
              locale === "tr" ? "tr-TR" : "en-GB",
              { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" },
            )}
          </span>
        )}
      </div>

      {(data.hard_stopped || data.breaker_tripped) && (
        <Panel state="critical">
          <p className="text-body-md text-status-critical">
            {data.hard_stopped ? t.hardStopped : t.breakerTripped}
          </p>
        </Panel>
      )}

      <WidgetGrid
        initial={orderedLayout}
        content={content}
        strings={{
          edit: tw.edit,
          save: tw.save,
          cancel: tw.cancel,
          add: tw.add,
          remove: tw.remove,
          moveLeft: tw.moveLeft,
          moveRight: tw.moveRight,
          width: tw.width,
          saveFailed: tw.saveFailed,
          empty: tw.empty,
          labels: tw.labels,
        }}
      />
    </div>
  );
}
