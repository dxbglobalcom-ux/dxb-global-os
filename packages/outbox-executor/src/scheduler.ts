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
import { checkPins, readDxbMcpInventory } from "@dxb/gateway";
import {
  hrPerformanceDaily,
  hrProbationCheck,
  hrStalePersonaScan,
  hrTrainingQueue,
} from "@dxb/hr";
import { drainWorkflowRuns, registerCronTriggers, triggerRunNow } from "@dxb/kernel";
import { compactExpired, syncClaudeMem } from "@dxb/memory-router";
import { drainIntents } from "@dxb/orchestrator";
import { tick } from "./index.js";
import { checkVelocity } from "./breaker.js";

export const QUEUES = {
  tick: "outbox-tick",
  reaper: "lease-reaper",
  breaker: "velocity-breaker",
  compaction: "memory-compaction",
  memSync: "claude-mem-sync",
  pinCheck: "tool-pin-check",
  intentIntake: "intent-intake",
  // HR lifecycle jobs (E5.4b, HR spec §3): run inside this scheduler worker — R5,
  // no new resident service. Queue/schedule rows also seeded by migration
  // 20260712008000 (recorded adaptation A4) so the spec §24 query answers pre-boot;
  // boss.schedule() below upserts the same names.
  hrPerformance: "hr.performance_daily",
  hrProbation: "hr.probation_check",
  hrStalePersona: "hr.stale_persona_scan",
  hrTraining: "hr.training_queue",
  // E9.1 workflow engine (WORKFLOW §3/§6): the runner stays a LIBRARY in the
  // kernel — this scheduler is its pg-boss vehicle. workflow.run drains
  // actionable runs on a self-chain (running runs advance; parked runs whose
  // approvals row got decided resume or fail); cron triggers register as
  // 'wf:<slug>' schedules whose jobs also land here.
  workflowRun: "workflow.run",
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
  // Command-bar seam (08-05): received intents drain on a 5s self-chain —
  // the CEO is watching the IntentStrip, minute-grained cron is too slow.
  intentIntakeSeconds: 5,
  reaperCron: "* * * * *", // every 60s
  breakerCron: "*/5 * * * *", // every 5min
  compactionCron: "0 3 * * *", // daily 03:00
  memSyncCron: "0 * * * *", // hourly
  // Anti rug-pull drift check (07-02, MCP-03): daily 04:00 — after the 03:00
  // compaction so the two daily jobs never contend for the session-mode pool.
  pinCheckCron: "0 4 * * *", // daily 04:00
  // HR crons spread across the quiet window, after compaction, one per hour slot
  // (same session-mode pool contention rule as pinCheck).
  hrPerformanceCron: "30 2 * * *", // daily 02:30
  hrStalePersonaCron: "0 5 * * *", // daily 05:00
  hrProbationCron: "0 6 * * *", // daily 06:00
  hrTrainingCron: "0 7 * * *", // daily 07:00
  // Workflow drain: run_now/resume write only DB rows (a Postgres fn cannot
  // reach pg-boss), so the drain self-chains like intent-intake — 10s keeps
  // manual runs snappy without contending for the session-mode pool.
  workflowDrainSeconds: 10,
} as const;

async function enqueueTick(boss: PgBoss, delaySeconds: number): Promise<void> {
  await boss.send(QUEUES.tick, {}, { startAfter: delaySeconds, singletonKey: QUEUES.tick });
}

async function enqueueIntentIntake(boss: PgBoss, delaySeconds: number): Promise<void> {
  await boss.send(
    QUEUES.intentIntake,
    {},
    { startAfter: delaySeconds, singletonKey: QUEUES.intentIntake },
  );
}

async function enqueueWorkflowDrain(boss: PgBoss, delaySeconds: number): Promise<void> {
  await boss.send(
    QUEUES.workflowRun,
    {},
    { startAfter: delaySeconds, singletonKey: QUEUES.workflowRun },
  );
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

  await boss.work(QUEUES.pinCheck, async () => {
    await checkPins(getDb(), await readDxbMcpInventory());
  });

  // Command-bar intent intake (08-05): same re-arm-even-on-throw discipline
  // as the outbox tick — a dead chain would silently orphan CEO intents.
  await boss.work(QUEUES.intentIntake, async () => {
    try {
      await drainIntents();
    } finally {
      await enqueueIntentIntake(boss, CADENCES.intentIntakeSeconds);
    }
  });

  await boss.work(QUEUES.hrPerformance, async () => {
    await hrPerformanceDaily(getDb());
  });
  await boss.work(QUEUES.hrProbation, async () => {
    await hrProbationCheck(getDb());
  });
  await boss.work(QUEUES.hrStalePersona, async () => {
    await hrStalePersonaScan(getDb());
  });
  await boss.work(QUEUES.hrTraining, async () => {
    await hrTrainingQueue(getDb());
  });

  // E9.1 workflow drain — same re-arm-even-on-throw discipline as the outbox
  // tick (a dead chain would strand every waiting run). Cron-triggered jobs
  // ('wf:<slug>' schedules) also land on this queue: their payload names the
  // slug, run_now fires through the control fn (singleton/disabled skip +
  // audit inside), then the same drain advances whatever became runnable.
  await boss.work(QUEUES.workflowRun, async (jobs: { data?: { slug?: string } }[]) => {
    try {
      for (const job of jobs) {
        if (job.data?.slug) await triggerRunNow(job.data.slug, "cron");
      }
      await drainWorkflowRuns();
    } finally {
      await enqueueWorkflowDrain(boss, CADENCES.workflowDrainSeconds);
    }
  });

  await boss.schedule(QUEUES.reaper, CADENCES.reaperCron);
  await boss.schedule(QUEUES.breaker, CADENCES.breakerCron);
  await boss.schedule(QUEUES.compaction, CADENCES.compactionCron);
  await boss.schedule(QUEUES.memSync, CADENCES.memSyncCron);
  await boss.schedule(QUEUES.pinCheck, CADENCES.pinCheckCron);
  await boss.schedule(QUEUES.hrPerformance, CADENCES.hrPerformanceCron);
  await boss.schedule(QUEUES.hrStalePersona, CADENCES.hrStalePersonaCron);
  await boss.schedule(QUEUES.hrProbation, CADENCES.hrProbationCron);
  await boss.schedule(QUEUES.hrTraining, CADENCES.hrTrainingCron);
  // Workflow cron triggers: enabled trigger.kind='cron' workflows register as
  // 'wf:<slug>' schedules; those jobs need their queue + worker too.
  const cronWfs = await registerCronTriggers({
    schedule: (name, cron, data) => boss.schedule(name, cron, data as object),
    unschedule: (name) => boss.unschedule(name),
  });
  for (const wf of cronWfs) {
    await boss.createQueue(`wf:${wf.slug}`);
    await boss.work(`wf:${wf.slug}`, async () => {
      await triggerRunNow(wf.slug, "cron");
    });
  }

  await enqueueTick(boss, 0); // bootstrap the 15s chain
  await enqueueIntentIntake(boss, 0); // bootstrap the 5s intent chain
  await enqueueWorkflowDrain(boss, 0); // bootstrap the 10s workflow drain

  return boss;
}

export async function stopScheduler(boss: PgBoss): Promise<void> {
  await boss.stop({ graceful: true });
}
