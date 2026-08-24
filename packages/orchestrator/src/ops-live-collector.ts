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
//
// NOTHING IS PUBLISHED THAT THE COMPANY DID NOT ISSUE. B36 Block 3, second
// audit round, 2026-08-24: `NOTIFY` is a COMMAND and PostgreSQL has no
// privilege over it, so any role that may connect — the read-only window
// included — may notify any channel. This collector used to republish anything
// that parsed as a §9a envelope, verbatim, onto the channel the CEO's Live
// Operations page reads, and the envelope is entirely forgeable. The audit's
// ruling: the listener must not publish a message without verifying the event
// really came from the company's own records.
//
// It does that against a RECEIPT. `public.fn_opslive_notify` — the single door
// every ops:live event goes through, SECURITY DEFINER — writes the event's id
// into `dxb_internal.ops_live_issued` in the SAME transaction as the source
// write and only then notifies (migration 20260824003000). Here the receipt is
// verified and CONSUMED in one statement, so an event is published once and
// only if the company itself issued it. A forged notification carries an id no
// receipt was ever written for and is refused. `dxb_internal` is a schema the
// one-way window cannot stand in, so the ids cannot be read or guessed either.
//
// IT FAILS CLOSED. If the receipt check itself cannot run, nothing is
// published and the reason is logged — publishing unverified is the defect.
import { createListenClient, EventEnvelope, type ListenClient } from "@dxb/shared";

const NOTIFY_CHANNEL = "dxb_ops_live";
const BROADCAST_CHANNEL = "ops:live";
const DEFAULT_WINDOW_MS = 1000;
const PRUNE_EVERY_MS = 300_000;

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
  let lastPruneAt = 0;

  // Verify AND consume in one statement: an id can be spent once, so a replay
  // of a real event is refused for the same reason a forgery is.
  async function issuedByTheCompany(events: EventEnvelope[]): Promise<EventEnvelope[]> {
    const result = (await client.query(
      `DELETE FROM dxb_internal.ops_live_issued
        WHERE event_id = ANY($1::uuid[])
        RETURNING event_id`,
      [events.map((e) => e.event_id)],
    )) as { rows: { event_id: string }[] };
    const issued = new Set(result.rows.map((r) => r.event_id));
    return events.filter((e) => issued.has(e.event_id));
  }

  // A receipt nobody came to collect is rubbish, not evidence: if this process
  // was down while the company worked, those ids are never published.
  async function pruneReceipts(): Promise<void> {
    if (Date.now() - lastPruneAt < PRUNE_EVERY_MS) return;
    lastPruneAt = Date.now();
    try {
      await client.query(
        `DELETE FROM dxb_internal.ops_live_issued WHERE issued_at < now() - interval '1 hour'`,
      );
    } catch (err) {
      log(`[ops-live] receipt prune failed (harmless, retried later): ${String(err)}`);
    }
  }

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

      let real: EventEnvelope[];
      try {
        real = await issuedByTheCompany(events);
      } catch (err) {
        // Fail CLOSED. An unverifiable event is not published, ever.
        log(
          `[ops-live] receipt check failed — ${events.length} event(s) refused, nothing published ` +
            `(source rows intact): ${String(err)}`,
        );
        return 0;
      }
      const refused = events.length - real.length;
      if (refused > 0) {
        log(
          `[ops-live] ${refused} notification(s) carried no receipt from the company — REFUSED, ` +
            `not published. Something notified ${NOTIFY_CHANNEL} that did not come through ` +
            `fn_opslive_notify.`,
        );
      }
      void pruneReceipts();
      if (real.length === 0) return 0;

      const outer: EventEnvelope =
        real.length === 1
          ? real[0]!
          : { ...real[real.length - 1]!, payload: { batch: real } };
      try {
        await publish(outer);
      } catch (err) {
        // Tolerated loss (§17): never crash the host loop, never retry-block.
        log(`[ops-live] publish failed, ${real.length} event(s) dropped from Broadcast (source rows intact): ${String(err)}`);
      }
      return real.length;
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
