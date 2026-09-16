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
//
// A DEPARTMENT WITH NO STAFF AND A TASK WITH NO PROJECT ARE NOT THE COMPANY, AND
// MEASURING THEM MEASURES NOTHING. The first version of this file seeded bare
// tasks into an empty department; the pre-task gate rejected every one of them
// ("policy: missing_project_link" + "std.project_alignment"), the run finished in
// 0.2 seconds, reported 0 done — and still printed a table of zeroes. That is the
// exact failure this repository's own law exists to prevent, and it is why the
// bench now says WHERE its tasks ended whenever a level does not drain.
//
// What the real company looks like, measured 2026-08-25 in its own database:
// 205 active employees across 21 departments, and 214 of 217 tasks carry a
// project. The bench reproduces both. Each employee is born the way the company
// insists — dormant, given a persona, and only then activated
// (trg_agents_activation_gate refuses any other order) — and every task hangs off
// a real project row, because a benchmark that skips the gates measures a path
// no real task will ever take.
//
// It also seeds ONE MORE employee than there are lanes. That is deliberate: with
// employee.max_concurrent_runs = 1, N lanes need N free people, and the spare
// proves the ceiling is being honoured rather than silently ignored.
function seedLane(n, lane, staff) {
  const department = `${MARKER}-l${lane}`;
  psql(`
    INSERT INTO departments (slug, display_name, display_name_tr, status)
    VALUES ('${department}', 'B39 bench lane ${lane}', 'B39 ölçüm hattı ${lane}', 'active')
    ON CONFLICT (slug) DO NOTHING;

    -- the project the work belongs to: the pre-task gate demands one (std.project_alignment)
    INSERT INTO projects (slug, name, name_tr, purpose, purpose_tr, status)
    VALUES ('${department}-p', 'B39 bench project ${lane}', 'B39 ölçüm projesi ${lane}',
            'Measuring how much work the dispatch line carries.',
            'Dağıtım hattının ne kadar iş taşıdığını ölçmek.', 'active')
    ON CONFLICT (slug) DO NOTHING;

    -- the workforce, through the company's own birth sequence
    INSERT INTO agents (slug, department, role, role_level, persona_path, mcp_profile,
                        employment_status, status)
    SELECT '${department}-w' || g, '${department}', 'specialist', 'specialist',
           'personas/${department}-w' || g || '.md', 'inherit', 'dormant', 'dormant'
      FROM generate_series(1, ${staff}) g
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO personas (employee_id, version, author, body_md, quality_gate)
    SELECT a.id, 1, 'hr-factory',
           '# PERSONA — ' || a.slug || E'\n\n## 1. Role\nBench specialist.', 'passed'
      FROM agents a WHERE a.department = '${department}'
        AND NOT EXISTS (SELECT 1 FROM personas p WHERE p.employee_id = a.id);

    UPDATE agents a SET persona_id = p.id, employment_status = 'active', status = 'active'
      FROM personas p WHERE p.employee_id = a.id AND a.department = '${department}';

    INSERT INTO tasks (department, objective, output_contract, model_tier,
                       approval_class, budget_max_tokens, priority, status, project_id)
    SELECT '${department}', 'b39 bench probe ' || g, 'one line', 'L4', 'none', 1000, 5, 'queued',
           (SELECT id FROM projects WHERE slug = '${department}-p')
      FROM generate_series(1, ${n}) g;`);
  return department;
}

/** Where the tasks actually ended up — printed whenever a level does not drain. */
function outcome(department) {
  const out = psql(`
    SELECT COALESCE(string_agg(status || '=' || n, ', ' ORDER BY status), '(none)') FROM (
      SELECT status, count(*) AS n FROM tasks WHERE department = '${department}' GROUP BY status
    ) x;`);
  return out || "(none)";
}

