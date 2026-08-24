import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  ClassifiedIntent,
  classify,
  loadPolicy,
  route,
  NoRouteError,
  type RoutingRule,
} from "../../packages/kernel/src/index.js";

// Master-plan step 3 verification (05-03 Task 3). Two groups:
//   (a) KERN-01 — 5 sample intents through the live Agent SDK (subscription).
//       Opt-in with DXB_LIVE_SDK=1: no live Claude session → skipped, but the
//       plan requires at least one recorded live run (pasted in 05-03-SUMMARY).
//   (b) KERN-02 — routing-as-data proof. Pure DB, never skipped.
// Runs against the local Supabase stack; cleans its own mutations (afterAll
// restores the exact original row) so the full suite stays pollution-free.

const LIVE = process.env.DXB_LIVE_SDK === "1";

// Fixed intent for group (b): routing must depend on table rows ONLY, so the
// classified object is a constant — any model change below is pure data.
//
// U21 (2026-07-26): this group used to assert against the LIVE 'code.standard'
// rows (two of them, the priority-10 one being codex-5.5 at tier L3). The
// quality tier law collapsed that class to a single L1 Opus 5 row and banned
// codex-5.5, so those literals stopped describing anything real. What KERN-02
// actually owns is the MECHANISM — priority ordering, enabled=false exclusion,
// and "UPDATE a row, the resolution changes with zero code edits". The probe
// therefore brings its own two rows on a task_class no production path uses,
// which keeps the proof valid across every future CEO routing decision.
const PROBE_CLASS = "test.kern02.probe";

const FIXED_CI = ClassifiedIntent.parse({
  intent_summary: "fix the failing unit test in the shared package",
  task_class: PROBE_CLASS,
  departments: ["engineering"],
  approval_class: "none",
  complexity: "single",
});

// The high-priority probe row: the one every assertion below moves.
let original: { id: string; model: string; enabled: boolean; updated_at: Date };

async function resolveFixed() {
  return route(FIXED_CI, await loadPolicy(getDb()));
}

async function insertProbe(model: string, tier: string, priority: number) {
  await sql`
    INSERT INTO routing_rules (task_class, match, model_tier, model, mode, effort,
      needs_council, priority, enabled)
    VALUES (${PROBE_CLASS}, '{}'::jsonb, ${tier}, ${model}, 'subscription',
            'medium', false, ${priority}, true)
  `.execute(getDb());
}

beforeAll(async () => {
  // Leftovers from an aborted earlier run would poison the ordering proof.
  await sql`DELETE FROM routing_rules WHERE task_class = ${PROBE_CLASS}`.execute(getDb());
  await insertProbe("probe-high", "L1", 10);
  await insertProbe("probe-low", "L3", 5);
  original = await getDb()
    .selectFrom("routing_rules")
    .select(["id", "model", "enabled", "updated_at"])
    .where("task_class", "=", PROBE_CLASS)
    .where("priority", "=", 10)
    .executeTakeFirstOrThrow();
});

afterAll(async () => {
  await sql`DELETE FROM routing_rules WHERE task_class = ${PROBE_CLASS}`.execute(getDb());
  await closeDb();
});

