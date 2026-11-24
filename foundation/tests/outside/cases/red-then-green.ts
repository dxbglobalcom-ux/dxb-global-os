import { expect } from "vitest";
import { valueOf } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { asTheInstaller } from "../../snapshot/fixtures/changes.ts";
import { asTheSuperuser } from "../../snapshot/fixtures/superuser.ts";
import { COMMAND_MS, EXPECTED_FURTHER, expectOutsideEqual, expectOutsideRed } from "../fixtures/the-outside.ts";
import type { TheRun } from "./the-build.ts";

// Piece 6c's SPEC §6 B.6: red, then green again. Each act is done by the test itself — as the installer through the
// bench's guarded connection, or as the bench's superuser where only a superuser may — and undone. Its printed
// difference is written down here, by hand, whole: against the built inventory (what is checked is "nothing", the
// first line alone) and against the fresh one (what is checked is expected/further.outside.txt). Undone, both are
// equal again.

/** One value the installer reads. */
export const asked = (sql: string): Promise<unknown> => onTheInstance((client) => valueOf(client, sql));

/**
 * The password a role is given here: a made-up word of this file's own, never read from anywhere. A statement that
 * holds it is sent as the superuser, and a refusal is said without it — no test prints a password.
 */
const MADE_UP_WORD = "an-outside-act-word";
export async function asTheSuperuserSaying(sql: string, saidAs: string): Promise<void> {
  try {
    await asTheSuperuser(sql);
  } catch {
    throw new Error(`as the superuser, ${saidAs} was refused`);
  }
}

type Act = {
  /** What must hold before the act, for the act to mean what its name says. */
  given?: () => Promise<void>;
  act: () => Promise<void>;
  /** Run however the checks ended. */
  undo: () => Promise<void>;
  /** The whole answer of `outside --before <built> --check <nothing>`. */
  againstTheBuilt: readonly string[];
  /** The whole answer of `outside --before <fresh> --check expected/further.outside.txt`, or that it is equal. */
  againstTheFresh: readonly string[] | "equal";
  /** What must hold once the act is undone. */
  undone?: () => Promise<void>;
};

export const red = (count: number): string => `OUTSIDE_RED expected_only=0 database_only=${count}`;

export function anAct(step: Step, run: TheRun, name: string, { given, act, undo, againstTheBuilt, againstTheFresh, undone }: Act): void {
  step(name, 4 * COMMAND_MS, async () => {
    await given?.();
    await act();
    try {
      await expectOutsideRed(run.built, run.nothing, againstTheBuilt);
      if (againstTheFresh === "equal") await expectOutsideEqual(run.fresh, EXPECTED_FURTHER);
      else await expectOutsideRed(run.fresh, EXPECTED_FURTHER, againstTheFresh);
    } finally {
      await undo();
    }
    await undone?.();
    await expectOutsideEqual(run.built, run.nothing);
    await expectOutsideEqual(run.fresh, EXPECTED_FURTHER);
  });
}

const RI = (table: string, calling: string): string =>
  `internal trigger on ${table} of table constraint linked_probe_fkey on snap_elsewhere.linked calling "${calling}"()`;

export function redThenGreen(step: Step, run: TheRun): void {
  anAct(step, run, "B.6 a comment on a platform object (schema extensions, which had none) → added row pg_description; the comment taken away → equal", {
    given: async () => expect(await asked("select pg_catalog.obj_description('extensions'::pg_catalog.regnamespace, 'pg_namespace') is null")).toBe(true),
    act: () => asTheInstaller("comment on schema extensions is 'an act of the outside test'"),
    undo: () => asTheInstaller("comment on schema extensions is null"),
    againstTheBuilt: ["+ added row pg_description schema extensions", red(1)],
    againstTheFresh: ["+ added row pg_description schema extensions", red(1)],
  });

  anAct(step, run, "B.6 a grant on an object whose ACL was NULL (snap_elsewhere.linked) → added acl; revoked → the stored ACL differs, the meaning does not: equal", {
    given: async () => expect(await asked("select relacl is null from pg_catalog.pg_class where oid = 'snap_elsewhere.linked'::pg_catalog.regclass")).toBe(true),
    act: () => asTheInstaller("grant select on snap_elsewhere.linked to anon"),
    undo: () => asTheInstaller("revoke select on snap_elsewhere.linked from anon"),
    againstTheBuilt: ["+ added acl pg_class table snap_elsewhere.linked has anon=r/postgres", red(1)],
    againstTheFresh: ["+ added acl pg_class table snap_elsewhere.linked has anon=r/postgres", red(1)],
    undone: async () =>
      expect(await asked("select relacl::text from pg_catalog.pg_class where oid = 'snap_elsewhere.linked'::pg_catalog.regclass")).toBe("{postgres=arwdDxtm/postgres}"),
  });

  anAct(step, run, "B.6 the password of a role that is not the chain's (anon, which had none; the superuser) → changed row pg_authid role anon; taken away → equal", {
    given: async () => expect(await asked("select rolpassword is null from pg_catalog.pg_authid where rolname = 'anon'")).toBe(true),
    act: () => asTheSuperuserSaying(`alter role anon password '${MADE_UP_WORD}'`, "a password given to anon"),
    undo: () => asTheSuperuserSaying("alter role anon password null", "anon's password taken away"),
    againstTheBuilt: ["+ changed row pg_authid role anon", red(1)],
    againstTheFresh: ["+ changed row pg_authid role anon", red(1)],
  });

  // The internal triggers were made by the build: against the fresh inventory their key stood only after already,
  // so the act changes no line there — a change to what the build made is seen against an inventory taken after it.
  anAct(step, run, "B.6 disable trigger all on the table with the foreign key (the superuser) → its two internal triggers, by their spelled names, changed; against the fresh inventory nothing; enabled again → equal", {
    act: () => asTheSuperuser("alter table snap_elsewhere.linked disable trigger all"),
    undo: () => asTheSuperuser("alter table snap_elsewhere.linked enable trigger all"),
    againstTheBuilt: [
      `+ changed row pg_trigger ${RI("snap_elsewhere.linked", "RI_FKey_check_ins")}`,
      `+ changed row pg_trigger ${RI("snap_elsewhere.linked", "RI_FKey_check_upd")}`,
      red(2),
    ],
    againstTheFresh: "equal",
  });

  // A platform table the build did not touch (0006 wrote into supabase_migrations.schema_migrations), with no
  // sequence and no trigger, which the installer may write and delete from.
  anAct(step, run, "B.6 a row into a platform table (realtime.schema_migrations) → changed held rows; the row deleted → equal", {
    act: () => asTheInstaller("insert into realtime.schema_migrations (version) values (99990101000006)"),
    undo: () => asTheInstaller("delete from realtime.schema_migrations where version = 99990101000006"),
    againstTheBuilt: ["+ changed held rows realtime.schema_migrations", red(1)],
    againstTheFresh: ["+ changed held rows realtime.schema_migrations", red(1)],
  });
}
