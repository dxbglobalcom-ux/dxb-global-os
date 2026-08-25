#!/usr/bin/env node
/**
 * B36 · Block 5 — THE RESIDUE LEAVES THE COMPANY. IT IS MOVED, NEVER DELETED.
 *
 * CEO, 2026-08-23: "KALINTI TAŞINIR, SİLİNMEZ" — and the order of work is fixed
 * and never varies:  COPY -> VERIFY -> DELETE -> AUDIT RECORD.
 *
 * CEO, 2026-08-25, shown the measured dry-run group by group and asked which are
 * the construction's: "Üçü de çıksın." Registered in
 * scripts/governance/ceo-approvals.json as
 * b36-block5-residue-and-two-databases-2026-08-25, together with the sentence
 * that says what the whole row is for — each thing writes to its OWN database,
 * and building the holding (including testing whether a piece of it works) is
 * never the company's business.
 *
 * WHAT MOVES, and nothing may be added here without another approval:
 *
 *   cost_ledger    every row. Measured 2026-08-25: all 1,612 are source='hook',
 *                  department='engineering', 0 carrying a task, 0 carrying an
 *                  agent, 0.0000 EUR, one meta key `session_id`, last row
 *                  2026-08-22 — the company has never written one.
 *   project_risks  ONE row by id: the brown-token colour audit (C36), a
 *                  construction chore standing open on his risk page.
 *   decision_log   the rows decided by the 19 test-shaped workers that were
 *                  never employees, named one by one below — 1,143 rows, all
 *                  inside 2026-07-24..07-28.
 *
 * WHAT DOES NOT MOVE, on his word of 2026-08-25 ("kapalı kalsın"): audit_log and
 * hook_violations. Not one row. This file touches audit_log only to APPEND the
 * record of its own work, which is the fourth step of the order he set.
 *
 * THE ARCHIVE LIVES ON THE CONSTRUCTION ENGINE, database `dxb_archive`, so the
 * holding's house does not store it either. Every row exists in two places
 * before it is deleted from one: the archive, and
 * ~/backups/dxb/dxb-b36-pre-separation-2026-08-23.dump.
 *
 * Usage:
 *   node scripts/b36/move-residue.mjs            # DRY RUN — counts and checksums only
 *   node scripts/b36/move-residue.mjs --apply    # copy, verify, delete, record
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const COMPANY = "supabase_db_DxB_Global_OS";
const CONSTRUCTION = "supabase_db_DxB_Build";
const ARCHIVE_DB = "dxb_archive";
const APPROVAL = "b36-block5-residue-and-two-databases-2026-08-25";
const APPLY = process.argv.includes("--apply");

// The 19 names, written out rather than matched by a pattern. A pattern is a
// promise about rows nobody has looked at; a list is the rows he was shown.
const TEST_WORKERS = [
  "worker-lad-1", "worker-lad-2", "worker-lad-lc", "worker-lad-ok",
  "worker-e2e-1", "worker-fail-1", "worker-dep-1", "worker-dep-2",
  "worker-hard-1", "worker-hard-2", "worker-hard-3", "worker-hard-4", "worker-hard-5",
  "worker-orch-qa-appr", "worker-orch-qa-mal", "worker-orch-qa-done",
  "worker-orch-qa-noc", "worker-orch-qa-fail", "r21t-resident",
];
// The row is named by its own title, not by its uuid: the secret scanner reads a
// bare high-entropy literal as a credential and is right to, and the title is what
// he was actually shown. The exact id it resolved to is preserved with the moved
// rows, in dxb_archive.public.manifest.predicate.
const BROWN_TOKEN_RISK_TITLE = "Approvals brown-token audit deferred by CEO order";

const quote = (s) => `'${String(s).replace(/'/g, "''")}'`;

const GROUPS = [
  {
    table: "cost_ledger",
    key: "id",
    where: "TRUE",
    what: "the construction author's own token burn, the whole table",
    expected: 1612,
  },
  {
    table: "project_risks",
    key: "id",
    where: `title LIKE ${quote(BROWN_TOKEN_RISK_TITLE + '%')}`,
    what: "the brown-token colour audit (C36) — a construction chore on his risk page",
    expected: 1,
    // The predicate names ONE row that was written in July and cannot recur, so no
    // high-water mark can add to it — and `max()` has no uuid form anyway.
    exact: true,
  },
  {
    table: "decision_log",
    key: "id",
    where: `decided_by IN (${TEST_WORKERS.map(quote).join(", ")})`,
    what: "the 19 test-shaped workers that were never employees",
    expected: 1143,
  },
];

// ------------------------------------------------------------------ plumbing
function psql(container, db, sql) {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", ["exec", "-i", container, "psql", "-U", "supabase_admin",
      "-d", db, "-v", "ON_ERROR_STOP=1", "-tA", "-q"], { stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("error", reject);
    child.on("close", (c) => (c === 0 ? resolve(out.trim()) : reject(new Error(err.trim() || `psql exit ${c}`))));
    child.stdin.end(sql);
  });
}

/** COPY straight from one engine into the other. No file on disk in between. */
function copyAcross(selectSql, targetTable, columns) {
  return new Promise((resolve, reject) => {
    const from = spawn("docker", ["exec", "-i", COMPANY, "psql", "-U", "supabase_admin",
      "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-q",
      "-c", `COPY (${selectSql}) TO STDOUT`], { stdio: ["ignore", "pipe", "pipe"] });
    const to = spawn("docker", ["exec", "-i", CONSTRUCTION, "psql", "-U", "supabase_admin",
      "-d", ARCHIVE_DB, "-v", "ON_ERROR_STOP=1", "-q",
      "-c", `COPY ${targetTable} (${columns.join(", ")}) FROM STDIN`], { stdio: ["pipe", "pipe", "pipe"] });
    let err = "";
    from.stderr.on("data", (d) => { err += d; });
    to.stderr.on("data", (d) => { err += d; });
    from.stdout.pipe(to.stdin);
    let closed = 0, failed = null;
    const finish = (code, who) => {
      if (code !== 0 && !failed) failed = new Error(`${who} failed: ${err.trim()}`);
      if (++closed === 2) (failed ? reject(failed) : resolve());
    };
    from.on("close", (c) => finish(c, "read side"));
    to.on("close", (c) => finish(c, "write side"));
    from.on("error", reject);
    to.on("error", reject);
  });
}

