import type { Client } from "pg";
import { expect } from "vitest";
import { columnOf, granteesOnSchema, valueOf } from "../../chain/fixtures/looking.ts";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { THE_FIVE, THE_FOUR, roleOids } from "../fixtures/catalogue.ts";
import { sqlstateOf } from "../fixtures/tcp-logins.ts";
import { LOOK_MS, type Step, type TheRun } from "../fixtures/the-run.ts";

// Piece 5's SPEC §8 B.3 and B.4: the five roles and the schema `os` as the chain left them, read from the catalogue
// as the installer — and the one act the installer may do with them, done.

/** Every attribute of SPEC §4, the password and the expiry among them, as one row per role. */
const ATTRIBUTES = `
select a.rolname::text as role, a.rolcanlogin as login, a.rolsuper as superuser, a.rolcreatedb as createdb,
       a.rolcreaterole as createrole, a.rolreplication as replication, a.rolbypassrls as bypassrls, a.rolinherit as inherit,
       a.rolconnlimit as connection_limit, a.rolpassword is null as no_password, a.rolvaliduntil is null as no_expiry
  from pg_catalog.pg_authid a where a.rolname = any($1::text[]) order by a.rolname collate "C"`;

const asSpecFour = (role: string) => ({
  role,
  login: role !== "os_owner",
  superuser: false,
  createdb: false,
  createrole: false,
  replication: false,
  bypassrls: false,
  inherit: false,
  connection_limit: -1,
  no_password: true,
  no_expiry: true,
});

/** The membership rows that name one of the five on either side, as `role <- member inherit=… set=…`. */
const MEMBERSHIPS = `
select m.roleid::regrole::text as role, m.member::regrole::text as member, m.inherit_option as inherit, m.set_option as set
  from pg_catalog.pg_auth_members m
 where m.roleid = any($1::regrole[]) or m.member = any($1::regrole[])`;

/** What `said` selects, ascending by code unit: the order a case spells must not hang on the database's collation. */
const ascending = (said: string): string => `select said from (${said}) s order by said collate "C"`;

type Membership = { role: string; member: string; inherit: boolean; set: boolean };

async function theRolesAsTheCatalogueHasThem(installer: Client, run: TheRun): Promise<void> {
  expect((await installer.query(ATTRIBUTES, [[...THE_FIVE]])).rows).toEqual([...THE_FIVE].sort().map(asSpecFour));
  const settings = "select count(*)::int from pg_catalog.pg_db_role_setting s where s.setrole = any($1::regrole[])";
  expect(await valueOf(installer, settings, [[...THE_FIVE]])).toBe(0);

  const memberships = (await installer.query<Membership>(MEMBERSHIPS, [[...THE_FIVE]])).rows;
  // None of the five is a member of any role.
  expect(memberships.filter((row) => (THE_FIVE as readonly string[]).includes(row.member))).toEqual([]);
  // No role but the installer is a member of any of them, and it inherits from none.
  expect([...new Set(memberships.map((row) => row.member))]).toEqual([run.installer]);
  expect(memberships.filter((row) => row.inherit)).toEqual([]);
}

async function theInstallerMaySetRoleToTheOwnerAlone(installer: Client): Promise<void> {
  const mayAct = ascending("select r::text || ' set=' || pg_catalog.pg_has_role(session_user, r, 'SET') || ' usage=' || pg_catalog.pg_has_role(session_user, r, 'USAGE') as said from unnest($1::regrole[]) r");
  expect(await columnOf(installer, mayAct, [[...THE_FIVE]])).toEqual([
    "os_engine set=false usage=false",
    "os_executor set=false usage=false",
    "os_intake set=false usage=false",
    "os_owner set=true usage=false",
    "os_reader set=false usage=false",
  ]);
  // The act itself: to the owner it is done, to each login it is refused.
  await installer.query("set role os_owner");
  expect(await valueOf(installer, "select current_user::text")).toBe("os_owner");
  await installer.query("reset role");
  for (const login of THE_FOUR) expect(`${login} ${await sqlstateOf(installer, `set role ${login}`)}`).toBe(`${login} 42501`);
  expect(await valueOf(installer, "select current_user = session_user")).toBe(true);
}

/** Which of these hold any of the privileges on the object, as `<role> <privilege>`. */
async function holders(client: Client, check: string, object: string, privileges: readonly string[], roles: readonly string[]): Promise<string[]> {
  const held: string[] = [];
  for (const role of roles) {
    for (const privilege of privileges) {
      if ((await valueOf(client, `select pg_catalog.${check}($1::name, $2::text, $3::text)`, [role, object, privilege])) === true) held.push(`${role} ${privilege}`);
    }
  }
  return held;
}

export function theRoles(step: Step, run: TheRun): void {
  step("B.3 the roles: each of the five has exactly SPEC §4's attributes, no setting, no membership either way but the installer's, which may SET ROLE to os_owner alone", LOOK_MS, async () => {
    await onTheInstance(async (installer) => {
      run.oids = await roleOids(installer);
      expect(Object.keys(run.oids).sort()).toEqual([...THE_FIVE].sort());
      await theRolesAsTheCatalogueHasThem(installer, run);
      await theInstallerMaySetRoleToTheOwnerAlone(installer);
    });
  });

  step("B.4 the schema: os is os_owner's, no one outside the foundation's five holds a privilege on it, PUBLIC none and no login CREATE; os_owner may create nowhere else; the ledger is the installer's and none of the five reaches it", LOOK_MS, async () => {
    await onTheInstance(async (installer) => {
      expect(await valueOf(installer, "select nspowner::regrole::text from pg_catalog.pg_namespace where nspname = 'os'")).toBe("os_owner");
      // No grantee outside the foundation's own five; PUBLIC holds nothing; no login may create. USAGE reaches a
      // login with its first door (SPEC §1) — that grant is a later piece's, and this case must not forbid it.
      expect((await granteesOnSchema(installer, "os")).filter((grantee) => !(THE_FIVE as readonly string[]).includes(grantee))).toEqual([]);
      expect(await holders(installer, "has_schema_privilege", "os", ["USAGE", "CREATE"], ["public"])).toEqual([]);
      expect(await holders(installer, "has_schema_privilege", "os", ["CREATE"], THE_FOUR)).toEqual([]);
      // The installer is no grantee either; it reads every schema through the platform's pg_read_all_data, and may create in none of the owner's.
      expect(await holders(installer, "has_schema_privilege", "os", ["CREATE"], [run.installer])).toEqual([]);

      const elsewhere = ascending("select n.nspname::text as said from pg_catalog.pg_namespace n where n.nspname <> 'os' and pg_catalog.has_schema_privilege('os_owner', n.oid, 'CREATE')");
      expect(await columnOf(installer, elsewhere)).toEqual([]);
      expect(await valueOf(installer, "select pg_catalog.has_database_privilege('os_owner', pg_catalog.current_database(), 'CREATE')")).toBe(false);

      expect(await valueOf(installer, "select nspowner::regrole::text from pg_catalog.pg_namespace where nspname = 'os_chain'")).toBe(run.installer);
      expect(await valueOf(installer, "select relowner::regrole::text from pg_catalog.pg_class where oid = 'os_chain.ledger'::regclass")).toBe(run.installer);
      expect(await holders(installer, "has_schema_privilege", "os_chain", ["USAGE", "CREATE"], THE_FIVE)).toEqual([]);
      const ofATable = ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER", "MAINTAIN"];
      expect(await holders(installer, "has_table_privilege", "os_chain.ledger", ofATable, THE_FIVE)).toEqual([]);
    });
  });
}
