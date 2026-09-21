// Global pre- and post-suite work (vitest globalSetup — runs ONCE in the main
// process, before any suite is loaded and again after the last one).
//
// ─────────────────────────────────────────────────────────────────────────────
// WHERE THIS FILE IS ALLOWED TO STAND, and why it is asked rather than assumed.
//
// B36, the independent auditor's second FAIL on Block 2 (2026-08-23): this file
// used to open with
//     process.env.DXB_DATABASE_URL ??= CONSTRUCTION_DATABASE_URL
// and `??=` is the shape of a DEFAULT — an address arriving from the outside
// pointing at the company was not overridden, it was PRESERVED. And of every
// file in the battery this is the worst one to leave open: on the way in it runs
// CREATE TABLE, and on the way out it runs DELETE and UPDATE across alerts,
// tasks, agent_runs, cost_ledger, approvals and the CEO's own chat board.
//
// Two things changed, and they are the contract this file now keeps:
//
//   1. THE ADDRESS IS PINNED, NOT DEFAULTED. An address handed in from the
//      environment is a mistake to be refused, never a suggestion to be
//      honoured. The construction engine named in tests/construction-engine.ts
//      is the only place this file may work.
//   2. THE ENGINE IS ASKED WHO IT IS, ON THE CONNECTION THAT DOES THE WORK.
//      Block 1 taught this repository that an address never says where it goes:
//      six spellings of one address were measured connecting to the holding
//      while a parser called each of them a different database. So the check is
//      not on the text — the server is asked for its cluster's system_identifier
//      and this database's own oid and name, inside the SAME transaction that
//      then creates or deletes anything, because a transaction pins one
//      connection and a check made on another connection says nothing. The
//      answer is held against tools/hooks/ledger-identity.json, the one record
//      in this repository of who the company is and where construction work is
//      permitted — the same record the SessionEnd hook obeys.
// ─────────────────────────────────────────────────────────────────────────────
//
// WHAT THE POST-SUITE SWEEP IS FOR. Root cause 2026-07-25: the suite runs files
// SEQUENTIALLY (fileParallelism false) and several suites (e10, r13, r23, r42)
// probe the hook engine with ':no-run' calls — a file that runs AFTER the owning
// suite re-raises the same probe alert with nobody left to sweep it (measured:
// the halal_screen probe alert of full-suite run 05:57-06:01 reached the CEO's
// Alerts page at 05:59). Per-file sweeps stay (they scope the data rows); this
// teardown owns the one CEO-visible class: engine-call ':no-run' hook alerts,
// which by construction come only from tests (engine calls without a run happen
// nowhere in production — e10 suite comment).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import type { Kysely } from "kysely";
import { CONSTRUCTION_DATABASE_URL } from "./construction-engine.js";

const SAY = "[global-setup]";

// ── ONE RUN AT A TIME ON ONE ENGINE, 2026-09-21 ──────────────────────────────
// `scripts/construction/battery.sh` has refused a second BATTERY since this
// morning, and that was not enough: a plain `vitest run <one file>` beside a
// running battery falls inside the battery's own before/after counting, and now
// that the ops:live receipts are reconciled per RUN it also hands back rows that
// belong to the other run. Measured that day, and it is why this exists: a
// single-file run started beside a battery took `dxb_internal.ops_live_issued`
// from 652 to 4 — the running battery's receipts, deleted by a watermark that
// was never ownership. The rule is therefore one rule: THE ENGINE'S LOCK IS
// EVERY VITEST RUN'S, not only every battery's.
//
// WHERE IT IS TAKEN, and why not here. Inside the construction wall `/tmp` is a
// fresh tmpfs, so the lock file is not visible at all, and no environment
// variable of ours crosses the wall either (both measured 2026-09-21:
// `DXB_ENGINE_LOCK_HELD` read back empty inside, and `ls` could not find the
// lock). So the HOST side takes it — `scripts/construction/run.sh` for a
// sandboxed run, `battery.sh` for the battery — and this file only asks whether
// somebody already holds the engine on its behalf. `DXB_CONSTRUCTION_SANDBOX`
// is set by the root-owned wall itself, so it cannot be forged from in here.
const ENGINE_LOCK = join(process.env.TMPDIR || "/tmp", "dxb-construction-battery.lock");
let engineLockHolder: ChildProcess | null = null;

