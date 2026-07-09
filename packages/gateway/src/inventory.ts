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
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createDxbMcpServer } from "@dxb/dxb-mcp";
import { type ToolInventoryEntry } from "./pin-check.js";

export const DXB_MCP_SERVER_NAME = "dxb-mcp";

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
