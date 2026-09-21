import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  CRITICAL_GATE_CONFIG,
  runCriticalGate,
  type ChallengerRunner,
} from "../../packages/orchestrator/src/index.js";
import { watchLedgers } from "../helpers/suite-scope.js";

// Its own footprints in audit_log / decision_log, swept in afterAll below.
const ledgerScope = watchLedgers(() => getDb());

// MODEL_ROUTING_SPEC §4e — the critical gate. Opus 5 writes, the challengers try
// to refute, Opus 5 revises and signs.
//
// The transport is injected here: a subscription turn costs real quota and takes
// ~45-80s per challenger (measured on the live proof run), so the panel LOGIC is
// proven with a stub and the transport itself is proven once, live, and recorded
// in the ticket evidence. What these cases own is the part that would silently
// rot: what counts as an objection, what happens when a challenger dies, and
// whether the decision trail is actually written.

const answered = (verdict: "sound" | "flawed", objections: unknown[] = []): string =>
  JSON.stringify({ verdict, objections });

const stub =
  (per: Record<string, { ok: boolean; raw?: string; error?: string }>): ChallengerRunner =>
  async ({ model }) =>
    per[model] ?? { ok: false, error: `no stub for ${model}` };

afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ decisions: [{ decidedBy: "orchestrator", decision: "critical_gate" }] });
  await closeDb();
});

describe("§4e — the panel", () => {
  it("the CEO's two named challengers are the panel, and nobody else", () => {
    expect(CRITICAL_GATE_CONFIG.challengers.map((c) => c.model)).toEqual([
      "gpt-5.6-sol",
      "gpt-5.5",
    ]);
  });

  it("clean: every challenger answers and none finds a flaw", async () => {
    const res = await runCriticalGate(
      { subject: "probe", answer: "an answer" },
      {
        log: false,
        runner: stub({
          "gpt-5.6-sol": { ok: true, raw: answered("sound") },
          "gpt-5.5": { ok: true, raw: answered("sound") },
        }),
      },
    );
    expect(res.status).toBe("clean");
    expect(res.objections).toEqual([]);
    expect(res.feedback).toBe("");
  });

  it("objections: they are attributed, and the feedback names each one", async () => {
    const res = await runCriticalGate(
      { subject: "probe", answer: "an answer" },
      {
        log: false,
        runner: stub({
          "gpt-5.6-sol": {
            ok: true,
            raw: answered("flawed", [
              { severity: "high", claim: "14 GB is wrong", why: "13B at bf16 needs ~26 GB" },
            ]),
          },
          "gpt-5.5": {
            ok: true,
            raw: answered("flawed", [
              { severity: "medium", claim: "licence unchecked", why: "commercial use is gated" },
            ]),
          },
        }),
      },
    );
    expect(res.status).toBe("objections");
    expect(res.objections).toHaveLength(2);
    expect(res.objections.map((o) => o.from).sort()).toEqual(["GPT 5.5", "Solo 5.6"]);
    expect(res.feedback).toContain("14 GB is wrong");
    expect(res.feedback).toContain("licence unchecked");
  });

  it("one dead challenger does not silence the other", async () => {
    const res = await runCriticalGate(
      { subject: "probe", answer: "an answer" },
      {
        log: false,
        runner: stub({
          "gpt-5.6-sol": { ok: false, error: "timeout" },
          "gpt-5.5": {
            ok: true,
            raw: answered("flawed", [{ severity: "low", claim: "c", why: "w" }]),
          },
        }),
      },
    );
    expect(res.status).toBe("objections");
    expect(res.challengers.find((c) => c.model === "gpt-5.6-sol")?.ok).toBe(false);
    expect(res.objections).toHaveLength(1);
  });

  it("a dead panel is 'unavailable' — it never throws and never blocks the work", async () => {
    const res = await runCriticalGate(
      { subject: "probe", answer: "an answer" },
      {
        log: false,
        runner: stub({
          "gpt-5.6-sol": { ok: false, error: "no subscription" },
          "gpt-5.5": { ok: false, error: "no subscription" },
        }),
      },
    );
    expect(res.status).toBe("unavailable");
    expect(res.feedback).toBe("");
  });

  it("garbage from a challenger is refused, not believed", async () => {
    const res = await runCriticalGate(
      { subject: "probe", answer: "an answer" },
      {
        log: false,
        runner: stub({
          "gpt-5.6-sol": { ok: true, raw: "I think it looks fine to me!" },
          "gpt-5.5": { ok: true, raw: JSON.stringify({ verdict: "maybe", objections: [] }) },
        }),
      },
    );
    expect(res.status).toBe("unavailable");
    expect(res.challengers.every((c) => !c.ok)).toBe(true);
  });

  it("prose wrapped around valid JSON is still read", async () => {
    const res = await runCriticalGate(
      { subject: "probe", answer: "an answer" },
      {
        log: false,
        runner: stub({
          "gpt-5.6-sol": {
            ok: true,
            raw: `Here is my review:\n${answered("sound")}\nHope that helps.`,
          },
          "gpt-5.5": { ok: true, raw: answered("sound") },
        }),
      },
    );
    expect(res.status).toBe("clean");
  });
});

describe("§4e — the decision trail", () => {
  it("writes one critical_gate row carrying the objections", async () => {
    const before = await sql<{ n: string }>`
      SELECT count(*) AS n FROM decision_log WHERE decision = 'critical_gate'
    `.execute(getDb());

    const res = await runCriticalGate(
      { subject: "gate trail probe", answer: "an answer" },
      {
        runner: stub({
          "gpt-5.6-sol": {
            ok: true,
            raw: answered("flawed", [
              { severity: "high", claim: "trail probe claim", why: "trail probe why" },
            ]),
          },
          "gpt-5.5": { ok: true, raw: answered("sound") },
        }),
      },
    );

    expect(res.decisionId).toBeGreaterThan(0);
    const after = await sql<{ n: string }>`
      SELECT count(*) AS n FROM decision_log WHERE decision = 'critical_gate'
    `.execute(getDb());
    expect(Number(after.rows[0].n)).toBe(Number(before.rows[0].n) + 1);

    const row = await sql<{ outcome: string; rationale: string; alternatives: unknown }>`
      SELECT outcome, rationale, alternatives FROM decision_log WHERE id = ${res.decisionId}
    `.execute(getDb());
    expect(row.rows[0].outcome).toBe("objections");
    expect(row.rows[0].rationale).toContain("gate trail probe");
    expect(JSON.stringify(row.rows[0].alternatives)).toContain("trail probe claim");

    // decision_log is append-only (same rule as audit_log), so the probe row
    // stays — it is a real recorded gate run, not fixture residue.
  });
});
