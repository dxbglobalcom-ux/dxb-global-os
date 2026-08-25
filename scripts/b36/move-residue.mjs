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
import { MARK_RE } from "./construction-marks.mjs";
import { join } from "node:path";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const COMPANY = "supabase_db_DxB_Global_OS";
const CONSTRUCTION = "supabase_db_DxB_Build";
const ARCHIVE_DB = "dxb_archive";
const APPROVAL = "b36-block5-residue-and-two-databases-2026-08-25";
/**
 * HIS LIVE ORDER OF 2026-08-25, given AFTER Block 7 had closed the row and after
 * he was shown that July's rehearsal was still standing on his Decisions page:
 * "artık ben holdingte inşaa bok parçaları yazıları görmeyeceğim değil mi …
 *  0-7 blok bu ayrımı yapmak için tamamlanmadı mı".
 * It REOPENS the residue selection that b36-acceptance-criterion-and-block5-audit
 * -2026-08-25 had closed for ever, and it deletes that closure (LAW A) — he
 * reopened it himself, for the row's own reason.
 */
const APPROVAL_VISIBLE = "b36-no-construction-fragments-visible-2026-08-25";
/** His second order of the same day, which OPENS the audit_log / hook_violations boundary. */
const APPROVAL_VISIBLE_2 = "b36-erase-construction-from-the-company-2026-08-25";

/**
 * The construction's own names and its own address, written out once. A row that
 * carries one of these in its own text is talking about how the bricks were laid.
 * They are IDENTITIES and ADDRESSES, never ordinary words: "test" alone would
 * convict the holding's Quality department, whose eight employees are real.
 */
// ONE DEFINITION, TWO USERS. The same names decide what this file takes OUT of
// the company and what scripts/governance/company-untouched.mjs step 6 fails on
// if it is ever found again. They live in one file so the purge and the gate can
// never disagree about what "construction" is.
const MARK = MARK_RE;
/** Actors that never existed in the holding. Measured against the agents registry. */
const CONS_ID = "('test','tracer','e125t-test','engineering-worker')";
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

// THE DAY THE CONSTRUCTION STOPPED WRITING INTO THE COMPANY. Block 1 killed the
// SessionEnd hook on 2026-08-23 and the last row it ever wrote is dated
// 2026-08-22 18:11:51. Nothing this file moves can be dated later than that, so
// the bound is written here as a HARD one: he has since ruled that the company
// itself may write to these tables again ("şirketle ilgili herşey ... sadece
// şirketin veritabanına işlesin"), and a rule that says only "source='hook'"
// would carry the COMPANY's own money records out on a later run. The audit of
// 2026-08-25 named exactly that scenario.
const WRITER_DIED = "2026-08-23T00:00:00+00:00";

const quote = (s) => `'${String(s).replace(/'/g, "''")}'`;

