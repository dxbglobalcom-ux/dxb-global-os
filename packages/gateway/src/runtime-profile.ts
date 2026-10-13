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
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PROFILES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..", // dist/ (or src/ under vitest alias)
  "profiles",
);

// B41 (CEO 2026-10-13): the local plugins a seat may be granted, one folder each — today dxb-design,
// the design seats' skills. A profile's `_skills` names a plugin by its folder; the seat lists the
// plugin's skills and opens one with the Skill tool when a job needs it. Nothing here loads at opening.
const PLUGINS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..", // dist/ (or src/ under vitest alias)
  "plugins",
);

interface ProfileFile {
  _tools?: Record<string, string[]>;
  _skills?: string[];
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
  /** B41: the granted local plugins — folder, absolute path, and its skills as `<plugin>:<skill>`. */
  plugins?: GrantedPlugin[];
}

export interface GrantedPlugin {
  name: string;
  path: string;
  skills: string[];
}

/** A granted `_skills` name that is a plugin folder under `pluginsDir`: a bare folder name with a
 *  `.claude-plugin/plugin.json`. Anything else — a skill name, a path, a missing folder — is no plugin. */
function grantedPlugin(name: string, pluginsDir: string): GrantedPlugin | null {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) return null;
  // Sol's pass (B41, 2026-10-13): a folder with a valid name may still be a link out of the root.
  // The plugin's REAL path must sit directly under the REAL root, each skill's real path under the
  // plugin's — the path handed to the SDK (and to the Read rule) is the real one.
  let path: string;
  try {
    const root = realpathSync(pluginsDir);
    path = realpathSync(join(pluginsDir, name));
    if (dirname(path) !== root) return null;
    if (!existsSync(join(path, ".claude-plugin", "plugin.json"))) return null;
    if (!inside(realpathSync(join(path, ".claude-plugin", "plugin.json")), path)) return null;
  } catch {
    return null;
  }
  let skills: string[] = [];
  try {
    skills = readdirSync(join(path, "skills"), { withFileTypes: true })
      .filter((e) => {
        const dir = join(path, "skills", e.name);
        try {
          const real = realpathSync(dir);
          return inside(real, path) && existsSync(join(real, "SKILL.md")) && inside(realpathSync(join(real, "SKILL.md")), path);
        } catch {
          return false;
        }
      })
      .map((e) => `${name}:${e.name}`)
      .sort();
  } catch {
    return null;
  }
  return skills.length > 0 ? { name, path, skills } : null;
}

/** `child` is strictly inside `parent` (both real, absolute paths). */
function inside(child: string, parent: string): boolean {
  const r = relative(parent, child);
  return r !== "" && !r.startsWith("..") && !isAbsolute(r) && !r.split(sep).includes("..");
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

export interface SdkToolOptions {
  mcpServers: RuntimeToolSurface["mcpServers"];
  allowedTools: string[];
  disallowedTools: string[];
  strictMcpConfig: true;
  /** B41: the built-in tools the seat may use — empty unless a plugin is granted. */
  tools: string[];
  plugins: { type: "local"; path: string }[];
  skills: string[];
}

/** R2.3 (moved from the orchestrator worker-shim so BOTH spawn paths share
 *  it): compiled surface + full inventory → SDK session options. Allowed =
 *  the profile's grant set; disallowed = every OTHER inventory tool (stripped
 *  from model context — F-04 'görünmez'); strictMcpConfig pins the session to
 *  exactly the mounted servers. */
export function buildSdkToolOptions(
  surface: RuntimeToolSurface,
  inventory: string[],
  opts: { cwd?: string } = {},
): SdkToolOptions {
  const allowed = new Set(surface.allowedTools);
  const plugins = surface.plugins ?? [];
  // B41: a granted plugin brings exactly two built-ins — Skill, to open one of its skills, and Read,
  // allowed only inside the plugin's own folder (`//` = an absolute path in a permission rule), for
  // the files a skill points to. Measured live 2026-10-13 in the company isolation: a Read there
  // succeeded, /etc/hostname and the repository were refused. No plugin → the old empty surface.
  // Sol's pass: the CLI also lets Read in the call's working folder without asking — so that folder is
  // denied by rule (a deny outranks every allow), leaving the plugin folders as the only readable place.
  const builtins = new Set<string>();
  if (plugins.length > 0) builtins.add("Skill").add("Read");
  for (const p of plugins) builtins.add(`Read(/${p.path}/**)`);
  return {
    mcpServers: surface.mcpServers,
    allowedTools: [...new Set([...allowed, ...[...builtins].filter((t) => t !== "Read")])].sort(),
    disallowedTools: [
      ...inventory.filter((t) => !allowed.has(t)),
      ...(plugins.length > 0 ? [`Read(/${resolve(opts.cwd ?? process.cwd())}/**)`] : []),
    ].sort(),
    strictMcpConfig: true,
    tools: plugins.length > 0 ? ["Read", "Skill"] : [],
    plugins: plugins.map((p) => ({ type: "local" as const, path: p.path })),
    skills: plugins.flatMap((p) => p.skills),
  };
}

/** Resolve the compiled tool surface for one employee. `profilesDir` is
 *  injectable for tests; production uses the compiler's output directory. */
export function resolveRuntimeProfile(
  employee: { slug: string; department: string },
  profilesDir: string = PROFILES_DIR,
  pluginsDir: string = PLUGINS_DIR,
): RuntimeToolSurface {
  const overlay = readProfile(join(profilesDir, `${employee.slug}.employee.mcp.json`));
  const dept = overlay ? null : readProfile(join(profilesDir, `${employee.department}.mcp.json`));
  const profile = overlay ?? dept;
  if (!profile) {
    return { source: "none", mcpServers: {}, allowedTools: [], grantedPairs: [], plugins: [] };
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
  const plugins = [...new Set(profile._skills ?? [])]
    .map((name) => grantedPlugin(name, pluginsDir))
    .filter((p): p is GrantedPlugin => p !== null);
  return {
    source: overlay ? "employee" : "department",
    mcpServers,
    allowedTools: allowedTools.sort(),
    grantedPairs: grantedPairs.sort(),
    plugins,
  };
}
