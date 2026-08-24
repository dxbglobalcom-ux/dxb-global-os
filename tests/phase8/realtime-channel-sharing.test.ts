import { afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  __setRealtimeClientForTests,
  subscribeDxb,
  type DxbChannelState,
} from "../../apps/dashboard/src/lib/realtime.js";

// ─────────────────────────────────────────────────────────────────────────────
// THE DEFECT THIS PINS — the CEO saw it on his own screen, 2026-08-24: Live
// Operations sat at "Connecting" for ever while the company was healthy.
//
// Live Feed shows the WORST status of the channels it watches, so ONE channel
// that never answers freezes the whole surface. Nine panels ask for four
// topics; @supabase/realtime-js 2.110.0 hands the SAME channel object back for
// a topic it already has (RealtimeClient.js:330) and its subscribe() is a
// silent no-op on a channel that is not closed (RealtimeChannel.js:140) — so
// the first panel to ask was answered and the rest waited for a reply that was
// never coming.
//
// Everything below is asserted against a stand-in for the socket, because what
// broke is not the payload — it is what happens when SEVERAL panels want ONE
// topic, which no live test can see.
// ─────────────────────────────────────────────────────────────────────────────

type SubscribeStatus = "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED";

class FakeChannel {
  state = "closed";
  subscribeCalls = 0;
  bindings = 0;
  private handlers: Array<(m: { payload: unknown }) => void> = [];
  private reply: ((status: SubscribeStatus) => void) | null = null;

  constructor(readonly topic: string) {}

  on(_type: string, _filter: unknown, handler: (m: { payload: unknown }) => void): this {
    this.bindings += 1;
    this.handlers.push(handler);
    return this;
  }

  // The library's own behaviour, copied: a channel that is not closed accepts
  // the call, answers nothing, and leaves the caller waiting.
  subscribe(reply: (status: SubscribeStatus) => void): this {
    this.subscribeCalls += 1;
    if (this.state !== "closed") return this;
    this.state = "joining";
    this.reply = reply;
    return this;
  }

  /** The server confirms the join. */
  ack(): void {
    this.state = "joined";
    this.reply?.("SUBSCRIBED");
  }

  /** A broadcast arrives on the topic. */
  deliver(payload: unknown): void {
    for (const handler of this.handlers) handler({ payload });
  }
}

class FakeClient {
  readonly channels = new Map<string, FakeChannel>();
  authCalls = 0;
  realtime = {
    setAuth: async (): Promise<void> => {
      this.authCalls += 1;
    },
  };

  // RealtimeClient.channel() dedupes by topic and returns whatever it already
  // has, in whatever state it is in.
  channel(topic: string): FakeChannel {
    let existing = this.channels.get(topic);
    if (!existing) {
      existing = new FakeChannel(topic);
      this.channels.set(topic, existing);
    }
    return existing;
  }
}

function install(): FakeClient {
  const client = new FakeClient();
  __setRealtimeClientForTests(client as unknown as SupabaseClient);
  return client;
}

/** setAuth() resolves in a microtask; let the join reach the channel. */
async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
  __setRealtimeClientForTests(null);
});

describe("subscribeDxb — one join per topic, shared by every panel", () => {
  it("joins ops:live ONCE for three panels and takes all three live", async () => {
    const client = install();
    const seen: Array<DxbChannelState["status"]> = [];

    // Three panels, the real ones: live-feed, live-ticker, workflow-center.
    subscribeDxb("ops:live", () => {}, (s) => seen.push(s.status));
    subscribeDxb("ops:live", () => {}, (s) => seen.push(s.status));
    subscribeDxb("ops:live", () => {}, (s) => seen.push(s.status));
    await settle();

    const channel = client.channels.get("dxb:ops:live");
    expect(client.channels.size).toBe(1);
    expect(channel?.subscribeCalls).toBe(1);
    expect(channel?.bindings).toBe(1);
    expect(client.authCalls).toBe(1);

    channel?.ack();
    // Each panel was told "connecting" when it asked, and "live" when the join
    // was confirmed — the second and third are NOT left waiting.
    expect(seen).toEqual([
      "connecting",
      "connecting",
      "connecting",
      "live",
      "live",
      "live",
    ]);
  });

  it("tells a panel that arrives after the join what is true NOW", async () => {
    const client = install();
    subscribeDxb("approvals", () => {});
    await settle();
    client.channels.get("dxb:approvals")?.ack();

    const late: Array<DxbChannelState["status"]> = [];
    subscribeDxb("approvals", () => {}, (s) => late.push(s.status));

    // Synchronously, without waiting for a message that may never come.
    expect(late).toEqual(["live"]);
    expect(client.channels.get("dxb:approvals")?.subscribeCalls).toBe(1);
  });

  it("fans one broadcast out to every panel on the topic", async () => {
    const client = install();
    const a: unknown[] = [];
    const b: unknown[] = [];
    subscribeDxb("alerts", (p) => a.push(p));
    const stopB = subscribeDxb("alerts", (p) => b.push(p));
    await settle();
    const channel = client.channels.get("dxb:alerts");
    channel?.ack();

    channel?.deliver({ table: "alerts", operation: "INSERT" });
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);

    // One panel leaving must not take the others' feed with it.
    stopB();
    channel?.deliver({ table: "alerts", operation: "UPDATE" });
    expect(a).toHaveLength(2);
    expect(b).toHaveLength(1);
  });

  it("does not leave and rejoin the topic when the last panel unmounts", async () => {
    const client = install();
    // React's development double-mount, and every navigation away and back.
    const stop = subscribeDxb("settings", () => {});
    await settle();
    const channel = client.channels.get("dxb:settings");
    channel?.ack();
    stop();

    const seen: Array<DxbChannelState["status"]> = [];
    subscribeDxb("settings", () => {}, (s) => seen.push(s.status));
    await settle();

    // The join stood: no second subscribe() on a channel that is not closed,
    // which is the exact call that used to hang for ever.
    expect(channel?.subscribeCalls).toBe(1);
    expect(channel?.state).toBe("joined");
    expect(seen).toEqual(["live"]);
  });

  it("says `stale` instead of sitting at `connecting` for ever", async () => {
    vi.useFakeTimers();
    install();
    const seen: Array<DxbChannelState["status"]> = [];
    subscribeDxb("voice", () => {}, (s) => seen.push(s.status));
    await settle();

    expect(seen).toEqual(["connecting"]);
    // The join is never confirmed — the surface must still say what it knows.
    vi.advanceTimersByTime(10_000);
    expect(seen).toEqual(["connecting", "stale"]);
  });

  it("keeps one registry when the module's own map is not shared", async () => {
    // The development server replaces this module on every edit, and a page can
    // load it through more than one chunk. The registry hangs off a global
    // symbol precisely so a second copy does not open a second channel on a
    // topic the socket has already joined — the regression of 2026-08-24.
    const client = install();
    subscribeDxb("task_events", () => {});
    await settle();
    client.channels.get("dxb:task_events")?.ack();

    const registry = (globalThis as unknown as Record<symbol, Map<string, unknown>>)[
      Symbol.for("dxb.realtime.registry")
    ];
    expect(registry).toBeInstanceOf(Map);
    expect(registry.has("task_events")).toBe(true);
  });
});
