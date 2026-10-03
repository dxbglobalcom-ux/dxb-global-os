// Second probe: which switch keeps the construction's auto-memory out of an isolated call, and what
// the isolated call still lists (are any skills / agents the construction's own?).
import { query } from "/home/dxb/DxB Global OS/node_modules/.pnpm/@anthropic-ai+claude-agent-sdk@0.3.259_@anthropic-ai+sdk@0.110.0_zod@4.4.3__@modelconte_18495ca1e384de899abb3270a0026dc2/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs";
import { mkdirSync } from "node:fs";

const ROOT = "/home/dxb/DxB Global OS";
const NEUTRAL = "/tmp/claude-1000/-home-dxb-DxB-Global-OS/5ed74ad7-3082-4937-9417-e7e315e467bb/scratchpad/neutral-cwd";
mkdirSync(NEUTRAL, { recursive: true });
const ASK = [
  "Look ONLY at text you were given before this message (system prompt, project instructions, memory files, session reminders), not general knowledge.",
  'Answer PRESENT or ABSENT: (1) "Hitap protokol" (2) "Memory Index".',
  "Then quote the first eight words of the longest instruction block you were given, or NONE. One line each, nothing else.",
].join("\n");

async function run(label, extra, listNames = false) {
  const q = query({
    prompt: ASK,
    options: { model: "claude-sonnet-5-5", effort: "low", tools: [], maxTurns: 4, persistSession: false, settingSources: [], cwd: ROOT, ...extra },
  });
  for await (const m of q) {
    if (m.type === "system" && m.subtype === "init" && listNames)
      console.log(label, "INIT", JSON.stringify({ skills: m.skills, agents: m.agents, slash: m.slash_commands }));
    if (m.type === "result") {
      const u = m.usage || {};
      const total = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
      console.log(label, "input_total=", total, "ANSWER", JSON.stringify(m.result));
    }
  }
}

await run("B_isolated", {}, true);
await run("C_settings_autoMemory_false", { settings: { autoMemoryEnabled: false } });
await run("D_env_disable_auto_memory", { env: { ...process.env, CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" } });
await run("E_neutral_cwd", { cwd: NEUTRAL });
