// Board row B03-bis — the engineers hold the dashboard login (CEO 2026-10-21, ledger
// engineer-account-holds-the-keys-2026-10-21): a SEPARATE engineer account, its key outside the repo.
//
// What this pins, measured 2026-10-21 before the code: every signed-in dashboard user is the CEO to the
// database — fn_succession_actor answers 'ceo' for any JWT role 'authenticated' with a user id
// (db/migrations/20261014050000_b64_actor_effective_role.sql:36), and the read policies are
// USING (true) for every authenticated user (20260710000014_dashboard_read_policies.sql:18-29). An
// engineer account on the COMPANY engine would therefore act, and be audited, as the CEO. So the
// helpers refuse the company engine, and refuse a credentials file anyone but its owner can read.

import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import {
  parseEnvText,
  readPrivateEnv,
  assertConstructionEngine,
  newEngineerPassword,
  assertConstructionDatabase,
  buildEyeEnv,
  EYE_LAUNCHER,
  EYE_ORIGIN,
  ENGINEER_STATE_FILE,
} from "../../scripts/test/engineer-env.mjs";

// The company database's address, built from its port so no line of the battery carries it whole (B36).
const COMPANY_DB_PORT = "54322";
const COMPANY_DB = `postgresql://u:p@127.0.0.1:${COMPANY_DB_PORT}/postgres`;

const dir = mkdtempSync(join(tmpdir(), "b03bis-"));

describe("B03-bis — the engineer login's guards", () => {
  it("parses KEY=value and KEY=\"value\" lines, ignoring comments and blanks", () => {
    const env = parseEnvText('# note\nA=1\n\nB="two words"\nC=x=y\n');
    expect(env).toEqual({ A: "1", B: "two words", C: "x=y" });
  });

  it("reads a credentials file only when no one but its owner can read it", () => {
    const ok = join(dir, "ok.env");
    writeFileSync(ok, "EMAIL=e@x\n");
    chmodSync(ok, 0o600);
    expect(readPrivateEnv(ok)).toEqual({ EMAIL: "e@x" });

    const open = join(dir, "open.env");
    writeFileSync(open, "EMAIL=e@x\n");
    chmodSync(open, 0o644);
    expect(() => readPrivateEnv(open)).toThrow(/600/);
  });

  it("refuses the company engine and accepts only the construction API", () => {
    for (const url of ["http://127.0.0.1:54321", "http://localhost:54321/", "http://127.0.0.1:54322"]) {
      expect(() => assertConstructionEngine(url)).toThrow(/company/);
    }
    expect(() => assertConstructionEngine("http://example.com:443")).toThrow(/construction/);
    expect(assertConstructionEngine("http://127.0.0.1:54421")).toBe("http://127.0.0.1:54421");
  });

  // Audit B1, 2026-10-21: an unparseable address threw the raw string — its password with it — to stderr.
  it("refuses an unparseable address without repeating it", () => {
    const secret = "pw-that-must-not-print";
    for (const check of [assertConstructionEngine, assertConstructionDatabase]) {
      let thrown: unknown;
      try {
        check(`postgresql://u:${secret}@[not-a-host/postgres`);
      } catch (e) {
        thrown = e;
      }
      expect(thrown).toBeInstanceOf(Error);
      const e = thrown as Error;
      expect(e.message).toMatch(/refused/);
      expect(`${e.message} ${e.stack} ${JSON.stringify(e)}`).not.toContain(secret);
    }
  });

  // Audit B3, 2026-10-21: the engineer's session went to the shared e2e-state.json that the company
  // panel's tools (dead-click-sweep, Playwright defaults) read against :3000.
  it("keeps the engineer's session in its own file, bound to the eye copy's origin", () => {
    expect(basename(ENGINEER_STATE_FILE)).not.toBe("e2e-state.json");
    expect(EYE_ORIGIN).toBe("http://127.0.0.1:3100");
  });

  it("makes a long random password, different each time", () => {
    const a = newEngineerPassword();
    const b = newEngineerPassword();
    expect(a.length).toBeGreaterThanOrEqual(32);
    expect(a).not.toBe(b);
  });
});

// The eye-check mode (board row B03-bis): the construction site's own copy of the dashboard. Its
// environment is built from the construction engine alone and can never carry a company address —
// his order of 2026-08-25 (scripts/dashboard.sh:55) keeps the company's panel and the construction apart.
describe("B03-bis — the eye-check mode's environment", () => {
  const api = {
    API_URL: "http://127.0.0.1:54421",
    PUBLISHABLE_KEY: "pk",
    DB_URL: "postgresql://postgres:postgres@127.0.0.1:54422/postgres",
  };

  it("refuses a company database address and accepts only the construction engine's", () => {
    expect(() => assertConstructionDatabase(COMPANY_DB)).toThrow(/company/);
    expect(() => assertConstructionDatabase("postgresql://u:p@db.example.com:5432/postgres")).toThrow(/construction/);
    expect(assertConstructionDatabase(api.DB_URL)).toBe(api.DB_URL);
  });

  // Audit A1, 2026-10-21: the driver applies query parameters over the visible address, so
  // ".../postgres?port=<company>" behind a construction port reached the company's database.
  it("judges the address the driver will connect to, not the one it shows", () => {
    expect(() => assertConstructionDatabase(`${api.DB_URL}?port=${COMPANY_DB_PORT}`)).toThrow(/company/);
    for (const query of ["host=10.0.0.1", "hostaddr=10.0.0.1", "service=x", "options=-c%20a%3Db"]) {
      expect(() => assertConstructionDatabase(`${api.DB_URL}?${query}`)).toThrow(/refused/);
    }
  });

  it("builds a stamped environment pointing at the construction engine only", () => {
    const env = buildEyeEnv(
      {
        PATH: "/bin",
        DXB_DATABASE_URL: COMPANY_DB,
        DXB_COMPANY_DATABASE_URL: COMPANY_DB,
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        SOMETHING: "http://127.0.0.1:54321/rest",
      },
      api,
    );
    expect(({ ...env } as Record<string, unknown>).PATH).toBe("/bin");
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("http://127.0.0.1:54421");
    expect(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe("pk");
    expect(env.DXB_DATABASE_URL).toBe(api.DB_URL);
    expect(env.DXB_DASHBOARD_LAUNCHER).toBe(EYE_LAUNCHER);
    // Measured 2026-10-21: the first eye proof passed only because .env.local brought this back (audit A3).
    expect(env.NEXT_PUBLIC_DXB_MFA_ENFORCED).toBe("false");
    expect(({ ...env } as Record<string, unknown>).DXB_COMPANY_DATABASE_URL).toBeUndefined();
    expect(Object.values(env).join(" ")).not.toMatch(/:5432[12]\b/);
  });

  it("refuses to build when the construction file points at the company", () => {
    expect(() => buildEyeEnv({}, { ...api, API_URL: "http://127.0.0.1:54321" })).toThrow(/company/);
    expect(() =>
      buildEyeEnv({}, { ...api, DB_URL: COMPANY_DB }),
    ).toThrow(/company/);
  });
});
