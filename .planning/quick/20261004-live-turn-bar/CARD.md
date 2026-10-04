# Score card — the status bar's turn mark live in every turn, the first one too

job: the status bar's turn mark shows the level of the turn in flight in every turn, a session's first turn included — `tur: max` from the moment `dxb-design-max` is called in a turn until his next message, the session's own level otherwise — read from the render's own payload (its `prompt_id` and `effort.level`) and a per-prompt marker the design-max hook writes, so it no longer waits on the transcript, which holds no line during a session's first turn
range: (filled after the build commit)
blast: 1
risk: 2
reasoning: 1
ambiguity: 0

why: one subsystem — the session's status line (`~/.claude/hooks/dxb-statusline.js`, outside git) and the project hook `.claude/hooks/dxb-design-max.py`, with their two test files; risk 2 — governance: the bar is how the CEO sees whether his design-at-max order is really running, and the hook writes into the flag folder whose link/FIFO hardening Sol already audited; reasoning 1 — a few edge cases: the turn boundary (a new `prompt_id`), a message he sends while the turn runs, a first turn with an empty transcript, a render racing the hook's write (atomic rename), a skill call from a subagent; ambiguity 0 — his words are exact and the remedy was measured (`.planning/quick/20261004-orchestration-door/evidence/statusline-live-probe.txt`). Total 4, normal, Sol `high`.

arrangement: team — one `helper-writer` writes the hook, the bar and both tests from this card's plan; the lead verifies each piece and runs the live pty probe itself. Why: the pieces are small and exactly specified; medium writes such code as well as high (§6) at a fraction of the price.

fable: start — normal class (fable-start-and-important-end-2026-10-04): once, now, on this approach and plan, before any file changes; not at the end.

his words (verbatim, session fd7d67f2, 2026-10-04): "Unutmadan: alttaki tur yazısı tamamiyle aynı etkileşimde olmalı skill aktifse o turda max yazmalı çubukta. çubuk her turu canlı interaktif göstermeli mutlaka. şuan öyle mi çalışması? işin bitince bak."

## What was measured (the probe of 2026-10-04 ~18:00, a real interactive claude 2.1.289 in a pty)

- During a session's first turn the transcript holds 0 lines at every render — the transcript-read bar shows no `tur:` there at all.
- Every render's payload carries `effort.level` (the session's own level — `high` while the skill had lifted the turn) and, once a prompt exists, `prompt_id`.
- The UserPromptSubmit and the PostToolUse(Skill) hook payloads carry the same `prompt_id` as the turn.
- A message he sends while a turn runs keeps that turn's `promptId` (transcript).

## The plan

1. Hook (`.claude/hooks/dxb-design-max.py`): on the opening event (PostToolUse, Skill `dxb-design-max`) it also writes the payload's `prompt_id` into `<flag folder>/<session_id>.turn` — the same trusted-folder descriptor, a temporary name opened `O_CREAT|O_EXCL|O_NOFOLLOW` (0600) and renamed over the marker inside the folder (a link or FIFO standing at the marker is replaced, never followed or opened). A `prompt_id` not shaped like Claude Code's writes no marker; no `prompt_id` → the flag opens as today, no marker. A skill call from a subagent (if its payload names one) writes no marker. Never fails a session.
2. Bar (`~/.claude/hooks/dxb-statusline.js`): `tur: max` when this session's marker is a regular file whose content equals the render's `prompt_id`; else the payload's `effort.level` when it is one of the five levels; else today's transcript reading, kept only as the fallback for a payload without `effort`. `🟣 tasarım açık` unchanged.
3. Tests, RED first: `tests/hooks/design-max.test.ts` (marker written with the prompt id; replaced by the next call; a link or FIFO at the marker not followed; a malformed or missing prompt id writes none) and `tests/hooks/statusline-effort.test.ts` (marker = prompt id → `tur: max` with an EMPTY transcript; a marker of an earlier prompt → the payload's level even when the transcript's last turn lifted; no marker → the payload's level; no `effort` in the payload → the transcript rules, the 13 old cases green; a link at the marker is no marker).
4. Live proof: the pty probe in a scratch project (its own copies of the skill and the hook): within the FIRST turn the bar draws `tur: high` before the skill's call and `tur: max` after it; his next message → `tur: high` until the skill is called again. Raw logs in the job's evidence folder, with a `diff -u` of the home status line before and after (it is outside git).

## Done-list (written before the code)

1. `pnpm --dir "/home/dxb/DxB Global OS" exec vitest run tests/hooks/design-max.test.ts` — the new marker cases RED before the hook changes, GREEN after; every old case stays GREEN.
2. `pnpm --dir "/home/dxb/DxB Global OS" exec vitest run tests/hooks/statusline-effort.test.ts` — the new payload/marker cases RED before the bar changes, GREEN after; the 13 old cases stay GREEN.
3. The pty probe's bar log: first turn `tur: high` → `tur: max` after the skill's PostToolUse; next prompt `tur: high`; raw log saved.
4. Battery once, `BATTERY_GREEN`.
