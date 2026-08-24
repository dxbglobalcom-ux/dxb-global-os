#!/usr/bin/env node
/**
 * B36 · Block 3 — THE RED-FIRST PROOF FOR THE MISTAKE THAT WAS ACTUALLY MADE.
 *
 * On 2026-08-24 the first version of the one-way window took EXECUTE away from
 * PUBLIC on 85 SECURITY DEFINER functions and handed it back to every role on
 * the engine. On the construction engine that was exact, because PUBLIC held all
 * 85 there. ON THE HOLDING IT WAS NOT: 34 were open to PUBLIC and 51 were
 * deliberately restricted, so the blanket re-grant handed `anon` — the role an
 * unauthenticated browser gets — the right to call `control_records_purge` and
 * `decide_approvals`. It was caught by the installer's own blast-radius
 * photograph and undone from the holding's dated dump. This file makes sure a
 * later session cannot reintroduce it.
 *
 * It builds the holding's SHAPE on the disposable construction engine — a mixed
 * state where some functions are open to PUBLIC and some are restricted to
 * `authenticated` alone — and then requires that installing the window changes
 * nothing for any role but dxb_reader.
 *
 * IT PROVES ITSELF FIRST: before trusting a clean result it re-runs the OLD,
 * BROKEN rule against the same fixture and requires it to be caught. A guard
 * that has never been seen catching anything is not a guard.
 *
 * Runs ONLY against the construction engine. It refuses to touch the company.
 *
 * IT CLEANS UP AFTER ITSELF. Building the fixture overwrites the engine's real
 * grants, and the first time this ran it left them overwritten — the battery
 * then failed on tests/e8/alerts.test.ts, correctly, because `authenticated`
 * could call `fn_alerts_evaluate`, which the chain restricts to `service_role`.
 * Whatever happens, the chain's own GRANT and REVOKE statements are replayed at
 * the end and the window is rebuilt, so the engine is left as a fresh bootstrap
 * would leave it.
 *
 * Usage: node scripts/b36/prove-window-preserves.mjs
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { resetConstructionFunctionGrants } from "./reset-construction-function-grants.mjs";

const CONTAINER = "supabase_db_DxB_Build";
const REPO = fileURLToPath(new URL("../..", import.meta.url));

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
/**
 * Throws on a non-zero exit. An earlier draft ignored it and a DO block that had
 * failed outright was read as "the broken rule changed nothing" — a silent
 * failure dressed up as a clean result, which is the one outcome this file
 * exists to make impossible.
 */
async function psql(sql) {
  const r = await sh(["docker", "exec", "-i", CONTAINER, "psql", "-U", "supabase_admin",
                      "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-tA"], sql);
  if (r.code !== 0) throw new Error(`psql exited ${r.code}\n${r.stderr.slice(0, 1500)}`);
  return r;
}

const line = (s) => console.log(s);

/** Which roles can execute which of the security-definer functions, right now. */
async function matrix() {
  const out = (await psql(`
    SELECT r.rolname || '|' || p.oid || '|' ||
           has_function_privilege(r.rolname, p.oid, 'EXECUTE')::text
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     CROSS JOIN pg_roles r
     WHERE n.nspname IN ('public','pgboss') AND p.prosecdef
       AND r.rolname NOT LIKE 'pg\\_%' AND r.rolname <> 'dxb_reader'
     ORDER BY 1;`)).stdout;
  const m = new Map();
  for (const l of out.split("\n").filter(Boolean)) {
    const [role, oid, can] = l.split("|");
    m.set(`${role}:${oid}`, can);
  }
  return m;
}
const diffCount = (a, b) => {
  let n = 0;
  for (const k of new Set([...a.keys(), ...b.keys()])) if (a.get(k) !== b.get(k)) n += 1;
  return n;
};

