import { existsSync, readlinkSync, realpathSync } from "node:fs";
import { userInfo } from "node:os";
import { basename, dirname, isAbsolute, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

// THE COMPANY'S MODEL CALLS ARE THE COMPANY'S, NOT THE CONSTRUCTION'S (CEO 2026-10-03: "evet tabi
// hamza ve herşey herkes inşaattan ayrı olmalı ya!"; B43 plan ② before it, 2026-09-05).
//
// The Agent SDK loads EVERY filesystem settings source when `settingSources` is omitted ("matches
// CLI defaults", sdk.d.ts), and the residents run from the repository root. Measured 2026-10-03
// from that directory (SDK 0.3.259): a call holding only `tools: []` — Hamza's chat and voice
// lanes — loaded both CLAUDE.md files, the construction's auto-memory index, the SessionStart
// hook's text, five MCP servers and 58 MCP tools (a browser, web fetch): 44,306 input tokens.
// `settingSources: []` alone — the task lane since 2026-09-05 — still loaded the auto-memory index,
// which follows the working directory, not the settings sources (4,237 tokens). With
// `settings: { autoMemoryEnabled: false }` as well, the call read 476 tokens and nothing of the
// construction. `persistSession: false` keeps the company's runs out of the construction's
// transcript folder (~/.claude/projects/<cwd>/), where they would be summed as construction spend.
//
// `strictMcpConfig: true` keeps out the claude.ai account's own connectors, which no settings source
// governs. Measured 2026-10-03 in the scheduler's own shape (connectors-probe.mjs): without it a
// tool-less call mounted "claude.ai Claude Docs" (8 tools) and "claude.ai Kiwi.com" (2 tools) and
// read 9,686 tokens — and on a cold start they connected only AFTER the init message, so the run's
// own init said mcp=0 while the model held them; with it, none in either run, 466 tokens.
//
// Phase 3 (CEO 2026-10-03, "ikisine de evet"): the call runs in the company's own Claude home and
// working folder. Measured under strace that day: with `settingSources: []` the CLI still OPENED the
// construction's settings files and plugin manifests (none applied), listed the repository with rg
// from its working directory, and wrote ~/.claude.json and its peer-registry entry under
// ~/.claude/sessions/. With CLAUDE_CONFIG_DIR, an empty working folder (PWD matching it) and
// XDG_CACHE_HOME of its own, the login, the global config, the peer registry and the MCP debug log
// all live in the company home, and nothing of the repository is listed. The same membership — his
// one login in that home; a home without it answers "Not logged in" and never falls back to ~/.claude.
// Sol's single pass on phase 3 refuted the first shape: the env was the parent's minus CLAUDE*, so every
// other path-moving variable followed the call in (GIT_CONFIG_GLOBAL=<repo>/.claude/…/SKILL.md reached
// the file); the home check took the repository, a relative value and links out of work/ or cache/;
// and the construction's own folders were derived from $HOME. Now the env is an ALLOWLIST (COMPANY_ENV
// below) and HOME is the company home too — so the CLI's built-in look-ups (~/.claude/ide,
// ~/.config/anthropic, rg's ~/.config/git/ignore), the residue phase 3 first had to name, fall inside
// it; the home is absolute, canonical, outside both the construction's ~/.claude and the repository,
// and its parts stay inside it; the construction's folders come from the passwd entry (os.userInfo()).
//
// The tools a seat holds are still the compiled gateway profile (R2.2), passed explicitly.
// `DXB_WORKER_ISOLATION=0` is the rollback shape (the pre-2026-09-05 behaviour).
export interface SdkIsolation {
  settingSources: never[];
  settings: { autoMemoryEnabled: false };
  persistSession: false;
  strictMcpConfig: true;
  cwd: string;
  env: Record<string, string>;
}

/** The path with every link resolved — through parts that do not exist yet and through a dangling link. */
function realPath(p: string, depth = 0): string {
  try {
    return realpathSync(p);
  } catch {
    // not there (yet), or a link whose target is not there
  }
  if (depth > 40) return p;
  try {
    return realPath(resolve(dirname(p), readlinkSync(p)), depth + 1);
  } catch {
    // not a link
  }
  const parent = dirname(p);
  return parent === p ? p : join(realPath(parent, depth + 1), basename(p));
}

/** The repository, from this module's own place (packages/kernel/{src,dist}/) — never from the cwd. */
const REPOSITORY = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** `p` is `root`, lies inside it, or holds it — both already canonical. */
const overlaps = (p: string, root: string): boolean =>
  p === root || p.startsWith(`${root}${sep}`) || root.startsWith(p === sep ? sep : `${p}${sep}`);

/** The parts of a Claude home the CLI uses; each must resolve inside the home. */
const HOME_PARTS = ["work", "cache", ".claude.json", ".credentials.json"] as const;

/**
 * The company's own Claude home (CLAUDE_CONFIG_DIR, and HOME for the call) — by default
 * `~/.local/share/dxb/company-claude`; `DXB_COMPANY_CLAUDE_HOME` moves it. Returned canonical (every
 * link resolved). Refused, so the lane fails closed instead of running from the construction's login,
 * settings and peer registry (as companyCodexHome() does for the gate's Codex): an empty or relative
 * value; a home that is, lies inside or holds the construction's `~/.claude` (the passwd home's, never
 * $HOME) or the repository; a home whose work/, cache/, .claude.json or .credentials.json leads
 * outside it through a link.
 */
export function companyClaudeHome(env: NodeJS.ProcessEnv = process.env): string {
  const user = userInfo().homedir;
  const home = env.DXB_COMPANY_CLAUDE_HOME ?? join(user, ".local", "share", "dxb", "company-claude");
  if (!home || !isAbsolute(home)) {
    throw new Error(`the company Claude home "${home}" is not an absolute path — a relative one resolves elsewhere in the child`);
  }
  const ours = realPath(home);
  const theirs = realPath(join(user, ".claude"));
  if (overlaps(ours, theirs)) {
    throw new Error(`the company Claude home ${home} is the construction's Claude home (${theirs}), lies inside it or holds it — no company call runs from there`);
  }
  const repository = realPath(REPOSITORY);
  if (overlaps(ours, repository)) {
    throw new Error(`the company Claude home ${home} is the repository (${repository}), lies inside it or holds it — no company call runs from there`);
  }
  for (const part of HOME_PARTS) {
    const at = realPath(join(ours, part));
    if (!at.startsWith(`${ours}${sep}`)) {
      throw new Error(`the company Claude home ${home}: its ${part} leads outside it (${at}) — no company call runs from there`);
    }
  }
  return ours;
}

/**
 * The company's memory drawer (CEO 2026-10-04, company-memory-drawer-2026-10-04): the scheduler binds
 * DXB_MEMORY_ROOT to the company Claude home before any lane runs — always, overwriting whatever the
 * process inherited (Sol's single pass, B2: an inherited value is not validated). Every company Claude
 * child inherits it through the DXB_* allowlist below, so the dxb-mcp child — working in the home's
 * `work` folder — reads and writes the same notes as the scheduler's own recall. Only main.ts calls
 * this; the battery never runs main.ts and keeps its own root through vitest's env. Never throws: a
 * refused home DELETES the root, and memory-router then refuses every note.
 */
export function ensureCompanyMemoryRoot(env: NodeJS.ProcessEnv = process.env): string | undefined {
  try {
    env.DXB_MEMORY_ROOT = companyClaudeHome(env);
  } catch {
    // the home was refused — companyClaudeLoginLine says so; memory stays refused
    delete env.DXB_MEMORY_ROOT;
  }
  return env.DXB_MEMORY_ROOT;
}

/**
 * What a company call may take from the parent's environment — an allowlist (Sol's single pass on
 * phase 3, A2). The locale, PATH and temp, the terminal and the user's name; the proxy and the CA
 * certificates; LITELLM_BASE_URL (read by @dxb/shared's llmCall/llmEmbed inside the dxb-mcp child);
 * DXB_* — the database URLs and the departments' LiteLLM keys the dxb-mcp child needs — except the
 * home's own knob. Nothing else: no HOME, XDG_*, GIT_*, NODE_OPTIONS, ANTHROPIC_*, CLAUDE*.
 */
const COMPANY_ENV = new Set([
  "PATH", "TMPDIR", "LANG", "TERM", "TZ", "USER", "LOGNAME", "SHELL",
  "HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "no_proxy", "all_proxy",
  "NODE_EXTRA_CA_CERTS", "LITELLM_BASE_URL",
]);
const companyEnvName = (k: string): boolean =>
  COMPANY_ENV.has(k) || k.startsWith("LC_") || k.startsWith("SSL_CERT_") || (k.startsWith("DXB_") && k !== "DXB_COMPANY_CLAUDE_HOME");

export function companyIsolation(env: NodeJS.ProcessEnv = process.env): SdkIsolation | null {
  if (env.DXB_WORKER_ISOLATION === "0") return null;
  const home = companyClaudeHome(env);
  const work = join(home, "work");
  const carried: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (v !== undefined && companyEnvName(k)) carried[k] = v;
  }
  return {
    settingSources: [],
    settings: { autoMemoryEnabled: false },
    persistSession: false,
    strictMcpConfig: true,
    cwd: work,
    env: { ...carried, CLAUDE_CONFIG_DIR: home, HOME: home, XDG_CACHE_HOME: join(home, "cache"), PWD: work },
  };
}

