import { PACKAGE } from "@dxb/shared";

export const OWNER = "dxb-mcp" as const;
export { PACKAGE };

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerQueue } from "./groups/queue.js";

// One server, eight tool groups (MCP-01). Groups register incrementally
// across plan 03-04's tasks; this factory is the single assembly point.
export function createDxbMcpServer(): McpServer {
  const server = new McpServer({ name: "dxb-mcp", version: "0.1.0" });
  registerQueue(server);
  return server;
}

// stdio entrypoint: `node packages/dxb-mcp/dist/index.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createDxbMcpServer();
  await server.connect(new StdioServerTransport());
}
