# The second film's piece — what the round-two writer met in the skill and the command

The lead's brief for one writing seat (2026-11-13). The lead is "the user" below.

THE HOLDING: This holding produces high technology, aims at large revenue and will found large companies; its goals are very large. Its business lines' clients are small, medium and large, reaching up to the biggest clients in the world.

The Media Studio's vision: films that read as filmed, not generated, competing for first place in the world's advertising awards.

## The job
The holding's motion-graphics skill (`packages/gateway/plugins/dxb-motion-graphics/skills/dxb-motion-graphics/`, the command `tools/motion-graphics/mg.mjs`, its tests `tests/b43/motion-graphics*`, its contract `.planning/quick/20261112-motion-graphics/CONTRACT.md`) made its second film this morning. Its writer listed where the skill and the command got in the way or left it guessing: `.planning/quick/20261112-motion-graphics/FILM-R2-REPORT.md`, the last section. The CEO read the list and ordered it built into the skill (2026-11-13, in this conversation, verbatim): "All right, no problem. You can include them in your skill."

The same was done once already for the first film's nine items (`FRICTION-PIECE.md` beside this file is that piece's brief; `SOL.md` §3 is what the auditor then found in it — read both: the same mistakes must not come back: a number that is not finite accepted as a time, a path checked as written and not as it really resolves, a test that rests on another test's page, a claim stated without its condition).

## The seven items (the report's item 8, the cost gate, is not the skill's and is not yours)

The film's job folder is `/home/dxb/Videos/dxb-motion/film-1-whatsapp-r2/` — READ ONLY for you: it is in front of the CEO. Its `tools/` holds the five checks the writer wrote for that one film (`check-whole-phone.py`, `check-reading.mjs`, `check-never-still.py`, `check-same-second.py`, `check-transformation.py`, `frames.py`): they are your starting material, written for one film — the command's versions are general.