async function takeTheEngine(): Promise<void> {
  if (process.env.DXB_CONSTRUCTION_SANDBOX === "1") return; // the door holds it
  if (process.env.DXB_ENGINE_LOCK_HELD === "1") return; // the battery holds it

  const verdict = await new Promise<"held" | "refused" | "no-flock">((resolve) => {
    let settled = false;
    const done = (v: "held" | "refused" | "no-flock") => {
      if (!settled) {
        settled = true;
        resolve(v);
      }
    };
    // The child IS the lock: `flock` holds it for as long as the process it
    // started lives. AND IT IS HELD OPEN BY A PIPE, not by a timer — the first
    // shape of this, `exec sleep 1000000` closed with `child.kill()`, was caught
    // by its own check the same hour: `kill` reaches `flock`, and `flock`'s
    // grandchild goes on holding the inherited descriptor, so the engine stayed
    // locked after the run ended (measured: `fuser` named `sleep 1000000`, pid
    // 2054834, and the next run would have been refused for nothing). `cat`
    // waits on this process's own pipe instead: ending it releases the lock, and
    // so does this process dying for any reason at all, which is the half a
    // hand-written lock file can never do.
    const child = spawn("flock", ["-n", ENGINE_LOCK, "sh", "-c", "echo LOCKED; exec cat"], {
      stdio: ["pipe", "pipe", "ignore"],
    });
    child.on("error", () => done("no-flock")); // same fallback as battery.sh
    child.stdout?.on("data", (d: Buffer) => {
      if (d.toString().includes("LOCKED")) {
        engineLockHolder = child;
        done("held");
      }
    });
    child.on("exit", () => done("refused"));
  });

  if (verdict === "no-flock") {
    console.log(`${SAY} ⚠ UNVERIFIED — flock is not installed, so a concurrent run cannot be ruled out`);
    return;
  }
  if (verdict === "refused") {
    console.error(
      `${SAY} REFUSED: another run already holds the construction engine.\n` +
        `         Two runs on one bench measure each other, not the code. Wait for it,\n` +
        `         or point this one elsewhere with DXB_CONSTRUCTION_URL.`,
    );
    process.exit(2);
  }
}

function releaseTheEngine(): void {
  if (engineLockHolder) {
    // Close the pipe, not the process: `cat` reads EOF, exits, and every
    // descriptor on the lock file goes with it.
    engineLockHolder.stdin?.end();
    engineLockHolder = null;
  }
}

/** Anything kysely will run a statement on. Here it is always ONE pinned connection. */
type Runner = Kysely<never>;

interface Identity {
  sysid: string;
  dboid: string;
  dbname: string;
}
interface LedgerIdentity {
  company: Identity | null;
  allowed: Identity[];
}

/** Same cluster AND (same database oid OR same database name) — the hook's own rule. */
const isSame = (a: Identity | null | undefined, b: Identity | null | undefined): boolean =>
  !!a && !!b && a.sysid === b.sysid && (a.dboid === b.dboid || a.dbname === b.dbname);

/** An address with its password taken out, so a refusal can name it safely. */
const redact = (url: string): string => url.replace(/:\/\/([^:@/]*):[^@]*@/, "://$1:***@");

function ledgerIdentity(): LedgerIdentity {
  const path = join(process.cwd(), "tools/hooks/ledger-identity.json");
  const f = JSON.parse(readFileSync(path, "utf8")) as LedgerIdentity;
  if (!Array.isArray(f.allowed) || f.allowed.length === 0) {
    throw new Error(`${SAY} ${path} lists no permitted engine — refusing to touch any database.`);
  }
  if (!f.company?.sysid) {
    throw new Error(`${SAY} ${path} does not record who the company is — refusing to run.`);
  }
  return f;
}

/**
 * Pin the address before anything opens a connection. Called first, so a foreign
 * address never reaches a pool, let alone a statement.
 */
