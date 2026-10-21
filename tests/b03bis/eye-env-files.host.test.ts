// Board row B03-bis, audit A3 (2026-10-21) — the eye copy runs where the dashboard's .env files read as
// nothing. This case starts a bwrap box, and bwrap cannot start inside the battery's own sandbox, so it
// runs in the battery's host half (scripts/construction/battery.sh HOST_FILES).

import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, symlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildEyeEnv, withoutCompanyEnvFiles } from "../../scripts/test/engineer-env.mjs";

// The company database's address, built from its port so no line of the battery carries it whole (B36).
const COMPANY_DB_PORT = "54322";
const COMPANY_DB = `postgresql://u:p@127.0.0.1:${COMPANY_DB_PORT}/postgres`;

const api = {
  API_URL: "http://127.0.0.1:54421",
  PUBLISHABLE_KEY: "pk",
  DB_URL: "postgresql://postgres:postgres@127.0.0.1:54422/postgres",
};

describe("B03-bis — the eye copy cannot load the company's .env files", () => {
  // Audit A3, 2026-10-21: Next loads apps/dashboard/.env* after the filtered environment, which
  // brought the CEO's login and could bring a company address back into the eye copy.
  it("runs the eye copy where the dashboard's .env files read as nothing", () => {
    // Shaped like the real one: apps/dashboard/.env.local is a symlink to a file outside the repo.
    const app = mkdtempSync(join(tmpdir(), "b03bis-app-"));
    const target = join(mkdtempSync(join(tmpdir(), "b03bis-cfg-")), "dashboard.env.local");
    writeFileSync(target, `DXB_CEO_PASSWORD=x\nDXB_COMPANY_DATABASE_URL=${COMPANY_DB}\n`);
    symlinkSync(target, join(app, ".env.local"));
    writeFileSync(join(app, ".env"), "DXB_CEO_EMAIL=x\n");
    const next = createRequire(new URL("../../apps/dashboard/package.json", import.meta.url)).resolve("next/package.json");
    const nextEnv = createRequire(next).resolve("@next/env"); // Next's own env loader
    const probe =
      `const { loadEnvConfig } = require(${JSON.stringify(nextEnv)});` +
      `loadEnvConfig(${JSON.stringify(app)}, true, { info() {}, error() {} }, true);` +
      `console.log(JSON.stringify(["DXB_CEO_EMAIL", "DXB_CEO_PASSWORD", "DXB_COMPANY_DATABASE_URL"].map((k) => k in process.env)));`;
    const [cmd, ...args] = withoutCompanyEnvFiles(app, [process.execPath, "-e", probe]);
    const run = spawnSync(cmd, args, { encoding: "utf8", env: { ...buildEyeEnv({ PATH: process.env.PATH }, api) } as NodeJS.ProcessEnv });
    expect(run.status).toBe(0);
    expect(JSON.parse(run.stdout)).toEqual([false, false, false]);
  });
});
