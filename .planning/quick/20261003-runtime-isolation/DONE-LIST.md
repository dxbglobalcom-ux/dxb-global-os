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
   `{ settingSources: [], settings: { autoMemoryEnabled: false }, persistSession: false,
   strictMcpConfig: true, cwd: "/r" }`; `DXB_WORKER_ISOLATION=0` → `null`; the receipt prints exactly
   one line per result: `[isolation] lane=<lane> session=<id> tools=<n> mcp=<n> plugins=<n> skills=<n>
   agents=<n> hooks=<n> input=<input+cache>`; a sink that throws and messages of any shape pass through
   it without touching the call (`not.toThrow`).
3. `pnpm vitest run tests/b43/dispatch-book.test.ts -t "isolation"` → passes on the new shape.
4. `node .planning/quick/20261003-runtime-isolation/probe.mjs` (options taken from the BUILT
   `packages/kernel/dist/sdk-isolation.js`) → `input < 1000`, `tools=0 mcp=0 plugins=0`, and the
   canaries "anti-baby-sitting", "Hitap protokol", "graphify", "THE CUPBOARD" all ABSENT.
   (Its `mcp=0` was read from the init message alone, which cannot see the claude.ai account's
   connectors: on a cold start they attach after it — measured in item 2c, closed by
   `strictMcpConfig: true`.)
5. `pnpm typecheck` → exit 0.
6. `pnpm test` → green, or exactly the failures that are red on 1d492949 too (named, unchanged).
7. `pnpm build` → exit 0; the built `chat-drain.js`, `answer.js`, `decompose.js`, `council.js`,
   `classify.js`, `executor.js`, `worker-shim.js`, `qa.js` each contain `companyIsolation`.
8. `systemctl --user restart dxb-scheduler` → `active`; its journal shows a clean start. The
   scheduler itself drains Hamza's voice calls and chat messages (`packages/outbox-executor/src/
   scheduler.ts:679`, `:690`), so both of his lanes run the isolated code from this restart.
   `dxb-jarvis` — the always-on wake daemon — is NOT started: it has been stopped and disabled since
   2026-09-14 10:15. (Corrected after the restart: the first wording said the voice lane waited for
   dxb-jarvis; the scheduler's own drain was measured.)
9. Live proof, made rather than waited for — the company had made no model call since the restart,
   nor for weeks (`cost_ledger` last 2026-09-05, one chat 2026-09-27; company engine, SELECT only).
   `bash .planning/quick/20261003-runtime-isolation/run-lanes-probe.sh <out>` runs the BUILT code of
   Hamza's chat lane (its resident drain, `drainChatMessages`) and of the task lane (its SDK owner,
   `defaultExecutor`, for seat `finance-financial-analyst`, which holds the company's `dxb-mcp`) in
   the resident's own shape — a transient user unit with the scheduler's WorkingDirectory and env
   files, no CLAUDE*/ANTHROPIC* variable — against the construction engine → receipts
   `lane=chat … tools=0 mcp=0 plugins=0 … hooks=0` and `lane=task … tools=24 mcp=1` (the 23 granted
   tools and StructuredOutput: the company's tools kept); the init names hold no construction skill,
   agent, slash command or plugin, and no server beyond the lane's own at init or live; canaries
   ABSENT in both answers; for every run's own session id: no file named for it under `~/.claude`, no
   transcript holding it, not in `~/.claude.json`; the rows the lanes wrote into the construction
   engine removed (counts before = clean). The scheduler's stdout is `var/scheduler.log` (the unit's
   `StandardOutput=append:`; the journal carries systemd's lines only): the resident's own first
   receipt lands there at the company's next call. ⚠ UNVERIFIED until that call happens.
10. Sol (`refuter.sh --card CARD.md`, `high`) → no open A or B finding.

### After Sol's first pass (2026-10-03 13:12 — card raised to critical; the re-check runs at `xhigh`)

10a. The ruler is fail-closed: `pnpm vitest run tests/governance/company-isolation.test.ts` → the eight
   lanes found by name (`chat classify council decompose qa task voice workflow`, each once); no SDK
   import or use of `query` it cannot follow; each of Sol's counter-examples refused for its own reason —
   a namespace import, `require()`, `import()`, a re-export, an alias, `query` handed on as a value;
   options reopening what the helper closed (`settingSources`, `settings`, `persistSession` through a
   conditional spread, an unreadable spread, `env`, `plugins`, `resume`, `mcpServers` not from the
   compiled profile, a computed key); the helper switched off by its argument or missing; options not
   a literal; a receipt named only in a comment, fed after the result can leave, given its own sink, or
   bound to a stream not held in a `const`; a helper that is not the kernel's. A runtime launch of
   `claude` is refused in every form (named, namespace, default import, promisified, held in a const,
   a shell line, a program it cannot name beside a claude/codex string, `require("child_process")`, a
   launcher handed on).
10b. A sink that throws never touches the call (item 2), so a successful answer is never lost to the
   journal.
10c. `node .planning/quick/20261003-runtime-isolation/connectors-probe.mjs` (resident shape) → without
   `strictMcpConfig` the claude.ai account's connectors mount — "claude.ai Claude Docs" (8 tools) and
   "claude.ai Kiwi.com" (2 tools), the first time only AFTER the init message — and the call reads
   9,686 tokens; with it, none at init or live in either run, 466 tokens. Hamza's real chat lane read
   11,289 tokens with `tools=10 mcp=2` before, 2,153 with `tools=0 mcp=0` after (evidence/lanes-probe).
10d. The managed-policy tier, which `settingSources: []` does not govern: `/etc/claude-code` does not
   exist on this machine (machine-specific).

## Phase 2 — the Codex gate (after his login)

11. `CODEX_HOME=<company home> codex login status` → logged in, through his own login (no link to
    the construction's `~/.codex/auth.json`).
12. The gate probe in the company home (gate flags, temp cwd) → the global notes ABSENT, no MCP
    server started (stderr has no `rmcp`/`mcp` line).
13. `tests/governance/company-isolation.test.ts` → every runtime `execFile("codex", …)` passes an
    `env` whose `CODEX_HOME` is the company home; the construction's `~/.codex` is never used.
14. `pnpm typecheck`, the gate's own tests, `pnpm build`, `systemctl --user restart dxb-scheduler`;
    Sol re-checks the phase-2 diff.
