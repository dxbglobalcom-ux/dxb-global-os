// Phase-3 exit gate: 10/10 consecutive full lifecycles through the REAL MCP
// tool path (in-process server + linked in-memory transports). Exit 0 only if
// ALL iterations pass; any failure exits nonzero naming the iteration.
// Iteration 10 additionally exercises the returned path (review→returned→
// queued→re-claim→...→done). Run AFTER `pnpm build` (imports dist output).
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createDxbMcpServer } from "../packages/dxb-mcp/dist/index.js";

process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const DEPT = "battery";
const server = createDxbMcpServer();
const client = new Client({ name: "phase3-battery", version: "0.0.0" });
const [ct, st] = InMemoryTransport.createLinkedPair();
await Promise.all([server.connect(st), client.connect(ct)]);

async function call(name, args) {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error(res.content?.[0]?.text ?? "tool error");
  return JSON.parse(res.content[0].text);
}

async function runLifecycle(i, withReturn) {
  const task = await call("queue_create_task", {
    department: DEPT,
    objective: `battery iteration ${i}: full lifecycle proof run with unique objective text`,
    output_contract: "status reaches done",
    model_tier: "L4",
    priority: 0,
  });
  const claimed = await call("queue_claim", { worker_id: `battery-w${i}`, departments: [DEPT] });
  if (claimed?.id !== task.id) throw new Error(`claimed ${claimed?.id}, expected ${task.id}`);
  await call("queue_transition", { task_id: task.id, to_status: "running", actor: `battery-w${i}` });
  await call("queue_transition", { task_id: task.id, to_status: "review", actor: `battery-w${i}` });

  if (withReturn) {
    await call("queue_return", { task_id: task.id, feedback: "battery returned-path variant", actor: "battery-qa" });
    await call("queue_transition", { task_id: task.id, to_status: "queued", actor: "battery-qa" });
    const re = await call("queue_claim", { worker_id: `battery-w${i}-retry`, departments: [DEPT] });
    if (re?.id !== task.id) throw new Error(`re-claim got ${re?.id}, expected ${task.id}`);
    await call("queue_transition", { task_id: task.id, to_status: "running", actor: `battery-w${i}-retry` });
    await call("queue_transition", { task_id: task.id, to_status: "review", actor: `battery-w${i}-retry` });
  }

  await call("queue_transition", { task_id: task.id, to_status: "awaiting_approval", actor: "battery-qa" });
  const done = await call("queue_transition", { task_id: task.id, to_status: "done", actor: "battery-qa" });
  if (done.status !== "done") throw new Error(`final status ${done.status}`);
}

let pass = 0;
try {
  for (let i = 1; i <= 10; i++) {
    await runLifecycle(i, i === 10);
    pass++;
    console.log(`iteration ${i} OK${i === 10 ? " (returned-path variant)" : ""}`);
  }
} catch (err) {
  console.error(`iteration ${pass + 1} FAILED: ${err.message}`);
  await client.close();
  process.exit(1);
}

await client.close();
console.log("10/10 PASS");
process.exit(0);
