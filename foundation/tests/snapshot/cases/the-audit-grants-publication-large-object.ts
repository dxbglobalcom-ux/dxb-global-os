import { expect } from "vitest";
import { connectionString } from "@dxb-foundation/bench";
import { differenceOf, snapshotOf } from "@dxb-foundation/chain";
import { columnOf, valueOf } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { CASE_MS, aChange, asTheInstaller, asTheOwner, fixtureEqual } from "../fixtures/changes.ts";
import { asTheSuperuser } from "../fixtures/superuser.ts";
import { EXPECTED_FIXTURE } from "../fixtures/the-chains.ts";
import { check, expectRedBy, shown } from "../fixtures/the-check.ts";

// SPEC §11.1 rows 4, 5 and 8, on the fixture chain: a chain role's item on a language, a tablespace and a parameter;
// a default-privilege row left with an empty ACL; a publication's columns and filter; a large object a chain role
// owns. What the catalogue holds after each statement was measured on the bench first (2026-11-23) and is said
// beside the case; the lines are written down whole from SPEC §4.3.

export function theAuditGrantsPublicationLargeObject(step: Step): void {
  // plpgsql belongs to supabase_admin, its ACL NULL; the installer's grant is refused with a warning and grants
  // nothing (measured), so the superuser grants — the grantor the server stores is the owner: os_reader=U*/supabase_admin.
  aChange(step, "§11.1 row 4 a chain role's item on a language, with grant option (the superuser): its grant language line and its outside line in; revoked: equal", {
    change: () => asTheSuperuser("grant usage on language plpgsql to os_reader with grant option"),
    undo: () => asTheSuperuser("revoke usage on language plpgsql from os_reader"),
    actualOnly: ["grant language plpgsql to os_reader USAGE option t by supabase_admin stored", "outside granted os_reader language plpgsql"],
  });

  // pg_default is the bootstrap superuser's (supabase_admin); the installer is refused (measured, 42501).
  aChange(step, "§11.1 row 4 a chain role's item on a tablespace (the superuser): its grant tablespace line and its outside line in; revoked: equal", {
    change: () => asTheSuperuser("grant create on tablespace pg_default to os_reader"),
    undo: () => asTheSuperuser("revoke create on tablespace pg_default from os_reader"),
    actualOnly: ["grant tablespace pg_default to os_reader CREATE option f by supabase_admin stored", "outside granted os_reader tablespace pg_default"],
  });

  // The grant makes a pg_parameter_acl row {supabase_admin=sA/supabase_admin, os_reader=s/supabase_admin}; the revoke
  // deletes the row (measured). pg_identify_object calls the object's type `parameter ACL`.
  aChange(step, "§11.1 row 4 a chain role's item on a parameter (the superuser): its grant parameter line and its outside line in; revoked: equal", {
    change: () => asTheSuperuser("grant set on parameter work_mem to os_reader"),
    undo: () => asTheSuperuser("revoke set on parameter work_mem from os_reader"),
    actualOnly: ["grant parameter work_mem to os_reader SET option f by supabase_admin stored", "outside granted os_reader parameter ACL work_mem"],
  });

  // os_owner's global row for sequences stands at the built-in default (no row); revoking the owner's own items
  // leaves a row (os_owner, 0, S) whose ACL is `{}`; granting them back returns the row to the default and the
  // server deletes it (measured).
  aChange(step, "§11.1 row 4 a default-privilege row left with an empty ACL (os_owner revokes its own on sequences): one default-acl-none line in; granted back: equal", {
    change: () => asTheOwner("alter default privileges revoke all on sequences from os_owner"),
    undo: () => asTheOwner("alter default privileges grant all on sequences to os_owner"),
    red: async () => {
      const held = await onTheInstance((client) =>
        valueOf(
          client,
          `select pg_catalog.cardinality(d.defaclacl)::text from pg_catalog.pg_default_acl d
            where d.defaclrole = pg_catalog.to_regrole('os_owner') and d.defaclnamespace = 0 and d.defaclobjtype = 'S'`,
        ),
      );
      expect(held, "the catalogue holds the row, with an empty ACL").toBe("0");
      await expectRedBy(EXPECTED_FIXTURE, { actualOnly: ["default-acl-none for os_owner in * on S"] });
    },
  });

  // The installer may make a publication of os.parts on this bench (measured: the platform lets its privileged
  // role). Columns are named out of order in the statement; the line names them in the table's column order.
  step("§11.1 row 5 a publication with a column list and a filter: its line; the filter changed: one line out, one in; no list and no filter: * and -; dropped: equal", CASE_MS, async () => {
    const LINE = (columns: string, where: string): string => `publication snap_pub has os.parts columns ${columns} where ${where}`;
    await asTheInstaller("create publication snap_pub for table os.parts (code, id) where (qty > 5)");
    try {
      await expectRedBy(EXPECTED_FIXTURE, { actualOnly: [LINE("id,code", "(qty > 5)")] });
      const before = await snapshotOf({ connectionString: connectionString() });
      await asTheInstaller("alter publication snap_pub set table os.parts (code, id) where (qty > 6)");
      await expectRedBy(EXPECTED_FIXTURE, { actualOnly: [LINE("id,code", "(qty > 6)")] });
      const after = await snapshotOf({ connectionString: connectionString() });
      expect(differenceOf(before, after)).toEqual({ expectedOnly: [LINE("id,code", "(qty > 5)")], actualOnly: [LINE("id,code", "(qty > 6)")] });
      await asTheInstaller("alter publication snap_pub set table os.parts");
      await expectRedBy(EXPECTED_FIXTURE, { actualOnly: [LINE("*", "-")] });
    } finally {
      await asTheInstaller("drop publication if exists snap_pub");
    }
    await fixtureEqual();
  });

  // lo_create as os_owner makes a large object it owns; pg_shdepend holds an owner row for it whose identity is its
  // oid (measured: `outside owns os_owner large object 20128` is what reading the identity would print).
  step("§11.1 row 8 large objects os_owner owns: one → `outside owns os_owner large object -`; two → the line twice; no oid in the answer; removed: equal", CASE_MS, async () => {
    const LINE = "outside owns os_owner large object -";
    try {
      await asTheOwner("select pg_catalog.lo_create(0)");
      await expectRedBy(EXPECTED_FIXTURE, { actualOnly: [LINE] });
      await asTheOwner("select pg_catalog.lo_create(0)");
      const said = await check(EXPECTED_FIXTURE);
      const oids = await onTheInstance((client) =>
        columnOf(client, "select m.oid::text from pg_catalog.pg_largeobject_metadata m where m.lomowner = pg_catalog.to_regrole('os_owner')"),
      );
      expect(oids.length, "two large objects stand").toBe(2);
      expect(said.lines.filter((line) => oids.some((oid) => line.includes(oid))), shown(said)).toEqual([]);
      await expectRedBy(EXPECTED_FIXTURE, { actualOnly: [LINE, LINE] });
    } finally {
      await asTheOwner("select pg_catalog.lo_unlink(m.oid) from pg_catalog.pg_largeobject_metadata m where m.lomowner = pg_catalog.to_regrole('os_owner')");
    }
    await fixtureEqual();
  });
}
