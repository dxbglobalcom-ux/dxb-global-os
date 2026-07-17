// R4.3 — runtime-chain proof for the external hands WITHOUT a staffed
// employee (measured boundary: the only active+profiled employee holding-wide
// is in finance, which by doctrine gets no external hands; department
// activation = Phase-10). This exercises the worker's EXACT code path up to
// the SDK boundary: resolveRuntimeProfile(dept profile) → buildSdkToolOptions
// → spawn the SAME mcpServers config the SDK session would mount → one REAL
// tools/call on an ALLOWED tool. The LLM leg (routing → SDK session) is
// already live-proven on the dxb-mcp surface (R2.2 evidence).
//   node scripts/gateway/probe-runtime-chain.mjs
import {
  buildSdkToolOptions,
  readFullInventory,
  resolveRuntimeProfile,
} from "../../packages/gateway/dist/index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";

const CASES = [
  { dept: "engineering", server: "git", tool: "git_status", args: { repo_path: process.cwd() } },
  { dept: "quality", server: "playwright", tool: "browser_navigate", args: { url: "https://example.com" }, close: "browser_close" },
  { dept: "strategy", server: "scrapling", tool: "get", args: { url: "https://example.com" } },
  {
    dept: "engineering",
    server: "context7",
    tool: "resolve-library-id",
    args: { libraryName: "zod", query: "zod schema validation" },
  },
];

const inventory = (await readFullInventory()).entries.map(
  (e) => `mcp__${e.server}__${e.tool}`,
);

let failures = 0;
for (const c of CASES) {
  // The worker resolves by employee {slug, department}; department fallback is
  // the exact branch an overlay-less employee hits (runtime-profile.ts).
  const surface = resolveRuntimeProfile({ slug: `probe-${c.dept}`, department: c.dept });
  const opts = buildSdkToolOptions(surface, inventory);
  const fq = `mcp__${c.server}__${c.tool}`;
  if (!opts.allowedTools.includes(fq)) {
    console.error(`FAIL ${c.dept}: ${fq} not in allowedTools (surface ${surface.source})`);
    failures += 1;
    continue;
  }
  const denied = opts.disallowedTools.includes(fq);
  const cfg = opts.mcpServers[c.server];
  const client = new Client({ name: "runtime-chain-probe", version: "0.1.0" });
  const transport = new StdioClientTransport({
    command: cfg.command,
    args: cfg.args,
    env: getDefaultEnvironment(),
    stderr: "ignore",
  });
  try {
    await client.connect(transport);
    const res = await client.callTool({ name: c.tool, arguments: c.args });
    const text = (res.content ?? [])
      .filter((x) => x.type === "text")
      .map((x) => x.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .slice(0, 120);
    console.log(
      `${res.isError || denied ? "FAIL" : "OK"}  ${c.dept} → ${fq} (allowed, ${
        opts.allowedTools.length
      } tool surface): ${text}`,
    );
    if (res.isError || denied) failures += 1;
    if (c.close) await client.callTool({ name: c.close, arguments: {} });
  } catch (err) {
    console.error(`FAIL ${c.dept} → ${fq}: ${err.message}`);
    failures += 1;
  } finally {
    await client.close().catch(() => {});
  }
}

// Negative control: the denied unsafe tool must be OUTSIDE the allowed set.
const q = buildSdkToolOptions(
  resolveRuntimeProfile({ slug: "probe-quality", department: "quality" }),
  inventory,
);
const unsafeAllowed = q.allowedTools.includes("mcp__playwright__browser_run_code_unsafe");
const unsafeStripped = q.disallowedTools.includes("mcp__playwright__browser_run_code_unsafe");
console.log(
  `${!unsafeAllowed && unsafeStripped ? "OK" : "FAIL"}  negative control: browser_run_code_unsafe allowed=${unsafeAllowed} stripped=${unsafeStripped}`,
);
if (unsafeAllowed || !unsafeStripped) failures += 1;

process.exit(failures === 0 ? 0 : 1);
