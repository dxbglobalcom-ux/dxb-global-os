import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDb } from "@dxb/shared";
import { CommitInput, RecallInput, commitMemory, recallMemory } from "@dxb/memory-router";

// FULL as of Phase 6 (06-05): agents touch memory through exactly TWO tools —
// memory_recall (read) + memory_commit (write); MEM-02's surface is complete.
// memory.promote is deliberately NOT registered here (LOCKED): promotion is
// CLI-only (`dxb promote`, tools/dxb-cli) so no worker MCP profile can ever
// launder quarantined content into trusted context (T-06-11). Stores are never
// addressed directly by agents — the router's doors are the only route.

const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data) }],
});

export function registerMemory(server: McpServer): void {
  server.registerTool(
    "memory_recall",
    {
      title: "Recall memory (memory.recall)",
      description:
        "The ONE read door over the memory stores: metadata-routed (kind given skips the " +
        "classifier), trusted-by-default — quarantined rows only via trust='include-quarantined', " +
        "which is audit-logged.",
      inputSchema: RecallInput.shape,
    },
    async (input) => {
      const result = await recallMemory(getDb(), RecallInput.parse(input), {
        caller: "mcp:memory_recall",
      });
      return ok({ rows: result.rows, classifier_used: result.classifier_used });
    },
  );

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
