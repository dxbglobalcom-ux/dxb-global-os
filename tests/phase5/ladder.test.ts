import { afterAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { TaskEnvelope } from "../../packages/shared/src/envelope.js";
import {
  bumpTier,
  dispatch,
  escalate,
  failCount,
  ladderAction,
  runWorkerOnce,
  type DecomposedEnvelope,
} from "../../packages/orchestrator/src/index.js";

// Master-plan step 6 verification (05-06, ORCH-03). Deterministic — pure DB +
// injectable executors, no LLM, never skipped. Groups:
//   (0) the LOCKED ladder map, pure (diffable against PHASE-05 §3)
//   (a) worker fails 2× → the THIRD claim serves the task at a HIGHER tier,
//       proven from task_events alone
//   (b) low-confidence review (<0.6) converts to failed and the ladder engages
//   (c) hard stop after fail 5: zero requeue, blocked report in tasks.feedback
//       + audit_log, further escalate() is a no-op (T-05-13/15)
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const createdTaskIds: string[] = [];

function envelope(over: Partial<DecomposedEnvelope> = {}): DecomposedEnvelope {
  return {
    ...TaskEnvelope.parse({
      department: "orch-test-ladder",
      objective: "produce a two-sentence summary of the DXB escalation ladder design",
      output_contract: "plain text, two sentences, done when stored",
      model_tier: "L4",
      approval_class: "none",
    }),
    deps: [],
    ...over,
  };
}

async function trackDispatch(envelopes: DecomposedEnvelope[]): Promise<string[]> {
  const { taskIds } = await dispatch(envelopes);
  createdTaskIds.push(...taskIds);
  return taskIds;
}

const failingExecutor = (label: string) => async () => {
  throw new Error(`synthetic ladder failure: ${label}`);
};

afterAll(async () => {
  const db = getDb();
  if (createdTaskIds.length > 0) {
    await db.deleteFrom("task_events").where("task_id", "in", createdTaskIds).execute();
    await db.deleteFrom("audit_log").where("task_id", "in", createdTaskIds).execute();
    await db.deleteFrom("tasks").where("id", "in", createdTaskIds).execute();
  }
  await closeDb();
});

describe("ladder map — LOCKED, pure, no DB (PHASE-05 §3 line-for-line)", () => {
  it("0/1/2/3/4/beyond map exactly to the §3 comment", () => {
    expect(ladderAction(0)).toEqual({ kind: "none" }); // 0→first-assignment tier
    expect(ladderAction(1)).toEqual({ kind: "requeue", ladder: "retry-same-tier", tier: "same" });
    expect(ladderAction(2)).toEqual({ kind: "requeue", ladder: "specialist", tier: "bump" });
    expect(ladderAction(3)).toEqual({ kind: "requeue", ladder: "head-review", tier: "L2" });
    expect(ladderAction(4)).toEqual({ kind: "requeue", ladder: "fable-final", tier: "L1" });
    expect(ladderAction(5)).toEqual({ kind: "blocked" });
    expect(ladderAction(99)).toEqual({ kind: "blocked" }); // beyond → still blocked, never wraps
  });

  it("bumpTier climbs L4→L3→L2→L1 and caps at L1", () => {
    expect(bumpTier("L4")).toBe("L3");
    expect(bumpTier("L3")).toBe("L2");
    expect(bumpTier("L2")).toBe("L1");
    expect(bumpTier("L1")).toBe("L1");
  });
});

describe("master-plan step 6 — 2× fail → third claim at higher tier (events as evidence)", () => {
  it("worker fails twice; the THIRD claim serves the task with the bumped model_tier", async () => {
    const dept = "orch-ladder-a";
    const [taskId] = await trackDispatch([envelope({ department: dept })]);
    const db = getDb();

    // fail 1 → ladder step 1: same-tier retry
    const run1 = await runWorkerOnce({
      workerId: "worker-lad-1",
      departments: [dept],
      execute: failingExecutor("first attempt"),
    });
    expect(run1).toMatchObject({ claimed: true, taskId, status: "failed" });
    const esc1 = await escalate(db, taskId);
    expect(esc1).toEqual({ action: "requeued", ladder: "retry-same-tier", failCount: 1, modelTier: "L4" });

    // fail 2 → ladder step 2: specialist, one tier up (L4→L3)
    const run2 = await runWorkerOnce({
      workerId: "worker-lad-1",
      departments: [dept],
      execute: failingExecutor("second attempt"),
    });
    expect(run2).toMatchObject({ claimed: true, taskId, status: "failed" });
    const esc2 = await escalate(db, taskId);
    expect(esc2).toEqual({ action: "requeued", ladder: "specialist", failCount: 2, modelTier: "L3" });

    // THIRD claim: the worker must receive the task at the HIGHER tier.
    let servedTier = "";
    const run3 = await runWorkerOnce({
      workerId: "worker-lad-2",
      departments: [dept],
      execute: async (task) => {
        servedTier = task.model_tier;
        return { result: { text: "specialist succeeded" }, confidence: 0.9 };
      },
    });
    expect(run3).toMatchObject({ claimed: true, taskId, status: "review" });
    expect(servedTier).toBe("L3"); // bumped — not the original L4

    // The whole ladder story must be readable from task_events ALONE.
    const events = await db
      .selectFrom("task_events")
      .select(["event", "from_status", "to_status", "actor", "payload"])
      .where("task_id", "=", taskId)
      .orderBy("id")
      .execute();
    // eslint-disable-next-line no-console
    console.log("ladder event chain:", JSON.stringify(events, null, 1));
    expect(events.map((e) => `${e.event}:${e.from_status}→${e.to_status}`)).toEqual([
      "created:inbox→queued",
      "claimed:queued→claimed",
      "transition:claimed→running",
      "transition:running→failed",
      "transition:failed→queued", // retry-same-tier
      "claimed:queued→claimed",
      "transition:claimed→running",
      "transition:running→failed",
      "transition:failed→queued", // specialist
      "claimed:queued→claimed",
      "transition:claimed→running",
      "transition:running→review",
    ]);
    const requeues = events.filter((e) => e.to_status === "queued" && e.event === "transition");
    expect(requeues.map((e) => (e.payload as { ladder: string }).ladder)).toEqual([
      "retry-same-tier",
      "specialist",
    ]);
    expect((requeues[1].payload as { model_tier: string }).model_tier).toBe("L3");
    for (const r of requeues) expect(r.actor).toBe("orchestrator:escalate");
    expect(await failCount(db, taskId)).toBe(2); // monotonic, derived only from events
  });
});

describe("low-confidence rule — confidence < 0.6 counts as a fail (LOCKED)", () => {
  it("a 0.4-confidence review is converted to failed(reason low-confidence) and requeued", async () => {
    const dept = "orch-ladder-b";
    const [taskId] = await trackDispatch([envelope({ department: dept })]);
    const db = getDb();

    const run = await runWorkerOnce({
      workerId: "worker-lad-lc",
      departments: [dept],
      execute: async () => ({ result: { text: "shaky work" }, confidence: 0.4 }),
    });
    expect(run).toMatchObject({ claimed: true, taskId, status: "review", confidence: 0.4 });

    const esc = await escalate(db, taskId);
    expect(esc).toEqual({ action: "requeued", ladder: "retry-same-tier", failCount: 1, modelTier: "L4" });

    const failEvent = await db
      .selectFrom("task_events")
      .select(["from_status", "payload"])
      .where("task_id", "=", taskId)
      .where("to_status", "=", "failed")
      .executeTakeFirstOrThrow();
    expect(failEvent.from_status).toBe("review");
    expect(failEvent.payload).toMatchObject({ reason: "low-confidence", confidence: 0.4 });

    const row = await db
      .selectFrom("tasks")
      .select("status")
      .where("id", "=", taskId)
      .executeTakeFirstOrThrow();
    expect(row.status).toBe("queued"); // ladder engaged
  });

  it("a confident review (>= 0.6) is NOT converted — escalate is a no-op", async () => {
    const dept = "orch-ladder-b2";
    const [taskId] = await trackDispatch([envelope({ department: dept })]);
    const db = getDb();
    await runWorkerOnce({
      workerId: "worker-lad-ok",
      departments: [dept],
      execute: async () => ({ result: { text: "solid work" }, confidence: 0.9 }),
    });
    expect(await escalate(db, taskId)).toEqual({ action: "none", failCount: 0 });
    const row = await db
      .selectFrom("tasks")
      .select("status")
      .where("id", "=", taskId)
      .executeTakeFirstOrThrow();
    expect(row.status).toBe("review"); // untouched
  });
});

describe("hard stop — fail 5 blocks forever, never a silent drop (T-05-13/15)", () => {
  it("5 fails → no requeue, blocked report in tasks.feedback + audit_log; re-escalate is a no-op", async () => {
    const dept = "orch-ladder-c";
    const [taskId] = await trackDispatch([envelope({ department: dept })]);
    const db = getDb();

    // Drive the ladder to exhaustion: tiers L4 → L4 → L3 → L2 → L1 → blocked.
    const expectedRungs = [
      { ladder: "retry-same-tier", modelTier: "L4" },
      { ladder: "specialist", modelTier: "L3" },
      { ladder: "head-review", modelTier: "L2" },
      { ladder: "fable-final", modelTier: "L1" },
    ];
    for (let attempt = 1; attempt <= 4; attempt++) {
      const run = await runWorkerOnce({
        workerId: `worker-hard-${attempt}`,
        departments: [dept],
        execute: failingExecutor(`attempt ${attempt}`),
      });
      expect(run).toMatchObject({ claimed: true, taskId, status: "failed" });
      const esc = await escalate(db, taskId);
      expect(esc).toMatchObject({ action: "requeued", failCount: attempt, ...expectedRungs[attempt - 1] });
    }
    const run5 = await runWorkerOnce({
      workerId: "worker-hard-5",
      departments: [dept],
      execute: failingExecutor("attempt 5 — Fable final also failed"),
    });
    expect(run5).toMatchObject({ claimed: true, taskId, status: "failed" });

    const esc5 = await escalate(db, taskId);
    expect(esc5).toEqual({ action: "blocked", failCount: 5, alreadyBlocked: false });

    // NO queued row remains — the task can never be claimed again.
    const row = await db
      .selectFrom("tasks")
      .select(["status", "feedback"])
      .where("id", "=", taskId)
      .executeTakeFirstOrThrow();
    expect(row.status).toBe("failed");
    expect(row.feedback).toContain("BLOCKED after 5 failures");
    expect(row.feedback).toContain(taskId);
    expect(row.feedback).toContain("attempt 5 — Fable final also failed");
    expect((row.feedback!.match(/^\d+\. /gm) ?? []).length).toBe(5); // 5 failure summaries

    const audit = await db
      .selectFrom("audit_log")
      .select(["actor", "actor_type", "action"])
      .where("task_id", "=", taskId)
      .where("action", "=", "task.blocked")
      .execute();
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ actor: "orchestrator:escalate", actor_type: "system" });

    const unclaimable = await runWorkerOnce({
      workerId: "worker-hard-6",
      departments: [dept],
      execute: async () => ({ result: { text: "must never run" }, confidence: 1 }),
    });
    expect(unclaimable).toEqual({ claimed: false });

    // Monotonic no-op: a further escalate() writes nothing new (§5 risk 2).
    const escAgain = await escalate(db, taskId);
    expect(escAgain).toEqual({ action: "blocked", failCount: 5, alreadyBlocked: true });
    const auditAgain = await db
      .selectFrom("audit_log")
      .select("id")
      .where("task_id", "=", taskId)
      .where("action", "=", "task.blocked")
      .execute();
    expect(auditAgain).toHaveLength(1); // still exactly one blocked row
    const feedbackAgain = await db
      .selectFrom("tasks")
      .select("feedback")
      .where("id", "=", taskId)
      .executeTakeFirstOrThrow();
    expect(feedbackAgain.feedback).toBe(row.feedback); // unchanged
  });
});
