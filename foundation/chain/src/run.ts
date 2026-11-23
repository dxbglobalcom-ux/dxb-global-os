// The run (SPEC §6), in its order: the disk, the lock, the ledger, the comparison, the bootstrap, each pending file.
import { performance } from "node:perf_hooks";
import { DatabaseError } from "pg";
import { compare } from "./compare.ts";
import { readChain } from "./disk.ts";
import type { ChainFile } from "./disk.ts";
import { makeTheLedger, readLedger, writeRow } from "./ledger.ts";
import { underTheLock } from "./lock.ts";
import type { Outcome } from "./outcome.ts";
import { inASession, inOneTransaction } from "./session.ts";
import type { Target } from "./session.ts";

type Input = { target: Target; root: string; lockWaitSeconds?: number };

/** Where a run says what it is doing. The library says it to nobody; the command, on stderr. */
export type Say = (line: string) => void;

// The file's text reaches the server as data and is run there by plpgsql (SPEC §3, measured): so run, a text
// that opens or closes a transaction is refused by the server in the act and leaves nothing — the statements
// before the offending one included. The same text sent as a plain query is not safe.
const HAND_OVER = "select pg_catalog.set_config('os_chain.file', $1, true) is not null";
const EXECUTE = "do $w$ begin execute pg_catalog.current_setting('os_chain.file'); end $w$";

/**
 * One file, in a session of its own — a session outlives a file, and what one left there the next must not
 * meet — and in one transaction with its ledger row. Answers the server's message when the server refuses
 * the file, at whichever statement: nothing of the file is left then. Any other failure is thrown on.
 */
function apply(target: Target, file: ChainFile): Promise<"applied" | { refusedWith: string }> {
  return inASession(target, async (conn) => {
    try {
      await inOneTransaction(conn, async () => {
        // The row first, the text after it, both in this one transaction: nothing the file does to its
        // session — another role, a read-only transaction, a search path — can reach the writing of its
        // own row, and a file the server refuses takes the row with it.
        await writeRow(conn, { file: file.name, kind: "schema", hash: file.hash });
        await conn.query(HAND_OVER, [file.text]);
        await conn.query(EXECUTE);
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
  const { target, root, lockWaitSeconds } = input;

  // 1. The disk — before any connection is opened.
  const disk = readChain(root);
  if (disk.offences.length > 0) return { state: "offences", offences: disk.offences };
  say(`disk: ${disk.files.length} files`);

  // 2. The lock — from here to the run's end, however it ends.
  return underTheLock(target, lockWaitSeconds, async (assertHeld) => {
    // 3. The ledger, read under the lock.
    const ledger = await inASession(target, readLedger);
    say(ledger === undefined ? "ledger: none stands" : `ledger: ${ledger.length} files`);

    // 4. The comparison. Nothing has been written when it stops the run — not the ledger's bootstrap either.
    const { offences, pending } = compare(disk.files, ledger ?? []);
    if (offences.length > 0) return { state: "offences", offences };
    say(`pending: ${pending.length} files`);

    // 5. The bootstrap, when no ledger stands.
    if (ledger === undefined) {
      await assertHeld();
      await inASession(target, makeTheLedger);
      say("ledger: made");
    }

    // 6. Each pending file, in order. 7. One that fails stops the run; what committed before it stays.
    const applied: string[] = [];
    for (const file of pending) {
      await assertHeld();
      const started = performance.now();
      say(`${file.name} …`);
      const ended = await apply(target, file);
      const seconds = ((performance.now() - started) / 1_000).toFixed(1);
      if (ended !== "applied") {
        say(`${file.name} — failed after ${seconds} s`);
        return { state: "file-failed", file: file.name, message: ended.refusedWith, applied };
      }
      say(`${file.name} — ${seconds} s`);
      applied.push(file.name);
    }
    // Counted, not read again: under the lock no other run writes a row.
    return { state: "applied", applied, standing: (ledger?.length ?? 0) + applied.length };
  });
}

/** SPEC §6. */
export function applyChain(input: Input): Promise<Outcome> {
  return runChain(input, () => undefined);
}
