// node foundation/bench/src/cli.ts <up|down|fresh|status|logins>
//
// Progress goes to stderr as the steps run; the last line on stdout is the
// answer of SPEC §4's table, and the exit code is the one beside it — for
// `logins`, piece 5's SPEC §6.
import { performance } from "node:perf_hooks";
import { BENCH, acquireHostLock, answerOf, destroyInstance, instanceStatus, makeInstance, setLogins } from "./index.ts";
import { oneLine, stopTheWork, toldToStopBy } from "./run.ts";

type Answer = { line: string; exit: number };

/** Told to stop, the command ends with a plain exit code — 128 and the signal's number (SPEC §5b.2). */
const EXIT_WHEN_STOPPED = { SIGINT: 130, SIGTERM: 143 } as const;

const CALLS = ["up", "down", "fresh", "status", "logins"] as const;
type Call = (typeof CALLS)[number];

/** DXB_FOUNDATION_LOCK_WAIT: how long to wait for the host lock — a positive integer of seconds, or unset for not at all. */
function lockWaitSeconds(): number | undefined {
  const written = process.env.DXB_FOUNDATION_LOCK_WAIT;
  if (written === undefined) return undefined;
  if (!/^[1-9]\d*$/.test(written)) {
    throw new Error(`DXB_FOUNDATION_LOCK_WAIT must be a positive integer of seconds, not "${written}"`);
  }
  return Number(written);
}

async function status(): Promise<Answer> {
  const found = await instanceStatus();
  if (found.state === "standing") return { line: `INSTANCE_STANDING sysid=${found.record.sysid}`, exit: 0 };
  if (found.state === "absent") return { line: "INSTANCE_ABSENT", exit: 0 };
  return { line: `INSTANCE_FOREIGN ${oneLine(found.detail)}`, exit: 5 };
}

/**
 * `up`, `down`, `fresh` and `logins` under one hold of the host lock; `fresh` is a `down` and then an `up`.
 * From the moment it holds the lock the command is stopped in order: SIGINT or
 * SIGTERM stops the child that makes or changes the stack, the make then removes
 * what it made, and the lock is let go last. A removal is never cut short.
 */
async function underTheHostLock(call: Exclude<Call, "status">): Promise<Answer> {
  const started = performance.now();
  const lock = acquireHostLock({ waitSeconds: lockWaitSeconds() });
  for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => stopTheWork(signal));
  try {
    if (call === "logins") {
      const { sysid, logins } = await setLogins(lock);
      return { line: `LOGINS_SET logins=${logins.length} sysid=${sysid}`, exit: 0 };
    }
    if (call !== "up") {
      const removal = await destroyInstance(lock);
      if (call === "down") return { line: removal === "destroyed" ? "INSTANCE_DOWN" : "INSTANCE_ABSENT", exit: 0 };
    }
    const record = await makeInstance(lock);
    const seconds = ((performance.now() - started) / 1_000).toFixed(1);
    return { line: `INSTANCE_UP sysid=${record.sysid} db=${BENCH.bind}:${BENCH.dbPort} seconds=${seconds}`, exit: 0 };
  } finally {
    lock.release();
  }
}

async function answer(call: string | undefined): Promise<Answer> {
  const known = CALLS.find((name) => name === call);
  if (known === undefined) return { line: `usage: cli.ts <${CALLS.join("|")}>`, exit: 1 };
  try {
    return await (known === "status" ? status() : underTheHostLock(known));
  } catch (failure) {
    const refusal = answerOf(failure);
    // A refusal is said in one line; anything else is shown whole to whoever reads the run.
    if (refusal.exit === 1) console.error(failure);
    else process.stderr.write(`[bench] ${oneLine(String(failure))}\n`);
    return refusal;
  }
}

const { line, exit } = await answer(process.argv[2]);
const stoppedBy = toldToStopBy();
console.log(line);
process.exitCode = stoppedBy === undefined ? exit : EXIT_WHEN_STOPPED[stoppedBy];
