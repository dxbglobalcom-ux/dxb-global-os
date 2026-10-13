import { createRequire } from "node:module";
const REPO = "/home/dxb/DxB Global OS";
const req = createRequire(REPO + "/packages/kernel/package.json");
const { query } = await import(req.resolve("@anthropic-ai/claude-agent-sdk"));
const { companyIsolation } = await import(REPO + "/packages/kernel/dist/sdk-isolation.js");
const [variant, pluginPath] = process.argv.slice(2);
const base = { ...(companyIsolation() ?? {}), model: "claude-sonnet-5-5", effort: "medium", maxTurns: 4,
  plugins: [{ type: "local", path: pluginPath }], systemPrompt: "You are a design seat. When a skill fits, load it with the Skill tool." };
const v = {
  A: { tools: [], skills: ["break-ui"] },
  B: { tools: ["Skill"], skills: ["break-ui"] },
  C: { tools: ["Skill"], skills: ["dxb-design:break-ui"] },
}[variant];
const q = query({ prompt: "Load the break-ui skill and tell me, in one line, the exact first markdown heading of that skill's SKILL.md.", options: { ...base, ...v } });
for await (const m of q) {
  if (m.type === "system" && m.subtype === "init") console.log("INIT tools=", JSON.stringify(m.tools), "plugins=", JSON.stringify((m.plugins||[]).map(p=>p.name||p)), "skills=", JSON.stringify(m.skills));
  if (m.type === "assistant") for (const c of m.message.content) if (c.type === "tool_use") console.log("TOOL_USE", c.name, JSON.stringify(c.input).slice(0,120));
  if (m.type === "result") console.log("RESULT", m.subtype, m.is_error, String(m.result||"").slice(0,200));
}