describe("KERN-02 — routing is data (routing_rules), never code", () => {
  it("priority ordering: higher-priority row wins when two rows share a task_class", async () => {
    const rules = await loadPolicy(getDb());
    const shared = rules.filter((r) => r.task_class === PROBE_CLASS);
    expect(shared.length).toBe(2);
    expect(route(FIXED_CI, rules).model).toBe("probe-high"); // the priority-10 row
    expect(route(FIXED_CI, rules).model_tier).toBe("L1");
  });

  it("enabled=false rows are never returned", async () => {
    await getDb()
      .updateTable("routing_rules")
      .set({ enabled: false, updated_at: sql`now()` })
      .where("id", "=", original.id)
      .execute();
    expect((await resolveFixed()).model).toBe("probe-low"); // priority-5 row takes over

    await getDb()
      .updateTable("routing_rules")
      .set({ enabled: true, updated_at: sql`now()` })
      .where("id", "=", original.id)
      .execute();
    expect((await resolveFixed()).model).toBe("probe-high");
  });

  it("KERN-02 proof: UPDATE one row → same intent resolves a different model, zero code changes", async () => {
    const before = await resolveFixed();
    expect(before.model).toBe("probe-high");

    await getDb()
      .updateTable("routing_rules")
      .set({ model: "probe-rerouted", updated_at: sql`now()` })
      .where("id", "=", original.id)
      .execute();

    const after = await resolveFixed();
    // eslint-disable-next-line no-console
    console.log(`KERN-02 UPDATE proof: before=${before.model} after=${after.model} (row ${original.id})`);
    expect(after.model).toBe("probe-rerouted");
    expect(after.model).not.toBe(before.model);
    // probe rows are deleted in afterAll — pnpm test stays pollution-free
  });

  it("no match → typed NoRouteError, never a silent default model", async () => {
    const rules = await loadPolicy(getDb());
    expect(() => route({ ...FIXED_CI, task_class: "no.such.class" }, rules)).toThrowError(NoRouteError);
  });

  it("match jsonb semantics: dept/keyword match, unknown keys fail closed", () => {
    const mk = (match: unknown, model: string) =>
      ({
        id: "00000000-0000-0000-0000-000000000001",
        task_class: PROBE_CLASS,
        match,
        model_tier: "L3",
        model,
        mode: "subscription",
        effort: "medium",
        needs_council: false,
        priority: 0,
        enabled: true,
        updated_at: new Date(),
      }) as RoutingRule;
    expect(route(FIXED_CI, [mk({ dept: "engineering" }, "m1")]).model).toBe("m1");
    expect(() => route(FIXED_CI, [mk({ dept: "sales" }, "m1")])).toThrowError(NoRouteError);
    expect(route(FIXED_CI, [mk({ keyword: "UNIT TEST" }, "m2")]).model).toBe("m2");
    expect(() => route(FIXED_CI, [mk({ future_field: 1 }, "m3")])).toThrowError(NoRouteError);
  });
});

describe.skipIf(!LIVE)("KERN-01 — 5 sample intents classify to expected class/departments (live Agent SDK)", () => {
  const LIVE_TIMEOUT = 300_000;

  it(
    "1: product listing draft → product department",
    async () => {
      const ci = await classify(
        "Prepare a product listing draft for a single brand: title, attributes, specifications and catalog data for our outlet store",
      );
      // eslint-disable-next-line no-console
      console.log("intent#1", JSON.stringify(ci));
      expect(ci.departments).toContain("product");
    },
    LIVE_TIMEOUT,
  );

  it(
    "2: code fix → engineering / code.standard",
    async () => {
      const ci = await classify("Fix the failing unit test in our shared TypeScript package");
      // eslint-disable-next-line no-console
      console.log("intent#2", JSON.stringify(ci));
      expect(ci.task_class).toBe("code.standard");
      expect(ci.departments).toContain("engineering");
    },
    LIVE_TIMEOUT,
  );

  it(
    "3: strategy question → strategy class, routed L1",
    async () => {
      const ci = await classify(
        "Should we enter the Polish outlet market next quarter? Give a strategic recommendation",
      );
      // eslint-disable-next-line no-console
      console.log("intent#3", JSON.stringify(ci));
      expect(ci.task_class).toBe("strategy");
      const resolved = route(ci, await loadPolicy(getDb()));
      expect(resolved.model_tier).toBe("L1");
    },
    LIVE_TIMEOUT,
  );

  it(
    "4: summarize request → summarize class",
    async () => {
      const ci = await classify("Summarize the Q2 cost ledger report into five bullet points");
      // eslint-disable-next-line no-console
      console.log("intent#4", JSON.stringify(ci));
      expect(ci.task_class).toBe("summarize");
    },
    LIVE_TIMEOUT,
  );

  it(
    "5: multi-step campaign → complexity 'multi'",
    async () => {
      const ci = await classify(
        "Plan and launch a multi-channel marketing campaign for the summer sale across email and paid ads",
      );
      // eslint-disable-next-line no-console
      console.log("intent#5", JSON.stringify(ci));
      expect(ci.complexity).toBe("multi");
    },
    LIVE_TIMEOUT,
  );
});
