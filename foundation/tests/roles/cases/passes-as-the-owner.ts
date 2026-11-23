import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import type { Client } from "pg";
import { expect } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { columnOf, valueOf } from "../../chain/fixtures/looking.ts";
import { inSchema } from "../../chain/fixtures/chain-on-disk.ts";
import { inAThrowawayDatabase, onTheInstance, type Throwaway } from "../../chain/fixtures/throwaway-database.ts";
import { routinesInOs, routinesInPublic, rowsToTheInstant } from "../../passes/fixtures/looking-at-os.ts";
import { CLOSED, EVENT_TYPES_TABLE, FAILED, MAKES_OS, OPENED, SEVERITIES_TABLE, TWICE, fileOf, greets } from "../../passes/fixtures/pass-files.ts";
import { inFunctions, passesRoot, standsWith } from "../../passes/fixtures/passes-on-disk.ts";
import { asTheOwnerRolledBack } from "../fixtures/catalogue.ts";
import { sqlstateOf } from "../fixtures/tcp-logins.ts";
import { LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §8 B.14, the passes acting as the owner of `os` (§5, §11 item 7 and its pins): fixture roots applied
// to throwaway databases of the instance, where the five roles stand cluster-wide since B.2. The installer, not saying
// `set role`, reaches nothing in `os`; only the runner's own `set role` lets a pass make or write there — and where
// `os` is the runner's own, no role is said at all.

/** The first schema file of every fixture here: `os`, the owner's. */
const OS_OF_THE_OWNER = "create schema os authorization os_owner;\n";

/** A schema file's text that makes `more` in `os` as its owner, after `os` itself. */
const asTheOwner = (more: string): string => `${OS_OF_THE_OWNER}set role os_owner;\n${more}`;

/**
 * os.event_types (pass-files.ts) with a column of its own that says who wrote each row: its default is the role
 * the row was inserted under. No file owns it, so the pass never writes it.
 */
const EVENT_TYPES_SAYING_WHO_WROTE = `${EVENT_TYPES_TABLE}alter table os.event_types add column written_by text not null default current_user;\n`;

const ownerOf = (client: Client, catalogue: "pg_proc" | "pg_class", oid: unknown): Promise<unknown> =>
  valueOf(client, `select ${catalogue === "pg_proc" ? "proowner" : "relowner"}::regrole::text from pg_catalog.${catalogue} where oid = $1::oid`, [oid]);

async function aFunctionFile(db: Throwaway): Promise<void> {
  const root = passesRoot({ schema: { "0001-os.sql": OS_OF_THE_OWNER }, functions: { "greet.sql": greets("hello") } });
  expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 1 });
  const oid = await valueOf(db.client, "select 'os.greet()'::regprocedure::oid::text");
  expect(await ownerOf(db.client, "pg_proc", oid)).toBe("os_owner");
  expect(await asTheOwnerRolledBack(db.client, () => valueOf(db.client, "select os.greet()"))).toBe("hello");

  writeFileSync(inFunctions(root, "greet.sql"), greets("good day"));
  expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: [], standing: 1, functions: 1 });
  expect(await valueOf(db.client, "select 'os.greet()'::regprocedure::oid::text")).toBe(oid);
  expect(await ownerOf(db.client, "pg_proc", oid)).toBe("os_owner");
  expect(await asTheOwnerRolledBack(db.client, () => valueOf(db.client, "select os.greet()"))).toBe("good day");
  expect(await routinesInPublic(db.client)).toEqual([]);
}

async function aVocabulary(db: Throwaway): Promise<void> {
  const root = passesRoot({ schema: { "0001-os.sql": asTheOwner(EVENT_TYPES_SAYING_WHO_WROTE) }, reference: { "event_types.json": fileOf(OPENED, CLOSED, FAILED) } });
  expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 1 });
  expect(await ownerOf(db.client, "pg_class", await valueOf(db.client, "select 'os.event_types'::regclass::oid::text"))).toBe("os_owner");
  const written = await asTheOwnerRolledBack(db.client, async () => (await db.client.query('select name, written_by from os.event_types order by name collate "C"')).rows);
  expect(written).toEqual([
    { name: "job.closed", written_by: "os_owner" },
    { name: "job.failed", written_by: "os_owner" },
    { name: "job.opened", written_by: "os_owner" },
  ]);
  // The installer's own session came in and read above; not saying `set role`, it is refused a row of the table.
  // SPEC §8 says "a reading": on this platform the installer reads every table through pg_read_all_data (measured
  // 2026-11-23), so the refusal SPEC §3 describes is the one of a write — tried in a transaction that is rolled back.
  expect(await valueOf(db.client, "select current_user = session_user")).toBe(true);
  await db.client.query("begin");
  try {
    const aRow = "insert into os.event_types (name, description, weight) values ('job.paused', 'a job was paused', 4)";
    expect(await sqlstateOf(db.client, aRow)).toBe("42501");
  } finally {
    await db.client.query("rollback");
  }
}

