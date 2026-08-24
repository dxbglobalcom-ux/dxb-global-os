import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// B36 · Block 3-bis — THE FIXED QUESTION, HELD BY THE BATTERY ITSELF.
//
// Block 1 stopped reopening the day its question was fixed and put in the
// battery. Block 3 failed three adversarial audits, and every time for the same
// reason: the proof answered a narrower question than the auditor asked. So the
// question is written here, in the battery, in the words the CEO was given
// before the work began:
//
//   From the construction runtime — the identity that runs the tests, the
//   batteries, the drills and the night shifts — is there any route that reaches
//   the company's database and changes it, or produces any effect there beyond a
//   read? The routes counted: a direct TCP login; the Docker socket; the
//   company's container by any other means; any credential file; any service
//   environment; the company's HTTP gateway; and the read gateway itself.
//
// This file IS the construction runtime asking it of itself. It runs inside the
// sandbox that `scripts/construction/run.sh` opens, and it fails loudly when the
// battery is run any other way — because a battery running outside the wall is
// not the construction runtime this question is about.
//
// Nothing here writes anywhere. Every attempt is a connect, a stat or a refusal.

const REPO = process.cwd();
const IN_SANDBOX = process.env.DXB_CONSTRUCTION_SANDBOX === "1";

type Probe = Record<string, { reached: boolean; detail: string }>;

function probe(): Probe {
  const out = execFileSync("node", [join(REPO, "scripts/b36/wall-probe.mjs")],
    { cwd: REPO, encoding: "utf8", timeout: 180_000, stdio: "pipe" });
  return JSON.parse(out.slice(out.indexOf("{"))) as Probe;
}

describe("B36 · Block 3-bis — can the construction runtime reach the holding?", () => {
  it("the battery is running inside the construction sandbox", () => {
    expect(
      IN_SANDBOX,
      "This battery was started outside the wall. The construction runtime is what "
      + "runs through scripts/construction/run.sh — start it with `pnpm construction:battery`, "
      + "or `scripts/construction/run.sh pnpm test`. Running the suite on the bare host "
      + "gives it the Docker socket, the credential files and a route to the company's "
      + "engine, which is the whole thing B36 exists to take away.",
    ).toBe(true);
  });

  it("no route reaches the company, and the one door answers", { timeout: 240_000 }, () => {
    const p = probe();
    const detail = (k: string) => `${k}: ${p[k]?.detail ?? "(not measured)"}`;

    // --- the routes that must be closed --------------------------------------
    expect(p["tcp-company-db"]?.reached, detail("tcp-company-db")).toBe(false);
    expect(p["tcp-company-http"]?.reached, detail("tcp-company-http")).toBe(false);
    expect(p["docker-socket"]?.reached, detail("docker-socket")).toBe(false);
    expect(p["docker-ps"]?.reached, detail("docker-ps")).toBe(false);
    expect(p["docker-exec-company"]?.reached, detail("docker-exec-company")).toBe(false);
    expect(p["credential-files"]?.reached, detail("credential-files")).toBe(false);
    expect(p["company-login"]?.reached, detail("company-login")).toBe(false);

    // --- the door itself refuses everything but a named read -----------------
    expect(p["gateway-arbitrary-sql"]?.reached, detail("gateway-arbitrary-sql")).toBe(false);
    expect(p["gateway-other-operations"]?.reached, detail("gateway-other-operations")).toBe(false);

    // --- and the probe is not blind: what SHOULD work, works -----------------
    // A file that only ever measures refusals cannot tell a wall from a broken
    // machine. These three are the control.
    expect(p["tcp-construction-db"]?.reached, detail("tcp-construction-db")).toBe(true);
    expect(p["gateway-reachable"]?.reached, detail("gateway-reachable")).toBe(true);
    expect(p["gateway-named-question"]?.reached, detail("gateway-named-question")).toBe(true);
  });

  it("the governance gate reads the holding through the door, and fails closed without it",
    { timeout: 240_000 }, () => {
      // With the gateway up it must run; the gateway is a resident service on the
      // company's side, so if it is down here that is a real failure and not a
      // reason to skip.
      const out = execFileSync("node", [join(REPO, "scripts/governance/ledger-truth.mjs")],
        { cwd: REPO, encoding: "utf8", timeout: 180_000, stdio: "pipe" });
      expect(out).toContain("ledger truth OK");

      // And there is no second path in the file to fall back to. Measured on the
      // CODE: the file's own comments explain the fallback it lost, so the word
      // "docker" is in its prose and must not be what the assertion reads.
      const gate = readFileSync(join(REPO, "scripts/governance/ledger-truth.mjs"), "utf8");
      expect(gate, "the gate can run a program again").not.toContain("node:child_process");
      expect(gate, "the gate names a command again").not.toMatch(/["'`]docker/i);
      expect(gate, "the gate spells a company address again").not.toContain("54322");
    });
});
