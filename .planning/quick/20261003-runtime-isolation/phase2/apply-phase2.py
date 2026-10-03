# Phase 2 of the isolation job: the critical gate's Codex runs from the company's own home.
import os

R = "/home/dxb/DxB Global OS"
S = os.path.dirname(os.path.abspath(__file__))  # phase2-test-block.ts sits beside this script

def edit(rel, reps):
    p = os.path.join(R, rel)
    s = open(p, encoding="utf-8").read()
    for a, b in reps:
        n = s.count(a)
        assert n == 1, (rel, a[:80], n)
        s = s.replace(a, b)
    open(p, "w", encoding="utf-8").write(s)
    print(rel, "ok")

edit("packages/orchestrator/src/critical-gate.ts", [
    ('import { tmpdir } from "node:os";', 'import { homedir, tmpdir } from "node:os";'),
    ("""/**
 * Default transport: `codex exec` in subscription mode.
""", """/**
 * The company's own Codex home (CEO 2026-10-03, option (b): "B önerisini de yapalım … kodeksle
 * ilgili") — the company's own login and nothing of the construction's `~/.codex`. Measured that
 * day: from `~/.codex` the gate's challengers loaded the construction's global Codex notes
 * (`AGENTS.md`) and started its MCP servers; `--ignore-user-config`, `--ignore-rules` and
 * `-c project_doc_max_bytes=0` left the notes in; a clean `CODEX_HOME` holding only a login dropped
 * both. `DXB_COMPANY_CODEX_HOME` moves it.
 */
export function companyCodexHome(env: NodeJS.ProcessEnv = process.env): string {
  return env.DXB_COMPANY_CODEX_HOME ?? join(homedir(), ".local", "share", "dxb", "company-codex");
}

/**
 * Default transport: `codex exec` in subscription mode, from the company's own Codex home.
"""),
    ("""        { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024 },""",
     """        { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024, env: { ...process.env, CODEX_HOME: companyCodexHome() } },"""),
])

edit("packages/orchestrator/src/index.ts", [
    ('export { runCriticalGate, codexRunner, CRITICAL_GATE_CONFIG } from "./critical-gate.js";',
     'export { runCriticalGate, codexRunner, companyCodexHome, CRITICAL_GATE_CONFIG } from "./critical-gate.js";'),
])

# the ruler grows its phase-2 block
p = os.path.join(R, "tests/governance/company-isolation.test.ts")
s = open(p, encoding="utf-8").read()
s = s.replace(
    'import { readFileSync, readdirSync, statSync } from "node:fs";\nimport { join, relative } from "node:path";\n',
    'import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";\nimport { homedir, tmpdir } from "node:os";\nimport { join, relative } from "node:path";\n',
    1,
)
assert "chmodSync" in s
s = s.rstrip("\n") + "\n" + open(os.path.join(S, "phase2-test-block.ts"), encoding="utf-8").read()
open(p, "w", encoding="utf-8").write(s)
print("tests/governance/company-isolation.test.ts ok")
