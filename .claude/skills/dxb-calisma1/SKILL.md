---
name: dxb-calisma1
description: Use when the CEO says a job is done "çalışma1 ile" (or "Çalışma 1'e göre") — two equal chief engineers, Opus 5.5 and Fable 5.1, side by side in two sessions, one plan written in halves and cross-checked, then built through dxb-team2.
---

# Çalışma 1 — two chief engineers, one table

His words, 2026-10-09: *"iş değişir ama bu tarz isteğim bakidir."* He made it a door on 2026-10-19
<!-- CEO-OK: calisma1-door-2026-10-19 -->. It applies whenever he hands a job over "çalışma1 ile".

## Who

- Two chief engineers: **Opus 5.5** and **Fable 5.1**, two sessions side by side in VS Code.
- Both are trusted equally; they sit at the table together and carry the job together. At this table Fable is
  one of the engineers, not an advisor — the exception to dxb-team2's "Fable is not consulted".
- **The job's lead is dxb-team2's lead:** the session he wrote the job to; if he wrote it to both, Opus.
  The lead merges the plan, chooses who writes the code, commits and reports to him. The other writes its
  half of the plan, reads everything before it is committed, and objects.

## The flow, A to Z

1. **The job is given.** He opens both sessions and tells one or both "… çalışma1 ile yapın".
2. **The lead is known** (the rule above).
3. **Sitting down.** The two find each other; each reads the other's conversation from its transcript first, then talks.
4. **The split.** They agree which half of the plan each writes.
5. **The halves.** Each measures and decides its own half.
6. **Cross-check.** Each reads the other's half and names what is wrong or missing; a disagreement is talked through.
7. **One plan.** The lead merges the two halves. The plan is made at `max` effort.
8. **The plan goes to him.** In his language, short, one page: what is done, what it touches, the steps, how
   it is verified, the risks. Below it: did working together make the job better, or did it cause trouble.
9. **His yes.** A correction sends the plan back to him; on his yes he switches the effort to `high`.
10. **The hands.** The lead chooses who writes (itself, its fork or helpers — dxb-team2 §3) and says it in one line.
11. **The code.** Each piece is tried with its own test.
12. **The second eye.** The other chief engineer reads the change before it is committed.
13. **The commit.** The lead commits the pieces it verified.
14. **All the tests.** Typecheck and the whole battery (dxb-team2 §5).
15. **Sol.** One blind pass: A blocks, B is fixed now, C goes into the report.
16. **The fixes.** Made, and the tests run again.
17. **The report.** The lead tells him in a few lines: what waits on him, what changed, what was found.
18. **The records.** The board row and STATE are updated.
19. **His eye.** Nothing is accepted until he has looked (LAW B).

## Always

- **The job runs through dxb-team2.** The machine stays on 7/24; when the context fills, dxb-team2's handover
  rule applies (at a clean break, around 50 %). The engineer hands over, never he; the new session is opened in
  VS Code through `operator`.
- **The two sessions talk to each other directly.** A message is confirmed in the other side's transcript; if it
  did not arrive, it is typed into the other panel through `operator`.
- **When the screen gets crowded** only this job's old sessions are closed — the ones that handed this job over.
  Sessions on the other work he gives are never touched.
- **They also work like a person.** Through `operator` the engineers use the screen, mouse and keyboard as if in
  his chair; the holding is built from the back end and from the screen.
- **The measure is quality:** the Ferrari.

## Two sessions in one repository

- No file is touched by two hands; every piece has one owner.
- Both sessions share one git identity: files are staged by explicit path, and `git status` is read before each commit.
- The second engineer at the table is not a dxb-team2 seat but an equal chief engineer; the door's seats and Sol stay as they are.
