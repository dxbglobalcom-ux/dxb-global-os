import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { generateProfilesFromPolicy } from "../../packages/gateway/src/index.js";

// Master PHASE-07 step 4 (07-04 Task 1, runtime half of MCP-02): a session
// loaded with the PRODUCTION strategy profile cannot even SELECT Stripe — the
// tool fails at resolution ("tool not found"), before any call could exist
// (filter-before-discovery, study-pass v1 model). This uses the real policy
// files + real registry + real pins, not fixtures. The fuller proof (spawning
// a live Claude Code session against the profile) is ⚠ UNVERIFIED in SUMMARY.

interface Profile {
  mcpServers: Record<string, { command: string; args?: string[] }>;
  _tools: Record<string, "*" | string[]>;
}

class ToolNotFoundError extends Error {}

/** The resolution an MCP-profiled session performs: a tool is selectable ONLY
 *  if its server is in mcpServers AND the tool survives the _tools allowlist.
 *  A denied server is never connected — there is nothing to call downstream. */
function resolveTool(profile: Profile, server: string, tool: string) {
  const entry = profile.mcpServers[server];
  if (!entry) throw new ToolNotFoundError(`tool not found: ${server}.${tool} (server not in profile)`);
  const allowed = profile._tools[server];
  if (allowed !== "*" && !allowed?.includes(tool)) {
    throw new ToolNotFoundError(`tool not found: ${server}.${tool} (not in allowlist)`);
  }
  return { launch: entry, tool };
}

const db = getDb();
const outDir = mkdtempSync(join(tmpdir(), "dxb-profiles-rt-"));

afterAll(async () => {
  rmSync(outDir, { recursive: true, force: true });
  await closeDb();
});

describe("profile-denial-runtime (MCP-02 runtime half)", () => {
  it("strategy session cannot resolve stripe.create_charge; a pinned dxb tool resolves AND is live", async () => {
    await generateProfilesFromPolicy(db, { outDir, generatedAt: "2026-07-09T00:00:00.000Z" });
    const strategy = JSON.parse(readFileSync(join(outDir, "strategy.mcp.json"), "utf8")) as Profile;

    // Runtime denial: fails at SELECTION, not called-then-rejected.
    expect(() => resolveTool(strategy, "stripe", "create_charge")).toThrow(/tool not found/);
    expect(() => resolveTool(strategy, "docusign", "send_envelope")).toThrow(/tool not found/);
    expect(() => resolveTool(strategy, "postgres", "query")).toThrow(/tool not found/);

    // Positive control (profile not empty by accident): the allowlist is the
    // explicit pinned dxb-mcp tool list; every entry must resolve...
    const allowed = strategy._tools["dxb-mcp"];
    expect(Array.isArray(allowed) && allowed.length >= 21).toBe(true);
    const sample = (allowed as string[])[0]!;
    const resolved = resolveTool(strategy, "dxb-mcp", sample);
    expect(resolved.tool).toBe(sample);

    // ...and the resolved tool is actually served by the LIVE server (the
    // launch config in the profile points at this same entrypoint).
    const server = createDxbMcpServer();
    const client = new Client({ name: "profile-runtime-test", version: "0.1.0" });
    const [ct, st] = InMemoryTransport.createLinkedPair();
    await server.connect(st);
    await client.connect(ct);
    try {
      const { tools } = await client.listTools();
      const liveNames = new Set(tools.map((t) => t.name));
      for (const tool of allowed as string[]) expect(liveNames.has(tool)).toBe(true);
    } finally {
      await client.close();
      await server.close();
    }
  });

  it("an allowlisted-but-quarantine-dropped tool would fail resolution too (same path)", async () => {
    const strategy = JSON.parse(readFileSync(join(outDir, "strategy.mcp.json"), "utf8")) as Profile;
    // Any name absent from the explicit list — the exact path a quarantined
    // tool takes after 07-03 generation drops it from _tools.
    expect(() => resolveTool(strategy, "dxb-mcp", "no_such_tool")).toThrow(/not in allowlist/);
  });
});
