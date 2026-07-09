// ONE scheduler process owns all system routines (04-01 recorded decision):
// outbox tick 15s, lease reaper 60s, velocity breaker 5min. pg-boss runs the
// SYSTEM routine queue only — business tasks stay in the tasks table with
// their own SKIP LOCKED claim (Phase 3 LOCKED: two queues = two sources of truth).
//
// Connection MUST be the direct session-mode port (local 54322 / VPS 5432),
// never a transaction pooler (pg-boss study card, CRITICAL pitfall).
import { PgBoss } from "pg-boss";
import { sql } from "kysely";
import { getDb } from "@dxb/shared";
import { compactExpired, syncClaudeMem } from "@dxb/memory-router";
import { tick } from "./index.js";
import { checkVelocity } from "./breaker.js";

export const QUEUES = {
  tick: "outbox-tick",
  reaper: "lease-reaper",
  breaker: "velocity-breaker",
  compaction: "memory-compaction",
  memSync: "claude-mem-sync",
} as const;

// pg-boss cron is minute-grained, so the 15s outbox tick runs as a
// self-perpetuating singleton job chain (send startAfter=15 from its own
// worker) instead of a cron entry; reaper and breaker are plain crons.
// Memory lifecycle (06-08): compaction daily 03:00 (rule 5 cron half),
// claude-mem pointer sync hourly (T-06-18 residual: synced pointers meet the
// contradiction sweep only when promoted content collides — documented).
// NO graph-ingest cron: observed live 2026-07-09, the bare CLI's `update`
// subcommand re-extracts CODE files only ("No code files found - nothing to
// rebuild" on a markdown corpus) — relation notes ingest at the
// phase-completion /gsd-graphify build cycle (repo rule), not from here.
export const CADENCES = {
  outboxTickSeconds: 15,
  reaperCron: "* * * * *", // every 60s
  breakerCron: "*/5 * * * *", // every 5min
  compactionCron: "0 3 * * *", // daily 03:00
  memSyncCron: "0 * * * *", // hourly
} as const;

async function enqueueTick(boss: PgBoss, delaySeconds: number): Promise<void> {
  await boss.send(QUEUES.tick, {}, { startAfter: delaySeconds, singletonKey: QUEUES.tick });
}

export async function startScheduler(): Promise<PgBoss> {
  const url = process.env.DXB_DATABASE_URL;
  if (!url) throw new Error("DXB_DATABASE_URL is not set (session-mode direct URL required)");

  const boss = new PgBoss(url);
  boss.on("error", (err: Error) => console.error("[scheduler] pg-boss:", err));
  await boss.start();

  for (const queue of Object.values(QUEUES)) {
    await boss.createQueue(queue);
  }

  await boss.work(QUEUES.tick, async () => {
    try {
      await tick();
    } finally {
      // Re-arm even when tick throws: attempts>=3 rows are the alert path,
      // a dead chain would silence the executor entirely.
      await enqueueTick(boss, CADENCES.outboxTickSeconds);
    }
  });

  await boss.work(QUEUES.reaper, async () => {
    await sql`SELECT reap_expired_leases()`.execute(getDb());
  });

  await boss.work(QUEUES.breaker, async () => {
    await checkVelocity();
  });

  // Memory lifecycle handlers — error isolation is pg-boss's per-job
  // containment (a throwing handler fails THAT job; the scheduler and the
  // other queues keep running), same guarantee the reaper/breaker rely on.
  await boss.work(QUEUES.compaction, async () => {
    await compactExpired(getDb());
  });

  await boss.work(QUEUES.memSync, async () => {
    await syncClaudeMem(getDb());
  });

  await boss.schedule(QUEUES.reaper, CADENCES.reaperCron);
  await boss.schedule(QUEUES.breaker, CADENCES.breakerCron);
  await boss.schedule(QUEUES.compaction, CADENCES.compactionCron);
  await boss.schedule(QUEUES.memSync, CADENCES.memSyncCron);
  await enqueueTick(boss, 0); // bootstrap the 15s chain

  return boss;
}

export async function stopScheduler(boss: PgBoss): Promise<void> {
  await boss.stop({ graceful: true });
}
