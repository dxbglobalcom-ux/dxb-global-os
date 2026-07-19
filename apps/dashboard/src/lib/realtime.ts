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

// Message shape is per-channel: 0013 channels deliver DxbBroadcastPayload,
// ops:live delivers the §9a envelope — callers pick T accordingly.
export function subscribeDxb<T = DxbBroadcastPayload>(
  name: DxbChannelName,
  onMessage: (payload: T) => void,
  onStatus?: (state: DxbChannelState) => void,
): () => void {
  const supabase = getClient();
  let lastAt: Date | null = null;
  let disposed = false;

  const channel = supabase.channel(`dxb:${name}`, { config: { private: true } });

  channel.on("broadcast", { event: "*" }, (message) => {
    if (disposed) return;
    lastAt = new Date();
    onStatus?.({ status: "live", lastAt });
    onMessage(message.payload as T);
  });

  onStatus?.({ status: "connecting", lastAt });

  void supabase.realtime.setAuth().then(() => {
    if (disposed) return;
    channel.subscribe((status) => {
      if (disposed) return;
      if (status === "SUBSCRIBED") {
        lastAt ??= new Date();
        onStatus?.({ status: "live", lastAt });
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        onStatus?.({ status: "stale", lastAt });
      }
    });
  });

  return () => {
    disposed = true;
    void supabase.removeChannel(channel);
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
