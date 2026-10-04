# Report for the lead: Item 2 (how employees get tools) and Item 4 (who handles a locked tool)

Everything below is read-only. Nothing was changed.

## ITEM 2 — Per-job tools and Hamza's access to Claude's tools

**Measured**
- **Tool search is on by default.** In the native CLI 2.1.259 (`…linux-x64@0.3.259/claude`, byte offset ~180518122), `D7e()` returns `"tst"` (tool search) when `ENABLE_TOOL_SEARCH` is unset. The variable accepts `true`, `auto` or `auto:N`. Tool search is turned off only when the host is not a first-party Anthropic host, or `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` is set, or a HIPAA mode is on.
  - `ANTHROPIC_*` is not carried into company calls (`sdk-isolation.ts:134-141`), so the host is first-party.
- **Per-server and per-tool opt-out exists:** `alwaysLoad` / "Default: tools are deferred when tool search is enabled" (`sdk.d.ts:524-531`, `:1084`).
- **The likely reason it does not work today.** Deferred tools are loaded through a built-in tool named `ToolSearch` (binary: `var Xs="ToolSearch",Ome="DeferredToolPlaceholder"`). `tools: []` turns off every built-in, which would include it (`worker-shim.ts:377`). That fits the measured 24 tools ≈ 9.4k tokens in `lanes-probe.txt:18`. **UNVERIFIED:** it needs one probe with `tools: ['ToolSearch']`.
- **The 17 bundled skills can be removed** through Settings `disableBundledSkills` (`sdk.d.ts:5912-5914`). The `settings` object is already passed at `sdk-isolation.ts:158`.
  - The skill filter `skills: string[]` (`sdk.d.ts:2072-2093`) says "omitted ≠ off". Whether `[]` means "none" is UNVERIFIED.
- **The 5 built-in agents may be removable** with `CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS` (a bool in `sdk.mjs`). Its effect is UNVERIFIED.
  - `CLAUDE_CODE_DISABLE_EXPLORE_PLAN_AGENTS` also exists.
  - The company env allowlist strips every `CLAUDE*` variable (`sdk-isolation.ts:141-145`). Either variable would have to be added to the explicit env map at `:163`.
- **Where the employee is chosen:** `assignEmployee` (`worker-shim.ts:594-627`) picks the least-busy active seat in the department. `resolveExecutionRoute` (`:189-225`) reads that seat.
- **Where the tool list is built:** `worker-shim.ts:305-309` → `resolveRuntimeProfile` + `buildSdkToolOptions` (`runtime-profile.ts:66-117`).
  - The `tasks` table has no tool column (`information_schema` query: 25 columns).
  - The envelope is written at `dispatch.ts:57-60`.
  - A server whose granted list is empty is not mounted at all (`runtime-profile.ts:99`).
- **Plugins can be loaded without the construction's `~/.claude`:** `plugins: [{type:'local', path, skipMcpDiscovery}]` (`sdk.d.ts:1862-1874`, `4818-4831`). It needs no `settingSources`.
  - The company home has no `plugins/` folder (`ls`: `.claude.json`, `.credentials.json`, `backups`, `cache`, `sessions`, `work`).
- **Fences available in the SDK:**
  - `canUseTool` (`sdk.d.ts:1454`), `hooks` (`:1595`) and `permissionPrompts:'none'` (`:1853-1857`) are policy checks. They see a Bash command as a string, which can be phrased around.
  - `sandbox.filesystem.{denyRead,denyWrite,allowWrite}` (`sdk.d.ts:2017`, `3107-3113`) is the enforced wall (bwrap).
- **Secret locations, names only.** They share Hamza's user ID (UID), so all are readable to him today:
  - `~/.ssh`, `~/.gnupg`, `~/.config`
  - the repository's `.env` and `.env.daemon`
  - `~/.claude/.credentials.json`
  - the company home's `.credentials.json` and `.claude.json`