function pinTheEngine(): void {
  const given = process.env.DXB_DATABASE_URL;
  if (given !== undefined && given !== CONSTRUCTION_DATABASE_URL) {
    throw new Error(
      `${SAY} refusing to run: DXB_DATABASE_URL arrived from the environment pointing at ` +
        `${redact(given)}. This file creates tables on the way in and deletes rows on the way out, ` +
        `and the one engine it may do that on is spelled in tests/construction-engine.ts. ` +
        `Nothing was run.`,
    );
  }
  process.env.DXB_DATABASE_URL = CONSTRUCTION_DATABASE_URL;
}

/**
 * Ask the connection that is about to do the work who it is, and refuse unless
 * the answer is a permitted construction engine. Runs INSIDE the caller's
 * transaction — the same pinned connection every following statement uses.
 */
async function refuseUnlessConstruction(trx: Runner, announce: boolean): Promise<void> {
  const { sql } = await import("kysely");
  const ledger = ledgerIdentity();
  const r = await sql<Identity>`
    select (select system_identifier::text from pg_control_system()) sysid,
           (select oid::text from pg_database where datname = current_database()) dboid,
           current_database() dbname`.execute(trx);
  const here = r.rows[0];
  if (!here?.sysid) {
    throw new Error(`${SAY} the server would not name its cluster — refusing to run.`);
  }
  if (isSame(here, ledger.company)) {
    throw new Error(
      `${SAY} refusing to run: this connection reaches the company database ` +
        `(cluster ${here.sysid}, database ${here.dbname}). The battery works on the construction ` +
        `engine and nowhere else.`,
    );
  }
  if (!ledger.allowed.some((a) => isSame(here, a))) {
    throw new Error(
      `${SAY} refusing to run: ${here.dbname} (cluster ${here.sysid}, oid ${here.dboid}) is not a ` +
        `permitted construction engine. Re-take it with scripts/b36/ledger-identity.mjs --allow.`,
    );
  }
  if (announce) {
    console.log(
      `${SAY} construction engine ${here.sysid}/${here.dboid} (${here.dbname}) — verified on the ` +
        `connection that does the work.`,
    );
  }
}

/**
 * BEFORE the suite runs: make sure today has a realtime partition.
 *
 * `realtime.messages` is partitioned by day. Supabase's realtime service creates
 * the partitions ahead of time, and on this machine it stopped: measured
 * 2026-08-21, the newest partition was `messages_2026_08_18` while the database
 * clock read 2026-08-20. Every broadcast written on a day with no partition goes
 * nowhere, so sixteen assertions across e8, e10, c5, c9, e125, r13 and r42
 * failed at once — all of them reading `realtime.messages` and finding it empty.
 * It looked like seven broken subsystems and it was one missing table.
 *
 * This runs BEFORE the suite so the battery heals itself instead of failing on a
 * date rollover. It only ever CREATES a partition, never drops one.
 */
async function ensureRealtimePartitions(trx: Runner): Promise<void> {
  const { sql } = await import("kysely");
  await sql`
    DO $$
    DECLARE d date; n text;
    BEGIN
      FOR d IN SELECT generate_series(current_date - 1, current_date + 14, '1 day')::date LOOP
        n := 'messages_' || to_char(d, 'YYYY_MM_DD');
        IF NOT EXISTS (
          SELECT 1 FROM pg_class c JOIN pg_namespace s ON s.oid = c.relnamespace
          WHERE c.relname = n AND s.nspname = 'realtime'
        ) THEN
          EXECUTE format(
            'CREATE TABLE realtime.%I PARTITION OF realtime.messages FOR VALUES FROM (%L) TO (%L)',
            n, d::timestamp, (d + 1)::timestamp);
        END IF;
      END LOOP;
    END $$;
  `.execute(trx);
}

