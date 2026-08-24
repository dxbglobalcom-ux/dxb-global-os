import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  generateProfiles,
  type DenialsMap,
  type ProfilePolicy,
} from "../../packages/gateway/src/index.js";

// Master PHASE-07 step 3 verification (07-03, MCP-02): the doc's explicit reds
// proven on the EMITTED profile JSON — research sees no payment MCP, ceo sees
// no code MCP, a worker sees neither, a benign allowlisted tool DOES appear
// (positive control), and a quarantined pin is excluded even from a department
// whose policy allows the server (07-02 quarantine meets 07-03 exclusion).

const FX = `t07p3-${randomUUID().slice(0, 8)}`;
const RESEARCH = `${FX}-research`;
const CEO = `${FX}-ceo`;
const WORKER = `${FX}-worker`;
const ALLOWER = `${FX}-allower`; // allows the payment server; quarantine must still win
const STRIPE = `${FX}-stripe`;
const GITHUB = `${FX}-github`;
const DOCUSIGN = `${FX}-docusign`;
const BENIGN = `${FX}-dxb`;

const policy: ProfilePolicy = {
  servers: {
    [STRIPE]: { command: "npx", args: ["-y", "@stripe/mcp"] },
    [GITHUB]: { command: "npx", args: ["-y", "@modelcontextprotocol/server-github"] },
    [DOCUSIGN]: { command: "npx", args: ["-y", "docusign-mcp"] },
    [BENIGN]: { command: "node", args: ["packages/dxb-mcp/dist/index.js"] },
  },
  grants: {
    // Granted-but-denied on purpose: denial must beat the grant.
    [RESEARCH]: { [STRIPE]: "*", [DOCUSIGN]: "*", [BENIGN]: "*" },
    [CEO]: { [GITHUB]: "*", [BENIGN]: "*" },
    [WORKER]: { [STRIPE]: "*", [DOCUSIGN]: "*", [BENIGN]: "*" },
    [ALLOWER]: { [STRIPE]: ["create_charge", "list_charges"], [BENIGN]: "*" },
  },
};
const denials: DenialsMap = {
  [RESEARCH]: [STRIPE, DOCUSIGN],
  [CEO]: [GITHUB],
  [WORKER]: [STRIPE, DOCUSIGN],
};

const db = getDb();
const outDir = mkdtempSync(join(tmpdir(), "dxb-profiles-"));
const readProfile = (slug: string) =>
  JSON.parse(readFileSync(join(outDir, `${slug}.mcp.json`), "utf8")) as {
    _source_hash: string;
    _generated_at: string;
    _tools: Record<string, string[] | "*">;
    mcpServers: Record<string, unknown>;
  };
const run = () =>
  generateProfiles(db, { denials, policy, outDir, generatedAt: "2026-07-09T00:00:00.000Z" });

afterAll(async () => {
  rmSync(outDir, { recursive: true, force: true });
  await db.deleteFrom("tool_pins").where("server", "=", STRIPE).execute();
  await db.deleteFrom("departments").where("slug", "like", `${FX}-%`).execute();
  await closeDb();
});

describe("profile-denial (MCP-02 least-privilege generation)", () => {
  it("emits per-dept profiles: doc reds absent, positive control present", async () => {
    await db
      .insertInto("departments")
      .values([RESEARCH, CEO, WORKER, ALLOWER].map((slug) => ({ slug, display_name: slug })))
      .execute();
    // Quarantine cross-check seed: stripe.create_charge drifted → quarantined.
    await db
      .insertInto("tool_pins")
      .values([
        { server: STRIPE, tool: "create_charge", schema_hash: "0".repeat(64), quarantined: true },
        { server: STRIPE, tool: "list_charges", schema_hash: "1".repeat(64) },
      ])
      .execute();

    const result = await run();
    const emitted = new Map(result.profiles.map((p) => [p.department, p]));

    // (1) research: NO payment server anywhere in the emitted JSON.
    const research = readProfile(RESEARCH);
    expect(Object.keys(research.mcpServers)).toEqual([BENIGN]);
    expect(JSON.stringify(research)).not.toContain(STRIPE);
    expect(JSON.stringify(research)).not.toContain(DOCUSIGN);
    expect(emitted.get(RESEARCH)!.deniedServers).toEqual([DOCUSIGN, STRIPE].sort());

    // (2) ceo: NO code MCP.
    const ceo = readProfile(CEO);
    expect(JSON.stringify(ceo)).not.toContain(GITHUB);

    // (3) worker: neither stripe nor docusign.
    const worker = readProfile(WORKER);
    expect(JSON.stringify(worker)).not.toContain(STRIPE);
    expect(JSON.stringify(worker)).not.toContain(DOCUSIGN);

    // (4) positive control: benign allowlisted server present with tools
    // (profiles are not empty by accident) + source-hash header block.
    for (const profile of [research, ceo, worker]) {
      expect(profile.mcpServers[BENIGN]).toBeDefined();
      expect(profile._tools[BENIGN]).toBe("*"); // unpinned fixture server
      expect(profile._source_hash).toBe(result.sourceHash);
      expect(profile._generated_at).toBe("2026-07-09T00:00:00.000Z");
    }
  });

  it("excludes a quarantined tool even from a department that ALLOWS the server", async () => {
    const result = await run();
    const allower = readProfile(ALLOWER);
    // Server itself is allowed (explicit grant), but the quarantined tool is gone.
    expect(allower._tools[STRIPE]).toEqual(["list_charges"]);
    expect(JSON.stringify(allower._tools)).not.toContain("create_charge");
    const manifest = result.profiles.find((p) => p.department === ALLOWER)!;
    expect(manifest.quarantinedExcluded).toEqual([`${STRIPE}.create_charge`]);
  });

  it("default-deny: an ungranted server never appears; unknown policy slug throws", async () => {
    // WORKER has no github grant — absence = denied, no denial entry needed.
    expect(JSON.stringify(readProfile(WORKER))).not.toContain(GITHUB);
    await expect(
      generateProfiles(db, {
        denials,
        policy: { servers: policy.servers, grants: { ...policy.grants, "no-such-dept": {} } },
        outDir,
        generatedAt: "2026-07-09T00:00:00.000Z",
      }),
    ).rejects.toThrow(/absent from the registry/);
  });

  it("is deterministic: re-run with identical inputs → byte-identical files", async () => {
    const before = new Map(
      readdirSync(outDir).map((f) => [f, readFileSync(join(outDir, f), "utf8")]),
    );
    await run();
    for (const [file, bytes] of before) {
      expect(readFileSync(join(outDir, file), "utf8")).toBe(bytes);
    }
    expect(before.size).toBeGreaterThanOrEqual(4);
  });
});
