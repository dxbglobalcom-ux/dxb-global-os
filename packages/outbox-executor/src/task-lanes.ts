// B43 (CEO 2026-09-03 evening): "ŞİRKETİN GÖREV İŞÇİSİ NEDEN BUNU YAPAMIYOR? YAPILACAK
// MİMARİ NEYSE O YAPILSIN, ÇÖZÜLSÜN SORUN."
//
// Measured that evening, 21:23–21:26: the task.worker tick ran its lanes under one
// Promise.all and re-armed only when ALL of them had returned, so a single 30-minute
// media run held every hand the company had — the identity expert's corrective task
// sat 'queued' while the CEO waited for it, and the QC task behind the film could not
// start before the film's director had finished. One long job = the whole company
// standing still. That is the opposite of the anti-babysitting law.
//
// The architecture now: A LANE IS ITS OWN LOOP. It drains; when the queue gives it
// nothing it rests for one tick and looks again; when it has done a task it looks
// again at once. The pg-boss tick no longer waits on any lane — every ten seconds it
// re-counts the hands the company should have (dispatchLanes, unchanged) and starts
// the missing loops or retires the surplus ones. Retiring never interrupts a lane
// already working: a surplus lane finishes its current drain and only then stands
// down. No second runtime, no second process — the loops live inside the scheduler,
// exactly where the lanes lived before.
//
// THE REST BETWEEN LOOKS (CEO 2026-09-13, "zero idle waiting — measured, cut at the source"):
// an idle lane used to rest the tick's ten seconds before looking again, so a task born just
// after a look waited up to ten seconds for a hand — measured on DXB-V-EYW-005: the five
// reviewers were claimed 0–8 s after the engineer's `done`, and of the 12 min 20 s outside
// the engine ≈ 1 min 25 s was waiting of this kind. The rest is now DXB_LANE_REST_SECONDS
// (3 s by default; `10` is the old behaviour, the rollback). Eight lanes looking every three
// seconds are eight cheap SELECTs a second at most; a working lane still looks again at once.
export const DEFAULT_LANE_REST_SECONDS = 3;

/** how long an idle lane rests before looking at the queue again, in milliseconds */
export function laneRestMsFromEnv(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.DXB_LANE_REST_SECONDS;
  const n = raw === undefined || raw.trim() === "" ? DEFAULT_LANE_REST_SECONDS : Number(raw);
  const seconds = Number.isFinite(n) && n > 0 ? Math.min(60, n) : DEFAULT_LANE_REST_SECONDS;
  return Math.round(seconds * 1000);
}

export interface DrainOutcome {
  executed: number;
  reviewed: number;
  escalated: number;
}

export interface TaskLaneDeps {
  /** one drain pass for one lane; the lane's worker id (undefined = the historical lane 1) */
  drain(workerId: string | undefined): Promise<DrainOutcome>;
  sleep(ms: number): Promise<void>;
  log?(line: string): void;
}

export interface ReconcileResult {
  desired: number;
  started: number;
  running: number;
}

export class TaskLanes {
  private desired = 0;
  private stopping = false;
  private readonly loops = new Map<number, Promise<void>>();
  // B45 (2026-09-16): every lane that is resting right now, and the handle that ends
  // its rest early. A resting lane used to hear stop() only when its rest ran out, so
  // shutting the company's hands down cost one full rest per lane set — measured
  // 6068–6082 ms across six runs with nothing whatever to do, paid at every
  // `systemctl --user restart dxb-scheduler.service`. The rest is unchanged in every
  // other respect: it is still deps.sleep, still DXB_LANE_REST_SECONDS, and a lane
  // that is WORKING is still never cut short.
  private readonly resting = new Set<() => void>();

  constructor(
    private readonly deps: TaskLaneDeps,
    private readonly restMs: number,
    private readonly laneWorkerId: (index: number) => string | undefined,
  ) {}

  /** Called every tick with the hand count the company decided on. Never blocks. */
  reconcile(desired: number): ReconcileResult {
    if (this.stopping) return { desired: 0, started: 0, running: this.loops.size };
    this.desired = Math.max(0, Math.floor(desired));
    let started = 0;
    for (let i = 0; i < this.desired; i++) {
      if (!this.loops.has(i)) {
        this.loops.set(i, this.runLane(i));
        started += 1;
      }
    }
    return { desired: this.desired, started, running: this.loops.size };
  }

  get running(): number {
    return this.loops.size;
  }

  /** Stop taking new work; resolves when every lane has finished its current drain. */
  async stop(): Promise<void> {
    this.stopping = true;
    this.desired = 0;
    // B45: a lane that is resting hears this at once instead of sleeping it out. A lane
    // that is mid-drain is untouched — stop() still waits for the work it is doing.
    for (const wake of this.resting) wake();
    this.resting.clear();
    await Promise.allSettled([...this.loops.values()]);
  }

  /**
   * B45: one idle rest, ended by whichever comes first — the rest itself, or stop().
   * The lane still rests through deps.sleep (no busy loop, no spin); it simply no
   * longer waits a rest out after the order to stand down has been given.
   */
  private async rest(): Promise<void> {
    if (this.stopping) return;
    let wake!: () => void;
    const woken = new Promise<void>((resolve) => {
      wake = resolve;
    });
    this.resting.add(wake);
    try {
      await Promise.race([this.deps.sleep(this.restMs), woken]);
    } finally {
      this.resting.delete(wake);
    }
  }

  private async runLane(index: number): Promise<void> {
    const workerId = this.laneWorkerId(index);
    try {
      while (!this.stopping && index < this.desired) {
        let outcome: DrainOutcome | null = null;
        try {
          outcome = await this.deps.drain(workerId);
        } catch (err) {
          // One lane's infrastructure fault must not take its siblings down, and
          // must not spin: the lane rests a tick and tries again.
          this.deps.log?.(`[scheduler] lane ${index + 1} failed: ${err instanceof Error ? err.message : String(err)}`);
        }
        const didWork = outcome !== null && outcome.executed + outcome.reviewed + outcome.escalated > 0;
        if (!didWork && !this.stopping && index < this.desired) await this.rest();
      }
    } finally {
      this.loops.delete(index);
    }
  }
}
