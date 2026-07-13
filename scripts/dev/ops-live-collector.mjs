#!/usr/bin/env node
// ops:live collector runner (EVENT_MODEL §26) — dev host for the NOTIFY
// collector until the Phase-7 resident worker takes it into its own loop
// (recorded boundary, e83 ticket). LISTENs dxb_ops_live, publishes 1 s
// batches through notify_broadcast('ops:live', …).
// Usage: node scripts/dev/ops-live-collector.mjs
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
try {
  for (const line of readFileSync(resolve(root, ".env"), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
} catch {
  /* .env optional when DXB_DATABASE_URL already exported */
}
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const { startOpsLiveCollector } = await import(
  resolve(root, "packages", "orchestrator", "dist", "index.js")
);

const collector = await startOpsLiveCollector();
console.error("ops-live-collector: listening on dxb_ops_live (1 s window)");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    void collector.stop().then(() => {
      console.error(`ops-live-collector: stopped (${collector.publishCount()} publishes)`);
      process.exit(0);
    });
  });
}