(async () => {
  const who = (await psql(
    `SELECT current_database() || ' @ ' || (SELECT system_identifier FROM pg_control_system());`)).stdout;
  line(`B36 · Block 3 — does the window preserve what it found?  (${CONTAINER})`);
  line(`  engine: ${who}`);

  // ---- 0. clean slate: no window, every function back to its default -------
  await psql(`
    DO $$
    DECLARE f record; r text;
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='dxb_reader') THEN
        EXECUTE 'DROP OWNED BY dxb_reader';
        EXECUTE 'DROP ROLE dxb_reader';
      END IF;
      -- A real default, not just "PUBLIC may". Earlier runs on this disposable
      -- engine left explicit grants on every role, and a fixture built on top of
      -- those would have proved nothing.
      FOR f IN SELECT format('%I.%I(%s)', n.nspname, p.proname,
                             pg_get_function_identity_arguments(p.oid)) sig
                 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                WHERE n.nspname IN ('public','pgboss') AND p.prosecdef LOOP
        FOR r IN SELECT rolname FROM pg_roles WHERE rolname NOT LIKE 'pg\\_%' LOOP
          EXECUTE format('REVOKE ALL ON FUNCTION %s FROM %I', f.sig, r);
        END LOOP;
        EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', f.sig);
        EXECUTE format('GRANT ALL ON FUNCTION %s TO postgres', f.sig);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO PUBLIC', f.sig);
      END LOOP;
      EXECUTE 'GRANT TEMPORARY ON DATABASE ' || quote_ident(current_database()) || ' TO PUBLIC';
      EXECUTE 'GRANT INSERT, UPDATE, DELETE, TRUNCATE ON TABLE net.http_request_queue TO PUBLIC';
      EXECUTE 'GRANT INSERT, UPDATE, DELETE, TRUNCATE ON TABLE net._http_response TO PUBLIC';
    END $$;`);

  // ---- 1. the fixture: the HOLDING's shape, not this engine's --------------
  // 51 of the 85 restricted to `authenticated` alone, exactly as the company
  // has them; the rest left open to PUBLIC.
  const restricted = Number((await psql(`
    DO $$
    DECLARE f record; i int := 0;
    BEGIN
      FOR f IN SELECT format('%I.%I(%s)', n.nspname, p.proname,
                             pg_get_function_identity_arguments(p.oid)) sig
                 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                WHERE n.nspname IN ('public','pgboss') AND p.prosecdef
                ORDER BY p.oid LIMIT 51 LOOP
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', f.sig);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f.sig);
        i := i + 1;
      END LOOP;
      RAISE NOTICE 'fixture: % functions restricted', i;
    END $$;
    SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE n.nspname IN ('public','pgboss') AND p.prosecdef
       AND NOT has_function_privilege('anon', p.oid, 'EXECUTE');`)).stdout.split("\n").pop());
  line(`  fixture built: ${restricted} functions that \`anon\` must NOT be able to call`);
  if (restricted === 0) { line("FIXTURE_FAILED"); process.exit(1); }

  const before = await matrix();

  // ---- 2. THE OLD, BROKEN RULE — it must be caught ------------------------
  await psql(`
    DO $$
    DECLARE f record; r text;
    BEGIN
      EXECUTE 'CREATE ROLE dxb_reader LOGIN';
      FOR f IN SELECT format('%I.%I(%s)', n.nspname, p.proname,
                             pg_get_function_identity_arguments(p.oid)) sig
                 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                WHERE n.nspname IN ('public','pgboss') AND p.prosecdef LOOP
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', f.sig);
        FOR r IN SELECT rolname FROM pg_roles
                  WHERE rolname NOT LIKE 'pg\\_%' AND rolname <> 'dxb_reader' LOOP
          EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO %I', f.sig, r);
        END LOOP;
      END LOOP;
    END $$;`);
  const afterBroken = await matrix();
  const brokenChanges = diffCount(before, afterBroken);
  line(`  the OLD rule changed ${brokenChanges} privileges belonging to other roles`);
  if (brokenChanges === 0) {
    line("  THE GUARD IS BLIND — it did not notice the rule that actually broke the company.");
    line("PRESERVE_PROOF_INVALID");
    process.exit(1);
  }
  const anonGain = Number((await psql(`
    SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE n.nspname IN ('public','pgboss') AND p.prosecdef
       AND has_function_privilege('anon', p.oid, 'EXECUTE');`)).stdout);
  line(`  under the OLD rule \`anon\` could call ${anonGain} of the functions — the defect, reproduced`);

  // ---- 3. back to the fixture, then THE RULE THAT SHIPS -------------------
  await psql(`
    DO $$
    DECLARE f record; r text;
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='dxb_reader') THEN
        EXECUTE 'DROP OWNED BY dxb_reader'; EXECUTE 'DROP ROLE dxb_reader';
      END IF;
      FOR f IN SELECT p.oid,
                      format('%I.%I(%s)', n.nspname, p.proname,
                             pg_get_function_identity_arguments(p.oid)) sig
                 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                WHERE n.nspname IN ('public','pgboss') AND p.prosecdef LOOP
        FOR r IN SELECT rolname FROM pg_roles WHERE rolname NOT LIKE 'pg\\_%' LOOP
          EXECUTE format('REVOKE ALL ON FUNCTION %s FROM %I', f.sig, r);
        END LOOP;
        EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', f.sig);
        EXECUTE format('GRANT ALL ON FUNCTION %s TO postgres', f.sig);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO PUBLIC', f.sig);
      END LOOP;
      FOR f IN SELECT format('%I.%I(%s)', n.nspname, p.proname,
                             pg_get_function_identity_arguments(p.oid)) sig
                 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                WHERE n.nspname IN ('public','pgboss') AND p.prosecdef
                ORDER BY p.oid LIMIT 51 LOOP
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', f.sig);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f.sig);
      END LOOP;
    END $$;`);
  const refixed = diffCount(before, await matrix());
  if (refixed !== 0) {
    line(`  could not rebuild the fixture (${refixed} privileges differ) — the proof would be meaningless`);
    line("PRESERVE_PROOF_INVALID");
    process.exit(1);
  }

  const shipped = await sh(["node", join(REPO, "scripts/b36/install-company-window.mjs"), "construction"]);
  const clean = shipped.stdout.includes("BLAST_RADIUS_CLEAN");
  const after = await matrix();
  const shippedChanges = diffCount(before, after);
  const anonAfter = Number((await psql(`
    SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE n.nspname IN ('public','pgboss') AND p.prosecdef
       AND has_function_privilege('anon', p.oid, 'EXECUTE');`)).stdout);

  line("");
  line(`  the SHIPPED rule changed ${shippedChanges} privileges belonging to other roles   <-- must be 0`);
  line(`  \`anon\` can call ${anonAfter} functions — before the window it was ${85 - restricted}`);
  line(`  the installer's own verdict: ${clean ? "BLAST_RADIUS_CLEAN" : "BLAST_RADIUS_FAIL"}`);

  const verdict = shippedChanges === 0 && clean && anonAfter === 85 - restricted;

  await restore();

  if (verdict) {
    line("");
    line("ANSWER: the window takes nothing from anyone but itself, and gives nothing to anyone.");
    line("WINDOW_PRESERVES");
    return;
  }
  line("");
  line("WINDOW_DOES_NOT_PRESERVE");
  process.exit(1);
})().catch(async (e) => {
  console.error(String(e?.message || e).slice(0, 2000));
  try { await restore(); } catch (r) { console.error(`cleanup also failed: ${r}`); }
  console.error("PRESERVE_PROOF_FAILED");
  process.exit(1);
});

/**
 * Put the engine back the way a fresh bootstrap leaves it: the chain's own
 * function grants, then the window rebuilt on top of them.
 */
async function restore() {
  const n = await resetConstructionFunctionGrants();
  const rebuilt = await sh(["node", join(REPO, "scripts/b36/install-company-window.mjs"), "construction"]);
  line(`  cleanup: ${n} chain grants replayed, window rebuilt ` +
       `(${rebuilt.stdout.includes("WINDOW_INSTALLED") ? "ok" : "FAILED"})`);
}
