import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// Ledger C5 trigger leg (measured 2026-07-19, live orphans measured 2026-07-24:
// 6 tasks stuck awaiting_approval with decided-then-purged approvals): deciding
// an approval must move the linked task out of awaiting_approval — approved
// ships the result (done), rejected sends it back for rework (returned).
// Tests run inside rolled-back transactions against the live DB.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const SEED = "c5-task-sync-test";
const ROLLBACK = new Error("rollback-sentinel");

afterAll(async () => {
  await closeDb();
});

const inTrx = async (fn: (trx: unknown) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await fn(trx);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

const seedAwaitingTask = async (trx: unknown): Promise<string> => {
  const task = await sql<{ id: string }>`
    insert into tasks (objective, output_contract, department, model_tier, status)
    values (${SEED + " objective"}, ${SEED + " contract"}, 'finance', 'L2', 'running')
    returning id
  `.execute(trx as never);
  const id = task.rows[0].id;
  await sql`update tasks set status = 'awaiting_approval' where id = ${id}`.execute(
    trx as never,
  );
  const gate = await sql<{ n: string }>`
    select count(*) as n from approvals where task_id = ${id} and status = 'pending'
  `.execute(trx as never);
  expect(Number(gate.rows[0].n)).toBe(1); // bridge trigger created the gate
  return id;
};

describe("C5 — decide_approvals syncs the linked task", () => {
  it("approve moves the task from awaiting_approval to done", async () => {
    await inTrx(async (trx) => {
      const taskId = await seedAwaitingTask(trx);
      const approval = await sql<{ id: string }>`
        select id from approvals where task_id = ${taskId} and status = 'pending'
      `.execute(trx as never);

      await sql`
        select decide_approvals(array[${approval.rows[0].id}]::uuid[], 'approved', ${SEED})
      `.execute(trx as never);

      const task = await sql<{ status: string }>`
        select status from tasks where id = ${taskId}
      `.execute(trx as never);
      expect(task.rows[0].status).toBe("done");
    });
  });

  it("reject moves the task from awaiting_approval to returned", async () => {
    await inTrx(async (trx) => {
      const taskId = await seedAwaitingTask(trx);
      const approval = await sql<{ id: string }>`
        select id from approvals where task_id = ${taskId} and status = 'pending'
      `.execute(trx as never);

      await sql`
        select decide_approvals(array[${approval.rows[0].id}]::uuid[], 'rejected', ${SEED})
      `.execute(trx as never);

      const task = await sql<{ status: string }>`
        select status from tasks where id = ${taskId}
      `.execute(trx as never);
      expect(task.rows[0].status).toBe("returned");
    });
  });

  it("a task no longer awaiting approval is left untouched", async () => {
    await inTrx(async (trx) => {
      const taskId = await seedAwaitingTask(trx);
      const approval = await sql<{ id: string }>`
        select id from approvals where task_id = ${taskId} and status = 'pending'
      `.execute(trx as never);
      // worker already moved the task on some other lane
      await sql`update tasks set status = 'failed' where id = ${taskId}`.execute(
        trx as never,
      );

      await sql`
        select decide_approvals(array[${approval.rows[0].id}]::uuid[], 'approved', ${SEED})
      `.execute(trx as never);

      const task = await sql<{ status: string }>`
        select status from tasks where id = ${taskId}
      `.execute(trx as never);
      expect(task.rows[0].status).toBe("failed");
    });
  });
});
