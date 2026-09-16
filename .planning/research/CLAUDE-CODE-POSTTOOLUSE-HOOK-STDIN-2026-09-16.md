# PostToolUse hook stdin payload — Claude Code (measured 2026-09-16)

Question: which fields does a PostToolUse hook receive on stdin, and which one carries the tool's result?
Run class: FACTUAL/CONTRACT. Mode: LIGHT (no money out, nothing leaves the house).
Local version under test: `claude 2.1.273` (`/home/dxb/.local/share/claude/versions/2.1.273`).
Research runs: `20260916-211134`-adjacent probe (first pass, one tool) and **`20260916-212801`** (this pass —
22-channel sweep, three-tool live capture, binary envelope list). Ledger rows `L0210`–`L0213`.

## Answer

A PostToolUse hook receives **one JSON object on stdin**: the envelope every hook event shares, plus five
PostToolUse-specific fields. **`tool_response` carries the tool's result.**

### Measured live, 2.1.273 — the exact 12 keys, identical for Write, Read and Bash

```
session_id · transcript_path · cwd · scratchpad_dir · prompt_id · permission_mode ·
hook_event_name · tool_name · tool_input · tool_response · tool_use_id · duration_ms
```

| field | door | note |
|---|---|---|
| `session_id` | live + docs + binary | |
| `transcript_path` | live + docs + binary | written asynchronously; may lag the current turn |
| `cwd` | live + docs + binary | |
| `scratchpad_dir` | live + docs + binary envelope list | v2.1.257+; absent when the session has no scratchpad |
| `prompt_id` | live + docs + binary | v2.1.196+; absent before the first user prompt |
| `permission_mode` | live + docs + binary | `default` / `plan` / `acceptEdits` / `auto` / `dontAsk` / `bypassPermissions` |
| `effort` `{level}` | docs + binary | only when the model supports effort — **absent in both measured runs (haiku-4.5)** |
| `agent_id`, `agent_type` | docs + binary | only inside a subagent / `--agent` session |
| `served_call`, `caller_session_id` | **binary only** | in the binary's envelope allow-list; **not** in the docs' common-fields table |
| `hook_event_name` | live + docs + binary | `"PostToolUse"` |
| `tool_name` | live + docs + binary | |
| `tool_input` | live + docs + binary | the arguments sent to the tool |
| **`tool_response`** | **live + docs + binary** | **the tool's result; the shape depends on the tool** |
| `tool_use_id` | live + docs + binary | `toolu_…` |
| `duration_ms` | live + docs + binary | optional; excludes permission-prompt and PreToolUse-hook time |

### `tool_response` measured, three tools, one session

| tool | `tool_response` exactly as delivered |
|---|---|
| `Bash` | `{"stdout":"DXBPROBE","stderr":"","interrupted":false,"isImage":false,"noOutputExpected":false}` |
| `Write` | `{"type":"create","filePath":"…/a.txt","content":"hello","structuredPatch":[],"originalFile":null,"userModified":false}` |
| `Read` | `{"type":"text","file":{"filePath":"…/a.txt","content":"hello","numLines":1,"startLine":1,"totalLines":1}}` |

The envelope is fixed; `tool_response` is not. A hook that reads it must key on `tool_name` first.

## Evidence

**E1 — independent-test, decisive (ledger `L0210`, `L0213`).** A throwaway settings file with a `PostToolUse`
hook whose command is `cat > <file>`, run through a real headless session in an isolated config — the CEO's own
settings were never touched:
`claude -p "…" --settings <tmp>/settings.json --allowedTools Bash Write Read --permission-mode bypassPermissions --model claude-haiku-4-5-20251001`
Three payloads captured (Write, Read, Bash), 12 identical top-level keys in each, `tool_response` different in each.
Raw captures: `<session scratchpad>/hooktest*/posttooluse-*.json` (session-local, not committed).

**E2 — code, the shipped binary, not a description of it (ledger `L0211`, `L0212`).** `grep -a` + `dd` on the
219 MB executable, byte offset 190 653 509, returns the zod schema:

```
Pie=f(()=>ve().and(u({hook_event_name:R("PostToolUse"),tool_name:o(),tool_input:ae(),
  tool_response:ae(),tool_use_id:o(),duration_ms:E().optional()
  .describe("Tool execution time in milliseconds. Excludes permission-prompt and hook time.")})))
```

