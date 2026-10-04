# Score card — design talk in a session opened at max; the build handed to a session at high

job: Design, plan and architecture talk runs in a session opened at Opus 5.5 `max` from its start (the spinner and the bar say max, no turn depends on the lead remembering a skill); on the CEO's yes to the plan the build is handed over to a new session at `high`; the `dxb-design-max` skill, its hook `dxb-design-max.py`, the hook's registration, its test and the status line's "tasarım açık" mark are removed (LAW A)
range: 3d5bb2ed..HEAD
blast: 1
risk: 2
reasoning: 0
ambiguity: 0

why: one subsystem — the construction's own tooling (the door dxb-team2, a skill, a project hook and its registration, the status line, their tests, the ledger, the Codex mirror); risk 2 — governance: the door that runs every job and a hook on every prompt of every session in this repository; reasoning 0 — deletions and prose, the status line loses one function; ambiguity 0 — his words to the plain proposal, verbatim: "evet kur, tasarımı max oturumda yapalım" (conversation, session b762d77d, 2026-10-04 ~17:40). Total 3, normal, Sol `high`.

## Why (measured 2026-10-04, session b762d77d, before he chose)

- The skill does lift the API: a local proxy between `claude` 2.1.289 and the API logged `output_config.effort` high → max after the skill's call, headless and interactive (pty) alike.
- But the interactive spinner says "thinking with high effort" through every max step — it shows the session's level, never the skill's.
- And the mode depends on the model obeying a text reminder: in session fd7d67f2 the reminder reached the model at 17:30:58, 17:32:17 and 17:33:15 (local) during design talk, the skill was not invoked, all 15 steps ran at high.

## Done-list (written before the code)

1. `ls .claude/skills/dxb-design-max .claude/hooks/dxb-design-max.py tests/hooks/design-max.test.ts .agents/skills/dxb-design-max` — all four: No such file or directory.
2. `grep -rn "dxb-design-max\|design-max" .claude/ .agents/ tests/ AGENTS.md ~/.claude/hooks/dxb-statusline.js` — no hit (the ledger and the dated records under `.planning/quick/` keep their history).
3. `node -e` parse of `.claude/settings.json` — valid JSON; no PostToolUse `Skill` entry naming the hook; UserPromptSubmit keeps `no-laziness.sh` only.
4. `pnpm vitest run tests/hooks/statusline-effort.test.ts` — GREEN; the flag cases are gone; a new case: a design flag file standing in the runtime folder adds nothing to the bar.
5. `.claude/skills/dxb-team2/SKILL.md` §2 Lead row and §4 PLAN name the max session and the handover at his yes; §8 names the two effort switches (into `max` before design talk, into `high` at his yes); the CEO-OK markers point at `design-in-a-max-session-2026-10-04`; the old two markers gone from the door.
6. `scripts/governance/sync-codex-mirror.sh --check` — exit 0 after the regeneration.
7. The ledger carries `design-in-a-max-session-2026-10-04` with his words verbatim; `ledger-truth` and the other governance rulers GREEN.
8. Battery once, GREEN.
