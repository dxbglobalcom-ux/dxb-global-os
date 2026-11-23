import { expect } from "vitest";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { aChange, asTheInstaller, asTheOwner } from "../fixtures/changes.ts";
import { asTheSuperuser } from "../fixtures/superuser.ts";
import { EXPECTED_FIXTURE } from "../fixtures/the-chains.ts";
import { check, differenceSaid, shown, snapshotPrinted, sortedByBytes } from "../fixtures/the-check.ts";

// SPEC §11.1 rows 1–3, on the fixture chain: a foreign key silenced by `disable trigger all`; an index's replica
// identity and cluster flags and the database's connection limit; a policy outside os that names a login, and a
// table outside os that inherits one of os. Each difference written down whole from SPEC §4.3 as it now reads.

// The fixture's foreign key os.parts (kind) → os.kinds (name), on delete restrict: two internal triggers on each side
// (measured on the bench, 2026-11-23: `tgfoid::regprocedure` under an empty search_path, pg_catalog's own unqualified).
const PARTS_TRIGGER = "trigger os.parts parts_touch enabled O def CREATE TRIGGER parts_touch BEFORE INSERT OR UPDATE ON os.parts FOR EACH ROW EXECUTE FUNCTION os.parts_touch()";
const SILENCED_ON_PARTS = [
  'trigger-internal os.parts parts_kind_fkey "RI_FKey_check_ins"() enabled D',
  'trigger-internal os.parts parts_kind_fkey "RI_FKey_check_upd"() enabled D',
];
const SILENCED_ON_KINDS = [
  'trigger-internal os.kinds parts_kind_fkey "RI_FKey_noaction_upd"() enabled D',
  'trigger-internal os.kinds parts_kind_fkey "RI_FKey_restrict_del"() enabled D',
];

/** The server's generated name of an internal trigger (`RI_ConstraintTrigger_a_<oid>`): never a field of the text. */
const GENERATED_NAME = "RI_ConstraintTrigger";

/** The check is red by exactly these lines, and neither its answer nor the printed text names a generated trigger. */
async function redWithoutAGeneratedName(expected: { expectedOnly?: readonly string[]; actualOnly: readonly string[] }): Promise<void> {
  const said = await check(EXPECTED_FIXTURE);
  expect(differenceSaid(said), shown(said)).toEqual({
    expectedOnly: sortedByBytes(expected.expectedOnly ?? []),
    actualOnly: sortedByBytes(expected.actualOnly),
  });
  expect(said.lines.some((line) => line.includes(GENERATED_NAME))).toBe(false);
  const printed = await snapshotPrinted();
  expect(printed.code, printed.stderr.slice(-1_500)).toBe(0);
  expect(printed.stdout.includes(GENERATED_NAME)).toBe(false);
}

const PARTS = "relation os.parts kind r owner os_owner persistence p rowsecurity t force t replident d options autovacuum_enabled=false,fillfactor=90";
const PARTS_PKEY = "index os.parts valid t replident f clustered f def CREATE UNIQUE INDEX parts_pkey ON os.parts USING btree (id)";
const DATABASE = "database postgres owner postgres encoding UTF8 collate en_US.UTF-8 ctype en_US.UTF-8 connlimit -1";

export function theAuditTriggersIndexesPolicies(step: Step): void {
  aChange(step, "§11.1 row 1 a foreign key silenced on its referencing side (the superuser: disable trigger all): its two trigger-internal lines in, the table's own trigger O out and D in — no generated name anywhere; enable trigger all: equal", {
    change: () => asTheSuperuser("alter table os.parts disable trigger all"),
    undo: () => asTheSuperuser("alter table os.parts enable trigger all"),
    red: () => redWithoutAGeneratedName({ expectedOnly: [PARTS_TRIGGER], actualOnly: [PARTS_TRIGGER.replace(" enabled O ", " enabled D "), ...SILENCED_ON_PARTS] }),
  });

  aChange(step, "§11.1 row 1 the same foreign key silenced on its referenced side (os.kinds, no trigger of its own): its two trigger-internal lines in, nothing out; enable: equal", {
    change: () => asTheSuperuser("alter table os.kinds disable trigger all"),
    undo: () => asTheSuperuser("alter table os.kinds enable trigger all"),
    red: () => redWithoutAGeneratedName({ actualOnly: SILENCED_ON_KINDS }),
  });

  aChange(step, "§11.1 row 2 replica identity using the primary key's index: the relation line replident d → i, the index line replident f → t; default again: equal", {
    change: () => asTheOwner("alter table os.parts replica identity using index parts_pkey"),
    undo: () => asTheOwner("alter table os.parts replica identity default"),
    expectedOnly: [PARTS, PARTS_PKEY],
    actualOnly: [PARTS.replace(" replident d ", " replident i "), PARTS_PKEY.replace(" replident f ", " replident t ")],
  });

  aChange(step, "§11.1 row 2 cluster on the primary key's index: the index line clustered f → t; set without cluster: equal", {
    change: () => asTheOwner("alter table os.parts cluster on parts_pkey"),
    undo: () => asTheOwner("alter table os.parts set without cluster"),
    expectedOnly: [PARTS_PKEY],
    actualOnly: [PARTS_PKEY.replace(" clustered f ", " clustered t ")],
  });

  // A high limit: the bench's own services hold connections to this database, and a low one would refuse them.
  aChange(step, "§11.1 row 2 the database's connection limit (its owner, the installer): the database line connlimit -1 → 1000; -1 again: equal", {
    change: () => asTheInstaller("alter database postgres connection limit 1000"),
    undo: () => asTheInstaller("alter database postgres connection limit -1"),
    expectedOnly: [DATABASE],
    actualOnly: [DATABASE.replace(/ connlimit -1$/, " connlimit 1000")],
  });

  aChange(step, "§11.1 row 3 the policy in public that names a login, its predicate changed (the table's owner, the installer): exactly one policy-using line out, one in", {
    change: () => asTheInstaller("alter policy snap_probe_reader on public.snap_probe using (false)"),
    undo: () => asTheInstaller("alter policy snap_probe_reader on public.snap_probe using (true)"),
    expectedOnly: ["policy-using public.snap_probe snap_probe_reader true"],
    actualOnly: ["policy-using public.snap_probe snap_probe_reader false"],
  });

  // Made by the superuser, who alone may make a child of os.kinds in public: inheriting asks for the parent's owner
  // (os_owner, which the installer is a member of without inherit) and a table in public asks for CREATE there,
  // which os_owner lacks (measured). Owned by supabase_admin, the child is tied to no chain role: its default
  // privileges in public name none (measured: supabase_admin, postgres, anon, authenticated, service_role), it has
  // no pg_shdepend row of a chain role, it inherits no constraint (a primary key is not inherited) — so §4.3 gives it
  // its inherits line alone.
  aChange(step, "§11.1 row 3 a table in public that inherits a table of os (the superuser): its inherits line, and nothing else of it; dropped: equal", {
    change: () => asTheSuperuser("create table public.snap_child () inherits (os.kinds)"),
    undo: () => asTheSuperuser("drop table public.snap_child"),
    actualOnly: ["inherits public.snap_child os.kinds 1"],
  });
}