function sweep() {
  // EVERY TABLE THAT POINTS AT A RUN OR A TASK, IN DEPENDENCY ORDER.
  // Measured from the engine itself rather than guessed
  // (SELECT conname, conrelid::regclass FROM pg_constraint WHERE confrelid IN
  //  ('agent_runs'::regclass,'tasks'::regclass) AND contype='f') — 21 links, and a
  // sweep that knows only three of them fails halfway and leaves the bench's own
  // rows inside the engine. E9.3's rule holds here: this deletes ONLY what the
  // marker department created, and it deletes ALL of it.
  psql(`
    -- the workforce is stood down before its personas go: the company refuses to
    -- strip a persona from an ACTIVE employee, and the bench obeys that rule too
    UPDATE agents SET employment_status = 'dormant', status = 'dormant'
      WHERE department LIKE '${MARKER}%';
    -- W15 / F056: through the door, one agent at a time, so each unbind is gate-checked and audited
    SELECT fn_persona_bind(id, NULL, 'bench') FROM agents WHERE department LIKE '${MARKER}%' AND persona_id IS NOT NULL;
    DELETE FROM personas WHERE employee_id IN (SELECT id FROM agents WHERE department LIKE '${MARKER}%');

    CREATE TEMP TABLE IF NOT EXISTS _b39_t (id uuid PRIMARY KEY);
    CREATE TEMP TABLE IF NOT EXISTS _b39_r (id uuid PRIMARY KEY);
    TRUNCATE _b39_t; TRUNCATE _b39_r;
    INSERT INTO _b39_t SELECT id FROM tasks WHERE department LIKE '${MARKER}%';
    INSERT INTO _b39_r SELECT id FROM agent_runs
      WHERE task_id IN (SELECT id FROM _b39_t)
         OR employee_id IN (SELECT id FROM agents WHERE department LIKE '${MARKER}%');

    -- everything hanging off the RUNS
    DELETE FROM decision_log       WHERE run_id IN (SELECT id FROM _b39_r);
    DELETE FROM decision_log       WHERE decision = 'employee-selection' AND rationale LIKE '%${MARKER}%';
    DELETE FROM alerts             WHERE run_id IN (SELECT id FROM _b39_r);
    DELETE FROM file_changes       WHERE run_id IN (SELECT id FROM _b39_r);
    DELETE FROM hook_violations    WHERE run_id IN (SELECT id FROM _b39_r);
    DELETE FROM library_usage_log  WHERE run_id IN (SELECT id FROM _b39_r);
    DELETE FROM memory_index       WHERE run_id IN (SELECT id FROM _b39_r);
    DELETE FROM tool_calls         WHERE run_id IN (SELECT id FROM _b39_r);
    UPDATE approvals SET reanalysis_run_id = NULL WHERE reanalysis_run_id IN (SELECT id FROM _b39_r);
    UPDATE agent_runs SET parent_run_id = NULL WHERE parent_run_id IN (SELECT id FROM _b39_r);
    DELETE FROM agent_runs         WHERE id IN (SELECT id FROM _b39_r);

    -- everything hanging off the TASKS
    DELETE FROM alerts             WHERE task_id IN (SELECT id FROM _b39_t);
    DELETE FROM approvals          WHERE task_id IN (SELECT id FROM _b39_t);
    DELETE FROM cost_ledger        WHERE task_id IN (SELECT id FROM _b39_t);
    DELETE FROM crm_requests       WHERE task_id IN (SELECT id FROM _b39_t);
    DELETE FROM generated_work     WHERE task_id IN (SELECT id FROM _b39_t)
                                      OR plan_task_id IN (SELECT id FROM _b39_t);
    DELETE FROM revenue_scout_runs WHERE task_id IN (SELECT id FROM _b39_t);
    DELETE FROM task_dependencies  WHERE task_id IN (SELECT id FROM _b39_t)
                                      OR depends_on IN (SELECT id FROM _b39_t);
    DELETE FROM task_events        WHERE task_id IN (SELECT id FROM _b39_t);
    DELETE FROM audit_log          WHERE task_id IN (SELECT id FROM _b39_t);
    UPDATE tasks SET parent_task_id = NULL WHERE parent_task_id IN (SELECT id FROM _b39_t);
    DELETE FROM tasks              WHERE id IN (SELECT id FROM _b39_t);

    DELETE FROM agents      WHERE department LIKE '${MARKER}%';
    DELETE FROM projects    WHERE slug LIKE '${MARKER}%';
    DELETE FROM departments WHERE slug LIKE '${MARKER}%';
    DELETE FROM alerts      WHERE dedup_key = 'orchestrator:subscription-cap' AND resolved_at IS NULL;`);
}

