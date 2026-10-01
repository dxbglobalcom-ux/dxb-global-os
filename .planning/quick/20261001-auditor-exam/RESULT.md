# Auditor exam — Sol 6.1 and Sonnet 5.5 on job 1's first diff (2026-10-01)

Ordered by the CEO 2026-10-01 ("önce testi yap sonra dxbteam2 yi konuşuruz"). Lead: Opus 5.5 session cd2a0e9d.

**The exam.** Job 1's first audited state, `635e32bc..cf95b743`, checked out as a detached worktree; each
candidate got the 2026-09-28 blind brief (`brief-sol.txt`, `brief-sonnet.txt`) with the repository path
pointed at the worktree and its own `sql_read` tool from that commit, on the construction engine as
`sol_reader`. Sol ran under a copy of the read-only refuter profile with only the model changed; Sonnet
ran in `claude -p` inside a bwrap view where the worktree and the repository were read-only (both
write probes refused before the runs). The answer key is Sol 6 xhigh's audit of 2026-09-28 (rollout
21-22-00): **1 A** — functions created later in `extensions` / `supabase_migrations` are born
PUBLIC-executable and nothing re-checks at call time — and **3 B** — byte caps; done-list item 7's
dead command; `--proof` counting any error as a refusal. The Sol 6 re-run was stopped on the CEO's
word ("sol 6 xhigh'ın sonucu zaten yok mu").

| | Sol 6 xhigh (key, 09-28) | Sol 6.1 high | Sol 6.1 xhigh | Sonnet 5.5 high | Sonnet 5.5 max |
|---|---|---|---|---|---|
| verdict | BLOCKS | BLOCKS | BLOCKS | BLOCKS, "no A" | **PASSES** |
| key A (future functions) | A | A | A | B | B (+ C) |
| byte caps / wire | B | B + A (no wire limit) | B | B | B |
| item 7 dead command | B | B | B | not found | B |
| `--proof` any-error hole | B | B | B | B | B |
| EXPLAIN `U&"…"` escape (new) | missed | found (A) | found (B) | found, proved live | found |
| company sysid vs triple (new, plan R1) | missed | found (A) | found (B) | not found | not found |
| minutes | 8.0 | 16.5 | 24.9 | 6.9 | 33.6 |
| price | Plus 5-h +8 | Plus 5-h +6 · week +0 | Plus 5-h +9 · week +1 | $1.39 | $8.44 |
| `sql_read` calls | 26 | 51 | 61 | 29 | 28 |

**Contamination — read before trusting the table.** The worktree shares git with the main checkout
and the brief asks for the installed profile to be compared with the tracked one, whose tool path
points at the main checkout. All four candidates saw later fixes at some point: both Sol 6.1 runs ran
`diff -u` of the worktree's tool against the main checkout's (high: late, line 5861 of 6130 before its
answer; xhigh: line 6455 of 7664); Sonnet high cites the fix commits by hash; Sonnet max read the tool
log, which holds a later build's refusals. Sol 6 on 09-28 had none of this. The Sonnet runs had the
fixes in front of them and still classed the key defect B; Sonnet max let the job PASS.

**Found on the way, still live today.** HEAD's `sol-db-mcp.mjs` `classify()` returns
`{"mode":"plain"}` for `EXPLAIN (U&"analy\007Ae") SELECT 1` (measured 2026-10-01): a Unicode-escaped
ANALYZE executes the statement (Sonnet high proved `actual time` / `Execution Time` on the engine).
Bounded by the read-only transaction, the role and the 10 s timeout; a B against done-list item 3's
"any spelling". The company-sysid point is a deviation from plan R1 ("the company sysid is refused").

Raw answers beside this file; the Codex rollouts are
`~/.codex/sessions/2026/10/01/rollout-2026-10-01T16-24-19-…` (6.1 high) and `…T16-40-51-…` (6.1 xhigh).
