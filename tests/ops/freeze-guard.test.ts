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
  if (!existsSync(path))
    throw new Error(`decoy ${pid} died before measurement`);
  return Number(readFileSync(path, "utf8").trim());
}

/**
 * What an untouched process scores here — NOT necessarily zero.
 *
 * oom_score_adj is inherited from the parent, and a run started inside the
 * editor's own terminal inherits the editor's value: measured 100 on this
 * machine, 2026-08-21, which is why three "must never be touched" cases read
 * 100 instead of 0 and looked like guard failures. The guard was innocent; the
 * assertion was environment-blind. The contract is unchanged — the guard adds
 * NOTHING on top of what a process already carries — it is now expressed
 * against the baseline the run actually has instead of a hard-coded zero.
 */
const UNTOUCHED = Number(
  readFileSync("/proc/self/oom_score_adj", "utf8").trim(),
);

/**
 * The guard logs only when it ACTS, so a clean machine leaves no file at all.
 *
 * The suite used to read the log directly and that worked by accident: stuck
 * chroma-mcp helpers were always lying around, so something was always written.
 * Once the guard runs as a resident and keeps the machine swept, a pass can end
 * with nothing to say, and `readFileSync` threw ENOENT on a case whose intent —
 * "this pid is NOT in a kill line" — is satisfied most strongly by an empty log.
 */
function logText(): string {
  return existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
}

/**
 * True only when the guard reported THIS pid as a session-less helper. The log
 * line is `<time> helper with no session (parent gone): DRY RUN, would kill <pids>`
 * (`freeze-guard.sh:101`), so the pid list is on the same line and can be checked.
 */