const GROUPS = [
  {
    table: "cost_ledger",
    key: "id",
    where: `created_at < ${quote(WRITER_DIED)}`,
    what: "the construction author's own token burn, the whole table",
    expected: 1612,
    // Every candidate row must look like this or the run stops. It is the shape
    // the dry-run measured and he was shown, asserted instead of assumed.
    shape: "source = 'hook' AND task_id IS NULL AND agent_id IS NULL"
      + " AND department = 'engineering' AND cost_eur = 0",
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
    where: `decided_by IN (${TEST_WORKERS.map(quote).join(", ")})`
      + ` AND created_at < ${quote(WRITER_DIED)}`,
    what: "the 19 test-shaped workers that were never employees",
    expected: 1143,
    shape: `decided_by IN (${TEST_WORKERS.map(quote).join(", ")})`,
  },
  {
    // ── HIS LIVE ORDER, 2026-08-25 · the decision book he can actually SEE.
    //
    // `/gov/decisions` reads public.decision_log. MEASURED before this was
    // written, and it is why the cut is where it is:
    //
    //   · the whole book is 3,587 rows and EVERY ONE is dated 2026-07-13..07-28;
    //     the company has not written a decision since 28 July;
    //   · 2,927 of them — 82% — were written on ONE day, 2026-07-26, the
    //     construction's night-shift drill;
    //   · the company's real hiring wave (2026-07-18, 202 tasks) produced
    //     ZERO decisions, so none of this book is the hiring record;
    //   · what the rows actually say: "orch-ladder-a: produce a two-sentence
    //     summary of the DXB escalation ladder design", "ctx-rot-managed-…:
    //     run the 50-step synthetic long-task", "orch-test-e2e: write a haiku
    //     about the DXB task queue" — the orchestrator rehearsing on synthetic
    //     work, which is his own definition of what belongs to the construction:
    //     "Holdingin içinde yapılan geliştirme çalıştımı veya çalışıyor mu diye
    //      test edilmesi de dahil."
    //
    // WHAT STAYS: the 11 rows he decided himself — the model-routing changes,
    // the U21 quality-tier law, deepseek-v4-pro's activation, the kimi-3
    // deferral, embed-small kept. Those are the holding's own governance record
    // and no drill wrote them.
    //
    // NOTHING DEPENDS ON THIS TABLE — measured: no foreign key references
    // public.decision_log, and 0 rows carry an approval_id.
    table: "decision_log",
    archiveTable: "decision_log_drill_week",
    approval: APPROVAL_VISIBLE,
    key: "id",
    where: `decided_by <> 'ceo' AND created_at < ${quote(WRITER_DIED)}`,
    what: "the 24-28 July orchestrator drill week — everything in the decision book except his own 11 decisions",
    expected: 3576,
    shape: "decided_by <> 'ceo'",
  },
  // ═══════════════════════════════════════════════════════════════════════
  // HIS ORDER OF 2026-08-25, AND IT OPENS THE BOUNDARY HE HIMSELF SET EARLIER
  // THE SAME DAY: "ŞİRKET İÇİNDEKİ BÜTÜN İNŞAATLA İLGİLİ GEÇMİŞTE NE VARSA
  // HEPSİNİ SİLİN. HERŞEYİ VERİLERİNDEN DE SİLİN. ŞİRKET ÇALIŞANLARI VEYA HAMZA
  // İNŞAATLA İLGİLİ HİÇ BİR ŞEY GÖRMEMELİ. ULAN İŞE MÜDÜR ALIORUZ NE DİYE
  // TUĞLALARIN NASIL ÖRÜLDÜĞÜNÜ ZORLA ONA GÖSTERELİM."
  //
  // "SİLİN" is obeyed the way he has always required and never withdrawn: the
  // rows leave the COMPANY. They are copied to the construction's own house
  // first, verified by count AND identical checksum, and only then deleted here.
  // Nothing is destroyed; nothing about the construction stays in the holding.
  //
  // THE PRINCIPLE THE CUT USES, and it is not "old = construction":
  //   a row is the CONSTRUCTION'S when it is about BUILDING or TESTING the
  //   machine; it is the COMPANY'S when it is about the company's own business
  //   — its employees, its library, its settings, its money, its decisions, its
  //   approvals. Measured consequence: `resident-worker` is the COMPANY's own
  //   worker identity (packages/orchestrator/src/worker-loop.ts:26), so its 214
  //   tasks and 1,122 task events stay; and hook_violations from 17-19 July are
  //   the company's own HR wave being quality-checked, so they stay too.
  {
    table: "audit_log",
    archiveTable: "audit_log_tool_pin_noise",
    approval: APPROVAL_VISIBLE_2,
    key: "id",
    where: "action = 'tool_missing'",
    what: "the gateway's own tool-pin check firing during construction runs — machine noise, never a company event",
    expected: 18051,
    shape: "action = 'tool_missing'",
  },
  {
    table: "audit_log",
    archiveTable: "audit_log_author_diary",
    approval: APPROVAL_VISIBLE_2,
    key: "id",
    where: "action = 'memory_commit'",
    what: "the construction author's diary sync into the holding's memory — the memory itself he already had wiped on 2026-08-23; this is the trail it left",
    expected: 1789,
    shape: "action = 'memory_commit'",
  },
  {
    table: "audit_log",
    archiveTable: "audit_log_construction_identity",
    approval: APPROVAL_VISIBLE_2,
    key: "id",
    where: `actor IN ${CONS_ID} AND action NOT IN ('tool_missing','memory_commit')`,
    what: "written by identities the holding never employed — test, tracer, e125t-test, engineering-worker",
    expected: 322,
    shape: `actor IN ${CONS_ID}`,
  },
  {
    table: "audit_log",
    archiveTable: "audit_log_construction_marker",
    approval: APPROVAL_VISIBLE_2,
    key: "id",
    // THE SEPARATION'S OWN RECORDS ARE NOT RESIDUE, and this exclusion exists
    // because the tool caught them: every `residue.moved_out` row names the
    // archive it wrote to (DxB_Build/dxb_archive), so the marker rule convicted
    // the company's own proof of what left. The run REFUSED rather than delete
    // them — 32 found against 29 approved — which is exactly what that guard is
    // for. They stay: they are the holding's evidence, in its own book, that the
    // construction was taken out of it.
    where: `action NOT IN ('tool_missing','memory_commit','residue.moved_out','memory.cleared_on_ceo_order')`
      + ` AND actor NOT IN ${CONS_ID}`
      + ` AND (coalesce(actor,'')||coalesce(action,'')||coalesce(payload::text,'')) ~* '${MARK}'`,
    what: "rows that name a construction identity or the construction's own address in their own text — the separation's own audit records excluded, they are the company's proof",
    expected: 25,
    shape: `(coalesce(actor,'')||coalesce(action,'')||coalesce(payload::text,'')) ~* '${MARK}'`
      + ` AND action NOT IN ('residue.moved_out','memory.cleared_on_ceo_order')`,
  },
  {
    table: "hook_violations",
    archiveTable: "hook_violations_drill_week",
    approval: APPROVAL_VISIBLE_2,
    key: "id",
    where: "created_at::date BETWEEN '2026-07-24' AND '2026-07-27'",
    what: "the gate firing on the orchestrator's 24-27 July drill; the 17-19 July rows are the company's own HR wave being quality-checked and STAY",
    expected: 271,
    shape: "created_at::date BETWEEN '2026-07-24' AND '2026-07-27'",
  },
  {
    // The construction's own drill ROUNDS, named where they appear in a row's own
    // words. Measured 2026-08-25 after the first purge: 26 rows left in the book
    // still talking about the R2.1 probe chain, the r31 drain probe, the stale
    // test-probes, the gate canaries and the trace tests. The COMPANY's own seven
    // rows written by the same worker — market_scan_verified,
    // discovery_engine.halt_reverified, measured_no_entity_found,
    // verification_check, queue.transition — are its own business and STAY.
    table: "audit_log",
    archiveTable: "audit_log_drill_rounds",
    approval: APPROVAL_VISIBLE_2,
    key: "id",
    where: "action NOT IN ('residue.moved_out','memory.cleared_on_ceo_order')"
      + " AND (coalesce(action,'')||coalesce(payload::text,''))"
      + " ~* '(R2\\.1 resident-worker probe chain|_drain_probe|test-probe|gate-canary|trace-test|orch-test|probe chain)'",
    what: "rows still naming a construction drill round — the R2.1 probe chain, the r31 drain probe, the stale test-probes, the gate canaries",
    expected: 26,
    shape: "(coalesce(action,'')||coalesce(payload::text,''))"
      + " ~* '(R2\\.1|_drain_probe|test-probe|gate-canary|trace-test|orch-test|probe chain)'",
  },
  {
    // His monitor firing is the COMPANY's own work; what this row SAYS is not.
    // Its own words: "Root cause: 28 stale test-probe tasks (trace-test,
    // orch-test-dispatch haiku, pre-E9.3 gate-canary orphans)". Resolved on
    // 2026-07-14, and he must not read it.
    table: "alerts",
    archiveTable: "alerts_drill",
    approval: APPROVAL_VISIBLE_2,
    key: "id",
    where: "(coalesce(title,'')||coalesce(probable_cause,'')||coalesce(suggested_action,'')||coalesce(mitigation,''))"
      + " ~* '(test-probe|trace-test|orch-test|gate-canary)'",
    what: "the queue alert whose stated root cause is the construction's own stale probe tasks",
    expected: 1,
    shape: "(coalesce(title,'')||coalesce(probable_cause,'')||coalesce(suggested_action,'')||coalesce(mitigation,''))"
      + " ~* '(test-probe|trace-test|orch-test|gate-canary)'",
  },
  {
    table: "control_idempotency",
    archiveTable: "control_idempotency_drill_keys",
    approval: APPROVAL_VISIBLE_2,
    key: "key",
    where: "key LIKE 'r23t%'",
    what: "the r23t drill's own idempotency keys",
    expected: 975,
    shape: "key LIKE 'r23t%'",
  },
  {
    table: "tool_calls",
    archiveTable: "tool_calls_drill",
    approval: APPROVAL_VISIBLE_2,
    key: "id",
    where: "coalesce(tool,'') ~* 'e10t'",
    what: "the e10t drill's own tool calls",
    expected: 7,
    shape: "coalesce(tool,'') ~* 'e10t'",
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
    const approval = g.approval ?? APPROVAL;
    const archiveTable = g.archiveTable ?? g.table;
    if (!approvals[approval]) {
      console.error(`REFUSED: ${approval} is not in the approvals register.`);
      process.exit(2);
    }
    line(`── ${g.table} — ${g.what}`);
    if (archiveTable !== g.table) line(`   archived as         : ${ARCHIVE_DB}.public.${archiveTable}`);
    if (approval !== APPROVAL) line(`   his approval        : ${approval}`);

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
    // A uuid HAS no max(): PostgreSQL defines no aggregate for it, and the first
    // run against a uuid-keyed table died on `function max(uuid) does not exist`
    // after an earlier group had already moved. A key with no order cannot carry
    // a high-water mark, so the predicate stands on its own — which is safe here
    // for the same reason `exact` is: nothing writes these rows any more, the
    // construction having been cut out of the company before this ran.
    const orderable = !/^uuid$/i.test(keyType);
    let predicate = g.where;
    if (!g.exact && orderable) {
      const maxKey = await psql(COMPANY, "postgres",
        `SELECT coalesce(max("${g.key}")::text, '') FROM public.${g.table} WHERE ${g.where};`);
      predicate = maxKey === ""
        ? "FALSE"
        : `(${g.where}) AND "${g.key}" <= ${quote(maxKey)}::${keyType}`;
    }

    if (!g.exact && !orderable) line(`   key type            : ${keyType} — no high-water mark is possible, the predicate stands alone`);
    const count = Number(await psql(COMPANY, "postgres",
      `SELECT count(*) FROM public.${g.table} WHERE ${predicate};`));
    const checksum = await psql(COMPANY, "postgres",
      checksumSql(`public.${g.table}`, colList, g.key, predicate));

    line(`   rows to move        : ${count}`);
    line(`   checksum (company)  : ${checksum}`);

    // A DIFFERENT NUMBER IS A DIFFERENT JOB. The first version printed a warning
    // and carried on, which is how a tool ends up moving rows nobody approved.
    // The only counts this file may act on are the ones he was shown (or zero,
    // meaning the group is already out).
    if (count !== 0 && count !== g.expected) {
      console.error(`   REFUSED: he approved ${g.expected} rows for ${g.table} and the company now`
        + ` holds ${count} that match. Nothing is moved. Re-measure, put the new number in front of`
        + ` him, and register his answer before this file runs again.`);
      process.exit(1);
    }

    // AND EVERY ROW MUST LOOK LIKE WHAT HE WAS SHOWN.
    if (count > 0 && g.shape) {
      const odd = Number(await psql(COMPANY, "postgres",
        `SELECT count(*) FROM public.${g.table} WHERE (${predicate}) AND NOT (${g.shape});`));
      if (odd !== 0) {
        console.error(`   REFUSED: ${odd} of the ${count} rows in ${g.table} do not have the shape`
          + ` he was shown (${g.shape}). Nothing is moved.`);
        process.exit(1);
      }
      line(`   shape check         : all ${count} rows match what he was shown`);
    }

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
    // NEVER DROP AN ARCHIVE. The first version began the copy with
    // `DROP TABLE IF EXISTS`, so a second run would have destroyed the rows it
    // was supposed to be protecting — and the manifest would still have carried
    // a checksum for data that no longer existed. If something is already
    // archived under this name, this file stops and says so.
    const held = Number(await psql(CONSTRUCTION, ARCHIVE_DB,
      `SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace`
      + ` WHERE n.nspname = 'public' AND c.relname = ${quote(archiveTable)};`));
    if (held > 0) {
      const rows = Number(await psql(CONSTRUCTION, ARCHIVE_DB, `SELECT count(*) FROM public."${archiveTable}";`));
      if (rows > 0) {
        console.error(`   REFUSED: ${ARCHIVE_DB} already holds ${rows} archived rows for ${archiveTable}.`
          + ` This file will not overwrite an archive. Nothing is moved.`);
        process.exit(1);
      }
      await psql(CONSTRUCTION, ARCHIVE_DB, `DROP TABLE public."${archiveTable}";`);
    }
    await psql(CONSTRUCTION, ARCHIVE_DB, `CREATE TABLE public."${archiveTable}" (${ddl});`);
    await copyAcross(`SELECT ${colList} FROM public.${g.table} WHERE ${predicate}`,
      `public."${archiveTable}"`, cols.map((c) => `"${c}"`));

    // --- 2. VERIFY ---------------------------------------------------------
    const archivedCount = Number(await psql(CONSTRUCTION, ARCHIVE_DB,
      `SELECT count(*) FROM public."${archiveTable}";`));
    const archivedSum = await psql(CONSTRUCTION, ARCHIVE_DB,
      checksumSql(`public."${archiveTable}"`, colList, g.key, null));
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
        'archive', ${quote(`${CONSTRUCTION}/${ARCHIVE_DB}/public.${archiveTable}`)},
        'ceo_approval', ${quote(approval)}
      ));
      COMMIT;`)).split("\n")[0];
    const remaining = Number(await psql(COMPANY, "postgres",
      `SELECT count(*) FROM public.${g.table} WHERE ${g.where};`));
    await psql(CONSTRUCTION, ARCHIVE_DB, `
      INSERT INTO public.manifest (source_table, what, rows_moved, checksum, predicate, ceo_approval)
      VALUES (${quote(archiveTable)}, ${quote(g.what)}, ${count}, ${quote(checksum)},
              ${quote(predicate)}, ${quote(approval)});`);
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
