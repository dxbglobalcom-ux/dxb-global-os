import { expect } from "vitest";
import { connectionString } from "@dxb-foundation/bench";
import { inventoryOf } from "@dxb-foundation/chain";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { asTheSuperuser } from "../../snapshot/fixtures/superuser.ts";
import {
  COMMAND_MS, EXPECTED_FURTHER, expectOutsideEqual, inventoryPrinted, keptAside, printedBy,
} from "../fixtures/the-outside.ts";
import { anAct, asTheSuperuserSaying, asked, red } from "./red-then-green.ts";
import type { TheRun } from "./the-build.ts";

// Piece 6c's SPEC §10.1, rows 1–3: the blind audit's corrections, each an act on the bench done by the test itself
// as the bench's superuser — one statement per call — and undone, in the manner of B.6 (cases/red-then-green.ts).
// Each printed difference or refusal is written down here, by hand, whole; undone, the standing checks are equal.

/** Row 1 (A2): a table of os made a child of a table outside — pg_inherits is in only when both ends are. */
const INHERITS = "table os.inherits_outside inherits table snap_elsewhere.owned 1";

/**
 * Row 2 (A5): a password in the md5 form — "md5" and 32 hex digits made up here, the hash of nothing anyone knows,
 * never read from anywhere. A statement that holds it is sent as the superuser and a refusal is said without it.
 */
const MD5_FORM = `md5${"5eed0c0d".repeat(4)}`;
const DIGITS = MD5_FORM.slice(3);

/** A text holds the made-up value, or the word md5 followed by hex digits: what no answer may hold. */
const holdsTheValue = (text: string): boolean => text.includes(DIGITS) || /md5[0-9a-f]+/i.test(text);

/** Row 3 (A7): what the superuser does to snap_elsewhere.linked, in order, and what undoes it, in order. */
const THE_CAST = [
  // The table is in the platform's publication, which publishes updates: an update needs a replica identity
  // (measured: "cannot update table "linked" because it does not have a replica identity and publishes updates").
  "alter table snap_elsewhere.linked replica identity full",
  "insert into snap_elsewhere.linked (probe, note) values (null, 'before the cast')",
  "create function snap_elsewhere.flat(snap_elsewhere.linked) returns text language sql immutable as $$ select 'flat'::text $$",
  "create cast (snap_elsewhere.linked as text) with function snap_elsewhere.flat(snap_elsewhere.linked)",
];
const THE_CAST_UNDONE = [
  "drop cast if exists (snap_elsewhere.linked as text)",
  "drop function if exists snap_elsewhere.flat(snap_elsewhere.linked)",
  "delete from snap_elsewhere.linked",
  "alter table snap_elsewhere.linked replica identity default",
];

export function afterTheAudit(step: Step, run: TheRun): void {
  anAct(step, run, "B.6 (§10.1 row 1) a table of os made a child of a table outside (the superuser) → added row pg_inherits, out: the outside table now answers its child's rows; dropped → equal", {
    given: async () => expect(await asked("select pg_catalog.to_regclass('os.inherits_outside') is null")).toBe(true),
    act: () => asTheSuperuser("create table os.inherits_outside () inherits (snap_elsewhere.owned)"),
    undo: () => asTheSuperuser("drop table if exists os.inherits_outside"),
    againstTheBuilt: [`+ added row pg_inherits ${INHERITS}`, red(1)],
    againstTheFresh: [`+ added row pg_inherits ${INHERITS}`, red(1)],
    undone: async () => expect(await asked("select pg_catalog.to_regclass('os.inherits_outside') is null")).toBe(true),
  });

  step("B.6 (§10.1 row 2) a password in the md5 form on the fixture's own role (the superuser) → inventory and outside refused: not exit 0, nothing on stdout, further_role named, the value not; the library rejects; taken away → equal", 4 * COMMAND_MS, async () => {
    expect(await asked("select rolpassword is null from pg_catalog.pg_authid where rolname = 'further_role'")).toBe(true);
    expect(MD5_FORM).toMatch(/^md5[0-9a-f]{32}$/);
    await asTheSuperuserSaying(`alter role further_role password '${MD5_FORM}'`, "a password in the md5 form given to further_role");
    try {
      // The server stored it as given, not as a SCRAM verifier: the act means what its name says.
      expect(await asked("select pg_catalog.starts_with(rolpassword, 'md5') from pg_catalog.pg_authid where rolname = 'further_role'")).toBe(true);
      for (const words of [["inventory"], ["outside", "--before", run.built]]) {
        const printed = await printedBy(words);
        expect(printed.code !== 0, `${words[0]} exited 0`).toBe(true);
        expect(printed.stdout.length, `${words[0]} printed on stdout`).toBe(0);
        expect(holdsTheValue(printed.stderr), `${words[0]}'s stderr holds the value or md5 followed by hex`).toBe(false);
        expect(printed.stderr.slice(-1_500)).toMatch(/further_role/);
      }
      const outcome = await inventoryOf({ connectionString: connectionString() }).then(() => "resolved", (failure: unknown) => failure);
      expect(outcome instanceof Error, "inventoryOf did not reject").toBe(true);
      const said = outcome instanceof Error ? `${outcome.message}\n${outcome.stack ?? ""}` : "";
      expect(holdsTheValue(said), "the rejection holds the value or md5 followed by hex").toBe(false);
      expect(outcome instanceof Error ? outcome.message : "").toMatch(/further_role/);
    } finally {
      await asTheSuperuserSaying("alter role further_role password null", "further_role's password taken away");
    }
    expect(await asked("select rolpassword is null from pg_catalog.pg_authid where rolname = 'further_role'")).toBe(true);
    expect((await inventoryPrinted()).startsWith("inventory-format 1\n")).toBe(true);
    await expectOutsideEqual(run.built, run.nothing);
    await expectOutsideEqual(run.fresh, EXPECTED_FURTHER);
  });

  step("B.6 (§10.1 row 3) a cast on a table's row type (the superuser): a row, a function answering one constant, the cast; an inventory kept aside; the row updated → changed held rows snap_elsewhere.linked; all undone → equal", 4 * COMMAND_MS, async () => {
    expect(await asked("select pg_catalog.count(*)::integer from only snap_elsewhere.linked")).toBe(0);
    try {
      for (const statement of THE_CAST) await asTheSuperuser(statement);
      // The act means what its name says: a row printed through a cast prints the owner's constant.
      expect(await asked("select (t.*)::text from only snap_elsewhere.linked t")).toBe("flat");
      const withTheCast = keptAside("with-the-cast.inventory.txt", await inventoryPrinted());
      await asTheSuperuser("update snap_elsewhere.linked set note = 'after the cast'");
      expect(await asked("select (t.*)::text from only snap_elsewhere.linked t")).toBe("flat");
      const printed = await printedBy(["outside", "--before", withTheCast]);
      expect(printed.stdout, printed.stderr.slice(-1_500)).toBe("outside-format 1\nchanged held rows snap_elsewhere.linked\n");
      expect(printed.code).toBe(0);
    } finally {
      for (const statement of THE_CAST_UNDONE) await asTheSuperuser(statement);
    }
    expect(await asked("select pg_catalog.count(*)::integer from only snap_elsewhere.linked")).toBe(0);
    expect(await asked("select relreplident::text from pg_catalog.pg_class where oid = 'snap_elsewhere.linked'::pg_catalog.regclass")).toBe("d");
    await expectOutsideEqual(run.built, run.nothing);
    await expectOutsideEqual(run.fresh, EXPECTED_FURTHER);
  });
}
