import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// B36 · Block 3 — THE ONE-WAY WINDOW, held by the battery.
//
// CEO, 2026-08-24: "bundan sonra TEK BİR HARF DAHİ ŞİRKETİN VERİ TABANINA
// GİRMESİN!"  The construction side reaches the holding through one login that
// holds SELECT and nothing else, and the refusal is issued by PostgreSQL rather
// than by our code.
//
// WHY THE LIVE HALF RUNS AGAINST THE CONSTRUCTION ENGINE AND NOT THE COMPANY.
// tests/b36/battery-carries-no-company-key.test.ts forbids any file the battery
// loads from carrying a connectable address for the holding, and it is right:
// `pnpm test` must not hold the key to the CEO's database, not even a read-only
// one. So the drill that runs here runs against the construction engine, whose
// window is built by the same file, from the same code, with the same walls.
// The company's own drill is `pnpm b36:prove-window` — run by hand and by
// Block 6's `verify:separation`, exactly as `pnpm b36:prove-block1` is.
//
// WHAT THE STATIC HALF EXISTS FOR. On 2026-08-24 the first version of the window
// took EXECUTE from PUBLIC on 85 SECURITY DEFINER functions and handed it back
// to EVERY role on the engine. On the construction engine that was exact; on the
// holding it was not, and `anon` — the role an unauthenticated browser gets —
// gained the right to call `control_records_purge` and `decide_approvals`. It
// was caught by the installer's own blast-radius photograph, undone from the
// holding's dated dump, and the rule was corrected to give each privilege back
// only to the roles that already held it. These tests fail if that correction
// is ever removed.

const REPO = process.cwd();
const WINDOW_SQL = join(REPO, "scripts/b36/company-one-way-window.sql");
const PKG = JSON.parse(readFileSync(join(REPO, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};

describe("B36 · Block 3 — the one-way window", () => {
  it("(1) the window's SQL gives each privilege back only to who already held it", () => {
    const sql = readFileSync(WINDOW_SQL, "utf8");

    // The correction itself: the set of grantees is MEASURED per object, from
    // who could already do the thing, rather than taken to be every role.
    expect(
      sql,
      "the per-object holder capture is gone — this is the shape that gave `anon` " +
        "the right to call every control function on the CEO's database",
    ).toMatch(/SELECT\s+array_agg\(r\.rolname[\s\S]*?has_function_privilege\(r\.rolname/);
    expect(sql).toMatch(/FOREACH\s+v_role\s+IN\s+ARRAY\s+coalesce\(v_holders/);

    // And the shape that caused it must not come back: a grant loop whose
    // grantee list is "every role that is not dxb_reader".
    const blanket = /FOR\s+v_role\s+IN\s*\n?\s*SELECT\s+rolname\s+FROM\s+pg_roles\s*\n?\s*WHERE\s+rolname\s+NOT\s+LIKE[^\n]*\n?\s*LOOP\s*\n?\s*EXECUTE\s+format\('GRANT/;
    expect(blanket.test(sql), "the blanket re-grant is back in the window's SQL").toBe(false);
  });

  it("(2) the window's SQL refuses to succeed unless it left no write path", () => {
    const sql = readFileSync(WINDOW_SQL, "utf8");
    // Asked of the catalogue over EVERY schema, not only the two it grants in.
    expect(sql).toMatch(/the window can still WRITE to/);
    expect(sql).toMatch(/nspname NOT IN \('pg_catalog','information_schema'\)/);
    expect(sql).toMatch(/the window is blind/);
  });

  it("(3) the drills are committed and reachable as commands", () => {
    for (const f of [
      "scripts/b36/install-company-window.mjs",
      "scripts/b36/prove-window.mjs",
      "scripts/b36/prove-window-preserves.mjs",
      "scripts/b36/restore-company-privileges.mjs",
    ]) {
      expect(existsSync(join(REPO, f)), `${f} is missing`).toBe(true);
    }
    for (const s of ["b36:window", "b36:prove-window", "b36:prove-window-preserves"]) {
      expect(PKG.scripts[s], `package.json has no "${s}" script`).toBeTruthy();
    }
  });

  it(
    "(4) LIVE — connected as the window, every write route is refused by the server",
    { timeout: 240_000 },
    () => {
      // Build the window on the construction engine if this environment has not
      // had one built yet: a fresh clone must be able to run the battery.
      if (!existsSync(join(REPO, "var/b36/construction-window.env"))) {
        execFileSync("node", ["scripts/b36/install-company-window.mjs", "construction"], {
          cwd: REPO,
          encoding: "utf8",
          stdio: "pipe",
        });
      }

      let out = "";
      try {
        out = execFileSync("node", ["scripts/b36/prove-window.mjs", "construction"], {
          cwd: REPO,
          encoding: "utf8",
          stdio: "pipe",
        });
      } catch (e) {
        // execFileSync throws away everything the drill printed unless it is
        // read back off the error — the mistake this row already made once.
        const err = e as { stdout?: string; stderr?: string };
        out = `${err.stdout ?? ""}\n${err.stderr ?? ""}`;
      }

      expect(out, `the drill did not reach a verdict:\n${out}`).toContain("attempts");
      expect(out, `the drill could not tell a refusal from a dead connection:\n${out}`)
        .toContain("detector validated");

      const attempts = Number(out.match(/attempts\s*:\s*(\d+)/)?.[1] ?? "0");
      const refused = Number(out.match(/refused\s*:\s*(\d+)/)?.[1] ?? "-1");
      const escaped = Number(out.match(/escaped\s*:\s*(\d+)/)?.[1] ?? "-1");
      const left = Number(out.match(/rows left behind\s*:\s*(\d+)/)?.[1] ?? "-1");

      expect(attempts, "the drill tried almost nothing").toBeGreaterThanOrEqual(20);
      expect(refused, `not every route was refused:\n${out}`).toBe(attempts);
      expect(escaped, `a write route escaped:\n${out}`).toBe(0);
      expect(left, `the drill left rows behind:\n${out}`).toBe(0);
      expect(out).toContain("WINDOW_IS_ONE_WAY");
    },
  );
});
