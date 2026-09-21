// R2.4 verification — first staging provider handler (audit F-06, 7 steps):
//   1. draft is born (agent-side MCP tool, GATE-01)
//   2. the operation classifies as GATED (fn_classify_operation → approval
//      required) — the correct approval class
//   3. before approval the handler CANNOT run (no outbox row exists at all)
//   4. after approval exactly ONE execution (Mailpit messages_count 1)
//   5. same idempotency key re-fired → external transaction NOT repeated
//      (replayed:true, count still 1)
//   6. provider response ref (message_id) lands in outbox.execution_result +
//      the outbox.executed audit row joins the task's causal chain
//   7. the provider URL is an executor-side env; compiled gateway profiles
//      carry no mail capability (credential never reaches agents)
// Runs against the LIVE sandbox provider (Mailpit container) + live DB.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { sql } from "kysely";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
import { runOnce } from "../../packages/outbox-executor/src/index.js";
import { sweepByDepartment, watchLedgers } from "../helpers/suite-scope.js";

const MAIL = process.env.DXB_STAGING_MAIL_URL ?? "http://127.0.0.1:8025";
const DEPT = `r24-${randomUUID().slice(0, 8)}`;
const db = () => getDb();

// Its own footprints in audit_log / decision_log, swept in afterAll below.
const ledgerScope = watchLedgers(db);

let client: Client;

async function call(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error((res.content as Array<{ text: string }>)[0]?.text ?? "tool error");
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

async function mailCount(tagQuery: string): Promise<number> {
  const r = await fetch(`${MAIL}/api/v1/search?query=${encodeURIComponent(tagQuery)}`);
  const d = (await r.json()) as { messages_count: number };
  return d.messages_count;
}

beforeAll(async () => {
  const server = createDxbMcpServer();
  client = new Client({ name: "r24-staging-outbox", version: "0.0.0" });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(st), client.connect(ct)]);
});

afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ idempotencyPrefix: ["r24"] });
  await sweepByDepartment(db(), DEPT);
  await client.close();
  await closeDb();
});

describe("R2.4 — staging outbox handler end to end (F-06)", () => {
  it("walks all seven audit steps against the live sandbox provider", async () => {
    // (1) draft born through the agent-side tool
    const task = await call("queue_create_task", {
      department: DEPT,
      objective: "r24 staging mail probe: send one sandbox email",
      output_contract: "one staging email delivered",
      model_tier: "L4",
    });
    const draft = await call("approval_submit_draft", {
      task_id: task.id,
      action_type: "email.send.staging",
      payload: { to: "ceo@dxb-staging.local", subject: `r24 probe ${DEPT}`, text: "staging proof" },
      risk_class: "high",
    });
    expect(draft.status).toBe("draft");

    // (2) correct approval class: the operation classifies as gated
    const cls = await sql<{ c: { gate: string } }>`
      SELECT fn_classify_operation('email.send.staging') AS c`.execute(db());
    expect(cls.rows[0].c.gate).not.toBe("auto"); // outward mail is NEVER auto

    await call("approval_finalize_draft", { approval_id: draft.id, actor: "r24-agent" });

    // (3) no approval decision → no outbox row → a tick executes nothing
    await runOnce();
    const preRows = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM outbox WHERE approval_id = ${draft.id}::uuid`.execute(db());
    expect(preRows.rows[0].n).toBe(0);

    // CEO decision (control fn, ceo actor via jwt claims — e9 idiom)
    const decide = await db()
      .transaction()
      .execute(async (trx) => {
        await sql`SELECT set_config('request.jwt.claims',
          '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`.execute(trx);
        const r = await sql<{ resp: Record<string, unknown> }>`
          SELECT control_approvals_action(
            ${JSON.stringify({ op: "decide", action: "approve", approval_id: draft.id, note: "r24 staging proof" })}::jsonb,
            ${"r24-approve-" + draft.id}) AS resp`.execute(trx);
        return r.rows[0].resp;
      });
    expect(decide, JSON.stringify(decide)).toMatchObject({ ok: true });

    // (4) exactly one execution
    await runOnce();
    const row = await sql<{
      status: string;
      idempotency_key: string;
      execution_result: { message_id?: string; replayed?: boolean } | null;
    }>`SELECT status, idempotency_key, execution_result FROM outbox
       WHERE approval_id = ${draft.id}::uuid`.execute(db());
    expect(row.rows[0].status).toBe("executed");
    expect(row.rows[0].execution_result?.message_id).toBeTruthy();
    expect(row.rows[0].execution_result?.replayed).toBe(false);
    const tag = row.rows[0].idempotency_key.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    expect(await mailCount(`tag:${tag}`)).toBe(1);

    // (5) re-fire same key → provider transaction NOT repeated
    await sql`UPDATE outbox SET status = 'ready' WHERE approval_id = ${draft.id}::uuid`.execute(db());
    await runOnce();
    const replay = await sql<{
      status: string;
      execution_result: { replayed?: boolean; message_id?: string } | null;
    }>`SELECT status, execution_result FROM outbox
       WHERE approval_id = ${draft.id}::uuid`.execute(db());
    expect(replay.rows[0].status).toBe("executed");
    expect(replay.rows[0].execution_result?.replayed).toBe(true);
    expect(replay.rows[0].execution_result?.message_id).toBe(row.rows[0].execution_result?.message_id);
    expect(await mailCount(`tag:${tag}`)).toBe(1); // STILL one external message

    // (6) provider ref joined to the audit chain
    const audit = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM audit_log
      WHERE action = 'outbox.executed' AND task_id = ${task.id}::uuid`.execute(db());
    expect(audit.rows[0].n).toBeGreaterThanOrEqual(1);

    // (7) credential surface: compiled gateway profiles expose NO mail
    // capability — the staging URL lives only in the executor's env.
    const profilesDir = new URL("../../packages/gateway/profiles/", import.meta.url);
    for (const f of readdirSync(profilesDir)) {
      if (!f.endsWith(".json")) continue;
      const text = readFileSync(new URL(f, profilesDir), "utf8").toLowerCase();
      expect(text.includes("mail"), `${f} must carry no mail capability`).toBe(false);
    }
  });
});
