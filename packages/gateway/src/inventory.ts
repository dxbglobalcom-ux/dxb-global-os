// Production pin corpus reader. v1 inventory = the in-repo DXB MCP server's
// own tool declarations, read through a real MCP tools/list round-trip over an
// in-memory transport pair — so the hashed shape (description + JSON-Schema
// inputSchema) is byte-identical to what any EXTERNAL server would serve, and
// external servers can join the same corpus later without a second code path.
// In-process only: no child process, no socket, no network (pin-check rule).
//
// [ADAPT recorded 07-02] The Phase-3 registry carries no MCP *server*
// inventory table (departments/agents only — verified against
// 20260707000002_registry.sql); external-server enumeration therefore arrives
// with the profile generator's config surface in 07-03, which reads the same
// registry+policy inputs. Until then the corpus is the dxb-mcp declarations.
import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { createDxbMcpServer } from "@dxb/dxb-mcp";
import { type ToolInventoryEntry } from "./pin-check.js";
import { type ServerCatalogEntry } from "./generate-profiles.js";

export const DXB_MCP_SERVER_NAME = "dxb-mcp";

// Repo root for anchoring catalog args (same rule as runtime-profile.ts):
// profile/catalog args are repo-root-relative; the enumerator may run from
// any cwd, so relative path-looking args resolve against the checkout root.
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** R4.3 — enumerate one EXTERNAL catalogued server over a real stdio
 *  tools/list round-trip. Same corpus shape as the in-process dxb-mcp path
 *  (the inventory.ts header promised this join); the hashed bytes are exactly
 *  what the server serves, so pin/quarantine semantics are identical. */
export async function readExternalServerInventory(
  server: string,
  cfg: ServerCatalogEntry,
  timeoutMs = 45_000,
): Promise<ToolInventoryEntry[]> {
  const client = new Client({ name: "gateway-pin-check", version: "0.1.0" });
  const transport = new StdioClientTransport({
    command: cfg.command,
    // Catalog args are repo-root-relative (grants.json convention) — anchor
    // them exactly like runtime-profile.ts does for worker sessions.
    args: (cfg.args ?? []).map((a) =>
      a.includes("/") && !isAbsolute(a) ? resolve(REPO_ROOT, a) : a,
    ),
    env: { ...getDefaultEnvironment(), ...(cfg.env ?? {}) },
    cwd: REPO_ROOT,
    stderr: "ignore",
  });
  const timer = setTimeout(() => {
    void transport.close().catch(() => {});
  }, timeoutMs);
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    return tools.map((tool) => ({
      server,
      tool: tool.name,
      description: tool.description ?? "",
      inputSchema: tool.inputSchema,
    }));
  } finally {
    clearTimeout(timer);
    await client.close().catch(() => {});
  }
}

export interface FullInventoryResult {
  entries: ToolInventoryEntry[];
  /** Servers that answered tools/list this run — the pin-check missing-sweep
   *  scope (a server that failed to SPAWN is unreachable, not tool-less). */
  reachable: Set<string>;
  failures: Record<string, string>;
}

/** Read the whole pin corpus: in-process dxb-mcp + every external server in
 *  the policy catalog. Per-server failure isolation — one dead external
 *  server never hides the rest of the corpus from the drift check. */
export async function readFullInventory(): Promise<FullInventoryResult> {
  const result: FullInventoryResult = {
    entries: await readDxbMcpInventory(),
    reachable: new Set([DXB_MCP_SERVER_NAME]),
    failures: {},
  };
  const policyPath = join(REPO_ROOT, "packages/gateway/policy/grants.json");
  const { servers } = JSON.parse(readFileSync(policyPath, "utf8")) as {
    servers: Record<string, ServerCatalogEntry>;
  };
  for (const [name, cfg] of Object.entries(servers)) {
    if (name === DXB_MCP_SERVER_NAME) continue;
    try {
      result.entries.push(...(await readExternalServerInventory(name, cfg)));
      result.reachable.add(name);
    } catch (err) {
      result.failures[name] = err instanceof Error ? err.message : String(err);
    }
  }
  return result;
}

/** Enumerate the in-repo DXB MCP tool declarations as pin-corpus entries. */
export async function readDxbMcpInventory(): Promise<ToolInventoryEntry[]> {
  const server = createDxbMcpServer();
  const client = new Client({ name: "gateway-pin-check", version: "0.1.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const { tools } = await client.listTools();
    return tools.map((tool) => ({
      server: DXB_MCP_SERVER_NAME,
      tool: tool.name,
      description: tool.description ?? "",
      inputSchema: tool.inputSchema,
    }));
  } finally {
    await client.close();
    await server.close();
  }
}
