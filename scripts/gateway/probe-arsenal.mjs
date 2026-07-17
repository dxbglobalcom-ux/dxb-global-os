// R4.3 — live tool-call proof per installed external server (roadmap gate:
// "free-tranche servers alive in catalog+pins with ≥1 real tool_call each").
// Each probe is a REAL MCP tools/call round-trip through the same catalog
// entry the worker mounts — read-only calls only.
//   node scripts/gateway/probe-arsenal.mjs
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const { servers } = JSON.parse(
  readFileSync(resolve(ROOT, "packages/gateway/policy/grants.json"), "utf8"),
);

const PROBES = {
  git: { tool: "git_status", args: { repo_path: ROOT } },
  context7: {
    tool: "resolve-library-id",
    args: { libraryName: "react", query: "react hooks api" },
  },
  playwright: { tool: "browser_navigate", args: { url: "https://example.com" } },
  scrapling: { tool: "get", args: { url: "https://example.com" } },
};

let failures = 0;
for (const [name, probe] of Object.entries(PROBES)) {
  const cfg = servers[name];
  if (!cfg) {
    console.error(`SKIP ${name}: not in catalog`);
    failures += 1;
    continue;
  }
  const client = new Client({ name: "arsenal-probe", version: "0.1.0" });
  const transport = new StdioClientTransport({
    command: cfg.command,
    args: (cfg.args ?? []).map((a) =>
      a.includes("/") && !isAbsolute(a) ? resolve(ROOT, a) : a,
    ),
    env: getDefaultEnvironment(),
    cwd: ROOT,
    stderr: "ignore",
  });
  try {
    await client.connect(transport);
    const started = Date.now();
    const res = await client.callTool({ name: probe.tool, arguments: probe.args });
    const text = (res.content ?? [])
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .slice(0, 160);
    console.log(
      `${res.isError ? "FAIL" : "OK"}  ${name}.${probe.tool} (${Date.now() - started}ms): ${text}`,
    );
    if (res.isError) failures += 1;
    if (name === "playwright") {
      await client.callTool({ name: "browser_close", arguments: {} });
    }
  } catch (err) {
    console.error(`FAIL ${name}.${probe.tool}: ${err.message}`);
    failures += 1;
  } finally {
    await client.close().catch(() => {});
  }
}
process.exit(failures === 0 ? 0 : 1);
