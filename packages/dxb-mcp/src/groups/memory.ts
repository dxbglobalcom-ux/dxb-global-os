import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDb } from "@dxb/shared";
import { CommitInput, commitMemory } from "@dxb/memory-router";

// FULL as of Phase 6 (06-04): memory_commit is the single write path.
// memory.promote is deliberately NOT registered here (LOCKED): promotion is
// CLI-only (`dxb promote`, tools/dxb-cli) so no worker MCP profile can ever
// launder quarantined content into trusted context (T-06-11).
// memory.recall lands in 06-05.

const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data) }],
});

export function registerMemory(server: McpServer): void {
  server.registerTool(
    "memory_commit",
    {
      title: "Commit memory (memory.commit)",
      description:
        "The ONE write door into the memory stores: provenance required, web/email/video " +
        "origins born quarantined, contradictions flagged before write, index+store+audit " +
        "in one transaction.",
      inputSchema: CommitInput.shape,
    },
    async (input) => {
      const result = await commitMemory(getDb(), CommitInput.parse(input));
      return ok(
        result.created.map((c) => ({
          index_id: c.index_id,
          kind: c.kind,
          store: c.store,
          trust_tier: c.trust_tier,
          contradicts: c.contradicts,
        })),
      );
    },
  );
}
