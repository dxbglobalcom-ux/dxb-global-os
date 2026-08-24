import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
import { sweepByDepartment } from "../helpers/suite-scope.js";

// Runs against the local Supabase stack (03-02). Real MCP protocol via linked
// in-memory transports — no subprocess.

// Suite-unique departments: queue_claim(departments) pulls the OLDEST queued
// task in a department, so sharing 'engineering' with live rows would claim
// (mutate!) real work. Isolation marker doubles as the sweep key (E9.3
// incident fix).
const DEPT = "p3lc-gate";
const ENVELOPE = {
  department: DEPT,
  objective: "lifecycle test: exercise the full LOCKED status chain end to end",
  output_contract: "status transitions recorded",
  model_tier: "L3",
} as const;

let client: Client;

async function call(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error((res.content as Array<{ text: string }>)[0]?.text ?? "tool error");
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

beforeAll(async () => {
  const server = createDxbMcpServer();
  client = new Client({ name: "lifecycle-test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  await sweepByDepartment(getDb(), "p3lc-"); // self-heal a killed previous run
});

afterAll(async () => {
  await sweepByDepartment(getDb(), "p3lc-");
  await client.close();
  await closeDb();
});

describe("dxb-mcp queue lifecycle (gate criterion 2)", () => {
  it("drives the happy chain create→claim→running→review→awaiting_approval→done with ≥4 events", async () => {
    const task = await call("queue_create_task", ENVELOPE);
    expect(task.status).toBe("queued");

    const claimed = await call("queue_claim", { worker_id: "worker-1", departments: [DEPT] });
    expect(claimed.id).toBe(task.id);
    expect(claimed.status).toBe("claimed");

    for (const to of ["running", "review", "awaiting_approval", "done"]) {
      const row = await call("queue_transition", { task_id: task.id, to_status: to, actor: "worker-1" });
      expect(row.status).toBe(to);
    }

    const events = await getDb()
      .selectFrom("task_events")
      .select(["event", "from_status", "to_status"])
      .where("task_id", "=", task.id)
      .orderBy("id")
      .execute();
    expect(events.length).toBeGreaterThanOrEqual(4);
    expect(events[0]).toMatchObject({ event: "created", from_status: "inbox", to_status: "queued" });
    expect(events.at(-1)).toMatchObject({ to_status: "done" });
  });

  it("returned path: review→returned stores feedback, returned→queued is re-claimable", async () => {
    const task = await call("queue_create_task", { ...ENVELOPE, objective: "returned path: exercise feedback loop end to end" });
    await call("queue_claim", { worker_id: "worker-2", departments: [DEPT] });
    await call("queue_transition", { task_id: task.id, to_status: "running", actor: "worker-2" });
    await call("queue_transition", { task_id: task.id, to_status: "review", actor: "worker-2" });

    const returned = await call("queue_return", { task_id: task.id, feedback: "output contract unmet: missing section 3", actor: "qa-head" });
    expect(returned.status).toBe("returned");
    expect(returned.feedback).toContain("section 3");

    await call("queue_transition", { task_id: task.id, to_status: "queued", actor: "qa-head" });
    const reclaimed = await call("queue_claim", { worker_id: "worker-3", departments: [DEPT] });
    expect(reclaimed.id).toBe(task.id);
    expect(reclaimed.claimed_by).toBe("worker-3");
  });

  it("rejects an illegal transition with the allowed-next list", async () => {
    const task = await call("queue_create_task", { ...ENVELOPE, objective: "illegal transition attempt must fail loudly here" });
    await expect(call("queue_transition", { task_id: task.id, to_status: "done", actor: "x" })).rejects.toThrow(
      /illegal transition queued→done.*claim-only/,
    );
  });

  it("exposes all 8 tool groups on ONE server; stubs error cleanly without touching the DB (MCP-01)", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    for (const prefix of ["queue_", "registry_", "audit_", "cost_", "memory_", "dashboard_", "crm_", "approval_"]) {
      expect(names.some((n) => n.startsWith(prefix)), `missing group ${prefix}`).toBe(true);
    }
    expect(names.length).toBeGreaterThanOrEqual(17);

    // memory went FULL in Phase 6 (06-04) — the stub-behavior probe moved to
    // a group that is still a stub face (dashboard, FULL in Phase 8).
    const res = await client.callTool({
      name: "dashboard_feed",
      arguments: { view: "tasks" },
    });
    expect(res.isError).toBe(true);
    expect((res.content as Array<{ text: string }>)[0].text).toContain("not yet active in this phase");
  });

  it("rejects transition to returned without feedback (QUEUE-03)", async () => {
    const task = await call("queue_create_task", { ...ENVELOPE, department: "p3lc-isolated", objective: "feedbackless return attempt must fail loudly" });
    await call("queue_claim", { worker_id: "w", departments: ["p3lc-isolated"] });
    await call("queue_transition", { task_id: task.id, to_status: "running", actor: "w" });
    await call("queue_transition", { task_id: task.id, to_status: "review", actor: "w" });
    await expect(call("queue_transition", { task_id: task.id, to_status: "returned", actor: "w" })).rejects.toThrow(
      /requires feedback/,
    );
  });
});
