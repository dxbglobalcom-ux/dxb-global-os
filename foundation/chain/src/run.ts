// The run (SPEC §6), in its order: the disk, the lock, the ledger, the comparison, the bootstrap, each pending file —
// and then the two passes (piece 4's SPEC §6), each when its directory stands.
import { performance } from "node:perf_hooks";
import { DatabaseError } from "pg";
import { compare } from "./compare.ts";
import { readChain } from "./disk.ts";
import type { ChainFile } from "./disk.ts";
import { functionsPass } from "./functions-pass.ts";
import { makeTheLedger, readLedger, writeRow } from "./ledger.ts";
import { underTheLock } from "./lock.ts";
import { inOrder } from "./outcome.ts";
import type { Outcome } from "./outcome.ts";
import { readPasses } from "./passes.ts";
import { referencePass } from "./reference-pass.ts";
import { executeText, inOneTransaction, sessionsOn } from "./session.ts";
import type { InASession, Target } from "./session.ts";

type Input = { target: Target; root: string; lockWaitSeconds?: number };

/** Where a run says what it is doing. The library says it to nobody; the command, on stderr. */
export type Say = (line: string) => void;

/** The two passes, in the order a run makes them (piece 4's SPEC §6, steps 8 and 9). */
const PASSES = [
  ["functions", functionsPass],
  ["reference", referencePass],
] as const;

/**
 * The disk as a run reads it: `schema/` and, each when it stands, the two passes' directories — the offences of
 * all three as one list (piece 4's SPEC §6). No connection. Throws as `readChain` does.
 */
function readDisk(root: string) {
  const chain = readChain(root);
  const passes = readPasses(root);
  return { ...chain, ...passes, offences: inOrder([...chain.offences, ...passes.offences]) };
}

/**
 * One file, in a session of its own — a session outlives a file, and what one left there the next must not
 * meet — and in one transaction with its ledger row, written at `position`. Answers the server's message when
 * the server refuses the file, at whichever statement: nothing of the file is left then. Any other failure is
 * thrown on — the ledger's refusal of the row among them (SPEC §12.1), before the text is sent.
 */
function apply(inASession: InASession, file: ChainFile, position: number): Promise<"applied" | { refusedWith: string }> {
  return inASession(async (conn) => {
    try {
      await inOneTransaction(conn, async () => {
        // The row first, the text after it, both in this one transaction: nothing the file does to its
        // session — another role, a read-only transaction, a search path — can reach the writing of its
        // own row, and a file the server refuses takes the row with it.
        await writeRow(conn, { position, file: file.name, kind: "schema", hash: file.hash });
        await executeText(conn, file.text);
      });
      return "applied";
    } catch (failure) {
      if (failure instanceof DatabaseError) return { refusedWith: failure.message };
      throw failure;
    }
  });
}

/** `applyChain`, saying each step to `say` as it goes. */
export async function runChain(input: Input, say: Say): Promise<Outcome> {
  // The input is copied here, before the run first waits for anything (SPEC §12.3): what the caller does to its
  // object afterwards moves nothing of the run.
  const { root, lockWaitSeconds } = input;
  const inASession = sessionsOn(input.target);

  // 1. The disk — before any connection is opened. This reading only answers early: a disk offence, or no chain.
  const early = readDisk(root);
  if (early.offences.length > 0) return { state: "offences", offences: early.offences };

  // 2. The lock — from here to the run's end, however it ends.
  return underTheLock(inASession, lockWaitSeconds, async (assertHeld) => {
    // The disk again, as it stands under the lock (SPEC §12.5): a run may have waited here while another hand
    // changed the disk, so this reading is the one compared and applied — and it ends the run as the first would.
    const disk = readDisk(root);
    if (disk.offences.length > 0) return { state: "offences", offences: disk.offences };
    say(`disk: ${disk.files.length} files`);

    // 3. The ledger, read under the lock.
    const ledger = await inASession(readLedger);
    say(ledger === undefined ? "ledger: none stands" : `ledger: ${ledger.length} files`);

    // 4. The comparison. Nothing has been written when it stops the run — not the ledger's bootstrap either.
    const { offences, pending } = compare(disk.files, ledger ?? []);
    if (offences.length > 0) return { state: "offences", offences };
    say(`pending: ${pending.length} files`);

    // 5. The bootstrap, when no ledger stands.
    if (ledger === undefined) {
      await assertHeld();
      await inASession(makeTheLedger);
      say("ledger: made");
    }

    // 6. Each pending file, in order. 7. One that fails stops the run; what committed before it stays.
    // A file's row goes to the position the run says (SPEC §12.1): after row 0, the files that stood when the
    // ledger was read and the files applied since. A row another hand put there meanwhile ends the run.
    const stood = ledger?.length ?? 0;
    const applied: string[] = [];
    for (const file of pending) {
      await assertHeld();
      const started = performance.now();
      say(`${file.name} …`);
      const ended = await apply(inASession, file, 1 + stood + applied.length);
      const seconds = ((performance.now() - started) / 1_000).toFixed(1);
      if (ended !== "applied") {
        say(`${file.name} — failed after ${seconds} s`);
        return { state: "file-failed", file: file.name, message: ended.refusedWith, applied };
      }
      say(`${file.name} — ${seconds} s`);
      applied.push(file.name);
    }

    // 8. The functions pass, 9. the reference pass — each when its directory stands. One that does not end green
    // ends the run: what committed before it stays — the schema files, and the functions pass before the
    // reference pass — and a functions pass that failed is not followed by the reference pass. A pass writes no
    // ledger row, so the lock is asked before it and again by the pass itself, before its commit (SPEC §12.10).
    const ran: { functions?: number; reference?: number } = {};
    for (const [pass, make] of PASSES) {
      const files = disk[pass];
      if (files === undefined) continue;
      await assertHeld();
      say(`${pass} …`);
      const ended = await make(inASession, files, assertHeld);
      if (typeof ended !== "number") return { ...ended, applied };
      say(`${pass}: ${ended} files`);
      ran[pass] = ended;
    }

    // 10. The schema rows are counted, not read again: under the lock no other run writes a row. A pass's count
    // is there only when the pass ran.
    return { state: "applied", applied, standing: stood + applied.length, ...ran };
  });
}

/** SPEC §6. */
export function applyChain(input: Input): Promise<Outcome> {
  return runChain(input, () => undefined);
}
