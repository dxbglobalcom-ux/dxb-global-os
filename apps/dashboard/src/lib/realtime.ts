"use client";

// Single Broadcast subscription helper for the cockpit channels: the three
// 0013 legacy channels (dxb:task_events / dxb:approvals / dxb:cost_ledger —
// LOCKED naming, broadcast_changes shape) plus the EVENT_MODEL §9b catalog
// channels (dxb:ops:live — §9a envelope shape, 1 s batched by the e83
// collector). Private channels: joining is a SELECT on realtime.messages
// under the dxb_ceo_broadcast_read policy, so realtime.setAuth() must run
// before subscribe. postgres_changes is forbidden project-wide.
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export type DxbChannelName =
  | "task_events"
  | "approvals"
  | "cost_ledger"
  | "ops:live"
  | "alerts"
  // E9.5: setting/library events (EVENT_MODEL §9b settings channel).
  | "settings"
  // R3.1: voice call lifecycle (VOICE_INTERACTION_SPEC §9 — call.started /
  // call.answer_ready / call.ended / call.failed, fired by control_voice_call_log).
  | "voice"
  // C1/C7/C10 CEO Chat Board: chat_messages broadcast_changes rows.
  | "chat";

// Shape written by realtime.broadcast_changes (migration 0013): the UI reads
// exactly these fields — live-projection.test.ts pins this contract.
export type DxbBroadcastPayload = {
  operation: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
};

export type DxbStatus = "connecting" | "live" | "stale";

export type DxbChannelState = {
  status: DxbStatus;
  lastAt: Date | null;
};

let shared: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  shared ??= createClient();
  return shared;
}

// ─────────────────────────────────────────────────────────────────────────────
// ONE JOIN PER TOPIC, SHARED BY EVERY PANEL — and the topic is never left.
//
// The defect this replaces, seen by the CEO on his own screen on 2026-08-24:
// Live Operations sat at "Connecting" for ever while the company was healthy.
// The badge shows the WORST of the channels a page watches, so one channel
// that never answers freezes the whole surface — the one thing the first law
// of V2 forbids, a surface that never says what it knows.
//
// The cause is in the library, measured in the shipped source of
// @supabase/realtime-js 2.110.0:
//
//   1. RealtimeClient.channel(topic) DEDUPES BY TOPIC ITSELF — when the socket
//      already has a channel for that topic it hands the existing object back,
//      whatever state that object is in (RealtimeClient.js:330-343).
//   2. RealtimeChannel.subscribe(cb) only does something `if
//      (this.channelAdapter.isClosed())` (RealtimeChannel.js:140). On a channel
//      that is already joining or joined it returns silently AND NEVER CALLS
//      THE CALLBACK. The second panel therefore waits for a reply that is never
//      coming.
//   3. removeChannel() is async — it awaits unsubscribe() before the channel
//      leaves the client's list. A panel that unmounts and remounts inside that
//      window (React's development double-mount does exactly this, and so does
//      any navigation) gets the LEAVING channel back from (1), hits (2), and
//      hangs for ever.
//
// So: three components subscribe to `ops:live`, three to `alerts`, three to
// `approvals`, two to `settings`. The first one to ask was answered and the
// rest were not.
//
// The registry below joins each topic ONCE, fans every message and every status
// change out to all of its listeners, and tells a panel that arrives late what
// is true NOW instead of making it wait for a message that may never come —
// zero is a real answer, and "live with nothing happening" is a real state.
//
// Two decisions inside it are deliberate and load-bearing:
//
//   · IT LIVES ON globalThis. Module state is not unique: the development
//     server replaces this module on every edit, and a page can load it through
//     more than one chunk. A second registry facing a socket that has already
//     joined these topics reproduces exactly the hang above. Keyed on a global
//     symbol there is one registry per tab, whatever the bundler does.
//   · A TOPIC IS NEVER LEFT while the tab lives. There are eight of them and
//     the cockpit watches them the whole time it is open; leaving and rejoining
//     as panels mount buys nothing and costs the race in (3).
//
// And it cannot sit at "connecting" for ever any more: if a join has not been
// confirmed within JOIN_DEADLINE_MS the channel says `stale`, which is a state
// the CEO can act on and the panels already react to.
// ─────────────────────────────────────────────────────────────────────────────

const JOIN_DEADLINE_MS = 10_000;
const SETTLE_POLL_MS = 200;

type Listener = {
  onMessage: (payload: unknown) => void;
  onStatus?: (state: DxbChannelState) => void;
};

type Entry = {
  channel: ReturnType<SupabaseClient["channel"]>;
  listeners: Set<Listener>;
  status: DxbStatus;
  lastAt: Date | null;
  deadline: ReturnType<typeof setTimeout> | null;
  settle: ReturnType<typeof setInterval> | null;
};

type Registry = Map<DxbChannelName, Entry>;

// Symbol.for is resolved in the global symbol registry, so every copy of this
// module — HMR replacement, duplicate chunk — reaches the SAME map.
const REGISTRY_KEY = Symbol.for("dxb.realtime.registry");

function registry(): Registry {
  const host = globalThis as unknown as Record<symbol, Registry | undefined>;
  let reg = host[REGISTRY_KEY];
  if (!reg) {
    reg = new Map();
    host[REGISTRY_KEY] = reg;
  }
  return reg;
}

function isCurrent(name: DxbChannelName, entry: Entry): boolean {
  return registry().get(name) === entry;
}

function announce(entry: Entry): void {
  const state: DxbChannelState = { status: entry.status, lastAt: entry.lastAt };
  for (const listener of entry.listeners) listener.onStatus?.(state);
}

