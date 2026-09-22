# EVIDENCE — the session-opening job, 2026-09-22 (board row B52)

`var/` is gitignored, so the full working notes
(`var/measure/startup-budget-baseline-2026-09-22.md`, `var/measure/context-budget-2026-09-22.md`)
are not in the repository. **This note is where the numbers enter it.** Every figure below was
measured on 2026-09-22 by the ruler `scripts/measure/startup-budget.sh`, which reads the first
assistant record carrying a REAL `usage` in a session's transcript.

## 1. The ladder — where an opening's tokens actually go

Measured by A/B deltas, on the 2.1.278 binary. Claude Code floor **20,902** (13,581 prompt and
listings, 7,321 the builtin tool schemas) · Opus over Haiku **+6,822** · interactive over print
**+11,881** · claude-in-chrome **+1,660** · MCP server names **+1,476** · residual **5,221**, not
itemised. **What belongs to this project: 18,715** by A/B deltas, 18,668 by item.

Baseline the morning of 2026-09-22, before anything changed: Opus session **63,541** · Fable
session **67,094** · MEMORY.md **5,334** · the gated basket **12,281** — RED by the ruler's own
gates, by design.

## 2. What stands — the memory index (`9b9606b9`)

**5,334 → 3,294 tokens, −2,040, −38 %.** 96 links before = 96 after.
`find <memory dir> -name '*.md' ! -name 'MEMORY.md' -exec md5sum {} + | sort -k2` before and
after, then `diff` → empty: **all 96 memory files byte-identical**. Gates moved on measurement to
MEMORY.md ≤ 3,600 and basket ≤ 11,000; ruler GREEN, basket **10,241**.

**Registered deviation from what he clicked.** The approved plan set P1's target at
"5,334 → ≤ 1,500" with gates 1,500 / 12,000. That was measured to be arithmetically impossible
before a line was written: with `cl100k_base` the 96 bare filenames cost 1,032 tokens, 1,320 with
their markdown, 1,512 with the separator and newline — a 1,500 gate leaves 4.9 tokens a row for 96
titles AND 96 hooks. What landed is −38 %, not the −72 % the plan promised. Registered in
`scripts/governance/ceo-approvals.json` under `startup-budget-plan-click-2026-09-22`.

## 3. What was measured and LEFT ON, by his decisions

Both switches were measured on two interleaved interactive pairs per model. A = the key absent
from `.claude/settings.json`, B = present, with the variable unset in the child's environment in
both arms so nothing but the settings file could carry it. Every run printed `tool_uses=0 · HEAD
same · status same`.

### The Workflow tool — shipped `ac62ebac`, reverted whole `f63de6f4`, his decision 13:50

| model | pair | A (no key) | B (key) | delta | session ids |
|---|---|---|---|---|---|
| haiku-4.5 | 1 | 48,014 | 46,464 | **−1,550** | dec3d63d · 06b9a7fb |
| haiku-4.5 | 2 | 47,989 | 46,462 | **−1,527** | dfb5ce4d · 18f3a4a9 |
| opus-5 | 1 | 58,176 | 56,126 | **−2,050** | 5614b147 · 9f954201 |
| opus-5 | 2 | 58,197 | 56,141 | **−2,056** | b5f7c06d · da2ac46c |

Print mode, `--max-turns 1`, settings clean so only `env` decides: ON 35,721 / 35,721 ·
OFF 34,258 / 34,258 = **−1,463**.

### The Artifact tool — never committed, his decision 13:38

| model | pair | A (no key) | B (key) | delta | session ids |
|---|---|---|---|---|---|
| haiku-4.5 | 1 | 46,268 | 37,776 | **−8,492** | 1f15f85e · ee0aab4c |
| haiku-4.5 | 2 | 46,268 | 37,776 | **−8,492** | b924f8f1 · 247b790a |
| opus-5 | 1 | 55,808 | 44,363 | **−11,445** | bb9b5af2 · d61a41f2 |
| opus-5 | 2 | 55,806 | 44,363 | **−11,443** | 8644f561 · 5319aa83 |

