#!/usr/bin/env node
/**
 * B36 · Block 3 — PUT THE CONSTRUCTION ENGINE'S FUNCTION PRIVILEGES BACK TO
 * WHAT THE MIGRATION CHAIN SAYS THEY ARE.
 *
 * `scripts/b36/prove-window-preserves.mjs` builds the HOLDING's privilege shape
 * on the construction engine so the window's preserve-rule can be proved against
 * the state that actually broke — some functions open to PUBLIC, some restricted.
 * Building that fixture overwrites the engine's real grants, and the first time
 * it ran it left them overwritten: `tests/e8/alerts.test.ts` then failed,
 * correctly, because `authenticated` could call `fn_alerts_evaluate`, which the
 * chain deliberately restricts to `service_role`.
 *
 * The chain is the definition. This resets every SECURITY DEFINER function in
 * public/pgboss to the PostgreSQL default and replays every GRANT and REVOKE ON
 * FUNCTION that db/migrations carries, in file order — which is exactly what a
 * fresh bootstrap of the engine would leave behind.
 *
 * Construction engine only. It refuses to run against the company.
 *
 * Usage: node scripts/b36/reset-construction-function-grants.mjs
 */
import { spawn } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const CONTAINER = "supabase_db_DxB_Build";

function sh(argv, input) {
  return new Promise((resolve) => {
    const c = spawn(argv[0], argv.slice(1), { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    c.stdout.on("data", (d) => { stdout += d; });
    c.stderr.on("data", (d) => { stderr += d; });
    c.on("error", (e) => resolve({ code: -1, stdout, stderr: String(e) }));
    c.on("close", (code) => resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() }));
    c.stdin.end(input ?? "");
  });
}
async function psql(sql) {
  const r = await sh(["docker", "exec", "-i", CONTAINER, "psql", "-U", "supabase_admin",
                      "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-tA"], sql);
  if (r.code !== 0) throw new Error(`psql exited ${r.code}\n${r.stderr.slice(0, 2000)}`);
  return r.stdout;
}

/**
 * Blank out everything a semicolon can hide inside — dollar-quoted bodies,
 * `--` and block comments, and single-quoted strings — before the file is split
 * on semicolons.
 *
 * WHY, measured. A function body is full of semicolons, so splitting the raw file
 * cuts through it and the chunk that follows a body starts mid-statement. The
 * first version of this file did exactly that and silently DROPPED
 * `GRANT EXECUTE ON FUNCTION public.control_org_create_company(...) TO authenticated`
 * while keeping the `REVOKE ALL ... FROM PUBLIC, anon` nine lines below it — so
 * the replay left a function nobody could call, and `tests/c9/dashboard-doors.test.ts`
 * failed with "control_org_create_company (called from app/api/control/org/route.ts)".
 * A half-replayed pair is worse than no replay: it looks like it worked.
 *
 * The SECOND thing that hid a semicolon was a comment: the line above that very
 * grant reads `-- Execute grants: fns gate internally via fn_org_actor(); anon
 * never.` and the split landed inside it, so the chunk began " anon never."
 * instead of "GRANT". Blanking the bodies alone did not fix it; the comments and
 * string literals have to go first as well. A GRANT or REVOKE statement contains
 * none of those, so the statements this function keeps come through untouched.
 */
function maskForSplitting(sql) {
  sql = maskComments(sql);
  let out = "";
  let i = 0;
  while (i < sql.length) {
    const open = /\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$/y;
    open.lastIndex = i;
    const m = open.exec(sql);
    if (m && m.index === i) {
      const tag = m[0];
      const end = sql.indexOf(tag, i + tag.length);
      if (end === -1) { out += sql.slice(i); break; }
      // Keep the newlines so line numbers in any error still make sense.
      out += " ".repeat(tag.length) +
             sql.slice(i + tag.length, end).replace(/[^\n]/g, " ") +
             " ".repeat(tag.length);
      i = end + tag.length;
      continue;
    }
    out += sql[i];
    i += 1;
  }
  return maskStrings(out);
}

/** `-- to end of line` and block comments, blanked but not removed. */
function maskComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/--[^\n]*/g, (m) => " ".repeat(m.length));
}

/** Single-quoted literals, blanked. Doubled quotes inside them are handled. */
function maskStrings(sql) {
  return sql.replace(/'(?:[^']|'')*'/g, (m) => `'${" ".repeat(Math.max(0, m.length - 2))}'`);
}

export async function resetConstructionFunctionGrants() {
  // Every GRANT/REVOKE ... ON FUNCTION the chain carries, in the order a
  // bootstrap would apply them. Statements may wrap across lines, so the file is
  // split on semicolons rather than on newlines.
  const statements = [];
  for (const f of readdirSync(join(REPO, "db/migrations")).sort()) {
    if (!f.endsWith(".sql")) continue;
    const sql = maskForSplitting(readFileSync(join(REPO, "db/migrations", f), "utf8"));
    for (const raw of sql.split(";")) {
      const s = raw.replace(/--[^\n]*/g, "").trim().replace(/\s+/g, " ");
      if (!/^(GRANT|REVOKE)\b/i.test(s) || !/\bON FUNCTION\b/i.test(s)) continue;
      // A migration may grant on a signature a later migration replaced. A real
      // bootstrap succeeded because the signature existed at the time; replaying
      // the chain today must tolerate exactly that and nothing else.
      statements.push(
        `DO $b36$ BEGIN EXECUTE $b36q$${s}$b36q$; ` +
        `EXCEPTION WHEN undefined_function THEN NULL; END $b36$;`);
    }
  }

  const reset = `
    DO $$
    DECLARE f record; r text;
    BEGIN
      FOR f IN SELECT format('%I.%I(%s)', n.nspname, p.proname,
                             pg_get_function_identity_arguments(p.oid)) sig,
                      pg_get_userbyid(p.proowner) owner
                 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
                WHERE n.nspname IN ('public','pgboss') AND p.prosecdef LOOP
        FOR r IN SELECT rolname FROM pg_roles WHERE rolname NOT LIKE 'pg\\_%' LOOP
          EXECUTE format('REVOKE ALL ON FUNCTION %s FROM %I', f.sig, r);
        END LOOP;
        EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', f.sig);
        EXECUTE format('GRANT ALL ON FUNCTION %s TO %I', f.sig, f.owner);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO PUBLIC', f.sig);
      END LOOP;
    END $$;`;

  await psql(reset);
  await psql(statements.join("\n"));
  return statements.length;
}

// The repository path contains a space, so `file://${process.argv[1]}` and
// import.meta.url (which percent-encodes it) never match. Compare real paths.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const n = await resetConstructionFunctionGrants();
  console.log(`replayed ${n} function-privilege statements from db/migrations onto ${CONTAINER}`);
  const check = await psql(`
    SELECT has_function_privilege('authenticated','public.fn_alerts_evaluate()','EXECUTE')::text
        || '|' || has_function_privilege('anon','public.fn_alerts_evaluate()','EXECUTE')::text
        || '|' || has_function_privilege('service_role','public.fn_alerts_evaluate()','EXECUTE')::text;`);
  console.log(`fn_alerts_evaluate — authenticated|anon|service_role = ${check}  (chain says false|false|true)`);
  console.log(check === "false|false|true" ? "CHAIN_GRANTS_RESTORED" : "CHAIN_GRANTS_MISMATCH");
}
