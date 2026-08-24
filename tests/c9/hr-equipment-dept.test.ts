import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// C9 FilterBar rollout (2026-07-25): the HR equipment audit grid gets a
// department filter — v_hr_equipment_check must expose the department so the
// page can narrow server-side (205-row grid, 21 departments).

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

describe("v_hr_equipment_check — department column", () => {
  it("exposes department matching the agents row", async () => {
    await inTrx(async (trx) => {
      const res = await sql<{ n: string }>`
        select count(*) as n
          from v_hr_equipment_check v
          join agents a on a.id = v.employee_id
         where v.department is distinct from a.department
      `.execute(trx as never);
      expect(Number(res.rows[0].n)).toBe(0);
    });
  });
});
