import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { TaskEnvelope } from "../../packages/shared/src/envelope.js";
import { ClassifiedIntent, loadPolicy, workClasses } from "../../packages/kernel/src/index.js";
import { classifyPrompt } from "../../packages/kernel/src/classify.js";
import { draftBatchFor, draftPrompt } from "../../packages/orchestrator/src/decompose.js";
import { sdkJsonSchema } from "../../packages/shared/src/index.js";
import { watchLedgers } from "../helpers/suite-scope.js";
import {
  decompose,
  dispatch,
  gateNeededFor,
  type DecomposedEnvelope,
} from "../../packages/orchestrator/src/index.js";

// B51 step 2 (CEO 2026-10-09: "düzeltmeyi ve gereken neyse onu yap"). The critical gate (§4e) is
// switched by routing_rules.needs_council for the task's CLASS — strategy, architecture,
// final-approval, content.outbound. Measured that day: decompose knew the class, but the task row
// kept only its tier, and the worker read needs_council off whichever row won the TIER — on the
// company the slot.* rows (priority 100, needs_council false). The gate could not fire on any task.
// Now the class rides the task from decompose to the worker, and the switch is read by class.

const ledgerScope = watchLedgers(() => getDb());
const createdTaskIds: string[] = [];

afterAll(async () => {
  await ledgerScope.sweep({ decisions: [{ decidedBy: "orchestrator:dispatch", decision: "task_plan" }] });
  if (createdTaskIds.length > 0) {
    await getDb().deleteFrom("task_events").where("task_id", "in", createdTaskIds).execute();
    await getDb().deleteFrom("tasks").where("id", "in", createdTaskIds).execute();
  }
  await closeDb();
});

/** The live switch for a class, read from the table — the test owns the wiring, not the CEO's data. */
async function switchOf(taskClass: string): Promise<boolean> {
  const row = await getDb()
    .selectFrom("routing_rules")
    .select(sql<boolean | null>`bool_or(needs_council)`.as("on"))
    .where("enabled", "=", true)
    .where("task_class", "=", taskClass)
    .executeTakeFirst();
  return row?.on === true;
}

function envelope(over: Partial<DecomposedEnvelope> = {}): DecomposedEnvelope {
  return {
    ...TaskEnvelope.parse({
      department: "engineering",
      objective: "b51 gate-switch probe — never executed",
      output_contract: "nothing; the row is read and swept",
      model_tier: "L1",
      approval_class: "internal",
    }),
    deps: [],
    ...over,
  };
}

describe("B51 — the class rides the task to the critical gate", () => {
  it("the construction engine holds the four gated classes this file relies on", async () => {
    for (const c of ["strategy", "architecture", "final-approval", "content.outbound"]) {
      expect(await switchOf(c), c).toBe(true);
    }
    expect(await switchOf("chat.answer")).toBe(false);
  });

  it("decompose (single) writes the classified class onto the envelope", async () => {
    const ci = ClassifiedIntent.parse({
      intent_summary: "set next quarter's direction for the holding",
      task_class: "strategy",
      departments: ["engineering"],
      approval_class: "internal",
      complexity: "single",
    });
    const [env] = await decompose(ci);
    expect(env.task_class).toBe("strategy");
  });

  it("dispatch stores the class on the task row, and NULL when the envelope carries none", async () => {
    const { taskIds } = await dispatch([envelope({ task_class: "strategy" }), envelope()]);
    createdTaskIds.push(...taskIds);
    const rows = await getDb()
      .selectFrom("tasks")
      .select(["id", "task_class"])
      .where("id", "in", taskIds)
      .execute();
    const byId = new Map(rows.map((r) => [r.id, r.task_class]));
    expect(byId.get(taskIds[0])).toBe("strategy");
    expect(byId.get(taskIds[1])).toBeNull();
  });

  it("the worker's switch reads the class: a gated class opens it, others and no class do not", async () => {
    expect(await gateNeededFor({ task_class: "strategy" })).toBe(true);
    expect(await gateNeededFor({ task_class: "content.outbound" })).toBe(true);
    expect(await gateNeededFor({ task_class: "chat.answer" })).toBe(false);
    expect(await gateNeededFor({ task_class: "no-such-class" })).toBe(false);
    expect(await gateNeededFor({ task_class: null })).toBe(false);
    expect(await gateNeededFor({})).toBe(false);
  });

  it("an L1 task of a gated class opens the gate although the tier's winning row (slot.*) does not", async () => {
    const tierWinner = await getDb()
      .selectFrom("routing_rules")
      .select(["task_class", "needs_council"])
      .where("enabled", "=", true)
      .where("model_tier", "=", "L1")
      .where("department_id", "is", null)
      .orderBy("priority", "desc")
      .orderBy("updated_at", "desc")
      .executeTakeFirstOrThrow();
    expect(tierWinner.needs_council).toBe(false); // the defect's precondition, measured
    expect(await gateNeededFor({ task_class: "strategy" })).toBe(true);
  });
});

describe("B51 — the classes offered to the classifier and the decomposer are work classes, not seats", () => {
  it("workClasses() leaves out every slot row (role_slot set) and keeps the gated classes", async () => {
    const rules = await loadPolicy(getDb());
    expect(rules.some((r) => r.role_slot !== null)).toBe(true); // the bench holds seats to leave out
    const offered = workClasses(rules);
    expect(offered.filter((c) => c.startsWith("slot."))).toEqual([]);
    for (const c of ["strategy", "architecture", "final-approval", "content.outbound", "code.standard"]) {
      expect(offered, c).toContain(c);
    }
    expect(offered).toEqual([...new Set(offered)].sort());
  });

  it("the classify prompt and the decompose draft prompt list only those classes", async () => {
    const rules = await loadPolicy(getDb());
    const offered = workClasses(rules);
    const ci = ClassifiedIntent.parse({
      intent_summary: "probe", task_class: "strategy", departments: ["strategy"], approval_class: "none", complexity: "multi",
    });
    expect(classifyPrompt("probe", offered, ["strategy"])).not.toMatch(/slot\./);
    expect(draftPrompt(ci, offered, ["strategy"])).not.toMatch(/slot\./);
  });
});

describe("B51 — the decomposer's own schema holds the work classes too (Sol, step 2, B)", () => {
  const env = (task_class: string) => ({
    department: "strategy",
    objective: "compare the two revenue lines on demand, moat and time to first revenue",
    output_contract: "a one-page comparison",
    task_class,
    approval_class: "internal",
    deps: [],
  });

  it("a draft naming a seat class is refused by the schema the model is handed and by the parse", async () => {
    const offered = workClasses(await loadPolicy(getDb()));
    const batch = draftBatchFor(offered);
    expect(batch.safeParse({ envelopes: [env("strategy"), env("architecture")] }).success).toBe(true);
    expect(batch.safeParse({ envelopes: [env("strategy"), env("slot.planning")] }).success).toBe(false);
    expect(batch.safeParse({ envelopes: [env("strategy"), env("no-such-class")] }).success).toBe(false);
    expect(JSON.stringify(sdkJsonSchema(batch))).not.toMatch(/slot\./);
    expect(JSON.stringify(sdkJsonSchema(batch))).toContain('"strategy"');
  });
});