function clearTimers(entry: Entry): void {
  if (entry.deadline) {
    clearTimeout(entry.deadline);
    entry.deadline = null;
  }
  if (entry.settle) {
    clearInterval(entry.settle);
    entry.settle = null;
  }
}

function markLive(entry: Entry): void {
  clearTimers(entry);
  entry.lastAt ??= new Date();
  entry.status = "live";
  announce(entry);
}

function markStale(entry: Entry): void {
  clearTimers(entry);
  entry.status = "stale";
  announce(entry);
}

function armDeadline(name: DxbChannelName, entry: Entry): void {
  if (entry.deadline) return;
  entry.deadline = setTimeout(() => {
    entry.deadline = null;
    if (isCurrent(name, entry) && entry.status === "connecting") markStale(entry);
  }, JOIN_DEADLINE_MS);
}

// The channel object we were handed may belong to a join that is still in
// flight, or to one that is on its way out. subscribe() would be a silent no-op
// on both, so wait for it to settle and then act on what it settled into.
function waitForSettle(name: DxbChannelName, entry: Entry): void {
  armDeadline(name, entry);
  if (entry.settle) return;
  entry.settle = setInterval(() => {
    if (!isCurrent(name, entry)) {
      clearTimers(entry);
      return;
    }
    const state = String(entry.channel.state);
    if (state === "joined") {
      markLive(entry);
    } else if (state === "closed") {
      if (entry.settle) {
        clearInterval(entry.settle);
        entry.settle = null;
      }
      join(name, entry);
    }
  }, SETTLE_POLL_MS);
}

function join(name: DxbChannelName, entry: Entry): void {
  const state = String(entry.channel.state);
  if (state === "joined") {
    markLive(entry);
    return;
  }
  if (state !== "closed") {
    // joining · leaving · errored — not ours to subscribe.
    waitForSettle(name, entry);
    return;
  }

  armDeadline(name, entry);
  // Joining a private channel is a SELECT on realtime.messages under the
  // dxb_ceo_broadcast_read policy, so the socket must carry the session's token
  // before subscribe. A rejection here used to be swallowed and the panel
  // simply waited for ever; it is reported as `stale`.
  void getClient()
    .realtime.setAuth()
    .then(() => {
      if (!isCurrent(name, entry)) return;
      entry.channel.subscribe((status) => {
        if (!isCurrent(name, entry)) return;
        if (status === "SUBSCRIBED") {
          markLive(entry);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          markStale(entry);
        }
      });
    })
    .catch(() => {
      if (isCurrent(name, entry)) markStale(entry);
    });
}

function open(name: DxbChannelName): Entry {
  const channel = getClient().channel(`dxb:${name}`, { config: { private: true } });
  const entry: Entry = {
    channel,
    listeners: new Set(),
    status: "connecting",
    lastAt: null,
    deadline: null,
    settle: null,
  };
  registry().set(name, entry);

  channel.on("broadcast", { event: "*" }, (message) => {
    if (!isCurrent(name, entry)) return;
    entry.lastAt = new Date();
    clearTimers(entry);
    entry.status = "live";
    const payload = (message as unknown as { payload: unknown }).payload;
    const state: DxbChannelState = { status: entry.status, lastAt: entry.lastAt };
    for (const listener of entry.listeners) {
      listener.onStatus?.(state);
      listener.onMessage(payload);
    }
  });

  join(name, entry);
  return entry;
}

// Message shape is per-channel: 0013 channels deliver DxbBroadcastPayload,
// ops:live delivers the §9a envelope — callers pick T accordingly.
export function subscribeDxb<T = DxbBroadcastPayload>(
  name: DxbChannelName,
  onMessage: (payload: T) => void,
  onStatus?: (state: DxbChannelState) => void,
): () => void {
  let entry = registry().get(name);
  if (!entry) {
    entry = open(name);
  } else if (entry.status === "stale" && String(entry.channel.state) === "closed") {
    // A panel asking again is the moment to try the join once more, rather than
    // leaving a dead surface dead until the tab is reloaded.
    entry.status = "connecting";
    join(name, entry);
  }

  const listener: Listener = { onMessage: onMessage as (p: unknown) => void, onStatus };
  entry.listeners.add(listener);

  // Tell it what is true NOW, not what was true when the topic was joined.
  onStatus?.({ status: entry.status, lastAt: entry.lastAt });

  return () => {
    // The listener goes; the join stays. See the note above — leaving the topic
    // when the last panel unmounts is what produced the permanent "Connecting".
    registry().get(name)?.listeners.delete(listener);
  };
}

// React binding: channel state + message fan-in for live panels.
export function useDxbChannel<T = DxbBroadcastPayload>(
  name: DxbChannelName,
  onMessage: (payload: T) => void,
): DxbChannelState {
  const [state, setState] = useState<DxbChannelState>({ status: "connecting", lastAt: null });
  const handler = useRef(onMessage);
  handler.current = onMessage;

  useEffect(() => {
    const unsubscribe = subscribeDxb<T>(name, (payload) => handler.current(payload), setState);
    return unsubscribe;
  }, [name]);

  return state;
}

// ── Test seam ────────────────────────────────────────────────────────────────
// The registry's whole job is what happens when SEVERAL panels want ONE topic,
// which is invisible to a test that cannot stand in for the socket. This puts a
// stand-in client in place of the browser one and empties the registry, so the
// behaviour above is measurable without a browser. Production never calls it.
export function __setRealtimeClientForTests(client: SupabaseClient | null): void {
  for (const entry of registry().values()) clearTimers(entry);
  registry().clear();
  shared = client;
}