// ── THE EVENT RECEIPTS, 2026-09-21 ───────────────────────────────────────────
// `dxb_internal.ops_live_issued` holds one receipt per event the company
// issued; the resident collector spends it on publish and prunes, after an
// hour, whatever nobody came to collect. NOTHING PLAYS THAT PART ON THE BENCH,
// so every suite that writes a source row leaves a receipt behind it — and no
// per-file sweep can own them, because the row is written by a trigger, carries
// no author, and belongs to the RUN rather than to any one suite.
//
// It stayed invisible because it was being hidden. `scripts/b36/prove-forged-
// event.mjs` ended with `DELETE ... WHERE issued_at < now() + interval '1
// second'` — the whole table, whoever filled it — and it runs in the host half,
// last. The bench ruler therefore read 4 -> 0 and called it a loss of four.
// With that unscoped delete repaired the same battery read 4 -> 655: the wipe
// had been covering 651 receipts a run.
//
// So the run borrows them. Take what the bench holds before the first suite is
// loaded; afterwards put every one of those back (the collector started inside
// tests/e8 prunes the ones over an hour old, whoever wrote them — measured with
// age-labelled probes) and remove exactly what appeared while the run was on.
// There is no author column to sign with, so ownership here is "it was not on
// the bench when this run started", which the snapshot proves outright.
//
// This sweep is bounded by the same refusal as everything else in this file:
// the transaction it runs in has already asked the connection who it is, and a
// connection reaching the company is refused before a single statement.
let receiptsHeldIds: string[] = [];
let receiptsHeldAt: string[] = [];
let receiptsFrom = "";

async function snapshotReceipts(trx: Runner): Promise<void> {
  const { sql } = await import("kysely");
  const t = await sql<{ t: string }>`SELECT now()::text AS t`.execute(trx);
  receiptsFrom = t.rows[0].t;
  const held = await sql<{ event_id: string; issued_at: string }>`
    SELECT event_id::text AS event_id, issued_at::text AS issued_at
      FROM dxb_internal.ops_live_issued
  `.execute(trx);
  receiptsHeldIds = held.rows.map((r) => r.event_id);
  receiptsHeldAt = held.rows.map((r) => r.issued_at);
}

async function restoreReceipts(trx: Runner): Promise<void> {
  const { sql } = await import("kysely");
  if (!receiptsFrom) return; // the setup never got far enough to take one
  if (receiptsHeldIds.length > 0) {
    await sql`
      INSERT INTO dxb_internal.ops_live_issued (event_id, issued_at)
      SELECT * FROM unnest(${receiptsHeldIds}::uuid[], ${receiptsHeldAt}::timestamptz[])
      ON CONFLICT (event_id) DO NOTHING
    `.execute(trx);
  }
  const left =
    receiptsHeldIds.length > 0
      ? await sql`
          DELETE FROM dxb_internal.ops_live_issued
           WHERE issued_at >= ${receiptsFrom}::timestamptz
             AND NOT (event_id = ANY(${receiptsHeldIds}::uuid[]))
        `.execute(trx)
      : await sql`
          DELETE FROM dxb_internal.ops_live_issued
           WHERE issued_at >= ${receiptsFrom}::timestamptz
        `.execute(trx);
  const n = Number(left.numAffectedRows ?? 0);
  if (n > 0) {
    console.log(`[global-teardown] handed back ${n} ops:live receipt(s) this run issued`);
  }
}

