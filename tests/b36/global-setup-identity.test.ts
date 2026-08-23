import { readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSTRUCTION_DATABASE_URL } from "../construction-engine.js";
import globalSetup from "../global-teardown.js";

// B36 · the independent auditor's second FAIL on Block 2, 2026-08-23:
//
//   "globalSetup must verify the DxB_Build identity on the same connection
//    before it starts, and must not be able to run a single SQL statement with
//    a company address handed in from outside.
//    tests/global-teardown.ts:50 uses `??=` — so a DXB_DATABASE_URL arriving
//    from the environment and pointing at the company is PRESERVED. That file
//    runs CREATE TABLE on the way in and many DELETE/UPDATE statements on the
//    way out."
//
// He was right. `??=` is the shape of a default, and a default is exactly what
// this must not be: the construction engine is the ONLY place this file may
// work, and an address arriving from outside is not a suggestion to be honoured
// but a mistake to be refused. Worse, the file it belongs to is the one file in
// the battery that writes with a broad hand — CREATE TABLE in `realtime`, then
// DELETE across alerts, tasks, agent_runs, cost_ledger, approvals and the CEO's
// own chat board.
//
// The three cases below are the contract. None of them touches the company:
// case (2) proves the identity gate fires by telling the guard, in the record it
// reads, that the CONSTRUCTION engine is the company — the same trick the Block
// 1 drill uses, and the reason the guard asks the SERVER who it is instead of
// reading the address.

const IDENTITY = join(process.cwd(), "tools/hooks/ledger-identity.json");

/**
 * A stranger: a REAL, reachable database that is not the pinned engine. It is
 * `_supabase` on the construction site's own cluster, so nothing of the CEO's is
 * anywhere near this case — and being reachable is the whole point. An address
 * that answers nothing would be refused by the network, and a case that passes
 * because the socket was shut cannot tell whether the guard exists at all:
 * measured 2026-08-23, an unreachable address made this case GREEN before the
 * fix, because `ECONNREFUSED` contains the word "refused".
 */
const A_STRANGER = "postgresql://postgres:postgres@127.0.0.1:54422/_supabase";

afterEach(async () => {
  vi.restoreAllMocks();
  const { closeDb } = await import("../../packages/shared/dist/index.js");
  await closeDb().catch(() => {});
  process.env.DXB_DATABASE_URL = CONSTRUCTION_DATABASE_URL;
});

describe("B36 — the battery's global setup stands on the construction engine only", () => {
  it("(1) refuses an address handed in from outside, before it runs one statement", async () => {
    process.env.DXB_DATABASE_URL = A_STRANGER;
    const err = await globalSetup().then(
      () => new Error("global setup accepted a stranger and returned normally"),
      (e: unknown) => (e instanceof Error ? e : new Error(String(e))),
    );
    // Refused BY NAME. Any other message means the address was accepted and the
    // failure came from the work itself — which is the defect, not the guard.
    expect(
      err.message,
      "an address from the environment was accepted — `??=` keeps whatever it is given",
    ).toMatch(/\[global-setup\]/);
    expect(
      err.message,
      "it got as far as running its realtime-partition work on a database nobody pinned",
    ).not.toMatch(/realtime/i);
  });

  it("(2) refuses even the pinned address when the server says it is the company", async () => {
    process.env.DXB_DATABASE_URL = CONSTRUCTION_DATABASE_URL;
    const parked = `${IDENTITY}.parked-globalsetup`;
    const real = JSON.parse(readFileSync(IDENTITY, "utf8")) as {
      company: Record<string, string>;
      allowed: Array<Record<string, string>>;
    };
    // Tell the record that the construction engine IS the holding. Nothing about
    // the address changes; only the server's answer now matters.
    const doctored = { ...real, company: { ...real.allowed[0] } };
    renameSync(IDENTITY, parked);
    writeFileSync(IDENTITY, JSON.stringify(doctored, null, 2));
    try {
      await expect(
        globalSetup(),
        "the identity of the engine it stands on was never checked",
      ).rejects.toThrow(/company/i);
    } finally {
      rmSync(IDENTITY, { force: true });
      renameSync(parked, IDENTITY);
    }
  });

  it("(3) says which engine it verified, measured from that engine", async () => {
    process.env.DXB_DATABASE_URL = CONSTRUCTION_DATABASE_URL;
    const said: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...a: unknown[]) => void said.push(a.join(" ")));
    await globalSetup();
    const line = said.find((l) => l.includes("[global-setup]"));
    expect(line, `global setup announced nothing about where it stands:\n${said.join("\n")}`)
      .toBeTruthy();
    // The cluster id it prints must be the one the record allows — the proof
    // that the answer came from the server and not from the address.
    const allowed = (
      JSON.parse(readFileSync(IDENTITY, "utf8")) as { allowed: Array<{ sysid: string }> }
    ).allowed[0].sysid;
    expect(line, "the announced identity is not the allowed construction engine").toContain(allowed);
  });
});
