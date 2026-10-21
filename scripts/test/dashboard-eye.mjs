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
// company port refuses to start. Next would load apps/dashboard/.env* on top of that environment, so it
// runs where those files read as nothing (withoutCompanyEnvFiles, bwrap). The separation gate knows this
// server (scripts/governance/company-untouched.mjs, isConstructionEyeProcess) — on :3100 only.
//
//   node scripts/test/dashboard-eye.mjs          # next dev on 127.0.0.1:3100
//   node scripts/test/engineer-account.mjs       # once
//   node scripts/test/e2e-state-mint.mjs         # the engineer's storageState
//
// Note: next dev shares apps/dashboard/.next with the company panel's dev server; run one at a time.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  CONSTRUCTION_API_FILE,
  EYE_PORT,
  readPrivateEnv,
  buildEyeEnv,
  withoutCompanyEnvFiles,
} from "./engineer-env.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const env = buildEyeEnv(process.env, readPrivateEnv(CONSTRUCTION_API_FILE));
console.log(`dashboard (eye check): dev on 127.0.0.1:${EYE_PORT}, construction engine only.`);
const [cmd, ...args] = withoutCompanyEnvFiles(join(REPO, "apps", "dashboard"), [
  "pnpm", "--filter", "@dxb/dashboard", "exec", "next", "dev", "-H", "127.0.0.1", "-p", EYE_PORT,
]);
const child = spawn(cmd, args, { cwd: REPO, env, stdio: "inherit", detached: true });
// pnpm → next → next-server: a signal to pnpm alone leaves the server listening (measured
// 2026-10-21), so the whole process group goes.
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => process.kill(-child.pid, sig));
child.on("exit", (code) => process.exit(code ?? 0));
