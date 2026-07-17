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
import { checkPins, compileLibraryProfiles, readDxbMcpInventory } from "@dxb/gateway";
import {
  hrPerformanceDaily,
  hrProbationCheck,
  hrStalePersonaScan,
  hrTrainingQueue,
} from "@dxb/hr";
import { drainWorkflowRuns, registerCronTriggers, triggerRunNow } from "@dxb/kernel";
import { compactExpired, syncClaudeMem } from "@dxb/memory-router";
import { drainIntents, drainTasks } from "@dxb/orchestrator";
import { revenueBrief, revenueRollup, revenueScan, revenueScore } from "@dxb/revenue";
import { drainVoiceCalls, voiceAudioDir } from "@dxb/voice";
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
  // E9.5 library engine (HOLDING_LIBRARY §6, adaptation A6): a Postgres fn
  // cannot reach pg-boss (E9.1 A1 emsal), so grant changes are picked up by a
  // self-chained recompile that regenerates against the live record and swaps
  // profile files only when the source hash moved.
  libraryRecompile: "library.profile_recompile",
  // R1.3 revenue cycle (REVENUE_ENGINE_SPEC §3): same in-scheduler idiom as
  // the HR jobs — pre-R2 the handlers are mechanical digests + the intake
  // halal screen. Queue/schedule rows also seeded by migration
  // 20260717030100 (hr A4 precedent) so the spec §24.3 query answers pre-boot.
  revenueScan: "revenue.scan",
  revenueScore: "revenue.score",
  revenueBrief: "revenue.brief",
  revenueRollup: "revenue.rollup",
  // R2.1 resident worker (audit F-01): the business `tasks` queue finally has
  // a production consumer. Same self-chain idiom as intent-intake — the tasks
  // themselves STAY in the tasks table (Phase 3 LOCKED: two queues = two
  // sources of truth); this pg-boss job is only the drain vehicle.
  taskWorker: "task.worker",
  // R3.1 voice call line (VOICE_INTERACTION_SPEC §6): the answer half of a
  // call CANNOT run in the dashboard (PHASE-08 LOCKED — no LLM surface in the
  // projection client) and a Postgres fn cannot reach pg-boss (E9.1 A1), so
  // parked 'routing' voice_calls rows drain here on a self-chain.
  voiceDrain: "voice.drain",
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
  // Library recompile: unchanged-hash runs are two SELECTs + policy reads, so
  // 30s keeps a CEO grant change effective inside half a minute without
  // pressuring the session-mode pool.
  libraryRecompileSeconds: 30,
  // Resident worker drain (R2.1): 10s keeps the queue moving without pool
  // pressure — an execution leg holds its job for the LLM's duration anyway,
  // and the chain re-arms only after the drain returns.
  taskWorkerSeconds: 10,
  // Voice drain (R3.1): the CEO is on the line waiting — 5s matches the
  // intent-intake cadence rationale; the answer leg holds its job for the
  // LLM+TTS duration, the chain re-arms after the drain returns.
  voiceDrainSeconds: 5,
  // Revenue cycle: spec §22 stagger inside the 05:00-06:00 UTC window, but
  // off the exact hours already owned by hrStalePersona (05:00) and
  // hrProbation (06:00) — session-mode pool contention rule.
  revenueScanCron: "10 5 * * *", // daily 05:10
  revenueScoreCron: "25 5 * * *", // daily 05:25
  revenueBriefCron: "40 5 * * *", // daily 05:40
  revenueRollupCron: "55 5 * * *", // daily 05:55
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

async function enqueueLibraryRecompile(boss: PgBoss, delaySeconds: number): Promise<void> {
  await boss.send(
    QUEUES.libraryRecompile,
    {},
    { startAfter: delaySeconds, singletonKey: QUEUES.libraryRecompile },
  );
}

async function enqueueTaskWorker(boss: PgBoss, delaySeconds: number): Promise<void> {
  await boss.send(
    QUEUES.taskWorker,
    {},
    { startAfter: delaySeconds, singletonKey: QUEUES.taskWorker },
  );
}

async function enqueueVoiceDrain(boss: PgBoss, delaySeconds: number): Promise<void> {
  await boss.send(
    QUEUES.voiceDrain,
    {},
    { startAfter: delaySeconds, singletonKey: QUEUES.voiceDrain },
  );
}

