import { PACKAGE } from "@dxb/shared";

export const OWNER = "dxb-mcp" as const;
export { PACKAGE };

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerQueue } from "./groups/queue.js";
import { registerRegistry } from "./groups/registry.js";
import { registerAudit } from "./groups/audit.js";
import { registerCost } from "./groups/cost.js";
import { registerMemory } from "./groups/memory.js";
import { registerDashboard } from "./groups/dashboard.js";
import { registerCrm } from "./groups/crm.js";
import { registerApproval } from "./groups/approval.js";

// One server, eight tool groups (MCP-01). Groups register incrementally
// across plan 03-04's tasks; this factory is the single assembly point.
export function createDxbMcpServer(): McpServer {
  const server = new McpServer({ name: "dxb-mcp", version: "0.1.0" });
  registerQueue(server);
  registerRegistry(server);
  registerAudit(server);
  registerCost(server);
  registerMemory(server);
  registerDashboard(server);
  registerCrm(server);
  registerApproval(server);
  return server;
}

// stdio entrypoint: `node packages/dxb-mcp/dist/index.js`
// R2.2 measured fix: the naive `"file://" + argv[1]` comparison NEVER matches
// when the repo path contains a space (import.meta.url is %20-encoded, the
// concatenation is not) — the server process started but never connected, so
// every SDK MCP handshake timed out (mcp_servers status 'failed', 0 tools).
// pathToFileURL performs the same encoding import.meta.url uses.
import { pathToFileURL } from "node:url";
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createDxbMcpServer();
  await server.connect(new StdioServerTransport());
}