and the payload builder: `let B={...al(d.session,…),hook_event_name:"PostToolUse",tool_name:e,tool_input:r,
tool_response:s,tool_use_id:n,duration_ms:O}`. The shared base `ve()` =
`{session_id, transcript_path, cwd, prompt_id?, permission_mode?, agent_id?, agent_type?, effort?}`.
At byte offset 189 716 465 the binary carries its own envelope allow-list:

```
Jr=["hook_event_name","session_id","transcript_path","cwd","scratchpad_dir","prompt_id",
    "permission_mode","agent_id","agent_type","served_call","caller_session_id","effort"]
```

**E3 — primary-doc (ledger `L0198`, `L0200`; read by scrapling, 251 847 B).** `https://code.claude.com/docs/en/hooks`
— "Common input fields" table and "#### PostToolUse input": *"The input includes both `tool_input`, the arguments
sent to the tool, and `tool_response`, the result it returned. The exact schema for both depends on the tool."*

**E4 — third-party code, independent of Anthropic (ledger `L0203`).** The Go library
`github.com/krmcbride/claudecode-hooks/pkg/hook` declares `ToolResponse map[string]any \`json:"tool_response"\``
inside `PostToolUseInput`. Somebody outside the vendor reads the same field off stdin.

## Neighbours worth knowing — where the field is NOT called `tool_response`

- **`PostToolUseFailure`** — a FAILED tool has **no `tool_response`**; the result arrives as a top-level
  **`error`** string, plus `is_interrupt` and `duration_ms`. This is the trap in the question.
- **`PreToolUse`** — `tool_name`, `tool_input`, `tool_use_id` only. The result does not exist yet.
- **`PostToolBatch`** — fires once per batch with `tool_calls[]`, each `{tool_name, tool_input, tool_use_id,
  tool_response?}`; there `tool_response` is the **serialized `tool_result` content the model sees**, NOT
  PostToolUse's structured object. Docs, verbatim: *"`PostToolUse` passes the tool's structured `Output` object …
  `PostToolBatch` passes the serialized `tool_result` content the model sees."*
- Tool-specific shapes the docs name beyond the three measured: `ExitPlanMode` → `tool_response.plan` +
  `filePath` · `Bash` with bash-edit-diff on → `tool_response.bashEditDiff`, the changed-file list (v2.1.269+,
  **repository-scoped — it did not appear in the measured run, which wrote outside any git repo**) ·
  foreground `Agent` → the subagent's result plus run telemetry.

## Contradiction — RESOLVED this run, and what was deleted

The first pass left standing: *"docs and the live payload both carry `scratchpad_dir`; the binary's hook zod base
`ve()` does not declare it."* **That contradiction is closed.** The binary does carry it — not in the zod base,
but in the envelope allow-list `Jr` at byte offset 189 716 465, read verbatim above. The earlier paragraph has been
deleted rather than kept beside the finding (LAW A). The same read also surfaced two fields in the binary's
envelope that the documentation's common-fields table does not list: `served_call` and `caller_session_id`.

## Reading chain / doors walked · channel coverage

Sweep `20260916-212801`, tier `wide`: **22 channels opened, 18 worked, 2 returned empty, 2 FAILED** —
`duckduckgo` and `v2ex` both died on `duckduckgo search navigation failed: Nav…`; `hackernews` and
`stackoverflow` answered but returned nothing, and their declared fallback (`google`) had already run.
195 discovery rows, 14 pages read out of 14 attempted (scrapling 12 · scrapling-stealth 1 · jina-reader 1),
48 clusters. The `dxb-cost-gate` hook refused a wide-window binary regex — a correct refusal, given the
2026-08-17 25 GB incident; the read was redone bounded with `grep -b` + `dd`.

**Classifier note, left visible rather than corrected silently:** the ledger typed `code.claude.com/docs/en/hooks`
as `vendor`, because the domain belongs to the maker. For THIS question the maker's documentation is the
primary document — the `vendor` rule exists to stop a vendor's *comparison* claim, not its own API contract.

## Where I did NOT look

Three tools measured (Bash, Write, Read), on Linux, on 2.1.273, main thread, one model. Not measured by me:
MCP-tool `tool_response` shapes · the `Agent`, `ExitPlanMode` and `bashEditDiff` shapes (docs only) ·
`agent_id`/`agent_type`/`effort` actually arriving (no subagent run, and haiku-4.5 reports no effort) ·
`served_call`/`caller_session_id` actually arriving (binary string only — **⚠ UNVERIFIED as a live field**) ·
Windows path behaviour · HTTP (non-command) hooks, which receive the same JSON as a POST body.
