import { readFileSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { GOAL_MAX_CHARS, IntentBody } from "../../apps/dashboard/src/lib/intent-body.js";

// B64 plan step 1 (CEO 2026-10-14; his words, b64-opened-goal-not-intent-and-hamza-2026-10-12:
// "Niyet değil, hedef. Verilecek hedef, holdinge verilecek iş."). What he gives the holding is a goal —
// a broad brief written the way a task is written for an engineer — so the 500-character cap on
// intents.text goes (migration 20261014040000), the route's schema follows it, the chat board's
// "send as a task" button stops cutting his message, and no surface he reads says niyet/intent.
//
// DB probes run inside a rolled-back transaction: the resident scheduler is live against this engine.

const ROLLBACK = new Error("rollback-sentinel");
const ROOT = new URL("../../", import.meta.url);
const read = (rel: string) => readFileSync(new URL(rel, ROOT), "utf8");

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

// A goal with a body: what is wanted, how, and its properties — 3,000 characters, six times the old cap.
const LONG_GOAL = ("Outleteuro için hafta sonu kampanyası: hedef kitle, kanallar, bütçe, ölçüt. ").repeat(40).slice(0, 3000);

afterAll(async () => {
  await closeDb();
});

const flatValues = (o: unknown, p = ""): Array<[string, string]> =>
  typeof o === "string"
    ? [[p, o]]
    : Array.isArray(o)
      ? o.flatMap((v, i) => flatValues(v, `${p}[${i}]`))
      : Object.entries(o as Record<string, unknown>).flatMap(([k, v]) => flatValues(v, p ? `${p}.${k}` : k));

describe("B64 step 1 — he gives a goal, not an intent", () => {
  it("the database takes a 3,000-character goal; the sanity bound still refuses the absurd and the empty", async () => {
    expect(LONG_GOAL.length).toBe(3000);
    await inTrx(async (trx) => {
      const row = await sql<{ n: number }>`
        INSERT INTO intents (text, lang, source, actor) VALUES (${LONG_GOAL}, 'tr', 'dashboard', 'ceo')
        RETURNING char_length(text) AS n`.execute(trx);
      expect(row.rows[0].n).toBe(3000);
    });
    for (const text of ["", "x".repeat(GOAL_MAX_CHARS + 1)]) {
      await expect(
        inTrx(async (trx) => {
          await sql`INSERT INTO intents (text, lang, source, actor) VALUES (${text}, 'en', 'dashboard', 'ceo')`.execute(trx);
        }),
      ).rejects.toThrow(/intents_text_check/);
    }
  });

  it("the route's schema takes the same goal and the same bound", () => {
    expect(GOAL_MAX_CHARS).toBe(20000);
    expect(IntentBody.parse({ text: LONG_GOAL, lang: "tr" }).text).toBe(LONG_GOAL.trim());
    expect(IntentBody.safeParse({ text: "x".repeat(GOAL_MAX_CHARS) }).success).toBe(true);
    expect(IntentBody.safeParse({ text: "x".repeat(GOAL_MAX_CHARS + 1) }).success).toBe(false);
    expect(IntentBody.safeParse({ text: "   " }).success).toBe(false);
  });

  it("the route parses with that schema and the chat board sends his whole message", () => {
    const route = read("apps/dashboard/src/app/api/intent/route.ts");
    expect(route).toMatch(/from "@\/lib\/intent-body"/);
    expect(route).not.toMatch(/max\(500\)/);
    const board = read("apps/dashboard/src/components/chat/chat-board.tsx");
    expect(board).toMatch(/text: m\.content, lang/);
    expect(board).not.toMatch(/content\.slice\(/);
  });

  it("no string he reads says niyet or intent, and both locales keep the same keys", () => {
    const tr = JSON.parse(read("apps/dashboard/messages/tr.json"));
    const en = JSON.parse(read("apps/dashboard/messages/en.json"));
    // \bniyet: "Emniyet" (safety) is a different word that merely contains the letters.
    expect(flatValues(tr).filter(([, v]) => /(^|[^\p{L}])niyet/iu.test(v))).toEqual([]);
    expect(flatValues(en).filter(([, v]) => /\bintent/i.test(v))).toEqual([]);
    expect(tr.login.tagline).toBe("Hedefin icraata dönüştüğü yer.");
    expect(en.login.tagline).toBe("Where goals become execution.");
    expect(tr.command.automations.kpiIntents).toBe("İşlenen hedef");
    expect(en.command.automations.kpiIntents).toBe("Goals processed");
    const keys = (o: unknown): string[] => flatValues(o).map(([k]) => k).sort();
    expect(keys(tr)).toEqual(keys(en));
  });
});
