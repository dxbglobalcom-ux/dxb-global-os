# Stop hook: can it refuse the end of a turn, with what JSON, and what is the ceiling?

Run: LIGHT (prose doctrine, no gate). Shape: FACT question with a decisive number (the ceiling).
Date: 2026-09-16. Machine: this one. Claude Code installed: **2.1.273**
(`/home/dxb/.local/share/claude/versions/2.1.273`, ELF binary, 219 MB).

## Answer in one line

Yes — at the `Stop` event a hook refuses the END OF THE TURN with `{"decision":"block","reason":"…"}`
(or exit code 2 + stderr). The ceiling is **8 consecutive blocks**; the 9th is overridden and the
turn ends. `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` moves the ceiling.

## Evidence

| # | type | source | what it says |
|---|---|---|---|
| E1 | primary-doc | `https://code.claude.com/docs/en/hooks.md` — HTTP **200**, 251 848 chars, fetched 2026-09-16 | Stop decision control table: `decision:"block"` "prevents Claude from stopping"; `reason` "Required when decision is block"; `hookSpecificOutput.additionalContext` = non-error feedback. Stop input: *"Claude Code overrides the hook and ends the turn after 8 consecutive blocks."* Universal: `continue:false` + `stopReason` "stops processing entirely… Takes precedence over any event-specific decision fields". |
| E2 | code | installed binary 2.1.273, byte offset 203145450 | `let Eo=a.CLAUDE_CODE_STOP_HOOK_BLOCK_CAP??8;if(Eo>0&&Mo>Eo)return … yield jt("A hook blocked the turn from ending ${Mo} consecutive times — overriding and ending turn. For Stop/SubagentStop hooks, check stop_hook_active in the input and return success while it's true. Set CLAUDE_CODE_STOP_HOOK_BLOCK_CAP to raise this limit.","warning")` — and `if(Me&&Jt>Me) … max_turns` is checked BEFORE the cap. |
| E3 | code | same binary, offset 198844140 (`c_e` hook-output parser) | `if(U.continue===!1){B.preventContinuation=!0; if(U.stopReason)B.stopReason=U.stopReason}` · `case"block": B.blockingError={blockingError:e.reason\|\|"Blocked by hook"}` — so a missing `reason` does not crash; it becomes the literal string `Blocked by hook`. The Stop loop returns `{reason:"stop_hook_prevented"}` when `preventContinuation` is set. |
| E4 | independent-test | `claude -p "Reply with the single word OK…" --settings <always-block hook> --model claude-haiku-4-5` | Hook fired **9 times**. Invocation 1 `stop_hook_active=false`, invocations 2–9 `stop_hook_active=true`. 8 blocks honoured, the 9th overridden, exit 0. Log: `scratchpad/stophook-test/stop-input.jsonl`. |
| E5 | independent-test | same command with `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP=2` | Hook fired **3 times** → cap N = N honoured blocks, hook is called N+1 times. `result.num_turns=4`, `subtype=success`. Log: `scratchpad/stophook-test2/`. |
| E6 | primary-doc | `raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md` (head = 2.1.273) line 3065, under `## 2.1.143` | *"Fixed stop hooks that block repeatedly looping forever — the turn now ends with a warning after 8 consecutive blocks (override via `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`)"*. `additionalContext` for Stop arrived in **2.1.163** (line 2630). Prompt-based stop hooks: **2.0.30**. |
| E7 | first-hand | GitHub issue search `repo:anthropics/claude-code stop_hook_active` — **56 results** | #78121 (closed, 2026-07-16) "Stop hook re-fires despite stop_hook_active: true, causing /goal loop to spin"; #94041 (open, 2026-09-13) "Native /goal Stop hook re-fires indefinitely with no way to acknowledge a hold"; #86569 (closed) "SubagentStop decision:block is silently discarded when the agent has a structured output schema". |

## The shapes

```json
{"decision": "block", "reason": "Run the test suite before you finish."}
```
```json
{"hookSpecificOutput": {"hookEventName": "Stop", "additionalContext": "Please run the test suite before finishing"}}
```
```json
{"continue": false, "stopReason": "Build failed — stop."}
```
Exit code 2 with text on stderr is equivalent to `reason`.

## What would flip the answer

The version. Below 2.1.143 there is no ceiling at all (E6) — the loop was infinite, which is why the
cap exists. `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP=0` disables the ceiling again (`Eo>0` in E2) — **now tested
live, see E11 below**: the loop was made safe by putting the bound in the HOOK (block 12 times,
then allow) instead of in Claude Code.

