# Sol — YE18 engineering craft (commit 17b38f7a)

GPT-6.1 Sol, medium, one blind pass, 2026-10-19. Raw output: `sol.raw` (kept on disk, out of git).

| # | Claim | Verdict | Grade |
|---|---|---|---|
| 1 | diagnosing-bugs bound to the `debugger` within its limits | REFUTED | A |
| 2 | codebase-design principles to the writing seats; improve-codebase-architecture not taken | STANDS | — |
| 3 | the 12 smells only over the writer's own lines, before hand-over | STANDS | — |
| 4 | tdd not taken; a never-red test is a defect | STANDS | — |
| 5 | construction bound now; the holding's engineers later, same copy | STANDS | — |
| 6 | no technical question to the CEO; the ledger entry exists | STANDS | — |
| 7 | the Codex mirror is the paths-only copy of the source | STANDS | — |

**A1, fixed:** the copy told the diagnoser to add tagged debug logs and the `debugger` agent to remove
them — writing, which `.claude/CLAUDE.md` §2 forbids every subagent but the writing seats. Now
`references/engineering-craft/diagnosing-bugs.md` (line 7) and `~/.claude/agents/debugger.md` say the
diagnoser writes no file: it runs commands that change nothing, and any test, harness or tagged probe
is specified by it and written and removed by the lead, a fork or a helper-writer. Verified by
reading both texts after the edit (`agent-diffs.txt` regenerated). Upstream fidelity is UNVERIFIED by
Sol (no network); the lead diffed the copies against the downloaded originals: Part A of
codebase-design byte-identical, diagnosing-bugs 17 changed lines, each an agreed adaptation.
