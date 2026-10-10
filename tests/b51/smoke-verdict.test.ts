// B51 step 3 · audit B4 — a Codex-lane smoke passes only on a verdict the critical gate itself would accept.
//
// Measured in the audit: smoke.mjs passed a Codex model when `typeof JSON.parse(raw) === "object"` — true for
// null, {}, [] and {"verdict":"garbage",…}. A stamp on that is a false record: the succession door would move a
// seat onto a model whose answer the gate then throws away as "unparsable verdict". The pass decision is now the
// gate's own schema (ChallengerVerdict), held in a pure function this file pins without a live call.
import { describe, expect, it } from "vitest";
import { ChallengerVerdict } from "../../packages/orchestrator/src/critical-gate.js";
import { codexSmokePasses } from "../../scripts/models/smoke-verdict.mjs";

const CLI = "codex-cli 0.200.0";

describe("B51 · audit B4 — the Codex smoke passes only on the gate's own verdict schema", () => {
  it("refuses JSON that is an object to typeof but not a verdict", () => {
    for (const raw of ["null", "{}", "[]", '{"verdict":"garbage","objections":[]}']) {
      expect(codexSmokePasses({ ok: true, raw, cli: CLI }, ChallengerVerdict), raw).toBe(false);
    }
  });

  it("refuses text that is not JSON at all, and a missing answer", () => {
    expect(codexSmokePasses({ ok: true, raw: "not json {", cli: CLI }, ChallengerVerdict)).toBe(false);
    expect(codexSmokePasses({ ok: true, raw: undefined, cli: CLI }, ChallengerVerdict)).toBe(false);
  });

  it("refuses a failed run and an unknown CLI even when the verdict is valid", () => {
    const raw = '{"verdict":"sound","objections":[]}';
    expect(codexSmokePasses({ ok: false, raw, cli: CLI }, ChallengerVerdict)).toBe(false);
    expect(codexSmokePasses({ ok: true, raw, cli: null }, ChallengerVerdict)).toBe(false);
  });

  it("passes a real verdict from a run that answered, on a known CLI", () => {
    expect(codexSmokePasses({ ok: true, raw: '{"verdict":"sound","objections":[]}', cli: CLI }, ChallengerVerdict)).toBe(true);
    const flawed = JSON.stringify({
      verdict: "flawed",
      objections: [{ severity: "low", claim: "x changes meaning", why: "callers read x" }],
    });
    expect(codexSmokePasses({ ok: true, raw: flawed, cli: CLI }, ChallengerVerdict)).toBe(true);
  });
});
