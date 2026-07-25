// U15 round 2 verification (ticket 20260725-u15-voice-round2, spec §24bis
// round-2 block):
//   1. voice_daemon_state door: audited flips through
//      control_voice_daemon_set_state; illegal state rejected
//   2. chat-lane mute command executes DETERMINISTICALLY in chat.drain —
//      no LLM call, daemon state flips, spoken-Turkish confirmation lands
//      on the board
//   3. one-conversation law: a Hamza-answered voice call mirrors both turns
//      onto chat_messages tagged source='voice', carrying session_id on the
//      call row (intake → answer chain with stubbed STT/answer/TTS)
// Every mutating test runs INSIDE A ROLLED-BACK TRANSACTION (the 9c/10e
// idiom): the RESIDENT scheduler can never race an uncommitted pending row
// (the e8 daemon-race lesson), and the live daemon state — the CEO's
// standing mute order — is never really touched.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql, type Kysely, type Transaction } from "kysely";
import { closeDb, getDb, type DB } from "@dxb/shared";
import { intakeVoiceCall } from "../../packages/voice/src/intake.js";
import { answerVoiceCall } from "../../packages/voice/src/answer.js";
import { drainChatMessages } from "../../packages/orchestrator/src/chat-drain.js";

const db = () => getDb();

class Rollback extends Error {}
async function withRollback(fn: (trx: Transaction<DB>) => Promise<void>): Promise<void> {
  await db()
    .transaction()
    .execute(async (trx) => {
      await fn(trx);
      throw new Rollback("rollback");
    })
    .catch((e) => {
      if (!(e instanceof Rollback)) throw e;
    });
}

afterAll(async () => {
  await closeDb();
});

describe("U15 D12 — voice_daemon_state audited door", () => {
  it("flips state through the door and writes an audit row", async () => {
    await withRollback(async (trx) => {
      const res = await sql<{ r: { ok?: boolean; state?: string } }>`
        SELECT control_voice_daemon_set_state('listening', 'vitest', 'u15r2 door proof') AS r
      `.execute(trx);
      expect(res.rows[0].r.ok).toBe(true);
      const row = await sql<{ state: string }>`SELECT state FROM voice_daemon_state WHERE id = 1`.execute(trx);
      expect(row.rows[0].state).toBe("listening");
      const audit = await sql<{ n: number }>`
        SELECT count(*)::int AS n FROM audit_log
        WHERE action = 'voice.daemon_state' AND payload->>'note' = 'u15r2 door proof'
      `.execute(trx);
      expect(audit.rows[0].n).toBe(1);
    });
  });

  it("rejects an illegal state", async () => {
    await withRollback(async (trx) => {
      const res = await sql<{ r: { ok?: boolean; error?: string } }>`
        SELECT control_voice_daemon_set_state('shouting', 'vitest', 'u15r2') AS r
      `.execute(trx);
      expect(res.rows[0].r.error).toBe("VALIDATION_FAILED");
    });
  });
});

describe("U15 D12 — chat-lane mute command (deterministic, no LLM)", () => {
  it('"kapan" from the CEO mutes the daemon and confirms on the board', async () => {
    await withRollback(async (trx) => {
      await sql`SELECT control_voice_daemon_set_state('listening', 'vitest', 'u15r2 arrange')`.execute(trx);
      // No other pending rows may shadow ours inside this snapshot — the
      // drain answers the OLDEST pending row.
      const pending = await sql<{ n: number }>`
        SELECT count(*)::int AS n FROM chat_messages WHERE role = 'ceo' AND status = 'pending'
      `.execute(trx);
      expect(pending.rows[0].n).toBe(0);
      await trx
        .insertInto("chat_messages")
        .values({ role: "ceo", content: "kapan", mode: "normal", status: "pending", error: null, intent_id: null })
        .execute();
      const res = await drainChatMessages({
        db: trx as unknown as Kysely<DB>,
        answer: async () => {
          throw new Error("LLM must NOT be called for a daemon command");
        },
      });
      expect(res.answered).toBe(1);
      expect(res.failed).toBe(0);
      const state = await sql<{ state: string }>`SELECT state FROM voice_daemon_state WHERE id = 1`.execute(trx);
      expect(state.rows[0].state).toBe("muted");
      const confirmation = await trx
        .selectFrom("chat_messages")
        .select(["role", "content", "status"])
        .orderBy("created_at", "desc")
        .limit(1)
        .executeTakeFirst();
      expect(confirmation?.role).toBe("hamza");
      expect(confirmation?.content).toContain("mikrofonu kapattım");
    });
  });

  it('"mikrofonu aç" reopens the daemon', async () => {
    await withRollback(async (trx) => {
      const pending = await sql<{ n: number }>`
        SELECT count(*)::int AS n FROM chat_messages WHERE role = 'ceo' AND status = 'pending'
      `.execute(trx);
      expect(pending.rows[0].n).toBe(0);
      await trx
        .insertInto("chat_messages")
        .values({ role: "ceo", content: "mikrofonu aç", mode: "normal", status: "pending", error: null, intent_id: null })
        .execute();
      const res = await drainChatMessages({
        db: trx as unknown as Kysely<DB>,
        answer: async () => {
          throw new Error("LLM must NOT be called for a daemon command");
        },
      });
      expect(res.answered).toBe(1);
      const state = await sql<{ state: string }>`SELECT state FROM voice_daemon_state WHERE id = 1`.execute(trx);
      expect(state.rows[0].state).toBe("listening");
    });
  });
});

describe("U15 D12/D13 — one conversation + session threads", () => {
  it("a Hamza-answered call mirrors onto the board and carries session_id", async () => {
    await withRollback(async (trx) => {
      const sessionId = randomUUID();
      const marker = `u15r2-${randomUUID().slice(0, 8)}`;
      const question = `çeyrek gelir durumu nedir ${marker}`;
      const intake = await intakeVoiceCall(
        { db: trx as unknown as Kysely<DB>, stt: async () => question },
        { audio: Buffer.from("fake"), filename: "probe.wav", sessionId },
      );
      expect(intake.failure).toBeNull();
      expect(intake.state).toBe("routing");

      const answered = await answerVoiceCall(
        {
          db: trx as unknown as Kysely<DB>,
          audioDir: null,
          answer: async (q) => {
            expect(Array.isArray(q.history)).toBe(true); // one-conversation context present
            return `TOPIC: gelir durumu\n\nGelirler yolunda efendim ${marker}.`;
          },
          tts: async () => Buffer.from("RIFFfakewav"),
        },
        { callId: intake.callId },
      );
      expect(answered.state).toBe("ended");

      const call = await trx
        .selectFrom("voice_calls")
        .select(["session_id", "status"])
        .where("id", "=", intake.callId)
        .executeTakeFirst();
      expect(call?.status).toBe("ended");
      expect(call?.session_id).toBe(sessionId);

      const mirror = await trx
        .selectFrom("chat_messages")
        .select(["role", "content", "source", "status"])
        .where("content", "like", `%${marker}%`)
        .orderBy("created_at", "asc")
        .execute();
      expect(mirror.length).toBe(2);
      expect(mirror[0].role).toBe("ceo");
      expect(mirror[0].source).toBe("voice");
      expect(mirror[0].status).toBe("answered"); // terminal — chat.drain never re-answers
      expect(mirror[1].role).toBe("hamza");
      expect(mirror[1].source).toBe("voice");
    });
  });
});
