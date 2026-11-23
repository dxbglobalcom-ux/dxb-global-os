// The bench's install step (piece 5's SPEC §6): each foundation login gets a password the step mints, kept in one
// file outside the repository, and the server is sent a SCRAM verifier only — never the password, never in a
// statement's text. The password lives in this process's memory and in the secret file, nowhere else: no argument,
// no variable of the environment, no output and no error's message carries it.
import { createHash, createHmac, pbkdf2Sync, randomBytes } from "node:crypto";
import { closeSync, constants, fchmodSync, fsyncSync, openSync, readFileSync, renameSync, rmSync, writeSync } from "node:fs";
import { join } from "node:path";
import { Client, DatabaseError } from "pg";
import { connectionString, makeTheStateDirectory, stateDirectory } from "./bench.ts";
import { assertFoundationTarget } from "./guard.ts";
import { instanceStatus } from "./instance.ts";
import { assertTheHostLock } from "./lock.ts";
import type { HostLock } from "./lock.ts";
import { step } from "./run.ts";

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

/** The secret file's place: `logins.json` beside the list file, in the bench's state directory (mode 700). */
export function defaultLoginsPath(): string {
  return join(stateDirectory, "logins.json");
}

const base64 = (bytes: Uint8Array): string => Buffer.from(bytes).toString("base64");

/**
 * Pure. PostgreSQL's stored form of a SCRAM-SHA-256 verifier (RFC 5802, RFC 7677):
 * `SCRAM-SHA-256$<iterations>:<salt>$<StoredKey>:<ServerKey>`, each part base64. For an ASCII password, which
 * SASLprep leaves as it is; any other would need the server's normalisation, which is not done here.
 */
export function scramVerifier(password: string, salt: Uint8Array, iterations: number = 4096): string {
  if (!/^[\x00-\x7f]*$/.test(password)) throw new RangeError("scramVerifier computes the verifier of an ASCII password only");
  const salted = pbkdf2Sync(Buffer.from(password, "utf8"), salt, iterations, 32, "sha256");
  const clientKey = createHmac("sha256", salted).update("Client Key").digest();
  const storedKey = createHash("sha256").update(clientKey).digest();
  const serverKey = createHmac("sha256", salted).update("Server Key").digest();
  return `SCRAM-SHA-256$${iterations}:${base64(salt)}$${base64(storedKey)}:${base64(serverKey)}`;
}

/** What the secret file holds (SPEC §6 step 3): the instance it was written for, and a password by login. */
type Secrets = { sysid: string; logins: Partial<Record<FoundationLogin, string>> };

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isLogin = (name: string): name is FoundationLogin => FOUNDATION_LOGINS.some((login) => login === name);

/**
 * The secret file, read whole — or nothing when it is missing, unreadable, not JSON or not of SPEC §6's shape:
 * exactly `sysid`, a cluster identifier, and `logins`, whose every key is a foundation login and every value a
 * non-empty text (SPEC §8a.15). A file of three logins is of the shape; it does not hold the fourth.
 */
