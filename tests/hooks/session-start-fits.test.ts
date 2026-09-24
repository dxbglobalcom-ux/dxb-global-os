// THE SESSION-START RULER under vitest — the ruler bites on a copy, and the hook as it stands passes.
// Dictated by the checker session on 2026-09-19, committed by the builder (audit law, 2026-09-15).
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { C, measure, runHook, runRuler } from "./session-start-fits.js";

const root = process.cwd();

// The model watch (row B55) puts its lines under the hook's title from its state directory. Pinned
// here (the refuter's C2, 2026-09-24), so the ruler measures the hook and not whatever the machine's
// watch holds today: a quiet watch by default, and its loudest state — a notice and every source
// and the judge stale — in a case of its own.
const quiet = mkdtempSync(join(tmpdir(), "model-watch-quiet-"));
const loud = mkdtempSync(join(tmpdir(), "model-watch-loud-"));
writeFileSync(join(loud, "NOTICE.txt"), "--- MODEL WATCH: 99 serious items wait for him — python3 scripts/model-watch/model-watch.py --status ---\n");
writeFileSync(join(loud, "sources.tsv"), ["models", "docs", "release-notes", "claude-code", "engineering", "judge"].map((n) => `${n}\tx\t0\tnever\terr\n`).join(""));
process.env.DXB_MODEL_WATCH_STATE = quiet;
afterAll(() => { for (const d of [quiet, loud]) rmSync(d, { recursive: true, force: true }); });

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
  it("delivers it whole with the model watch at its loudest: a notice, and every source and the judge stale", () => {
    process.env.DXB_MODEL_WATCH_STATE = loud;
    try {
      const out = runHook(root);
      expect(out.split("\n").slice(1, 3)).toEqual([expect.stringContaining("MODEL WATCH: 99 serious items wait"),
        expect.stringContaining("no good read of models, docs, release-notes, claude-code, engineering, judge since never")]);
      const r = measure(out, root);
      expect(r.verdicts.flatMap((v) => v.failures).join("\n")).toBe("");
      expect(r.pass).toBe(true);
    } finally {
      process.env.DXB_MODEL_WATCH_STATE = quiet;
    }
  });
});