export default async function globalSetup(): Promise<() => Promise<void>> {
  // FIRST, before an address is pinned or a socket opened: a run that may not
  // have this engine must touch nothing at all.
  await takeTheEngine();
  pinTheEngine();
  // Root has no direct 'pg' dependency — ride the shared package's own pool
  // exactly like the suites do (dist path: resolvable from vite-node without the
  // test-runner alias map).
  const { getDb, closeDb } = await import("../packages/shared/dist/index.js");
  try {
    await getDb().transaction().execute(async (trx) => {
      await refuseUnlessConstruction(trx as unknown as Runner, true);
      await ensureRealtimePartitions(trx as unknown as Runner);
      await snapshotReceipts(trx as unknown as Runner);
    });
  } catch (e) {
    // A refusal must not leave a pool open behind it, pointed at whatever it
    // refused. Nothing ran; nothing is left holding a socket either — and the
    // engine goes back so the next run is not blocked by a run that never began.
    await closeDb().catch(() => {});
    releaseTheEngine();
    throw e;
  }
  return async function teardown(): Promise<void> {
    // The address is pinned again, and the engine asked again: this closure runs
    // minutes to hours after the setup did, and it is the destructive half.
    pinTheEngine();
    const { sql } = await import("kysely");
    try {
      await getDb().transaction().execute(async (trx) => {
        await refuseUnlessConstruction(trx as unknown as Runner, false);
      // 2026-07-28: this sweep is GONE, and its removal is the fix — not an
      // omission. It deleted every hook alert whose dedup_key ends in ':no-run',
      // and the pre-gate ALWAYS has a null run in production too (measured over
      // 1963 live rows: pre = 516 null-run / 0 with-run; both callers gate
      // "BEFORE the run is born"). So every suite run was quietly deleting REAL
      // pre-gate rejections — halal and permission blocks among them — off the
      // CEO's panel. Migration 20260728002000 replaces it with two intrinsic
      // rules that need no sweep at all and survive a killed run:
      //   · post/runtime violation with no run raises no alert (impossible in
      //     production; the audit row is still written)
      //   · deleting a violation row deletes its projection, so a suite that
      //     cleans up after itself (id watermark, E9.3) cleans the alert too
      // The pre-gate class stays visible on purpose: a probe there is
      // indistinguishable from a genuine constitutional rejection, and showing
      // the CEO one extra alert beats silently dropping a real halal block.
      // Second test-only class, measured on the CEO's Alerts page 2026-07-26
      // 04:23 ("Workflow 'e9t-retry' run failed"): e9 sweeps its own alerts,
      // but the RESIDENT scheduler can pick up a leftover queued run AFTER
      // that sweep and raise a fresh one — nobody is left to clean it. The
      // e9t- prefix is test-owned by construction (no production workflow
      // carries it), so this is safe and belongs at the very end of the run.
      const wf = await sql`
        DELETE FROM alerts WHERE source = 'workflow' AND affected_area LIKE 'workflow:e9t-%'
      `.execute(trx);
      const m = Number(wf.numAffectedRows ?? 0);
      if (m > 0) {
        console.log(`[global-teardown] swept ${m} test-probe workflow alert(s) (e9t- class)`);
      }
      // Third class, measured 2026-07-26 13:53: a policy-mutation case
      // mid-flight raises 'hook:conflict:*' while its temporary severities
      // disagree; the policies roll back, the alert stays. Unlike the classes
      // above this one CAN occur in production, so the sweep is
      // SELF-VERIFYING: an unresolved conflict alert is removed only when the
      // live hook_policies table shows NO actual severity disagreement on any
      // gate/check pair — a real conflict survives the sweep untouched.
      const hc = await sql`
        DELETE FROM alerts a
         WHERE a.source = 'hook'
           AND a.dedup_key LIKE 'hook:conflict:%'
           AND a.resolved_at IS NULL
           AND NOT EXISTS (
             -- same grouping the engine uses (policies.ts resolveConflicts):
             -- a "check" is gate + rule->>'check', never the whole rule body
             SELECT 1 FROM hook_policies p
              WHERE p.enabled
              GROUP BY p.gate, p.rule->>'check'
             HAVING count(DISTINCT p.severity) > 1
           )
      `.execute(trx);
      const k = Number(hc.numAffectedRows ?? 0);
      if (k > 0) {
        console.log(
          `[global-teardown] swept ${k} stale hook-conflict alert(s) (no live policy disagreement)`,
        );
      }
      // Fourth class, caught by the CEO himself on the Görevler board
      // 2026-07-27 00:05: "Başarısız 9" — seven of those nine rows were MINE.
      // The e8 observability suites open real `tasks` rows and fail them on
      // purpose (that IS the thing under test), and nothing swept the rows
      // afterwards, so a full-suite run posted seven fresh failures onto the
      // CEO's board. Alerts were already swept above; tasks were not.
      //
      // Test-owned by construction: production never writes an objective or
      // label starting with "E8.1 observability" or "E8.3 probe". Children are
      // removed first (no ON DELETE CASCADE on these FKs) in the same order the
      // purge door uses.
      const probeWhere = sql`
        SELECT id FROM tasks
         WHERE objective LIKE 'E8.1 observability%' OR objective LIKE 'E8.3 probe%'
            OR label LIKE 'E8.1 observability%' OR label LIKE 'E8.3 probe%'
      `;
      await sql`UPDATE tasks SET parent_task_id = NULL WHERE parent_task_id IN (${probeWhere})`.execute(trx);
      // The run's own children first — measured 2026-07-27: deleting agent_runs
      // straight away trips tool_calls_run_id_fkey. Depth before breadth.
      const probeRuns = sql`SELECT id FROM agent_runs WHERE task_id IN (${probeWhere})`;
      // column names measured, not assumed (pg_constraint → conkey → attname):
      // approvals points at a run through `reanalysis_run_id`, everyone else
      // through `run_id`.
      for (const gchild of [
        "tool_calls", "file_changes", "decision_log", "hook_violations",
        "library_usage_log", "memory_index", "alerts",
      ]) {
        await sql`DELETE FROM ${sql.raw(gchild)} WHERE run_id IN (${probeRuns})`.execute(trx);
      }
      await sql`UPDATE approvals SET reanalysis_run_id = NULL WHERE reanalysis_run_id IN (${probeRuns})`.execute(trx);
      await sql`UPDATE agent_runs SET parent_run_id = NULL WHERE parent_run_id IN (${probeRuns})`.execute(trx);
      for (const child of ["task_events", "agent_runs", "cost_ledger", "alerts", "approvals"]) {
        await sql`DELETE FROM ${sql.raw(child)} WHERE task_id IN (${probeWhere})`.execute(trx);
      }
      const probes = await sql`DELETE FROM tasks WHERE id IN (${probeWhere})`.execute(trx);
      const p = Number(probes.numAffectedRows ?? 0);
      if (p > 0) {
        console.log(`[global-teardown] swept ${p} test-probe task row(s) (e8 observability class)`);
      }
      // Fifth class, measured 2026-07-27 right after W2.6 shipped: the r31
      // voice suite drives a real call, and answering a call MIRRORS both turns
      // onto the CEO's chat board (U15 D13 one-conversation law). The suite
      // deleted its `voice_calls` and `intents` rows and never knew about the
      // mirror, so four probe turns landed inside the morning briefing's own
      // conversation — the 12-hour idle rule attaches new turns to the newest
      // thread, which is now Hamza's briefing.
      //
      // This class is the worst of the five: it is not an alert the CEO can
      // dismiss, it is text inside a conversation he is meant to read.
      // Test-owned by construction — production voice turns are the CEO's own
      // speech, and these strings come from `tests/r31/voice-line.test.ts`
      // (the second pattern is the TTS-normalised form of "R31 probe:", which
      // the intake rewrites before the mirror sees it).
      const chatProbes = await sql`
        DELETE FROM chat_messages
         WHERE source = 'voice'
           -- ILIKE and the STEM, not the sentence: the intake normalises the
           -- probe text before the mirror sees it, so the same case reaches the
           -- board as "R31 probe:", "F31 Probe", "Pre-31 Probe" and "ve otuz bir
           -- probe … görevin nedir". Measured 2026-07-27: a case-sensitive
           -- pattern swept 178 rows and left 15 behind.
           AND (content ILIKE '%probe%şirketin görev%' OR content LIKE 'R31 %')
      `.execute(trx);
      const c = Number(chatProbes.numAffectedRows ?? 0);
      if (c > 0) {
        console.log(`[global-teardown] swept ${c} voice-probe chat message(s) off the CEO board (r31 class)`);
        // A thread the sweep emptied was never a conversation — the same rule
        // migration 20260726006000 applied to the CEO's three lost "selam"
        // attempts. A thread that still holds a message is history: untouched.
        const ghosts = await sql`
          DELETE FROM chat_sessions s
           WHERE NOT EXISTS (SELECT 1 FROM chat_messages m WHERE m.session_id = s.id)
        `.execute(trx);
        const g = Number(ghosts.numAffectedRows ?? 0);
        if (g > 0) console.log(`[global-teardown] swept ${g} emptied chat thread(s)`);
      }
      // LAST. Every sweep above deletes source rows, and a source row leaving
      // is itself an event: the e83 trigger issues a fresh receipt for each of
      // them, inside this very transaction. A hand-back placed any earlier
      // would be counting a bench that is still moving.
      await restoreReceipts(trx as unknown as Runner);
      });
    } finally {
      await closeDb().catch(() => {});
      releaseTheEngine();
    }
  };
}
