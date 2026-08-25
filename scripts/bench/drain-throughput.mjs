#!/usr/bin/env node
/**
 * B39 — HOW MUCH WORK CAN THE COMPANY'S DISPATCH LINE ACTUALLY CARRY?
 *
 * THE QUESTION, and who asked it. The CEO, 2026-08-25: "NEDEN 1 İŞÇİ TÜM
 * ŞİRKETİN 214 AJANIN GÖREVİNİ ÜSTLENMİŞ ARKADAŞIM. HERKES KENDİ İŞİNİ YAPMALI
 * DEĞİL Mİ?" — and then the real one: was the single line chosen because the
 * old rented box had 8 GB of RAM?
 *
 * THE ANSWER THE REPOSITORY GIVES, traced 2026-08-25. The single line has
 * exactly ONE written justification and it is SYSTEM_ARCHITECTURE.md:16 R5,
 * "8 GB VPS RAM bütçesi aşılmaz" → :79 "(a) RAM bütçesi (R5)" →
 * AGENT_ORCHESTRATION_SPEC.md:145 → worker-loop.ts's own header. R5 writes its
 * own reopening condition — "ancak ölçüm kanıtıyla (latency/lock) ve CEO
 * onayıyla" — and THAT MEASUREMENT HAS NEVER BEEN TAKEN. The repository holds
 * no tasks-per-hour, no latency, no queue depth and no lock-contention figure
 * for task.worker, and not one document comparing one drain against two.
 *
 * This file is that measurement. It answers with numbers, not opinion.
 *
 * WHERE IT RUNS. The construction engine ONLY (DxB_Build, port 54422). It
 * creates synthetic tasks and deletes every one of them; the company's engine is
 * never opened. `pnpm verify:separation` step 6 convicts anything else.
 *
 * WHAT IS MEASURED AND WHAT IS COMPUTED — the line between them is never blurred.
 *   MEASURED  every number in the LANES table: real drains against a real
 *             PostgreSQL, real claims, real transitions, real row contention.
 *             The model call is replaced by a sleep of a stated length, because
 *             a real LLM turn would measure Anthropic's latency and not ours.
 *   COMPUTED  the PROJECTION table only, and it says so on its own line: what
 *             the measured per-task overhead implies for a 30 / 60 / 120-second
 *             turn. Arithmetic, labelled as arithmetic.
 *
 * IT GOES RED FIRST (this repository's law). `--prove-red` plants a double-claim
 * — the one failure that would make every other number a lie — and shows the
 * detector convicting it. A gate nobody has watched fail is not a gate.
 *
 * Usage
 *   pnpm bench:drain --prove-red     the detector convicts a planted collision
 *   pnpm bench:drain                 1 · 2 · 4 · 8 lanes, default 1.5s turns
 *   pnpm bench:drain --turn-ms=120000 --tasks=8 --lanes=1,4
 */
import { spawnSync } from "node:child_process";
import { cpus, loadavg, totalmem, freemem } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

// The construction engine, and nowhere else. Spelled here the way
// tests/construction-engine.ts spells it — one address, one owner.
const CONSTRUCTION_URL = "postgresql://postgres:postgres@127.0.0.1:54422/postgres";
const CONSTRUCTION_CONTAINER = "supabase_db_DxB_Build";
const MARKER = "b39bench";

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const PROVE_RED = argv.includes("--prove-red");
const TURN_MS = Number(flag("turn-ms", 1500));
const TASKS = Number(flag("tasks", 24));
const LANES = String(flag("lanes", "1,2,4,8")).split(",").map(Number).filter((n) => n > 0);

// ---------------------------------------------------------------- psql helper
function psql(sqlText, { admin = false } = {}) {
  const r = spawnSync(
    "docker",
    ["exec", "-i", CONSTRUCTION_CONTAINER, "psql", "-U", admin ? "supabase_admin" : "postgres",
     "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-tA", "-q"],
    { input: sqlText, encoding: "utf8" },
  );
  if (r.status !== 0) throw new Error(`psql failed: ${(r.stderr || "").trim()}`);
  return r.stdout.trim();
}

