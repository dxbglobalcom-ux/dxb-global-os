import { z } from "zod";

// E12.2 — widget system data layer (CC-SPEC R8/§10/§11).
// The layout JSON schema is the spec §10 shape VERBATIM:
//   {dashboards:[{id,name,default,widgets:[{type,x,y,w,h,filters}]}]}
// stored in settings_values(scope='ceo_dashboard', key='layout') — never
// localStorage (R8: multi-screen + TV pull the same layout).
//
// Registry source rule (§11): every widget type binds to a real view —
// a sourceless type cannot register. v1 catalog = the nine real-sourced
// blocks of Executive Overview; every one reads `v_exec_overview`
// (single round-trip preserved) and carries a mandatory drill door
// (madde 2B: a summary without a target may not render).

// Scope CLASS per CC-SPEC §10 = 'ceo_dashboard'; the settings engine's
// scoped-write law (E6.1) appends an id segment → stored scope string is
// 'ceo_dashboard:default' (recorded adaptation, migration 20260718010000).
export const LAYOUT_SCOPE = "ceo_dashboard:default";
export const LAYOUT_KEY = "dashboard.layout";

export const WIDGET_TYPES = [
  "health",
  "stat_active_tasks",
  "stat_pending_approvals",
  "stat_cost_today",
  "stat_tokens_7d",
  "pulse",
  "agents",
  "budget",
  "attention",
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

export interface WidgetMeta {
  /** Source view (§11 registry rule — no source, no registration). */
  source: string;
  /** Primary drill target (madde 2B). Widgets with per-row drills keep
   *  their inner links; this is the frame-level door. */
  drillHref: string;
  /** Default grid spans (4-col grid; w ∈ 1|2|4, h ∈ 1|2). */
  w: 1 | 2 | 4;
  h: 1 | 2;
}

export const WIDGET_META: Record<WidgetType, WidgetMeta> = {
  health: { source: "v_exec_overview", drillHref: "/ops/tasks", w: 2, h: 1 },
  stat_active_tasks: {
    source: "v_exec_overview",
    drillHref: "/ops/tasks?state=active",
    w: 1,
    h: 1,
  },
  stat_pending_approvals: {
    source: "v_exec_overview",
    drillHref: "/approvals?state=pending",
    w: 1,
    h: 1,
  },
  stat_cost_today: {
    source: "v_exec_overview",
    drillHref: "/fin/costs?range=today",
    w: 1,
    h: 1,
  },
  stat_tokens_7d: {
    source: "v_exec_overview",
    drillHref: "/fin/tokens?range=week",
    w: 1,
    h: 1,
  },
  pulse: { source: "v_exec_overview", drillHref: "/ops/tasks", w: 1, h: 1 },
  agents: {
    source: "v_exec_overview",
    drillHref: "/org/employees?status=active",
    w: 1,
    h: 1,
  },
  budget: { source: "v_exec_overview", drillHref: "/fin/budgets", w: 1, h: 1 },
  attention: {
    source: "v_exec_overview",
    drillHref: "/approvals?state=pending",
    w: 1,
    h: 1,
  },
};

export const WidgetInstanceSchema = z.object({
  type: z.enum(WIDGET_TYPES),
  x: z.number().int().min(0).max(3),
  y: z.number().int().min(0).max(99),
  w: z.union([z.literal(1), z.literal(2), z.literal(4)]),
  h: z.union([z.literal(1), z.literal(2)]),
  filters: z.record(z.string(), z.unknown()),
});

export const DashboardSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  default: z.boolean(),
  widgets: z.array(WidgetInstanceSchema).max(40),
});

export const LayoutSchema = z.object({
  dashboards: z.array(DashboardSchema).min(1).max(8),
});

export type WidgetInstance = z.infer<typeof WidgetInstanceSchema>;
export type DashboardLayout = z.infer<typeof DashboardSchema>;
export type Layout = z.infer<typeof LayoutSchema>;

/** Deterministic flow placement: widgets keep ARRAY ORDER as truth; x/y are
 *  recomputed from the order + spans on a 4-column flow so external readers
 *  (TV mode, future multi-screen) see concrete grid coordinates. */
export function reflow(widgets: WidgetInstance[]): WidgetInstance[] {
  let x = 0;
  let y = 0;
  return widgets.map((wgt) => {
    const w = wgt.w;
    if (x + w > 4) {
      x = 0;
      y += 1;
    }
    const placed = { ...wgt, x, y };
    x += w;
    if (x >= 4) {
      x = 0;
      y += 1;
    }
    return placed;
  });
}

/** Default layout = today's Executive Overview composition, as data. */
export function defaultLayout(): Layout {
  const order: WidgetType[] = [
    "health",
    "stat_active_tasks",
    "stat_pending_approvals",
    "stat_cost_today",
    "stat_tokens_7d",
    "pulse",
    "agents",
    "budget",
    "attention",
  ];
  return {
    dashboards: [
      {
        id: "default",
        name: "Executive",
        default: true,
        widgets: reflow(
          order.map((type) => ({
            type,
            x: 0,
            y: 0,
            w: WIDGET_META[type].w,
            h: WIDGET_META[type].h,
            filters: {},
          })),
        ),
      },
    ],
  };
}

/** Read helper: pick the default dashboard (or first) and order its
 *  widgets by stored grid position so externally-written layouts render
 *  deterministically. */
export function activeDashboard(layout: Layout): DashboardLayout {
  const dash = layout.dashboards.find((d) => d.default) ?? layout.dashboards[0];
  return {
    ...dash,
    widgets: [...dash.widgets].sort((a, b) => a.y - b.y || a.x - b.x),
  };
}
