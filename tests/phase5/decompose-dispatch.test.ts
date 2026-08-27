import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { pinHookOff } from "../helpers/suite-scope.js";
import { TaskEnvelope } from "../../packages/shared/src/envelope.js";
import { ClassifiedIntent } from "../../packages/kernel/src/index.js";
import {
  chainDepth,
  decompose,
  dispatch,
  lintBatch,
  runWorkerOnce,
  type DecomposedEnvelope,
} from "../../packages/orchestrator/src/index.js";

// Master-plan steps 4+5 verification (05-05). Three groups:
//   (a) decompose — guards unit-tested without LLM; the live multi-intent
//       drafting call is DXB_LIVE_SDK=1 gated (one recorded run in SUMMARY).
//   (b) dispatch — deterministic hand-built 2-envelope chain, no LLM.
//   (c) e2e — dispatch → runWorkerOnce (injectable executor) → review → done,
//       full task_events chain + live dependency-order claim proof.
// Cleanup deletes ONLY rows this file created (tracked ids) — the suite runs
// sequentially (fileParallelism: false) against the local Supabase stack.

const LIVE = process.env.DXB_LIVE_SDK === "1";

const createdTaskIds: string[] = [];

function envelope(over: Partial<DecomposedEnvelope> = {}): DecomposedEnvelope {
  return {
    ...TaskEnvelope.parse({
      department: "engineering",
      objective: "write a haiku about the DXB task queue and store it as text",
      output_contract: "plain text haiku, 3 lines, done when stored",
      model_tier: "L3",
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

async function sweepTaskIds(taskIds: string[]) {
  if (taskIds.length === 0) return;
  const db = getDb();
  await db
    .deleteFrom("tool_calls")
    .where("run_id", "in", db.selectFrom("agent_runs").select("id").where("task_id", "in", taskIds))
    .execute();
  await db
    .deleteFrom("file_changes")
    .where("run_id", "in", db.selectFrom("agent_runs").select("id").where("task_id", "in", taskIds))
    .execute();
  // E8.4b: failed probe runs raise alerts rows (FK) — sweep before the runs.
  await db
    .deleteFrom("alerts")
    .where("run_id", "in", db.selectFrom("agent_runs").select("id").where("task_id", "in", taskIds))
    .execute();
  await db.deleteFrom("alerts").where("task_id", "in", taskIds).execute();
  await db.deleteFrom("agent_runs").where("task_id", "in", taskIds).execute();
  await db.deleteFrom("task_events").where("task_id", "in", taskIds).execute();
  await db.deleteFrom("tasks").where("id", "in", taskIds).execute();
}

// Interrupted runs skip afterAll (E9.1 lesson; 6 stale probe tasks found
// 2026-07-14), so the stale-probe sweep also runs up front: every task this
// file can create lives in the probe department or carries a probe objective.
async function sweepStaleProbes() {
  const stale = await getDb()
    .selectFrom("tasks")
    .select("id")
    .where((eb) =>
      eb.or([
        eb("department", "=", "orch-test-dispatch"),
        eb("objective", "like", "%haiku%DXB task queue%"),
        eb("objective", "like", "translate the stored haiku%"),
        eb("objective", "like", "compile the two stored haikus%"),
      ]),
    )
    .execute();
  await sweepTaskIds(stale.map((r) => r.id));
}

beforeAll(async () => {
  await sweepStaleProbes();
});

afterAll(async () => {
  await sweepTaskIds(createdTaskIds);
  await sweepStaleProbes();
  await closeDb();
});

// E10.2: this suite predates the hook — pin the §22 flag off for its
// lifetime (restored + alert swept in the helper afterAll).
pinHookOff(() => getDb());

describe("decompose — guards (no LLM)", () => {
  it("self-contained lint rejects a planted back-referencing objective", () => {
    const failures = lintBatch([
      { objective: "collect the raw sales numbers for outlet brand X from the CRM", deps: [] },
      { objective: "summarize the results as mentioned above into five bullets now", deps: [0] },
    ]);
    expect(failures.length).toBe(1);
    expect(failures[0]).toContain("not self-contained");
    expect(failures[0]).toContain("as mentioned");
    // Turkish markers too
    expect(
      lintBatch([{ objective: "önceki adımın çıktısını özetle ve rapor olarak kaydet", deps: [] }])[0],
    ).toContain("önceki");
  });

  // The cap moved from 3 to 5 on the CEO's order of 2026-08-27, after a real intent —
  // a website for a coffee brand the holding is founding — drew a 5-deep chain and was
  // refused twice. Five is the master plan's own ceiling for genuinely complex work
  // (PHASE-05 §2 row 7), so this is that clause exercised, not a new number.
  it("hop guard: a 6-deep dependency chain is rejected, 5-deep passes", () => {
    const ok = (o: string) => ({ objective: `${o} — fully self-contained work order text`, deps: [] as number[] });
    const chain = (n: number) =>
      Array.from({ length: n }, (_, i) => (i === 0 ? ok("a") : { ...ok(`step ${i}`), deps: [i - 1] }));
    const six = chain(6);
    expect(chainDepth(six.map((d) => d.deps))).toBe(6);
    expect(lintBatch(six).some((f) => f.includes("hop cap"))).toBe(true);
    expect(lintBatch(chain(5))).toEqual([]);
    // the depth that was refused before his order now passes
    expect(lintBatch(chain(4))).toEqual([]);
  });

  it("forward references and oversized batches are rejected", () => {
    expect(
      lintBatch([{ objective: "self-contained order that depends on a later item somehow", deps: [1] }])[0],
    ).toContain("EARLIER items only");
    const big = Array.from({ length: 11 }, (_, i) => ({
      objective: `self-contained work order number ${i} with all facts inlined`,
      deps: [],
    }));
    expect(lintBatch(big)[0]).toContain("exceeds the cap of 10");
  });

  it("complexity 'single' derives one Zod-valid envelope without any LLM call", async () => {
    const ci = ClassifiedIntent.parse({
      intent_summary: "fix the failing unit test in the shared TypeScript package",
      task_class: "code.standard",
      departments: ["engineering"],
      approval_class: "internal",
      complexity: "single",
    });
    const out = await decompose(ci);
    expect(out).toHaveLength(1);
    expect(() => TaskEnvelope.parse(out[0])).not.toThrow();
    expect(out[0].deps).toEqual([]);
    // U21 (2026-07-26): code.standard moved from L3 to L1 — building a site or a
    // store is design work, so it never leaves Opus 5. The literal is gone; the
    // assertion now reads the live row, because what this test owns is "route()
    // decided the tier, not the LLM", not which tier the CEO currently wants.
    const expectedTier = await getDb()
      .selectFrom("routing_rules")
      .select("model_tier")
      .where("task_class", "=", "code.standard")
      .where("enabled", "=", true)
      .orderBy("priority", "desc")
      .executeTakeFirstOrThrow();
    expect(out[0].model_tier).toBe(expectedTier.model_tier);
    expect(out[0].approval_class).toBe("internal"); // propagated, not lowered
  });
});

describe.skipIf(!LIVE)("decompose — live multi-intent drafting (master-plan step 4)", () => {
  it(
    "multi intent → >= 2 Zod-valid envelopes with a correct forward-only deps chain",
    async () => {
      const ci = ClassifiedIntent.parse({
        intent_summary:
          "plan and prepare a multi-channel summer sale campaign across email and paid ads",
        task_class: "orchestration",
        departments: ["marketing"],
        approval_class: "internal",
        complexity: "multi",
      });
      const out = await decompose(ci);
      // eslint-disable-next-line no-console
      console.log("live decompose:", JSON.stringify(out, null, 1));
      expect(out.length).toBeGreaterThanOrEqual(2);
      out.forEach((e, i) => {
        expect(() => TaskEnvelope.parse(e)).not.toThrow();
        for (const d of e.deps) expect(d).toBeLessThan(i); // topological by construction
        expect(["internal", "outward"]).toContain(e.approval_class); // never below ci's
      });
      expect(chainDepth(out.map((e) => e.deps))).toBeLessThanOrEqual(3);
      expect(out.some((e) => e.deps.length > 0)).toBe(true); // it IS a chain
    },
    300_000,
  );
});

describe("dispatch — queue rows + events (deterministic)", () => {
  it("2-envelope chain: both queued, depends_on resolved to uuid, two created events", async () => {
    const dept = "orch-test-dispatch";
    const [aId, bId] = await trackDispatch([
      envelope({ department: dept }),
      envelope({
        department: dept,
        objective: "translate the stored haiku from task A into formal German prose",
        deps: [0],
      }),
    ]);

    // Looked up BY ID, never by order. This read used to be
    // `.orderBy("created_at")` and take rows[0] as A and rows[1] as B, and it
    // was a coin flip: `tasks.created_at` defaults to `now()`, which in
    // PostgreSQL is the TRANSACTION's timestamp, and dispatch() inserts the
    // whole batch inside one transaction — so both rows carry the identical
    // timestamp and the tie is broken however the planner feels. Measured
    // 2026-08-24 on the construction engine: two rows inserted one after another
    // in one transaction → `count(DISTINCT created_at) = 1`. It failed one full
    // battery run in three, always here, always with A and B the other way
    // round.
    const rows = await getDb()
      .selectFrom("tasks")
      .select(["id", "status", "depends_on"])
      .where("id", "in", [aId, bId])
      .execute();
    expect(rows).toHaveLength(2);
    const byId = new Map(rows.map((r) => [r.id, r]));
    const a = byId.get(aId);
    const b = byId.get(bId);
    expect(a, "task A was not queued at all").toBeTruthy();
    expect(b, "task B was not queued at all").toBeTruthy();
    expect([a!.status, b!.status]).toEqual(["queued", "queued"]);
    expect(a!.depends_on).toEqual([]);
    expect(b!.depends_on).toEqual([aId]);

    const events = await getDb()
      .selectFrom("task_events")
      .select(["task_id", "event", "actor", "payload"])
      .where("task_id", "in", [aId, bId])
      .orderBy("id")
      .execute();
    expect(events).toHaveLength(2);
    for (const ev of events) {
      expect(ev.event).toBe("created");
      expect(ev.actor).toBe("orchestrator:dispatch");
    }
    expect((events[1].payload as { deps: number[] }).deps).toEqual([0]);
  });

  it("atomicity: a batch with one Zod-invalid envelope inserts ZERO rows", async () => {
    const before = await getDb()
      .selectFrom("tasks")
      .select(({ fn }) => fn.countAll<string>().as("n"))
      .executeTakeFirstOrThrow();
    await expect(
      dispatch([envelope(), { ...envelope(), objective: "too short" } as DecomposedEnvelope]),
    ).rejects.toThrow();
    const after = await getDb()
      .selectFrom("tasks")
      .select(({ fn }) => fn.countAll<string>().as("n"))
      .executeTakeFirstOrThrow();
    expect(after.n).toBe(before.n);
  });
});

describe("worker shim — e2e claim→work→done with full event chain (master-plan step 5)", () => {
  it("one envelope runs end-to-end; task_events chain complete and ordered", async () => {
    const dept = "orch-test-e2e";
    const [taskId] = await trackDispatch([envelope({ department: dept })]);

    const run = await runWorkerOnce({
      workerId: "worker-e2e-1",
      departments: [dept],
      execute: async () => ({ result: { text: "ok" }, confidence: 0.95 }),
    });
    expect(run).toMatchObject({ claimed: true, taskId, status: "review", confidence: 0.95 });

    const afterShim = await getDb()
      .selectFrom("tasks")
      .select(["status", "result", "claimed_by"])
      .where("id", "=", taskId)
      .executeTakeFirstOrThrow();
    expect(afterShim.status).toBe("review");
    expect(afterShim.claimed_by).toBe("worker-e2e-1");
    expect(afterShim.result).toMatchObject({ text: "ok", confidence: 0.95 });

    // Manual head verdict closes the chain (QA/approval automation is 05-06/07).
    await getDb()
      .updateTable("tasks")
      .set({ status: "done" })
      .where("id", "=", taskId)
      .where("status", "=", "review")
      .execute();
    await getDb()
      .insertInto("task_events")
      .values({
        task_id: taskId,
        event: "transition",
        from_status: "review",
        to_status: "done",
        actor: "test:head-review",
        payload: JSON.stringify({ verdict: "pass" }),
      })
      .execute();

    const chain = await getDb()
      .selectFrom("task_events")
      .select(["event", "from_status", "to_status", "actor"])
      .where("task_id", "=", taskId)
      .orderBy("id")
      .execute();
    // eslint-disable-next-line no-console
    console.log("e2e event chain:", JSON.stringify(chain, null, 1));
    expect(chain.length).toBeGreaterThanOrEqual(4);
    expect(chain.map((e) => `${e.event}:${e.from_status}→${e.to_status}`)).toEqual([
      "created:inbox→queued",
      "claimed:queued→claimed",
      "transition:claimed→running",
      "transition:running→review",
      "transition:review→done",
    ]);
    const review = chain.find((e) => e.to_status === "review");
    expect(review?.actor).toBe("worker-e2e-1");
  });

  it("dependency order live: independent task claimed first, dependent only after its dep is done", async () => {
    const dept = "orch-test-deps";
    const [aId, bId] = await trackDispatch([
      envelope({ department: dept }),
      envelope({
        department: dept,
        objective: "compile the two stored haikus into a printable single-page PDF layout",
        deps: [0],
      }),
    ]);

    // First claim must take A (B is dependency-blocked).
    const first = await runWorkerOnce({
      workerId: "worker-dep-1",
      departments: [dept],
      execute: async () => ({ result: { text: "haiku done" }, confidence: 0.9 }),
    });
    expect(first).toMatchObject({ claimed: true, taskId: aId, status: "review" });

    // A is in review (not done) — B must still be unclaimable.
    const blocked = await runWorkerOnce({
      workerId: "worker-dep-2",
      departments: [dept],
      execute: async () => ({ result: { text: "must not run" }, confidence: 1 }),
    });
    expect(blocked).toEqual({ claimed: false });

    // Close A → B becomes claimable.
    await getDb().updateTable("tasks").set({ status: "done" }).where("id", "=", aId).execute();
    const second = await runWorkerOnce({
      workerId: "worker-dep-2",
      departments: [dept],
      execute: async () => ({ result: { text: "pdf done" }, confidence: 0.8 }),
    });
    expect(second).toMatchObject({ claimed: true, taskId: bId, status: "review" });
  });

  it("executor throw transitions the task to failed with the error evented", async () => {
    const dept = "orch-test-fail";
    const [taskId] = await trackDispatch([envelope({ department: dept })]);
    const run = await runWorkerOnce({
      workerId: "worker-fail-1",
      departments: [dept],
      execute: async () => {
        throw new Error("synthetic executor failure");
      },
    });
    expect(run).toMatchObject({ claimed: true, taskId, status: "failed" });
    const row = await getDb()
      .selectFrom("tasks")
      .select("status")
      .where("id", "=", taskId)
      .executeTakeFirstOrThrow();
    expect(row.status).toBe("failed");
    const failEvent = await getDb()
      .selectFrom("task_events")
      .select("payload")
      .where("task_id", "=", taskId)
      .where("to_status", "=", "failed")
      .executeTakeFirstOrThrow();
    expect((failEvent.payload as { error: string }).error).toContain("synthetic executor failure");
  });
});
