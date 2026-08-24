import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
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

  it("(3) the drills and the wall are committed and reachable as commands", () => {
    for (const f of [
      "scripts/b36/install-company-window.mjs",
      "scripts/b36/window-classes.mjs",
      "scripts/b36/prove-wall.mjs",
      "scripts/b36/wall-probe.mjs",
      "scripts/b36/withdraw-company-login.mjs",
      "scripts/b36/company-read-gateway.mjs",
      "scripts/b36/company-read-client.mjs",
      "scripts/b36/prove-window-preserves.mjs",
      "scripts/b36/prove-window-escapes.mjs",
      "scripts/b36/prove-forged-event.mjs",
      "scripts/b36/company-state-fingerprint.mjs",
      "scripts/b36/restore-company-privileges.mjs",
      "scripts/construction/run.sh",
      "scripts/construction/battery.sh",
    ]) {
      expect(existsSync(join(REPO, f)), `${f} is missing`).toBe(true);
    }
    for (const s of ["b36:window", "b36:prove-wall", "b36:prove-window-preserves",
                     "b36:prove-window-escapes", "b36:prove-forged-event"]) {
      expect(PKG.scripts[s], `package.json has no "${s}" script`).toBeTruthy();
    }
    // The drill whose question Block 3-bis replaced is DELETED, not kept beside
    // the new one. Two drills answering two versions of the same question is how
    // three audits ended up reading two different answers.
    expect(existsSync(join(REPO, "scripts/b36/prove-window.mjs")),
      "the superseded prove-window drill is back").toBe(false);
    expect(PKG.scripts["b36:prove-window"], "the superseded command is back").toBeFalsy();
  });

  it("(4) the wall's shape, held in the files themselves", () => {
    // The governance gate has NO second way to read the holding. The third audit
    // of 2026-08-24 found its fallback: `docker exec … psql -U postgres`, the
    // owner of every table in the company.
    // Measured on the CODE, not on the prose: this file explains the fallback it
    // lost, so the word "docker" appears in its comments and must not be what
    // the assertion reads.
    const gate = readFileSync(join(REPO, "scripts/governance/ledger-truth.mjs"), "utf8");
    expect(gate, "the governance gate can run a program again").not.toContain("node:child_process");
    expect(gate, "the governance gate can run a program again").not.toMatch(/execFileSync|spawnSync|spawn\(/);
    expect(gate, "the governance gate names a command again").not.toMatch(/["'`]docker/i);
    expect(gate, "the governance gate spells a company address again").not.toContain("54322");
    expect(gate, "the governance gate no longer fails closed").toContain("reads the holding NO other way");

    // The caller sends a NAME. The SQL behind it lives on the company's side, and
    // the gateway freezes its catalogue when it starts.
    const client = readFileSync(join(REPO, "scripts/b36/company-read-client.mjs"), "utf8");
    expect(client, "the read client learned how to send SQL").not.toMatch(/\bSELECT\b/);
    const gateway = readFileSync(join(REPO, "scripts/b36/company-read-gateway.mjs"), "utf8");
    expect(gateway, "the gateway stopped opening its connection read-only")
      .toContain("default_transaction_read_only=on");
    expect(gateway, "the gateway stopped wrapping its answers in a read-only transaction")
      .toContain("BEGIN READ ONLY");
    expect(gateway, "the gateway re-reads its catalogue while it runs").toContain("never again");

    // The sandbox is default-deny: the company's two doors are not in the list,
    // and there is no network to carry them.
    const wall = readFileSync(join(REPO, "scripts/construction/sandbox.sh"), "utf8");
    const allow = wall.slice(wall.indexOf("ALLOW=("), wall.indexOf(")", wall.indexOf("ALLOW=(")));
    expect(allow, "the company's database port is in the construction's allow list").not.toContain("54322");
    expect(allow, "the company's HTTP gateway is in the construction's allow list").not.toContain("54321");
    expect(wall, "the sandbox stopped taking its own network namespace").toContain("--unshare-net");
    expect(wall, "the sandbox stopped hiding the other processes on this machine").toContain("--unshare-pid");
    expect(wall, "the sandbox stopped dropping to the construction identity").toContain("setpriv --reuid");
    expect(wall, "the sandbox stopped keeping git out of the construction's reach")
      .toContain('--ro-bind "$REPO/.git"');
  });

  it("(5) the wall that runs is ROOT-OWNED, and the repository's copy has not drifted from it", () => {
    // A wall the construction can rewrite is a suggestion. The program that
    // actually runs lives outside the repository and belongs to root; this file
    // is its reviewable source, and the two must be identical.
    const INSTALLED = "/usr/local/sbin/dxb-construction-sandbox";
    expect(existsSync(INSTALLED),
      `the wall is not installed — run: bash scripts/construction/install-wall.sh`).toBe(true);

    // Inside the sandbox this test cannot see uid 0: the user namespace maps the
    // real root to `nobody` (65534). What it CAN see is the thing that matters —
    // the program is not owned by whoever is running it, and nobody but its owner
    // may write it. That the owner is really root is measured on the host side,
    // by prove-wall.mjs, where uid 0 is uid 0.
    const st = statSync(INSTALLED);
    expect(st.uid, `${INSTALLED} is owned by the identity that runs inside it`)
      .not.toBe(process.getuid?.());
    expect(st.mode & 0o022, `${INSTALLED} is writable by someone other than its owner`).toBe(0);

    expect(readFileSync(INSTALLED, "utf8"),
      "the installed wall and scripts/construction/sandbox.sh have drifted apart — "
      + "re-install it with scripts/construction/install-wall.sh, or explain the difference")
      .toBe(readFileSync(join(REPO, "scripts/construction/sandbox.sh"), "utf8"));

    // And the door in the repository is thin on purpose: it must not carry a
    // second definition of the wall beside the root-owned one.
    const door = readFileSync(join(REPO, "scripts/construction/run.sh"), "utf8");
    expect(door, "the door stopped calling the installed wall").toContain(INSTALLED);
    expect(door, "the door grew a wall definition of its own").not.toContain("bwrap");
  });
});
