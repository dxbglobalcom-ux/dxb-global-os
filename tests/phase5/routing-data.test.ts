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
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const LIVE = process.env.DXB_LIVE_SDK === "1";

// Fixed intent for group (b): routing must depend on table rows ONLY, so the
// classified object is a constant — any model change below is pure data.
const FIXED_CI = ClassifiedIntent.parse({
  intent_summary: "fix the failing unit test in the shared package",
  task_class: "code.standard",
  departments: ["engineering"],
  approval_class: "none",
  complexity: "single",
});

let original: { id: string; model: string; enabled: boolean; updated_at: Date };

async function resolveFixed() {
  return route(FIXED_CI, await loadPolicy(getDb()));
}

beforeAll(async () => {
  // Capture the highest-priority enabled code.standard row byte-exact for restore.
  original = await getDb()
    .selectFrom("routing_rules")
    .select(["id", "model", "enabled", "updated_at"])
    .where("task_class", "=", "code.standard")
    .where("enabled", "=", true)
    .orderBy("priority", "desc")
    .limit(1)
    .executeTakeFirstOrThrow();
});

afterAll(async () => {
  await getDb()
    .updateTable("routing_rules")
    .set({ model: original.model, enabled: original.enabled, updated_at: original.updated_at })
    .where("id", "=", original.id)
    .execute();
  await closeDb();
});

describe("KERN-02 — routing is data (routing_rules), never code", () => {
  it("priority ordering: higher-priority row wins when two rows share a task_class", async () => {
    const rules = await loadPolicy(getDb());
    const shared = rules.filter((r) => r.task_class === "code.standard");
    expect(shared.length).toBeGreaterThanOrEqual(2); // seed: priority 10 + 5
    expect(route(FIXED_CI, rules).model).toBe("codex-5.5"); // the priority-10 row
    expect(route(FIXED_CI, rules).model_tier).toBe("L3");
  });

  it("enabled=false rows are never returned", async () => {
    await getDb()
      .updateTable("routing_rules")
      .set({ enabled: false, updated_at: sql`now()` })
      .where("id", "=", original.id)
      .execute();
    expect((await resolveFixed()).model).toBe("sonnet-5"); // priority-5 row takes over

    await getDb()
      .updateTable("routing_rules")
      .set({ enabled: true, updated_at: sql`now()` })
      .where("id", "=", original.id)
      .execute();
    expect((await resolveFixed()).model).toBe("codex-5.5");
  });

  it("KERN-02 proof: UPDATE one row → same intent resolves a different model, zero code changes", async () => {
    const before = await resolveFixed();
    expect(before.model).toBe("codex-5.5");

    await getDb()
      .updateTable("routing_rules")
      .set({ model: "sonnet-5", updated_at: sql`now()` })
      .where("id", "=", original.id)
      .execute();

    const after = await resolveFixed();
    // eslint-disable-next-line no-console
    console.log(`KERN-02 UPDATE proof: before=${before.model} after=${after.model} (row ${original.id})`);
    expect(after.model).toBe("sonnet-5");
    expect(after.model).not.toBe(before.model);
    // original value restored in afterAll — pnpm test stays pollution-free
  });

  it("no match → typed NoRouteError, never a silent default model", async () => {
    const rules = await loadPolicy(getDb());
    expect(() => route({ ...FIXED_CI, task_class: "no.such.class" }, rules)).toThrowError(NoRouteError);
  });

  it("match jsonb semantics: dept/keyword match, unknown keys fail closed", () => {
    const mk = (match: unknown, model: string) =>
      ({
        id: "00000000-0000-0000-0000-000000000001",
        task_class: "code.standard",
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
