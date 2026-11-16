// THE GATE'S CLOCK ADVISES, IT DOES NOT STOP A RUN (the CEO's word of 2026-11-16, the limit sweep's B8).
//
// Until that day the completion gate carried `max_seconds: 1080`: eighteen minutes after a run was opened the
// clock alone moved it into a `closing` regime, dropped every demand for work and left one exit. The number
// came from a single run of 2026-09-16 that died at minute 25. What stays is the converge point — the default
// place where the gate says "wrap up" and the lead sets by the question — and the honest exit: past that
// point a written GAPS.md ends the run whenever the LEAD judges it, never the clock.
//
// These cases run the real gate.py on a copy of the engine, with a run folder planted in the copy.

import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type Bench, makeBench } from "./engine-copy";

let b: Bench;
beforeEach(() => {
  b = makeBench();
});
afterEach(() => b.dispose());

const RUN = "20261116-000000-clock";

function plant(openedSecondsAgo: number, gaps = false): void {
  const dir = join(b.engine, "runs", RUN);
  mkdirSync(dir, { recursive: true });
  const opened = new Date(Date.now() - openedSecondsAgo * 1000).toISOString();
  writeFileSync(
    join(dir, "state.json"),
    JSON.stringify({ phase: "expedition", question_class: "factual", mode: "gated", opened_at: opened }),
  );
  writeFileSync(join(dir, "question_lock.json"), JSON.stringify({ question: "q", opened_at: opened }));
  if (gaps) writeFileSync(join(dir, "GAPS.md"), "Not reached: every channel. Left open: the question.\n");
}

function gate(env: Record<string, string> = {}): Record<string, any> {
  // the gate exits 2 when it refuses, so its status is not an error here
  const r = spawnSync("python3", [join(b.engine, "scripts", "gate.py"), "--run", RUN, "--json"], {
    env: { ...process.env, DXB_RESEARCH_REEXEC: "1", ...env },
    encoding: "utf8",
  });
  expect([0, 2], r.stderr).toContain(r.status);
  return JSON.parse(r.stdout);
}

describe("the research gate's clock", () => {
  it("three hours in, the clock has not closed the run: the regime is converge and the work is still asked for", () => {
    plant(3 * 3600);
    const res = gate();
    expect(res.regime).toBe("converge");
    expect(res).not.toHaveProperty("hard_stop_at_s");
    expect(res.pass).toBe(false);
    // the evidence the class needs is still named — the clock alone waived nothing
    expect(res.hard_failures.join("\n")).toMatch(/^H4 /m);
    expect(res.hard_failures.join("\n")).not.toMatch(/BUDGET SPENT/);
  });

  it("past the converge point the lead may end the run honestly: a written GAPS.md is the exit", () => {
    plant(3 * 3600, true);
    const res = gate();
    expect(res.regime).toBe("converge");
    expect(res.pass).toBe(true);
  });

  it("before the converge point a GAPS.md alone does not end the run", () => {
    plant(5, true);
    const res = gate();
    expect(res.regime).toBe("expand");
    expect(res.pass).toBe(false);
  });

  it("the lead sets the converge point by the question; no variable brings a hard stop back", () => {
    plant(3 * 3600);
    const res = gate({ DXB_RESEARCH_SOFT_SECONDS: String(6 * 3600), DXB_RESEARCH_MAX_SECONDS: "60" });
    expect(res.regime).toBe("expand");
    expect(res.converge_at_s).toBe(6 * 3600);
  });

  it("the budget file names no hard stop and no query ceiling", () => {
    const budget = readFileSync(join(b.engine, "config", "budget.yaml"), "utf8");
    expect(budget).not.toMatch(/^\s*(max_seconds|max_queries):/m);
    expect(budget).toMatch(/^\s*soft_seconds:/m);
  });
});
