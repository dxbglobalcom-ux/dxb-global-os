// Crash-test victim: claims one task with a SHORT lease, prints the id,
// then sleeps forever — it never completes and never releases. The test
// SIGKILLs it (no cleanup path) to prove lease-reaping durability (QUEUE-02).
import { createRequire } from "node:module";

const require = createRequire(new URL("../../packages/shared/package.json", import.meta.url));
const { Pool } = require("pg");

const department = process.argv[2] ?? "crash-test";
const leaseSeconds = Number(process.argv[3] ?? 2);

const pool = new Pool({
  connectionString:
    process.env.DXB_DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
});

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