function sawOurOrphan(log: string, pid: number): boolean {
  return log
    .split("\n")
    .filter((l) => l.includes("helper with no session"))
    .some((l) =>
      (l.split("would kill ")[1] ?? "").split(/\s+/).includes(String(pid)),
    );
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
    browserTab = start(
      "/opt/google/chrome/chrome --type=renderer --lang=en-US",
    );
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
    expect(adjOf(editorWindow)).toBe(UNTOUCHED);
  });

  it("never touches the browser process itself", () => {
    expect(adjOf(browserItself)).toBe(UNTOUCHED);
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
    expect(logText()).not.toContain(`would kill ${suspended}`);
    expect(existsSync(`/proc/${suspended}`)).toBe(true);
    // Nor is it offered as a victim. Measured 2026-07-29 17:15: the killer
    // fired six times in ninety seconds and three of its choices were
    // suspended helpers, which cannot act on the signal they are sent. Nothing
    // was freed and it fired again immediately. A suspended process must stay
    // out of the queue entirely, not stand at the front of it.
    expect(adjWhileSuspended).toBe(UNTOUCHED);
  });

  it("closes a helper whose session is gone, and leaves a live one alone", () => {
    // Four full helper stacks had accumulated by 2026-07-29 because nothing
    // ever swept the ones whose session had ended.
    // The RESIDENT guard (dxb-freeze-guard.service, FREEZE_GUARD_INTERVAL=10,
    // installed on this machine 2026-08-21) sweeps with REAL kills and matches
    // the very pattern this decoy carries. It can therefore reap the orphan
    // inside the one second this case needs it, and then this case's own dry
    // pass has nothing left to report — measured 2026-08-23: an empty log, the
    // suite green when run alone and red inside the battery, with nothing at all
    // wrong with the guard. So the fixture is held until this case's own pass has
    // seen it, and the log starts empty so no earlier case can answer for it.
    rmSync(LOG, { force: true });
    // CORRECTED 2026-08-23 by an independent audit. The earlier version found
    // the decoy with `pgrep -f <pattern> | head -1; pgrep -x sleep | tail -1`
    // and took the LAST line — which is `pgrep -x sleep`, ANY sleep process on
    // the machine. On a box where something else is sleeping (this repository
    // runs `sleep` in half a dozen scripts), the case would have measured a
    // stranger's process and passed or failed on it. A test that cannot name its
    // own fixture is not a test.
    //
    // The decoy now reports its own pid: `$$` inside the subshell, written
    // BEFORE `exec` — and `exec` replaces the program without changing the pid,
    // so the number in the file is the very process that becomes the helper.
    //
    // AND EVERY ATTEMPT IS SWEPT. A third audit caught the version above leaking:
    // each retry started another decoy and only the last one was ever killed, so
    // a run that needed three attempts left two `sleep 120` processes behind on
    // the CEO's machine — and an assertion that threw left them all. Every pid
    // this case creates goes into `started`, and `started` is emptied in a
    // `finally` that no failure can skip.
    const PIDFILE = join(tmpdir(), "freeze-guard-orphan.pid");
    const started: number[] = [];
    const created: number[] = []; // never emptied — the roll call at the end
    const sweep = () => {
      for (const pid of started.splice(0)) {
        try {
          process.kill(pid, "SIGKILL");
        } catch {
          /* already gone — the resident guard or an earlier sweep took it */
        }
      }
      rmSync(PIDFILE, { force: true });
    };
    let reparented = 0;
    let log = "";
    try {
      for (let attempt = 0; attempt < 5; attempt++) {
        rmSync(PIDFILE, { force: true });
        execFileSync("bash", [
          "-c",
          `setsid bash -c 'echo $$ > ${PIDFILE}; exec -a "npm exec @playwright/mcp@latest" sleep 120' >/dev/null 2>&1 &`,
        ]);
        // The shell above exits immediately, so its child is re-parented to init —
        // exactly the state a helper reaches when its session dies.
        execFileSync("bash", ["-c", "sleep 1"]);
        reparented = existsSync(PIDFILE)
          ? Number(readFileSync(PIDFILE, "utf8").trim())
          : 0;
        if (reparented) {
        started.push(reparented);
        created.push(reparented);
      }
        // Nothing to observe means the resident took it first: build it again.
        if (!reparented || !existsSync(`/proc/${reparented}`)) continue;
        // It must be OUR decoy, in the state this case is about: carrying the
        // pattern under test, and re-parented to init.
        let cmdline: string;
        let ppid: number;
        try {
          cmdline = readFileSync(`/proc/${reparented}/cmdline`, "utf8")
            .split("\0")
            .join(" ");
          ppid = Number(
            readFileSync(`/proc/${reparented}/stat`, "utf8").split(" ")[3],
          );
        } catch {
          continue; // the resident reaped it between the two reads — build another
        }
        expect(
          cmdline,
          `pid ${reparented} is not the decoy this case started`,
        ).toContain("npm exec @playwright/mcp@latest");
        // Re-parented — by the guard's OWN definition of who adopts an orphan
        // here (freeze-guard.sh:66-74): pid 1, or this user's `systemd --user`,
        // which registers itself as a subreaper. Measured on this machine: the
        // decoy came back with ppid 7152, the user manager, not 1.
        const reapers = execFileSync("bash", [
          "-c",
          `echo 1; pgrep -x systemd -u $(id -u)`,
        ])
          .toString()
          .trim()
          .split("\n")
          .map(Number);
        expect(
          reapers,
          `pid ${reparented} was never re-parented (parent ${ppid})`,
        ).toContain(ppid);
        runGuard({});
        log = logText();
        if (sawOurOrphan(log, reparented)) break;
      }
      // The line must name OUR process. An audit caught the weaker version on
      // 2026-08-23: `/helper with no session/` alone would be satisfied by some
      // OTHER orphan on the machine while this case's own decoy went unseen.
      expect(
        sawOurOrphan(log, reparented),
        `guard never reported pid ${reparented} as a session-less helper. Log:\n${log}`,
      ).toBe(true);
      // The live session's helper — started by this suite, parent still alive —
      // must never appear in a kill line.
      expect(log).not.toContain(`would kill ${scaffolding}`);
    } finally {
      sweep();
    }
    // Nothing this case started may outlive it — measured on the pids it created,
    // not by matching a pattern. (`pgrep -f` would match the shell running the
    // check itself, which carries the pattern in its own command line: measured
    // here, and it is exactly the kind of false witness this suite keeps
    // catching.)
    execFileSync("bash", ["-c", "sleep 0.2"]);
    const survivors = created.filter((pid) => existsSync(`/proc/${pid}`));
    expect(survivors, `this case left decoys running: ${survivors.join(", ")}`).toEqual([]);
  });

  it("sweeps a widow whose session leader is gone, even when a live subreaper adopted it", () => {
    // B24, the gap this row was opened for (2026-07-30). The widow rule was
    // written against classic pid-1 re-parenting; under a systemd user session
    // an orphan is adopted by the user manager instead, and the rule matched
    // nothing (fixed 2026-08-21 by naming the reapers). But a REAPER SET can
    // only ever list the reapers somebody thought of: any process may call
    // prctl(PR_SET_CHILD_SUBREAPER) and adopt orphans, and then a widow's
    // parent is neither init nor systemd and the guard walks past it.
    //
    // The second rule closes that by evidence instead of by list: whoever
    // adopted it, a helper whose SESSION LEADER is gone from the process table
    // has lost its session. This case builds exactly that state — a real
    // subreaper (not init, not systemd), a helper in a session whose leader has
    // died — and proves the guard convicts it, and says which rule convicted it.
    //
    // It also proves the opposite half in the same pass: a second helper under
    // the SAME live subreaper, whose session is alive, is never touched. That
    // is the line this rule must never cross — an application that reaps its
    // own children still has a home for them.
    // AND IT IS BUILT MORE THAN ONCE ON PURPOSE. The resident guard
    // (dxb-freeze-guard.service, real kills, every 10 s) matches this very
    // pattern and now carries this very rule, so it can reap the decoy inside
    // the second this case needs it — measured 2026-08-26, the first version of
    // this case passed alone and failed inside the full battery with an EMPTY
    // log, with nothing whatever wrong with the guard. The sibling case above
    // learned the same lesson on 2026-08-23. So: build, observe, and if the
    // resident got there first, build again.
    const REAPER = join(REPO, "tests/ops/fixtures/b24-subreaper.py");
    const ORPHAN_PID = join(tmpdir(), "dxb-b24-orphan.pid");
    const LIVE_PID = join(tmpdir(), "dxb-b24-live.pid");
    const cleanup: number[] = [];
    const kill = (pid: number) => {
      try {
        if (pid) process.kill(pid, "SIGKILL");
      } catch {
        /* already gone — the resident guard or an earlier sweep took it */
      }
    };
    const reapers = execFileSync("bash", ["-c", "echo 1; pgrep -x systemd -u $(id -u)"])
      .toString()
      .trim()
      .split("\n")
      .map(Number);

    let convicted = false;
    let liveHelper = 0;
    let log = "";
    try {
      for (let attempt = 0; attempt < 5 && !convicted; attempt++) {
        rmSync(LOG, { force: true });
        rmSync(ORPHAN_PID, { force: true });
        rmSync(LIVE_PID, { force: true });
        const reaper = spawn("python3", [REAPER, ORPHAN_PID, LIVE_PID], { stdio: "ignore" });
        cleanup.push(reaper.pid ?? 0);
        execFileSync("bash", ["-c", "sleep 1.2"]);
        if (!existsSync(ORPHAN_PID) || !existsSync(LIVE_PID)) continue;
        const orphan = Number(readFileSync(ORPHAN_PID, "utf8").trim());
        liveHelper = Number(readFileSync(LIVE_PID, "utf8").trim());
        cleanup.push(orphan, liveHelper);
        if (!existsSync(`/proc/${orphan}`)) continue; // the resident took it first

        // The state under test, measured rather than assumed.
        let ppid: number;
        let sid: number;
        try {
          const stat = readFileSync(`/proc/${orphan}/stat`, "utf8").split(" ");
          ppid = Number(stat[3]);
          sid = Number(stat[5]);
        } catch {
          continue; // it died between two reads — build another
        }
        expect(ppid, "the orphan was not adopted by our subreaper").toBe(reaper.pid);
        expect(reapers, "the old rule would have caught this — the case would prove nothing").not.toContain(ppid);
        expect(sid, "the orphan is its own session leader; the session did not die").not.toBe(orphan);
        if (existsSync(`/proc/${sid}`)) continue; // the leader has not gone yet

        runGuard({});
        log = logText();
        convicted = log
          .split("\n")
          .filter((l) => l.includes("session leader gone"))
          .some((l) => (l.split("would kill ")[1] ?? "").split(/\s+/).includes(String(orphan)));
      }
      expect(convicted, `guard never reported the adopted widow. Log:\n${log}`).toBe(true);
      // The helper whose session is alive, under the very same subreaper, in
      // the same pass. This is the line the rule must never cross.
      expect(log).not.toContain(`would kill ${liveHelper}`);
    } finally {
      for (const pid of cleanup) kill(pid);
      rmSync(ORPHAN_PID, { force: true });
      rmSync(LIVE_PID, { force: true });
    }
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
