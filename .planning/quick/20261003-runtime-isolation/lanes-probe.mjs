// Evidence for Sol's finding 1 on phase 1 (2026-10-03): the company's REAL lane code, run in the
// resident's own shape — `systemd-run --user`, the unit's WorkingDirectory and env files, none of the
// Claude Code session's variables (run-lanes-probe.sh) — against the CONSTRUCTION engine, never the
// company:
//   chat  Hamza's chat lane through its resident drain (drainChatMessages), tool-less;
//   task  the task lane's SDK owner (defaultExecutor) for a seat that holds the company's own tools.
// Before the lanes, one direct call per shape prints the SDK's init NAMES and sets them against the
// construction's own skills, agents, plugins and MCP servers; the lanes' receipts carry the counts.
// Every session id is printed for the caller's transcript check. The rows the lanes wrote into the
// construction engine are counted and removed at the end.
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..", "..");
// PROBE_LANES=chat runs Hamza's chat lane alone — the shape the strace probe (strace-probe.sh) reads.
const ALL = (process.env.PROBE_LANES ?? "all") === "all";
const fail = (why) => {
  console.log(`PROBE_ABORT ${why}`);
  process.exit(2);
};

// ── 0. the shape it runs in ───────────────────────────────────────────────────────────────────
const dbUrl = new URL(process.env.DXB_DATABASE_URL ?? "postgresql://x@nowhere:1/x");
if (dbUrl.port !== "54422") fail(`DXB_DATABASE_URL is not the construction engine (port ${dbUrl.port})`);
if (process.env.DXB_COMPANY_DATABASE_URL) fail("DXB_COMPANY_DATABASE_URL is set — the company must not be reachable");
if (process.cwd() !== ROOT) fail(`cwd ${process.cwd()} is not the residents' WorkingDirectory`);
const agentEnv = Object.keys(process.env).filter((k) => /^(CLAUDE|ANTHROPIC)/.test(k));
console.log(`shape: cwd=residents' WorkingDirectory db=construction:${dbUrl.port} claude/anthropic env names=[${agentEnv.join(",")}]`);

const require = createRequire(join(ROOT, "packages", "kernel", "package.json"));
const { query } = await import(require.resolve("@anthropic-ai/claude-agent-sdk"));
const dist = (pkg, file) => join(ROOT, "packages", pkg, "dist", file);
const { companyIsolation, isolationReceipt } = await import(dist("kernel", "sdk-isolation.js"));
const { getDb } = await import(dist("shared", "index.js"));
const { buildSdkToolOptions, mcpToolName, readDxbMcpInventory, resolveRuntimeProfile } = await import(dist("gateway", "index.js"));
const { drainChatMessages } = await import(dist("orchestrator", "chat-drain.js"));
const { defaultExecutor } = await import(dist("orchestrator", "worker-shim.js"));

// The receipts the lanes print go to stdout like the resident's; they are also kept here.
const receipts = [];
const log = console.log.bind(console);
console.log = (...a) => {
  const line = a.map(String).join(" ");
  if (line.startsWith("[isolation]")) receipts.push(line);
  log(...a);
};

// ── 1. the construction's own names ─────────────────────────────────────────────────────────────
const names = (dir, strip = "") => {
  try {
    return readdirSync(dir).map((n) => (strip ? n.replace(strip, "") : n));
  } catch {
    return [];
  }
};
const construction = {
  skills: [...names(join(ROOT, ".claude", "skills")), ...names(join(homedir(), ".claude", "skills"))],
  agents: [...names(join(homedir(), ".claude", "agents"), /\.md$/), ...names(join(ROOT, ".claude", "agents"), /\.md$/)],
  plugins: (() => {
    try {
      const j = JSON.parse(readFileSync(join(homedir(), ".claude", "plugins", "installed_plugins.json"), "utf8"));
      return Object.keys(j.plugins ?? j).map((k) => k.split("@")[0]);
    } catch {
      return [];
    }
  })(),
};
console.log(`construction: skills=${construction.skills.length} agents=${construction.agents.length} plugins=${construction.plugins.length}`);

const db = getDb();
const seat = await db.selectFrom("agents").select(["id", "slug", "department"]).where("slug", "=", "finance-financial-analyst").executeTakeFirstOrThrow();
const surface = resolveRuntimeProfile({ slug: seat.slug, department: seat.department });
const inventory = (await readDxbMcpInventory()).map((e) => mcpToolName(e.server, e.tool));
const toolOpts = buildSdkToolOptions(surface, inventory);
const profileServers = Object.keys(toolOpts.mcpServers);
console.log(`seat ${seat.slug}: profile servers=[${profileServers.join(",")}] allowed tools=${toolOpts.allowedTools.length}`);

