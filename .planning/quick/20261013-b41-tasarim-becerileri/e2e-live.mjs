// B41 end-to-end, live: the construction record → compiled profiles (temp dir) → the runtime surface
// → the same SDK options the task lane builds → a real company call. Run from the repo root:
//   DXB_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54422/postgres node <this file>
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const REPO = process.cwd();
const req = createRequire(join(REPO, "packages/kernel/package.json"));
const { query } = await import(req.resolve("@anthropic-ai/claude-agent-sdk"));
const { companyIsolation } = await import(join(REPO, "packages/kernel/dist/sdk-isolation.js"));
const gw = await import(join(REPO, "packages/gateway/dist/index.js"));
const { getDb, closeDb } = await import(createRequire(join(REPO, "packages/gateway/package.json")).resolve("@dxb/shared"));
const out = mkdtempSync(join(tmpdir(), "b41e2e-"));
await gw.compileLibraryProfiles(getDb(), { outDir: out });
const read = (f) => { try { return JSON.parse(readFileSync(join(out, f), "utf8")); } catch { return null; } };
console.log("design _skills:", JSON.stringify(read("design.mcp.json")?._skills));
console.log("finance _skills:", JSON.stringify(read("finance.mcp.json")?._skills));
const fe = read("engineering-frontend-developer.employee.mcp.json"), eng = read("engineering.mcp.json");
const tools = (p) => Object.entries(p?._tools ?? {}).flatMap(([s, t]) => t.map((x) => `${s}.${x}`)).sort();
console.log("frontend overlay _skills:", JSON.stringify(fe?._skills), "tools", tools(fe).length, "engineering tools", tools(eng).length,
  "overlay ⊇ engineering:", tools(eng).every((t) => tools(fe).includes(t)));
const inv = await gw.readDxbMcpInventory?.().then((x) => x.map?.((t) => `mcp__dxb-mcp__${t.name ?? t}`)).catch(() => []) ?? [];
for (const seat of [{ slug: "design-ui-designer", department: "design" }, { slug: "finance-controller", department: "finance" }]) {
  const s = gw.resolveRuntimeProfile(seat, out);
  const o = gw.buildSdkToolOptions(s, inv);
  console.log(`${seat.slug}: plugins=${o.plugins.length} skills=${o.skills.length} tools=${JSON.stringify(o.tools)} readRule=${o.allowedTools.filter((t) => t.startsWith("Read(")).join(",") || "-"}`);
  if (seat.department !== "design") continue;
  const q = query({ prompt: "Load the break-ui skill, then read its CATALOG.md, and answer in one line with that file's first heading. Then try to read /etc/hostname and say whether you could.",
    options: { ...(companyIsolation() ?? {}), model: "claude-sonnet-5-5", effort: "medium", maxTurns: 8,
      tools: o.tools, plugins: o.plugins, skills: o.skills, allowedTools: o.allowedTools.filter((t) => !t.startsWith("mcp__")), strictMcpConfig: true } });
  for await (const m of q) {
    if (m.type === "system" && m.subtype === "init") console.log("  INIT tools=", JSON.stringify(m.tools), "plugins=", (m.plugins || []).length);
    if (m.type === "assistant") for (const c of m.message.content) if (c.type === "tool_use") console.log("  TOOL_USE", c.name, JSON.stringify(c.input).slice(0, 140));
    if (m.type === "result") console.log("  RESULT", m.subtype, String(m.result || "").replace(/\n/g, " ").slice(0, 300), "denials=", (m.permission_denials || []).map((d) => d.tool_input?.file_path).join(","));
  }
}
rmSync(out, { recursive: true, force: true });
await closeDb?.();