/** os.event_types read whole, to the instant, as its owner with the policy's force lifted — in a transaction rolled back. */
const theRowAsItStands = (client: Client): Promise<string[]> =>
  asTheOwnerRolledBack(client, async () => {
    await client.query("alter table os.event_types no force row level security");
    return rowsToTheInstant(client, "os.event_types");
  });

async function aVocabularyItsOwnerCannotRead(db: Throwaway): Promise<void> {
  const oneRow = `${EVENT_TYPES_TABLE}insert into os.event_types (name, description, weight) values ('job.opened', 'a job was opened', 1);\n`;
  const root = passesRoot({ schema: { "0001-os.sql": asTheOwner(oneRow) } });
  expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1 });
  const before = await theRowAsItStands(db.client);
  expect(before).toHaveLength(1);

  const hidden = [
    "set role os_owner;",
    "alter table os.event_types enable row level security;",
    "alter table os.event_types force row level security;",
    "create policy hides_every_row on os.event_types using (false);",
    "",
  ].join("\n");
  writeFileSync(inSchema(root, "0002-hidden.sql"), hidden);
  standsWith(root, "reference", { "event_types.json": fileOf(OPENED, CLOSED) });
  expect(await applyChain({ target: db.target, root })).toStrictEqual({
    state: "pass-failed",
    pass: "reference",
    file: "event_types.json",
    message: 'query would be affected by row-level security policy for table "event_types"',
    applied: ["0002-hidden.sql"],
  });
  expect(await theRowAsItStands(db.client)).toEqual(before);
}

/** Every routine of `os` with its owner, as `<name> <owner>`. */
const ownersInOs = (client: Client): Promise<string[]> =>
  columnOf(client, "select said from (select p.proname::text || ' ' || p.proowner::regrole::text as said from pg_catalog.pg_proc p where p.pronamespace = 'os'::regnamespace) s order by said collate \"C\"");

/** A pin (SPEC §11): the runner says `set role` before each function file — one whose text ends with `reset role` leaves the next file the owner's. */
async function aFileThatEndsWithResetRole(db: Throwaway): Promise<void> {
  const root = passesRoot({ schema: { "0001-os.sql": OS_OF_THE_OWNER }, functions: { "greet.sql": `${greets("hello")}reset role;\n`, "twice.sql": TWICE } });
  expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 2 });
  expect(await ownersInOs(db.client)).toEqual(["greet os_owner", "twice os_owner"]);
}

/**
 * SPEC §11 item 7: where `os` is the runner's own — every fixture of pieces 3 and 4 — neither pass says a role: what a
 * file and a row meet is `current_setting('role') = none`. The function file says so by refusing any other; the
 * vocabulary by a column of its own whose default is the setting, which no file names.
 */
async function anOsTheRunnerOwns(db: Throwaway, installer: string): Promise<void> {
  const roleSaidOfEachRow = "alter table os.event_types add column role_said text not null default pg_catalog.current_setting('role');\n";
  const metNoRole = "do $r$ begin if pg_catalog.current_setting('role') <> 'none' then raise exception 'the file met role %', pg_catalog.current_setting('role'); end if; end $r$;\n";
  const root = passesRoot({
    schema: { "0001-os.sql": `${MAKES_OS}${EVENT_TYPES_TABLE}${roleSaidOfEachRow}` },
    functions: { "greet.sql": `${greets("hello")}${metNoRole}` },
    reference: { "event_types.json": fileOf(OPENED, CLOSED) },
  });
  expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, functions: 1, reference: 1 });
  expect(await valueOf(db.client, "select nspowner::regrole::text from pg_catalog.pg_namespace where nspname = 'os'")).toBe(installer);
  expect((await db.client.query('select name, role_said from os.event_types order by name collate "C"')).rows).toEqual([
    { name: "job.closed", role_said: "none" },
    { name: "job.opened", role_said: "none" },
  ]);
}

/**
 * A schema `os` whose owner — a role of the case's own — the runner may not SET ROLE to: the first schema file
 * (`schemaFile`) is applied while the installer holds SET, which the case then takes back; `then` meets it with a pass.
 * The role is removed by the name it was made under once its database is gone.
 */
