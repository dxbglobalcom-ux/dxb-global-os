import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getDb } from "@dxb/shared";
import { redact } from "../redact.js";

const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data) }],
});

export function registerAudit(server: McpServer): void {
  server.registerTool(
    "audit_append",
    {
      title: "Append audit entry (audit.append)",
      description: "Append-only audit write. Secret-bearing keys in payload are redacted BEFORE insert.",
      inputSchema: {
        actor: z.string().min(1),
        actor_type: z.enum(["agent", "ceo", "system"]),
        action: z.string().min(1),
        task_id: z.string().uuid().optional(),
        payload: z.record(z.string(), z.unknown()).default({}),
      },
    },
    async ({ actor, actor_type, action, task_id, payload }) => {
      const row = await getDb()
        .insertInto("audit_log")
        .values({
          actor,
          actor_type,
          action,
          task_id: task_id ?? null,
          payload: JSON.stringify(redact(payload)),
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return ok(row);
    },
  );

  server.registerTool(
    "audit_trace",
    {
      title: "Trace task (audit.trace)",
      description: "task_events + audit_log for one task, merged chronologically (id tiebreak).",
      inputSchema: { task_id: z.string().uuid() },
    },
    async ({ task_id }) => {
      const db = getDb();
      const [events, audits] = await Promise.all([
        db.selectFrom("task_events").selectAll().where("task_id", "=", task_id).execute(),
        db.selectFrom("audit_log").selectAll().where("task_id", "=", task_id).execute(),
      ]);
      const merged = [
        ...events.map((e) => ({ source: "task_events" as const, at: e.created_at, seq: Number(e.id), entry: e })),
        ...audits.map((a) => ({ source: "audit_log" as const, at: a.created_at, seq: Number(a.id), entry: a })),
      ].sort((x, y) => x.at.getTime() - y.at.getTime() || x.seq - y.seq);
      return ok(merged);
    },
  );
}