// ------------------------------------------------------------------- the line
// Imported from the built package, exactly as the scheduler imports it: a bench
// that measures a private copy of the loop measures nothing.
// The address is set BEFORE the modules load: @dxb/shared reads it when its
// connection pool is first built, and a bench that pointed at the company would
// be the single worst thing in this repository.
process.env.DXB_DATABASE_URL = CONSTRUCTION_URL;
const { drainTasks } = await import(
  pathToFileURL(join(REPO, "packages/orchestrator/dist/worker-loop.js")).href);
const { closeDb } = await import(
  pathToFileURL(join(REPO, "packages/shared/dist/index.js")).href);

// ------------------------------------------------------------- the detector
//
// The one thing that would invalidate every other figure: two lanes working the
// same task. `claim_next_task` is FOR UPDATE SKIP LOCKED, so this must be zero —
// but "must be" is a belief until something looks. This is what looks.
function doubleClaims() {
  const out = psql(`
    SELECT COALESCE(string_agg(task_id::text || ' claimed by ' || actors, E'\\n'), '') FROM (
      SELECT e.task_id, string_agg(DISTINCT e.actor, ' + ') AS actors, count(DISTINCT e.actor) AS n
        FROM task_events e JOIN tasks t ON t.id = e.task_id
       WHERE e.event = 'claimed' AND t.department LIKE '${MARKER}%'
       GROUP BY e.task_id HAVING count(DISTINCT e.actor) > 1
    ) x;`);
  return out ? out.split("\n").filter(Boolean) : [];
}

function lockWaits() {
  return Number(psql(`
    SELECT count(*) FROM pg_stat_activity
     WHERE wait_event_type = 'Lock' AND datname = 'postgres';`));
}

// --------------------------------------------------------------- the fixtures
function seedTasks(n, lane) {
  const department = `${MARKER}-l${lane}`;
  psql(`
    INSERT INTO departments (slug, display_name, display_name_tr, status)
    VALUES ('${department}', 'B39 bench lane ${lane}', 'B39 ölçüm hattı ${lane}', 'active')
    ON CONFLICT (slug) DO NOTHING;
    INSERT INTO tasks (department, objective, output_contract, model_tier,
                       approval_class, budget_max_tokens, priority, status)
    SELECT '${department}', 'b39 bench probe ' || g, 'one line', 'L4', 'none', 1000, 5, 'queued'
      FROM generate_series(1, ${n}) g;`);
  return department;
}

function sweep() {
  psql(`
    DELETE FROM cost_ledger WHERE task_id IN (SELECT id FROM tasks WHERE department LIKE '${MARKER}%');
    DELETE FROM agent_runs  WHERE task_id IN (SELECT id FROM tasks WHERE department LIKE '${MARKER}%');
    DELETE FROM audit_log   WHERE task_id IN (SELECT id FROM tasks WHERE department LIKE '${MARKER}%');
    DELETE FROM task_events WHERE task_id IN (SELECT id FROM tasks WHERE department LIKE '${MARKER}%');
    DELETE FROM tasks       WHERE department LIKE '${MARKER}%';
    DELETE FROM departments WHERE slug LIKE '${MARKER}%';
    DELETE FROM decision_log WHERE decision = 'employee-selection' AND rationale LIKE '%${MARKER}%';`);
}

