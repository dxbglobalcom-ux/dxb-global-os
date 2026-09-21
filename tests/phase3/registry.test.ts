import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
import { readFileSync } from "node:fs";
import { watchLedgers } from "../helpers/suite-scope.js";

// Its own footprints in audit_log / decision_log, swept in afterAll below.
const ledgerScope = watchLedgers(() => getDb());

let client: Client;

async function call(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error((res.content as Array<{ text: string }>)[0]?.text ?? "tool error");
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

// The cost probe writes real cost_ledger rows; interrupted runs skip afterAll
// (E9.1 lesson), so the sweep runs on BOTH sides to stay self-healing.
async function sweepCostProbes() {
  await getDb()
    .deleteFrom("cost_ledger")
    .where("department", "=", "finance")
    .where("model", "=", "glm-5.2")
    .where("mode", "=", "api")
    .where("cost_eur", "in", [0.01, 0.03])
    .execute();
}

// The audit_trace probe creates a real queued task; left alive it stacks up
// one CEO-visible ticker row per run (22 found on 2026-07-14). Same
// both-sides self-healing sweep as the cost probe. audit_log rows stay —
// that wall is append-only by design.
const TRACE_PROBE_OBJECTIVE = "trace test: create one evented task for the merged trace";
async function sweepTraceTasks() {
  const db = getDb();
  const stale = await db
    .selectFrom("tasks")
    .select("id")
    .where("objective", "=", TRACE_PROBE_OBJECTIVE)
    .execute();
  if (stale.length === 0) return;
  const ids = stale.map((r) => r.id);
  await db.deleteFrom("task_events").where("task_id", "in", ids).execute();
  await db.deleteFrom("tasks").where("id", "in", ids).execute();
}

beforeAll(async () => {
  const server = createDxbMcpServer();
  client = new Client({ name: "registry-test", version: "0.0.0" });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(st), client.connect(ct)]);
  await getDb().deleteFrom("departments").where("slug", "=", "legal-de").execute();
  await sweepCostProbes();
  await sweepTraceTasks();
});

afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ audit: [{ actor: "engineering", action: "queue.create_task" }, { actor: "registry" }, { actor: "test", action: "tool_call" }, { actor: "tracer", action: "decision" }] });
  await sweepCostProbes();
  await sweepTraceTasks();
  // legal-de is a probe department with no display_name_tr — leaving it live
  // fails the i18n purity gate between runs.
  await getDb().deleteFrom("departments").where("slug", "=", "legal-de").execute();
  await client.close();
  await closeDb();
});

describe("dxb-mcp registry/audit/cost groups (gate criteria 4-5)", () => {
  it("creates a new dormant department and activates it, both audited (REG-03)", async () => {
    const dept = await call("registry_create_department", { slug: "legal-de", display_name: "Legal DE" });
    expect(dept.status).toBe("dormant");

    const activated = await call("registry_activate", { slug: "legal-de" });
    expect(activated.kind).toBe("department");
    expect(activated.row.status).toBe("active");

    const audits = await getDb()
      .selectFrom("audit_log")
      .select(["action"])
      .where("action", "in", ["registry.create_department", "registry.activate"])
      .execute();
    expect(audits.length).toBeGreaterThanOrEqual(2);
  });

  it("registry_get_agent returns persona_path but never the persona body (REG-02)", async () => {
    const agents = await call("registry_list", { role: "worker" });
    expect(agents.length).toBeGreaterThan(0);
    const agent = await call("registry_get_agent", { slug: agents[0].slug });
    // E5.2b file-first architecture: personas/<dept>/<slug>.md is canonical
    // (the agency-agents/ mirror was retired).
    expect(agent.persona_path).toMatch(/personas\//);
    const body = readFileSync(agent.persona_path, "utf8");
    // a distinctive line from the persona body must NOT appear in the tool response
    const marker = body.split("\n").find((l) => l.length > 40) ?? body.slice(0, 80);
    expect(JSON.stringify(agent)).not.toContain(marker.trim());
  });

  it("audit_append redacts secret keys — proven by DB read-back", async () => {
    const row = await call("audit_append", {
      actor: "test",
      actor_type: "agent",
      action: "tool_call",
      payload: { api_key: "x", nested: { authorization: "Bearer y", note: "keep" }, list: [{ token: "z" }] },
    });
    const persisted = await getDb()
      .selectFrom("audit_log")
      .select("payload")
      .where("id", "=", row.id)
      .executeTakeFirstOrThrow();
    const p = persisted.payload as any;
    expect(p.api_key).toBe("[REDACTED]");
    expect(p.nested.authorization).toBe("[REDACTED]");
    expect(p.nested.note).toBe("keep");
    expect(p.list[0].token).toBe("[REDACTED]");
  });

  it("audit_trace merges task_events + audit_log chronologically", async () => {
    const task = await call("queue_create_task", {
      department: "engineering",
      objective: "trace test: create one evented task for the merged trace",
      output_contract: "trace visible",
      model_tier: "L4",
    });
    await call("audit_append", { actor: "tracer", actor_type: "system", action: "decision", task_id: task.id, payload: {} });
    const trace = await call("audit_trace", { task_id: task.id });
    expect(trace.length).toBeGreaterThanOrEqual(3); // created event + create audit + decision audit
    const sources = new Set(trace.map((t: any) => t.source));
    expect(sources.has("task_events")).toBe(true);
    expect(sources.has("audit_log")).toBe(true);
    const times = trace.map((t: any) => new Date(t.at).getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it("cost_record + cost_summary aggregate per department/model/mode", async () => {
    await call("cost_record", { department: "finance", model: "glm-5.2", mode: "api", prompt_tokens: 100, completion_tokens: 50, cost_eur: 0.01 });
    await call("cost_record", { department: "finance", model: "glm-5.2", mode: "api", prompt_tokens: 300, completion_tokens: 150, cost_eur: 0.03 });
    const summary = await call("cost_summary", { department: "finance" });
    const row = summary.find((r: any) => r.model === "glm-5.2" && r.mode === "api");
    expect(Number(row.prompt_tokens)).toBeGreaterThanOrEqual(400);
    expect(Number(row.cost_eur)).toBeCloseTo(0.04, 2);
  });
});
