// B38 — THE ops:live COLLECTOR GETS A HOST, AND KEEPS IT.
//
// THE DEFECT, measured 2026-08-24. `startOpsLiveCollector` had exactly one
// caller outside its own package and it was a test: no systemd unit, no live
// process, and `realtime.messages` had never carried a single row on the
// `dxb:ops:live` topic. The source triggers fired, the envelopes reached
// pg_notify, and there they stopped — so the CEO's Live Operations page
// subscribed to a channel with no producer and could only ever say "no events".
//
// EVENT_MODEL §26 (R5) settled where it belongs and the decision is binding:
// the debounce collector runs INSIDE the existing resident loop — "yeni servis
// AÇILMAZ", no new service. This file is that host, and it lives in the one
// resident process the holding already runs (`pnpm scheduler`,
// dxb-scheduler.service, Restart=always).
//
// It supervises rather than merely starts. A LISTEN connection can die while
// the process stays perfectly healthy, and that failure is silent by nature:
// nothing crashes, nothing logs, the page just stops updating. So the collector
// now reports its own death (`onLost`) and this host rebuilds it with backoff.
import { startOpsLiveCollector, type OpsLiveCollector } from "@dxb/orchestrator";

const FIRST_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

export type OpsLiveHost = {
  /** The collector in service right now, or null while it is being rebuilt. */
  current(): OpsLiveCollector | null;
  /** How many times the collector has been (re)started, first start included. */
  starts(): number;
  /** Stop supervising and stop the collector. Never throws. */
  stop(): Promise<void>;
};

/**
 * Keep an ops:live collector alive inside this process.
 *
 * Returns as soon as the first collector is listening. If the first attempt
 * fails the host still returns — the scheduler must not fail to boot because
 * one channel is unavailable — and keeps retrying in the background, saying so
 * each time.
 */
export async function hostOpsLiveCollector(opts?: {
  windowMs?: number;
  log?: (line: string) => void;
  firstRetryMs?: number;
  maxRetryMs?: number;
}): Promise<OpsLiveHost> {
  const log = opts?.log ?? ((line: string) => console.error(line));
  const firstRetry = opts?.firstRetryMs ?? FIRST_RETRY_MS;
  const maxRetry = opts?.maxRetryMs ?? MAX_RETRY_MS;

  let collector: OpsLiveCollector | null = null;
  let starts = 0;
  let stopping = false;
  let retryMs = firstRetry;
  let timer: NodeJS.Timeout | null = null;

  const rebuildLater = (why: string) => {
    if (stopping || timer) return;
    log(`[ops-live] host: rebuilding in ${retryMs} ms (${why})`);
    timer = setTimeout(() => {
      timer = null;
      void build();
    }, retryMs);
    if (timer.unref) timer.unref();
    retryMs = Math.min(retryMs * 2, maxRetry);
  };

  async function build(): Promise<void> {
    if (stopping) return;
    try {
      collector = await startOpsLiveCollector({
        windowMs: opts?.windowMs,
        log,
        onLost: (reason) => {
          collector = null;
          rebuildLater(reason);
        },
      });
      starts += 1;
      retryMs = firstRetry; // a good start earns a fresh budget
      log(`[ops-live] host: collector listening (start #${starts})`);
    } catch (err) {
      collector = null;
      rebuildLater(String(err));
    }
  }

  await build();

  return {
    current: () => collector,
    starts: () => starts,
    async stop() {
      stopping = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      const live = collector;
      collector = null;
      if (!live) return;
      try {
        await live.stop();
      } catch (err) {
        log(`[ops-live] host: stop failed (ignored): ${String(err)}`);
      }
    },
  };
}
