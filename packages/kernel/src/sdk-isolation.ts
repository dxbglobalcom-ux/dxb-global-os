import { existsSync, readlinkSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve, sep } from "node:path";

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
// The parent's CLAUDE* variables never reach a company call: a construction shell's CLAUDECODE /
// CLAUDE_CODE_* would otherwise follow it in. The CLI's own built-in residue stays, named in the job's
// done-list: a listing of ~/.claude/ide, lookups of two absent files, rg reading ~/.config/git/ignore.
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

/**
 * The company's own Claude home (CLAUDE_CONFIG_DIR) — `~/.local/share/dxb/company-claude`;
 * `DXB_COMPANY_CLAUDE_HOME` moves it, never onto the construction's: a home that is `~/.claude`,
 * lies inside it, or reaches it through a link is refused, so the lane fails closed instead of
 * running from the construction's login, settings and peer registry (as companyCodexHome() does
 * for the gate's Codex).
 */
export function companyClaudeHome(env: NodeJS.ProcessEnv = process.env): string {
  const home = env.DXB_COMPANY_CLAUDE_HOME ?? join(homedir(), ".local", "share", "dxb", "company-claude");
  const theirs = realPath(join(homedir(), ".claude"));
  const ours = realPath(resolve(home));
  if (ours === theirs || ours.startsWith(`${theirs}${sep}`)) {
    throw new Error(`the company Claude home ${home} is the construction's Claude home (${theirs}) or lies inside it — no company call runs from there`);
  }
  return home;
}

export function companyIsolation(env: NodeJS.ProcessEnv = process.env): SdkIsolation | null {
  if (env.DXB_WORKER_ISOLATION === "0") return null;
  const home = companyClaudeHome(env);
  const work = join(home, "work");
  const inherited: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (v !== undefined && !k.startsWith("CLAUDE")) inherited[k] = v;
  }
  return {
    settingSources: [],
    settings: { autoMemoryEnabled: false },
    persistSession: false,
    strictMcpConfig: true,
    cwd: work,
    env: { ...inherited, CLAUDE_CONFIG_DIR: home, XDG_CACHE_HOME: join(home, "cache"), PWD: work },
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
