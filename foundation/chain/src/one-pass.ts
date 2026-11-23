// What the two passes share (piece 4's SPEC §6 steps 8–9): a session of its own, one transaction, and an ending that leaves nothing of the pass.
import { DatabaseError } from "pg";
import type { Client } from "pg";
import type { Offence } from "./outcome.ts";
import { inOneTransaction } from "./session.ts";
import type { InASession } from "./session.ts";

/** How a pass ends when it does not end green: the run's outcome then, but for the schema files the run applied before it. */
export type NotGreen =
  | { state: "pass-failed"; pass: "functions" | "reference"; file: string; message: string }
  | { state: "manifest"; offences: Offence[] };

/** Carries a pass's ending out of its transaction: thrown inside it, so that the transaction is rolled back whole. */
class Ended extends Error {
  readonly how: NotGreen;

  constructor(how: NotGreen) {
    super(`the pass ended: ${how.state}`);
    this.name = "Ended";
    this.how = how;
  }
}

/** Ends the pass here, not green. For the work of `inOnePass` alone: nothing else catches it. */
export function endThePass(how: NotGreen): never {
  throw new Ended(how);
}

/**
 * `statement`, which is a file's — its text, or a statement the runner made of it. The server's refusal of it ends
 * the pass `pass-failed` at that file with the server's message. Any other failure is thrown on.
 */
export async function asTheFiles<T>(pass: "functions" | "reference", file: string, statement: () => Promise<T>): Promise<T> {
  try {
    return await statement();
  } catch (failure) {
    if (failure instanceof DatabaseError) endThePass({ state: "pass-failed", pass, file, message: failure.message });
    throw failure;
  }
}

/**
 * `work` as one pass: in a session of its own — the guard and the run's identity asked of it as of every session,
 * and nothing in it that a file's session left — and in one transaction. Answers how the pass ended when the work
 * ended it (`endThePass`, `asTheFiles`): the transaction is rolled back then, so a pass that fails leaves nothing of
 * itself. Answers nothing when the pass is green and committed. A failure of the runner's own — a catalogue it
 * could not read, a commit the server refused — is no ending of the contract: rolled back as well, and thrown on.
 */
export function inOnePass(inASession: InASession, work: (conn: Client) => Promise<void>): Promise<NotGreen | undefined> {
  return inASession(async (conn) => {
    try {
      await inOneTransaction(conn, () => work(conn));
      return undefined;
    } catch (failure) {
      if (failure instanceof Ended) return failure.how;
      throw failure;
    }
  });
}