## Where I did not look

- SubagentStop not tested live; docs (E1) and the shared code path (E2) say the same cap applies.
- Prompt-type Stop hooks (`/goal`) not tested; E7 reports them re-firing.
- `scrapling fetch` (browser) is broken on this machine — Playwright Chromium missing at
  `~/.cache/ms-playwright/chromium-1223/`; plain HTTP `get` was used instead.
- The override warning string exists in the binary (E2) but did **not** appear in `--output-format
  stream-json` output; only `{"subtype":"notification","key":"stop-hook-error"}` did. In headless
  runs you do not see the warning text.


---

# SECOND RUN — independent re-measurement, run `20260916-211640`

Ordered by the CEO as a fresh `dxb-research` run at its own default standard (LIGHT).
It did not read the block above; it reproduced it from the binary, the changelog, the docs and
four live sessions. **Everything above reproduced.** Three things are new, and one gap is closed.

| # | type | source | what it says |
|---|---|---|---|
| E8 | code | binaries **2.1.271, 2.1.272 and 2.1.273** | `let …=a.CLAUDE_CODE_STOP_HOOK_BLOCK_CAP??8;if(…>0&&…>…)return` — byte-identical logic in all three installed versions. The default has not moved. |
| E9 | independent-test | `claude -p --settings <always-block> --model claude-haiku-4-5`, default cap | Hook fired **9 times**; the session transcript carries the override verbatim: *"A hook blocked the turn from ending 9 consecutive times — overriding and ending turn."* `num_turns=10`, `terminal_reason=completed`, `total_cost_usd=0.066`. |
| E10 | independent-test | same, `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP=2`, session **resumed with a second user prompt** | Calls 1–2 blocked, call 3 allowed; call 4 arrived with `stop_hook_active=false` and blocks 4–5 were honoured again. **The counter is per TURN, not per session — a new user prompt resets it.** |
| E11 | independent-test | same, `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP=0`, hook bounded at 12 blocks by itself | **12 consecutive blocks all honoured**, no override; the loop ended only because the hook stopped blocking on call 13. `0` = no ceiling. Closes the gap E2 left open. |
| E12 | code | binary 2.1.273 offset 198844366, parser `c_e` | `case"block": B.blockingError={blockingError: e.reason \|\| "Blocked by hook", command:n}` · `if(U.continue===!1){B.preventContinuation=!0; …}` · any other `decision` value **throws**: `Unknown hook decision type: … Valid types are: approve, block`. |
| E13 | primary-doc | `raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md`, line 2851 under `## 2.1.143` | *"Fixed stop hooks that block repeatedly looping forever — the turn now ends with a warning after 8 consecutive blocks (override via `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`)"*. Below 2.1.143 there is **no** ceiling — that is the contradiction behind every guide that says the loop is infinite. |
| E14 | primary-doc | `docs.claude.com/en/docs/claude-code/hooks`, Stop section | *"Claude Code overrides the hook and ends the turn after 8 consecutive blocks."* `additionalContext` "keeps the conversation going through the same loop protections as `decision: "block"`, namely the `stop_hook_active` input and the 8-consecutive-continuation cap". |
| E15 | secondary ×3 | `startdebugging.net`, `blakecrosley.com`, an `anthropics/claude-code` docs issue | Three unconnected third parties give the same number, the same env var and the same 2.1.143 origin. No source anywhere in 31 evidence rows gives a different ceiling. |

## The arithmetic, stated exactly
`cap = N` ⇒ **N blocks are obeyed; the hook is called N+1 times; the (N+1)th block is refused.**
Measured at N=8 (9 calls), N=2 (3 calls), N=0 (12 calls, refusal never came).

## One earlier note refined
The first run wrote that the override warning "did not appear in `--output-format stream-json`
output". That stands for the STREAM. It is not absent: the warning is written into the session
transcript, and `grep` on
`~/.claude/projects/<project>/<session-id>.jsonl` returns it word for word.

## Run record
Ledger `.claude/skills/dxb-research/runs/20260916-211640/` — 31 evidence rows, 267 discovery
rows, 18 clusters, max channel share 0.167, 0 dead URLs cited. Holes: `GAPS.md` in the same
folder (2 pages that defeated all 11 reading doors; SubagentStop and `/goal` not driven to the
ceiling). Live-test cost on this machine: **$0.13** total, Haiku 4.5, four sessions.
