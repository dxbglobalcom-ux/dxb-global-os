// R2.2 verification — worker real tool surface (audit F-02/F-04):
//   1. resolveRuntimeProfile precedence: employee overlay beats department;
//      missing files = default-deny empty surface (T-07-07)
//   2. buildSdkToolOptions: allowed/disallowed partition covers the WHOLE
//      inventory; strictMcpConfig pinned; relative server args anchored
//   3. resolveEvidenceToolCalls: verification items anchor to the run's REAL
//      tool_calls rows; unmatched tools stay unanchored (A10 — no invention)
//   4. RunScope.settle(): buffered rows become queryable before the post-gate
// Live F-04 grant→revoke chain runs OUTSIDE vitest (governed control fn +
// recompile + real SDK run — wave evidence script).
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import { runScope } from "@dxb/observability";
import {
  mcpToolName,
  resolveRuntimeProfile,
} from "../../packages/gateway/src/runtime-profile.js";
import {
  buildSdkToolOptions,
  resolveEvidenceToolCalls,
} from "../../packages/orchestrator/src/worker-shim.js";

const db = () => getDb();
const M = `r22t-${randomUUID().slice(0, 8)}`;

const dir = mkdtempSync(join(tmpdir(), "r22-profiles-"));
function writeProfile(name: string, tools: string[], server = "dxb-mcp"): void {
  writeFileSync(
    join(dir, name),
    JSON.stringify({
      _tools: { [server]: tools },
      mcpServers: { [server]: { command: "node", args: ["packages/dxb-mcp/dist/index.js"] } },
    }),
  );
}

afterAll(async () => {
  rmSync(dir, { recursive: true, force: true });
  // capture the probe run ids BEFORE the tool_calls rows (their only link) die
  const runs = await sql<{ run_id: string }>`
    SELECT DISTINCT run_id FROM tool_calls WHERE tool LIKE ${M + "%"}`.execute(db());
  await sql`DELETE FROM tool_calls WHERE tool LIKE ${M + "%"}`.execute(db());
  for (const r of runs.rows) {
    await sql`DELETE FROM agent_runs WHERE id = ${r.run_id}::uuid`.execute(db());
  }
  await closeDb();
});

describe("R2.2 tool surface (audit F-02/F-04)", () => {
  it("employee overlay beats department profile; missing = default-deny", () => {
    writeProfile("finance.mcp.json", ["queue_get", "queue_list", "cost_summary"]);
    writeProfile("ap-agent.employee.mcp.json", ["queue_get"]);

    const overlay = resolveRuntimeProfile({ slug: "ap-agent", department: "finance" }, dir);
    expect(overlay.source).toBe("employee");
    expect(overlay.allowedTools).toEqual(["mcp__dxb-mcp__queue_get"]);

    const dept = resolveRuntimeProfile({ slug: "other-agent", department: "finance" }, dir);
    expect(dept.source).toBe("department");
    expect(dept.allowedTools).toHaveLength(3);

    const none = resolveRuntimeProfile({ slug: "ghost", department: "no-such-dept" }, dir);
    expect(none.source).toBe("none");
    expect(none.allowedTools).toEqual([]);
    expect(Object.keys(none.mcpServers)).toHaveLength(0);
  });

  it("buildSdkToolOptions partitions the full inventory and pins strict config", () => {
    const surface = resolveRuntimeProfile({ slug: "ap-agent", department: "finance" }, dir);
    const inventory = [
      "mcp__dxb-mcp__queue_get",
      "mcp__dxb-mcp__queue_transition",
      "mcp__dxb-mcp__approval_finalize_draft",
    ];
    const opts = buildSdkToolOptions(surface, inventory);
    expect(opts.strictMcpConfig).toBe(true);
    expect(opts.allowedTools).toEqual(["mcp__dxb-mcp__queue_get"]);
    expect(opts.disallowedTools).toEqual([
      "mcp__dxb-mcp__approval_finalize_draft",
      "mcp__dxb-mcp__queue_transition",
    ]);
    // partition: allowed ∪ disallowed ⊇ inventory, allowed ∩ disallowed = ∅
    const union = new Set([...opts.allowedTools, ...opts.disallowedTools]);
    for (const t of inventory) expect(union.has(t)).toBe(true);
    for (const t of opts.allowedTools) expect(opts.disallowedTools).not.toContain(t);
    // server args anchored to an absolute path
    expect(opts.mcpServers["dxb-mcp"].args[0].startsWith("/")).toBe(true);
  });

  it("settle + resolveEvidenceToolCalls anchor verification evidence to real rows; unmatched stays unanchored", async () => {
    const { value } = await runScope({ taskId: null, employeeId: null }, async (scope) => {
      scope.recordToolCall({ tool: `${M}.mcp__dxb-mcp__queue_get`, paramsDigest: null });
      await scope.settle(); // R2.2: buffered row queryable BEFORE post-gate
      const result = {
        text: "probe",
        evidence: [
          { kind: "verification", tool: `${M}.mcp__dxb-mcp__queue_get`, note: "read back" },
          { kind: "verification", tool: `${M}.never_called`, note: "phantom" },
          { kind: "file", note: "not a verification item" },
        ],
        acceptance_map: { probe: "delivered" },
      };
      await resolveEvidenceToolCalls(result, scope.runId);
      return result;
    });

    const [anchored, phantom, file] = value.evidence as Array<{
      toolCallId?: string | null;
    }>;
    expect(anchored.toolCallId).toBeTruthy();
    const row = await sql<{ tool: string }>`
      SELECT tool FROM tool_calls WHERE id = ${anchored.toolCallId}`.execute(db());
    expect(row.rows[0].tool).toBe(`${M}.mcp__dxb-mcp__queue_get`);
    expect(phantom.toolCallId).toBeUndefined(); // A10: never invented
    expect(file.toolCallId).toBeUndefined();
  });
});
