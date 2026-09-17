// B46 — ONE RUN, ONE OWNER. A record belongs to the question that opened it.
//
// This layer only exists when the CEO has said "kaydet" — by default this engine writes nothing.
// But when it does write, two faults were reproduced by an independent auditor on 2026-09-17 and
// both are re-measured here by running the real code:
//
//   N02  The shared python resolver answered `own-run`, while `sweep.sh` read the machine-wide
//        `runs/CURRENT` marker with its own two lines of shell and wrote 1 evidence row, 12
//        queries and 12 tool rows into `peer-run` — another session's ledger. The capture hook
//        did the same although the session id was sitting in its own payload.
//   N05  The run id is a timestamp to the second. Two opens in the same second took the SAME id:
//        both returned success, and the first question's record ended up carrying the second
//        question and the second owner.
//
// A ledger that can absorb another question's evidence is worse than no ledger: it looks full.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Bench, makeBench, sample } from "./engine-copy.js";

let b: Bench;
beforeAll(() => {
  b = makeBench();
});
afterAll(() => b?.dispose());

function research(args: string[], env: Record<string, string> = {}): { out: string; code: number } {
  try {
    const out = execFileSync("python3", [join(b.engine, "scripts", "research.py"), ...args], {
      encoding: "utf8",
      env: { ...process.env, ...env, PATH: `${b.bin}:${process.env.PATH}`, PYTHONDONTWRITEBYTECODE: "1" },
    });
    return { out: out.trim(), code: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { out: String(err.stdout ?? "") + String(err.stderr ?? ""), code: err.status ?? 1 };
  }
}

const state = (rid: string) => JSON.parse(readFileSync(join(b.engine, "runs", rid, "state.json"), "utf8"));
const lock = (rid: string) => JSON.parse(readFileSync(join(b.engine, "runs", rid, "question_lock.json"), "utf8"));

describe("N05 — two questions opened in the same second are two records", () => {
  it("mints a distinct id and never writes into a run that already exists", () => {
    // The clock is pinned so the collision is certain rather than lucky.
    const STAMP = "20260917-235959";
    const a = research(["open", "--question", "Question A", "--class", "counting"], {
      DXB_RESEARCH_STAMP: STAMP,
      CLAUDE_CODE_SESSION_ID: "session-A",
    });
    expect(a.code, a.out).toBe(0);
    const b1 = research(["open", "--question", "Question B", "--class", "counting", "--force"], {
      DXB_RESEARCH_STAMP: STAMP,
      CLAUDE_CODE_SESSION_ID: "session-B",
    });
    expect(b1.code, b1.out).toBe(0);

    expect(a.out).not.toBe(b1.out);
    expect(lock(a.out).question_verbatim).toBe("Question A");
    expect(lock(b1.out).question_verbatim).toBe("Question B");
    expect(state(a.out).session_id).toBe("session-A");
    expect(state(b1.out).session_id).toBe("session-B");
  });
});

describe("N02 — a sweep writes to the run its own session owns, or to none", () => {
  it("does not write into another session's ledger because a shared marker points there", () => {
    const runs = join(b.engine, "runs");
    for (const [rid, sid] of [["own-run", "own-session"], ["peer-run", "peer-session"]]) {
      mkdirSync(join(runs, rid), { recursive: true });
      writeFileSync(
        join(runs, rid, "state.json"),
        JSON.stringify({ run_id: rid, status: "open", session_id: sid, mode: "record" }),
        "utf8",
      );
    }
    // the machine-wide marker points at the PEER's run — the shape the auditor reproduced
    writeFileSync(join(runs, "CURRENT"), "peer-run", "utf8");

    // `--pages 1` so the run reaches its ledger step: with `--pages 0` the sweep leaves before
    // ingest and the case would pass having proved nothing.
    execFileSync("bash", [join(b.engine, "scripts", "sweep.sh"), "an ordinary question", join(b.root, "sweep-session"),
      "--tier", "core", "--pages", "1", "--no-browser"], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${b.bin}:${process.env.PATH}`,
        CLAUDE_CODE_SESSION_ID: "own-session",
        PYTHONDONTWRITEBYTECODE: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const rows = (rid: string) =>
      ["ledger.jsonl", "queries.jsonl", "tools.jsonl"]
        .filter((f) => existsSync(join(runs, rid, f)))
        .map((f) => readFileSync(join(runs, rid, f), "utf8").split("\n").filter(Boolean).length)
        .reduce((n, x) => n + x, 0);
    expect(rows("peer-run"), "rows crossed into another session's ledger").toBe(0);
    // the positive control: the run this session DOES own received the work, so the case is
    // measuring where the rows went and not merely that nothing was written at all.
    expect(rows("own-run"), "the session's own ledger stayed empty — nothing was measured").toBeGreaterThan(0);
  }, 60_000);

  it("the capture hook writes to the run named by the session in its own payload", () => {
    const runs = join(b.engine, "runs");
    writeFileSync(join(runs, "CURRENT"), "peer-run", "utf8");
    const payload = JSON.stringify({
      session_id: "own-session",
      tool_name: "WebFetch",
      tool_input: { url: "https://bench.example/an-article" },
      tool_response: "a body long enough to be taken as a passage ".repeat(20),
    });
    const f = sample(b, "hook-payload.json", payload);
    // THE SESSION ID IS STRIPPED FROM THE ENVIRONMENT ON PURPOSE. A hook fires inside whatever
    // process the harness gives it; the only thing it can be sure of is what its own payload
    // says. Leaving this session's id in the environment made the first version of this case
    // pass while the defect was still there.
    const env: Record<string, string> = { ...process.env, PATH: `${b.bin}:${process.env.PATH}`, PYTHONDONTWRITEBYTECODE: "1" } as Record<string, string>;
    delete env.CLAUDE_CODE_SESSION_ID;
    execFileSync("bash", ["-c", `python3 ${JSON.stringify(join(b.engine, "hooks", "ledger-capture.py"))} < ${JSON.stringify(f)}`], {
      encoding: "utf8",
      env,
    });
    const count = (rid: string) => {
      const p = join(runs, rid, "ledger.jsonl");
      return existsSync(p) ? readFileSync(p, "utf8").split("\n").filter(Boolean).length : 0;
    };
    expect(count("peer-run"), "the hook wrote into the run the shared marker pointed at").toBe(0);
    expect(count("own-run"), "the hook wrote nowhere — the case would prove nothing").toBeGreaterThan(0);
  });
});
