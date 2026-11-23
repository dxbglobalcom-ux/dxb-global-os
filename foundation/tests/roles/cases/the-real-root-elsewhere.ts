import { expect } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { filesLedgered, valueOf } from "../../chain/fixtures/looking.ts";
import { inAThrowawayDatabase, onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { sqlstateOf } from "../fixtures/tcp-logins.ts";
import { LOOK_MS, REAL_ROOT, type Step } from "../fixtures/the-run.ts";

// Piece 5's SPEC §8 B.13: a role is cluster-wide and a name is not authority (§4) — the real root applied to another
// database of the same instance meets the five standing, and fails at its first file, leaving nothing.

export function theRealRootElsewhere(step: Step): void {
  step("B.13 a taken name: the real root applied to a throwaway database of the same instance → file-failed at 0001-roles.sql, role \"os_owner\" already exists, nothing applied, the ledger's bootstrap row alone", LOOK_MS, async () => {
    // The server's own refusal of the name, by its SQLSTATE, asked in a transaction that is rolled back.
    await onTheInstance(async (installer) => {
      await installer.query("begin");
      try {
        expect(await sqlstateOf(installer, "create role os_owner")).toBe("42710");
      } finally {
        await installer.query("rollback");
      }
    });
    await inAThrowawayDatabase(async (db) => {
      expect(await applyChain({ target: db.target, root: REAL_ROOT })).toStrictEqual({
        state: "file-failed",
        file: "0001-roles.sql",
        message: 'role "os_owner" already exists',
        applied: [],
      });
      expect(await filesLedgered(db.client)).toEqual(["(ledger)"]);
      expect(await valueOf(db.client, "select count(*)::int from pg_catalog.pg_namespace where nspname = 'os'")).toBe(0);
      expect(await valueOf(db.client, "select count(*)::int from pg_catalog.pg_default_acl")).toBe(0);
    });
  });
}
