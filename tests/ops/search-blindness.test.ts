// THE SEARCH TOOL MUST SEE `.planning` AND `.claude`.
//
// Measured 2026-08-17: `rg -l "NEXT:" .` did not list
// .planning/research/rival-intel/00-LEDGER.md, whose fourth line reads "**NEXT: 28**".
// ripgrep skips dot-directories by default and this project keeps its state, its
// rival ledger and its doors inside two of them. Plain `grep -rl` was measured the
// same minute and finds all three files, so the blindness is ripgrep's alone.
//
// Fixed mechanically — .ripgreprc passes --hidden, and .claude/settings.json points
// every session in this project at it. This case keeps both halves alive; delete
// either and the battery goes red instead of a later sweep going quietly blind.
//
// The behaviour itself is deliberately NOT asserted here: Claude Code replaces `rg`
// with a shell function wrapping its own bundled binary, so `rg` is not on PATH and
// a test process cannot invoke the same tool a session uses. Proven by hand instead,
// the same session: without the config 0 hits under .planning, with it 3.
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("search blindness — .planning and .claude stay reachable", () => {
  it("the repository ships a ripgrep config that opens dot-directories", () => {
    const rc = join(process.cwd(), ".ripgreprc");
    expect(existsSync(rc), ".ripgreprc is gone — every session's rg goes blind to .planning again").toBe(true);
    const body = readFileSync(rc, "utf8");
    expect(body, ".ripgreprc no longer passes --hidden").toMatch(/^--hidden$/m);
    expect(body, ".ripgreprc no longer excludes the git object store").toMatch(/^--glob=!\.git\/$/m);
  });

  it("the harness loads it for every session, and the path it names really exists", () => {
    const settings = JSON.parse(readFileSync(join(process.cwd(), ".claude/settings.json"), "utf8"));
    const configured = settings.env?.RIPGREP_CONFIG_PATH;
    expect(
      configured,
      "settings.json no longer sets RIPGREP_CONFIG_PATH — the config exists and nothing loads it",
    ).toMatch(/\.ripgreprc$/);
    // The second half exists because the first attempt at this fix BROKE rg for a
    // whole session: the value was written as "${CLAUDE_PROJECT_DIR}/.ripgreprc" and
    // the harness passed that string through unexpanded, so every rg call printed
    // "failed to read the file specified in RIPGREP_CONFIG_PATH" and silently fell
    // back to the blind default. A path that does not resolve is worse than no path.
    expect(
      existsSync(configured),
      `RIPGREP_CONFIG_PATH points at ${configured}, which does not exist — rg will warn and fall back to skipping dot-directories. Unexpanded placeholders like \${CLAUDE_PROJECT_DIR} are the known cause`,
    ).toBe(true);
  });
});
