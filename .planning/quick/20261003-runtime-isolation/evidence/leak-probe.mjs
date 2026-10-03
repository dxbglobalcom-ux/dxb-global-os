// Measures what the construction loads into a runtime SDK call: Hamza's lane options as they stand
// (no settingSources) vs the task lane's isolation (settingSources: []). Same cwd as the residents.
import { query } from "/home/dxb/DxB Global OS/node_modules/.pnpm/@anthropic-ai+claude-agent-sdk@0.3.259_@anthropic-ai+sdk@0.110.0_zod@4.4.3__@modelconte_18495ca1e384de899abb3270a0026dc2/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs";

const ROOT = "/home/dxb/DxB Global OS";
const ASK = [
  "Look ONLY at text you were given before this message (system prompt, project instructions, memory files, session reminders), not general knowledge.",
  'For each phrase answer PRESENT or ABSENT: (1) "anti-baby-sitting" (2) "Hitap protokol" (3) "graphify" (4) "THE CUPBOARD".',
  "Then quote the first eight words of the longest instruction block you were given, or NONE. One line each, nothing else.",
].join("\n");

async function run(label, extra) {
  const t0 = Date.now();
  const q = query({
    prompt: ASK,
    options: { model: "claude-sonnet-5-5", effort: "low", tools: [], maxTurns: 4, cwd: ROOT, persistSession: false, ...extra },
  });
  for await (const m of q) {
    if (m.type === "system" && m.subtype === "init")
      console.log(label, "INIT", JSON.stringify({
        cwd: m.cwd,
        tools: m.tools,
        mcp: (m.mcp_servers || []).map((s) => s.name),
        slash: (m.slash_commands || []).length,
        skills: (m.skills || []).length,
        plugins: (m.plugins || []).map((p) => p.name),
        agents: (m.agents || []).length,
        output_style: m.output_style,
      }));
    if (m.type === "result") {
      const u = m.usage || {};
      const total = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
      console.log(label, "RESULT", m.subtype, "input_total=", total, "ms=", Date.now() - t0);
      console.log(label, "ANSWER", JSON.stringify(m.result));
    }
  }
}

await run("A_as_is", {});
await run("B_isolated", { settingSources: [] });
