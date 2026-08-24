import { afterAll, describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// THE DOOR GATE (2026-07-26, born from the CEO finding his chat dead).
//
// Twice in one night a feature shipped complete and correct in code, and was
// dead in the CEO's hands because the browser's role had no permission on the
// thing the code called:
//   · `control_objective_*` had no EXECUTE grant at all (W2.1, found by driving
//     the real UI);
//   · `chat_messages` had a COLUMN-level INSERT grant that W1.5 outgrew, so
//     every message the CEO sent died on "permission denied" (U27).
// Both were invisible to the suite, because the suite writes as `postgres`.
//
// This test closes the class instead of the two instances: every function the
// dashboard calls through PostgREST must be callable by `authenticated`. It
// reads the call sites from the source, so a new door is covered the moment it
// is written — nobody has to remember to add it here.

afterAll(async () => {
  await closeDb();
});

// fileURLToPath, not .pathname: the repo path contains a space and the raw
// pathname keeps it percent-encoded (measured: ENOENT on 'DxB%20Global%20OS').
const SRC = fileURLToPath(new URL("../../apps/dashboard/src", import.meta.url));

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

function calledFunctions(): Map<string, string> {
  // fn name → the first file that calls it, so a failure names the caller.
  const found = new Map<string, string>();
  for (const file of walk(SRC)) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/\.rpc\(\s*"([a-z_0-9]+)"/g)) {
      if (!found.has(m[1])) found.set(m[1], file.slice(SRC.length + 1));
    }
  }
  return found;
}

describe("every door the dashboard knocks on is open to the browser's role", () => {
  it("finds the call sites at all (the scan itself must not silently pass)", () => {
    expect(calledFunctions().size).toBeGreaterThan(20);
  });

  it("each RPC the dashboard calls is EXECUTE-granted to authenticated", async () => {
    const called = calledFunctions();
    const rows = await sql<{ proname: string }>`
      SELECT DISTINCT p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'public'
         AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
    `.execute(getDb());
    const granted = new Set(rows.rows.map((r) => r.proname));

    const ungranted = [...called].filter(([fn]) => !granted.has(fn));
    expect(
      ungranted.map(([fn, file]) => `${fn} (called from ${file})`),
      "these functions are called by the dashboard but the authenticated role cannot execute them",
    ).toEqual([]);
  });

  it("each RPC the dashboard calls actually exists in the database", async () => {
    const called = calledFunctions();
    const rows = await sql<{ proname: string }>`
      SELECT DISTINCT p.proname FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'public'
    `.execute(getDb());
    const exists = new Set(rows.rows.map((r) => r.proname));
    const missing = [...called].filter(([fn]) => !exists.has(fn));
    expect(missing.map(([fn, file]) => `${fn} (called from ${file})`)).toEqual([]);
  });

  it("every table/view the dashboard reads is SELECT-granted to authenticated", async () => {
    // Same failure shape one layer down: `chat_sessions` shipped with no grant
    // and the board rendered empty (W1.5, first pass).
    const relations = new Set<string>();
    const site = new Map<string, string>();
    for (const file of walk(SRC)) {
      const text = readFileSync(file, "utf8");
      for (const m of text.matchAll(/\.from\(\s*"([a-z_0-9]+)"/g)) {
        relations.add(m[1]);
        if (!site.has(m[1])) site.set(m[1], file.slice(SRC.length + 1));
      }
    }
    const rows = await sql<{ relname: string }>`
      SELECT DISTINCT c.relname
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public'
         AND c.relkind IN ('r','v','m','p')
         AND has_table_privilege('authenticated', c.oid, 'SELECT')
    `.execute(getDb());
    const readable = new Set(rows.rows.map((r) => r.relname));
    const blind = [...relations].filter((r) => !readable.has(r));
    expect(
      blind.map((r) => `${r} (read from ${site.get(r)})`),
      "the dashboard reads these but the authenticated role cannot SELECT them",
    ).toEqual([]);
  });
});
