import type { Client } from "pg";
import { expect } from "vitest";
import { connectionString } from "@dxb-foundation/bench";
import { snapshotOf } from "@dxb-foundation/chain";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { columnOf } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { expectChainSaid, fixtureEqual } from "../fixtures/changes.ts";
import { fixtureRoot } from "../fixtures/the-chains.ts";
import { COMMAND_MS } from "../fixtures/the-check.ts";

// SPEC §6 B.6 and B.7: the fixture chain on top of the real one equals its committed text, and nothing that stands
// in a covered schema is left out of the text.

// The covered schemas of SPEC §4.1, as the test reads them: os, os_chain, and every schema os_owner owns.
const COVERED = `(select n.oid from pg_catalog.pg_namespace n
   where n.nspname in ('os', 'os_chain') or n.nspowner = pg_catalog.to_regrole('os_owner'))`;

/**
 * Every object of SPEC §6 B.7's kinds in the covered schemas, each said as the beginning of the line that must name
 * it — read by the test itself from the catalogue, under an empty search_path so names are spelled with their schema.
 */
async function whatStands(client: Client): Promise<string[]> {
  await client.query("set search_path = ''");
  const kinds = [
    `select 'relation ' || c.oid::pg_catalog.regclass::text || ' kind ' || c.relkind::text || ' '
       from pg_catalog.pg_class c where c.relnamespace in ${COVERED} and c.relkind in ('r', 'p', 'v', 'm', 'S', 'f', 'c')`,
    `select 'column ' || a.attrelid::pg_catalog.regclass::text || ' '
            || pg_catalog.row_number() over (partition by a.attrelid order by a.attnum)::text || ' ' || pg_catalog.quote_ident(a.attname) || ' type '
       from pg_catalog.pg_attribute a join pg_catalog.pg_class c on c.oid = a.attrelid
      where c.relnamespace in ${COVERED} and c.relkind in ('r', 'p', 'v', 'm', 'S', 'f', 'c') and a.attnum > 0 and not a.attisdropped`,
    `select 'function ' || p.oid::pg_catalog.regprocedure::text || ' kind ' from pg_catalog.pg_proc p where p.pronamespace in ${COVERED}`,
    `select 'type ' || t.oid::pg_catalog.regtype::text || ' kind ' from pg_catalog.pg_type t
      where t.typnamespace in ${COVERED} and t.typrelid = 0 and not (t.typcategory = 'A' and t.typelem <> 0)`,
    `select case when k.conrelid <> 0 then 'constraint ' || k.conrelid::pg_catalog.regclass::text || ' ' || pg_catalog.quote_ident(k.conname) || ' type '
                 else 'domain-constraint ' || k.contypid::pg_catalog.regtype::text || ' ' || pg_catalog.quote_ident(k.conname) || ' validated ' end
       from pg_catalog.pg_constraint k where k.connamespace in ${COVERED}`,
    `select 'trigger ' || g.tgrelid::pg_catalog.regclass::text || ' ' || pg_catalog.quote_ident(g.tgname) || ' enabled '
       from pg_catalog.pg_trigger g join pg_catalog.pg_class c on c.oid = g.tgrelid where c.relnamespace in ${COVERED} and not g.tgisinternal`,
    `select 'policy ' || y.polrelid::pg_catalog.regclass::text || ' ' || pg_catalog.quote_ident(y.polname) || ' cmd '
       from pg_catalog.pg_policy y join pg_catalog.pg_class c on c.oid = y.polrelid where c.relnamespace in ${COVERED}`,
    `select 'index ' || i.indrelid::pg_catalog.regclass::text || ' valid ' || (case when i.indisvalid then 't' else 'f' end)
            || ' replident ' || (case when i.indisreplident then 't' else 'f' end) || ' clustered ' || (case when i.indisclustered then 't' else 'f' end)
            || ' def ' || '%INDEX ' || pg_catalog.quote_ident(x.relname) || ' ON %'
       from pg_catalog.pg_index i join pg_catalog.pg_class x on x.oid = i.indexrelid where x.relnamespace in ${COVERED}`,
  ];
  const said: string[] = [];
  for (const sql of kinds) said.push(...(await columnOf(client, sql)));
  return said;
}

/** Whether a line of the text begins with `start` — or, for an index, is the index's line by its name. */
function named(lines: readonly string[], start: string): boolean {
  if (!start.includes("%")) return lines.some((line) => line.startsWith(start));
  const [head = "", name = ""] = start.split("%");
  return lines.some((line) => line.startsWith(head) && line.includes(name));
}

export function theFixture(step: Step): void {
  step("B.6 the fixture chain on top (chain up --root <fixture>) → CHAIN_GREEN; --check expected/fixture.snapshot.txt → SNAPSHOT_EQUAL", 3 * COMMAND_MS, async () => {
    expectChainSaid(await chainCommand(["up", "--root", fixtureRoot()], COMMAND_MS), "CHAIN_GREEN applied=2 standing=4 functions=3 reference=1", 0);
    await fixtureEqual();
  });

  step("B.7 nothing stands unseen: every relation, live column, routine, type, constraint, trigger, policy and index the test reads in the covered schemas is named by a line", 2 * COMMAND_MS, async () => {
    const lines = (await snapshotOf({ connectionString: connectionString() })).split("\n");
    const standing = await onTheInstance(whatStands);
    // The reading is seen to find each kind the fixture made, so an empty reading cannot pass.
    for (const kind of ["relation ", "column ", "function ", "type ", "constraint ", "domain-constraint ", "trigger ", "policy ", "index "]) {
      expect(standing.some((start) => start.startsWith(kind)), kind).toBe(true);
    }
    expect(standing.filter((start) => !named(lines, start))).toEqual([]);
  });
}
