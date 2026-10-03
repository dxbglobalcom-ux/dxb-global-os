# Done-list — the company's model calls are separate from the construction

The CEO, 2026-10-03: "evet tabi hamza ve herşey herkes inşaattan ayrı olmalı ya!" — and on the
Codex gate: "B önerisini de yapalım. Şeyle ilgili, kodeksle ilgili." ((b): the company's own Codex
login.) The plan went to him once, in Turkish, in the conversation of session 5ed74ad7.

Measured before (2026-10-03, `scratchpad/leak-probe*.mjs`, cwd = the residents' WorkingDirectory,
SDK 0.3.259, from the lead's session environment):

| options | loaded from the construction | input tokens (input + cache) |
|---|---|---|
| Hamza's lanes as they stand (`tools: []`, nothing else) | project + global CLAUDE.md, auto-memory index, the SessionStart hook's text, 5 MCP servers, 58 MCP tools (playwright incl. `browser_run_code_unsafe`, scrapling fetch), the claude-mem plugin | 44,306 |
| the task lane's `workerIsolation()` (`settingSources: []`) | the auto-memory index (`~/.claude/projects/-home-dxb-DxB-Global-OS/memory/MEMORY.md`) | 4,237 |
| + `settings: { autoMemoryEnabled: false }` | nothing | 476 |

The critical gate's `codex exec` (gate flags, temp cwd) loads `~/.codex/AGENTS.md` (the construction's
global Codex notes) and starts the base config's MCP servers; `--ignore-user-config`,
`--ignore-rules` and `-c project_doc_max_bytes=0` leave the notes in; a clean `CODEX_HOME` holding
only the login drops the notes and starts no MCP server.

## Phase 1 — the SDK lanes

1. `pnpm vitest run tests/governance/company-isolation.test.ts` BEFORE the code change → FAILS,
   naming the call sites without `companyIsolation()` (all eight: answer, chat-drain, decompose,
   council, classify, workflow executor, worker-shim, qa). AFTER → passes: every `query()` call in
   `packages/*/src` and `apps/*/src` spreads `companyIsolation()` into its options and its stream
   loop feeds `isolationReceipt(<lane>)`.
2. Same file, the helper's own cases → `companyIsolation({DXB_REPO_ROOT:"/r"})` equals
   `{ settingSources: [], settings: { autoMemoryEnabled: false }, persistSession: false, cwd: "/r" }`;
   `DXB_WORKER_ISOLATION=0` → `null`; the receipt prints exactly one line per result:
   `[isolation] lane=<lane> tools=<n> mcp=<n> plugins=<n> input=<input+cache>`.
3. `pnpm vitest run tests/b43/dispatch-book.test.ts -t "isolation"` → passes on the new shape.
4. `node .planning/quick/20261003-runtime-isolation/probe.mjs` (options taken from the BUILT
   `packages/kernel/dist/sdk-isolation.js`) → `input < 1000`, `tools=0 mcp=0 plugins=0`, and the
   canaries "anti-baby-sitting", "Hitap protokol", "graphify", "THE CUPBOARD" all ABSENT.
5. `pnpm typecheck` → exit 0.
6. `pnpm test` → green, or exactly the failures that are red on 1d492949 too (named, unchanged).
7. `pnpm build` → exit 0; the built `chat-drain.js`, `answer.js`, `decompose.js`, `council.js`,
   `classify.js`, `executor.js`, `worker-shim.js`, `qa.js` each contain `companyIsolation`.
8. `systemctl --user restart dxb-scheduler` → `active`; its journal shows a clean start.
   `dxb-jarvis` is NOT started: it has been stopped and disabled since 2026-09-14 10:15 — the voice
   lane's fix takes effect on the day it is switched on.
9. Resident proof: the next company model call writes
   `[isolation] lane=<lane> tools=0 mcp=0 plugins=0 input=<n>` (tool-less lanes) into
   `journalctl --user -u dxb-scheduler`, and no new `sdk-*` transcript appears under
   `~/.claude/projects/-home-dxb-DxB-Global-OS/` after the restart. ⚠ UNVERIFIED until a call
   happens; the chat lane at his first chat after the restart.
10. Sol (`refuter.sh --card CARD.md`, `high`) → no open A or B finding.

## Phase 2 — the Codex gate (after his login)

11. `CODEX_HOME=<company home> codex login status` → logged in, through his own login (no link to
    the construction's `~/.codex/auth.json`).
12. The gate probe in the company home (gate flags, temp cwd) → the global notes ABSENT, no MCP
    server started (stderr has no `rmcp`/`mcp` line).
13. `tests/governance/company-isolation.test.ts` → every runtime `execFile("codex", …)` passes an
    `env` whose `CODEX_HOME` is the company home; the construction's `~/.codex` is never used.
14. `pnpm typecheck`, the gate's own tests, `pnpm build`, `systemctl --user restart dxb-scheduler`;
    Sol re-checks the phase-2 diff.
