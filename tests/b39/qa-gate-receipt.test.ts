// B39 — THE QA JUDGE'S RECEIPT (CEO 2026-09-13, "düzelt").
//
// MEASURED IN THE COMPANY'S OWN BOOK, 2026-09-13 (SELECT only): the night of
// 2026-09-05 holds 23 cost_ledger rows, every one of them source='worker' — the
// seats' own runs. The QA gate judged all eight tasks of DXB-V-EYW-005 (a model
// call each, routing row 'final-approval': Opus 5 at effort max, 29 s on the
// critical path twice) and wrote NOTHING: no cost row, no log line, no figure in
// the task's own events. A brake that reads cost_ledger could not see a fifth of
// the hour's spend, and nobody could measure the gate without the scheduler log.
//
// What this file pins:
//   1. a judge's receipt is a cost_ledger row: source='qa', mode='subscription',
//      meta carries the gate, its effort and its milliseconds
//   2. the hourly window counts the judge's tokens as the company's own spend
//   3. qa() writes the judge's milliseconds and attempts into the task's own
//      transition event, whoever the evaluator is
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import {
  checkSubscriptionWindow,
  QA_SPEND_SOURCE,
  recordSubscriptionSpend,
  SUBSCRIPTION_CAP_KEY,
} from "../../packages/orchestrator/src/subscription-cap.js";
import { qa } from "../../packages/orchestrator/src/qa.js";
import { pinHookOff, sweepByDepartment } from "../helpers/suite-scope.js";

const db = () => getDb();
const M = `b39q-${randomUUID().slice(0, 6)}`;
pinHookOff(db);

async function makeTask(department: string, status: string): Promise<string> {
  const row = await db()
    .insertInto("tasks")
    .values({
      department,
      objective: `${M} qa receipt probe`,
      output_contract: "one line of probe text",
      model_tier: "L4",
      approval_class: "none",
      budget_max_tokens: 1000,
      priority: 5,
      status,
      result: JSON.stringify({ text: "probe deliverable" }),
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

afterAll(async () => {
  await sql`DELETE FROM cost_ledger WHERE department LIKE ${`${M}%`}`.execute(db());
  await sweepByDepartment(db(), M);
  await closeDb();
});

describe("B39 · the QA judge pays into the same book as the seats", () => {
  it("a judge's receipt is a 'qa' row the window counts", async () => {
    const department = `${M}-receipt`;
    const taskId = await makeTask(department, "done");
    const before = await checkSubscriptionWindow();

    await recordSubscriptionSpend({
      taskId,
      agentId: null,
      department,
      model: "opus-5",
      tokensIn: 1200,
      tokensOut: 300,
      source: QA_SPEND_SOURCE,
      meta: { gate: "qa", effort: "max", ms: 1234 },
    });

    const row = await sql<{
      source: string; mode: string; prompt_tokens: number; completion_tokens: number;
      cost_eur: string; meta: { gate?: string; effort?: string; ms?: number; brake?: string };
    }>`
      SELECT source, mode, prompt_tokens, completion_tokens, cost_eur, meta
        FROM cost_ledger WHERE task_id = ${taskId}::uuid`.execute(db());
    expect(row.rows.length, "the judge left no receipt").toBe(1);
    expect(row.rows[0].source).toBe("qa");
    expect(row.rows[0].mode).toBe("subscription");
    expect(row.rows[0].prompt_tokens).toBe(1200);
    expect(row.rows[0].completion_tokens).toBe(300);
    expect(Number(row.rows[0].cost_eur), "subscription: tokens yes, euro never").toBe(0);
    expect(row.rows[0].meta).toMatchObject({ gate: "qa", effort: "max", ms: 1234, brake: SUBSCRIPTION_CAP_KEY });

    const after = await checkSubscriptionWindow();
    expect(after.tokens - before.tokens, "the window did not count the judge's tokens").toBeGreaterThanOrEqual(1500);
  });

  it("qa() writes the judge's milliseconds and attempts into the task's own event", async () => {
    const department = `${M}-event`;
    const taskId = await makeTask(department, "review");
    const lines: string[] = [];
    const orig = console.log;
    console.log = (...a: unknown[]) => { lines.push(a.map(String).join(" ")); };
    try {
      const outcome = await qa(taskId, async () => {
        await new Promise((r) => setTimeout(r, 20));
        return { pass: true, confidence: 0.9, notes: "probe: contract satisfied" };
      });
      expect(outcome.toStatus).toBe("done");
    } finally {
      console.log = orig;
    }
    const ev = await sql<{ payload: { judge_ms?: number; judge_attempts?: number; qa?: string } }>`
      SELECT payload FROM task_events
       WHERE task_id = ${taskId}::uuid AND from_status = 'review' AND to_status = 'done'
       ORDER BY created_at DESC LIMIT 1`.execute(db());
    expect(ev.rows.length, "no review→done event").toBe(1);
    expect(ev.rows[0].payload.qa).toBe("pass");
    expect(ev.rows[0].payload.judge_attempts).toBe(1);
    expect(ev.rows[0].payload.judge_ms, "the gate's own time is not in the book").toBeGreaterThanOrEqual(20);
    expect(lines.some((l) => l.startsWith("[qa]") && l.includes(taskId) && l.includes("PASS")), `no [qa] log line: ${lines.join(" | ")}`).toBe(true);
  });
});
