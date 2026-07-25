import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// Outbox internal-signal exclusion (2026-07-25 triage root cause): the
// enqueue_outbox_on_approve trigger enqueued EVERY approved approval, but
// hook_escalation is an in-system signal — the executor has no handler for it
// by design (Phase-11 LOCKED: no outward handlers before then), so every
// approved escalation became an eternally-'ready' outbox row. 51 such rows
// from the 2026-07-18 wave blocked the phase4 suite guard and the r24 runner.
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

describe("outbox enqueue — internal signals stay out of the execution queue", () => {
  it("an approved hook_escalation does NOT enqueue an outbox row", async () => {
    await inTrx(async (trx) => {
      const ap = await sql<{ id: string }>`
        insert into approvals (action_type, payload, risk_class, status)
        values ('hook_escalation', '{"probe":"c9-internal-signal"}', 'low', 'pending')
        returning id
      `.execute(trx as never);
      await sql`
        update approvals set status = 'approved' where id = ${ap.rows[0].id}
      `.execute(trx as never);
      const ob = await sql<{ n: string }>`
        select count(*) as n from outbox where approval_id = ${ap.rows[0].id}
      `.execute(trx as never);
      expect(Number(ob.rows[0].n)).toBe(0);
    });
  });

  it("an approved outward action still enqueues exactly one outbox row", async () => {
    await inTrx(async (trx) => {
      const ap = await sql<{ id: string }>`
        insert into approvals (action_type, payload, risk_class, status)
        values ('email.send.staging', '{"probe":"c9-outward-signal"}', 'low', 'pending')
        returning id
      `.execute(trx as never);
      await sql`
        update approvals set status = 'approved' where id = ${ap.rows[0].id}
      `.execute(trx as never);
      const ob = await sql<{ n: string }>`
        select count(*) as n from outbox where approval_id = ${ap.rows[0].id}
      `.execute(trx as never);
      expect(Number(ob.rows[0].n)).toBe(1);
    });
  });
});
