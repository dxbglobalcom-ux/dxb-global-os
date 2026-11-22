import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { decide, type Identity } from "@dxb-foundation/bench";

// The two clusters the bench must never work on, as the lead measured them on
// 2026-11-23 (SPEC §2). Spelled here and not read from refused.json: an entry
// dropped from that file must turn these cases red.
const COMPANY_SYSID = "7674907968528752679";
const OLD_BENCH_SYSID = "7690665340837392423";

// Invented clusters: what an instance made by the bench looks like.
const made: Identity = { sysid: "7700000000000000001", dboid: "5", dbname: "postgres" };
const madeEarlier: Identity = { sysid: "7700000000000000002", dboid: "16400", dbname: "scratch" };

describe("decide — an identity is allowed only when the list holds all three of its fields", () => {
  it("allows an identity that equals a listed one", () => {
    expect(decide({ ...made }, [made])).toEqual({ allowed: true });
  });

  it("allows it wherever it stands in the list", () => {
    expect(decide({ ...made }, [madeEarlier, made])).toEqual({ allowed: true });
  });

  it("answers not-listed against an empty list", () => {
    expect(decide(made, [])).toEqual({ allowed: false, reason: "not-listed" });
  });

  it("answers not-listed for a cluster the list does not hold", () => {
    const stranger: Identity = { sysid: "7700000000000000009", dboid: "5", dbname: "postgres" };
    expect(decide(stranger, [made, madeEarlier])).toEqual({ allowed: false, reason: "not-listed" });
  });

  it("answers not-listed for another database of a listed cluster", () => {
    const otherDatabase: Identity = { sysid: made.sysid, dboid: "16555", dbname: "throwaway" };
    expect(decide(otherDatabase, [made])).toEqual({ allowed: false, reason: "not-listed" });
  });

  it("answers not-listed when only the database's oid differs — a database dropped and made again", () => {
    expect(decide({ ...made, dboid: "16555" }, [made])).toEqual({ allowed: false, reason: "not-listed" });
  });

  it("answers not-listed when only the database's name differs", () => {
    expect(decide({ ...made, dbname: "postgres2" }, [made])).toEqual({ allowed: false, reason: "not-listed" });
  });

  it("does not assemble a match from two listed identities", () => {
    const mixed: Identity = { sysid: made.sysid, dboid: madeEarlier.dboid, dbname: madeEarlier.dbname };
    expect(decide(mixed, [made, madeEarlier])).toEqual({ allowed: false, reason: "not-listed" });
  });
});

describe.each([
  { reason: "company", sysid: COMPANY_SYSID },
  { reason: "old-bench", sysid: OLD_BENCH_SYSID },
] as const)("decide — the cluster $sysid is refused by name: $reason", ({ reason, sysid }) => {
  const asMeasured: Identity = { sysid, dboid: "5", dbname: "postgres" };

  it("is refused against an empty list", () => {
    expect(decide(asMeasured, [])).toEqual({ allowed: false, reason });
  });

  it("is refused even when the list holds exactly that identity", () => {
    expect(decide({ ...asMeasured }, [made, asMeasured])).toEqual({ allowed: false, reason });
  });

  it("is refused whatever the database — another name, another oid", () => {
    const otherDatabase: Identity = { sysid, dboid: "16999", dbname: "anything_else" };
    expect(decide(otherDatabase, [])).toEqual({ allowed: false, reason });
    expect(decide(otherDatabase, [otherDatabase])).toEqual({ allowed: false, reason });
  });
});

// ---- refused.json

const benchDir = fileURLToPath(new URL("../../bench/", import.meta.url));
const decideInPackage = fileURLToPath(new URL("./fixtures/decide-in-package.ts", import.meta.url));
const temporaryRoots: string[] = [];

/** A throwaway copy of the bench package, where refused.json can be broken without touching the committed one. */
function copyOfTheBenchPackage(): string {
  const root = mkdtempSync(join(tmpdir(), "dxb-foundation-refused-"));
  temporaryRoots.push(root);
  const copy = join(root, "foundation", "bench");
  mkdirSync(copy, { recursive: true });
  cpSync(join(benchDir, "src"), join(copy, "src"), { recursive: true });
  cpSync(join(benchDir, "package.json"), join(copy, "package.json"));
  cpSync(join(benchDir, "refused.json"), join(copy, "refused.json"));
  symlinkSync(join(benchDir, "node_modules"), join(copy, "node_modules"));
  return copy;
}

/** Runs the fixture on `copy`; answers the decisions it printed, and whether it ended well. */
function decideOnTheCompanyIn(copy: string, twice?: "twice") {
  const run = spawnSync(process.execPath, [decideInPackage, copy, COMPANY_SYSID, ...(twice ? [twice] : [])], {
    encoding: "utf8",
    timeout: 20_000,
  });
  const decisions = run.stdout
    .split("\n")
    .filter((line) => line.startsWith("DECIDED "))
    .map((line) => JSON.parse(line.slice("DECIDED ".length)) as unknown);
  return { decisions, status: run.status, stderr: run.stderr };
}

/** The copy must first be seen to work — otherwise "it threw" would prove nothing. */
function expectTheCopyToAnswer(copy: string): void {
  const intact = decideOnTheCompanyIn(copy);
  expect(intact.decisions, intact.stderr).toEqual([{ allowed: false, reason: "company" }]);
  expect(intact.status).toBe(0);
}

describe("refused.json — the committed list of refused identities", () => {
  afterEach(() => {
    for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true });
  });

  it("names the company and the old bench, each with its measured identifier, the date and the reason", () => {
    const refused = JSON.parse(readFileSync(join(benchDir, "refused.json"), "utf8")) as Record<
      string,
      { sysid: unknown; measured: unknown; why: unknown }
    >;
    expect(Object.keys(refused).sort()).toEqual(["company", "old-bench"]);
    expect(refused["company"]?.sysid).toBe(COMPANY_SYSID);
    expect(refused["old-bench"]?.sysid).toBe(OLD_BENCH_SYSID);
    for (const name of ["company", "old-bench"]) {
      expect(refused[name]?.measured).toBe("2026-11-23");
      expect(String(refused[name]?.why).trim().length).toBeGreaterThan(20);
    }
  });

  it("when the file is absent, deciding throws — it never answers from an empty list", () => {
    const copy = copyOfTheBenchPackage();
    expectTheCopyToAnswer(copy);
    rmSync(join(copy, "refused.json"));
    const broken = decideOnTheCompanyIn(copy);
    expect(broken.decisions).toEqual([]);
    expect(broken.status).not.toBe(0);
  });

  it.each([
    ["is not JSON", '{ "company": '],
    ["is empty", ""],
    ["names no identity", "{}"],
  ])("when the file %s, deciding throws", (_what, content) => {
    const copy = copyOfTheBenchPackage();
    expectTheCopyToAnswer(copy);
    writeFileSync(join(copy, "refused.json"), content);
    const broken = decideOnTheCompanyIn(copy);
    expect(broken.decisions).toEqual([]);
    expect(broken.status).not.toBe(0);
  });

  it("is read once: an answer asked after the file is gone is the same answer", () => {
    const copy = copyOfTheBenchPackage();
    const run = decideOnTheCompanyIn(copy, "twice");
    expect(run.decisions, run.stderr).toEqual([
      { allowed: false, reason: "company" },
      { allowed: false, reason: "company" },
    ]);
    expect(run.status).toBe(0);
  });
});
