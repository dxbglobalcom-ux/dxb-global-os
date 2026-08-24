import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
import { approve } from "../../tools/dxb-cli/src/approve.js";
import { tick } from "../../packages/outbox-executor/src/index.js";
import { assertNoForeignReadyOutbox, sweepByDepartment } from "../helpers/suite-scope.js";

// GATE-02 "one row, one effect, once": two parallel ticks race on ONE ready
// outbox row — FOR UPDATE SKIP LOCKED must give exactly one execution.
// The scenario runs twice (flake check per plan 04-03).

const PROOF_ROOT = resolve(process.cwd(), "tmp", "outbox-proof");

let client: Client;

async function call(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error((res.content as Array<{ text: string }>)[0]?.text ?? "tool error");
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

// Suite-unique department = isolation marker (E9.3 incident fix).
const DEPT = "p4df-gate";

/** Full chain up to ONE ready outbox row; returns {approvalId, file}. */
async function makeReadyRow(run: number): Promise<{ approvalId: string; file: string }> {
  const task = await call("queue_create_task", {
    department: DEPT,
    objective: `double-fire run ${run}: parallel ticks must execute exactly once`,
    output_contract: "single execution",
    model_tier: "L3",
  });
  const draft = await call("approval_submit_draft", {
    task_id: task.id,
    action_type: "test.write_file",
    payload: { path: `double-fire-${run}.txt`, content: `run ${run}` },
    risk_class: "low",
  });
  await call("approval_finalize_draft", { approval_id: draft.id, actor: "agent-eng-1" });
  await approve(draft.id);
  return { approvalId: draft.id, file: resolve(PROOF_ROOT, `double-fire-${run}.txt`) };
}

beforeAll(async () => {
  const server = createDxbMcpServer();
  client = new Client({ name: "double-fire-test", version: "0.0.0" });
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

describe("double-fire: two parallel ticks, one ready row (GATE-02)", () => {
  for (const run of [1, 2]) {
    it(`run ${run}: SKIP LOCKED yields a single execution — file written once, attempts=1`, async () => {
      const { approvalId, file } = await makeReadyRow(run);

      // Two ticks race in parallel — the pool gives each transaction its own connection.
      await Promise.all([tick(), tick()]);

      const outbox = await getDb()
        .selectFrom("outbox")
        .selectAll()
        .where("approval_id", "=", approvalId)
        .executeTakeFirstOrThrow();
      expect(outbox.status).toBe("executed");
      expect(outbox.attempts).toBe(1);

      const content = await readFile(file, "utf8");
      const markers = content.split("\n").filter((l) => l.startsWith("# idempotency_key:"));
      expect(markers.length).toBe(1); // single write, no duplicate marker

      const executedAudits = (
        await getDb().selectFrom("audit_log").selectAll().where("action", "=", "outbox.executed").execute()
      ).filter((a) => (a.payload as { outbox_id?: string }).outbox_id === outbox.id);
      expect(executedAudits.length).toBe(1);
    });
  }
});