// ------------------------------------------------------------------ prove-red
//
// A planted collision: the same task recorded as claimed by two different lanes.
// If the detector cannot convict THIS, its silence in the real run means nothing.
async function proveRed() {
  console.log("=== PROVING THE DETECTOR RED — a collision is planted on purpose ===\n");
  sweep();
  const department = seedLane(1, "red", 1);
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
  const department = seedLane(TASKS, lanes, lanes + 1);

  // The model call, replaced by a sleep of a stated length. Everything else —
  // the claim, the gates, the transitions, the writes — is the real thing.
  //
  // AND IT IS COUNTED, BECAUSE THE LINE CALLS IT MORE THAN ONCE. Measured
  // 2026-08-25: a task's median came out at 90s against a 30s turn, and the
  // first reading of that was wrong — "60 seconds of overhead". There is no
  // 60-second wait anywhere. The post-task quality gate REVISES and the runner
  // re-executes (worker-shim's `for(;;)` loop), bounded by
  // `orchestration.max_revision_rounds` = 2. So the work was done THREE times:
  // one attempt plus two revisions, 3 x 30s = 90s.
  //
  // A bench that assumes one call per task reports the company's own quality
  // standard as if it were overhead. This counts the calls and reports both:
  // what the LINE costs on top of the model, and how many times the model ran.
  let executions = 0;
  const execute = async () => {
    executions += 1;
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

  // WHAT "DONE" MEANS HERE, and why it is not "reached review".
  //
  // The gates are part of the path being measured, so they stay ON. With them on,
  // a SIMULATED model turn can never reach 'review': the post-task gate demands a
  // real tool_calls row (std 15, tool_call_proof) and a sleep produces none. That
  // is a constitutional property of the text-only executor, written down as
  // adaptation A4 in AGENT_ORCHESTRATION_SPEC — not a fault in this bench and not
  // something to hide by switching the gates off.
  //
  // So the capacity figure counts tasks the LINE CARRIED end to end: claimed,
  // staffed, gated, executed and moved out of the queue. The quality outcome is
  // reported beside it and is expected to be 'failed' on synthetic output.
  const done = Number(psql(`
    SELECT count(*) FROM tasks WHERE department = '${department}' AND status <> 'queued';`));
  const passedQuality = Number(psql(`
    SELECT count(*) FROM tasks WHERE department = '${department}' AND status IN ('review','done');`));
  const where = outcome(department);
  const collisions = doubleClaims();
  latencies.sort((a, b) => a - b);
  const pct = (p) => latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))] : 0;
  // Model turns per task the line actually asked for — 1 when the gate passes
  // first time, up to 1 + max_revision_rounds when it does not.
  const runsPerTask = done > 0 ? executions / done : 0;

  sweep();

  return {
    lanes,
    done,
    passedQuality,
    where,
    elapsedMs,
    perHour: done > 0 ? Math.round((done / elapsedMs) * 3_600_000) : 0,
    medianMs: pct(0.5),
    p95Ms: pct(0.95),
    runsPerTask: Math.round(runsPerTask * 100) / 100,
    // The LINE's own cost: what is left after the model turns the line actually
    // asked for. Subtracting one turn when three were run is how a quality
    // standard gets misread as overhead.
    overheadMs: latencies.length ? Math.round(pct(0.5) - TURN_MS * runsPerTask) : 0,
    rssDeltaMb: Math.round(((rssAfter - rssBefore) / 1_048_576) * 10) / 10,
    lockPeak,
    collisions: collisions.length,
  };
}

