// Item 1 probe: does tools:[] also remove ToolSearch (so deferral never fires), and does
// tools:['ToolSearch'] load the seat's dxb-mcp tools on demand? Construction engine only.
import { createRequire } from "node:module";
import { join } from "node:path";

const ROOT = "/home/dxb/DxB Global OS";
const dbUrl = new URL(process.env.DXB_DATABASE_URL ?? "postgresql://x@nowhere:1/x");
if (dbUrl.port !== "54422") { console.log("PROBE_ABORT not construction"); process.exit(2); }
if (process.env.DXB_COMPANY_DATABASE_URL) { console.log("PROBE_ABORT company reachable"); process.exit(2); }

const require = createRequire(join(ROOT, "packages", "kernel", "package.json"));
const { query } = await import(require.resolve("@anthropic-ai/claude-agent-sdk"));
const dist = (pkg, file) => join(ROOT, "packages", pkg, "dist", file);
const { companyIsolation, isolationReceipt } = await import(dist("kernel", "sdk-isolation.js"));
const { getDb } = await import(dist("shared", "index.js"));
const { buildSdkToolOptions, mcpToolName, readDxbMcpInventory, resolveRuntimeProfile } = await import(dist("gateway", "index.js"));

const receipts = [];
const log = console.log.bind(console);
console.log = (...a) => { const l = a.map(String).join(" "); if (l.startsWith("[isolation]")) receipts.push(l); log(...a); };

const db = getDb();
const seat = await db.selectFrom("agents").select(["slug", "department"]).where("slug", "=", "finance-financial-analyst").executeTakeFirstOrThrow();
const inventory = (await readDxbMcpInventory()).map((e) => mcpToolName(e.server, e.tool));
const t = buildSdkToolOptions(resolveRuntimeProfile(seat), inventory);

const ASK = "Use exactly one read-only dxb-mcp tool that lists or reads something (no writes). Then reply in one line: the tool's full name and how many items it returned.";
async function run(label, tools, extraEnv) {
  const iso = companyIsolation();
  const seen = isolationReceipt(`probe-${label}`);
  const q = query({
    prompt: ASK,
    options: {
      ...iso, env: { ...iso.env, ...extraEnv }, model: "claude-sonnet-5", effort: "low", tools, maxTurns: 6,
      mcpServers: t.mcpServers, allowedTools: [...t.allowedTools, "ToolSearch"], disallowedTools: t.disallowedTools,
      strictMcpConfig: t.strictMcpConfig,
    },
  });
  let init = null; const used = []; let text = "";
  for await (const m of q) {
    seen(m);
    if (m.type === "system" && m.subtype === "init") init = m;
    if (m.type === "assistant") for (const c of m.message?.content ?? []) if (c.type === "tool_use") used.push(c.name);
    if (m.type === "result") text = m.result ?? m.subtype;
  }
  console.log(`${label}: init.tools=${init?.tools.length} first=[${(init?.tools ?? []).slice(0, 4)}] hasToolSearch=${(init?.tools ?? []).includes("ToolSearch")} used=[${used}] answer=${JSON.stringify(String(text).slice(0, 200))}`);
}
await run("A-tools-empty", [], {});
await run("B-toolsearch", ["ToolSearch"], {});
await run("C-toolsearch-env", ["ToolSearch"], { ENABLE_TOOL_SEARCH: "true" });
console.log(`SESSIONS ${receipts.map((r) => r.match(/session=(\S+)/)?.[1]).join(" ")}`);
await db.destroy();
console.log("PROBE_DONE");
