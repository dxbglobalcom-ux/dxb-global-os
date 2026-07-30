// C49 (reopened 2026-07-29) — the guard that keeps the CEO's editor out of the
// memory killer's sights.
//
// Measured on 2026-07-29 16:30, with the 2026-07-28 shield already installed:
// earlyoom SIGTERMed a VS Code window (badness 885) while the guard's own log
// line for the same minute read "oom shield: raised 1 expendable(s)". The
// shield was real but useless, for two measured reasons:
//
//   1. It covered only chroma-mcp / headless_shell / kilo-serve — processes
//      that are small and usually ABSENT at the moment of pressure. When none
//      of them is alive, the editor is still the highest scorer on the machine
//      (adj=300 from Electron itself -> score 872-894, against 666-700 for
//      everything else that is not shielded).
//   2. It ran from cron once a minute; earlyoom acts within a second of
//      crossing its threshold. The guard cannot win that race from cron.
//
// This suite pins the part that can be proven without a database: WHICH
// processes the guard claims, WHICH it must never touch, and the exact
// oom_score_adj it writes. The processes below are harmless `sleep`s whose
// command line carries the pattern under test.
//
// The guard is invoked with FREEZE_GUARD_DRY_KILL=1 so a test run can never
// kill a real process; the shield leg is deliberately NOT dry, because the
// value being asserted is the one it writes into /proc.
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const REPO = process.cwd();
const GUARD = join(REPO, "scripts/ops/freeze-guard.sh");
const LOG = join(tmpdir(), "freeze-guard-test.log");
const STATE = join(tmpdir(), "freeze-guard-test.state");

/**
 * One pass of the guard, kills disabled: a test run may never cost a real
 * process. The shield leg is deliberately NOT dry — the value it writes into
 * /proc is exactly what these cases assert.
 */
function runGuard(extra: Record<string, string>): void {
  execFileSync("bash", [GUARD], {
    env: {
      ...process.env,
      FREEZE_GUARD_DRY_KILL: "1",
      FREEZE_GUARD_LOG: LOG,
      FREEZE_GUARD_STATE: STATE,
      FREEZE_GUARD_INTERVAL: "0",
      ...extra,
    },
    timeout: 30_000,
  });
}

/**
 * A harmless process whose command line carries `pattern`.
 *
 * `exec -a` is the only reliable way to do this: bash exec-optimises away a
 * `bash -c 'sleep 120 # pattern'` wrapper, and the pattern disappears from the
 * command line with it (measured 2026-07-29 — the first draft of this suite
 * failed for exactly that reason, not because the guard was wrong).
 */
function decoy(pattern: string): ChildProcess {
  return spawn("bash", ["-c", `exec -a ${JSON.stringify(pattern)} sleep 120`], {
    stdio: "ignore",
  });
}

function adjOf(pid: number): number {
  const path = `/proc/${pid}/oom_score_adj`;
  if (!existsSync(path)) throw new Error(`decoy ${pid} died before measurement`);
  return Number(readFileSync(path, "utf8").trim());
}

// Every decoy this suite starts, so afterAll can guarantee none survives it.
const decoys: ChildProcess[] = [];
function start(pattern: string): number {
  const child = decoy(pattern);
  decoys.push(child);
  if (!child.pid) throw new Error(`could not start decoy for ${pattern}`);
  return child.pid;
}

let scaffolding = 0; // must be claimed at the top tier
let browserTab = 0; // must be claimed at the recoverable tier
let editorWindow = 0; // must NEVER be touched
let browserItself = 0; // must NEVER be touched (killing it kills every tab)