function readSecrets(path: string): Secrets | undefined {
  let content: unknown;
  try {
    content = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
  if (!isObject(content) || Object.keys(content).sort().join(",") !== "logins,sysid") return undefined;
  const { sysid, logins } = content;
  if (typeof sysid !== "string" || !/^\d+$/.test(sysid) || !isObject(logins)) return undefined;
  const wellFormed = Object.entries(logins).every(([name, password]) => isLogin(name) && typeof password === "string" && password !== "");
  return wellFormed ? { sysid, logins: logins as Secrets["logins"] } : undefined;
}

/**
 * The address a resident service or a test logs in with: the bench's own, with the role as its user and the file's
 * password as its password. LoginsRefused("no-secret") when the file is missing, malformed or does not hold the
 * role. Never printed by the bench itself.
 */
export function loginConnectionString(role: FoundationLogin, loginsPath: string = defaultLoginsPath()): string {
  const password = readSecrets(loginsPath)?.logins[role];
  if (password === undefined) throw new LoginsRefused("no-secret");
  const address = new URL(connectionString());
  // The URL's own setters percent-encode what an address may not hold as it is.
  address.username = role;
  address.password = password;
  return address.href;
}

// The four logins as the catalogue has them (SPEC §6 step 2) — a role that does not stand answers no row.
const THE_LOGINS = `
select r.rolname::pg_catalog.text as name, r.rolcanlogin as login, r.rolsuper as superuser,
       r.rolcreaterole as createrole, r.rolcreatedb as createdb, r.rolreplication as replication,
       r.rolbypassrls as bypassrls,
       exists (select 1 from pg_catalog.pg_auth_members m where m.member = r.oid) as member
  from pg_catalog.pg_roles r
 where r.rolname::pg_catalog.text = any ($1::pg_catalog.text[])`;

type Login = {
  name: string;
  login: boolean;
  superuser: boolean;
  createrole: boolean;
  createdb: boolean;
  replication: boolean;
  bypassrls: boolean;
  member: boolean;
};

/** A login's first fault, by SPEC §6 step 2's order — or nothing when it is what the chain made. */
function faultOf(login: Login | undefined): string | undefined {
  if (login === undefined) return "missing";
  if (!login.login) return "not-a-login";
  const faults = ["superuser", "createrole", "createdb", "replication", "bypassrls", "member"] as const;
  return faults.find((fault) => login[fault]);
}

/** All four read and judged before anything is minted, written or set: the first that is not as the chain made it refuses the step. */
async function assertTheChainsLogins(conn: Client): Promise<void> {
  const { rows } = await conn.query<Login>(THE_LOGINS, [[...FOUNDATION_LOGINS]]);
  for (const name of FOUNDATION_LOGINS) {
    const fault = faultOf(rows.find((row) => row.name === name));
    if (fault !== undefined) throw new LoginsRefused(`${name} ${fault}`);
  }
}

/** 32 bytes of the system's random source, base64url without padding: 43 characters. */
const minted = (): string => randomBytes(32).toString("base64url");

/**
 * Replaces the secret file whole, as the list file is replaced: written and synced beside it, then renamed over it.
 * The file beside it is made new (never one that stood) with mode 600 before a byte is written — its mode is set
 * on the open descriptor, so no mask of the process makes it other — and it is removed when the writing fails.
 */
function writeSecrets(path: string, secrets: Secrets): void {
  makeTheStateDirectory();
  const beside = `${path}.${randomBytes(6).toString("hex")}.writing`;
  const descriptor = openSync(beside, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try {
    try {
      fchmodSync(descriptor, 0o600);
      writeSync(descriptor, `${JSON.stringify(secrets, null, 2)}\n`);
      fsyncSync(descriptor);
    } finally {
      closeSync(descriptor);
    }
    renameSync(beside, path);
  } catch (failure) {
    rmSync(beside, { force: true });
    throw failure;
  }
}

/**
 * The passwords the step gives the four (SPEC §6 step 3): the file's, when it stands, is of the shape, names this
 * instance and holds all four — the file is then not written; otherwise four new ones, and the file replaced.
 */
function passwordsKeptOrWritten(sysid: string): Record<FoundationLogin, string> {
  const path = defaultLoginsPath();
  const standing = readSecrets(path);
  const { os_engine, os_executor, os_intake, os_reader } = standing?.logins ?? {};
  if (standing?.sysid === sysid && os_engine && os_executor && os_intake && os_reader) return { os_engine, os_executor, os_intake, os_reader };
  const passwords = { os_engine: minted(), os_executor: minted(), os_intake: minted(), os_reader: minted() };
  writeSecrets(path, { sysid, logins: passwords });
  return passwords;
}

// A verifier reaches the server as a parameter, into a transaction-local setting, and is applied by `alter role`
// inside a `do` block (SPEC §3, measured — M7): the statements' texts are these constants, and the server's log,
// which writes DDL statements as they are sent, sees no verifier. The role travels the same way and is quoted there.
const HAND_OVER = "select pg_catalog.set_config('os_install.role', $1, true), pg_catalog.set_config('os_install.verifier', $2, true)";
const APPLY = `do $apply$ begin execute pg_catalog.format('alter role %I password %L', pg_catalog.current_setting('os_install.role'), pg_catalog.current_setting('os_install.verifier')); end $apply$`;

/**
 * Each login's verifier, of a new 16-byte salt, set in one transaction for all four (SPEC §6 step 4). The server's
 * refusal is passed on as its primary message alone, in an error of its own: the error the driver gives carries the
 * failing `alter role`'s context — the verifier with it (SPEC §3).
 */
async function setTheVerifiers(conn: Client, passwords: Record<FoundationLogin, string>): Promise<void> {
  await conn.query("begin");
  try {
    for (const role of FOUNDATION_LOGINS) {
      await conn.query(HAND_OVER, [role, scramVerifier(passwords[role], randomBytes(16))]);
      await conn.query(APPLY);
    }
    await conn.query("commit");
  } catch (failure) {
    await conn.query("rollback").catch(() => undefined);
    if (failure instanceof DatabaseError) throw new Error(`the server refused a login's verifier: ${failure.message}`);
    throw failure;
  }
}

const CONNECT_MS = 10_000;

/**
 * SPEC §6 steps 1–4, under a held host lock: an instance stands; on one connection to it, guarded before its first
 * statement, the four logins are what the chain made; the file holds their passwords before the server is sent
 * anything of them; and the server is sent a verifier of each.
 */
export async function setLogins(lock: HostLock): Promise<{ sysid: string; logins: readonly FoundationLogin[] }> {
  assertTheHostLock(lock);
  if ((await instanceStatus()).state !== "standing") throw new LoginsRefused("no-instance");

  const conn = new Client({ connectionString: connectionString(), connectionTimeoutMillis: CONNECT_MS });
  // A connection lost while it idles shows in the next query's rejection; without a listener it would end the process.
  conn.on("error", () => undefined);
  await conn.connect();
  try {
    const { sysid } = await assertFoundationTarget(conn);
    await assertTheChainsLogins(conn);
    assertTheHostLock(lock);
    const passwords = passwordsKeptOrWritten(sysid);
    assertTheHostLock(lock);
    await step("the logins' verifiers", () => setTheVerifiers(conn, passwords));
    return { sysid, logins: FOUNDATION_LOGINS };
  } finally {
    await conn.end();
  }
}