async function withAnOwnerTheRunnerMayNotBecome(installer: string, schemaFile: (owner: string) => string, then: (db: Throwaway, root: string, owner: string) => Promise<void>): Promise<void> {
  const owner = `roles_owner_${randomBytes(6).toString("hex")}`;
  await onTheInstance((instance) => instance.query(`create role ${owner} nologin`));
  try {
    await onTheInstance((instance) => instance.query(`grant ${owner} to "${installer}" with set true, inherit false`));
    await inAThrowawayDatabase(async (db) => {
      const root = passesRoot({ schema: { "0001-os.sql": schemaFile(owner) } });
      expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1 });
      // The grant the case gave is taken back: the installer keeps only the row its CREATE ROLE gave it, without SET.
      await onTheInstance((instance) => instance.query(`revoke ${owner} from "${installer}"`));
      expect(await valueOf(db.client, "select pg_catalog.pg_has_role(session_user, $1, 'SET')", [owner])).toBe(false);
      await then(db, root, owner);
    });
  } finally {
    await onTheInstance((instance) => instance.query(`drop role if exists ${owner}`));
  }
  expect(await onTheInstance((instance) => valueOf(instance, "select count(*)::int from pg_catalog.pg_roles where rolname = $1", [owner]))).toBe(0);
}

const anOsOf = (owner: string): string => `create schema os authorization ${owner};\n`;

const metByTheFunctionsPass = async (db: Throwaway, root: string, owner: string): Promise<void> => {
  standsWith(root, "functions", { "greet.sql": greets("hello") });
  expect(await applyChain({ target: db.target, root })).toStrictEqual({
    state: "pass-failed",
    pass: "functions",
    file: "greet.sql",
    message: `permission denied to set role "${owner}"`,
    applied: [],
  });
  expect(await routinesInOs(db.client)).toEqual([]);
  expect(await routinesInPublic(db.client)).toEqual([]);
};

/** A pin (SPEC §11): the reference pass says the refusal at its first file by name; no row is written. */
const metByTheReferencePass = async (db: Throwaway, root: string, owner: string): Promise<void> => {
  standsWith(root, "reference", { "severities.json": "[]\n", "event_types.json": fileOf(OPENED) });
  expect(await applyChain({ target: db.target, root })).toStrictEqual({
    state: "pass-failed",
    pass: "reference",
    file: "event_types.json",
    message: `permission denied to set role "${owner}"`,
    applied: [],
  });
  expect(await valueOf(db.client, "select count(*)::int from os.event_types")).toBe(0);
};

export function passesAsTheOwner(step: Step, run: TheRun): void {
  step("B.14 a function file → os.<name> stands, os_owner's; run again with another body → the same oid, the new body, still os_owner's", LOOK_MS, async () => {
    await inAThrowawayDatabase(aFunctionFile);
  });

  step("B.14 a vocabulary made under set role os_owner, and its file → reconciled, the table and its rows the owner's; the installer, not saying set role, is refused a row of it (42501)", LOOK_MS, async () => {
    await inAThrowawayDatabase(aVocabulary);
  });

  step("B.14 the same vocabulary with force row level security and a policy that hides its one row → pass-failed at that file, naming row-level security; the row stands as it was", LOOK_MS, async () => {
    await inAThrowawayDatabase(aVocabularyItsOwnerCannotRead);
  });

  step("B.14 a schema os whose owner the runner may not SET ROLE to → pass-failed at the first function file, permission denied to set role; nothing is made", LOOK_MS, async () => {
    await withAnOwnerTheRunnerMayNotBecome(run.installer, anOsOf, metByTheFunctionsPass);
  });

  step("B.14 pin: the same met by the reference pass → pass-failed at its first file by name, permission denied to set role; no row written", LOOK_MS, async () => {
    const withTwoVocabularies = (owner: string): string => `${anOsOf(owner)}set role ${owner};\n${EVENT_TYPES_TABLE}${SEVERITIES_TABLE}`;
    await withAnOwnerTheRunnerMayNotBecome(run.installer, withTwoVocabularies, metByTheReferencePass);
  });

  step("B.14 pin: a second function file after one whose text ends with reset role is still os_owner's", LOOK_MS, async () => {
    await inAThrowawayDatabase(aFileThatEndsWithResetRole);
  });

  step("§11 item 7: os the runner's own → neither pass says a role: a function file meets role none, a vocabulary's column of current_setting('role') reads none", LOOK_MS, async () => {
    await inAThrowawayDatabase((db) => anOsTheRunnerOwns(db, run.installer));
  });
}
