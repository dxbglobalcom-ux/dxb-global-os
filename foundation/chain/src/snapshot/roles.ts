// The snapshot's lines of the chain's roles (piece 6a's SPEC §4.3): `role`, `member`, `role-setting`.
import type { Client } from "pg";
import { flag, linesOf, role } from "./sql.ts";
import type { Covered } from "./sql.ts";

// Each chain role's attributes, from `pg_roles` — never `pg_authid`: the password column is not read, nor whether one
// is set. A time a role is valid until is a setting, not an act; read under the transaction's UTC and ISO.
const ROLES = `
select 'role ' || pg_catalog.quote_ident(r.rolname) || ' super ' || ${flag("r.rolsuper")} || ' inherit ' || ${flag("r.rolinherit")}
       || ' createrole ' || ${flag("r.rolcreaterole")} || ' createdb ' || ${flag("r.rolcreatedb")} || ' login ' || ${flag("r.rolcanlogin")}
       || ' replication ' || ${flag("r.rolreplication")} || ' bypassrls ' || ${flag("r.rolbypassrls")}
       || ' connlimit ' || r.rolconnlimit::pg_catalog.text || ' validuntil ' || coalesce(r.rolvaliduntil::pg_catalog.text, '-') as line
  from pg_catalog.pg_roles r
 where r.oid = any ($1::pg_catalog.oid[])`;

// Each membership with a chain role on either side: one row of `pg_auth_members` is one grant, by one grantor.
const MEMBERS = `
select 'member ' || ${role("m.roleid")} || ' has ' || ${role("m.member")} || ' admin ' || ${flag("m.admin_option")}
       || ' inherit ' || ${flag("m.inherit_option")} || ' set ' || ${flag("m.set_option")} || ' by ' || ${role("m.grantor")} as line
  from pg_catalog.pg_auth_members m
 where m.roleid = any ($1::pg_catalog.oid[]) or m.member = any ($1::pg_catalog.oid[])`;

// Each setting of each row whose role is a chain role or all roles (0), in this database or all (0): `*` for all.
// The value of a name that holds a dot is `<hidden>`, said by the server — so it never leaves it (SPEC §4.3, fact 7).
const ROLE_SETTINGS = `
select 'role-setting ' || case when s.setrole = 0 then '*' else ${role("s.setrole")} end
       || ' in ' || case when s.setdatabase = 0 then '*' else pg_catalog.quote_ident(d.datname) end
       || ' ' || pg_catalog.split_part(c.item, '=', 1) || '='
       || case when pg_catalog.strpos(pg_catalog.split_part(c.item, '=', 1), '.') > 0 then '<hidden>'
               else pg_catalog.substr(c.item, pg_catalog.strpos(c.item, '=') + 1) end as line
  from pg_catalog.pg_db_role_setting s
  left join pg_catalog.pg_database d on d.oid = s.setdatabase
 cross join lateral pg_catalog.unnest(s.setconfig) as c (item)
 where (s.setrole = 0 or s.setrole = any ($1::pg_catalog.oid[]))
   and (s.setdatabase = 0 or d.datname = pg_catalog.current_database())`;

/** `role`, `member` and `role-setting` lines of the chain's roles. */
export async function roleLines(conn: Client, { roles }: Covered): Promise<string[]> {
  return [...(await linesOf(conn, ROLES, [roles])), ...(await linesOf(conn, MEMBERS, [roles])), ...(await linesOf(conn, ROLE_SETTINGS, [roles]))];
}
