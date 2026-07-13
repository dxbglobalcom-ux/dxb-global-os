#!/usr/bin/env node
// event-probe (EVENT_MODEL §24): subscribe to a dxb:* Broadcast channel and
// print every envelope as one JSON line. Auth = real CEO session (spec §13:
// only the authenticated CEO may join private dxb:% topics — this probe
// therefore also proves the RLS join path, not just message flow).
// Usage: node scripts/dev/event-probe.mjs [channel]   (default: ops:live)
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dashboardDir = resolve(root, "apps", "dashboard");

// supabase-js lives in the dashboard workspace (pnpm, no hoisting) — resolve from there.
const require = createRequire(resolve(dashboardDir, "package.json"));
const { createClient } = require("@supabase/supabase-js");

function loadEnv(file) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  } catch {
    /* optional file */
  }
}
loadEnv(resolve(dashboardDir, ".env.local"));
loadEnv(resolve(root, ".env"));

const channelName = process.argv[2] ?? "ops:live";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.DXB_CEO_EMAIL;
const password = process.env.DXB_CEO_PASSWORD;
if (!url || !key || !email || !password) {
  console.error("event-probe: missing NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY / DXB_CEO_EMAIL / DXB_CEO_PASSWORD");
  process.exit(1);
}

const supabase = createClient(url, key);
const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
if (authError) {
  console.error(`event-probe: CEO sign-in failed: ${authError.message}`);
  process.exit(1);
}
await supabase.realtime.setAuth();

const channel = supabase.channel(`dxb:${channelName}`, { config: { private: true } });
channel.on("broadcast", { event: "*" }, (message) => {
  console.log(JSON.stringify(message.payload));
});
channel.subscribe((status) => {
  console.error(`event-probe: dxb:${channelName} ${status}`);
  if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") process.exit(2);
});