/**
 * The scheduler's start-up line: whether the company Claude home holds a login file. The runtime may
 * not launch `claude` (the isolation ruler), so this reads only that the file is there — never its
 * content; `auth status` is the lead's check before a restart. Never throws.
 */
export function companyClaudeLoginLine(env: NodeJS.ProcessEnv = process.env): string {
  try {
    const home = companyClaudeHome(env);
    return `[isolation] company-claude home=${home} credentials=${existsSync(join(home, ".credentials.json")) ? "present" : "absent"}`;
  } catch {
    return "[isolation] company-claude home=refused credentials=absent";
  }
}

interface StreamMessage {
  type?: unknown;
  subtype?: unknown;
  session_id?: unknown;
  tools?: unknown;
  mcp_servers?: unknown;
  plugins?: unknown;
  skills?: unknown;
  agents?: unknown;
  usage?: { input_tokens?: unknown; cache_creation_input_tokens?: unknown; cache_read_input_tokens?: unknown };
}

const count = (v: unknown): number => (Array.isArray(v) ? v.length : 0);
const tokens = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/**
 * One line per company model call — what the run loaded and what it read — so the resident itself
 * proves the separation. The scheduler's stdout is `var/scheduler.log` (the unit's
 * `StandardOutput=append:`; the journal carries only systemd's own lines):
 * `grep '\[isolation\]' var/scheduler.log`. `session=` is the run's own id, so "no transcript was
 * left" is checked by name — `~/.claude/projects/<any>/<session>.jsonl` and `<session>/` absent.
 * `home=` is the company Claude home the call ran from (phase 3; `refused` when it was refused).
 * `hooks=` counts the hooks that started: SessionStart hooks are always streamed (sdk.d.ts
 * `includeHookEvents`), and a leaking run fired the construction's.
 *
 * Feed it every message of the stream; it speaks once, at the result. It is a witness, never a
 * participant: whatever a message holds or the sink throws, the call's own answer is untouched
 * (Sol, 2026-10-03: a throwing sink stopped a successful answer).
 */
