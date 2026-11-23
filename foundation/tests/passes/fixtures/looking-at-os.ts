// How a case looks at what the passes left in `os`. Everything here only reads.
import type { Client } from "pg";
import { columnOf } from "../../chain/fixtures/looking.ts";

/** What `said` selects, ascending by code unit: the order a case spells must not hang on the database's collation. */
const ascending = (said: string): string => `select said from (${said}) s order by said collate "C"`;

/**
 * Every row of `pg_proc` in `os` — function, procedure or aggregate — as `name(identity arguments)`.
 * No schema `os` answers none.
 */
export const routinesInOs = (client: Client): Promise<string[]> =>
  columnOf(
    client,
    ascending(`select p.proname || '(' || pg_catalog.pg_get_function_identity_arguments(p.oid) || ')' as said
                 from pg_catalog.pg_proc p where p.pronamespace = to_regnamespace('os')`),
  );

/** The rows a query answers, each with the columns it asks for. */
export const rowsIn = async (client: Client, sql: string): Promise<unknown[]> => (await client.query(sql)).rows;

/**
 * Every row of a table whole, as the server writes it, with the transaction that wrote it: equal
 * before and after means no row was added, removed or written again — an update to the same
 * values would show.
 */
export const rowsToTheInstant = (client: Client, table: string): Promise<string[]> =>
  columnOf(client, ascending(`select t::text || ' written by ' || t.xmin::text as said from ${table} t`));

/**
 * Every grantee of a function, said as `os.name(argument types)`. A function nobody was ever
 * granted or revoked answers none: its ACL is not written, and PUBLIC may execute it.
 */
export const granteesOnFunction = (client: Client, signature: string): Promise<string[]> =>
  columnOf(
    client,
    ascending(`select distinct case when a.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(a.grantee)::text end as said
                 from pg_catalog.pg_proc p, aclexplode(p.proacl) a where p.oid = $1::regprocedure`),
    [signature],
  );
