# Score card — design, plan and architecture at max without his hand on /effort

job: Every turn of design, plan or architecture work runs at Opus 5.5 max while the session itself stays at its own level (high), without the CEO touching /effort: the lead invokes the `dxb-design-max` skill (frontmatter `effort: max`) as the first step of such a turn; a project hook marks the mode open for that session on the skill's call and, on each of his messages while it is open, reminds the lead to invoke it again; his yes to the plan closes it (`dxb-design-max.py close`) and the work goes on at the session's level
range: 5fbd909f..bdbb997c
blast: 1
risk: 2
reasoning: 1
ambiguity: 0

why: one subsystem — the construction's own tooling (a skill, a project hook and its registration, the door's two lines, the ledger); risk 2 — governance: the door that runs every job and a hook on every prompt of every session in this repository (a hook that failed loudly would stand in his way on each message); reasoning 1 — one flag per session id across three entry points (skill call, his prompt, the close command), a session id that must never name a path outside the flag folder; ambiguity 0 — measured before he chose (2026-10-04, probe in the scratchpad: a skill with `effort: max` invoked by the model itself runs the rest of that turn at max — transcript `effort` high → max → max → max — and the next prompt returns to high), and his words to the plain proposal: "bunu yapalım tmm." Total 4, normal, Sol `high`.

arrangement: the lead writes (four small files and one test; a fork would only re-read the lead's context). Approach talked through with him at length in this conversation; the plan is the approach he said yes to.

## Done-list (written before the code)

1. `pnpm vitest run tests/hooks/design-max.test.ts` — RED before the hook and the skill exist; GREEN after: the skill's call opens the mode for its session only; another skill opens nothing; his prompt while open carries the reminder naming the skill and the close command; no flag → silent; `close` removes the flag and the next prompt is silent; a session id shaped like a path writes nothing outside the flag folder; garbage stdin → exit 0, nothing on stdout or stderr; settings.json registers the hook on PostToolUse `Skill` and UserPromptSubmit; the skill's frontmatter says `name: dxb-design-max` and `effort: max`.
2. Live probe in a scratch project holding copies of the skill, the hook and the registration, a headless session at `--effort high`, two turns: turn 1 invokes the skill → transcript `effort` max after the call; turn 2 (his "next message") → the reminder reaches the model (it invokes the skill again, max again); turn 3 closes → flag gone; turn 4 → high, no reminder.
3. The door: `.claude/skills/dxb-team2/SKILL.md` §2 Lead row and §4 PLAN name the skill; the ledger carries his order with its CEO-OK id; `pnpm -s tsx scripts/governance/*` rulers that read the ledger stay green (the battery).
4. Battery once, GREEN.

## Measured (2026-10-04, the approved card fields)

- minutes: the talk at the session's level (his /effort max for one turn ~15:06) 15:02→15:50, with two
  probes (16:00 effort, 16:03 hook payloads); build at `high` 16:05→16:10 (RED test, hook, skill,
  registration, live four-turn probe, door, ledger); Sol 16:12→16:16 (high, one pass, 72,726 tokens);
  the lead's fixes 16:16→16:19 (6 new cases red on the old hook → green, probe again); battery
  16:19→16:25. About 25 min from his yes to green.
- batteries: one, GREEN (sandboxed 1,168 passed · host 266 passed).
- Sol's findings: 1 A (a planted link or FIFO at the flag redirects a write, aliases another session,
  redirects close, or blocks the hook) + 4 B (close let a permission error escape; the Codex mirror named
  a hook it lacks; the registration test accepted any command; the probe evidence truncated, close after
  a cd) — all fixed by the lead (no helper: four small files). No C.
- cost: not summed here (subscription; the transcripts hold message.usage — dxb-team2 §7).
- ⚠ UNVERIFIED: both probes ran headless (`claude -p`, 2.1.289); his interactive session, same version,
  was not measured — the first real design conversation is the check. That the company's own Claude
  calls do not load this project hook is read from the isolation design (own home, own working folder,
  settingSources []), not measured.
