import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "@dxb/shared";

const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data) }],
});

export function registerRegistry(server: McpServer): void {
  server.registerTool(
    "registry_get_agent",
    {
      title: "Get agent (registry.get_agent)",
      description: "Agent row incl. persona_path — the persona BODY never crosses this tool (REG-02 lazy activation).",
      inputSchema: { slug: z.string().min(1) },
    },
    async ({ slug }) => {
      const row = await getDb().selectFrom("agents").selectAll().where("slug", "=", slug).executeTakeFirst();
      return ok(row ?? null);
    },
  );

  server.registerTool(
    "registry_list",
    {
      title: "List agents (registry.list)",
      description: "List agents filtered by department/role/status.",
      inputSchema: {
        department: z.string().optional(),
        role: z.enum(["head", "specialist", "worker"]).optional(),
        status: z.enum(["dormant", "active"]).optional(),
      },
    },
    async ({ department, role, status }) => {
      let q = getDb().selectFrom("agents").selectAll();
      if (department) q = q.where("department", "=", department);
      if (role) q = q.where("role", "=", role);
      if (status) q = q.where("status", "=", status);
      return ok(await q.orderBy("department").orderBy("role").execute());
    },
  );

  server.registerTool(
    "registry_create_department",
    {
      title: "Create department (registry.create_department)",
      description: "INSERT a new dormant department (REG-03).",
      inputSchema: { slug: z.string().min(1).regex(/^[a-z0-9-]+$/), display_name: z.string().min(1) },
    },
    async ({ slug, display_name }) => {
      const db = getDb();
      const row = await db.transaction().execute(async (trx) => {
        const dept = await trx
          .insertInto("departments")
          .values({ slug, display_name })
          .returningAll()
          .executeTakeFirstOrThrow();
        await trx
          .insertInto("audit_log")
          .values({
            actor: "registry",
            actor_type: "system",
            action: "registry.create_department",
            task_id: null,
            payload: JSON.stringify({ slug }),
          })
          .execute();
        return dept;
      });
      return ok(row);
    },
  );

  server.registerTool(
    "registry_activate",
    {
      title: "Activate by slug (registry.activate)",
      description: "dormant→active for a department slug (departments table) or an agent slug (agents table); audited.",
      inputSchema: { slug: z.string().min(1) },
    },
    async ({ slug }) => {
      const db = getDb();
      const result = await db.transaction().execute(async (trx) => {
        const dept = await trx
          .updateTable("departments")
          .set({ status: "active" })
          .where("slug", "=", slug)
          .returningAll()
          .executeTakeFirst();
        let target: unknown = dept;
        let kind = "department";
        if (!dept) {
          const agent = await trx
            .updateTable("agents")
            .set({ status: "active", updated_at: sql`now()` })
            .where("slug", "=", slug)
            .returningAll()
            .executeTakeFirst();
          if (!agent) throw new Error(`no department or agent with slug '${slug}'`);
          target = agent;
          kind = "agent";
        }
        await trx
          .insertInto("audit_log")
          .values({
            actor: "registry",
            actor_type: "system",
            action: "registry.activate",
            task_id: null,
            payload: JSON.stringify({ slug, kind }),
          })
          .execute();
        return { kind, row: target };
      });
      return ok(result);
    },
  );
}