export async function startScheduler(): Promise<PgBoss> {
  const url = process.env.DXB_DATABASE_URL;
  if (!url) throw new Error("DXB_DATABASE_URL is not set (session-mode direct URL required)");

  const boss = new PgBoss(url);
  boss.on("error", (err: Error) => console.error("[scheduler] pg-boss:", err));
  await boss.start();

  // Self-chained queues need policy 'short' (R2.1 measured defect): pg-boss 12
  // enforces singletonKey dedup ONLY under 'short' (unique index scoped to
  // state='created' AND policy='short'). Under 'standard' every bootstrap
  // send minted one more parallel chain. 'short' = one queued tick max,
  // unlimited active — pending ticks dedupe, an orphaned active job never
  // blocks the re-arm. Existing 'standard' rows are flipped by migration
  // 20260717050000 (createQueue is ON CONFLICT DO NOTHING — it cannot).
  const chainQueues: string[] = [
    QUEUES.tick,
    QUEUES.intentIntake,
    QUEUES.workflowRun,
    QUEUES.libraryRecompile,
    QUEUES.taskWorker,
    QUEUES.voiceDrain,
  ];
  for (const queue of Object.values(QUEUES)) {
    await boss.createQueue(queue, chainQueues.includes(queue) ? { policy: "short" } : {});
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

  // R1.3 revenue cycle — same in-scheduler idiom as the HR jobs above.
  await boss.work(QUEUES.revenueScan, async () => {
    await revenueScan(getDb());
  });
  await boss.work(QUEUES.revenueScore, async () => {
    await revenueScore(getDb());
  });
  await boss.work(QUEUES.revenueBrief, async () => {
    await revenueBrief(getDb());
  });
  await boss.work(QUEUES.revenueRollup, async () => {
    await revenueRollup(getDb());
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

  // E9.5 library recompile — same re-arm-even-on-throw discipline (a dead
  // chain would freeze grant changes out of the gateway forever). Unchanged
  // hash = cheap no-op; a compile failure leaves the old set in force (§17)
  // and surfaces through pg-boss job failure, not a broken profile dir.
  await boss.work(QUEUES.libraryRecompile, async () => {
    try {
      await compileLibraryProfiles(getDb());
    } finally {
      await enqueueLibraryRecompile(boss, CADENCES.libraryRecompileSeconds);
    }
  });

  // R2.1 resident worker drain — same re-arm-even-on-throw discipline (a dead
  // chain = the anti-babysitting engine silently stops). Per-task errors are
  // contained inside drainTasks; only infrastructure faults reach this catch.
  await boss.work(QUEUES.taskWorker, async () => {
    try {
      await drainTasks();
    } finally {
      await enqueueTaskWorker(boss, CADENCES.taskWorkerSeconds);
    }
  });

  // R3.1 voice drain — same re-arm-even-on-throw discipline (a dead chain =
  // the CEO speaks into a line nobody answers). Per-call errors land in the
  // call's own failed state inside drainVoiceCalls/answerVoiceCall.
  await boss.work(QUEUES.voiceDrain, async () => {
    try {
      await drainVoiceCalls({ db: getDb(), audioDir: voiceAudioDir() });
    } finally {
      await enqueueVoiceDrain(boss, CADENCES.voiceDrainSeconds);
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
  await boss.schedule(QUEUES.revenueScan, CADENCES.revenueScanCron);
  await boss.schedule(QUEUES.revenueScore, CADENCES.revenueScoreCron);
  await boss.schedule(QUEUES.revenueBrief, CADENCES.revenueBriefCron);
  await boss.schedule(QUEUES.revenueRollup, CADENCES.revenueRollupCron);
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
  await enqueueLibraryRecompile(boss, 0); // bootstrap the 30s library recompile
  // R2.1: bootstrap the resident worker chain. Restart continuity by
  // construction: a pending chain job (created state) dedupes on singletonKey
  // so exactly one chain survives; an orphaned active job (process died
  // mid-drain) does NOT block this send, so the chain resumes immediately and
  // the orphan's eventual retry is harmless (every downstream mutation is
  // race-safe: SKIP LOCKED claim + guarded transitions + idempotent ladder).
  await enqueueTaskWorker(boss, 0);
  // R3.1: bootstrap the voice drain chain (same continuity-by-construction
  // guarantee as the task worker chain above).
  await enqueueVoiceDrain(boss, 0);

  return boss;
}

export async function stopScheduler(boss: PgBoss): Promise<void> {
  await boss.stop({ graceful: true });
}
