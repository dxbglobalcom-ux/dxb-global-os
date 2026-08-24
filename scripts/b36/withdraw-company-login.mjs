#!/usr/bin/env node
/**
 * B36 · Block 3-bis — WITHDRAW THE CONSTRUCTION SITE'S LOGIN TO THE HOLDING.
 *
 * After this runs, the account `dxb_reader` does not exist on the company's
 * engine, and the credential the construction side used to hold is gone from the
 * repository. What is left in its place is `dxb_gateway`: the SAME identity, so
 * every privilege the sealed window carried moves with it and not one GRANT is
 * re-issued — and a new password that lives only at
 * ~/.config/dxb/company-gateway.env (mode 600), which is on the company's side
 * of the wall and is never mounted into the construction sandbox.
 *
 * WHY A RENAME AND NOT A DROP-AND-CREATE. The seal that made the window
 * read-only was audited class by class (13 classes, 0 leaking) and its first
 * version broke the holding for eleven minutes by handing EXECUTE back to every
 * role. Re-issuing that privilege set is the single most dangerous act in this
 * row. PostgreSQL keys every grant, default privilege and role setting to the
 * role's OID, so ALTER ROLE … RENAME carries all of them across untouched —
 * the account is withdrawn without the privilege matrix ever being rewritten.
 *
 * His law of 2026-08-17: name what stands on the thing being changed, then
 * measure it afterwards. This file photographs every role on the engine, the
 * window's own grants, settings and default privileges, and the company's whole
 * data fingerprint — before and after — and refuses to report success unless
 * everything except the name is identical.
 *
 * Usage:  node scripts/b36/withdraw-company-login.mjs [--check]
 */
