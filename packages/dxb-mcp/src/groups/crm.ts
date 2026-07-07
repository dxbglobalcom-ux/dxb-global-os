import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { stubError } from "./stub-error.js";

// STUB face until Phase 8 (CRM in the cockpit).
export function registerCrm(server: McpServer): void {
  server.registerTool(
    "crm_get",
    {
      title: "CRM read (crm.get) — STUB until Phase 8",
      description: "Client/request/deal reads over the CRM tables. Not yet active.",
      inputSchema: { entity: z.enum(["client", "contact", "request", "deal"]), id: z.string().uuid() },
    },
    async () => stubError("crm"),
  );
}
