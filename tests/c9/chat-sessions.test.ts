import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { drainChatMessages, type ChatAnswerInput } from "../../packages/orchestrator/src/index.js";

// W1.5 — conversations on the CEO chat board.
//
// Measured before: `chat_messages` had no session column, the board was one flat
// 200-row list, and Hamza's context window was the newest 20 messages whatever
// they were about — so a question about video production carried the tail of a
// conversation about the budget. "New chat" existed nowhere in the code.
//
// The valuable half is not the navigation strip; it is that the answer half now
// only sees its own conversation. These cases prove that.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const ROLLBACK = new Error("rollback-sentinel");
// The dashboard reaches Postgres as `authenticated` carrying the CEO's jwt —
// the only role whose grants and policies are worth asserting here.
const CEO_JWT = JSON.stringify({
  sub: "00000000-0000-0000-0000-000000000001",
  email: "ceo-test",
});
const inTrx = async (fn: (trx: never) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await fn(trx as never);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

afterAll(async () => {
  await closeDb();
});

describe("sessions — the data model", () => {
  it("no message is orphaned: the existing board was adopted by a thread", async () => {
    const r = await sql<{ n: string }>`
      SELECT count(*)::text AS n FROM chat_messages WHERE session_id IS NULL
    `.execute(getDb());
    expect(Number(r.rows[0].n)).toBe(0);
  });

  it("continuing writes to the live thread; 'new' always opens a fresh one", async () => {
    await inTrx(async (trx) => {
      const a = await sql<{ id: string }>`
        SELECT fn_chat_session_for_new_message('first message', false) AS id
      `.execute(trx);
      const b = await sql<{ id: string }>`
        SELECT fn_chat_session_for_new_message('second message', false) AS id
      `.execute(trx);
      expect(b.rows[0].id).toBe(a.rows[0].id);

      const c = await sql<{ id: string }>`
        SELECT fn_chat_session_for_new_message('deliberate new thread', true) AS id
      `.execute(trx);
      expect(c.rows[0].id).not.toBe(a.rows[0].id);
    });
  });

  it("a long silence starts a new conversation by itself", async () => {
    await inTrx(async (trx) => {
      // A message the next morning is a new conversation in every sense that
      // matters to the person having it.
      await sql`UPDATE chat_sessions SET last_message_at = now() - interval '20 hours'`.execute(trx);
      const before = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM chat_sessions
      `.execute(trx);
      await sql`SELECT fn_chat_session_for_new_message('good morning', false)`.execute(trx);
      const after = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM chat_sessions
      `.execute(trx);
      expect(Number(after.rows[0].n)).toBe(Number(before.rows[0].n) + 1);
    });
  });

  it("the thread is titled with the CEO's own opening line, trimmed not truncated mid-word", async () => {
    await inTrx(async (trx) => {
      const long = "x".repeat(200);
      const r = await sql<{ id: string }>`
        SELECT fn_chat_session_for_new_message(${long}, true) AS id
      `.execute(trx);
      const t = await sql<{ title: string }>`
        SELECT title FROM chat_sessions WHERE id = ${r.rows[0].id}
      `.execute(trx);
      expect(t.rows[0].title.length).toBeLessThanOrEqual(60);
      expect(t.rows[0].title.endsWith("...")).toBe(true);
    });
  });

  it("the thread's ordering key follows its newest message", async () => {
    await inTrx(async (trx) => {
      const s = await sql<{ id: string }>`
        SELECT fn_chat_session_for_new_message('ordering probe', true) AS id
      `.execute(trx);
      await sql`UPDATE chat_sessions SET last_message_at = now() - interval '5 hours'
                 WHERE id = ${s.rows[0].id}`.execute(trx);
      await sql`
        INSERT INTO chat_messages (role, content, mode, status, session_id)
        VALUES ('ceo', 'a later turn', 'normal', 'answered', ${s.rows[0].id})
      `.execute(trx);
      const t = await sql<{ fresh: boolean }>`
        SELECT last_message_at > now() - interval '1 minute' AS fresh
          FROM chat_sessions WHERE id = ${s.rows[0].id}
      `.execute(trx);
      expect(t.rows[0].fresh).toBe(true);
    });
  });
});

// 2026-07-26, CEO-reported live defect: "yeni konuşma" produced three empty
// threads and not one message. Measured cause: the browser writes as the
// `authenticated` role, and the 2026-07-19 board migration had granted INSERT
// per COLUMN (`role, content, mode`) — W1.5 then added `session_id` to the
// insert without widening that grant, so every send died on "permission denied
// for table chat_messages" while the API had already minted the thread.
//
// Every case below runs as the role the browser actually uses. A test that
// writes as `postgres` cannot see a grant defect at all — which is exactly why
// the suite was green while the CEO's chat was dead.
describe("sessions — the CEO's own send path, as the role the browser uses", () => {
  const asCeo = async (trx: unknown) => {
    await sql`select set_config('request.jwt.claims', ${CEO_JWT}, true)`.execute(trx as never);
    await sql`set local role authenticated`.execute(trx as never);
  };

  it("a message sent from the board lands in the database", async () => {
    await inTrx(async (trx) => {
      await asCeo(trx);
      const r = await sql<{ out: { message_id: string; session_id: string } }>`
        SELECT fn_chat_post_message('grant probe — the CEO says hello', 'normal', NULL, true) AS out
      `.execute(trx as never);
      const { message_id, session_id } = r.rows[0].out;
      expect(message_id).toBeTruthy();

      const m = await sql<{ content: string; session_id: string; role: string }>`
        SELECT content, session_id, role FROM chat_messages WHERE id = ${message_id}
      `.execute(trx as never);
      expect(m.rows).toHaveLength(1);
      expect(m.rows[0].role).toBe("ceo");
      expect(m.rows[0].session_id).toBe(session_id);
    });
  });

  it("continuing an open thread keeps the message in it", async () => {
    await inTrx(async (trx) => {
      await asCeo(trx);
      const first = await sql<{ out: { session_id: string } }>`
        SELECT fn_chat_post_message('opening line', 'normal', NULL, true) AS out
      `.execute(trx as never);
      const sid = first.rows[0].out.session_id;
      const second = await sql<{ out: { session_id: string } }>`
        SELECT fn_chat_post_message('second line', 'plan', ${sid}::uuid, false) AS out
      `.execute(trx as never);
      expect(second.rows[0].out.session_id).toBe(sid);
    });
  });

  it("a refused message leaves no empty conversation behind", async () => {
    // The CEO's three "selam" threads with zero messages in them were the old
    // two-statement shape: mint the thread, then write the message, and keep the
    // thread when the write died. The DO block below is exactly what a caller
    // that catches the error and carries on looks like to the database.
    await inTrx(async (trx) => {
      await asCeo(trx);
      const count = async () =>
        Number(
          (
            await sql<{ n: string }>`SELECT count(*)::text AS n FROM chat_sessions`.execute(
              trx as never,
            )
          ).rows[0].n,
        );

      const before = await count();
      await sql`
        DO $$ BEGIN
          PERFORM fn_chat_post_message('   ', 'normal', NULL, true);
        EXCEPTION WHEN OTHERS THEN NULL; END $$
      `.execute(trx as never);
      expect(await count()).toBe(before);

      // The contrast that makes the assertion mean something: minting the thread
      // on its own — the first half of the old shape — does leave one behind.
      await sql`SELECT fn_chat_session_for_new_message('orphan by construction', true)`.execute(
        trx as never,
      );
      expect(await count()).toBe(before + 1);
    });
  });

  it("the board has exactly one write door — the table itself is closed", async () => {
    await inTrx(async (trx) => {
      await asCeo(trx);
      const s = await sql<{ out: { session_id: string } }>`
        SELECT fn_chat_post_message('door probe', 'normal', NULL, true) AS out
      `.execute(trx as never);
      await expect(
        sql`
          INSERT INTO chat_messages (role, content, mode, session_id)
          VALUES ('ceo', 'straight through the table', 'normal', ${s.rows[0].out.session_id}::uuid)
        `.execute(trx as never),
      ).rejects.toThrow(/permission denied/i);
    });
  });
});

describe("sessions — the answer half only sees its own conversation", () => {
  it("Hamza's context window is scoped to the thread, and his reply joins it", async () => {
    await inTrx(async (trx) => {
      await sql`UPDATE chat_messages SET status = 'answered' WHERE status = 'pending'`.execute(trx);

      const other = await sql<{ id: string }>`
        SELECT fn_chat_session_for_new_message('budget conversation', true) AS id
      `.execute(trx);
      await sql`
        INSERT INTO chat_messages (role, content, mode, status, session_id)
        VALUES ('ceo', 'BUDGET_THREAD_MARKER how much did we spend', 'normal', 'answered', ${other.rows[0].id})
      `.execute(trx);

      const mine = await sql<{ id: string }>`
        SELECT fn_chat_session_for_new_message('video conversation', true) AS id
      `.execute(trx);
      await sql`
        INSERT INTO chat_messages (role, content, mode, status, session_id)
        VALUES ('ceo', 'VIDEO_THREAD_MARKER earlier turn', 'normal', 'answered', ${mine.rows[0].id})
      `.execute(trx);
      await sql`
        INSERT INTO chat_messages (role, content, mode, status, session_id)
        VALUES ('ceo', 'which tool should we use', 'normal', 'pending', ${mine.rows[0].id})
      `.execute(trx);

      let seen: ChatAnswerInput | null = null;
      const res = await drainChatMessages({
        db: trx as never,
        answer: async (q) => {
          seen = q;
          return "answered";
        },
      });
      expect(res.answered).toBe(1);

      const history = seen!.history.map((h) => h.content).join(" | ");
      expect(history).toContain("VIDEO_THREAD_MARKER");
      expect(history).not.toContain("BUDGET_THREAD_MARKER");

      // The reply belongs to the same conversation, or the thread would answer
      // itself into the void.
      const reply = await sql<{ session_id: string }>`
        SELECT session_id FROM chat_messages
         WHERE role = 'hamza' AND content = 'answered'
         ORDER BY created_at DESC LIMIT 1
      `.execute(trx);
      expect(reply.rows[0].session_id).toBe(mine.rows[0].id);
    });
  });
});
