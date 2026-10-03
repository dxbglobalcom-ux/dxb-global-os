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
13. `tests/governance/company-isolation.test.ts` → red on the gate without the change (2 failed: the
    env test and the stand-in runner), green with it: the only runtime launch of `codex` — in any form
    the launch ruler reads (named, namespace, promisified, a const program) — is the gate's, and the
    LAST word of its literal `env` is `CODEX_HOME: companyCodexHome()` (an environment spread after it,
    no env, an unreadable env, the construction's home, the helper given an argument: each refused);
    the real `codexRunner` hands a stand-in `codex` on PATH the company home (no model called).
14. `pnpm typecheck`, the gate's own tests (`tests/c9/critical-gate.test.ts`), `pnpm build`,
    `pnpm construction:battery`, `systemctl --user restart dxb-scheduler`; Sol audits the phase-2 diff
    (evidence: gate-probe.txt — from `~/.codex` both canaries PRESENT and an `rmcp` start-up error on
    stderr; from the company home both ABSENT, no such line; the gate's second model `gpt-5.5` answers
    there too; company-codex-login.txt — its own `auth.json`, its own inode, one link).

### After Sol's single pass (2026-10-03 14:16) — the fork's fixes

The rows are SOL-PASS2.md's "The lead's sorting". Each new counter-example is asserted by the reason the
ruler gives, not by a non-empty list — Sol ran the analysis functions directly and saw `sites=[]`,
`problems=[]`, which the old harness's "no site found" would have hidden.

15. A1 — `pnpm vitest run tests/governance/company-isolation.test.ts` → Sol's eight counter-examples
    each refused for its own reason: a computed `require` specifier → "a module the ruler cannot name";
    a `sdk` escape → the SDK site found and refused for its missing helper; the helper from
    `./fake/sdk-isolation.js` → "not the kernel's helper"; `Object.assign` on the profile → "the
    profile … handed on or changed"; a receipt shadowed by a hoisted function → "not the receipt this
    function declares"; `cp["execFile"]("codex", …)` → a launch of `codex`, refused outside the gate;
    `exec("env CODEX_HOME=… codex exec …")` → "a shell line that names claude or codex"; `...{env:
    process.env}` after a valid `env` → the last effective `env` is not the company home. Red on the
    ruler of `5de3595e`, green after. Every earlier counter-example still refused; the eight lanes found
    by name, each once; the gate's launch the only `codex` launch. Bindings are resolved by the
    TypeScript binder (`ts.createProgram` + `getTypeChecker`), module specifiers by their parsed value
    and by module resolution; `grep -cE 'text\.includes\(' tests/governance/company-isolation.test.ts`
    → 0 (no prefilter on a file's text left; the one `spec.includes(SDK)` reads a specifier's parsed
    value — corrected from the first wording, whose pattern also matched that line).
16. A2 — `companyCodexHome()` with `DXB_COMPANY_CODEX_HOME` set to `~/.codex`, to a path inside it,
    or to a link to it → throws, naming the construction's home; the real `codexRunner` under such an
    override → `ok:false` with that reason and the stand-in `codex` on PATH never runs (its marker file
    absent). Red before (the override passed through), green after.
17. A3 — the real `codexRunner` with a stand-in `codex` on PATH (it prints a `session id:` header and a
    `tokens used` footer on stderr) → exactly one line `[isolation] lane=gate model=<m> session=<id>
    home=<path> notes=<n> mcp=<n> ok=<true|false> tokens=<n>` per call, on success and on failure; a
    sink that throws leaves the result unchanged. Red before (no line), green after.
18. B1 — `connectors-probe.mjs` (resident shape): the negative variant passes `strictMcpConfig: false`
    explicitly → the account's connectors mount (init or live) and the call reads more; the helper's
    own runs mount none; `evidence/connectors-probe.txt` re-made raw.
19. B2 — `run-lanes-probe.sh`: the probe's non-zero exit, no `PROBE_DONE`, fewer session ids than its
    four receipts, or a read error in the transcript check → the script exits non-zero naming the
    reason; a clean run → exit 0; `evidence/lanes-probe.txt` re-made raw.
20. B3 — `gate-probe.sh`: the runner's own flags (`exec --skip-git-repo-check --ephemeral -s read-only
    -m <model> --output-schema <schema> -o <out> -C <dir>`); both streams kept whole in the evidence;
    both challengers from the company home, the construction's home as the control;
    `evidence/gate-probe.txt` re-made.
21. B4 — `strace -f -e trace=openat,execve` over one chat-lane run and one gate run from the company
    home, in the resident's shape → `evidence/opened-files.txt`: every file opened under `~/.claude`,
    the repo's `.claude/` and `~/.codex`, and every program executed. Expected: no CLAUDE.md,
    settings*.json, skills/, plugins/, agents/, hooks/, memory/ or projects/ transcript opened; nothing
    under `~/.codex`; no MCP server started (chat: none; gate: none). What IS opened under `~/.claude`
    (the login, `~/.claude.json`) is the shared-home finding for the CEO's report.
22. `pnpm typecheck` → exit 0; `pnpm vitest run tests/governance/company-isolation.test.ts
    tests/c9/critical-gate.test.ts` → green; `pnpm vitest run tests/b43/dispatch-book.test.ts -t
    isolation` → green.
23. The gate pins the challengers' reasoning effort: the runner's args carry
    `-c model_reasoning_effort="high"` — the level both challengers ran at from `~/.codex` before
    phase 2 (its config.toml: `model_reasoning_effort = "high"`); from the company home, which has no
    config.toml, they ran at `none` (first fork, B3). Red before, green after; `gate-probe.sh` re-run →
    both models' stderr headers read `reasoning effort: high`.
24. The gate's isolation line says `tokens=?` when the CLI's stderr has no `tokens used` footer — an
    unknown is never written as 0. Red before, green after.

### Measured where an item did not hold as written (the lead, 2026-10-03 ~15:00)

- **18 — not reproduced as written.** With `strictMcpConfig: false` the account's connectors mount
  (Claude Docs 8 tools, Kiwi.com 2 tools); with the helper's own options none mount. But all four runs
  read 466 tokens: the connectors attach after the init message, and this shape-only call ends before
  it would read them. The read difference stands on Hamza's real chat lane: 11,289 tokens with
  `tools=10 mcp=2` before `strictMcpConfig`, 2,153 with `tools=0 mcp=0` after (evidence/lanes-probe at
  83a54e7e).
- **21 — NOT MET for the chat lane; met for the gate.** Under strace the chat lane's claude CLI opened
  `<repo>/.claude/settings.json`, `<repo>/.claude/settings.local.json`, `~/.claude/settings.json`,
  `installed_plugins.json` and ten plugin-marketplace manifests. It listed the repository with `rg`
  (`.claude/` included) and wrote `~/.claude.json` and `~/.claude/sessions/<pid>.json`. None of it was
  applied: the receipt reads `tools=0 mcp=0 plugins=0 hooks=0`, the four canaries are ABSENT, and the
  init names hold no construction skill or agent. No CLAUDE.md, memory file, transcript or SKILL.md was
  opened. The gate opened nothing under `~/.claude` or the repo's `.claude/`; under `~/.codex` it opened
  only the binary's own package file. No MCP server was started in either run. Closing 21 for the chat
  lane takes a company working folder and a company Claude home — the same membership, his one login.
  That is put to the CEO under Bulunan, and it is his decision.

## Phase 3 — the company's own Claude home and working folder

His word: "ikisine de evet" (ledger isolation-phase3-plan-and-memory-path-2026-10-03; card CARD-PHASE3.md).
Written before the code (fork 5, 2026-10-03 16:53). Tests: `tests/governance/company-isolation.test.ts`.

25. The helper's shape — `companyIsolation({ DXB_COMPANY_CLAUDE_HOME: "/co", … })` equals
    `{ settingSources: [], settings: { autoMemoryEnabled: false }, persistSession: false,
    strictMcpConfig: true, cwd: "/co/work", env: { …the parent's variables without any CLAUDE*,
    CLAUDE_CONFIG_DIR: "/co", XDG_CACHE_HOME: "/co/cache", PWD: "/co/work" } }`; default home
    `~/.local/share/dxb/company-claude`. Red before (no `env`, cwd the repository), green after.
26. `companyClaudeHome()` refuses a home that is `~/.claude`, lies inside it, or reaches it through a
    link — it throws, naming the construction's home; a lane under such a setting fails closed. Red
    before (no such function), green after.
27. The parent's `CLAUDE*` variables (a construction shell's `CLAUDECODE`, `CLAUDE_CODE_*`, its own
    `CLAUDE_CONFIG_DIR`) never reach a company call; `PWD` equals `cwd`. Red before, green after.
28. A `cwd` beside the helper is refused by the ruler, as `env` already is (pinned; the ruler refused it
    before this phase — this case is green on HEAD, recorded so).
29. The receipt ends with `home=<the company Claude home>` (`refused` when refused). Red before, green after.
30. The scheduler logs one line at start — `[isolation] company-claude home=<path> credentials=present|absent`
    (`home=refused` when refused) — never a secret, never blocking or failing the start
    (`companyClaudeLoginLine()`, called from `packages/outbox-executor/src/main.ts`). The runtime may
    not launch `claude` (the ruler), so the line reads whether the login file is there; `auth status`
    is the lead's check before the restart. Red before, green after.
31. The memory router never reads the construction's claude-mem: `readObservationByRef` and
    `syncClaudeMem` refuse a database that is `~/.claude-mem/…` or reaches it through a link (named
    error, before any open); `recallMemory` holds no `claude-mem` reader. Measured before: no runtime
    caller reached the reader (`recallMemory` routes only `KIND_STORE`'s four stores; the two
    functions had no caller outside tests) — the cut makes it impossible, not merely unused. Red
    before, green after; `tests/phase6/adapters-roundtrip.test.ts` (fixture databases) unchanged.
32. After his login, the phase-3 strace probe (`phase3-strace-probe.sh`, refusing to run while
    `auth status` says `loggedIn: false`) over Hamza's chat lane and the task lane → nothing under
    `<repo>/.claude/`; nothing of `~/.claude` settings*, `plugins/`, `sessions/` or `projects/`; no
    write to `~/.claude.json` or under `~/.cache/claude-cli-nodejs/`; the residue named, not hidden:
    the `~/.claude/ide` listing, the consent-file and `~/.config/anthropic` lookups, `rg` reading
    `~/.config/git/ignore`. Receipts unchanged (chat `tools=0 mcp=0`, task `tools=24 mcp=1`), now with
    `home=`; canaries ABSENT.
33. `CLAUDE_CONFIG_DIR=<home> <bundled claude> auth status` → `"loggedIn": true` before
    `dxb-scheduler` is restarted; its JSON (no secret in it) in evidence/.
