// THE SESSION-START RULER under vitest — the ruler bites on a copy, and the hook as it stands passes.
// Dictated by the checker session on 2026-09-19, committed by the builder (audit law, 2026-09-15).
import { describe, expect, it } from "vitest";
import { C, measure, runRuler } from "./session-start-fits.js";

const root = process.cwd();

describe("the session-start ruler bites", () => {
  it("rings on a block the harness would refuse", () => {
    const fat = "--- HIS LAST ORDER ---\n" + "x".repeat(C.maxBytes + 1) + "\n--- WHAT HAPPENS NEXT ---\n--- WHAT WAITS ON HIM ---\n=== END ===\n";
    const r = measure(fat, root);
    expect(r.verdicts[0].pass).toBe(false);
  });
  it("rings on a cut that ends mid-word", () => {
    const out = "--- HIS LAST ORDER ---\nhe ordered a diagnos\n(+3 more lines — the rest of this section is in .planning/STATE.md)\n--- WHAT HAPPENS NEXT ---\n--- WHAT WAITS ON HIM ---\n=== END ===\n";
    expect(measure(out, root).verdicts[2].pass).toBe(false);
  });
  it("rings when a heading is missing", () => {
    expect(measure("=== END ===\n", root).verdicts[1].pass).toBe(false);
  });
});

describe("the hook as it stands", () => {
  it("delivers the position whole: every rule passes", () => {
    const r = runRuler({ root });
    expect(r.verdicts.flatMap((v) => v.failures).join("\n")).toBe("");
    expect(r.pass).toBe(true);
  });
});
