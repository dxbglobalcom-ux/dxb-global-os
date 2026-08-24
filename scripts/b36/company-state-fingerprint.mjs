#!/usr/bin/env node
/**
 * B36 · Block 3 — WHAT THE COMPANY HELD, IN ONE NUMBER.
 *
 * The audit of 2026-08-24 requires the seal to prove it changed no DATA, and it
 * names the four things that must be identical before and after: the rows, the
 * large-object area, the sequences, and the audit records. The first version
 * proved only the rows — which is exactly why a sequence advance and a large
 * object could have happened without anything noticing.
 *
 * READ-ONLY. Every statement here is a SELECT, and it is run through the one-way
 * window itself where the window can reach, and as the administrator only for
 * what lives outside it (large objects and sequence values are not visible to a
 * role that may not touch them). Nothing is written, ever.
 *
 * Usage:  node scripts/b36/company-state-fingerprint.mjs [company|construction]
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

const TARGETS = {
  company: "supabase_db_DxB_Global_OS",
  construction: "supabase_db_DxB_Build",
};
const target = process.argv[2] ?? "company";
if (!TARGETS[target]) {
  console.error("usage: company-state-fingerprint.mjs [company|construction]");
  process.exit(2);
}

function psql(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", ["exec", "-i", TARGETS[target], "psql", "-U", "supabase_admin",
                                   "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-tA", "-q"],
                        { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });
    child.on("error", reject);
    child.on("close", (c) => (c === 0 ? resolve(stdout.trim()) : reject(new Error(stderr))));
    child.stdin.end(sql);
  });
}

const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

(async () => {
  // Counted for real — not an estimate off the planner — and in ONE statement,
  // because a temporary table would be a write and this file makes only SELECTs.
  const rows = await psql(`
    SELECT string_agg(t || '=' || n, E'\\n' ORDER BY t) FROM (
      SELECT c.relname AS t,
             (xpath('/row/c/text()',
                    query_to_xml(format('SELECT count(*) AS c FROM public.%I', c.relname),
                                 false, true, '')))[1]::text::bigint AS n
        FROM pg_class c JOIN pg_namespace nsp ON nsp.oid = c.relnamespace
       WHERE nsp.nspname = 'public' AND c.relkind = 'r'
    ) x;`);
  const total = rows.split("\n").reduce((a, l) => a + Number(l.split("=")[1] ?? 0), 0);
  const tables = rows.split("\n").length;

  const seqs = await psql(`
    SELECT coalesce(string_agg(s, E'\\n' ORDER BY s), '<none>') FROM (
      SELECT n.nspname || '.' || c.relname || '=' ||
             coalesce((SELECT last_value::text FROM pg_sequences q
                        WHERE q.schemaname = n.nspname AND q.sequencename = c.relname), 'null') AS s
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE c.relkind = 'S' AND n.nspname NOT IN ('pg_catalog','information_schema')
    ) x;`);

  const los = await psql("SELECT count(*) FROM pg_largeobject_metadata;");
  const audit = await psql(`
    SELECT (SELECT count(*) FROM audit_log) || '/' || (SELECT count(*) FROM hook_violations);`);

  console.log(`B36 · ${target} state fingerprint`);
  console.log(`  tables in public          : ${tables}`);
  console.log(`  rows in public            : ${total}`);
  console.log(`  row fingerprint           : ${sha(rows)}`);
  console.log(`  sequences (all schemas)   : ${seqs === "<none>" ? 0 : seqs.split("\n").length}`);
  console.log(`  sequence fingerprint      : ${sha(seqs)}`);
  console.log(`  large objects             : ${los}`);
  console.log(`  audit_log / hook_violations: ${audit}`);
  console.log(`STATE_FINGERPRINT ${sha(`${rows}\n${seqs}\n${los}\n${audit}`)}`);
})().catch((e) => {
  console.error(String(e?.message || e).slice(0, 2000));
  console.error("FINGERPRINT_FAILED");
  process.exit(1);
});