// ------------------------------------------------------------------ prove-red
//
// A planted collision: the same task recorded as claimed by two different lanes.
// If the detector cannot convict THIS, its silence in the real run means nothing.
async function proveRed() {
  console.log("=== PROVING THE DETECTOR RED — a collision is planted on purpose ===\n");
  sweep();
  const department = seedTasks(1, "red");
  const taskId = psql(`SELECT id FROM tasks WHERE department = '${department}' LIMIT 1;`);

  const before = doubleClaims();
  console.log(`  before planting : ${before.length} double-claim(s) — the detector is quiet`);

  psql(`
    INSERT INTO task_events (task_id, event, from_status, to_status, actor, payload)
    VALUES ('${taskId}', 'claimed', 'queued', 'claimed', 'lane-A', '{}'::jsonb),
           ('${taskId}', 'claimed', 'queued', 'claimed', 'lane-B', '{}'::jsonb);`);

  const after = doubleClaims();
  console.log(`  after planting  : ${after.length} double-claim(s)`);
  for (const line of after) console.log(`      ${line}`);

  sweep();
  const cleaned = doubleClaims();
  console.log(`  after sweeping  : ${cleaned.length} double-claim(s) — the plant is gone\n`);

  const convicted = before.length === 0 && after.length === 1 && cleaned.length === 0;
  console.log(convicted
    ? "DETECTOR_PROVEN_RED — it convicts a collision, so its silence below is worth something."
    : "DETECTOR_BROKEN — it did NOT convict a planted collision. Every number below is void.");
  return convicted;
}

// -------------------------------------------------------------------- one run
async function runLanes(lanes) {
  sweep();
  const department = seedTasks(TASKS, lanes);

  // The model call, replaced by a sleep of a stated length. Everything else —
  // the claim, the gates, the transitions, the writes — is the real thing.
  const execute = async () => {
    await new Promise((r) => setTimeout(r, TURN_MS));
    return { result: { text: "bench deliverable" }, confidence: 0.92 };
  };

  const latencies = [];
  let lockPeak = 0;
  const sampler = setInterval(() => {
    try { lockPeak = Math.max(lockPeak, lockWaits()); } catch { /* sampling never fails a run */ }
  }, 250);

  const rssBefore = process.memoryUsage().rss;
  const started = Date.now();

  // N lanes, each the SAME drainTasks the scheduler hosts, distinguished only by
  // workerId — the parameter that has been there since R2.1 and never been used.
  await Promise.all(
    Array.from({ length: lanes }, (_, i) =>
      (async () => {
        const workerId = `${MARKER}-lane-${i + 1}`;
        for (;;) {
          const t0 = Date.now();
          const res = await drainTasks({
            workerId,
            departments: [department],
            execute,
            reviewCap: 0,
            failedCap: 0,
          });
          if (res.executed === 0) break;
          latencies.push(Date.now() - t0);
        }
      })(),
    ),
  );

  const elapsedMs = Date.now() - started;
  clearInterval(sampler);
  const rssAfter = process.memoryUsage().rss;

  const done = Number(psql(`
    SELECT count(*) FROM tasks WHERE department = '${department}' AND status = 'review';`));
  const collisions = doubleClaims();
  latencies.sort((a, b) => a - b);
  const pct = (p) => latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))] : 0;

  sweep();

  return {
    lanes,
    done,
    elapsedMs,
    perHour: done > 0 ? Math.round((done / elapsedMs) * 3_600_000) : 0,
    medianMs: pct(0.5),
    p95Ms: pct(0.95),
    overheadMs: latencies.length ? Math.round(pct(0.5) - TURN_MS) : 0,
    rssDeltaMb: Math.round(((rssAfter - rssBefore) / 1_048_576) * 10) / 10,
    lockPeak,
    collisions: collisions.length,
  };
}

// ---------------------------------------------------------------------- print
function table(rows) {
  const head = ["lanes", "done", "wall s", "tasks/h", "median ms", "p95 ms", "overhead ms", "RSS Δ MB", "lock peak", "collisions"];
  const body = rows.map((r) => [
    String(r.lanes), String(r.done), (r.elapsedMs / 1000).toFixed(1), String(r.perHour),
    String(r.medianMs), String(r.p95Ms), String(r.overheadMs), String(r.rssDeltaMb),
    String(r.lockPeak), String(r.collisions),
  ]);
  const w = head.map((h, i) => Math.max(h.length, ...body.map((b) => b[i].length)));
  const line = (cells) => "  " + cells.map((c, i) => c.padStart(w[i])).join("  ");
  console.log(line(head));
  console.log("  " + w.map((n) => "─".repeat(n)).join("  "));
  for (const b of body) console.log(line(b));
}