import { spawnSync, execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync, chmodSync, existsSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const CONTAINER = "supabase_db_DxB_Global_OS";
const OLD = "dxb_reader";
const NEW = "dxb_gateway";
const ENV_FILE = join(process.env.HOME, ".config/dxb/company-gateway.env");
const UNDO = join(process.env.HOME, ".config/dxb/company-gateway-undo.sql");
const REPO_CREDENTIAL = join(REPO, "var/b36/company-window.env");
const checkOnly = process.argv.includes("--check");

const out = [];
const line = (s) => { out.push(s); console.log(s); };

/**
 * The company's own administrative hand: psql inside the engine's container.
 * `supabase_admin`, not `postgres` — measured 2026-08-24, `postgres` on a
 * Supabase stack holds neither CREATEROLE nor ADMIN on the window role and
 * PostgreSQL refuses the rename ("permission denied to rename role"). It is the
 * same role the window's own installer uses, and it is on the COMPANY's side of
 * the wall: the construction sandbox has no container, no socket and no docker.
 */
function sql(text) {
  const r = spawnSync("docker",
    ["exec", "-i", CONTAINER, "psql", "-U", "supabase_admin", "-d", "postgres", "-qtA", "-v", "ON_ERROR_STOP=1", "-c", text],
    { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`psql failed: ${(r.stderr || "").trim()}\n  sql: ${text.slice(0, 200)}`);
  return r.stdout.trim();
}

function fingerprint() {
  return execFileSync("node", [join(REPO, "scripts/b36/company-state-fingerprint.mjs"), "company"], { encoding: "utf8" })
    .split("\n").find((l) => l.startsWith("STATE_FINGERPRINT")).trim();
}

/** Everything that could possibly move when a role is renamed. */
function photograph(role) {
  return {
    roles: sql(`SELECT string_agg(rolname, ',' ORDER BY rolname) FROM pg_roles WHERE rolname NOT LIKE 'pg\\_%';`),
    tableGrants: sql(`SELECT count(*) FROM information_schema.role_table_grants WHERE grantee = '${role}';`),
    routineGrants: sql(`SELECT count(*) FROM information_schema.role_routine_grants WHERE grantee = '${role}';`),
    usageGrants: sql(`SELECT count(*) FROM information_schema.role_usage_grants WHERE grantee = '${role}';`),
    settings: sql(`SELECT coalesce(string_agg(s.setconfig::text, '|'), '') FROM pg_db_role_setting s JOIN pg_roles r ON r.oid = s.setrole WHERE r.rolname = '${role}';`),
    defaultAcl: sql(`SELECT count(*) FROM pg_default_acl d JOIN pg_roles r ON r.oid = d.defaclrole WHERE r.rolname = '${role}';`),
    attrs: sql(`SELECT rolcanlogin::text || '/' || rolsuper::text || '/' || rolcreatedb::text || '/' || rolcreaterole::text || '/' || rolbypassrls::text FROM pg_roles WHERE rolname = '${role}';`),
    memberships: sql(`SELECT coalesce(string_agg(g.rolname, ',' ORDER BY g.rolname), '') FROM pg_auth_members m JOIN pg_roles g ON g.oid = m.roleid JOIN pg_roles r ON r.oid = m.member WHERE r.rolname = '${role}';`),
  };
}

line("B36 · Block 3-bis — withdrawing the construction site's login to the holding");
line("");

const exists = sql(`SELECT count(*) FROM pg_roles WHERE rolname = '${OLD}';`) === "1";
const already = sql(`SELECT count(*) FROM pg_roles WHERE rolname = '${NEW}';`) === "1";

if (!exists && already) {
  line(`  ${OLD} is already withdrawn; ${NEW} holds the window.`);
  if (!existsSync(ENV_FILE)) { console.error(`  but the credential at ${ENV_FILE} is missing — re-mint it with --check off`); process.exit(1); }
  line("COMPANY_LOGIN_ALREADY_WITHDRAWN");
  process.exit(0);
}
if (!exists) { console.error(`  neither ${OLD} nor ${NEW} exists on the company engine — nothing to withdraw`); process.exit(2); }

const before = photograph(OLD);
const fpBefore = fingerprint();
line("  BEFORE");
line(`    roles on the engine        : ${before.roles.split(",").length}`);
line(`    ${OLD} table grants       : ${before.tableGrants}`);
line(`    ${OLD} routine grants     : ${before.routineGrants}`);
line(`    ${OLD} usage grants       : ${before.usageGrants}`);
line(`    ${OLD} default privileges : ${before.defaultAcl}`);
line(`    ${OLD} attributes         : login/super/createdb/createrole/bypassrls = ${before.attrs}`);
line(`    ${fpBefore}`);
line("");

if (checkOnly) { line("  --check: nothing changed."); process.exit(0); }

const password = randomBytes(24).toString("base64url");
sql(`ALTER ROLE ${OLD} RENAME TO ${NEW};`);
// The rename is the withdrawal; the new password makes the old one, wherever a
// copy of it may still sit, worthless.
sql(`ALTER ROLE ${NEW} PASSWORD '${password}';`);

const after = photograph(NEW);
const fpAfter = fingerprint();

const problems = [];
const expectRoles = before.roles.split(",").map((r) => (r === OLD ? NEW : r)).sort().join(",");
if (after.roles.split(",").sort().join(",") !== expectRoles) problems.push(`the list of roles changed by more than the rename`);
for (const k of ["tableGrants", "routineGrants", "usageGrants", "settings", "defaultAcl", "attrs", "memberships"]) {
  if (before[k] !== after[k]) problems.push(`${k}: ${before[k]} -> ${after[k]}`);
}
if (fpBefore !== fpAfter) problems.push(`the company's data moved: ${fpBefore} -> ${fpAfter}`);
if (sql(`SELECT count(*) FROM pg_roles WHERE rolname = '${OLD}';`) !== "0") problems.push(`${OLD} still exists`);

line("  AFTER");
line(`    ${OLD} on the engine      : ${sql(`SELECT count(*) FROM pg_roles WHERE rolname = '${OLD}';`)}  (was 1)`);
line(`    ${NEW} table grants      : ${after.tableGrants}  (${OLD} held ${before.tableGrants})`);
line(`    ${NEW} routine grants    : ${after.routineGrants}  (${OLD} held ${before.routineGrants})`);
line(`    ${NEW} default privileges: ${after.defaultAcl}  (${OLD} held ${before.defaultAcl})`);
line(`    ${NEW} attributes        : ${after.attrs}  (${OLD} had ${before.attrs})`);
line(`    ${fpAfter}`);
line("");

if (problems.length) {
  line("  BLAST_RADIUS_FAIL — something moved that was not the name:");
  for (const p of problems) line(`    · ${p}`);
  line(`  put it back: docker exec -i ${CONTAINER} psql -U postgres -d postgres -c "ALTER ROLE ${NEW} RENAME TO ${OLD};"`);
  process.exit(1);
}

mkdirSync(dirname(ENV_FILE), { recursive: true });
writeFileSync(ENV_FILE, `# B36 · Block 3-bis — the holding's read gateway credential.\n# The COMPANY's side of the wall. Never mounted into the construction sandbox.\nDXB_COMPANY_GATEWAY_URL=postgresql://${NEW}:${password}@127.0.0.1:54322/postgres\n`, { mode: 0o600 });
chmodSync(ENV_FILE, 0o600);
writeFileSync(UNDO, `-- B36 · Block 3-bis — the exact way back. A new password must be minted after it.\nALTER ROLE ${NEW} RENAME TO ${OLD};\n`, { mode: 0o600 });

// The construction side's own copy of the old credential is the thing being
// withdrawn. It goes now, not later.
let removed = "was already gone";
if (existsSync(REPO_CREDENTIAL)) { unlinkSync(REPO_CREDENTIAL); removed = "deleted"; }

line(`    credential written        : ${ENV_FILE} (mode 600, outside the repository)`);
line(`    the way back              : ${UNDO}`);
line(`    construction's old copy   : ${REPO_CREDENTIAL} — ${removed}`);
line("");
line("  Every privilege moved with the identity. Not one GRANT was re-issued.");
line("COMPANY_LOGIN_WITHDRAWN");
