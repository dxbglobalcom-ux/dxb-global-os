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