// ── 2. the init names, one direct call per lane shape ─────────────────────────────────────────
const overlap = (a, b) => a.filter((x) => b.includes(x));
async function initNames(label, extra, expected) {
  const seen = isolationReceipt(`names-${label}`);
  const q = query({
    prompt: "Reply with the single word: ok",
    options: { ...companyIsolation(), model: "claude-sonnet-5", effort: "low", tools: [], maxTurns: 2, ...extra },
  });
  let init = null;
  let live = null;
  for await (const m of q) {
    seen(m);
    if (m.type === "system" && m.subtype === "init") init = m;
    // the account's connectors can attach AFTER the init message (connectors-probe.mjs), so the
    // servers the model really holds are read while it answers
    if (m.type === "assistant" && live === null) live = await q.mcpServerStatus();
  }
  if (!init) fail(`${label}: no init message`);
  console.log(`${label} live at the first answer: [${(live ?? []).map((s) => `${s.name}:${s.status}(${s.tools?.length ?? 0} tools)`).join(", ")}]`);
  const servers = init.mcp_servers.map((s) => `${s.name}:${s.status}`);
  const plugins = init.plugins.map((p) => p.name);
  console.log(
    `${label} init: tools=${init.tools.length} mcp=[${servers.join(",")}] plugins=[${plugins.join(",")}] ` +
      `skills=[${init.skills.join(",")}] agents=[${(init.agents ?? []).join(",")}] slash=${init.slash_commands.length}`,
  );
  const mounted = [...new Set([...init.mcp_servers, ...(live ?? [])].map((s) => s.name))];
  const foreignServers = mounted.filter((n) => !expected.servers.includes(n));
  const foreignTools = init.tools.filter((t) => !expected.tools.includes(t));
  console.log(
    `${label} against the construction: skills=[${overlap(init.skills, construction.skills)}] ` +
      `agents=[${overlap(init.agents ?? [], construction.agents)}] ` +
      `slash=[${overlap(init.slash_commands, [...construction.skills, ...construction.agents])}] ` +
      `plugins=[${overlap(plugins, construction.plugins)}] servers beyond the lane's own (init or live)=[${foreignServers}] ` +
      `tools beyond the lane's grant=[${foreignTools.slice(0, 5)}${foreignTools.length > 5 ? ",…" : ""}] (${foreignTools.length})`,
  );
}
if (ALL) await initNames("chat-shape", {}, { servers: [], tools: [] });
if (ALL) await initNames("task-shape", {
  mcpServers: toolOpts.mcpServers,
  allowedTools: toolOpts.allowedTools,
  disallowedTools: toolOpts.disallowedTools,
  strictMcpConfig: toolOpts.strictMcpConfig,
}, { servers: profileServers, tools: toolOpts.allowedTools });

// ── 3. the lanes themselves ─────────────────────────────────────────────────────────────────────
const CANARY = [
  "This is a probe of what you were given, not a task. Look ONLY at text you received before this message",
  "(system prompt, instructions, memory files, session reminders), not general knowledge.",
  'For each phrase answer PRESENT or ABSENT: (1) "anti-baby-sitting" (2) "Hitap protokol" (3) "graphify" (4) "THE CUPBOARD".',
  "One line each, nothing else.",
].join(" ");

const tables = ["chat_sessions", "chat_messages", "cost_ledger", "audit_log", "alerts", "memory_index", "agent_runs", "tool_calls"];
async function counts() {
  const out = {};
  for (const t of tables) {
    try {
      out[t] = Number((await db.selectFrom(t).select(db.fn.countAll().as("n")).executeTakeFirst()).n);
    } catch {
      out[t] = "n/a";
    }
  }
  return out;
}
const before = await counts();
const pending = await db.selectFrom("chat_messages").select("id").where("role", "=", "ceo").where("status", "=", "pending").execute();
if (pending.length > 0) fail(`${pending.length} pending CEO messages already in the construction engine — the drain would answer another`);

const session = await db.insertInto("chat_sessions").values({ title: "isolation probe 2026-10-03" }).returning("id").executeTakeFirstOrThrow();
await db.insertInto("chat_messages").values({ role: "ceo", content: CANARY, session_id: session.id }).execute();
const drained = await drainChatMessages({ db });
const thread = await db.selectFrom("chat_messages").select(["role", "status", "content", "error"]).where("session_id", "=", session.id).orderBy("created_at").execute();
console.log(`chat lane: drain=${JSON.stringify(drained)}`);
for (const r of thread) console.log(`  ${r.role}/${r.status}: ${JSON.stringify(r.role === "ceo" ? "(the canary question)" : r.content)}${r.error ? ` error=${r.error}` : ""}`);

const anyTask = await db.selectFrom("tasks").select(["id"]).orderBy("created_at").limit(1).executeTakeFirstOrThrow();
const t0 = (await db.selectNoFrom((eb) => eb.fn("now", []).as("t")).executeTakeFirst()).t;
const out = !ALL ? null : await defaultExecutor({
  id: anyTask.id,
  department: seat.department,
  objective: `${CANARY} Do not call any tool.`,
  output_contract: "result: the four lines; confidence 0-1; evidence: []; acceptance_map: {}",
  model_tier: "L4",
  approval_class: "none",
  budget_max_tokens: 4000,
  priority: 5,
  status: "running",
  agent_id: seat.id,
});
if (out) console.log(`task lane: toolSurfaceMounted=${out.toolSurfaceMounted} result=${JSON.stringify(out.result?.text ?? out.result)}`);

// ── 4. what the lanes wrote, and its removal ────────────────────────────────────────────────────
const after = await counts();
await db.deleteFrom("chat_messages").where("session_id", "=", session.id).execute();
await db.deleteFrom("chat_sessions").where("id", "=", session.id).execute();
await db.deleteFrom("cost_ledger").where("task_id", "=", anyTask.id).where("created_at", ">=", t0).execute();
const cleaned = await counts();
console.log(`rows before=${JSON.stringify(before)}`);
console.log(`rows after =${JSON.stringify(after)}`);
console.log(`rows clean =${JSON.stringify(cleaned)}`);
console.log(`SESSIONS ${receipts.map((r) => r.match(/session=(\S+)/)?.[1]).join(" ")}`);
await db.destroy();
console.log("PROBE_DONE");
