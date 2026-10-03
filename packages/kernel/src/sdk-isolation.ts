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
// The tools a seat holds are still the compiled gateway profile (R2.2), passed explicitly.
// `DXB_WORKER_ISOLATION=0` is the rollback shape (the pre-2026-09-05 behaviour).
export interface SdkIsolation {
  settingSources: never[];
  settings: { autoMemoryEnabled: false };
  persistSession: false;
  cwd: string;
}

export function companyIsolation(env: NodeJS.ProcessEnv = process.env): SdkIsolation | null {
  if (env.DXB_WORKER_ISOLATION === "0") return null;
  return {
    settingSources: [],
    settings: { autoMemoryEnabled: false },
    persistSession: false,
    cwd: env.DXB_REPO_ROOT ?? process.cwd(),
  };
}

interface StreamMessage {
  type?: string;
  subtype?: string;
  tools?: unknown[];
  mcp_servers?: unknown[];
  plugins?: unknown[];
  usage?: { input_tokens?: number; cache_creation_input_tokens?: number; cache_read_input_tokens?: number };
}

/**
 * One journal line per company model call — what the run loaded and what it read — so the resident
 * itself proves the separation (`journalctl --user -u dxb-scheduler | grep '\[isolation\]'`).
 * Feed it every message of the stream; it speaks once, at the result.
 */
export function isolationReceipt(lane: string, log: (line: string) => void = console.log): (msg: unknown) => void {
  let loaded = "tools=? mcp=? plugins=?";
  return (msg) => {
    const m = msg as StreamMessage;
    if (m.type === "system" && m.subtype === "init") {
      loaded = `tools=${m.tools?.length ?? 0} mcp=${m.mcp_servers?.length ?? 0} plugins=${m.plugins?.length ?? 0}`;
    } else if (m.type === "result") {
      const u = m.usage ?? {};
      const input = (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
      log(`[isolation] lane=${lane} ${loaded} input=${input}`);
    }
  };
}
