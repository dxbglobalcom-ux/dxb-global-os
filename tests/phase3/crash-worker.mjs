// Crash-test victim: claims one task with a SHORT lease, prints the id,
// then sleeps forever — it never completes and never releases. The test
// SIGKILLs it (no cleanup path) to prove lease-reaping durability (QUEUE-02).
import { createRequire } from "node:module";

const require = createRequire(new URL("../../packages/shared/package.json", import.meta.url));
const { Pool } = require("pg");

const department = process.argv[2] ?? "crash-test";
const leaseSeconds = Number(process.argv[3] ?? 2);

// B36 (the auditor's first FAIL on Block 2, 2026-08-23): this line used to carry
// the COMPANY's address and its write-capable `postgres` account as a fallback —
// a live `??`, not the inert `??=` at the top of the suites, and it was handed to
// a process the battery spawns. A missing address is now a loud stop, never a
// quiet write into the CEO's own database: the suite inherits
// DXB_DATABASE_URL from vitest.config.ts `test.env` (the construction engine),
// so a process that arrives here without one has been started wrongly.
const connectionString = process.env.DXB_DATABASE_URL;
if (!connectionString) {
  console.error(
    "crash-worker: DXB_DATABASE_URL is not set. This worker carries no address of its own — " +
      "it claims and holds a real task, and it will not guess where.",
  );
  process.exit(2);
}

const pool = new Pool({ connectionString });

const { rows } = await pool.query("SELECT * FROM claim_next_task($1, $2::text[], $3)", [
  `crash-victim-${process.pid}`,
  [department],
  leaseSeconds,
]);

if (!rows[0]) {
  console.error("no task to claim");
  process.exit(2);
}
console.log(rows[0].id);
// keep the process (and its pool) alive until SIGKILL — intentionally no cleanup
setInterval(() => {}, 1 << 30);
