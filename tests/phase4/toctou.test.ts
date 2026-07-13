import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
import { approve } from "../../tools/dxb-cli/src/approve.js";
import { tick } from "../../packages/outbox-executor/src/index.js";
import { assertNoForeignReadyOutbox, sweepByDepartment } from "../helpers/suite-scope.js";

// GATE-02 proofs (04-03): the executor's same-transaction re-check (TOCTOU),
// loud refusal of unknown action types, path-traversal confinement, and the
// full e2e chain draft→finalize→approve→tick→file with an audit causal chain.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const PROOF_ROOT = resolve(process.cwd(), "tmp", "outbox-proof");

// Suite-unique department = isolation marker (E9.3 incident fix).
const DEPT = "p4tc-gate";

const ENVELOPE = {
  department: DEPT,
  objective: "outbox executor test: GATE-02 exactly-once side effects",
  output_contract: "outbox chain recorded",
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

/** draft → finalize; returns the approval row (status pending). */
async function draftAndFinalize(taskId: string, actionType: string, payload: unknown): Promise<any> {
  const draft = await call("approval_submit_draft", {
    task_id: taskId,
    action_type: actionType,
    payload,
    risk_class: "low",
  });
  await call("approval_finalize_draft", { approval_id: draft.id, actor: "agent-eng-1" });
  return draft;
}

beforeAll(async () => {
  const server = createDxbMcpServer();
  client = new Client({ name: "toctou-test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  await sweepByDepartment(getDb(), DEPT); // self-heal a killed previous run
  // tick() fires EVERY ready row — refuse to run over live gated actions.
  await assertNoForeignReadyOutbox(getDb());
  await rm(PROOF_ROOT, { recursive: true, force: true });
});

afterAll(async () => {
  await sweepByDepartment(getDb(), DEPT);
  await client.close();
  await closeDb();
});

describe("outbox executor (GATE-02)", () => {
  it("e2e: draft→finalize→dxb approve→tick → file written once, audit chain ≥3 entries", async () => {
    const taskId = await makeTask();
    const draft = await draftAndFinalize(taskId, "test.write_file", {
      path: "e2e-proof.txt",
      content: "gate-02 e2e",
    });
    await approve(draft.id);

    await tick();

    const file = resolve(PROOF_ROOT, "e2e-proof.txt");
    expect(existsSync(file)).toBe(true);
    expect(await readFile(file, "utf8")).toContain("gate-02 e2e");

    const outbox = await getDb()
      .selectFrom("outbox")
      .selectAll()
      .where("approval_id", "=", draft.id)
      .executeTakeFirstOrThrow();
    expect(outbox.status).toBe("executed");
    expect(outbox.attempts).toBe(1);
    expect(outbox.executed_at).not.toBeNull();

    const audit = await getDb()
      .selectFrom("audit_log")
      .select(["action"])
      .where("task_id", "=", taskId)
      .orderBy("id")
      .execute();
    const actions = audit.map((a) => a.action);
    expect(actions).toContain("approval.submit_draft");
    expect(actions).toContain("approval.approve");
    expect(actions).toContain("outbox.executed");
    expect(actions.length).toBeGreaterThanOrEqual(3);
  });

  it("TOCTOU: a ready outbox row whose approval is NOT approved goes failed; handler never runs", async () => {
    const taskId = await makeTask();
    // finalize leaves the approval at 'pending' — then simulate corruption/attack:
    // an outbox row inserted directly, bypassing the trigger path.
    const draft = await draftAndFinalize(taskId, "test.write_file", {
      path: "toctou-should-not-exist.txt",
      content: "must never be written",
    });
    await getDb()
      .insertInto("outbox")
      .values({ approval_id: draft.id, idempotency_key: `test.write_file:${draft.id}` })
      .execute();

    await tick();

    const outbox = await getDb()
      .selectFrom("outbox")
      .selectAll()
      .where("approval_id", "=", draft.id)
      .executeTakeFirstOrThrow();
    expect(outbox.status).toBe("failed");
    expect(outbox.last_error).toBe("approval not in approved state at execution time");
    expect(existsSync(resolve(PROOF_ROOT, "toctou-should-not-exist.txt"))).toBe(false);

    const audit = await getDb()
      .selectFrom("audit_log")
      .selectAll()
      .where("action", "=", "outbox.execute_failed_recheck")
      .where("task_id", "=", taskId)
      .execute();
    expect(audit.length).toBe(1);
  });

  it("unknown action_type: tick throws loudly and the transaction rolls back (row stays ready)", async () => {
    const taskId = await makeTask();
    const draft = await draftAndFinalize(taskId, "nope.unknown", { anything: true });
    await approve(draft.id);

    await expect(tick()).rejects.toThrow(/no handler for nope\.unknown/);

    const outbox = await getDb()
      .selectFrom("outbox")
      .selectAll()
      .where("approval_id", "=", draft.id)
      .executeTakeFirstOrThrow();
    expect(outbox.status).toBe("ready"); // rollback proof
    expect(outbox.attempts).toBe(0);

    // drain: remove the poison row so later tests see a clean ready queue
    await getDb().deleteFrom("outbox").where("approval_id", "=", draft.id).execute();
  });

  it("path traversal payload is refused inside the handler → outbox failed, nothing written outside", async () => {
    const taskId = await makeTask();
    const draft = await draftAndFinalize(taskId, "test.write_file", {
      path: "../escape.txt",
      content: "must not escape",
    });
    await approve(draft.id);

    await tick();

    const outbox = await getDb()
      .selectFrom("outbox")
      .selectAll()
      .where("approval_id", "=", draft.id)
      .executeTakeFirstOrThrow();
    expect(outbox.status).toBe("failed");
    expect(outbox.last_error).toMatch(/refuses path escaping/);
    expect(existsSync(resolve(process.cwd(), "tmp", "escape.txt"))).toBe(false);

    const audit = await getDb()
      .selectFrom("audit_log")
      .selectAll()
      .where("action", "=", "outbox.execute_failed")
      .where("task_id", "=", taskId)
      .execute();
    expect(audit.length).toBe(1);
  });

  it("absolute path payload is refused", async () => {
    const taskId = await makeTask();
    const draft = await draftAndFinalize(taskId, "test.write_file", {
      path: "/tmp/absolute-escape.txt",
      content: "must not escape",
    });
    await approve(draft.id);

    await tick();

    const outbox = await getDb()
      .selectFrom("outbox")
      .selectAll()
      .where("approval_id", "=", draft.id)
      .executeTakeFirstOrThrow();
    expect(outbox.status).toBe("failed");
    expect(outbox.last_error).toMatch(/refuses absolute path/);
  });
});
