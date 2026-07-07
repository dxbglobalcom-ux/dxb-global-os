import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "@dxb/shared";

const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data) }],
});

export function registerCost(server: McpServer): void {
  server.registerTool(
    "cost_record",
    {
      title: "Record cost (cost.record)",
      description: "Append one model-call cost row (mode-tagged per KERN-03 rule).",
      inputSchema: {
        task_id: z.string().uuid().optional(),
        agent_id: z.string().uuid().optional(),
        department: z.string().optional(),
        model: z.string().min(1),
        mode: z.enum(["subscription", "api", "free-tier"]),
        prompt_tokens: z.number().int().nonnegative().default(0),
        completion_tokens: z.number().int().nonnegative().default(0),
        cost_eur: z.number().nonnegative().default(0),
        source: z.enum(["litellm", "hook", "manual"]).default("hook"),
        meta: z.record(z.string(), z.unknown()).default({}),
      },
    },
    async (input) => {
      const row = await getDb()
        .insertInto("cost_ledger")
        .values({
          task_id: input.task_id ?? null,
          agent_id: input.agent_id ?? null,
          department: input.department ?? null,
          model: input.model,
          mode: input.mode,
          prompt_tokens: input.prompt_tokens,
          completion_tokens: input.completion_tokens,
          cost_eur: input.cost_eur,
          source: input.source,
          meta: JSON.stringify(input.meta),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return ok(row);
    },
  );

  server.registerTool(
    "cost_summary",
    {
      title: "Cost summary (cost.summary)",
      description: "SUM tokens/cost per department+model+mode, optional since filter.",
      inputSchema: {
        department: z.string().optional(),
        since: z.string().datetime().optional(),
      },
    },
    async ({ department, since }) => {
      let q = getDb()
        .selectFrom("cost_ledger")
        .select(({ fn }) => [
          "department",
          "model",
          "mode",
          fn.sum("prompt_tokens").as("prompt_tokens"),
          fn.sum("completion_tokens").as("completion_tokens"),
          fn.sum("cost_eur").as("cost_eur"),
        ])
        .groupBy(["department", "model", "mode"]);
      if (department) q = q.where("department", "=", department);
      if (since) q = q.where("created_at", ">", sql<Date>`${since}::timestamptz`);
      return ok(await q.execute());
    },
  );
}
