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
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type Bench, makeBench } from "./engine-copy";

let b: Bench;
beforeEach(() => {
  b = makeBench();
});
afterEach(() => b.dispose());

const RUN = "20261116-000000-clock";

/** GAPS.md as a lead writes it when it names no claim */
const GAPS_NAMING_NO_CLAIM = "Not reached: every channel. Left open: the question.\n";

const runFile = (name: string) => join(b.engine, "runs", RUN, name);

function plant(openedSecondsAgo: number, gaps = false, blocks = 0): void {
  const dir = join(b.engine, "runs", RUN);
  mkdirSync(dir, { recursive: true });
  const opened = new Date(Date.now() - openedSecondsAgo * 1000).toISOString();
  writeFileSync(
    join(dir, "state.json"),
    JSON.stringify({ phase: "expedition", question_class: "factual", mode: "gated", status: "open", opened_at: opened, blocks }),
  );
  writeFileSync(join(dir, "question_lock.json"), JSON.stringify({ question: "q", opened_at: opened }));
  if (gaps) writeFileSync(join(dir, "GAPS.md"), GAPS_NAMING_NO_CLAIM);
}

/** the run's claims, and L1 — one page that was read — in its ledger for them to cite */
function claims(list: Record<string, unknown>[]): void {
  writeFileSync(runFile("ledger.jsonl"), JSON.stringify({
    id: "L1", kind: "evidence", source_type: "secondary", url: "https://news.example.org/a", liveness: "live",
  }) + "\n");
  writeFileSync(runFile("claims.json"), JSON.stringify(list));
}

/** a claim the answer rests on, citing the page that was read */
const loadBearing = (id: string, more: Record<string, unknown>) =>
  ({ id, text: "the answer's leg", cites: ["L1"], load_bearing: true, ...more });

function gate(env: Record<string, string> = {}): Record<string, any> {
  // the gate exits 2 when it refuses, so its status is not an error here
  const r = spawnSync("python3", [join(b.engine, "scripts", "gate.py"), "--run", RUN, "--json"], {
    env: { ...process.env, DXB_RESEARCH_REEXEC: "1", ...env },
    encoding: "utf8",
  });
  expect([0, 2], r.stderr).toContain(r.status);
  return JSON.parse(r.stdout);
}

/** the Stop hook's answer for the planted run: the reason it refuses the exit with, "" when it lets the turn end */
function stopHook(): string {
  const r = spawnSync("python3", [join(b.engine, "hooks", "research-completion.py")], {
    input: JSON.stringify({ hook_event_name: "Stop" }),
    env: { ...process.env, DXB_RESEARCH_REEXEC: "1", DXB_RESEARCH_RUN: RUN, CLAUDE_CODE_SESSION_ID: "" },
    encoding: "utf8",
    timeout: 30_000,
  });
  expect(r.status, r.stderr).toBe(0);
  return JSON.parse(r.stdout).reason ?? "";
}

/** the checks a failure list names, in its order: ["H12", "H4"] */
const checks = (res: Record<string, any>): string[] => res.hard_failures.map((f: string) => f.split(" ")[0]);

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

