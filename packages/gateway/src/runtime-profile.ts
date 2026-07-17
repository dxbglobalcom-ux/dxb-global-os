// R2.2 — runtime profile consumption (audit F-02/F-04): the missing half of
// the grant → compile → RUNTIME chain. The compiler (library-profiles.ts /
// generate-profiles.ts) writes per-department `<dept>.mcp.json` and, when
// employee-kind grants exist, `<slug>.employee.mcp.json` overlays. This module
// READS that compiled layer for one employee and answers the worker's only
// question: which MCP servers to mount and which tools the session may use.
//
// Precedence (G2 narrowest-cut, generate-profiles A4): employee overlay if the
// file exists → else the employee's department profile. No profile file → an
// EMPTY surface (default-deny, T-07-07) — the caller runs tool-less rather
// than inheriting somebody else's grants.
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROFILES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..", // dist/ (or src/ under vitest alias)
  "profiles",
);

interface ProfileFile {
  _tools?: Record<string, string[]>;
  mcpServers?: Record<string, { command: string; args?: string[]; env?: Record<string, string> }>;
}

export interface RuntimeToolSurface {
  /** Which profile file answered ('employee' | 'department' | 'none'). */
  source: "employee" | "department" | "none";
  /** Absolute-path server configs, ready for the Agent SDK mcpServers option. */
  mcpServers: Record<string, { command: string; args: string[]; env?: Record<string, string> }>;
  /** Fully-qualified allowed tool names: mcp__<server>__<tool>. */
  allowedTools: string[];
  /** Bare "<server>.<tool>" pairs (evidence resolution, logging). */
  grantedPairs: string[];
}

/** SDK MCP tool naming: server dxb-mcp, tool queue_get → mcp__dxb-mcp__queue_get. */
export function mcpToolName(server: string, tool: string): string {
  return `mcp__${server}__${tool}`;
}

function readProfile(file: string): ProfileFile | null {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as ProfileFile;
  } catch (err) {
    console.error(`[gateway] runtime profile unreadable (${file}) — default-deny:`, err);
    return null;
  }
}

/** Resolve the compiled tool surface for one employee. `profilesDir` is
 *  injectable for tests; production uses the compiler's output directory. */
export function resolveRuntimeProfile(
  employee: { slug: string; department: string },
  profilesDir: string = PROFILES_DIR,
): RuntimeToolSurface {
  const overlay = readProfile(join(profilesDir, `${employee.slug}.employee.mcp.json`));
  const dept = overlay ? null : readProfile(join(profilesDir, `${employee.department}.mcp.json`));
  const profile = overlay ?? dept;
  if (!profile) {
    return { source: "none", mcpServers: {}, allowedTools: [], grantedPairs: [] };
  }

  const mcpServers: RuntimeToolSurface["mcpServers"] = {};
  const allowedTools: string[] = [];
  const grantedPairs: string[] = [];
  for (const [server, tools] of Object.entries(profile._tools ?? {})) {
    const cfg = profile.mcpServers?.[server];
    if (!cfg || tools.length === 0) continue; // no launch config or empty grant = dead server
    mcpServers[server] = {
      command: cfg.command,
      // Profile args are repo-root-relative (compiler output); the worker may
      // run from any cwd, so anchor them to this package's repo checkout.
      args: (cfg.args ?? []).map((a) =>
        a.includes("/") && !isAbsolute(a) ? resolve(PROFILES_DIR, "..", "..", "..", a) : a,
      ),
      ...(cfg.env ? { env: cfg.env } : {}),
    };
    for (const tool of tools) {
      allowedTools.push(mcpToolName(server, tool));
      grantedPairs.push(`${server}.${tool}`);
    }
  }
  return {
    source: overlay ? "employee" : "department",
    mcpServers,
    allowedTools: allowedTools.sort(),
    grantedPairs: grantedPairs.sort(),
  };
}
