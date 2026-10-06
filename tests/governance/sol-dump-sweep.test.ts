// THE SOL DUMP SWEEP — Sol's raw dumps (*.raw) and briefs (*brief*.txt) in the job folders are kept out
// of git and deleted from the disk once older than 90 days (CEO 2026-10-06). The sweep runs after every
// commit; it may only ever delete a file git ignores, never a tracked one. Each case builds its own git
// repository in a temporary folder.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const SWEEP = resolve(__dirname, "../../scripts/governance/sol-dump-sweep.sh");
const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

function repo(): string {
  const dir = mkdtempSync(join(tmpdir(), "soldump"));
  tmp.push(dir);
  const git = (...a: string[]) => execFileSync("git", ["-C", dir, ...a], { stdio: "pipe" });
  git("init", "-q");
  writeFileSync(join(dir, ".gitignore"), ".planning/quick/**/*.raw\n.planning/quick/**/*brief*.txt\n");
  mkdirSync(join(dir, ".planning/quick/job"), { recursive: true });
  return dir;
}
const put = (dir: string, name: string, daysOld: number) => {
  const file = join(dir, ".planning/quick/job", name);
  writeFileSync(file, "x");
  execFileSync("touch", ["-d", `${daysOld} days ago`, file]);
  return file;
};
const sweep = (dir: string) => spawnSync("bash", [SWEEP, dir], { encoding: "utf8" });

describe("sol-dump-sweep.sh", () => {
  it("deletes an ignored dump and brief older than 90 days; keeps the younger ones and SOL.md", () => {
    const dir = repo();
    const oldRaw = put(dir, "SOL.md.raw", 91);
    const oldBrief = put(dir, "sol-brief.txt", 120);
    const newRaw = put(dir, "SOL-recheck.raw", 89);
    const verdict = put(dir, "SOL.md", 400);
    const r = sweep(dir);
    expect(r.status, r.stderr).toBe(0);
    expect(existsSync(oldRaw)).toBe(false);
    expect(existsSync(oldBrief)).toBe(false);
    expect(existsSync(newRaw)).toBe(true);
    expect(existsSync(verdict)).toBe(true);
    expect(r.stdout).toContain("2 deleted");
  });
  it("the limit is 90 days to the hour, not day 91: 90 days and an hour goes, 89 days and 23 hours stays", () => {
    const dir = repo();
    const at = (hours: number) => {
      const file = join(dir, ".planning/quick/job", `h${hours}.raw`);
      writeFileSync(file, "x");
      execFileSync("touch", ["-d", `@${Math.floor(Date.now() / 1000) - hours * 3600}`, file]);
      return file;
    };
    const over = at(90 * 24 + 1);
    const under = at(90 * 24 - 1);
    expect(sweep(dir).status).toBe(0);
    expect(existsSync(over)).toBe(false);
    expect(existsSync(under)).toBe(true);
  });
  it("never deletes a tracked file, however old", () => {
    const dir = repo();
    const tracked = put(dir, "old.raw", 200);
    execFileSync("git", ["-C", dir, "add", "-f", tracked]);
    const r = sweep(dir);
    expect(r.status, r.stderr).toBe(0);
    expect(existsSync(tracked)).toBe(true);
  });
  it("leaves an old ignored file outside .planning/quick alone", () => {
    const dir = repo();
    writeFileSync(join(dir, ".gitignore"), "*.raw\n");
    const outside = join(dir, "elsewhere.raw");
    writeFileSync(outside, "x");
    execFileSync("touch", ["-d", "200 days ago", outside]);
    expect(sweep(dir).status).toBe(0);
    expect(existsSync(outside)).toBe(true);
  });
});