// THE LEAD'S EXIT WAIVES THE WORK, NEVER THE HONESTY (the blind audit of 866711c1, 2026-11-16). Measured by Sol on
// that commit: at second 601 a load-bearing claim nobody tested, beside a GAPS.md that named something else, passed —
// until then such a claim was let through only at minute 18. A GAPS.md past the converge point ends the demand for
// more evidence; what a run meets by writing the truth — the UNPROVEN label, the claim's id in GAPS.md — still stands.
describe("past the converge point a written GAPS.md waives the work, never the honesty", () => {
  const HOURS = 3 * 3600;
  const UNTESTED = "H12 load-bearing claim C1 had no contradiction search";

  it("an untested load-bearing claim refuses the exit until it is labelled UNPROVEN and named in GAPS.md (H12)", () => {
    plant(HOURS, true);
    for (const [confidence, gaps] of [
      ["PROVEN", GAPS_NAMING_NO_CLAIM],
      ["UNPROVEN", GAPS_NAMING_NO_CLAIM],
      ["PROVEN", "Never tested against its opposite: C1.\n"],
    ]) {
      claims([loadBearing("C1", { confidence })]);
      writeFileSync(runFile("GAPS.md"), gaps);
      const res = gate();
      expect(res.pass, `${confidence} · ${gaps}`).toBe(false);
      // the evidence the class asks for (H2, H3, H4, H8) is waived; the silent hole is all that is left
      expect(checks(res), `${confidence} · ${gaps}`).toEqual(["H12"]);
      expect(res.hard_failures[0]).toContain(UNTESTED);
    }
    claims([loadBearing("C1", { confidence: "UNPROVEN" })]);
    writeFileSync(runFile("GAPS.md"), "Never tested against its opposite: C1.\n");
    expect(gate().pass).toBe(true);
  });

  it("a withdrawn claim refuses the exit until GAPS.md names it (H19)", () => {
    plant(HOURS, true);
    claims([{ id: "C2", text: "pulled", cites: ["L1"], withdrawn: true }]);
    const res = gate();
    expect(res.pass).toBe(false);
    expect(checks(res)).toEqual(["H19"]);
    writeFileSync(runFile("GAPS.md"), "Withdrawn: C2 — its one source was the vendor's own page.\n");
    expect(gate().pass).toBe(true);
  });

  it("a load-bearing claim with no label refuses the exit until it carries one (H15)", () => {
    plant(HOURS, true);
    writeFileSync(runFile("queries.jsonl"), JSON.stringify({ id: "Q1", kind: "contradiction", claim_id: "C1", query: "not so" }) + "\n");
    claims([loadBearing("C1", {})]);
    const res = gate();
    expect(res.pass).toBe(false);
    expect(checks(res)).toEqual(["H15"]);
    claims([loadBearing("C1", { confidence: "LIKELY" })]);
    expect(gate().pass).toBe(true);
  });

  it("a citation that is not in the ledger refuses the exit whatever GAPS.md names (H9)", () => {
    plant(HOURS, true);
    claims([{ id: "C1", text: "made up", cites: ["L99"] }]);
    writeFileSync(runFile("GAPS.md"), "Left open: C1, L99 and everything else.\n");
    const res = gate();
    expect(res.pass).toBe(false);
    expect(checks(res)).toEqual(["H9"]);
  });

  it("what is left to do names only what still blocks: no step of a waived check", () => {
    plant(HOURS, true);
    claims([loadBearing("C1", { confidence: "PROVEN" })]);
    const res = gate();
    expect(res.todo).toHaveLength(1);
    expect(res.todo[0]).toContain("search the NEGATION of C1");
    // before the GAPS.md the same run is still asked for its evidence, and told how to get it
    rmSync(runFile("GAPS.md"));
    const asked = gate();
    expect(checks(asked)).toContain("H2");
    expect(asked.todo.join("\n")).toContain("fetch the official doc");
  });

  it("the block budget is the valve that never traps a run: spent, it keeps the integrity checks only", () => {
    plant(HOURS, true, 6);
    claims([loadBearing("C1", { confidence: "PROVEN" })]);
    expect(gate().pass).toBe(true);
    rmSync(runFile("GAPS.md"));
    const silent = gate();
    expect(silent.hard_failures).toHaveLength(1);
    expect(silent.hard_failures[0]).toMatch(/^BUDGET SPENT and there is no GAPS\.md/);
    claims([{ id: "C1", text: "made up", cites: ["L99"] }]);
    writeFileSync(runFile("GAPS.md"), GAPS_NAMING_NO_CLAIM);
    expect(checks(gate())).toEqual(["H9"]);
  });

  it("the Stop hook says what is left: with GAPS.md written, the silent hole and no research; without it, what GAPS.md must name", () => {
    plant(HOURS, true);
    claims([loadBearing("C1", { confidence: "PROVEN" })]);
    const written = stopHook();
    expect(written).toContain(`✗ ${UNTESTED}`);
    expect(written).toContain("GAPS.md is written");
    // the evidence the gate has stopped asking for is not handed back as the next batch
    expect(written).not.toContain("fetch the official doc");
    expect(written).not.toContain(`write runs/${RUN}/GAPS.md`);
    rmSync(runFile("GAPS.md"));
    const unwritten = stopHook();
    expect(unwritten).toContain(`write runs/${RUN}/GAPS.md`);
    expect(unwritten).toContain("every claim left untested or withdrawn");
    expect(unwritten).not.toContain("GAPS.md is written");
  });
});
