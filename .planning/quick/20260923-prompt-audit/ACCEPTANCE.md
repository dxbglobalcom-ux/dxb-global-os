# Job 2 · P5 — acceptance items, written before the phase (2026-09-24)

The phase applies bucket 1 of `REPORT.md` (session-written text, high and medium confidence) and
nothing else. It passes when every item below prints what it says, and the refuter's A list is
empty (`dxb-crew` §1). Baseline taken before the first edit: all seven commands green.

| # | Command | Expected output |
|---|---|---|
| 1 | `node --no-warnings tests/hooks/opening-budget.ts` | `6/6 PASS, 0 failures` |
| 2 | `node --no-warnings tests/hooks/session-start-fits.ts` | `4/4 PASS, 0 failures` |
| 3 | `node --no-warnings tests/b43/records-truth.ts` | `4/4 PASS, 0 failures` |
| 4 | `npm run -s verify:ledger` | `ledger truth OK: …` |
| 5 | `bash scripts/measure/startup-budget.sh` | `VERDICT    : GREEN` |
| 6 | `bash scripts/research-ruler.sh` | `RULER: 16/16 rules PASS · 0 failures` |
| 7 | `npx vitest run tests/b46/research-ruler.test.ts` | `Tests  26 passed (26)` |
| 8 | `python3 .planning/quick/20260923-prompt-audit/check-bucket1.py` | every line `OK`: each old sentence absent from its file, each new sentence present |
| 9 | `bash scripts/governance/sync-codex-mirror.sh --check` (after the sync and the `agent-reach` restore) | the only difference is the known `Only in .agents/skills: agent-reach` |
| 10 | `git -C "/home/dxb/DxB Global OS" diff --stat HEAD` | only the bucket-1 doors, their `.agents/skills` mirror copies, this directory and the record files (STATE, board) |
| 11 | the reading-chain lists in `dxb-research/SKILL.md` §4 and `references/channels.md` | name the same twelve doors, in the order of `scripts/fetch.py:381-392` (item 8 checks it) |

Outside the repository, and therefore outside `git diff`: `~/.claude/agents/scout.md`,
`~/.claude/agents/builder.md` and `~/.claude/CLAUDE.md`. Item 8 checks them too. A backup of each
is taken before the edit, in the session scratchpad.
