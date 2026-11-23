import type { Client } from "pg";
import { expect } from "vitest";
import { valueOf } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { THE_FOUR, asTheOwnerRolledBack } from "../fixtures/catalogue.ts";
import { LOOK_MS, type Step } from "../fixtures/the-run.ts";

// Piece 5's SPEC §8 B.5: the owner's default privileges — the two global rows of §3 — and the proof: one object of
// every kind made in `os` as its owner, inside a transaction that is rolled back, and no one but the owner holding
// any privilege of its kind on any of them.

type Kind = {
  kind: string;
  makes: string;
  /** The object as the privilege function takes it, and the catalogue row that says its owner and its kind. */
  object: string;
  owner: string;
  check: string;
  privileges: readonly string[];
};

const OF_A_RELATION = ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER", "MAINTAIN"];
const OF_A_ROUTINE = ["EXECUTE"];
const OF_A_TYPE = ["USAGE"];

const relation = (relkind: string) => `select relowner::regrole::text || ' ' || relkind::text from pg_catalog.pg_class where oid = $1::regclass and relkind = '${relkind}'`;
const routine = (prokind: string) => `select proowner::regrole::text || ' ' || prokind::text from pg_catalog.pg_proc where oid = $1::regprocedure and prokind = '${prokind}'`;
const type = (typtype: string) => `select typowner::regrole::text || ' ' || typtype::text from pg_catalog.pg_type where oid = $1::regtype and typtype = '${typtype}'`;

// The names are the transaction's own: it is rolled back, so nothing of them outlives the case.
const KINDS: readonly Kind[] = [
  { kind: "r", makes: "create table os.proof_table (n integer)", object: "os.proof_table", owner: relation("r"), check: "has_table_privilege", privileges: OF_A_RELATION },
  { kind: "v", makes: "create view os.proof_view as select 1 as n", object: "os.proof_view", owner: relation("v"), check: "has_table_privilege", privileges: OF_A_RELATION },
  { kind: "m", makes: "create materialized view os.proof_matview as select 1 as n", object: "os.proof_matview", owner: relation("m"), check: "has_table_privilege", privileges: OF_A_RELATION },
  { kind: "S", makes: "create sequence os.proof_sequence", object: "os.proof_sequence", owner: relation("S"), check: "has_sequence_privilege", privileges: ["USAGE", "SELECT", "UPDATE"] },
  { kind: "f", makes: "create function os.proof_function() returns integer language sql as $f$ select 1 $f$", object: "os.proof_function()", owner: routine("f"), check: "has_function_privilege", privileges: OF_A_ROUTINE },
  { kind: "p", makes: "create procedure os.proof_procedure() language sql as $f$ select 1 $f$", object: "os.proof_procedure()", owner: routine("p"), check: "has_function_privilege", privileges: OF_A_ROUTINE },
  { kind: "a", makes: "create aggregate os.proof_aggregate(integer) (sfunc = int4pl, stype = integer)", object: "os.proof_aggregate(integer)", owner: routine("a"), check: "has_function_privilege", privileges: OF_A_ROUTINE },
  { kind: "e", makes: "create type os.proof_enum as enum ('one')", object: "os.proof_enum", owner: type("e"), check: "has_type_privilege", privileges: OF_A_TYPE },
  { kind: "d", makes: "create domain os.proof_domain as integer", object: "os.proof_domain", owner: type("d"), check: "has_type_privilege", privileges: OF_A_TYPE },
  { kind: "c", makes: "create type os.proof_composite as (n integer)", object: "os.proof_composite", owner: type("c"), check: "has_type_privilege", privileges: OF_A_TYPE },
];

const DEFAULT_ACL = `
select said from (
  select r.defaclrole::regrole::text || ' ' || r.defaclnamespace::text || ' ' || r.defaclobjtype::text || ' ' || r.defaclacl::text as said
    from pg_catalog.pg_default_acl r where r.defaclrole = 'os_owner'::regrole
) s order by said collate "C"`;

/** Who of public and the four holds a privilege of the object's kind on it, as `<role> <privilege>`. */
async function heldOn(client: Client, { object, check, privileges }: Kind): Promise<string[]> {
  const held: string[] = [];
  for (const role of ["public", ...THE_FOUR]) {
    for (const privilege of privileges) {
      if ((await valueOf(client, `select pg_catalog.${check}($1::name, $2::text, $3::text)`, [role, object, privilege])) === true) held.push(`${role} ${privilege}`);
    }
  }
  return held;
}

export function defaultPrivileges(step: Step): void {
  step("B.5 the default privileges: exactly the two global rows of os_owner; one object of every kind made in os as os_owner is its own, and no one else holds a privilege of its kind", LOOK_MS, async () => {
    await onTheInstance(async (installer) => {
      const rows = (await installer.query({ text: DEFAULT_ACL, rowMode: "array" })).rows.map(([row]) => String(row));
      expect(rows).toEqual(["os_owner 0 T {os_owner=U/os_owner}", "os_owner 0 f {os_owner=X/os_owner}"]);

      const seen = await asTheOwnerRolledBack(installer, async () => {
        const each: Record<string, unknown> = {};
        for (const kind of KINDS) {
          await installer.query(kind.makes);
          each[kind.object] = { owner: await valueOf(installer, kind.owner, [kind.object]), held: await heldOn(installer, kind) };
        }
        return each;
      });
      expect(seen).toEqual(Object.fromEntries(KINDS.map(({ object, kind }) => [object, { owner: `os_owner ${kind}`, held: [] }])));
    });
  });
}
