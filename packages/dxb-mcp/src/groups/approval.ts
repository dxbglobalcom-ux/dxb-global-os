import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { stubError } from "./stub-error.js";

// STUB face until Phase 4 (approval gates + outbox executor).
export function registerApproval(server: McpServer): void {
  server.registerTool(
    "approval_request",
    {
      title: "Request approval (approval.request) — STUB until Phase 4",
      description: "Draft an outward action for CEO approval (draft-first, outbox-executed). Not yet active.",
      inputSchema: {
        task_id: z.string().uuid(),
        action_type: z.string().min(1),
        payload: z.record(z.string(), z.unknown()),
        risk_class: z.enum(["low", "medium", "high"]).default("high"),
      },
    },
    async () => stubError("approval"),
  );
}