- **Env leak:** `DXB_*` (the database URLs and the departments' LiteLLM keys, per the comment at `sdk-isolation.ts:134-137`) is in the Claude child's env. A Hamza with Bash can print it with `env`.
- **Conflict with the earlier design:** his live sentence ("tüm becerilerini … istediği zaman") contradicts the July 17/19 design, in which Hamza only talks (`chat-drain.ts:123`, `tools: []`). By the authority order his live word wins; this is reported, not silently chosen.

**Proposal**
1. **Narrow per job, never widen.** Add an optional `tools` list to the decompose envelope and the `tasks` row. At `worker-shim.ts:307`, intersect it with the seat's profile (the profile stays the ceiling). Servers left empty are then neither mounted nor loaded.
2. **Defer everything.** Pass `tools: ['ToolSearch']` plus `ENABLE_TOOL_SEARCH=true` in the explicit env so schemas load only when needed. Measure with one probe first.
3. **Trim the init payload.** Set `settings.disableBundledSkills: true`, pass the agents env variable explicitly, and confirm by the init line (`skills=0 agents=0`).
4. **Hamza with built-ins, fenced.** Give him built-ins plus local plugins and skills only in the chat lane, where the CEO is talking.
   - Use `sandbox` with `denyRead` on the secret paths above and `denyWrite` on the repository, plus `permissionPrompts:'none'`.
   - Move the `DXB_*` secrets into `mcpServers[...].env` so only the dxb-mcp child sees them.
   - Unattended 24/7 lanes keep `tools: []`.
5. **Plugin installation.** Plugins are placed in `company-claude/plugins/` as a construction act (the runtime may not launch `claude`) and are loaded via the `plugins` option.

**CEO decisions**
| # | Decision | Recommendation |
|---|---|---|
| 1 | Should a job carry its own tool list, narrowing the department's list? | Yes |
| 2 | Should Hamza get Claude's built-in tools in chat while you are talking to him? | Yes, fenced |
| 3 | Should the 24/7 unattended lanes get them too? | No, for now |
| 4 | Should secret files and writing into the construction's folder stay closed to Hamza? | Yes |

**Risks**
- Fetched web or file content can carry instructions (prompt injection). The fences above limit what a fooled Hamza could read or write.
- Tool search adds one search round per tool use.
- The bwrap sandbox on this machine is not measured for this lane.

**Size:** steps 1–3 are about 1 day plus probes. Step 4 is about 1–2 days plus a Sol audit.

## ITEM 4 — A locked tool: who is alerted and who resolves it

**Measured**
- **What locks a tool:** the daily 04:00 check (`scheduler.ts:139-141`) re-hashes every tool. A tool whose text changed is re-approved only if the repository vouches for the new text (our own dxb-mcp source, or `db/seed/tool-pins.manifest.json`). Otherwise it is quarantined (`drift-review.ts:5-15`, `judgeDrift` `:49-57`).
  - The check is deterministic: "no model can make a tool clean."
- **Who is alerted:** the `alerts` table — `high` "Tool locked …", plus the audit row (`pin-check.ts:136-160`). It is shown on the dashboard's `/alerts` page.
  - `alerts.responsible_employee` exists, but it is null in 13 of 13 rows and nothing in `packages/` writes it (grep).
- **What re-approves it:** only a human. Quarantine is sticky and lifted only by "SQL by CEO decision" (`pin-check.ts:8-10`).
- **Today:** 76 pins on 5 servers, 0 quarantined, and 0 alerts about tool pins.
- **Seats that could own the alert:**
  - `security-engineer` already owns MCP-definition and supply-chain review (`personas/security/security-engineer.md:56,62,68`).
  - `platform/infrastructure-maintainer` and `platform-head` also exist.
  - All are `active` in the database, but their persona files say `dormant` / `draft` (persona `:44`).
  - Both the security and platform profiles carry 23 `dxb-mcp` tools.
- **Conflict between two sentences of the same day:** `drift-review.ts:1-3` records "he must hear when one is [locked]"; his question of 2026-10-01 says the alert should go to whoever fixes it, not to him.

**Proposal**
1. Set `responsible_employee = 'security-engineer'` on pin alerts at `pin-check.ts:137` and open a task for that seat.
2. The seat reads the audit row's old and new text as data only. It writes a `json_schema` verdict (the existing format) and drafts the manifest entry.
   - It cannot touch `tool_pins`: none of its 23 tools write pins.
3. Automatic unlock happens only in the deterministic case: once the manifest later carries the new hash, the next check lifts the quarantine and writes an audit row. This is the one code change to the sticky rule.
4. A manifest change is a repository commit that the construction's lead verifies. Re-approval never comes from the seat's verdict.
5. **What still reaches the CEO:** a tool that stays locked for more than 72 h, a lock that blocks his approved work, or a verdict of "malicious". Everything else becomes a single informational line.

**How the injection risk is contained:** the suspect tool is already out of every profile. A fooled seat can write a wrong recommendation, but it cannot unlock anything. The deterministic hash check stays the only judge.

**CEO decisions**
| # | Decision | Recommendation |
|---|---|---|
| 1 | Should a lock alert go to the security seat instead of to you, with you hearing only the escalations above? | Yes |
| 2 | Should a tool unlock automatically when the repository's manifest vouches for the new text? | Yes |
| 3 | Should the seat be allowed to unlock a tool on its own verdict? | No |

**Risks**
- The seat writes a manifest entry that a human then approves without reading it.
- The persona status mismatch (files say `dormant`/`draft`, database says `active`).

**Size:** about 1 day of code and tests, plus a Sol audit.