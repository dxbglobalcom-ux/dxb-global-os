// B43 (CEO 2026-09-05, plan ① "Onaylıyorum, başla"): THE HANDS ARE LANES TOO.
//
// Measured 2026-09-05 00:5x on the company's own job book: the experts' lanes were
// already parallel (A17, task-lanes.ts — 8 lane ids used, 43 overlapping runs on
// 2026-09-03), but the studio's hands were still ONE serial worker — the media tick
// claimed one job every ten seconds and re-armed only after that job had ended. 30
// jobs, 0 overlapping pairs; the twelve casting stills ran one after another with a
// ten-second gap each (≈25 % idle); a two-second probe or a voice line waited behind
// a fourteen-minute shoot. The CEO's words: "bu nöbetçi yüzünden bir kaç aynı iş aynı
// anda yürümedi … hala aynı sorunu var galiba."
//
// The architecture now, the same loop the experts already have (TaskLanes):
//   · ONE GPU lane — still · shoot · upscale. The card is one (a shoot holds 13.7 of
//     16 GB), so these stay one at a time; nothing changes for them except that the
//     lane looks again at once when a job ends instead of resting a tick.
//   · N CPU lanes — voice · assemble · probe. They never touch the card and run
//     beside a shoot and beside each other. N = DXB_MEDIA_CPU_LANES (default 3).
//   · The pg-boss media tick no longer waits on any job: every ten seconds it only
//     makes sure the loops exist (reconcile). Retiring never interrupts a lane mid-job.
//     An idle lane rests DXB_LANE_REST_SECONDS (3 s) between looks, not the tick's ten.
//   · DXB_MEDIA_CPU_LANES=0 is the rollback shape: one lane, every kind, the
//     historical lane id — the old behaviour minus the idle gap.
// No second runtime, no second process — the loops live inside the scheduler.
import { CPU_KINDS, GPU_KINDS, type MediaKind, type MediaLaneResult } from "./media-lane.js";
import { TaskLanes, type ReconcileResult } from "./task-lanes.js";

export const ALL_MEDIA_KINDS: readonly MediaKind[] = [...GPU_KINDS, ...CPU_KINDS];

export interface MediaLanesConfig {
  /** how many processor lanes beside the single card lane; 0 = one lane for every kind */
  cpuLanes: number;
  /** how long an idle lane rests before looking again — DXB_LANE_REST_SECONDS (3 s by default
   *  since 2026-09-13; it was the ten-second media tick before), see task-lanes.ts */
  restMs: number;
  /** the resident worker's identity; lane ids derive from it */
  laneIdBase: string;
}

export interface MediaLanesDeps {
  /** one claim-and-run pass for one lane: runMediaLaneOnce with this lane's kinds */
  runOnce(opts: { laneId: string; kinds: readonly MediaKind[] }): Promise<MediaLaneResult>;
  sleep(ms: number): Promise<void>;
  log?(line: string): void;
}

export function cpuLanesFromEnv(env: NodeJS.ProcessEnv = process.env): number {
  const n = Number(env.DXB_MEDIA_CPU_LANES ?? 3);
  return Number.isFinite(n) ? Math.max(0, Math.min(8, Math.floor(n))) : 3;
}

export function desiredMediaLanes(cpuLanes: number): number {
  return 1 + Math.max(0, cpuLanes);
}

/** lane 0 is the card lane; the rest are processor lanes. With no processor lanes the
 *  single lane keeps the historical id `<worker>-media`, so nothing that reads
 *  `claimed_by` changes meaning on a rolled-back install. */
export function mediaLaneId(base: string, index: number, cpuLanes: number): string {
  if (cpuLanes <= 0) return `${base}-media`;
  return index === 0 ? `${base}-media-gpu` : `${base}-media-cpu-${index}`;
}

export function mediaLaneKinds(index: number, cpuLanes: number): readonly MediaKind[] {
  if (cpuLanes <= 0) return ALL_MEDIA_KINDS;
  return index === 0 ? [...GPU_KINDS] : [...CPU_KINDS];
}

export class MediaLanes {
  private readonly lanes: TaskLanes;

  constructor(private readonly deps: MediaLanesDeps, private readonly cfg: MediaLanesConfig) {
    const kindsById = new Map<string, readonly MediaKind[]>();
    const laneId = (index: number): string => {
      const id = mediaLaneId(cfg.laneIdBase, index, cfg.cpuLanes);
      kindsById.set(id, mediaLaneKinds(index, cfg.cpuLanes));
      return id;
    };
    this.lanes = new TaskLanes(
      {
        drain: async (workerId) => {
          const id = workerId ?? mediaLaneId(cfg.laneIdBase, 0, cfg.cpuLanes);
          const kinds = kindsById.get(id) ?? ALL_MEDIA_KINDS;
          const r = await deps.runOnce({ laneId: id, kinds });
          // a claimed job = work done → look again at once; a skip (card busy) or an
          // empty queue → rest one tick, never spin
          return { executed: r.claimed ? 1 : 0, reviewed: 0, escalated: 0 };
        },
        sleep: deps.sleep,
        log: deps.log,
      },
      cfg.restMs,
      laneId,
    );
  }

  /** Called every media tick. Never blocks: starts the loops that are missing. */
  reconcile(): ReconcileResult {
    return this.lanes.reconcile(desiredMediaLanes(this.cfg.cpuLanes));
  }

  get running(): number {
    return this.lanes.running;
  }

  get cpuLanes(): number {
    return this.cfg.cpuLanes;
  }

  /** Stop taking new jobs; resolves when every lane has finished its current job. */
  stop(): Promise<void> {
    return this.lanes.stop();
  }
}
