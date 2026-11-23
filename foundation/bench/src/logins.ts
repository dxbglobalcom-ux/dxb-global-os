// The bench's install step (piece 5's SPEC §6): each foundation login gets a password the step mints, kept in one
// file outside the repository, and the server is sent a SCRAM verifier only — never the password, never in a
// statement's text. The password lives in this process's memory and in the file of passwords, nowhere else: no
// argument, no variable of the environment, no output and no error's message carries it. The file's reading and
// writing are `the-logins-file.ts`'s.
import { createHash, createHmac, pbkdf2Sync, randomBytes } from "node:crypto";
import { Client, DatabaseError } from "pg";
import { connectionString } from "./bench.ts";
import { assertFoundationTarget } from "./guard.ts";
import { instanceStatus } from "./instance.ts";
import { assertTheHostLock } from "./lock.ts";
import type { HostLock } from "./lock.ts";
import { step } from "./run.ts";
import { FOUNDATION_LOGINS, defaultLoginsPath, passwordsKeptOrMinted, readTheLogins } from "./the-logins-file.ts";
import type { FoundationLogin } from "./the-logins-file.ts";

export { FOUNDATION_LOGINS, defaultLoginsPath };
export type { FoundationLogin };

/** A refusal of the install step, or of the reading of its file: `no-instance`, `<role> <reason>`, `no-secret`. */
export class LoginsRefused extends Error {
  readonly reason: string;
  constructor(reason: string) {
    super(`LOGINS_REFUSED ${reason}`);
    this.name = "LoginsRefused";
    this.reason = reason;
  }
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

/**
 * The address a resident service or a test logs in with: the bench's own, with the role as its user and the file's
 * password as its password. LoginsRefused("no-secret") when the file does not stand (SPEC §11 item 2) or does not
 * hold the role. Never printed by the bench itself.
 */
export function loginConnectionString(role: FoundationLogin, loginsPath: string = defaultLoginsPath()): string {
  const password = readTheLogins(loginsPath)?.logins[role];
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

// What the transaction says of itself before any verifier is sent (SPEC §11 items 4, 5): it waits for a role's row
// no longer than 5 s — it runs under the host lock and must not wait for ever behind another session's open
// transaction (measured: it waits) — and no bound value reaches the server's log, also where the installer turned
// statement logging on (measured C4: 1–2 lines with the verifier). A server that refuses the installer these
// settings refuses the step here, before a verifier is sent.
const ITS_OWN_SETTINGS = [
  "set local lock_timeout = '5s'",
  "set local log_parameter_max_length = 0",
  "set local log_parameter_max_length_on_error = 0",
];

// A verifier reaches the server as a parameter, into a transaction-local setting, and is applied by `alter role`
// inside a `do` block (SPEC §3, measured — M7): the statements' texts are these constants, and the server's log,
// which writes DDL statements as they are sent, sees no verifier. The role travels the same way and is quoted there.
// The block catches its own `alter role`'s failure — a cancel too, which `others` does not take — and raises one of
// its own, of the same SQLSTATE, whose context holds no verifier: the failing statement's would, in the server's log
// and in the client's error (SPEC §11 item 4, measured C1.b, C1.d).
const HAND_OVER = "select pg_catalog.set_config('os_install.role', $1, true), pg_catalog.set_config('os_install.verifier', $2, true)";
const APPLY = `do $apply$ begin
  execute pg_catalog.format('alter role %I password %L', pg_catalog.current_setting('os_install.role'), pg_catalog.current_setting('os_install.verifier'));
exception when query_canceled or others then
  raise exception using errcode = sqlstate, message = 'the server refused the verifier of ' || pg_catalog.current_setting('os_install.role');
end $apply$`;

/**
 * Each login's verifier, of a new 16-byte salt, set in one transaction for all four (SPEC §6 step 4). The server's
 * refusal is passed on as its primary message and its SQLSTATE alone, in an error of the step's own — never the
 * driver's error, whose other fields are the server's to fill.
 */
async function setTheVerifiers(conn: Client, passwords: Record<FoundationLogin, string>): Promise<void> {
  await conn.query("begin");
  try {
    for (const setting of ITS_OWN_SETTINGS) await conn.query(setting);
    for (const role of FOUNDATION_LOGINS) {
      await conn.query(HAND_OVER, [role, scramVerifier(passwords[role], randomBytes(16))]);
      await conn.query(APPLY);
    }
    await conn.query("commit");
  } catch (failure) {
    await conn.query("rollback").catch(() => undefined);
    if (failure instanceof DatabaseError) throw new Error(`${failure.message} (${failure.code ?? "no SQLSTATE"})`);
    throw failure;
  }
}

const CONNECT_MS = 10_000;

/**
 * Who the server says a login is, logged in over TCP with the address the file gives it — or, when it does not come
 * in, why: the file's refusal, the server's SQLSTATE or the driver's own code; never a message, which may hold the
 * address.
 */
async function whoComesIn(role: FoundationLogin): Promise<{ who: string } | { refused: string }> {
  let client: Client | undefined;
  try {
    client = new Client({ connectionString: loginConnectionString(role), connectionTimeoutMillis: CONNECT_MS });
    client.on("error", () => undefined);
    await client.connect();
    const { rows } = await client.query<{ who: string }>("select current_user::pg_catalog.text as who");
    return { who: String(rows[0]?.who) };
  } catch (failure) {
    if (failure instanceof LoginsRefused) return { refused: failure.reason };
    const code = (failure as { code?: unknown }).code;
    return { refused: typeof code === "string" ? code : "no code" };
  } finally {
    await client?.end().catch(() => undefined);
  }
}

/**
 * After the commit, the proof that the step did what it says (SPEC §11 item 1): each of the four, in SPEC §6's order,
 * comes in and is itself. The first that does not refuses the step; the file and the verifiers stand as set. One
 * proof for every way a login can be unusable — an expiry, a connection limit, a file that parted from the server.
 */
async function assertEachComesIn(): Promise<void> {
  for (const role of FOUNDATION_LOGINS) {
    const came = await whoComesIn(role);
    if ("who" in came && came.who === role) continue;
    process.stderr.write(`[bench] ${role} did not come in as itself (${"refused" in came ? came.refused : "another role"})\n`);
    throw new LoginsRefused(`${role} cannot-log-in`);
  }
}

/**
 * SPEC §6 steps 1–4 and the proof of §11 item 1, under a held host lock: an instance stands; on one connection to
 * it, guarded before its first statement, the four logins are what the chain made; the file holds their passwords
 * before the server is sent anything of them; the server is sent a verifier of each; and each then comes in.
 */
export async function setLogins(lock: HostLock): Promise<{ sysid: string; logins: readonly FoundationLogin[] }> {
  assertTheHostLock(lock);
  if ((await instanceStatus()).state !== "standing") throw new LoginsRefused("no-instance");

  const conn = new Client({ connectionString: connectionString(), connectionTimeoutMillis: CONNECT_MS });
  // A connection lost while it idles shows in the next query's rejection; without a listener it would end the process.
  conn.on("error", () => undefined);
  await conn.connect();
  let sysid: string;
  try {
    ({ sysid } = await assertFoundationTarget(conn));
    await assertTheChainsLogins(conn);
    assertTheHostLock(lock);
    const passwords = passwordsKeptOrMinted(sysid);
    assertTheHostLock(lock);
    await step("the logins' verifiers", () => setTheVerifiers(conn, passwords));
  } finally {
    await conn.end();
  }
  await step("each login comes in", assertEachComesIn);
  return { sysid, logins: FOUNDATION_LOGINS };
}
