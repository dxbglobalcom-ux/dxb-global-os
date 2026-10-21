// THE CONSTRUCTION SITE'S OWN COPY OF THE DASHBOARD, FOR THE EYE CHECK (board row B03-bis).
//
// CEO 2026-10-21 (ledger engineer-account-holds-the-keys-2026-10-21): the engineers hold the login
// for the whole build, through their own account. That account lives on the construction engine only,
// because every signed-in user is the CEO to the database (fn_succession_actor). So the eye check runs
// against a copy of the dashboard served from the construction engine — never the company's panel,
// which scripts/dashboard.sh starts unchanged on :3000 with the company's address (his order of
// 2026-08-25 keeps the two apart).
//
// The environment is built by buildEyeEnv (scripts/test/engineer-env.mjs): every DXB_ / NEXT_PUBLIC_
// name and any company address dropped, the construction API, key and database put in, and the
// launcher stamp apps/dashboard/src/instrumentation.ts asks for. A construction file that names a
// company port refuses to start. The separation gate knows the stamp
// (scripts/governance/company-untouched.mjs, isConstructionEyeProcess).
//
//   node scripts/test/dashboard-eye.mjs          # next dev on 127.0.0.1:3100 (DXB_EYE_PORT to change)
//   node scripts/test/engineer-account.mjs       # once
//   node scripts/test/e2e-state-mint.mjs         # the engineer's storageState
//
// Note: next dev shares apps/dashboard/.next with the company panel's dev server; run one at a time.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CONSTRUCTION_API_FILE, readPrivateEnv, buildEyeEnv } from "./engineer-env.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const port = process.env.DXB_EYE_PORT ?? "3100";
if (port === "3000") throw new Error("refused: :3000 is the CEO's panel's port");

const env = buildEyeEnv(process.env, readPrivateEnv(CONSTRUCTION_API_FILE));
console.log(`dashboard (eye check): dev on 127.0.0.1:${port}, construction engine only.`);
const child = spawn(
  "pnpm",
  ["--filter", "@dxb/dashboard", "exec", "next", "dev", "-H", "127.0.0.1", "-p", port],
  { cwd: REPO, env, stdio: "inherit", detached: true },
);
// pnpm → next → next-server: a signal to pnpm alone leaves the server listening (measured
// 2026-10-21), so the whole process group goes.
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => process.kill(-child.pid, sig));
child.on("exit", (code) => process.exit(code ?? 0));
