import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { headline } from "../../packages/orchestrator/src/intent-intake.js";
import { lineFor, type LiveEvent } from "../../apps/dashboard/src/lib/live-ops.js";

// THE HEADLINE GATE (2026-07-26, CEO screenshot: "canlı türkçe değil hala
// ingilizce").
//
// The Turkish leg was only half the story. The other half: the feed's line WAS
// the task objective, and a scout brief is ~1700 characters of instruction, so
// the CEO's one-line feed row rendered a full page — in English, because a
// brief is an artifact and artifacts are English. Translating it would have
// been the wrong fix; a brief is not a label.
//
// A task now carries a short headline in both languages (tasks.label /
// label_tr) and the views resolve the fallback chain once, so every CEO surface
// answers the same. This gate holds that invariant where it is visible: nothing
// on the live feed or the morning briefing may be longer than a line.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

// A headline is a line. 200 leaves room for a long Turkish sentence and still
// fails loudly on a paragraph — the shape this gate exists to catch.
const LINE_MAX = 200;

afterAll(async () => {
  await closeDb();
});

describe("what the CEO's feed is allowed to say", () => {
  it("gives every live row a headline in both languages, never a paragraph", async () => {
    const rows = await sql<{
      source_id: string;
      label: string | null;
      label_tr: string | null;
    }>`SELECT source_id, label, label_tr FROM v_live_ops`.execute(getDb());

    for (const r of rows.rows) {
      // A label may be absent (a run with no task carries the model id, which
      // the component replaces with an honest "no label" line) — but present
      // means readable, and present in English means present in Turkish too.
      if (r.label !== null) {
        expect(r.label.length, `label too long on ${r.source_id}: ${r.label.slice(0, 80)}`)
          .toBeLessThanOrEqual(LINE_MAX);
        expect(r.label_tr, `Turkish leg missing on ${r.source_id}`).not.toBeNull();
      }
      if (r.label_tr !== null) {
        expect(r.label_tr.length, `label_tr too long on ${r.source_id}`)
          .toBeLessThanOrEqual(LINE_MAX);
      }
    }
  });

  it("keeps the morning briefing's human lists to one line each", async () => {
    const rows = await sql<{ block: string; payload: Record<string, unknown> }>`
      SELECT block, payload FROM v_morning_briefing
    `.execute(getDb());

    const work = rows.rows.find((r) => r.block === "overnight_work");
    const appr = rows.rows.find((r) => r.block === "approvals");
    expect(work).toBeDefined();
    expect(appr).toBeDefined();

    const done = (work!.payload.recent_done ?? []) as Array<{
      label: string | null;
      label_tr: string | null;
    }>;
    const oldest = (appr!.payload.oldest ?? []) as Array<{
      label: string | null;
      label_tr: string | null;
    }>;

    for (const row of [...done, ...oldest]) {
      // 0018 used left(objective, 80): a MID-WORD cut the page then rendered
      // inside `truncate`, producing the visible "…" the CEO banned. The
      // headline is whole or it is nothing.
      expect(row.label?.length ?? 0).toBeLessThanOrEqual(LINE_MAX);
      expect(row.label_tr?.length ?? 0).toBeLessThanOrEqual(LINE_MAX);
      if (row.label !== null) expect(row.label).not.toMatch(/…|\.\.\.$/);
    }
  });

  it("labels a task whose objective is a whole brief", async () => {
    // The concrete shape that started this: a multi-line brief must never be
    // what a feed row says. Every task carrying one has an explicit headline.
    const rows = await sql<{ id: string; label: string | null }>`
      SELECT id, label FROM tasks WHERE position(E'\n' IN objective) > 0
    `.execute(getDb());
    for (const r of rows.rows) {
      expect(r.label, `multi-line objective with no headline: ${r.id}`).not.toBeNull();
      expect(r.label!.length).toBeLessThanOrEqual(LINE_MAX);
    }
  });
});

describe("which language a feed row speaks", () => {
  const row = (label: string | null, labelTr: string | null): LiveEvent => ({
    id: "x",
    kind: "task",
    task_id: null,
    event: "e",
    to_status: null,
    actor: "a",
    label,
    label_tr: labelTr,
    created_at: "2026-07-26T00:00:00Z",
  });

  it("reads Turkish on the Turkish page and the artifact language on the English one", () => {
    const r = row("Market scan for live revenue opportunities", "Piyasa taraması: canlı gelir fırsatları");
    expect(lineFor(r, "tr")).toBe("Piyasa taraması: canlı gelir fırsatları");
    expect(lineFor(r, "en")).toBe("Market scan for live revenue opportunities");
  });

  it("falls back to a readable line instead of a blank row", () => {
    // A row the Turkish leg never reached still says something true.
    expect(lineFor(row("Halt the scheduled run", null), "tr")).toBe("Halt the scheduled run");
    expect(lineFor(row(null, null), "tr")).toBeNull();
    // The English page never borrows the Turkish leg — purity runs both ways.
    expect(lineFor(row(null, "Türkçe etiket"), "en")).toBeNull();
  });
});

describe("headline() — the CEO's own sentence, cut like a human would", () => {
  it("takes the first line and leaves a short one alone", () => {
    expect(headline("Fırsatları tara\nikinci satır")).toBe("Fırsatları tara");
  });

  it("cuts a long line at a word boundary, never mid-word and never with …", () => {
    const long = "kelime ".repeat(40).trim(); // 279 chars, all word boundaries
    const out = headline(long)!;
    expect(out.length).toBeLessThanOrEqual(120);
    expect(out).not.toMatch(/…|\.\.\./);
    expect(out.endsWith("kelime")).toBe(true); // whole word, not "kelim"
  });

  it("returns null for an empty first line rather than an empty label", () => {
    expect(headline("   \nsonra bir şey")).toBeNull();
    expect(headline("")).toBeNull();
  });
});