export function isolationReceipt(lane: string, log: (line: string) => void = console.log): (msg: unknown) => void {
  let session = "?";
  let loaded = "tools=? mcp=? plugins=? skills=? agents=?";
  let hooks = 0;
  return (msg) => {
    try {
      if (!msg || typeof msg !== "object") return;
      const m = msg as StreamMessage;
      if (session === "?" && typeof m.session_id === "string" && m.session_id) session = m.session_id;
      if (m.type === "system" && m.subtype === "init") {
        loaded =
          `tools=${count(m.tools)} mcp=${count(m.mcp_servers)} plugins=${count(m.plugins)}` +
          ` skills=${count(m.skills)} agents=${count(m.agents)}`;
      } else if (m.type === "system" && m.subtype === "hook_started") {
        hooks += 1;
      } else if (m.type === "result") {
        const u = m.usage && typeof m.usage === "object" ? m.usage : {};
        const input =
          tokens(u.input_tokens) + tokens(u.cache_creation_input_tokens) + tokens(u.cache_read_input_tokens);
        let home = "refused";
        try {
          home = companyClaudeHome();
        } catch {
          // a refused home is the call's own error
        }
        log(`[isolation] lane=${lane} session=${session} ${loaded} hooks=${hooks} input=${input} home=${home}`);
      }
    } catch {
      // the line is lost; the company's answer is not
    }
  };
}
