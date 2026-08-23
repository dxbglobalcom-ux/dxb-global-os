import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The holding's memory is the holding's, and NOTHING the construction site does
// may enter it. The CEO's order, 2026-08-23, in his own words:
//
//   "ARTIK HİÇ BİR ŞEY SEN VEYA BAŞKASI ÇALIŞIRKEN YAZILMASIN"
//
// What he was looking at when he gave it: the company's own resident scheduler
// carried an hourly job, `claude-mem-sync`, whose entire purpose was to copy the
// CONSTRUCTION sessions' diary into `memory_index` at scope='holding'. Measured
// that day — 15,699 of the 15,773 rows in the holding's memory came from there,
// 1,818 of them landing at 15:00:29 while that afternoon's work was still
// running. The holding's brain had become the site's notebook.
//
// The queue, its cron, its worker and its schedule are gone, and the table was
// emptied on his order. This suite exists so none of it can come back quietly.
// It reads the SOURCE, not a database: the defect was a scheduled job in this
// repository, so this is where it must never reappear.

const REPO = join(__dirname, "../..");
const SCHEDULER = readFileSync(join(REPO, "packages/outbox-executor/src/scheduler.ts"), "utf8");

/** The scheduler's own lines, with its comments stripped — a comment naming the
 *  dead job (there is one, deliberately) must not read as the job returning. */
const code = SCHEDULER.split("\n")
  .filter((l) => !l.trim().startsWith("//"))
  .join("\n");

describe("the holding's memory is not the construction site's diary", () => {
  it("the resident scheduler has no claude-mem queue, cron, worker or schedule", () => {
    expect(code, "the `claude-mem-sync` queue is back in the scheduler").not.toContain(
      "claude-mem-sync",
    );
    expect(code, "a memSync queue/cron/schedule entry is back").not.toMatch(/\bmemSync\b/);
  });

  it("the resident scheduler cannot even reach the copier", () => {
    // Import-level, not call-level: a scheduler that imports it is one line away
    // from running it again, and the next session will not remember why.
    expect(code, "the scheduler imports syncClaudeMem again").not.toContain("syncClaudeMem");
  });

  it("nothing else in the running services schedules a claude-mem copy", () => {
    for (const file of [
      "packages/outbox-executor/src/main.ts",
      "packages/voice/src/jarvis-daemon.ts",
    ]) {
      const text = readFileSync(join(REPO, file), "utf8")
        .split("\n")
        .filter((l) => !l.trim().startsWith("//"))
        .join("\n");
      expect(text, `${file} schedules a claude-mem copy`).not.toContain("claude-mem-sync");
      expect(text, `${file} calls the claude-mem copier`).not.toContain("syncClaudeMem");
    }
  });
});
