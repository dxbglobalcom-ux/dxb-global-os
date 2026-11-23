// The bench's install step (piece 5's SPEC §6): each foundation login gets a password the step mints, kept in one
// file outside the repository, and the server is sent a SCRAM verifier only. THE FRAME — the signatures the tests
// are written against; nothing here is built yet.
import type { HostLock } from "./lock.ts";

export const FOUNDATION_LOGINS = ["os_engine", "os_executor", "os_intake", "os_reader"] as const;
export type FoundationLogin = (typeof FOUNDATION_LOGINS)[number];

/** A refusal of the install step, or of the reading of its secret file: `no-instance`, `<role> <reason>`, `no-secret`. */
export class LoginsRefused extends Error {
  readonly reason: string;
  constructor(reason: string) {
    super(`LOGINS_REFUSED ${reason}`);
    this.name = "LoginsRefused";
    this.reason = reason;
  }
}

const notBuilt = (what: string): never => {
  throw new Error(`${what}: not built (piece 5's frame)`);
};

/** The secret file's place: beside the list file, in the bench's state directory. */
export function defaultLoginsPath(): string {
  return notBuilt("defaultLoginsPath");
}

/** Pure. PostgreSQL's stored form of a SCRAM-SHA-256 verifier for an ASCII password. */
export function scramVerifier(password: string, salt: Uint8Array, iterations: number = 4096): string {
  void password, void salt, void iterations;
  return notBuilt("scramVerifier");
}

/** SPEC §6, steps 1–4, under a held host lock. */
export async function setLogins(lock: HostLock): Promise<{ sysid: string; logins: readonly FoundationLogin[] }> {
  void lock;
  return notBuilt("setLogins");
}

/** The address a resident service or a test logs in with, read from the secret file; `LoginsRefused("no-secret")` otherwise. */
export function loginConnectionString(role: FoundationLogin, loginsPath?: string): string {
  void role, void loginsPath;
  return notBuilt("loginConnectionString");
}
