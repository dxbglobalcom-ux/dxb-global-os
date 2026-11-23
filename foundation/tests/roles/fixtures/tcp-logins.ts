// Real logins over TCP from the host, on the bench's address (piece 5's SPEC §8): what came in, and how a login
// that did not was refused. A refusal is read off the error itself — the server's SQLSTATE, or, for a password the
// client never sends, the driver's own refusal — never off "it threw".
import { Client, DatabaseError, type ClientConfig } from "pg";
import { expect } from "vitest";
import { connectionString, loginConnectionString } from "@dxb-foundation/bench";
import { THE_FOUR } from "./catalogue.ts";

const CONNECT_MS = 10_000;

/** The server's SQLSTATE for a password it did not accept — also for a role that has none, and for one without LOGIN asked with a wrong one (measured, C5). */
export const AUTHENTICATION_FAILED = "28P01";

/**
 * What pg 8.22 throws when the server asks for SCRAM and the client has no password to answer with — pinned on the
 * bench (2026-11-23, a throwaway role, `crypto/sasl.js`): thrown after the server's first SCRAM message, so the server
 * did ask for one. A server that let the login in (`trust`) would raise neither.
 */
export const NO_PASSWORD_GIVEN = "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string";
export const AN_EMPTY_PASSWORD = "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string";

/** What a login is tried with: a connection string, or a role and a password — `undefined` for none at all. */
export type Login = string | { user: string; password: string | undefined };

/**
 * The driver's configuration for one login on the bench's address. The password is handed over by a function: a
 * function is taken as it is, so neither PGPASSWORD nor a password file can stand in for a password not given
 * (pg 8.22 `client.js`, `_getPassword`). The driver's type does not admit a function that answers nothing; it
 * treats one as "no password", which is the point.
 */
function configOf(login: Login): ClientConfig {
  if (typeof login === "string") return { connectionString: login, connectionTimeoutMillis: CONNECT_MS };
  const { hostname, port, pathname } = new URL(connectionString());
  const given = login.password;
  const password = (async () => given) as () => Promise<string>;
  return { host: hostname, port: Number(port), database: pathname.slice(1), user: login.user, password, connectionTimeoutMillis: CONNECT_MS };
}

/** `work` on one session of `login`, closed however the work ends. */
export async function asLogin<T>(login: Login, work: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client(configOf(login));
  client.on("error", () => undefined);
  try {
    await client.connect();
    return await work(client);
  } finally {
    await client.end().catch(() => undefined);
  }
}

/** Who the server says the session is, as `current_user session_user`. */
export const whoComesIn = (login: Login): Promise<string> =>
  asLogin(login, async (client) => {
    const { rows } = await client.query<{ said: string }>("select current_user::text || ' ' || session_user::text as said");
    return String(rows[0]?.said);
  });

/** The login comes in and is itself: `current_user` and `session_user` are both the role. */
export async function expectComesInAs(login: Login, role: string): Promise<void> {
  expect(await whoComesIn(login)).toBe(`${role} ${role}`);
}

/** Each of the four comes in with the address the secret file gives it, and is itself. */
export async function everyLoginComesIn(): Promise<void> {
  for (const role of THE_FOUR) await expectComesInAs(loginConnectionString(role), role);
}

/** The installer's own connection on the same address: the permitted thing a refusal is measured after. */
export async function expectTheInstallerComesIn(): Promise<void> {
  const said = await whoComesIn(connectionString());
  expect(said).toMatch(/^\S+ \S+$/);
}

/**
 * How a login that must not come in ended, said so that a case can name the role beside it: `server <SQLSTATE>`
 * for the server's refusal, `client <message>` for the driver's own, `came in` for a login that was not refused —
 * closed at once. None of these carries a password: the server's message names the role, the driver's is fixed.
 */
export async function howRefused(login: Login): Promise<string> {
  const client = new Client(configOf(login));
  client.on("error", () => undefined);
  try {
    await client.connect();
    return "came in";
  } catch (refusal) {
    if (refusal instanceof DatabaseError) return `server ${refusal.code ?? "no SQLSTATE"}`;
    return `client ${refusal instanceof Error ? refusal.message : String(refusal)}`;
  } finally {
    await client.end().catch(() => undefined);
  }
}

/** The server refused the password, as `howRefused` says it. */
export const PASSWORD_REFUSED = `server ${AUTHENTICATION_FAILED}`;

/** The password was right and the role may not log in (NOLOGIN) — answered only to a right password (SPEC §11, C5). */
export const NOT_PERMITTED_TO_LOG_IN = "server 28000";

/** The password was right and the role's connection limit is reached (C5). */
export const TOO_MANY_CONNECTIONS = "server 53300";

/** The server asked for SCRAM and the client had no password to answer with, as `howRefused` says it. */
export const NO_PASSWORD_REFUSED = `client ${NO_PASSWORD_GIVEN}`;
export const EMPTY_PASSWORD_REFUSED = `client ${AN_EMPTY_PASSWORD}`;

/**
 * Each role tried with no password, an empty one and a guessed one: refused as an authentication failure each time,
 * said `<role> <how>` so that a failing case names the role.
 */
export async function expectEveryWayRefused(roles: readonly string[], guess: string): Promise<void> {
  const tried: string[] = [];
  const expected: string[] = [];
  for (const user of roles) {
    tried.push(`${user} ${await howRefused({ user, password: undefined })}`, `${user} ${await howRefused({ user, password: "" })}`, `${user} ${await howRefused({ user, password: guess })}`);
    expected.push(`${user} ${NO_PASSWORD_REFUSED}`, `${user} ${EMPTY_PASSWORD_REFUSED}`, `${user} ${PASSWORD_REFUSED}`);
  }
  expect(tried).toEqual(expected);
}

/** A statement the login must be refused: the server's SQLSTATE, or "allowed" when it was not refused. */
export async function sqlstateOf(client: Client, sql: string): Promise<string> {
  try {
    await client.query(sql);
    return "allowed";
  } catch (refusal) {
    if (refusal instanceof DatabaseError) return refusal.code ?? "no SQLSTATE";
    throw refusal;
  }
}

/** The same address with another password in it: what a guess is. */
export function withAnotherPassword(address: string, password: string): string {
  const url = new URL(address);
  url.password = encodeURIComponent(password);
  return url.toString();
}