These runs passed `--strict-mcp-config`, because in default permission mode the child stops at an
interactive MCP approval dialog and never reaches its first request. It lowers the ABSOLUTE
opening of both arms identically, so the deltas stand and **the absolute figures in this table are
not comparable to a real session's opening**.

**And the sweep behind the Artifact number was wrong before he decided.** It covered
`.claude/` and `scripts/` and found no dependant. `.planning/STATE.md:35` is an **OPEN** row (B28)
carrying his own ruling that the door for a report is Artifact and its design guidance, and the
report he had ordered found — *Dünyadan Pay* — is an Artifact at
`claude.ai/artifact/BWiemZjFk2Y3jha3GGvSRf` and **is not a file anywhere on disk**;
`00-BOARD-OPEN-WORK.md:131` says the same. **A dependant sweep that stops at the code cannot see
what the CEO's own records depend on.**

## 4. The traps this job paid for, one line each

1. `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS=1` does not save — measured **+4,717** (37,957 → 42,674).
2. 9 of 458 transcripts carry a zero-token `<synthetic>` usage record; a ruler that reads one
   reports a free session and goes GREEN. The ruler skips and counts them.
3. tiktoken downloads its encoding on a cold cache; pinning the cache only MOVES the download, so
   the ruler refuses instead (exit 2).
4. A 1,500-token index target was arithmetically impossible — **measure a floor before promising**.
5. A header sentence naming a threshold drifts from the constant that sets it; the header now
   points at the constant and names no number.
6. When what ships differs from what he clicked, the ledger entry REGISTERS the deviation.
7. A settings `env` **addition** reaches later Bash spawns of a running session; a **removal does
   not**. An A/B over such a variable is measured with `env -u VAR` / `env VAR=1` on the CHILD —
   trusting the parent shell made both arms identical and produced a false "no effect" verdict.
8. `claude -p --output-format json` reports `usage` summed over the print loop; `usage.iterations`
   ALWAYS has one element, so printing `iters=1` proves nothing. Use `--max-turns 1` and print
   `num_turns`.
9. **A measurement child opened in the project directory with bypass permissions is not inert.**
   Session `9f954201`, opened with the prompt "ok", read `CLAUDE.md` §0, took the pending
   working-tree change for its own work and ran `git add … && git commit -F …` at
   `11:01:48.854Z`. It could have deleted or pushed. Every measurement session after it ran under
   four conditions: a prompt that forbids tools, `--permission-mode default`, the transcript's
   `tool_use` count printed and required to be 0, and `git log -1` plus `git status --short`
   compared before and after.
10. `grep -r` on the 234 MB claude binary prints nothing without `-a` — it reported **0** hits for
    a flag that demonstrably works. A zero from a tool that cannot see is not a zero.
11. A dependant sweep that stops at the code misses what his own records depend on (trap 9's
    sibling, and the reason the Artifact sweep was wrong — see §3).

## 5. Found and not fixed

No ruler guards a `CEO-OK` marker inside a door: `scripts/governance/ledger-truth.mjs:128`'s
`SCOPE` omits `.claude/skills`. Proven on a throwaway copy of the repository — the new ledger
entry was deleted and `node scripts/governance/ledger-truth.mjs` still exited **0**. Widening
`SCOPE` sweeps every skill at once and has its own blast radius, so it is not a one-line repair.

**Follow-up, not done today:** add `scripts/measure/startup-budget.sh` to the battery so the index
cannot regrow in silence.

## 6. ⚠ UNVERIFIED

**The opening of the CEO's next real session has not been measured.** Every number here comes from
child sessions this seat opened. The repository keeps **−2,040** tokens from the index and nothing
else; a projected Opus opening of about **61,500** becomes a fact only when
`bash scripts/measure/startup-budget.sh <his-session-prefix> --json` reads a transcript of HIS
session.
