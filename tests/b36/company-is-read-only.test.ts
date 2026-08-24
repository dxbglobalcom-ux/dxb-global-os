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
// WHY THIS FILE WAS REWRITTEN. The block was audited on 2026-08-24 and FAILED.
// The drill had fired 23 routes and refused 23, and had never tried the two that
// worked: creating a LARGE OBJECT, and turning a SEQUENCE — the one write
// PostgreSQL does not undo on ROLLBACK. The auditor's sentence is the standard
// this file now holds: "test yeşil, soru cevapsız kalmış" — the test was green
// and the question was left unanswered. So the battery no longer asks whether a
// list of statements was refused; it asks the CATALOGUE what the role can still
// do, class by class, and it re-opens both escapes for real before requiring
// them to be closed.
//
// WHY THE LIVE HALF RUNS AGAINST THE CONSTRUCTION ENGINE AND NOT THE COMPANY.
// tests/b36/battery-carries-no-company-key.test.ts forbids any file the battery
// loads from carrying a connectable address for the holding, and it is right:
// `pnpm test` must not hold the key to the CEO's database, not even a read-only
// one. The company's own drill is `pnpm b36:prove-window`, which after the audit
// executes NOTHING against the holding — it measures privilege out of the
// catalogue and nothing else.
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

/** execFileSync throws everything the script printed away unless it is read back
 *  off the error — the mistake this row already made once. */
function runNode(args: string[]): string {
  try {
    return execFileSync("node", args, { cwd: REPO, encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string };
    return `${err.stdout ?? ""}\n${err.stderr ?? ""}`;
  }
}

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

  it("(2) the seal and its proof are written from ONE sentence, and it covers the audited classes", () => {
    const sql = readFileSync(WINDOW_SQL, "utf8");

    // The audit's deeper finding: a seal and a proof that had drifted apart.
    // There is exactly one definition of "a function whose call can leave
    // something behind", and both the sealing loop and the closing assertion
    // interpolate it.
    const predicate = sql.match(/c_effectful CONSTANT text := \$flt\$([\s\S]*?)\$flt\$;/);
    expect(predicate, "c_effectful is gone — the seal and its proof can drift again").toBeTruthy();
    expect(
      (sql.match(/c_effectful\)/g) ?? []).length,
      "c_effectful must be interpolated by BOTH the sealing loop and the assertion",
    ).toBeGreaterThanOrEqual(2);

    // The two escapes the audit found, by name, inside that one sentence.
    expect(predicate![1], "the large-object family is not in the seal").toMatch(/\^lo_/);
    expect(predicate![1], "pg_notify is not in the seal").toContain("pg_notify");

    // Sequences — the write ROLLBACK does not undo — swept in every schema.
    expect(sql).toMatch(/has_sequence_privilege\('dxb_reader'/);
    expect(sql).toMatch(/the window can still turn a counter/);

    // Seven table verbs, not four.
    for (const verb of ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER", "MAINTAIN"]) {
      expect(sql, `${verb} is missing from the table seal`).toContain(`'${verb}'`);
    }

    // Every other room, and what does not exist yet.
    expect(sql).toMatch(/the window can still stand inside/);
    expect(sql).toMatch(/REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC/);

    // And it must still be a window.
    expect(sql).toMatch(/the window is blind/);
    expect(sql).toMatch(/nspname NOT IN \('pg_catalog','information_schema'\)/);
  });

  it("(3) the drills are committed and reachable as commands", () => {
    for (const f of [
      "scripts/b36/install-company-window.mjs",
      "scripts/b36/prove-window.mjs",
      "scripts/b36/prove-window-preserves.mjs",
      "scripts/b36/prove-window-escapes.mjs",
      "scripts/b36/restore-company-privileges.mjs",
    ]) {
      expect(existsSync(join(REPO, f)), `${f} is missing`).toBe(true);
    }
    for (const s of ["b36:window", "b36:prove-window", "b36:prove-window-preserves",
                     "b36:prove-window-escapes"]) {
      expect(PKG.scripts[s], `package.json has no "${s}" script`).toBeTruthy();
    }
  });

  it(
    "(4) LIVE — the two audited escapes reproduce with the real role, then the server refuses them",
    { timeout: 240_000 },
    () => {
      const out = runNode(["scripts/b36/prove-window-escapes.mjs"]);

      // Red first. If the escape cannot be reproduced, the green half proves
      // nothing — that is the whole lesson of the audit.
      expect(out, `the escape proof did not run:\n${out}`).toContain("large object");
      expect(out, `escape 1 did not reproduce RED — the proof is worthless:\n${out}`)
        .toMatch(/RED 1\s+large object\s+CREATED, oid \d+/);
      expect(out, `escape 2 did not reproduce RED — the counter did not move:\n${out}`)
        .toMatch(/RED 2\s+counter\s+TURNED/);
      expect(out, `the counter's move was undone by the ROLLBACK, so it proves nothing:\n${out}`)
        .toContain("the ROLLBACK did not put it back");

      // Then green, from the server and not from our code.
      expect(out, `escape 1 is still open after the seal:\n${out}`)
        .toMatch(/GREEN 1\s+large object\s+refused: permission denied/);
      expect(out, `escape 2 is still open after the seal:\n${out}`)
        .toMatch(/GREEN 2\s+counter\s+refused: permission denied/);
      expect(out).toContain("ESCAPES_RED_THEN_GREEN");
    },
  );

  it(
    "(5) LIVE — every route is refused AND every class is measured zero",
    { timeout: 240_000 },
    () => {
      // Build the window on the construction engine if this environment has not
      // had one built yet: a fresh clone must be able to run the battery.
      if (!existsSync(join(REPO, "var/b36/construction-window.env"))) {
        runNode(["scripts/b36/install-company-window.mjs", "construction"]);
      }

      const out = runNode(["scripts/b36/prove-window.mjs", "construction"]);

      expect(out, `the drill did not reach a verdict:\n${out}`).toContain("attempts fired");
      expect(out, `the drill could not tell a refusal from a dead connection:\n${out}`)
        .toContain("detector validated");

      const num = (re: RegExp) => Number(out.match(re)?.[1] ?? "-1");
      const attempts = num(/attempts fired\s*:\s*(\d+)/);
      const refused = num(/refused\s*:\s*(\d+)/);
      const escaped = num(/escaped\s*:\s*(\d+)/);
      const classes = num(/classes measured\s*:\s*(\d+)/);
      const leaking = num(/classes leaking\s*:\s*(\d+)/);
      const left = num(/rows left behind\s*:\s*(\d+)/);

      expect(attempts, "the drill tried almost nothing").toBeGreaterThanOrEqual(30);
      expect(refused, `not every route was refused:\n${out}`).toBe(attempts);
      expect(escaped, `a write route escaped:\n${out}`).toBe(0);
      expect(left, `the drill left something behind:\n${out}`).toBe(0);

      // The half the audit added: the catalogue's own answer, not a list of
      // statements somebody remembered to write.
      expect(classes, "the class sweep is gone").toBeGreaterThanOrEqual(8);
      expect(leaking, `a whole class is still open:\n${out}`).toBe(0);

      // And the one route no privilege reaches must be named every run, so it is
      // never quietly dropped from the record.
      expect(out, "the NOTIFY residual is no longer reported").toContain("RESIDUAL — the NOTIFY command");
      expect(out).toContain("WINDOW_IS_ONE_WAY");
    },
  );
});
