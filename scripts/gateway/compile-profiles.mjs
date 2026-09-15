// W9 (CEO 2026-09-15) — run the record→profiles compile ONCE, on demand.
//
// The resident scheduler already does this on its own timer (outbox-executor
// scheduler.ts). That is fine for production and useless for proof: a change to
// the grant record could not be MEASURED in the turn that made it without
// waiting for a timer. This is the same function the scheduler calls, nothing
// more — read the record, generate into staging, swap only on a hash change.
//
//   DXB_DATABASE_URL=postgres://... node scripts/gateway/compile-profiles.mjs
//   DXB_GATEWAY_PROFILE_DIR=/tmp/x  ... (write somewhere disposable instead)
import { compileLibraryProfiles } from "../../packages/gateway/dist/index.js";
import { getDb, closeDb } from "../../packages/shared/dist/index.js";

const result = await compileLibraryProfiles(getDb());
console.log(
  `[profiles] ${result.changed ? "REWRITTEN" : "unchanged"} — ${result.profiles.length} department(s), ` +
    `${result.employeeProfiles.length} employee overlay(s), source_hash ${result.sourceHash.slice(0, 12)}`,
);
console.log(`[profiles] out: ${result.outDir}`);
for (const e of result.employeeProfiles) {
  const tools = Object.values(e.tools).flat();
  console.log(
    `[profiles]   ${e.employee} — home ${e.department}` +
      (e.assignedDepartments?.length ? `, assigned ${e.assignedDepartments.join("+")}` : "") +
      ` — ${tools.length} tool(s): ${tools.join(" ")}`,
  );
}
await closeDb();
