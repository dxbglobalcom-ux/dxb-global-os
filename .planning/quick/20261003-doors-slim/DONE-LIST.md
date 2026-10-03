# Done-list — the doors after his word of 2026-10-03

Written at audit time, AFTER the change (commit bec00f77, session 5ed74ad7): the job ran before its
done-list was put on paper. Items 7-10 were added by session cbedb76a for the door changes that followed
bec00f77 (5b5dd2a6, 8202740c, e7117fce, e04e12be); item 8's test was written and run red before its change. Each item names what has to hold and the command that shows it.

His question: "dxb-start kapısında faydalı olup diğerlerinde olmayan ne var? biz bu start kapısını
boşuna mı yapmışız?" His word: "Diğer beni bekleyen konularda da ikinci DXP start sadeleşsin. Aynen."
(ledger dxb-start-slimmed-2026-10-03). On Fable: "Bir de Fable'la ilgili şöyle bir şey yani tamam
dediğiniz gibi." — answering "Fable'ı sizin belirlediğiniz üç noktaya bağlayalım: büyük plandan önce,
aynı hata ikinci kez olunca ve 'bitti' demeden önce." (ledger fable-three-checkpoints-2026-10-03).

1. `.claude/skills/dxb-start/SKILL.md` holds the read order, what not to read and a map of where things
   are — and no copy of what dxb-team2 or the board own (approval, implementation, verification,
   records, the handover, choosing the row). `git show bec00f77 -- .claude/skills/dxb-start/SKILL.md`.
2. Nothing is lost: every rule deleted from dxb-start lives on in its owner — the understanding report
   (dxb-team2 §4 INTAKE), the plan's contents (§4 PLAN), root cause before fix, the test that failed
   first, no stub and no silent narrowing or widening (§4 BUILD); approval, verification, records and
   the handover in dxb-team2, dxb-verify, dxb-close-row and the board.
   `git show bec00f77^:.claude/skills/dxb-start/SKILL.md` against the doors at bec00f77.
   Sol's doors audit (SOL-DOORS.md, B1-B5) found five rules with no owner left. Each moves to its owner,
   and each command below finds nothing before the move and finds the rule after it:
   2a. B1, old lines 80-83 → dxb-team2 §8: the handover note is written in the author's own voice; he
       is quoted only from the ledger, never composed in his first person (as the ledger entry
       handover-at-50-without-asking-2026-10-01 holds it: "the note still quotes him only from this
       register"; the fork's first wording widened it to the conversation — the lead's brief had, and
       it went back). `grep -n "never composed in his first person" .claude/skills/dxb-team2/SKILL.md`
   2b. B2, old lines 68-70 → dxb-verify: the tests a change needs follow its risk — a targeted test for
       a local change, an integration test at a boundary, a security check wherever authorisation,
       secrets or isolation move. `grep -n "targeted test for a local change" .claude/skills/dxb-verify/SKILL.md`
   2c. B3, old line 48 → dxb-team2 §4 PLAN: no file changes before his yes (the old scope; it read "no
       code"). `grep -n "no file changes before his yes" .claude/skills/dxb-team2/SKILL.md`
   2d. B4, old line 64 → dxb-team2 §4 BUILD: the change matches the surrounding code — naming,
       structure, comment density, error handling, idiom.
       `grep -n "matches the surrounding code" .claude/skills/dxb-team2/SKILL.md`
   2e. B5, old lines 36 and 44 → dxb-team2 §4 INTAKE: the understanding is reported to him in his
       language before any proposal; no generic software advice, no documents restated.
       `grep -n "before any proposal" .claude/skills/dxb-team2/SKILL.md`
3. dxb-team2 §2 names Fable at the three fixed points, with his ledger id beside it.
4. Core §4's row and the opening hook line (`.claude/hooks/spec-bootstrap.sh`, its `.codex` twin) name
   dxb-start's new role; STATE no longer points at the deleted "Phase 0 §3".
5. The Codex mirror equals its source: `bash scripts/governance/sync-codex-mirror.sh --check` →
   `SYNC_OK`; `.agents/skills/` and `AGENTS.md` differ from `.claude/` only by the generator's rules.
6. The rulers that read these files stay green: `pnpm vitest run tests/hooks/opening-budget.test.ts
   tests/governance/ledger-truth.test.ts tests/governance/no-closure-without-his-word.test.ts
   tests/governance/codex-mirror-check.test.ts tests/governance/audit-card.test.ts` (raw output in
   evidence/rulers.txt).
7. dxb-team2 §8 (5b5dd2a6; ledger handover-carries-transcript-2026-10-03): a handover note ends with
   the path of the handing-over session's own conversation
   (`~/.claude/projects/-home-dxb-DxB-Global-OS/$CLAUDE_CODE_SESSION_ID.jsonl`) and the line *if
   anything here is unclear, read the part you need there*, his ledger id beside it.
   `git show 5b5dd2a6`.
8. The auditor never re-grades (8202740c; ledger auditor-never-regrades-2026-10-03): the line Sol
   receives first shows the card for information and tells it to audit at the level the card gives
   and not to re-grade it — no "under-grade", no "challenge"; the headers of audit-card.mjs and
   refuter.sh and dxb-team2 §3 and §6 say the same, the ledger id beside §6's sentence; nothing else
   invites a re-grade: `grep -rniE "challeng|re-?grade|under-?grade" .claude .agents AGENTS.md
   scripts/governance`. `pnpm vitest run tests/governance/audit-card.test.ts` → the two new
   assertions red on the old text (2 failed, 17 passed — run before the change), green after.
9. dxb-verify (e7117fce; ledger dxb-verify-battery-and-restart-lines-2026-10-03): the check table's
   first row names `pnpm construction:battery`; the restart trap restarts `dxb-scheduler` and says
   `dxb-jarvis` is not started. `git show e7117fce`.
10. dxb-hamza-context (e04e12be; ledger dxb-hamza-context-restart-line-2026-10-03): rule 5 restarts
   `dxb-scheduler` — it drains both lanes (`packages/outbox-executor/src/scheduler.ts`) — and says
   `dxb-jarvis` is not started; no door names a dxb-jarvis restart:
   `grep -rn "dxb-jarvis" .claude/skills .claude/CLAUDE.md` → only the two "not started" lines.
