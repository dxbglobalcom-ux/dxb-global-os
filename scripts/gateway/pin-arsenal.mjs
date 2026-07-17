// R4.3 — first-sight pinning of the FULL server corpus (dxb-mcp + external
// catalogued servers). Human-initiated by design: the daily cron only CHECKS
// pins (drift → quarantine); adding new pins is this explicit step (pin-check
// header rule). Run after any catalog change in policy/grants.json:
//   node scripts/gateway/pin-arsenal.mjs
import { pinAll, readFullInventory } from "../../packages/gateway/dist/index.js";
import { closeDb, getDb } from "../../packages/shared/dist/db.js";

const inv = await readFullInventory();
for (const [server, err] of Object.entries(inv.failures)) {
  console.error(`UNREACHABLE ${server}: ${err}`);
}
const byServer = new Map();
for (const e of inv.entries) byServer.set(e.server, (byServer.get(e.server) ?? 0) + 1);
for (const [server, n] of [...byServer].sort()) console.log(`enumerated ${server}: ${n} tools`);

const res = await pinAll(getDb(), inv.entries);
console.log(`pinned ${res.pinned.length} new, ${res.existing} already pinned`);
for (const p of res.pinned) console.log(`  + ${p.server}.${p.tool}`);
await closeDb();
process.exit(Object.keys(inv.failures).length > 0 ? 1 : 0);