function projection(rows) {
  // ARITHMETIC, and it is labelled as such. The measured overhead is what the
  // line costs ON TOP of a model turn; a real turn is 30-120 seconds.
  const base = rows[0];
  console.log("\n  COMPUTED, not measured — what the measured overhead implies for a real turn:");
  console.log("  (tasks per hour = 3600 / (turn seconds + measured overhead) × lanes)\n");
  const head = ["turn", ...rows.map((r) => `${r.lanes} lane${r.lanes > 1 ? "s" : ""}`)];
  const body = [30, 60, 120].map((sec) => [
    `${sec}s`,
    ...rows.map((r) => String(Math.floor((3600 / (sec + Math.max(0, r.overheadMs) / 1000)) * r.lanes))),
  ]);
  const w = head.map((h, i) => Math.max(h.length, ...body.map((b) => b[i].length)));
  const line = (cells) => "  " + cells.map((c, i) => c.padStart(w[i])).join("  ");
  console.log(line(head));
  console.log("  " + w.map((n) => "─".repeat(n)).join("  "));
  for (const b of body) console.log(line(b));
  return base;
}

// ----------------------------------------------------------------------- main
(async () => {
  // The address is stated out loud every run: a bench that silently moved to the
  // company would be the single worst thing this repository could do.
  // inet_server_port() is NULL over the container's unix socket, so the port is
  // read from the setting itself — the address must never be printed as blank.
  const engine = psql(
    "SELECT current_database() || ' @ port ' || current_setting('port') || " +
    "' · system ' || (SELECT system_identifier FROM pg_control_system());");
  console.log(`\n[bench] engine: ${engine} — the CONSTRUCTION site (company port is 54322, untouched)\n`);

  if (PROVE_RED) {
    const ok = await proveRed();
    await closeDb().catch(() => undefined);
    process.exit(ok ? 0 : 1);
  }

  console.log(`[bench] machine: ${cpus().length} threads · ${Math.round(totalmem() / 1_073_741_824)} GB RAM ` +
              `· ${Math.round(freemem() / 1_073_741_824)} GB free · load ${loadavg()[0].toFixed(2)}`);
  console.log(`[bench] plan: ${TASKS} tasks per level, ${TURN_MS} ms simulated model turn, lanes ${LANES.join(" · ")}\n`);

  const rows = [];
  for (const lanes of LANES) {
    process.stdout.write(`  measuring ${lanes} lane(s) … `);
    const r = await runLanes(lanes);
    rows.push(r);
    console.log(`${r.done}/${TASKS} in ${(r.elapsedMs / 1000).toFixed(1)}s`);
  }

  console.log("\n=== MEASURED — every figure below came from a real drain on a real database ===\n");
  table(rows);
  projection(rows);

  const collisions = rows.reduce((a, r) => a + r.collisions, 0);
  const incomplete = rows.filter((r) => r.done !== TASKS);
  const one = rows.find((r) => r.lanes === 1);
  const most = rows[rows.length - 1];
  const speedup = one && most && one.perHour > 0 ? (most.perHour / one.perHour).toFixed(2) : "n/a";

  console.log(`
=== EVIDENCE ===
  engine                 : ${engine}
  simulated model turn   : ${TURN_MS} ms
  tasks per level        : ${TASKS}
  double claims          : ${collisions}   (must be 0 — the detector is proven by --prove-red)
  levels that drained    : ${rows.length - incomplete.length} of ${rows.length}
  ${most.lanes}-lane speedup over 1 : ${speedup}×
  peak lock waits seen   : ${Math.max(...rows.map((r) => r.lockPeak))}
  peak RSS delta         : ${Math.max(...rows.map((r) => r.rssDeltaMb))} MB
  ${collisions === 0 && incomplete.length === 0 ? "BENCH_CLEAN" : "BENCH_DIRTY — read the table above before trusting anything"}
`);

  await closeDb().catch(() => undefined);
  process.exit(collisions === 0 && incomplete.length === 0 ? 0 : 1);
})().catch(async (err) => {
  console.error("[bench] failed:", err);
  try { sweep(); } catch { /* the sweep is best-effort on a crash */ }
  await closeDb().catch(() => undefined);
  process.exit(2);
});
