import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// B51 move 3 (plan approved 2026-10-09: "kritik kararlar medium'dan xhigh'a, kod yazımı high'a çıkar; ucuz
// işler low'da kalır"). With P3 the task's class leads the route, so the effort on a class row is the effort
// the run gets. Talking seats (chat.*, voice.*) are P6's and are not moved here.

afterAll(async () => {
  await closeDb();
});

const effortOf = async (taskClass: string) =>
  (
    await sql<{ effort: string }>`
      SELECT effort FROM routing_rules WHERE task_class = ${taskClass} AND enabled AND department_id IS NULL
       ORDER BY priority DESC LIMIT 1
    `.execute(getDb())
  ).rows[0]?.effort;

describe("move 3 — effort by the kind of work", () => {
  it("critical decisions think at xhigh", async () => {
    for (const c of ["strategy", "architecture", "final-approval", "slot.critical_decision"]) {
      expect(await effortOf(c), c).toBe("xhigh");
    }
  });

  it("code is written at high", async () => {
    for (const c of ["code.standard", "code.bulk", "slot.coding"]) {
      expect(await effortOf(c), c).toBe("high");
    }
  });

  it("cheap, mechanical work stays at low", async () => {
    for (const c of ["summarize", "ingest", "memory.classify", "video.classify", "voice.classify", "slot.low_cost", "slot.fast_task"]) {
      expect(await effortOf(c), c).toBe("low");
    }
  });

  it("no department-less row is left at max — nothing in the plan runs there", async () => {
    const r = await sql<{ task_class: string }>`
      SELECT task_class FROM routing_rules
       WHERE enabled AND department_id IS NULL AND effort = 'max' AND task_class NOT LIKE 'chat.%'
    `.execute(getDb());
    expect(r.rows.map((x) => x.task_class)).toEqual([]);
  });
});
