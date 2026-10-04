// Sol's C on the memory-drawer job (2026-10-04): the chat and voice lanes turned a failed recall
// into an EMPTY memory — `.catch(() => ({ rows: [] }))` — so Hamza answered as if he had no notes,
// and a broken drawer looked exactly like an empty one. Nobody would notice.
//
// The CEO's word on the fix: Hamza says plainly when he could not reach his notes. These cases pin
// that a failed recall reaches the answer as a FLAG (never as silence), is logged once, and that the
// standing layer carries the sentence only when the flag is up.

import { afterAll, describe, expect, it, vi } from "vitest";
import { sql, type Kysely } from "kysely";
import type { DB } from "@dxb/shared";
import { memoryBlock, recallForAnswer, standingPrompt, HAMZA_SLUG } from "@dxb/voice";
import { answerVoiceCall, intakeVoiceCall } from "@dxb/voice";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { drainChatMessages, type ChatAnswerInput } from "../../packages/orchestrator/src/index.js";

afterAll(async () => {
  await closeDb();
});

class Rollback extends Error {}
async function inTrx(fn: (trx: Kysely<DB>) => Promise<void>): Promise<void> {
  try {
    await getDb().transaction().execute(async (trx) => {
      await fn(trx as unknown as Kysely<DB>);
      throw new Rollback();
    });
  } catch (e) {
    if (!(e instanceof Rollback)) throw e;
  }
}

const broken = async (): Promise<never> => {
  throw new Error("recall: memory ref broken for index x at 'artifact/x.md' — ENOENT");
};
const working = async () => ({
  rows: [{ body: "the holding's first client is a furniture shop" }],
  classifier_used: false,
});

describe("the standing layer — the unreachable sentence only when flagged", () => {
  const base = {
    agent: { slug: HAMZA_SLUG, department: "ceo", role_level: "orchestrator" },
    personaBody: "",
    lang: "tr" as const,
    lane: "chat" as const,
  };

  it("says the notes could not be read, and never claims there are none", () => {
    const block = memoryBlock([], true);
    expect(block).toMatch(/could not be read/);
    expect(block).toMatch(/never answer as if you had none/);
    // Unconditional (Sol, 2026-10-04): no "if it depends on memory" escape — he is told every time.
    expect(block).toMatch(/Say so plainly in your answer/);
    expect(block).not.toMatch(/depends on/);
    expect(standingPrompt({ ...base, memoryLines: [], memoryUnreachable: true }).join("\n")).toContain(block);
  });

  it("carries no memory block when nothing matched and nothing failed", () => {
    const text = standingPrompt({ ...base, memoryLines: [] }).join("\n");
    expect(text).not.toMatch(/could not be read/);
    expect(text).not.toContain("Relevant company memory");
  });
});

describe("recallForAnswer — a failure is a flag and one log line, never silence", () => {
  it("a throwing recall gives no lines, the flag, and one [memory] line naming the lane", async () => {
    const log = vi.fn();
    const out = await recallForAnswer(getDb(), "q", "voice", { recall: broken, log });
    expect(out).toEqual({ lines: [], unreachable: true });
    expect(log).toHaveBeenCalledTimes(1);
    expect(String(log.mock.calls[0][0])).toMatch(/^\[memory\] recall failed on the voice lane — recall: memory ref broken/);
  });

  it("a working recall carries its lines and no flag", async () => {
    const log = vi.fn();
    const out = await recallForAnswer(getDb(), "q", "chat", { recall: working, log });
    expect(out).toEqual({ lines: ["the holding's first client is a furniture shop"], unreachable: false });
    expect(log).not.toHaveBeenCalled();
  });
});

describe("both answer lanes hand the flag to the producer", () => {
  it("chat: a failed recall reaches Hamza as memoryUnreachable", async () => {
    await inTrx(async (trx) => {
      await sql`UPDATE chat_messages SET status = 'answered' WHERE status = 'pending'`.execute(trx);
      const s = await sql<{ id: string }>`SELECT fn_chat_session_for_new_message('memory probe', true) AS id`.execute(trx);
      await sql`
        INSERT INTO chat_messages (role, content, mode, status, session_id)
        VALUES ('ceo', 'geçen hafta ne konuşmuştuk', 'normal', 'pending', ${s.rows[0].id})
      `.execute(trx);
      let seen: ChatAnswerInput | null = null;
      const res = await drainChatMessages({
        db: trx,
        recall: broken,
        answer: async (q) => {
          seen = q;
          return "answered";
        },
      });
      expect(res.answered).toBe(1);
      expect(seen!.memoryUnreachable).toBe(true);
      expect(seen!.memoryLines).toEqual([]);
    });
  });

  it("voice: a failed recall reaches Hamza as memoryUnreachable", async () => {
    await inTrx(async (trx) => {
      const intake = await intakeVoiceCall(
        { db: trx, stt: async () => "geçen hafta ne konuşmuştuk" },
        { audio: Buffer.from("fake"), filename: "probe.wav" },
      );
      expect(intake.failure).toBeNull();
      let flag: boolean | undefined;
      const answered = await answerVoiceCall(
        {
          db: trx,
          audioDir: null,
          recall: broken,
          answer: async (q) => {
            flag = q.memoryUnreachable;
            return "TOPIC: hafıza\n\nNotlarıma şu an ulaşamadım efendim.";
          },
          tts: async () => Buffer.from("RIFFfakewav"),
        },
        { callId: intake.callId },
      );
      expect(answered.state).toBe("ended");
      expect(flag).toBe(true);
    });
  });
});
