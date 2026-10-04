// Done-list 6 — the dxb-mcp child, in a company call's shape, reads and writes the drawer whatever its cwd.
// No model call: the child is spawned exactly as the CLI spawns it (node packages/dxb-mcp/dist/index.js),
// with the company allowlist env (kernel companyIsolation().env), a working folder that is NOT the root,
// against the CONSTRUCTION engine; memory_commit then memory_recall over stdio JSON-RPC.
//   node .planning/quick/20261004-company-memory-drawer/mcp-child-probe.mjs
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const { companyIsolation } = await import(path.join(REPO, "packages/kernel/dist/index.js"));
const { CONSTRUCTION_DATABASE_URL } = { CONSTRUCTION_DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54422/postgres" };

const root = await mkdtemp(path.join(os.tmpdir(), "dxb-probe-root-"));
const cwd = await mkdtemp(path.join(os.tmpdir(), "dxb-probe-cwd-"));
const agent = `mcp-child-probe-${Date.now()}`;
const iso = companyIsolation({ ...process.env, DXB_DATABASE_URL: CONSTRUCTION_DATABASE_URL, DXB_MEMORY_ROOT: root });
const env = { ...iso.env, HOME: cwd, PWD: cwd };
console.log(`root=${root}\ncwd=${cwd}\nchild env carries DXB_MEMORY_ROOT=${env.DXB_MEMORY_ROOT === root}`);

const child = spawn("node", [path.join(REPO, "packages/dxb-mcp/dist/index.js")], { cwd, env, stdio: ["pipe", "pipe", "pipe"] });
let buf = "";
const waiters = new Map();
child.stdout.on("data", (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    const msg = JSON.parse(line);
    if (msg.id && waiters.has(msg.id)) waiters.get(msg.id)(msg);
  }
});
child.stderr.on("data", (d) => process.stderr.write(`[child] ${d}`));
let next = 1;
const call = (method, params) =>
  new Promise((resolve, reject) => {
    const id = next++;
    const t = setTimeout(() => reject(new Error(`timeout on ${method}`)), 30_000);
    waiters.set(id, (m) => (clearTimeout(t), resolve(m)));
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });

let ok = false;
let indexId = null;
try {
  await call("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "probe", version: "1" } });
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  const marker = `PROBE-${agent}`;
  const commit = await call("tools/call", {
    name: "memory_commit",
    arguments: { artifact: { path: "probe/drawer.md", body: `# probe\n${marker}` }, provenance: { agent, task_id: null, origin: "agent", source: "probe" } },
  });
  const created = JSON.parse(commit.result.content[0].text);
  indexId = created[0].index_id;
  const recall = await call("tools/call", { name: "memory_recall", arguments: { query: "probe drawer note", kind: "artifact", limit: 1 } });
  if (recall.result?.isError) throw new Error(`recall error: ${recall.result.content[0].text}`);
  const rows = JSON.parse(recall.result.content[0].text).rows;
  const ref = `memory-store/artifact/${indexId}.md`;
  console.log(`commit: index_id=${indexId} store=${created[0].store}`);
  console.log(`recall: first row ${rows[0]?.id} body has marker=${String(rows[0]?.body).includes(marker)}`);
  console.log(`note under root: ${existsSync(path.join(root, ref))} · note under cwd: ${existsSync(path.join(cwd, ref))} · under repo: ${existsSync(path.join(REPO, ref))}`);
  ok = rows[0]?.id === indexId && String(rows[0]?.body).includes(marker) && existsSync(path.join(root, ref)) && !existsSync(path.join(cwd, ref)) && !existsSync(path.join(REPO, ref));
} finally {
  child.kill();
  const pg = await import(path.join(REPO, "node_modules/.pnpm/node_modules/pg/lib/index.js")).catch(() => null);
  if (pg && indexId) {
    const c = new pg.default.Client({ connectionString: CONSTRUCTION_DATABASE_URL });
    await c.connect();
    await c.query("delete from memory_index where id = $1", [indexId]);
    await c.query("delete from audit_log where actor = $1", [agent]);
    await c.end();
    console.log("construction rows of the probe removed");
  }
  await rm(root, { recursive: true, force: true });
  await rm(cwd, { recursive: true, force: true });
}
console.log(ok ? "PROBE_OK" : "PROBE_FAIL");
process.exit(ok ? 0 : 1);
