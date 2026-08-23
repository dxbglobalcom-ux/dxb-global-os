import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// B36 — the board may not drift away from the measurement.
//
// The number of files that can still fall back to the company database was
// published three times from three throw-away shell pipelines (94, then 93 from
// an auditor, then 96) and every published figure was stale before it was read.
// The counter is committed now; this case makes the RECORD follow it, so the
// ledger cannot fall behind reality without the battery going red.

const BOARD = join(process.cwd(), "HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md");
const COUNTER = join(process.cwd(), "scripts/b36/count-company-fallbacks.mjs");

describe("B36 — the board's fallback figure is the counter's figure", () => {
  it("matches, file for file and bucket for bucket", () => {
    const measured = JSON.parse(execFileSync("node", [COUNTER, "--json"], { encoding: "utf8" })) as {
      executable: { file: string }[];
      tally: Record<string, number>;
    };
    const row = readFileSync(BOARD, "utf8")
      .split("\n")
      .find((l) => l.startsWith("| B36 |"));
    expect(row, "row B36 is not on the board").toBeTruthy();

    const published = /\*\*(\d+) files can really connect\*\* — \*\*(\d+) tests · (\d+) scripts · (\d+) seeds · (\d+) live application route/.exec(
      row!,
    );
    expect(
      published,
      "row B36 no longer states the figure in the shape this case reads — " +
        "keep the sentence '**N files can really connect** — **N tests · N scripts · N seeds · N live application route'",
    ).toBeTruthy();

    const [, total, tests, scripts, seeds, apps] = published!.map(Number) as unknown as number[];
    expect({ total, tests, scripts, seeds, apps }).toEqual({
      total: measured.executable.length,
      tests: measured.tally.tests ?? 0,
      scripts: measured.tally.scripts ?? 0,
      seeds: measured.tally["db seeds"] ?? 0,
      apps: measured.tally.apps ?? 0,
    });
  });
});
