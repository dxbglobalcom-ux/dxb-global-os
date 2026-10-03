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
// The tools a seat holds are still the compiled gateway profile (R2.2), passed explicitly.
// `DXB_WORKER_ISOLATION=0` is the rollback shape (the pre-2026-09-05 behaviour).
export interface SdkIsolation {
  settingSources: never[];
  settings: { autoMemoryEnabled: false };
  persistSession: false;
  strictMcpConfig: true;
  cwd: string;
}

export function companyIsolation(env: NodeJS.ProcessEnv = process.env): SdkIsolation | null {
  if (env.DXB_WORKER_ISOLATION === "0") return null;
  return {
    settingSources: [],
    settings: { autoMemoryEnabled: false },
    persistSession: false,
    strictMcpConfig: true,
    cwd: env.DXB_REPO_ROOT ?? process.cwd(),
  };
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
        log(`[isolation] lane=${lane} session=${session} ${loaded} hooks=${hooks} input=${input}`);
      }
    } catch {
      // the line is lost; the company's answer is not
    }
  };
}
