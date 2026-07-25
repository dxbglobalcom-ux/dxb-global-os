import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// v_org_tree workforce truth (caught 2026-07-25 during the C9 FilterBar
// rollout): the view still read the DEAD legacy columns — departments.status
// (21/21 dormant since the activation waves) and agents.status ('dormant'
// everywhere) — so /org/departments showed every department inactive with 0
// active employees while /org/employees showed 199/199. Same disease as the
// 2026-07-24 v_exec_overview catch; truth = agents.employment_status.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

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

describe("v_org_tree — workforce truth", () => {
  it("agents_active counts employment_status='active' (engineering > 0)", async () => {
    await inTrx(async (trx) => {
      const res = await sql<{ agents_active: number }>`
        select agents_active from v_org_tree where slug = 'engineering'
      `.execute(trx as never);
      expect(Number(res.rows[0].agents_active)).toBeGreaterThan(0);
    });
  });

  it("a department with active employees reports status='active'", async () => {
    await inTrx(async (trx) => {
      const res = await sql<{ status: string }>`
        select status from v_org_tree where slug = 'engineering'
      `.execute(trx as never);
      expect(res.rows[0].status).toBe("active");
    });
  });

  it("agents_total excludes archived rows (C8 working-org rule)", async () => {
    await inTrx(async (trx) => {
      const view = await sql<{ total: string }>`
        select sum(agents_total) as total from v_org_tree
      `.execute(trx as never);
      const truth = await sql<{ n: string }>`
        select count(*) as n from agents where employment_status <> 'archived'
      `.execute(trx as never);
      expect(Number(view.rows[0].total)).toBe(Number(truth.rows[0].n));
    });
  });
});
