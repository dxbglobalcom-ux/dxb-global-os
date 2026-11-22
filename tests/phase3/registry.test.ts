import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
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
    .where("cost_eur", "in", ["0.01", "0.03"])
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

// The seat the persona-field case reads back. It stays dormant in
// employment_status, so the database's activation trigger never asks it for a
// persona row; persona_path is NOT NULL in the database's old chain.
const PROBE_SEAT = "p3t-registry-probe";
async function sweepProbeSeat() {
  await getDb().deleteFrom("agents").where("slug", "=", PROBE_SEAT).execute();
}

beforeAll(async () => {
  const server = createDxbMcpServer();
  client = new Client({ name: "registry-test", version: "0.0.0" });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(st), client.connect(ct)]);
  await getDb().deleteFrom("departments").where("slug", "=", "legal-de").execute();
  await sweepCostProbes();
  await sweepTraceTasks();
  await sweepProbeSeat();
});

afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ audit: [{ actor: "engineering", action: "queue.create_task" }, { actor: "registry" }, { actor: "test", action: "tool_call" }, { actor: "tracer", action: "decision" }] });
  await sweepCostProbes();
  await sweepTraceTasks();
  await sweepProbeSeat();
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

  // CEO 2026-11-22: the personas are removed — a worker is an agent in a seat.
  // The persona columns stay in the database's old chain; no tool hands them on.
  it("an agent row handed out by a registry tool carries no persona field", async () => {
    await getDb()
      .insertInto("agents")
      .values({
        slug: PROBE_SEAT,
        department: "engineering",
        role: "worker",
        persona_path: `var/${PROBE_SEAT}.md`,
        persona_version: "v2.0-test",
        status: "dormant",
        employment_status: "dormant",
      } as never)
      .execute();
    const personaKeys = (row: Record<string, unknown>) => Object.keys(row).filter((k) => k.startsWith("persona"));

    const got = await call("registry_get_agent", { slug: PROBE_SEAT });
    expect(got.slug).toBe(PROBE_SEAT);
    expect(personaKeys(got)).toEqual([]);

    const listed = await call("registry_list", { department: "engineering", role: "worker", status: "dormant" });
    const mine = listed.find((a: any) => a.slug === PROBE_SEAT);
    expect(mine).toBeTruthy();
    expect(listed.flatMap(personaKeys)).toEqual([]);

    const activated = await call("registry_activate", { slug: PROBE_SEAT });
    expect(activated.kind).toBe("agent");
    expect(activated.row.status).toBe("active");
    expect(personaKeys(activated.row)).toEqual([]);
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
