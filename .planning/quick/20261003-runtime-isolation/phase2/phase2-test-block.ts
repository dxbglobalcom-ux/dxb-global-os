
// ── Phase 2 — the critical gate's Codex (CEO 2026-10-03, option (b): the company's own login) ──
// Measured that day: run from ~/.codex, the gate's challengers loaded the construction's global
// Codex notes (AGENTS.md) and started its MCP servers; `--ignore-user-config`, `--ignore-rules` and
// `-c project_doc_max_bytes=0` left the notes in; a clean CODEX_HOME holding only a login dropped
// both. Every runtime launch of `codex` must therefore name the company's own home.

/** Every `execFile`/`spawn` of the literal "codex" in one file, and whether its env names the company home. */
function codexLaunches(file: string): Site[] {
  const text = readFileSync(file, "utf8");
  if (!text.includes('"codex"')) return [];
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const rel = relative(REPO, file);
  const out: Site[] = [];
  const visit = (n: ts.Node): void => {
    if (
      ts.isCallExpression(n) &&
      ts.isIdentifier(n.expression) &&
      ["execFile", "execFileSync", "spawn", "spawnSync"].includes(n.expression.text) &&
      n.arguments[0] &&
      ts.isStringLiteral(n.arguments[0]) &&
      n.arguments[0].text === "codex"
    ) {
      const opts = n.arguments.find((a) => ts.isObjectLiteralExpression(a)) as ts.ObjectLiteralExpression | undefined;
      const env = opts?.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === "env");
      const isolated = !!env && /CODEX_HOME:\s*companyCodexHome\(/.test(env.getText(sf));
      out.push({ where: `${rel}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}`, isolated });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

describe("company isolation — the critical gate's Codex runs from the company's own home", () => {
  const launches = runtimeSources().flatMap(codexLaunches);

  it("finds the gate's codex launch (one on 2026-10-03)", () => {
    expect(launches.length).toBeGreaterThanOrEqual(1);
  });

  it("every runtime launch of codex sets CODEX_HOME to companyCodexHome()", () => {
    expect(launches.filter((s) => !s.isolated).map((s) => s.where)).toEqual([]);
  });

  it("the real runner hands a stand-in codex the company home, never the construction's ~/.codex", async () => {
    const box = mkdtempSync(join(tmpdir(), "company-codex-"));
    try {
      const bin = join(box, "bin");
      mkdirSync(bin);
      // The stand-in answers like `codex exec -o <file>`: it writes what it was handed, so no model is called.
      writeFileSync(
        join(bin, "codex"),
        '#!/usr/bin/env bash\nwhile [ $# -gt 0 ]; do [ "$1" = "-o" ] && out="$2"; shift; done\nprintf \'{"codex_home":"%s"}\' "$CODEX_HOME" > "$out"\n',
      );
      chmodSync(join(bin, "codex"), 0o755);
      const home = join(box, "company-codex");
      const { codexRunner, companyCodexHome } = await import("../../packages/orchestrator/src/critical-gate.js");
      const saved = { PATH: process.env.PATH, HOME_: process.env.DXB_COMPANY_CODEX_HOME };
      process.env.PATH = `${bin}:${process.env.PATH}`;
      process.env.DXB_COMPANY_CODEX_HOME = home;
      try {
        expect(companyCodexHome()).toBe(home);
        const res = await codexRunner({ model: "stand-in", prompt: "p", timeoutMs: 10_000 });
        expect(res.ok).toBe(true);
        expect(JSON.parse((res as { raw: string }).raw)).toEqual({ codex_home: home });
      } finally {
        process.env.PATH = saved.PATH;
        if (saved.HOME_ === undefined) delete process.env.DXB_COMPANY_CODEX_HOME;
        else process.env.DXB_COMPANY_CODEX_HOME = saved.HOME_;
      }
      // with no override, the company home is its own place — not the construction's ~/.codex
      expect(companyCodexHome({} as NodeJS.ProcessEnv)).toBe(join(homedir(), ".local", "share", "dxb", "company-codex"));
    } finally {
      rmSync(box, { recursive: true, force: true });
    }
  });
});
