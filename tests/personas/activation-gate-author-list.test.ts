// THE ACTIVATION GATE'S AUTHOR LIST — one list, two places, they must stay equal.
//
// The defect this pins, measured 2026-09-15 (B08 step 0): the holding kept the set of authorized
// construction authors in TWO copies — the CHECK constraint `personas_author_check` on
// public.personas, and a hand-written `NOT IN (...)` inside the trigger function
// `enforce_persona_gate_on_activation()` on public.agents. On 2026-07-28 migration
// 20260728001000_persona_author_u30.sql widened the constraint to ('opus-5','fable-5',
// 'hr-factory') for U30 (CEO 2026-07-26: construction authorship is shared). The trigger's copy
// was missed and stayed at ('fable-5','hr-factory') for 49 days. Nothing failed loudly: the
// consequence only surfaced when 17 rows — the 16 media-studio seats and Hamza — had to be
// re-bound to persona versions an Opus 5 session had written, and the database refused:
//   activation denied: persona ... author=opus-5 (need passed + v2 author)
// The records said the seats were written and gated; the live agents were still reading the
// older text. A drift between two copies of one rule is invisible until it costs a day.
//
// The metre: read BOTH lists out of the live catalogue and compare the sets. It fails the moment
// one side is widened or narrowed without the other, whichever side moves.
import { describe, expect, it, afterAll } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";

const db = () => getDb();

/** The authors named inside a SQL text fragment, as a sorted set. */
function authorsIn(text: string): string[] {
  return [...new Set([...text.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]))].sort();
}

describe("activation gate — the authorized-author list lives in two places and must agree", () => {
  afterAll(async () => {
    await closeDb();
  });

  it("the trigger function's author list equals personas_author_check's", async () => {
    const gate = await sql<{ def: string }>`
      SELECT pg_get_functiondef('public.enforce_persona_gate_on_activation'::regproc) AS def
    `.execute(db());
    const cons = await sql<{ def: string }>`
      SELECT pg_get_constraintdef(oid) AS def
        FROM pg_constraint WHERE conname = 'personas_author_check'
    `.execute(db());

    const gateDef = gate.rows[0]?.def ?? "";
    const consDef = cons.rows[0]?.def ?? "";
    expect(gateDef, "enforce_persona_gate_on_activation() must exist").not.toBe("");
    expect(consDef, "personas_author_check must exist").not.toBe("");

    // The trigger names the authors in its own NOT IN (...); the constraint in its ARRAY[...].
    const gateList = gateDef.match(/v_author NOT IN \(([^)]*)\)/)?.[1] ?? "";
    expect(gateList, "the trigger must carry an explicit author list").not.toBe("");

    expect(authorsIn(gateList)).toEqual(authorsIn(consDef));
  });

  it("the list is the U30 set — Opus 5 and Fable 5 are equal authors (CEO 2026-07-26)", async () => {
    const gate = await sql<{ def: string }>`
      SELECT pg_get_functiondef('public.enforce_persona_gate_on_activation'::regproc) AS def
    `.execute(db());
    const gateList = gate.rows[0]?.def.match(/v_author NOT IN \(([^)]*)\)/)?.[1] ?? "";
    expect(authorsIn(gateList)).toEqual(["fable-5", "hr-factory", "opus-5"]);
  });

  it("the gate still refuses an unauthorized author and a persona that never passed", async () => {
    // The widening must not have loosened the two conditions the gate exists for. Read the body
    // rather than writing a row: the suite's engine carries live seats bound through this trigger.
    const gate = await sql<{ def: string }>`
      SELECT pg_get_functiondef('public.enforce_persona_gate_on_activation'::regproc) AS def
    `.execute(db());
    const def = gate.rows[0]?.def ?? "";
    expect(def).toContain("v_gate IS DISTINCT FROM 'passed'");
    expect(def).toContain("NEW.persona_id IS NULL");
    expect(def).toContain("activation denied");
  });
});