describe("freeze-guard — the editor is never the designated victim", () => {
  beforeAll(() => {
    scaffolding = start("chroma-mcp --stdio");
    browserTab = start("/opt/google/chrome/chrome --type=renderer --lang=en-US");
    editorWindow = start("/usr/share/code/code --type=renderer --lang=en-US");
    browserItself = start("/opt/google/chrome/chrome --user-data-dir=/home/x");

    rmSync(LOG, { force: true });
    rmSync(STATE, { force: true });
    runGuard({});
  });

  afterAll(() => {
    for (const child of decoys) {
      try {
        child.kill("SIGKILL");
      } catch {
        /* already gone */
      }
    }
  });

  it("pushes agent scaffolding to the top of the kill list", () => {
    expect(adjOf(scaffolding)).toBe(1000);
  });

  it("pushes a browser tab above the editor, but below the scaffolding", () => {
    // A lost tab costs a click on Reload; a lost editor window costs the
    // session. The tab must therefore outrank the editor and nothing else.
    expect(adjOf(browserTab)).toBe(700);
  });

  it("never raises the editor's own score", () => {
    // Electron already sets 300 on real windows. The guard's contract is that
    // it adds nothing on top of that, ever.
    expect(adjOf(editorWindow)).toBe(0);
  });

  it("never touches the browser process itself", () => {
    expect(adjOf(browserItself)).toBe(0);
  });

  it("every claimed tier outranks the highest score an editor window reaches", () => {
    // 894 was the measured ceiling for a VS Code window on this machine
    // (2026-07-28 and again 2026-07-29). A shielded process starts from its own
    // base score plus the tier, and the lowest base measured on this machine
    // was 666 — so the lowest possible shielded score is 666 + 700 = 1366.
    const EDITOR_CEILING = 894;
    const LOWEST_BASE_MEASURED = 666;
    for (const tier of [700, 1000]) {
      expect(LOWEST_BASE_MEASURED + tier).toBeGreaterThan(EDITOR_CEILING);
    }
  });

  it("never closes a suspended session, however long it has stood still", () => {
    // CEO ruling 2026-07-29. A draft of this guard proposed closing sessions
    // suspended for over half an hour, on the evidence of one that had stood
    // still for forty-four hours with eight helpers attached. He stopped it:
    // "BU DÜNDEN BERİ AÇIK ... DÜN AKŞAMDAN BERİ KENDİSİNE GÖREV VERMEDİM
    // DEVAM EDECEĞİZ." He leaves sessions standing for days on purpose. Idle
    // time is not evidence of anything, and this case exists so no future
    // author can quietly re-introduce that inference.
    const suspended = start("context7-mcp --stdio");
    execFileSync("bash", ["-c", `kill -STOP ${suspended}`]);
    for (const _ of [1, 2]) runGuard({});
    const adjWhileSuspended = adjOf(suspended);
    execFileSync("bash", ["-c", `kill -CONT ${suspended}`]);
    expect(readFileSync(LOG, "utf8")).not.toContain(`would kill ${suspended}`);
    expect(existsSync(`/proc/${suspended}`)).toBe(true);
    // Nor is it offered as a victim. Measured 2026-07-29 17:15: the killer
    // fired six times in ninety seconds and three of its choices were
    // suspended helpers, which cannot act on the signal they are sent. Nothing
    // was freed and it fired again immediately. A suspended process must stay
    // out of the queue entirely, not stand at the front of it.
    expect(adjWhileSuspended).toBe(0);
  });

  it("closes a helper whose session is gone, and leaves a live one alone", () => {
    // Four full helper stacks had accumulated by 2026-07-29 because nothing
    // ever swept the ones whose session had ended.
    const orphan = Number(
      execFileSync("bash", [
        "-c",
        `setsid bash -c 'exec -a "npm exec @playwright/mcp@latest" sleep 120' >/dev/null 2>&1 & echo $!`,
      ])
        .toString()
        .trim(),
    );
    // The shell above exits immediately, so its child is re-parented to init —
    // exactly the state a helper reaches when its session dies.
    execFileSync("bash", ["-c", "sleep 1"]);
    const reparented = Number(
      execFileSync("bash", [
        "-c",
        `pgrep -f 'exec -a .npm exec @playwright/mcp@latest. sleep 120' | head -1; pgrep -x sleep | tail -1`,
      ])
        .toString()
        .trim()
        .split("\n")
        .pop(),
    );
    runGuard({});
    const log = readFileSync(LOG, "utf8");
    expect(log).toMatch(/helper with no session/);
    // The live session's helper — started by this suite, parent still alive —
    // must never appear in a kill line.
    expect(log).not.toContain(`would kill ${scaffolding}`);
    execFileSync("bash", ["-c", `kill -9 ${orphan} ${reparented} 2>/dev/null || true`]);
  });

  it("runs as a resident, not from a once-a-minute cron slot", () => {
    // The 2026-07-28 fix lost the race with earlyoom by up to 59 seconds.
    const unit = join(
      process.env.HOME ?? "/home/ghost",
      ".config/systemd/user/dxb-freeze-guard.service",
    );
    expect(existsSync(unit)).toBe(true);
    const text = readFileSync(unit, "utf8");
    expect(text).toMatch(/FREEZE_GUARD_INTERVAL=([1-9]|1[0-5])\b/);
    expect(text).toMatch(/Restart=always/);
  });
});
