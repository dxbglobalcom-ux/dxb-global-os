import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// B36 · BLOCK 1 — THE ONE QUESTION, run by the battery so it cannot rot.
//
// Agreed with the CEO and the independent auditor on 2026-08-23 as the fixed
// finish line for this block, and the only thing that reopens it:
//
//   "Can the SessionEnd hook send an INSERT, UPDATE or DELETE to the company's
//    database — regardless of how the address is spelled, regardless of a
//    missing or stale identity record, and regardless of a connection failure?"
//
// The drill lives in scripts/b36/prove-block1.mjs: eighteen hostile conditions
// against the COMPILED hook, measured from the server on both sides — the
// per-tuple counters of every table the holding owns, and pg_stat_statements,
// which records a write that was SENT even if it then failed. It refuses to
// pass unless it has also shown, in the same run, that the detector registers a
// real write on the ledger the hook IS allowed to use.
//
// Read-only against the company. The one row it writes lands on the permitted
// ledger and is deleted again.

const SCRIPT = join(process.cwd(), "scripts/b36/prove-block1.mjs");
const COMPANY = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const ALLOWED = "postgresql://postgres:postgres@127.0.0.1:54322/dxb_test";

describe("B36 Block 1 — the hook and the company's database", () => {
  it("cannot send an INSERT, UPDATE or DELETE to the company under any condition", () => {
    const out = execFileSync("node", [SCRIPT], {
      encoding: "utf8",
      env: { ...process.env, DXB_COMPANY_URL: COMPANY, DXB_ALLOWED_LEDGER_URL: ALLOWED },
      timeout: 120_000,
    });
    expect(out, `the drill did not validate its own detector:\n${out}`).toContain(
      "detector validated: YES",
    );
    expect(out, `a write path to the company is open:\n${out}`).toContain("BLOCK1_CLOSED");
  }, 120_000);
});
