#!/usr/bin/env node
/**
 * B36 · Block 3 — PUT THE COMPANY'S PRIVILEGES BACK EXACTLY AS THEY WERE.
 *
 * Why this file exists, written the day it was needed. The first version of the
 * one-way window took EXECUTE away from PUBLIC on 85 SECURITY DEFINER functions
 * and handed it back to "every role except dxb_reader". On the construction
 * engine every one of those functions was PUBLIC-executable, so that was exact.
 * ON THE COMPANY IT WAS NOT: 34 of the 85 were PUBLIC-executable and 51 were
 * deliberately restricted — and the blanket re-grant gave `anon`, the role an
 * unauthenticated browser gets, EXECUTE on all 85. The installer's own
 * blast-radius photograph caught it in the same run and refused to continue,
 * which is what it is for; but the SQL had already committed.
 *
 * This restores the truth from the holding's own record: the dated dump taken
 * before any of this work began (Block 0). pg_restore prints the exact GRANT and
 * REVOKE statements that were true then, and they are re-applied verbatim after
 * every affected object is reset to its default.
 *
 * It restores three things and nothing else:
 *   1. the EXECUTE privileges on every SECURITY DEFINER function in public/pgboss
 *   2. PUBLIC's write privileges on the pg_net queue tables
 *   3. PUBLIC's TEMPORARY privilege on the database
 * and it drops the dxb_reader role if it exists.
 *
 * Usage: node scripts/b36/restore-company-privileges.mjs [--dry-run]
 */
import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DUMP = join(homedir(), "backups/dxb/dxb-b36-pre-separation-2026-08-23.dump");
const CONTAINER = "supabase_db_DxB_Global_OS";
const dryRun = process.argv.includes("--dry-run");

function sh(argv, input) {
  return new Promise((resolve) => {
    const child = spawn(argv[0], argv.slice(1), { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });
    child.on("error", (e) => resolve({ code: -1, stdout, stderr: String(e) }));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
    if (input !== undefined) child.stdin.end(input); else child.stdin.end();
  });
}
const psql = (sql) =>
  sh(["docker", "exec", "-i", CONTAINER, "psql", "-U", "supabase_admin", "-d", "postgres",
      "-v", "ON_ERROR_STOP=1", "-tA"], sql);

const line = (s) => console.log(s);

