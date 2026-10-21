// The engineer login's guards (board row B03-bis, CEO 2026-10-21, ledger
// engineer-account-holds-the-keys-2026-10-21). Pinned by tests/b03bis/engineer-env.test.ts.
//
// Every signed-in dashboard user is the CEO to the database (fn_succession_actor →
// 'ceo' for any authenticated JWT with a user id, 20261014050000:36), so an engineer
// account must never live on the COMPANY engine: it would act, and be audited, as him.
// The construction engine (its API on 54421) holds generated data only — the eye
// check runs there. Credentials stay in chmod-600 files under ~/.dxb, never printed.
import { readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";

export const DXB_HOME = join(homedir(), ".dxb");
export const ENGINEER_LOGIN_FILE = join(DXB_HOME, "engineer-login.env");
export const CONSTRUCTION_API_FILE = join(DXB_HOME, "construction-api.env");
// Its own name: ~/.dxb/e2e-state.json is the CEO-panel session that dead-click-sweep and the
// Playwright defaults read against :3000. This one opens the eye copy only (EYE_ORIGIN).
export const ENGINEER_STATE_FILE = join(DXB_HOME, "engineer-eye-state.json");

const COMPANY_PORTS = new Set(["54321", "54322"]);
const CONSTRUCTION_API_PORT = "54421";

export function parseEnvText(text) {
  const out = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    let value = line.slice(eq + 1).trim();
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    out[line.slice(0, eq).trim()] = value;
  }
  return out;
}

/** Reads a KEY=value file that only its owner may read (mode 600 or stricter). */
export function readPrivateEnv(path) {
  const mode = statSync(path).mode & 0o777;
  if (mode & 0o077) {
    throw new Error(`${path} is readable by others (mode ${mode.toString(8)}); chmod 600 it first`);
  }
  return parseEnvText(readFileSync(path, "utf8"));
}

/** WHATWG-parses an address; an unparseable one is refused without repeating it — it may carry a password. */
function parseOrRefuse(url) {
  try {
    return new URL(url);
  } catch {
    throw new Error("refused: the address does not parse (not repeated here — it may carry a password)");
  }
}

/** Returns the URL when it is the construction engine's API; throws on the company engine or anything else. */
export function assertConstructionEngine(url) {
  const u = parseOrRefuse(url);
  const local = u.hostname === "127.0.0.1" || u.hostname === "localhost";
  if (local && COMPANY_PORTS.has(u.port)) {
    throw new Error(
      `refused: ${u.host} is the company engine — every signed-in user there is the CEO to the database`,
    );
  }
  if (!local || u.port !== CONSTRUCTION_API_PORT) {
    throw new Error(`refused: ${u.host} is not the construction engine's API (127.0.0.1:${CONSTRUCTION_API_PORT})`);
  }
  return url.replace(/\/$/, "");
}

export function newEngineerPassword() {
  return randomBytes(30).toString("base64url");
}

// ── The eye-check mode: the construction site's own copy of the dashboard ─────────────────────
// His order of 2026-08-25 (scripts/dashboard.sh:55) keeps the COMPANY's panel cut from the
// construction. This copy is the reverse: it carries the construction engine and nothing of the
// company's. Its stamp satisfies the launcher check in apps/dashboard/src/instrumentation.ts, and
// scripts/governance/company-untouched.mjs reads the same stamp to tell it from the CEO's panel.
export const EYE_LAUNCHER = "scripts/test/dashboard-eye.mjs";
export const EYE_PORT = "3100";
export const EYE_ORIGIN = `http://127.0.0.1:${EYE_PORT}`;
const CONSTRUCTION_DB_PORT = "54422";
const COMPANY_ADDRESS = /:5432[12]\b/;

// The dashboard's database driver is pg (packages/shared/src/db.ts); its own parser says where a
// connection string really goes — query parameters (?port=, ?host=) override the visible address.
const pgRequire = createRequire(
  createRequire(new URL("../../packages/shared/package.json", import.meta.url)).resolve("pg"),
);
const { parse: parsePgTarget } = pgRequire("pg-connection-string");
const PG_ADDRESS_FIELDS = new Set(["user", "password", "host", "port", "database"]);

/** Returns the URL when the pg driver would reach the construction database; throws on anything else. */
export function assertConstructionDatabase(url) {
  parseOrRefuse(url);
  const target = parsePgTarget(url);
  const extra = Object.keys(target).filter((k) => !PG_ADDRESS_FIELDS.has(k));
  if (extra.length) throw new Error(`refused: the database address carries query parameters (${extra.join(", ")})`);
  const local = target.host === "127.0.0.1" || target.host === "localhost";
  if (local && COMPANY_PORTS.has(target.port)) {
    throw new Error(`refused: ${target.host}:${target.port} is the company engine's database`);
  }
  if (!local || target.port !== CONSTRUCTION_DB_PORT) {
    throw new Error(`refused: the database address is not the construction engine's (127.0.0.1:${CONSTRUCTION_DB_PORT})`);
  }
  return url;
}

/**
 * The eye process's whole environment: the caller's, minus every DXB_ and NEXT_PUBLIC_ name and any
 * value naming a company port, plus the construction engine's API, key and database and the stamp.
 */
export function buildEyeEnv(baseEnv, api) {
  const apiUrl = assertConstructionEngine(api.API_URL);
  const dbUrl = assertConstructionDatabase(api.DB_URL);
  const key = api.PUBLISHABLE_KEY || api.ANON_KEY;
  if (!key) throw new Error("the construction file has no PUBLISHABLE_KEY or ANON_KEY");
  const env = {};
  for (const [name, value] of Object.entries(baseEnv)) {
    if (value === undefined) continue;
    if (name.startsWith("DXB_") || name.startsWith("NEXT_PUBLIC_")) continue;
    if (COMPANY_ADDRESS.test(value)) continue;
    env[name] = value;
  }
  env.NEXT_PUBLIC_SUPABASE_URL = apiUrl;
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key;
  env.DXB_DATABASE_URL = dbUrl;
  env.DXB_DASHBOARD_LAUNCHER = EYE_LAUNCHER;
  // Password-only, as on this machine's own panel (proxy.ts; CEO order 2026-07-10). Said here, because
  // the .env files that used to bring it are covered (withoutCompanyEnvFiles).
  env.NEXT_PUBLIC_DXB_MFA_ENFORCED = "false";
  return env;
}

/**
 * The argv that runs `argv` where every .env* file in `appDir` reads as nothing: each is covered by
 * /dev/null in a private mount namespace (bwrap), so Next's own loader — which runs after the filtered
 * environment and would bring the company's values back — skips them (it loads files only). The files
 * themselves, and every other process, are untouched. A symlinked file is covered at its target (bwrap
 * cannot mount over a link); a dangling one loads nothing anyway. A .env* file created after launch is
 * not covered.
 */
export function withoutCompanyEnvFiles(appDir, argv) {
  const masks = readdirSync(appDir)
    .filter((name) => name.startsWith(".env"))
    .flatMap((name) => {
      try {
        return ["--dev-bind", "/dev/null", realpathSync(join(appDir, name))];
      } catch {
        return [];
      }
    });
  return ["bwrap", "--dev-bind", "/", "/", ...masks, "--", ...argv];
}
