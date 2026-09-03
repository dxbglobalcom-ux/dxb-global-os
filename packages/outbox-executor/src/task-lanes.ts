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
    await Promise.allSettled([...this.loops.values()]);
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
        if (!didWork && !this.stopping && index < this.desired) await this.deps.sleep(this.restMs);
      }
    } finally {
      this.loops.delete(index);
    }
  }
}
