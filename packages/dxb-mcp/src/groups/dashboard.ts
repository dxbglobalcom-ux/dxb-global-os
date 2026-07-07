import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { stubError } from "./stub-error.js";

// STUB face until Phase 8 (CEO cockpit).
export function registerDashboard(server: McpServer): void {
  server.registerTool(
    "dashboard_feed",
    {
      title: "Dashboard feed (dashboard.feed) — STUB until Phase 8",
      description: "Cockpit projection feed. Not yet active.",
      inputSchema: { view: z.enum(["tasks", "approvals", "costs", "agents"]) },
    },
    async () => stubError("dashboard"),
  );
}
