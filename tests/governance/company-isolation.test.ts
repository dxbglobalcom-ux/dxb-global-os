// Every company model call runs with nothing of the construction loaded (CEO 2026-10-03:
// "evet tabi hamza ve herşey herkes inşaattan ayrı olmalı ya!").
//
// Measured that day from the residents' working directory (SDK 0.3.259): a `query()` holding only
// `tools: []` — Hamza's chat and voice lanes — loaded both CLAUDE.md files, the auto-memory index,
// the SessionStart hook's text, five MCP servers and 58 MCP tools (44,306 input tokens); the task
// lane's `settingSources: []` still loaded the auto-memory index (4,237); with
// `settings: { autoMemoryEnabled: false }` the call read 476 tokens and nothing of the construction.
// This ruler holds every `query()` in the company's runtime code to `companyIsolation()` and to its
// one-line receipt, so a new call site cannot quietly reopen the leak.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const REPO = join(import.meta.dirname, "..", "..");
const SDK = "@anthropic-ai/claude-agent-sdk";

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === "__tests__") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name) && !/\.(test|spec)\.tsx?$/.test(name) && !name.endsWith(".d.ts")) out.push(p);
  }
}

/** The company's runtime source: every package's and app's `src/`, tests excluded. */
function runtimeSources(): string[] {
  const out: string[] = [];
  for (const top of ["packages", "apps"]) {
    for (const pkg of readdirSync(join(REPO, top))) {
      const src = join(REPO, top, pkg, "src");
      try {
        if (statSync(src).isDirectory()) walk(src, out);
      } catch {
        // a package without src/ holds no runtime call
      }
    }
  }
  return out;
}

interface Site {
  where: string;
  isolated: boolean;
}

/** Every call of the SDK's `query` in one file, and whether its options spread `companyIsolation()`. */
function sdkQuerySites(file: string): { file: string; sites: Site[]; receipt: boolean } {
  const text = readFileSync(file, "utf8");
  const rel = relative(REPO, file);
  if (!text.includes(SDK)) return { file: rel, sites: [], receipt: false };
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const names = new Set<string>();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier) || st.moduleSpecifier.text !== SDK) continue;
    const nb = st.importClause?.namedBindings;
    if (nb && ts.isNamedImports(nb)) {
      for (const el of nb.elements) if ((el.propertyName ?? el.name).text === "query") names.add(el.name.text);
    }
  }
  const sites: Site[] = [];
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && names.has(n.expression.text)) {
      const arg = n.arguments[0];
      let isolated = false;
      if (arg && ts.isObjectLiteralExpression(arg)) {
        const opts = arg.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === "options");
        if (opts && ts.isPropertyAssignment(opts) && ts.isObjectLiteralExpression(opts.initializer)) {
          isolated = opts.initializer.properties.some(
            (p) => ts.isSpreadAssignment(p) && /\bcompanyIsolation\(/.test(p.expression.getText(sf)),
          );
        }
      }
      sites.push({ where: `${rel}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}`, isolated });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { file: rel, sites, receipt: /\bisolationReceipt\(/.test(text) };
}

describe("company isolation — the ruler over every company model call (CEO 2026-10-03)", () => {
  const callers = runtimeSources()
    .map(sdkQuerySites)
    .filter((r) => r.sites.length > 0);

  it("finds the company's query() call sites (eight on 2026-10-03)", () => {
    expect(callers.flatMap((r) => r.sites).length).toBeGreaterThanOrEqual(8);
  });

  it("every query() spreads companyIsolation() into its options", () => {
    expect(callers.flatMap((r) => r.sites).filter((s) => !s.isolated).map((s) => s.where)).toEqual([]);
  });

  it("every file that calls query() writes the one-line receipt", () => {
    expect(callers.filter((r) => !r.receipt).map((r) => r.file)).toEqual([]);
  });
});

describe("companyIsolation() and its receipt", () => {
  const helper = () => import("../../packages/kernel/src/sdk-isolation.js");

  it("shuts out filesystem settings (hooks, plugins, MCP, CLAUDE.md), the auto-memory and the transcript", async () => {
    const { companyIsolation } = await helper();
    expect(companyIsolation({ DXB_REPO_ROOT: "/r" } as NodeJS.ProcessEnv)).toEqual({
      settingSources: [],
      settings: { autoMemoryEnabled: false },
      persistSession: false,
      cwd: "/r",
    });
  });

  it("DXB_WORKER_ISOLATION=0 is the rollback shape", async () => {
    const { companyIsolation } = await helper();
    expect(companyIsolation({ DXB_WORKER_ISOLATION: "0" } as NodeJS.ProcessEnv)).toBeNull();
  });

  it("prints one line per result — the lane, what the run loaded, what it read", async () => {
    const { isolationReceipt } = await helper();
    const lines: string[] = [];
    const see = isolationReceipt("chat", (line) => lines.push(line));
    see({ type: "system", subtype: "init", tools: [], mcp_servers: [], plugins: [] });
    see({ type: "assistant", message: { content: [] } });
    see({
      type: "result",
      subtype: "success",
      usage: { input_tokens: 4, cache_creation_input_tokens: 400, cache_read_input_tokens: 72 },
    });
    expect(lines).toEqual(["[isolation] lane=chat tools=0 mcp=0 plugins=0 input=476"]);
  });

  it("names what a leaking run loaded, so the journal shows it", async () => {
    const { isolationReceipt } = await helper();
    const lines: string[] = [];
    const see = isolationReceipt("voice", (line) => lines.push(line));
    see({
      type: "system",
      subtype: "init",
      tools: ["mcp__playwright__browser_navigate", "mcp__scrapling__fetch"],
      mcp_servers: [{ name: "playwright", status: "connected" }, { name: "scrapling", status: "connected" }],
      plugins: [{ name: "claude-mem", path: "/x" }],
    });
    see({ type: "result", subtype: "success", usage: { input_tokens: 44_306 } });
    expect(lines).toEqual(["[isolation] lane=voice tools=2 mcp=2 plugins=1 input=44306"]);
  });
});
