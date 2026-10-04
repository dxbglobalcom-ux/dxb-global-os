# Score card — the approved orchestration design written into the door; Fable at the end, on important jobs only

job: dxb-team2 and the core say what the CEO approved on 2026-10-03 and ordered finished on 2026-10-04 — the lead chooses one of three arrangements per job (fork · team · hybrid) and writes it, its why and its measured fields on the card; a fork or a medium helper may write code, every piece verified by the lead before commit (core §2, a writing helper seat); Sol audits a job once, its findings fixed by a fork or a helper and verified by the lead, no second round; Fable is consulted once, at the end, on a critical job only — no fixed points before the work; the door's dollar figures survive the door being opened with a job sentence; the Codex mirror stops turning hook paths it does not copy into paths that do not exist
range: (filled at commit)
blast: 1
risk: 2
reasoning: 1
ambiguity: 1

why: one subsystem — the construction's governance (the door dxb-team2, the core's "Code" sentence, a new user-level agent, dxb-verify's one dispute line, the mirror generator and its test, the ledger, STATE); risk 2 — governance and agents: the door every job runs through and who may write code; reasoning 1 — the generator's sed must keep converting the bare hooks folder and *.sh paths while leaving any other hook path as it is; ambiguity 1 — "önemli konularda" is read as the card's critical class, and the lead writing itself stays (the core's "the session writes it") beside the three arrangements. Total 5, normal, Sol `high`.

arrangement: the lead writes (prose in four files, one sed line and its test — a fork would start from a lead at ~40 %); Sol's findings fixed by the new `helper-writer` seat and verified by the lead (sol-single-pass-fixes-by-helper-2026-10-03). The session runs at `max` for the whole job (his `/effort max`, 2026-10-04 ~17:37) — writing the design into the door is design work (design-plan-architecture-at-max-2026-10-03).

his words (verbatim): the /goal of 2026-10-04 ~17:19 — "4- kalsın gerek yok. diğerlerini tamamla ve bu sistemde fable en sonda sadece önemli konularda danışılsın sanırım şuan hem başta hem de sonda danışılıor galiba ve herşeyde... evet başla!" — "diğerleri" are items 1, 2, 3 and 5 of the lead's list of 17:13 (three arrangements · helpers write code · Sol single pass · the two Bulunan defects); item 4 is dropped and is written nowhere.

## Done-list (written before the code)

1. `pnpm vitest run tests/governance/codex-mirror-check.test.ts` — the new case (a `.py` hook path, a `~/.claude/hooks/` home path, a `*.sh` hook path and the bare hooks folder in one door) RED before the generator changes, GREEN after; the file's other cases stay GREEN.
2. `bash scripts/governance/sync-codex-mirror.sh --check` → `SYNC_OK`; `grep -rn "\.codex/hooks/dxb-\(design-max\|cost-gate\|context-gate\)" .agents AGENTS.md` → no hit.
3. `grep -n "re-checks\|Sol weighs it\|three fixed points\|fable-three-checkpoints\|Fable advises" .claude/skills/dxb-team2/SKILL.md` → no hit; `grep -c '\$[0-9]' .claude/skills/dxb-team2/SKILL.md` → 0; the door names the three arrangements, the card's fields, the writing helper, the single Sol pass and Fable's one end consultation with their CEO-OK ids.
4. `.claude/CLAUDE.md` §2 "Code" names the fork and `helper-writer` under the lead's verification (CEO-OK helpers-write-code-under-lead-verification-2026-10-03); the opening ruler PASSES (pre-commit).
5. `~/.claude/agents/helper-writer.md`: Opus 5.5 · `medium`, Read Write Edit Grep Glob Bash, never commits — and one live call through the local proxy shows its requests carry `output_config.effort` `medium`.
6. `.claude/skills/dxb-verify/SKILL.md`'s dispute line says what §4 DISPUTE now says.
7. The ledger carries his /goal words under one id; the records ruler and ledger-truth PASS (pre-commit).
8. Battery once, GREEN.