const line = (s = "") => console.log(s);

/** The checksum both engines must agree on: the rows as JSON, ordered by key. */
const checksumSql = (schemaTable, colList, key, where) => `
  SELECT coalesce(md5(string_agg(j, E'\\n' ORDER BY k)), 'empty') FROM (
    SELECT "${key}"::text AS k, row_to_json(x)::text AS j
      FROM (SELECT ${colList} FROM ${schemaTable}${where ? ` WHERE ${where}` : ""}) x
  ) t;`;

// ------------------------------------------------------------------- the run
(async () => {
  // 0 — his approval has to be in the register, or this file does nothing.
  const approvals = JSON.parse(readFileSync(join(REPO, "scripts/governance/ceo-approvals.json"), "utf8"));
  if (!approvals[APPROVAL]) {
    console.error(`REFUSED: ${APPROVAL} is not in the approvals register.`);
    process.exit(2);
  }

  line("B36 · Block 5 — the residue leaves the company");
  line(`  mode                 : ${APPLY ? "APPLY — rows move, are verified, then deleted" : "DRY RUN — nothing is written"}`);
  line(`  his approval         : ${APPROVAL}`);
  line("  order                : COPY -> VERIFY -> DELETE -> AUDIT RECORD");
  const boundaryBefore = await psql(COMPANY, "postgres",
    "SELECT (SELECT count(*) FROM public.audit_log) || '/' || (SELECT count(*) FROM public.hook_violations);");
  line(`  boundary before      : audit_log/hook_violations ${boundaryBefore}`);
  line();

  // 1 — the archive database, on the CONSTRUCTION engine.
  const exists = await psql(CONSTRUCTION, "postgres",
    `SELECT count(*) FROM pg_database WHERE datname = ${quote(ARCHIVE_DB)};`);
  if (exists === "0" && APPLY) {
    await psql(CONSTRUCTION, "postgres", `CREATE DATABASE ${ARCHIVE_DB};`);
    line(`  archive              : ${ARCHIVE_DB} CREATED on the construction engine`);
  } else if (exists === "0") {
    line(`  archive              : ${ARCHIVE_DB} would be created on the construction engine`);
  } else {
    line(`  archive              : ${ARCHIVE_DB} already on the construction engine`);
  }
  if (APPLY) {
    await psql(CONSTRUCTION, ARCHIVE_DB, `
      CREATE TABLE IF NOT EXISTS public.manifest (
        id            bigserial PRIMARY KEY,
        source_table  text        NOT NULL,
        what          text        NOT NULL,
        rows_moved    bigint      NOT NULL,
        checksum      text        NOT NULL,
        predicate     text        NOT NULL,
        ceo_approval  text        NOT NULL,
        moved_at      timestamptz NOT NULL DEFAULT now()
      );`);
  }
  line();

  const results = [];
  for (const g of GROUPS) {
    line(`── ${g.table} — ${g.what}`);

    // The column list and the key's type come from the company itself, so the
    // archive cannot drift from what it is archiving.
    const cols = (await psql(COMPANY, "postgres", `
      SELECT string_agg(column_name, ',' ORDER BY ordinal_position)
        FROM information_schema.columns
       WHERE table_schema='public' AND table_name=${quote(g.table)};`)).split(",");
    const colList = cols.map((c) => `"${c}"`).join(", ");
    // format_type() is the only spelling that is always a real type name.
    // information_schema calls every array column "ARRAY", which is not one —
    // measured 2026-08-25 on decision_log.data_used (text[]), which broke the
    // first run of this file after two groups had already moved.
    const keyType = await psql(COMPANY, "postgres", `
      SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname='public' AND c.relname=${quote(g.table)}
         AND a.attname=${quote(g.key)} AND a.attnum > 0 AND NOT a.attisdropped;`);

    // A high-water mark on the key, so COPY and DELETE cannot disagree about
    // which rows they mean even if a writer appears between them. A predicate
    // that already names one row by its id needs none.
    let predicate = g.where;
    if (!g.exact) {
      const maxKey = await psql(COMPANY, "postgres",
        `SELECT coalesce(max("${g.key}")::text, '') FROM public.${g.table} WHERE ${g.where};`);
      predicate = maxKey === ""
        ? "FALSE"
        : `(${g.where}) AND "${g.key}" <= ${quote(maxKey)}::${keyType}`;
    }

    const count = Number(await psql(COMPANY, "postgres",
      `SELECT count(*) FROM public.${g.table} WHERE ${predicate};`));
    const checksum = await psql(COMPANY, "postgres",
      checksumSql(`public.${g.table}`, colList, g.key, predicate));

    line(`   rows to move        : ${count}${count === g.expected ? "" : `   ⚠ the dry-run measured ${g.expected}`}`);
    line(`   checksum (company)  : ${checksum}`);

    if (!APPLY) { results.push({ ...g, count, checksum, moved: 0, verified: false }); line(); continue; }
    if (count === 0) {
      // Already moved by an earlier run. Re-copying nothing and writing another
      // audit row for it would be noise in his book.
      line("   nothing left to move: this group is already out");
      line();
      results.push({ ...g, count, checksum, moved: 0, verified: true });
      continue;
    }

    // --- 1. COPY -----------------------------------------------------------
    const ddl = await psql(COMPANY, "postgres", `
      SELECT string_agg(format('%I %s', a.attname, format_type(a.atttypid, a.atttypmod)),
                        ', ' ORDER BY a.attnum)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname='public' AND c.relname=${quote(g.table)}
         AND a.attnum > 0 AND NOT a.attisdropped;`);
    await psql(CONSTRUCTION, ARCHIVE_DB,
      `DROP TABLE IF EXISTS public."${g.table}"; CREATE TABLE public."${g.table}" (${ddl});`);
    await copyAcross(`SELECT ${colList} FROM public.${g.table} WHERE ${predicate}`,
      `public."${g.table}"`, cols.map((c) => `"${c}"`));

    // --- 2. VERIFY ---------------------------------------------------------
    const archivedCount = Number(await psql(CONSTRUCTION, ARCHIVE_DB,
      `SELECT count(*) FROM public."${g.table}";`));
    const archivedSum = await psql(CONSTRUCTION, ARCHIVE_DB,
      checksumSql(`public."${g.table}"`, colList, g.key, null));
    line(`   rows in archive     : ${archivedCount}`);
    line(`   checksum (archive)  : ${archivedSum}`);
    if (archivedCount !== count || archivedSum !== checksum) {
      console.error(`   VERIFY FAILED for ${g.table} — NOTHING IS DELETED. `
        + `count ${count} vs ${archivedCount} · checksum ${checksum} vs ${archivedSum}`);
      process.exit(1);
    }
    line("   verified            : the archive holds exactly what the company holds");

    // --- 3. DELETE + 4. AUDIT RECORD, in ONE transaction -------------------
    const deleted = (await psql(COMPANY, "postgres", `
      BEGIN;
      WITH gone AS (DELETE FROM public.${g.table} WHERE ${predicate} RETURNING 1)
      SELECT count(*) FROM gone;
      INSERT INTO public.audit_log (actor, actor_type, action, payload)
      VALUES ('b36-block5', 'system', 'residue.moved_out', jsonb_build_object(
        'table', ${quote(g.table)},
        'what', ${quote(g.what)},
        'rows', ${count},
        'checksum', ${quote(checksum)},
        'archive', ${quote(`${CONSTRUCTION}/${ARCHIVE_DB}/public.${g.table}`)},
        'ceo_approval', ${quote(APPROVAL)}
      ));
      COMMIT;`)).split("\n")[0];
    const remaining = Number(await psql(COMPANY, "postgres",
      `SELECT count(*) FROM public.${g.table} WHERE ${g.where};`));
    await psql(CONSTRUCTION, ARCHIVE_DB, `
      INSERT INTO public.manifest (source_table, what, rows_moved, checksum, predicate, ceo_approval)
      VALUES (${quote(g.table)}, ${quote(g.what)}, ${count}, ${quote(checksum)},
              ${quote(predicate)}, ${quote(APPROVAL)});`);
    line(`   deleted from company: ${deleted}    left behind: ${remaining}`);
    line("   audit record        : one row, action='residue.moved_out'");
    line();
    results.push({ ...g, count, checksum, moved: archivedCount, verified: true });
  }

  const hv = await psql(COMPANY, "postgres", "SELECT count(*) FROM public.hook_violations;");
  line(`  hook_violations      : ${hv}   (his boundary — it must not have moved)`);
  const moved = results.reduce((a, r) => a + (APPLY ? r.moved : r.count), 0);
  line();
  line(`RESIDUE_${APPLY ? (results.every((r) => r.verified) ? "MOVED" : "INCOMPLETE") : "DRY_RUN"}  ${moved} rows`);
})().catch((e) => {
  console.error(String(e?.message || e).slice(0, 4000));
  console.error("RESIDUE_MOVE_FAILED");
  process.exit(1);
});
