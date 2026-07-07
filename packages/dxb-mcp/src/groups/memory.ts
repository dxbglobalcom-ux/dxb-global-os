import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { stubError } from "./stub-error.js";

// STUB face until Phase 6 (memory router).
export function registerMemory(server: McpServer): void {
  server.registerTool(
    "memory_route",
    {
      title: "Route memory write (memory.route) — STUB until Phase 6",
      description: "Single write path into the memory stores (provenance + quarantine). Not yet active.",
      inputSchema: {
        kind: z.enum(["fact", "relation", "artifact", "procedure"]),
        content: z.string().min(1),
        provenance: z.record(z.string(), z.unknown()),
      },
    },
    async () => stubError("memory"),
  );
}
