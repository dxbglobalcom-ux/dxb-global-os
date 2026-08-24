import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
import { approve, reject } from "../../tools/dxb-cli/src/approve.js";
import { sweepByDepartment } from "../helpers/suite-scope.js";

// GATE-01 tool-layer proof (04-02): agents can only draft and hand over;
// decisions exist solely in the human CLI; the outbox row is trigger-born.

// Suite-unique department = isolation marker: fixtures and the scoped sweep
// both key on it (E9.3 incident fix — table-wide wipes are forbidden).
const DEPT = "p4af-gate";
const ENVELOPE = {
  department: DEPT,
  objective: "approval-flow test: draft-first outward action under GATE-01",
  output_contract: "approval chain recorded",
  model_tier: "L3",
} as const;

let client: Client;

async function call(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error((res.content as Array<{ text: string }>)[0]?.text ?? "tool error");
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

async function makeTask(): Promise<string> {
  const task = await call("queue_create_task", ENVELOPE);
  return task.id as string;
}

beforeAll(async () => {
  const server = createDxbMcpServer();
  client = new Client({ name: "approval-flow-test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  await sweepByDepartment(getDb(), DEPT); // self-heal a killed previous run
});

afterAll(async () => {
  await sweepByDepartment(getDb(), DEPT);
  await client.close();
  await closeDb();
});

describe("approval group (GATE-01 tool layer)", () => {
  it("submit_draft births a draft row with the payload frozen as-given + an audit entry", async () => {
    const taskId = await makeTask();
    const payload = { to: "client@example.com", subject: "Hello", nested: { a: 1, b: [true, "x"] } };
    const draft = await call("approval_submit_draft", {
      task_id: taskId,
      action_type: "email.send",
      payload,
      risk_class: "high",
    });
    expect(draft.status).toBe("draft");
    expect(draft.payload).toEqual(payload); // frozen exactly as submitted

    const audit = await getDb()
      .selectFrom("audit_log")
      .selectAll()
      .where("action", "=", "approval.submit_draft")
      .where("task_id", "=", taskId)
      .execute();
    expect(audit.length).toBe(1);
    expect(audit[0].actor_type).toBe("agent");
  });

  it("finalize_draft moves draft→pending; list_pending sees it and filters by risk_class", async () => {
    const taskId = await makeTask();
    const draft = await call("approval_submit_draft", {
      task_id: taskId,
      action_type: "test.write_file",
      payload: { path: "proof.txt" },
      risk_class: "low",
    });
    const pending = await call("approval_finalize_draft", { approval_id: draft.id, actor: "agent-eng-1" });
    expect(pending.status).toBe("pending");

    const listedLow = await call("approval_list_pending", { risk_class: "low" });
    expect(listedLow.map((r: any) => r.id)).toContain(draft.id);
    const listedHigh = await call("approval_list_pending", { risk_class: "high" });
    expect(listedHigh.map((r: any) => r.id)).not.toContain(draft.id);
  });

  it("finalize on a non-draft row fails loudly", async () => {
    const taskId = await makeTask();
    const draft = await call("approval_submit_draft", {
      task_id: taskId,
      action_type: "test.write_file",
      payload: {},
      risk_class: "low",
    });
    await call("approval_finalize_draft", { approval_id: draft.id, actor: "agent-eng-1" });
    await expect(call("approval_finalize_draft", { approval_id: draft.id, actor: "agent-eng-1" })).rejects.toThrow(
      /not found in 'draft'/,
    );
  });

  it("exposes NO approve/reject-capable MCP tool — decisions are not a door agents can see", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    const approvalTools = names.filter((n) => n.startsWith("approval_")).sort();
    expect(approvalTools).toEqual(["approval_finalize_draft", "approval_list_pending", "approval_submit_draft"]);
    expect(names.some((n) => /approve|reject|decide/i.test(n))).toBe(false);
  });

  it("full chain: submit_draft→finalize→dxb approve → approved + trigger-born outbox row (CLI path)", async () => {
    const taskId = await makeTask();
    const draft = await call("approval_submit_draft", {
      task_id: taskId,
      action_type: "test.write_file",
      payload: { path: "proof.txt", content: "gate-01" },
      risk_class: "low",
    });
    await call("approval_finalize_draft", { approval_id: draft.id, actor: "agent-eng-1" });

    const decided = await approve(draft.id);
    expect(decided.status).toBe("approved");

    const row = await getDb().selectFrom("approvals").selectAll().where("id", "=", draft.id).executeTakeFirstOrThrow();
    expect(row.decided_by).toBe("ceo:cli");
    expect(row.decided_at).not.toBeNull();

    const outbox = await getDb()
      .selectFrom("outbox")
      .selectAll()
      .where("approval_id", "=", draft.id)
      .executeTakeFirstOrThrow();
    expect(outbox.idempotency_key).toBe(`test.write_file:${draft.id}`);
    expect(outbox.status).toBe("ready");

    const audit = await getDb()
      .selectFrom("audit_log")
      .selectAll()
      .where("action", "=", "approval.approve")
      .where("task_id", "=", taskId)
      .execute();
    expect(audit.length).toBe(1);
    expect(audit[0].actor_type).toBe("ceo");
  });

  it("dxb reject records the note and births NO outbox row", async () => {
    const taskId = await makeTask();
    const draft = await call("approval_submit_draft", {
      task_id: taskId,
      action_type: "email.send",
      payload: { to: "x@example.com" },
      risk_class: "high",
    });
    await call("approval_finalize_draft", { approval_id: draft.id, actor: "agent-eng-1" });

    const decided = await reject(draft.id, "wrong recipient — redo against the CRM contact");
    expect(decided.status).toBe("rejected");

    const row = await getDb().selectFrom("approvals").selectAll().where("id", "=", draft.id).executeTakeFirstOrThrow();
    expect(row.decision_note).toBe("wrong recipient — redo against the CRM contact");
    expect(row.decided_by).toBe("ceo:cli");

    const outbox = await getDb().selectFrom("outbox").selectAll().where("approval_id", "=", draft.id).execute();
    expect(outbox.length).toBe(0);
  });

  it("dxb approve on a non-pending id surfaces the trigger as a clean error", async () => {
    const taskId = await makeTask();
    const draft = await call("approval_submit_draft", {
      task_id: taskId,
      action_type: "email.send",
      payload: {},
      risk_class: "high",
    });
    // still 'draft' — CLI must refuse readably (trigger: draft→approved yasak)
    await expect(approve(draft.id)).rejects.toThrow(/not in 'pending'/);
    // decided rows are immutable too
    await call("approval_finalize_draft", { approval_id: draft.id, actor: "agent-eng-1" });
    await reject(draft.id, "no");
    await expect(approve(draft.id)).rejects.toThrow(/not in 'pending'/);
  });

  it("a simulated agent UPDATE draft→approved is refused by the one-way trigger", async () => {
    const taskId = await makeTask();
    const draft = await call("approval_submit_draft", {
      task_id: taskId,
      action_type: "email.send",
      payload: {},
      risk_class: "high",
    });
    await expect(
      getDb().updateTable("approvals").set({ status: "approved" }).where("id", "=", draft.id).execute(),
    ).rejects.toThrow(/yasak/);
  });
});
