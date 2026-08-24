import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { handlers } from "../../packages/outbox-executor/src/actions/index.js";

// Outbox enqueue allowlist (2026-07-26 stabilization audit): the 20260725004000
// fix was a DENYLIST — it named hook_escalation and stayed silent about every
// future action type nobody wrote a handler for. The next one arrived within a
// day: discovery_engine.scheduler_disable (approval 1d6e7a30) spun
// ready→rollback every 15s with attempts pinned at 0, invisible to the
// attempts>=3 alert path, poisoning the phase4/r24 suite guards. The outward
// queue now refuses at birth what it cannot execute, and leaves an audit trace
// instead of a poison row.

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

const approveNew = async (trx: unknown, actionType: string): Promise<string> => {
  const ap = await sql<{ id: string }>`
    insert into approvals (action_type, payload, risk_class, status)
    values (${actionType}, '{"probe":"c9-enqueue-allowlist"}', 'low', 'pending')
    returning id
  `.execute(trx as never);
  await sql`update approvals set status = 'approved' where id = ${ap.rows[0].id}`.execute(
    trx as never,
  );
  return ap.rows[0].id;
};

describe("outbox enqueue — only executable action types are born as rows", () => {
  it("an allowlisted type still enqueues", async () => {
    await inTrx(async (trx) => {
      const id = await approveNew(trx, "email.send.staging");
      const rows = await sql<{ n: string }>`
        select count(*) as n from outbox where approval_id = ${id}
      `.execute(trx as never);
      expect(Number(rows.rows[0].n)).toBe(1);
    });
  });

  it("a type with no executor handler does NOT enqueue and leaves an audit trace", async () => {
    await inTrx(async (trx) => {
      const id = await approveNew(trx, "discovery_engine.scheduler_disable");
      const rows = await sql<{ n: string }>`
        select count(*) as n from outbox where approval_id = ${id}
      `.execute(trx as never);
      expect(Number(rows.rows[0].n)).toBe(0);
      const audit = await sql<{ n: string }>`
        select count(*) as n from audit_log
        where action = 'outbox.enqueue_skipped_no_handler'
          and payload->>'approval_id' = ${id}
      `.execute(trx as never);
      expect(Number(audit.rows[0].n)).toBe(1);
    });
  });

  it("the trigger allowlist mirrors the executor handler registry", async () => {
    // The pair rule: adding a handler means adding its name to the trigger in
    // the same change. This test holds the two sides together mechanically.
    const src = await sql<{ prosrc: string }>`
      select prosrc from pg_proc where proname = 'enqueue_outbox_on_approve'
    `.execute(getDb());
    const body = src.rows[0]?.prosrc ?? "";
    const listed = [...body.matchAll(/'([a-z0-9_.]+)'/g)]
      .map((m) => m[1])
      .filter((s) => s.includes("."));
    for (const type of Object.keys(handlers)) {
      expect(listed, `trigger allowlist is missing handler ${type}`).toContain(type);
    }
    for (const type of listed.filter((t) => !t.startsWith("outbox."))) {
      expect(
        Object.keys(handlers),
        `trigger allowlists ${type} but the executor has no such handler`,
      ).toContain(type);
    }
  });
});