(async () => {
  if (!existsSync(DUMP)) {
    console.error(`the pre-separation dump is not where the record says it is: ${DUMP}`);
    process.exit(2);
  }

  // ---- what the holding's own record says was true ------------------------
  const schema = await sh(["pg_restore", "--schema-only", "--no-owner", "-f", "-", DUMP]);
  if (schema.code !== 0) {
    console.error(schema.stderr.slice(0, 1000));
    process.exit(1);
  }
  const aclLines = schema.stdout.split("\n")
    .map((l) => l.trim())
    .filter((l) => /^(GRANT|REVOKE)\b/.test(l) && /\bON FUNCTION\b/.test(l));
  line(`the dump carries ${aclLines.length} function-privilege statements from before this work began`);

  // ---- the objects this session touched -----------------------------------
  const sigs = (await psql(`
    SELECT format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid))
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname IN ('public','pgboss') AND p.prosecdef ORDER BY 1;`))
    .stdout.split("\n").map((l) => l.trim()).filter(Boolean);
  line(`the engine carries ${sigs.length} security-definer functions in public/pgboss`);

  const roles = (await psql(
    `SELECT rolname FROM pg_roles WHERE rolname NOT LIKE 'pg\\_%' ORDER BY 1;`))
    .stdout.split("\n").map((l) => l.trim()).filter(Boolean);

  // ---- 1. reset every one of them to the PostgreSQL default ---------------
  // Default for a function is: the owner holds everything, PUBLIC holds EXECUTE.
  // Reaching that first means the dump's statements can be replayed verbatim on
  // top, and what they do not mention ends up default — which is exactly what a
  // dump not mentioning it means.
  const reset = sigs.flatMap((sig) => [
    `REVOKE ALL ON FUNCTION ${sig} FROM PUBLIC;`,
    ...roles.map((r) => `REVOKE ALL ON FUNCTION ${sig} FROM "${r}";`),
    `GRANT ALL ON FUNCTION ${sig} TO postgres;`,
    `GRANT EXECUTE ON FUNCTION ${sig} TO PUBLIC;`,
  ]);

  // ---- 2. replay the record ----------------------------------------------
  const replay = aclLines.filter((l) =>
    sigs.some((sig) => l.includes(sig.replace(/^public\./, "public."))
                    || l.includes(sig)));

  // ---- 3. the two other things this session moved -------------------------
  const hasReader = (await psql(
    `SELECT count(*) FROM pg_roles WHERE rolname = 'dxb_reader';`)).stdout.trim() === "1";

  const others = [
    `GRANT INSERT, UPDATE, DELETE, TRUNCATE ON TABLE net.http_request_queue TO PUBLIC;`,
    `GRANT INSERT, UPDATE, DELETE, TRUNCATE ON TABLE net._http_response TO PUBLIC;`,
    ...roles.filter((r) => r !== "supabase_admin").flatMap((r) => [
      `REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE net.http_request_queue FROM "${r}";`,
      `REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE net._http_response FROM "${r}";`,
    ]),
    `GRANT TEMPORARY ON DATABASE postgres TO PUBLIC;`,
    ...roles.filter((r) => r !== "postgres" && r !== "supabase_admin")
            .map((r) => `REVOKE TEMPORARY ON DATABASE postgres FROM "${r}";`),
    // DROP OWNED first: the role holds granted privileges and default-privilege
    // entries, and PostgreSQL refuses to drop a role anything still depends on.
    ...(hasReader ? [`DROP OWNED BY dxb_reader;`, `DROP ROLE dxb_reader;`] : []),
  ];

  const sql = ["BEGIN;", ...reset, ...replay, ...others, "COMMIT;"].join("\n");
  const outFile = "/tmp/claude-1000/-home-dxb-DxB-Global-OS/restore-company-privileges.sql";
  try { writeFileSync(outFile, sql + "\n"); line(`the exact statements are in ${outFile}`); } catch { /* not fatal */ }
  line(`reset statements: ${reset.length} · replayed from the dump: ${replay.length} · other: ${others.length}`);

  if (dryRun) { line("--dry-run: nothing applied"); return; }

  const r = await psql(sql);
  if (r.code !== 0) {
    console.error(r.stderr.slice(0, 3000));
    console.error("RESTORE_FAILED");
    process.exit(1);
  }

  // ---- 4. prove it, against the number measured before the mistake --------
  const check = await psql(`
    SELECT count(*) FILTER (WHERE has_function_privilege('public', p.oid, 'EXECUTE')),
           count(*) FILTER (WHERE has_function_privilege('anon', p.oid, 'EXECUTE')),
           count(*)
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname IN ('public','pgboss') AND p.prosecdef;`);
  const [pub, anon, total] = check.stdout.trim().split("|");
  line("");
  line(`  PUBLIC can execute : ${pub} of ${total}   (measured before the mistake, 2026-08-24: 34 of 85)`);
  line(`  anon   can execute : ${anon} of ${total}`);

  const net = await psql(`
    SELECT has_table_privilege('public','net.http_request_queue','INSERT')::text,
           has_database_privilege('public','postgres','TEMPORARY')::text,
           (SELECT count(*) FROM pg_roles WHERE rolname='dxb_reader')::text;`);
  const [netPub, tmpPub, reader] = net.stdout.trim().split("|");
  line(`  PUBLIC may write the pg_net queue : ${netPub}  (was true)`);
  line(`  PUBLIC holds TEMP on the database : ${tmpPub}  (was true)`);
  line(`  dxb_reader roles on the engine    : ${reader}  (was 0)`);

  if (pub === "34" && netPub === "true" && tmpPub === "true" && reader === "0") {
    line("");
    line("COMPANY_PRIVILEGES_RESTORED");
    return;
  }
  line("");
  line("RESTORE_INCOMPLETE — the numbers above do not match what was measured before.");
  process.exit(1);
})();
