import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  buildBriefSnapshot,
  classifyLeg,
  legInstruction,
  LEG_TASK_CLASS,
  drainChatMessages,
  type ChatAnswerInput,
} from "../../packages/orchestrator/src/index.js";

// Hamza's two legs (CEO directive 2026-07-25): the money/planning conversation
// and the daily report. Both are L1 — §4d puts anything the CEO reads on Opus 5
// — so what these cases own is the BEHAVIOUR split: which leg answers, and
// whether the report leg is actually handed measured numbers instead of being
// left to remember them.

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

describe("two legs — which one answers", () => {
  it("report and status questions take the brief leg, in both languages", () => {
    for (const m of [
      "bugün ne oldu?",
      "şirket nasıl gidiyor",
      "günlük rapor ver",
      "kaç görev bekliyor",
      "give me a status update",
      "daily brief please",
      "what happened today?",
    ]) {
      expect(classifyLeg(m), m).toBe("brief");
    }
  });

  it("money and planning questions take the strategy leg", () => {
    for (const m of [
      "youtube kanalı açalım mı, ne kadar kazandırır?",
      "bu ay 10.000 euro hedef koyalım",
      "hangi ürünle başlayalım",
      "should we hire a second video specialist?",
      "selam",
    ]) {
      expect(classifyLeg(m), m).toBe("strategy");
    }
  });

  it("doubt goes UP, never down: an unrecognised message is strategy", () => {
    // The CEO's one-directional rule. Misrouting a status question to strategy
    // costs tokens; misrouting a money decision to the report leg costs a
    // decision.
    expect(classifyLeg("zzz qqq unknown words")).toBe("strategy");
  });

  it("each leg has its own routing class", () => {
    expect(LEG_TASK_CLASS.strategy).toBe("chat.strategy");
    expect(LEG_TASK_CLASS.brief).toBe("chat.brief");
  });

  it("both leg rows exist, are L1, and differ only in effort", async () => {
    const r = await sql<{ task_class: string; model_tier: string; model: string; effort: string }>`
      SELECT task_class, model_tier, model, effort FROM routing_rules
       WHERE task_class IN ('chat.strategy', 'chat.brief') AND enabled
       ORDER BY task_class
    `.execute(getDb());
    expect(r.rows).toHaveLength(2);
    for (const row of r.rows) {
      expect(row.model_tier, row.task_class).toBe("L1");
      expect(row.model, row.task_class).toBe("fable-5");
    }
    const byClass = Object.fromEntries(r.rows.map((x) => [x.task_class, x.effort]));
    expect(byClass["chat.strategy"]).toBe("max");
    expect(byClass["chat.brief"]).toBe("medium");
  });
});

describe("the brief leg answers from measurements", () => {
  it("the snapshot carries live company figures", async () => {
    const snap = await buildBriefSnapshot(getDb(), "tr");
    expect(snap.lines.length).toBeGreaterThan(0);
    // Live readings, not placeholders: these keys come straight off
    // v_exec_overview and the revenue/alert counts.
    expect(snap.values).toHaveProperty("agents_active");
    expect(snap.values).toHaveProperty("pending_approvals");
    expect(snap.values).toHaveProperty("revenue_lifetime_eur");
    expect(snap.values).toHaveProperty("open_alerts");
    expect(Number(snap.values.agents_active)).toBeGreaterThan(0);
  });

  it("renders in the CEO's language", async () => {
    const tr = await buildBriefSnapshot(getDb(), "tr");
    const en = await buildBriefSnapshot(getDb(), "en");
    expect(tr.lines.join(" ")).toMatch(/Onay bekleyen|Kadro|İş:/);
    expect(en.lines.join(" ")).toMatch(/Waiting on approval|Workforce|Work:/);
  });

  it("the brief instruction hands over the numbers AND forbids inventing more", async () => {
    const snap = await buildBriefSnapshot(getDb(), "en");
    const text = legInstruction("brief", snap, "en");
    expect(text).toContain("ONLY these numbers");
    for (const line of snap.lines) expect(text).toContain(line);
  });

  it("the brief instruction states that empty tables are not a defect", () => {
    // The CEO corrected this twice in chat. It is a standing framing rule, so
    // it belongs in the prompt, not in a person's memory.
    expect(legInstruction("brief", null, "tr")).toContain("KUSUR DEĞİLDİR");
    expect(legInstruction("brief", null, "en")).toContain("NOT a defect");
  });

  it("with nothing measurable the brief says so rather than filling the gap", () => {
    expect(legInstruction("brief", { lines: [], values: {} }, "en")).toContain(
      "no figure could be measured",
    );
  });

  it("the strategy instruction carries no figures and asks for a position", () => {
    const text = legInstruction("strategy", null, "en");
    expect(text).toContain("MONEY AND PLANNING");
    expect(text).toContain("take a position");
    expect(text).not.toContain("MEASURED STATE");
  });
});

describe("the drain routes a real message to the right leg", () => {
  // U27: every message belongs to a conversation (session_id NOT NULL), and the
  // thread is minted by the same resolver production uses.
  const seed = async (trx: never, content: string) => {
    await sql`
      INSERT INTO chat_messages (role, content, mode, status, session_id)
      VALUES ('ceo', ${content}, 'normal', 'pending',
              fn_chat_session_for_new_message(${content}, true))
    `.execute(trx);
  };

  it("a status question arrives on the brief leg WITH a snapshot", async () => {
    await inTrx(async (trx) => {
      await sql`UPDATE chat_messages SET status = 'answered' WHERE status = 'pending'`.execute(trx);
      await seed(trx, "şirket nasıl gidiyor, kısa rapor ver");
      let seen: ChatAnswerInput | null = null;
      const res = await drainChatMessages({
        db: trx as never,
        answer: async (q) => {
          seen = q;
          return "ok";
        },
      });
      expect(res.answered).toBe(1);
      expect(seen!.leg).toBe("brief");
      expect(seen!.snapshot).not.toBeNull();
      expect(seen!.snapshot!.lines.length).toBeGreaterThan(0);
    });
  });

  it("a money question arrives on the strategy leg WITHOUT a snapshot", async () => {
    await inTrx(async (trx) => {
      await sql`UPDATE chat_messages SET status = 'answered' WHERE status = 'pending'`.execute(trx);
      await seed(trx, "youtube kanalı açalım mı, hangi ürünle başlayalım?");
      let seen: ChatAnswerInput | null = null;
      const res = await drainChatMessages({
        db: trx as never,
        answer: async (q) => {
          seen = q;
          return "ok";
        },
      });
      expect(res.answered).toBe(1);
      expect(seen!.leg).toBe("strategy");
      expect(seen!.snapshot).toBeNull();
    });
  });
});
