// R2.2 diagnostic — does the SDK session actually see dxb-mcp tools?
// (resolved through the orchestrator package — the root workspace holds no
// direct SDK dependency; event-probe.mjs precedent for dev-host probes)
import { createRequire } from "node:module";
const require = createRequire(
  new URL("../../packages/orchestrator/package.json", import.meta.url),
);
const { query } = await import(
  require.resolve("@anthropic-ai/claude-agent-sdk")
);

const q = query({
  prompt:
    "Call the tool mcp__dxb-mcp__queue_get with {\"task_id\": \"3d3ba527-354e-487b-9e8f-fbd717bb117a\"} and report the row's status field. If the tool is unavailable, say TOOL-UNAVAILABLE and list the tools you can see.",
  options: {
    model: "claude-haiku-4-5",
    effort: "medium",
    tools: [],
    maxTurns: 4,
    mcpServers: {
      "dxb-mcp": {
        command: "node",
        args: ["/home/ghost/DxB Global OS/packages/dxb-mcp/dist/index.js"],
      },
    },
    allowedTools: ["mcp__dxb-mcp__queue_get"],
    strictMcpConfig: true,
  },
});

for await (const msg of q) {
  if (msg.type === "system" && msg.subtype === "init") {
    console.log("INIT mcp_servers:", JSON.stringify(msg.mcp_servers ?? msg.mcpServers ?? "none"));
    console.log("INIT tools:", JSON.stringify((msg.tools ?? []).filter((t) => String(t).includes("mcp"))));
  }
  if (msg.type === "assistant") {
    const blocks = msg.message?.content;
    if (Array.isArray(blocks)) {
      for (const b of blocks) {
        if (b?.type === "tool_use") console.log("TOOL_USE:", b.name, JSON.stringify(b.input));
        if (b?.type === "text" && b.text?.trim()) console.log("TEXT:", b.text.slice(0, 200));
      }
    }
  }
  if (msg.type === "result") {
    console.log("RESULT subtype:", msg.subtype, "| text:", String(msg.result ?? "").slice(0, 200));
    break;
  }
}
