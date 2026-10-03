// Measured 2026-10-03 by lanes-probe.mjs: Hamza's chat lane — `tools: []`, companyIsolation(), no
// MCP server of its own — started with tools=10 mcp=2, while a direct call of the same shape started
// with mcp=0. ~/.claude.json names two claude.ai account connectors (`claudeAiMcpEverConnected`:
// "claude.ai Kiwi.com", "claude.ai Claude Docs"). This probe settles where they come from and whether
// `strictMcpConfig: true` keeps them out: two runs per variant, each printing the init's servers AND
// the live status (`mcpServerStatus()`, read at the first assistant message, when the model is
// already answering with whatever is mounted). Run through run-lanes-probe.sh's shape (systemd-run).
//
// Since 83a54e7e the helper itself carries `strictMcpConfig: true`, so a variant that only leaves the
// option out holds it too — Sol's single pass (2026-10-03 14:16) measured the two variants identical.
// The negative variant therefore passes `strictMcpConfig: false` explicitly, after the helper, and
// every run prints the value its options really carried.
import { createRequire } from "node:module";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const require = createRequire(join(ROOT, "packages", "kernel", "package.json"));
const { query } = await import(require.resolve("@anthropic-ai/claude-agent-sdk"));
const { companyIsolation, isolationReceipt } = await import(join(ROOT, "packages", "kernel", "dist", "sdk-isolation.js"));

const show = (servers) => servers.map((s) => `${s.name}:${s.status}${s.tools ? `(${s.tools.length} tools)` : ""}`).join(", ");

async function run(label, extra) {
  const seen = isolationReceipt(label);
  const options = { ...companyIsolation(), model: "claude-sonnet-5", effort: "low", tools: [], maxTurns: 2, ...extra };
  console.log(`${label} options: strictMcpConfig=${options.strictMcpConfig}`);
  const q = query({ prompt: "Reply with the single word: ok", options });
  let live = null;
  for await (const m of q) {
    seen(m);
    if (m.type === "system" && m.subtype === "init") console.log(`${label} init: tools=${m.tools.length} mcp=[${show(m.mcp_servers)}]`);
    if (m.type === "assistant" && live === null) {
      live = await q.mcpServerStatus().catch((e) => [{ name: `status-error ${e.message}`, status: "?" }]);
      console.log(`${label} live at the first answer: [${show(live)}]`);
    }
  }
}

for (const i of [1, 2]) await run(`strictMcpConfig-false#${i}`, { strictMcpConfig: false });
for (const i of [1, 2]) await run(`helper-as-is#${i}`, {});
console.log("PROBE_DONE");
