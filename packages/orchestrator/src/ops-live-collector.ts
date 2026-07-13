// ops:live NOTIFY collector (EVENT_MODEL §5/§26): the debounce layer between
// the e83 source triggers (pg_notify 'dxb_ops_live') and the Broadcast channel
// (notify_broadcast('ops:live', …) → realtime.messages). §26 decision: this is
// NOT a new resident service — it runs inside the kernel worker's loop (the
// Phase-7 resident worker hosts it; until then scripts/dev/ops-live-collector.mjs).
// §9b: ops:live debounce = 1 s window. §18 storm rule: >1 event in a window →
// ONE publish, latest event's envelope + payload.batch=[all envelopes];
// exactly 1 event → envelope published verbatim (§24 probe contract).
// Broadcast loss is tolerated by design (§10/§17) — a failed flush logs loudly
// and drops; source-truth rows already exist, reconnect snapshot covers.
import { createListenClient, EventEnvelope, type ListenClient } from "@dxb/shared";

const NOTIFY_CHANNEL = "dxb_ops_live";
const BROADCAST_CHANNEL = "ops:live";
const DEFAULT_WINDOW_MS = 1000;

export type OpsLiveCollector = {
  /** Drain the current window immediately (tests / shutdown). Returns events flushed. */
  flushNow(): Promise<number>;
  /** UNLISTEN + close the connection. Flushes what is buffered first. */
  stop(): Promise<void>;
  /** Publishes performed since start (a batch counts as 1). */
  publishCount(): number;
};

export async function startOpsLiveCollector(opts?: {
  windowMs?: number;
  log?: (line: string) => void;
}): Promise<OpsLiveCollector> {
  const windowMs = opts?.windowMs ?? DEFAULT_WINDOW_MS;
  const log = opts?.log ?? ((line: string) => console.error(line));

  const client: ListenClient = await createListenClient();
  let buffer: EventEnvelope[] = [];
  let timer: NodeJS.Timeout | null = null;
  let flushing: Promise<number> | null = null;
  let published = 0;
  let stopped = false;

  async function publish(envelope: EventEnvelope): Promise<void> {
    await client.query("SELECT public.notify_broadcast($1, $2, $3::jsonb)", [
      BROADCAST_CHANNEL,
      envelope.type,
      JSON.stringify(envelope),
    ]);
    published += 1;
  }

  async function flush(): Promise<number> {
    // Serialize: a flush in flight absorbs the next call.
    if (flushing) return flushing;
    flushing = (async () => {
      const events = buffer;
      buffer = [];
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (events.length === 0) return 0;
      const outer: EventEnvelope =
        events.length === 1
          ? events[0]!
          : { ...events[events.length - 1]!, payload: { batch: events } };
      try {
        await publish(outer);
      } catch (err) {
        // Tolerated loss (§17): never crash the host loop, never retry-block.
        log(`[ops-live] publish failed, ${events.length} event(s) dropped from Broadcast (source rows intact): ${String(err)}`);
      }
      return events.length;
    })();
    try {
      return await flushing;
    } finally {
      flushing = null;
    }
  }

  client.on("notification", (msg) => {
    if (stopped || msg.channel !== NOTIFY_CHANNEL || !msg.payload) return;
    let envelope: EventEnvelope;
    try {
      envelope = EventEnvelope.parse(JSON.parse(msg.payload));
    } catch (err) {
      log(`[ops-live] invalid envelope dropped: ${String(err)}`);
      return;
    }
    buffer.push(envelope);
    // First event opens the 1 s window; everything arriving inside it batches.
    timer ??= setTimeout(() => {
      void flush();
    }, windowMs);
  });

  client.on("error", (err) => {
    // Connection death = liveness gap, not data loss; host loop restarts us.
    log(`[ops-live] listen connection error: ${String(err)}`);
  });

  await client.query(`LISTEN ${NOTIFY_CHANNEL}`);

  return {
    flushNow: flush,
    publishCount: () => published,
    async stop() {
      stopped = true;
      await flush();
      try {
        await client.query(`UNLISTEN ${NOTIFY_CHANNEL}`);
      } catch {
        // connection may already be gone — stop() must never throw
      }
      await client.end();
    },
  };
}
