// B43 (CEO 2026-09-03 evening, "yapılacak mimari neyse o yapılsın"): a lane is its own loop.
// Pure, no engine: fakes stand in for drainTasks and sleep.
//   1. a long task in lane 1 does NOT stop lane 2 from taking the next task at once
//      (measured defect: the tick's Promise.all held every hand for the longest run)
//   2. an idle lane rests one tick and looks again; a working lane looks again at once
//   3. lowering the count retires a lane only after its current drain; raising it starts loops
//   4. a lane that throws does not spin and does not take its siblings down
//   5. stop() resolves after the current drains and takes no new work
//   6. (CEO 2026-09-13, zero idle) the rest between an idle lane's looks is 3 s by default,
//      DXB_LANE_REST_SECONDS sets it (10 = the old behaviour), nonsense falls back, 60 s is the cap
import { describe, expect, it } from "vitest";
import { DEFAULT_LANE_REST_SECONDS, TaskLanes, laneRestMsFromEnv, type DrainOutcome } from "../../packages/outbox-executor/src/task-lanes.js";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const none: DrainOutcome = { executed: 0, reviewed: 0, escalated: 0 };
const one: DrainOutcome = { executed: 1, reviewed: 0, escalated: 0 };

describe("B43 · task lanes — one long job never holds the other hands", () => {
  it("lane 2 takes the next task while lane 1 is inside a long run", async () => {
    const queue = ["long", "short"];
    const claimedAt: Record<string, number> = {};
    const t0 = Date.now();
    const lanes = new TaskLanes(
      {
        drain: async (wid) => {
          const t = queue.shift();
          if (!t) return none;
          claimedAt[t] = Date.now() - t0;
          await wait(t === "long" ? 600 : 20);
          return one;
        },
        sleep: wait,
      },
      50,
      (i) => (i === 0 ? undefined : `lane-${i + 1}`),
    );
    const r = lanes.reconcile(2);
    expect(r).toEqual({ desired: 2, started: 2, running: 2 });
    await wait(150);
    expect(claimedAt.long).toBeLessThan(100);
    expect(claimedAt.short).toBeLessThan(100); // taken by lane 2 while lane 1 is still busy
    await lanes.stop();
    expect(lanes.running).toBe(0);
  });

  it("an idle lane rests one tick; a working lane looks again at once", async () => {
    const outcomes: DrainOutcome[] = [one, one, none, none];
    const stamps: number[] = [];
    const t0 = Date.now();
    const lanes = new TaskLanes(
      { drain: async () => { stamps.push(Date.now() - t0); return outcomes.shift() ?? none; }, sleep: wait },
      120,
      () => undefined,
    );
    lanes.reconcile(1);
    await wait(320);
    await lanes.stop();
    // two working drains back-to-back (<40 ms apart), then the idle drains ~120 ms apart
    expect(stamps.length).toBeGreaterThanOrEqual(4);
    expect(stamps[1] - stamps[0]).toBeLessThan(40);
    expect(stamps[2] - stamps[1]).toBeLessThan(40);
    expect(stamps[3] - stamps[2]).toBeGreaterThanOrEqual(100);
  });

  it("lowering the count retires a lane after its drain; raising it starts loops again", async () => {
    let inFlight = 0;
    let peak = 0;
    const lanes = new TaskLanes(
      {
        drain: async () => {
          inFlight += 1; peak = Math.max(peak, inFlight);
          await wait(60);
          inFlight -= 1;
          return one;
        },
        sleep: wait,
      },
      30,
      (i) => (i === 0 ? undefined : `lane-${i + 1}`),
    );
    lanes.reconcile(3);
    await wait(40);
    expect(lanes.running).toBe(3);
    lanes.reconcile(1);
    expect(lanes.running).toBe(3); // nothing is interrupted mid-drain
    await wait(150);
    expect(lanes.running).toBe(1); // the surplus stood down after finishing
    const r = lanes.reconcile(2);
    expect(r.started).toBe(1);
    expect(lanes.running).toBe(2);
    await lanes.stop();
    expect(peak).toBe(3);
  });

  it("a lane that throws rests and retries; its sibling keeps working", async () => {
    let bad = 0;
    let good = 0;
    const logged: string[] = [];
    const lanes = new TaskLanes(
      {
        drain: async (wid) => {
          if (wid === undefined) { bad += 1; throw new Error("boom"); }
          good += 1; await wait(10); return one;
        },
        sleep: wait,
        log: (l) => logged.push(l),
      },
      40,
      (i) => (i === 0 ? undefined : `lane-${i + 1}`),
    );
    lanes.reconcile(2);
    await wait(200);
    await lanes.stop();
    expect(bad).toBeGreaterThanOrEqual(3);
    expect(bad).toBeLessThan(12); // rested between failures, did not spin
    expect(good).toBeGreaterThan(5);
    expect(logged[0]).toContain("lane 1 failed: boom");
  });

  it("stop() waits for the current drains and takes no new work", async () => {
    let drains = 0;
    const lanes = new TaskLanes(
      { drain: async () => { drains += 1; await wait(80); return one; }, sleep: wait },
      20,
      () => undefined,
    );
    lanes.reconcile(1);
    await wait(30);
    const t0 = Date.now();
    await lanes.stop();
    expect(Date.now() - t0).toBeGreaterThanOrEqual(40); // waited for the drain in flight
    const after = drains;
    await wait(100);
    expect(drains).toBe(after);
    expect(lanes.reconcile(2)).toEqual({ desired: 0, started: 0, running: 0 });
  });
});

describe("B43 · the rest between looks — DXB_LANE_REST_SECONDS", () => {
  it("is 3 s by default, takes the environment's number, rolls back to 10 s on request, never spins and never sleeps past a minute", () => {
    expect(DEFAULT_LANE_REST_SECONDS).toBe(3);
    expect(laneRestMsFromEnv({})).toBe(3000);
    expect(laneRestMsFromEnv({ DXB_LANE_REST_SECONDS: "" })).toBe(3000);
    expect(laneRestMsFromEnv({ DXB_LANE_REST_SECONDS: "10" })).toBe(10_000); // the pre-2026-09-13 behaviour
    expect(laneRestMsFromEnv({ DXB_LANE_REST_SECONDS: "0.5" })).toBe(500);
    expect(laneRestMsFromEnv({ DXB_LANE_REST_SECONDS: "0" })).toBe(3000); // zero would spin
    expect(laneRestMsFromEnv({ DXB_LANE_REST_SECONDS: "-4" })).toBe(3000);
    expect(laneRestMsFromEnv({ DXB_LANE_REST_SECONDS: "ten" })).toBe(3000);
    expect(laneRestMsFromEnv({ DXB_LANE_REST_SECONDS: "600" })).toBe(60_000);
  });
});
