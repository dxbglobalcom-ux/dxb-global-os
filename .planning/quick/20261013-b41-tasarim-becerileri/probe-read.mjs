import { createRequire } from "node:module";
const REPO = "/home/dxb/DxB Global OS";
const req = createRequire(REPO + "/packages/kernel/package.json");
const { query } = await import(req.resolve("@anthropic-ai/claude-agent-sdk"));
const { companyIsolation } = await import(REPO + "/packages/kernel/dist/sdk-isolation.js");
const [pluginPath, variant] = process.argv.slice(2);
const names = ["break-ui","animate"].map(n => "dxb-design:" + n);
const allow = { D: ["Skill", `Read(/${pluginPath}/**)`], E: ["Skill", `Read(${pluginPath}/**)`] }[variant];
const q = query({ prompt: "Do these three things and report each result in one line: (1) load the break-ui skill and read its CATALOG.md; give that file's first heading. (2) Read the file /etc/hostname and give its content. (3) Read the file " + REPO + "/package.json and give its name field.",
  options: { ...(companyIsolation() ?? {}), model: "claude-sonnet-5-5", effort: "medium", maxTurns: 10,
    plugins: [{ type: "local", path: pluginPath }], skills: names, tools: ["Skill", "Read"], allowedTools: allow } });
for await (const m of q) {
  if (m.type === "system" && m.subtype === "init") console.log("INIT tools=", JSON.stringify(m.tools), "skills=", (m.skills||[]).length);
  if (m.type === "assistant") for (const c of m.message.content) if (c.type === "tool_use") console.log("TOOL_USE", c.name, JSON.stringify(c.input).slice(0,160));
  if (m.type === "user") for (const c of (m.message.content||[])) if (c.type === "tool_result") console.log("TOOL_RESULT err=", !!c.is_error, JSON.stringify(c.content).slice(0,140));
  if (m.type === "result") console.log("RESULT", m.subtype, String(m.result||"").slice(0,400), "denials=", JSON.stringify(m.permission_denials||[]).slice(0,300));
}
