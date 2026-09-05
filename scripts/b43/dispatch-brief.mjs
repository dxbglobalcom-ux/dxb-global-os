// B43 plan ② — THE BRIEF DOOR, by hand (2026-09-05). Hands a brief to ONE named seat of a
// department as a staffed task under an open project, through the company's own tool
// (`queue_create_task` with agent_slug / project_id / label / label_tr) — the same door
// Hamza will use from the CEO's chat. Nothing is produced here: the resident worker claims
// the task within ten seconds, the seat runs with its persona, and the studio's road does
// the rest (queue_dispatch → seats → media lanes → job book).
//
//   node scripts/b43/dispatch-brief.mjs --seat media-creative-director --project <uuid> \
//        --brief /abs/brief.md --label "…" --label-tr "…" [--contract /abs/contract.md] [--priority 8]
//
// Reads DXB_DATABASE_URL from the environment (source the repo's .env files first).
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createDxbMcpServer } from "../../packages/dxb-mcp/dist/index.js";
import { closeDb } from "../../packages/shared/dist/db.js";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i].replace(/^--/, ""), process.argv[i + 1]);
const need = (k) => {
  const v = args.get(k);
  if (!v) throw new Error(`--${k} is required`);
  return v;
};
const seat = need("seat");
const project = need("project");
const objective = readFileSync(need("brief"), "utf8").trim();
const label = need("label");
const labelTr = need("label-tr");
const contract = args.has("contract") ? readFileSync(args.get("contract"), "utf8").trim() : "The deliverable the brief names, verified with a real tool call.";
const department = args.get("department") ?? "media-studio";
const priority = Number(args.get("priority") ?? 8);

const server = createDxbMcpServer();
const client = new Client({ name: "b43-dispatch-brief", version: "0.0.0" });
const [ct, st] = InMemoryTransport.createLinkedPair();
await Promise.all([server.connect(st), client.connect(ct)]);
try {
  const res = await client.callTool({
    name: "queue_create_task",
    arguments: {
      department,
      objective,
      output_contract: contract,
      model_tier: "L1",
      approval_class: "none",
      priority,
      agent_slug: seat,
      project_id: project,
      label,
      label_tr: labelTr,
    },
  });
  const text = res.content?.[0]?.text ?? "";
  if (res.isError) throw new Error(text);
  const task = JSON.parse(text);
  console.log(JSON.stringify({ task_id: task.id, status: task.status, agent_id: task.agent_id, project_id: task.project_id, created_at: task.created_at }, null, 2));
} finally {
  await client.close();
  await server.close();
  await closeDb();
}