1. **`mg motion-read` and a model that is too slow.** Today one fixed 600 s limit; the default model and the next gave no answer in it for a 31.7 s film, the third answered in under a minute. Make the wait per model bounded and shorter, and on a timeout go to the next model in the list by itself, saying on stderr which model timed out and which is tried; the report's header says which model answered. All models fail → a non-zero exit and a line that says so per model. The existing privacy rules of this command stand (the key never reaches any output; only a film inside the job is sent) — read their tests before you touch it, and no test or hand run of yours makes a real call to Gemini.
2. **The page's contract is checked: the same second gives the same pixels.** A check that draws the same moments twice (two independent draws, the second after other moments were drawn) and fails on a difference, naming the moments. And the craft reference says what the writer found: with the browser's own antialiasing in WebGL two renders of one page differed in 409 of 951 frames; drawing at twice the size and bringing it down made them equal — stated with its condition (measured 2026-11-13, HyperFrames' Chrome on this machine's GPU).
3. **SKILL step 5 says "`mg render` at review size" and `mg render` has no such option.** Build the option if the renderer gives it at little cost (a smaller, faster render for looking, never the delivered film — the output's name says so and `mg verify` refuses it as a final film); if it does not, correct the sentence to what exists. Say which.
4. **The measures a film needs, in the command.** Under one sub-command (`mg check <what>` or names in the command's present style — follow how `mg verify` and `mg sheet` are built and documented):
   - *whole subject in frame*: over every frame, nothing of the subject touches the frame's edge — the film's check looked for dark pixels in the outer 4 px, which fits a dark phone on a light wall; the general form takes what the job states (the margin, and how the subject is told from the ground) and says plainly what it cannot judge;
   - *reading time*: every on-screen text stands whole at least as long as its words need — the rate is stated in the job (the skill's measure is three words a second), the texts and their times come from the page's timing data as the film's check read them;
   - *never still*: inside a stated stretch, no two neighbouring frames are (nearly) equal;
   - *a join holds*: the same instant drawn by two layers or engines differs by less than a stated mean, and the ruler proves itself each run (the film's check moved the subject one pixel and required the check to fail).
   Each exits non-zero on failure, names the frames or texts, and writes its result where `mg verify` writes its own. Every number a check takes is finite and in range (the auditor's B1 of the last piece).
5. **Engine guidance for an object in space that must join a flat drawing exactly.** `references/` covers a product that must look photographed (Blender). Add what this film proved, as craft with its reasons and its price: three.js in the page when the join must be the same pixels at both ends and the screen carries live transitions; what it costs (simple metal and glass, not path-traced); when Blender is still the answer. Short; in the present references' voice; SKILL.md's "engines by the shot" points to it.
6. **A job started from another job.** `mg init` (or a new flag — your choice by the command's style) can start a round from an existing job folder: it copies the page, the board's data, the assets with `SOURCES.md`, fonts and sound; it does not carry the old renders, work files or the old rendered board; the page's libraries are present after it. The source job is never changed; a source outside the allowed place, or a link that leaves it, is refused by its REAL path (the auditor's B2 of the last piece).
7. **One sheet to look at every transition.** A flag on `mg sheet` (or the board) that tiles one still per event, in order, at a size that can be read on one screen in each format — the writer had 15 large sheets per format and tiled its own.

SKILL.md's command table, `mg --help` and CONTRACT.md carry every new command and flag; the skill's text stays short — a new rule says its reason in a clause.

## How
- Tests first, red before the code: in `tests/b43/motion-graphics*.test.ts` (a test that needs the real Chrome, Blender or ffmpeg is a `*.host.test.ts`; look at how the existing ones are split and at `scripts/construction/battery.sh`'s `HOST_FILES`). Each test prepares its own page and files. Run your tests with `DXB_ENGINE_LOCK_WAIT=200` in front. `pnpm typecheck` at the end.
- Do NOT run the whole battery (`pnpm construction:battery`): the lead runs it after verifying your piece.
- Never `cd <dir> && …` in a Bash line (a hook blocks it): absolute quoted paths, `git -C`, `pnpm -C`.
- A run that takes minutes is the background command itself — its own exit wakes you; never a loop that waits for a line in a file. Stop only processes you started, by pid; never `pkill -f`.
- Write by the principles in `/home/dxb/DxB Global OS/references/engineering-craft/codebase-design.md` and check your own lines once against its 12 smells before hand-over.
- Touch only the skill's folder, `tools/motion-graphics/`, `tests/b43/motion-graphics*`, `scripts/construction/battery.sh` (only to list a new host test), and CONTRACT.md. Do not commit. Never print or copy an env file or a key.

## Working rules (verbatim)
> Before you say it's done, run the tests and show me the output. If something is missing or broken, tell me instead of working around it.

> Please avoid stopping while you still owe work the user asked for. Be persistent and do not stop unless needed.
> While status notes are welcome, as is clarifying with the user on open decisions, carry on with work that does not depend on the user's answer without unnecessary stops.
> If you notice yourself inviting the user to redirect you or offering to wait, instead proceed on the next part of the task. You may meet ordinary obstacles like errors, timeouts, locked files, empty results or failing tools. Diagnose them first, and when they are not real blockers, work through them with the access you have (wait and retry, fix the request, use another tool or source) rather than stopping unnecessarily.
> If someone clearly decided something is a hard blocker, such as a file marked not to be touched, access that was intentionally withheld, or a safety guardrail, leave it alone, say plainly what you found, and look for another safe way to finish the task. Stopping before the task is complete is very rarely merited, as in when the task can't move forward without user input, or where the blocker is deliberate and should not be worked past. This does not override the need for confirmation on risky or destructive actions.

## Report
The start and end clock. Per item (1–7): what you built (file:line), its test, the red line before and the green after. The final output of this job's test files and of the typecheck. One real run of each new check on a COPY of the round-two film's job made in your scratch (never on the original), with its output. `git -C … status --short` for your files. Every decision where this brief left a choice. Anything wrong, unbuildable or left open — plainly.

## State when the first writer was cut (2026-11-13 15:15 — Fable's own weekly limit, until 09:00 on 2026-11-14)
The first writer worked 13 minutes, in the order 3, 5, 1, 6, 7, 2, 4. Verified by the lead and committed with this
note: **items 3, 5 and 1 are finished** — 3: the sentence corrected (the renderer has no smaller size), with a test;
5: "An object in space that joins a flat drawing" in `references/craft.md`, SKILL.md's engines line pointing to it,
with a test; 1: `mg motion-read` leaves a silent model for the next by itself (four minutes each), `--model` names the
first, every model's line on failure, the key never printed — with tests. Both touched test files pass (97 tests),
typecheck 0 (`cut-writer-tests.out`, `cut-writer-typecheck.out`). **Items 6, 7, 2 and 4 are not started** — the next
writer begins at 6, in the order 6, 7, 2, 4, from this commit.