// ---------------------------------------------------------------------- print
function table(rows) {
  const head = ["lanes", "done", "wall s", "tasks/h", "median ms", "p95 ms", "model runs/task", "line cost ms", "RSS Δ MB", "lock peak", "collisions"];
  const body = rows.map((r) => [
    String(r.lanes), String(r.done), (r.elapsedMs / 1000).toFixed(1), String(r.perHour),
    String(r.medianMs), String(r.p95Ms), r.runsPerTask.toFixed(2), String(r.overheadMs),
    String(r.rssDeltaMb), String(r.lockPeak), String(r.collisions),
  ]);
  const w = head.map((h, i) => Math.max(h.length, ...body.map((b) => b[i].length)));
  const line = (cells) => "  " + cells.map((c, i) => c.padStart(w[i])).join("  ");
  console.log(line(head));
  console.log("  " + w.map((n) => "─".repeat(n)).join("  "));
  for (const b of body) console.log(line(b));
}

function projection(rows) {
  // ARITHMETIC, and it is labelled as such. Two things go into it: the line's own
  // cost per task, and how many model turns the line asks for per task — because
  // a task the gate revises twice pays for three turns, not one.
  const base = rows[0];
  const runs = base?.runsPerTask || 1;
  console.log("\n  COMPUTED, not measured — what the measured figures imply for a real model turn:");
  console.log(`  (tasks/hour = 3600 / (turn seconds × ${runs.toFixed(2)} model runs + line cost) × lanes)\n`);
  const head = ["turn", ...rows.map((r) => `${r.lanes} lane${r.lanes > 1 ? "s" : ""}`)];
  const body = [30, 60, 120].map((sec) => [
    `${sec}s`,
    ...rows.map((r) =>
      String(Math.floor(
        (3600 / (sec * (r.runsPerTask || 1) + Math.max(0, r.overheadMs) / 1000)) * r.lanes,
      )),
    ),
  ]);
  const w = head.map((h, i) => Math.max(h.length, ...body.map((b) => b[i].length)));
  const line = (cells) => "  " + cells.map((c, i) => c.padStart(w[i])).join("  ");
  console.log(line(head));
  console.log("  " + w.map((n) => "─".repeat(n)).join("  "));
  for (const b of body) console.log(line(b));
  return base;
}

// ----------------------------------------------------------------------- main
//
// INTERRUPTED IS NOT AN EXCUSE FOR RESIDUE. Measured 2026-08-25: a run killed
// part-way through left 12 tasks, 2 employees, a project and a department inside
// the construction engine — a benchmark that dirties the very database the next
// measurement reads. Ctrl-C and a kill signal now sweep on the way out, exactly
// like the normal exit and the crash path already do.
let sweeping = false;
function sweepAndExit(signal) {
  if (sweeping) return;
  sweeping = true;
  console.log(`\n[bench] ${signal} — sweeping before exit so the engine is left clean`);
  try { sweep(); console.log("[bench] swept"); }
  catch (e) { console.error("[bench] sweep on exit FAILED — residue may remain:", e.message); }
  process.exit(130);
}
process.on("SIGINT", () => sweepAndExit("SIGINT"));
process.on("SIGTERM", () => sweepAndExit("SIGTERM"));

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
    // A level that did not drain says WHERE its tasks went, in the same breath.
    // Silence here is how the first version of this file reported a table of
    // zeroes as if it were a measurement.
    if (r.done !== TASKS) console.log(`      ⚠ did not drain — tasks ended: ${r.where}`);
    else console.log(`      carried ${r.done}/${TASKS} through the full gated path — outcome: ${r.where}`);
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
  gates                  : ON — the pre/post quality gates are part of the measured path
  model runs per task    : ${rows.map((r) => r.runsPerTask.toFixed(2)).join(" · ")}
                           (1 = the gate passed first time; up to 1 + orchestration.max_revision_rounds
                            when it did not. A simulated turn can never pass — A4 — so this reads the
                            company's WORST case, not its normal one.)
  passed the quality gate: ${rows.map((r) => r.passedQuality).reduce((a, b) => a + b, 0)} (expected 0:
                           a simulated turn produces no tool_calls row, so std 15 cannot pass — A4)
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
