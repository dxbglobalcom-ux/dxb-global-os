import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  activeDashboard,
  defaultLayout,
  LAYOUT_KEY,
  LAYOUT_SCOPE,
  LayoutSchema,
  reflow,
  WIDGET_META,
  WIDGET_TYPES,
} from "../../apps/dashboard/src/components/widgets/types.js";

// E12.2 — widget system verification. Row gate: layout saved through the
// control seam survives into a NEW session (settings_values row, not
// localStorage). State-independent on the live DB: the suite parks any
// pre-existing layout row and restores it afterAll.

const db = () => getDb();
const M = `e122t-${randomUUID().slice(0, 8)}`;
const suiteStart = new Date().toISOString();

async function ceoSet(
  value: unknown,
  key = `${M}-${randomUUID()}`,
  scope: string = LAYOUT_SCOPE,
): Promise<Record<string, unknown>> {
  return db()
    .transaction()
    .execute(async (trx) => {
      await sql`SELECT set_config('request.jwt.claims',
        '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`.execute(trx);
      const res = await sql<{ resp: Record<string, unknown> }>`
        SELECT control_settings_set(${LAYOUT_KEY}, ${scope},
          ${JSON.stringify(value)}::jsonb, ${key}, NULL, 'api',
          'e122 widget-layout test') AS resp
      `.execute(trx);
      return res.rows[0].resp;
    });
}

async function layoutRow(): Promise<unknown | null> {
  const res = await sql<{ value: unknown }>`
    SELECT value FROM settings_values
     WHERE key = ${LAYOUT_KEY} AND scope = ${LAYOUT_SCOPE}
  `.execute(db());
  return res.rows.length > 0 ? res.rows[0].value : null;
}

// Park whatever layout the CEO already saved; restore it at the end.
let parked: unknown | null = null;
let parkedMeasured = false;

async function parkOnce(): Promise<void> {
  if (parkedMeasured) return;
  parked = await layoutRow();
  parkedMeasured = true;
}

afterAll(async () => {
  if (parkedMeasured) {
    if (parked !== null) {
      await ceoSet(parked);
    } else {
      await sql`DELETE FROM settings_values
        WHERE key = ${LAYOUT_KEY} AND scope = ${LAYOUT_SCOPE}`.execute(db());
    }
  }
  await sql`DELETE FROM settings_change_log
    WHERE key = ${LAYOUT_KEY} AND changed_at >= ${suiteStart}::timestamptz`.execute(db());
  await sql`DELETE FROM control_idempotency WHERE key LIKE ${`${M}-%`}`.execute(db());
  await closeDb();
});

describe("E12.2 widget registry (CC-SPEC §11)", () => {
  it("(1) every widget type registers a source view + a drill door (no sourceless widgets)", () => {
    for (const type of WIDGET_TYPES) {
      const meta = WIDGET_META[type];
      expect(meta, type).toBeDefined();
      expect(meta.source.startsWith("v_"), `${type} source is a view`).toBe(true);
      expect(meta.drillHref.startsWith("/"), `${type} drillHref`).toBe(true);
    }
    // No orphan meta either — the two tables are the same set.
    expect(Object.keys(WIDGET_META).sort()).toEqual([...WIDGET_TYPES].sort());
  });

  it("(2) default layout validates against the spec §10 schema; reflow stays in 4-col bounds", () => {
    const layout = defaultLayout();
    expect(LayoutSchema.safeParse(layout).success).toBe(true);
    const dash = activeDashboard(layout);
    for (const w of dash.widgets) {
      expect(w.x + w.w, `${w.type} row fits`).toBeLessThanOrEqual(4);
    }
    // reflow is deterministic: same input → same placement.
    expect(reflow(dash.widgets)).toEqual(reflow(dash.widgets));
  });

  it("(3) schema rejects an unknown widget type and out-of-grid spans", () => {
    const bad = defaultLayout() as unknown as {
      dashboards: { widgets: { type: string; w: number }[] }[];
    };
    bad.dashboards[0].widgets[0].type = "not_a_widget";
    expect(LayoutSchema.safeParse(bad).success).toBe(false);
    const wide = defaultLayout() as unknown as {
      dashboards: { widgets: { w: number }[] }[];
    };
    wide.dashboards[0].widgets[0].w = 3;
    expect(LayoutSchema.safeParse(wide).success).toBe(false);
  });
});

describe("E12.2 layout persistence (row gate: save → new session → same layout)", () => {
  it("(4) scoped-write law: bare 'ceo_dashboard' scope is refused — the id segment is mandatory (recorded adaptation)", async () => {
    await parkOnce();
    const resp = await ceoSet(defaultLayout(), `${M}-${randomUUID()}`, "ceo_dashboard");
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("VALIDATION_FAILED");
  });

  it("(5) control seam round-trip: set → settings_values row IS the layout; undo restores prior state", async () => {
    await parkOnce();
    const before = await layoutRow();

    const layout = defaultLayout();
    // Mutate: drop the last widget + move health to the end (a real edit).
    const dash = layout.dashboards[0];
    dash.widgets = reflow([...dash.widgets.slice(1, -1), dash.widgets[0]]);

    const resp = await ceoSet(layout);
    expect(resp.ok).toBe(true);
    expect(resp.change_id).toBeDefined();

    // A NEW reader (fresh query = fresh session's read path) sees the layout.
    const stored = await layoutRow();
    expect(stored).toEqual(layout);
    const parsed = LayoutSchema.parse(stored);
    expect(activeDashboard(parsed).widgets.map((w) => w.type)).toEqual(
      dash.widgets.map((w) => w.type),
    );

    // Undo: the change_log row carries the restore path.
    const undo = await db()
      .transaction()
      .execute(async (trx) => {
        await sql`SELECT set_config('request.jwt.claims',
          '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`.execute(trx);
        const res = await sql<{ resp: Record<string, unknown> }>`
          SELECT control_settings_undo(${Number(resp.change_id)}, ${`${M}-${randomUUID()}`}) AS resp
        `.execute(trx);
        return res.rows[0].resp;
      });
    expect(undo.ok).toBe(true);
    expect(await layoutRow()).toEqual(before);
  });

  it("(6) idempotency: same key + same body replays the cached response, no second write", async () => {
    await parkOnce();
    const layout = defaultLayout();
    // Unique per run: writing a value IDENTICAL to the stored row is a
    // no-op (no change row, by design) — measured against the live layout
    // the CEO/browser may have saved. The suffix guarantees a real change.
    layout.dashboards[0].name = `Executive ${M}`;
    const key = `${M}-${randomUUID()}`;
    const first = await ceoSet(layout, key);
    expect(first.ok).toBe(true);
    const replay = await ceoSet(layout, key);
    expect(replay).toEqual(first);
    const changes = await sql<{ n: string }>`
      SELECT count(*)::text AS n FROM settings_change_log
       WHERE key = ${LAYOUT_KEY} AND id = ${Number(first.change_id)}
    `.execute(db());
    expect(Number(changes.rows[0].n)).toBe(1);
  });
});
