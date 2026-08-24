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
// B36 Block 4: the company's address used to stand here as a DEFAULT, so this
// runner reached the holding whether or not anyone had said to. It now carries
// no address of its own.
if (!process.env.DXB_DATABASE_URL) {
  console.error(
    "ops-live-collector: DXB_DATABASE_URL is not set. This runner LISTENs on a live engine and it carries no default — " +
      "name the engine explicitly.",
  );
  process.exit(2);
}

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
