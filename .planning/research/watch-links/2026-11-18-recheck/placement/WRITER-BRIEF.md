THE HOLDING: This holding produces high technology, aims at large revenue and will found large companies; its goals are very large. Its business lines' clients are small, medium and large, reaching up to the biggest clients in the world.

# Write the second reading's results into the board rows that own them

The CEO saves links (tools, repos, skills, revenue videos). Four older tabs of his workbook were read a
second time today by Opus readers; the lead judged them. His order, verbatim:

> "Burada ikinci bir göz olarak bakılmasını istiyorum ben. Alınanları alalım, kuralım falan filan, deneme
> bir şey varsa onları tahtada yerine konulmasını istiyorum. … İlişkili olan şeyle satırlara
> yerleştirilmesini istiyorum. … Karşılığı varsa aynıysa … yedek olarak ikinci olarak konur. Ve denenir."

You write the records. You do not judge again, you do not install, you do not commit.

R="/home/dxb/DxB Global OS"
D="$R/.planning/research/watch-links/2026-11-18-recheck"
J=/tmp/claude-1000/-home-dxb-DxB-Global-OS/7d8f2f4c-6fca-4474-b904-473ec48eefce/scratchpad/job

## What you are given
- Your packet `$J/pack-<name>.json` (named with your rows): one record per thing to place. Fields: `rid`,
  `old_id` (the workbook's row id), `item` ('' = the row itself, else one tool or method of it), `what`,
  `have`, `differs`, `owner_row` (the row file you write it into), `also_rows`, `counterpart`, `relation`
  (new · second · method · identical · none), `use`, `trial`, `stops_at_ceo`, `reading`
  (Kur · Dene · İkinci · Yöntem · Araştır · İzle), `unread`, `_file`, and sometimes `lead_place`.
- The readers' full reports: `$D/rows/<_file with .md>` — find the record's section (`## <rid>`) and read
  it before you write that record; the packet line is the summary, the report holds the detail (URLs,
  stars, versions, file:line of what we have).
- The row files: `$R/.planning/board-rows/<ROW>.md`.

## What you write
For each row file in your packet, ONE new leg, added after the file's last leg (do not reorder anything):

`## Leg 2026-11-18 — from the second reading of the four older link tabs: <the three or four main things, named> <!-- CEO-OK: four-tabs-second-eye-placed-on-the-board-2026-11-18 -->`

Read the legs dated 2026-11-17 already in that file (or in `B30.md`, `B84.md`) and write in the same form
and voice: plain English, facts, no story. Inside the leg, in this order, leaving out an empty group:
- **To install or try (nothing here does this job yet)** — relation `new`.
- **Seconds — placed beside what the row already names; tried next to ours when the row is built, the
  winner becomes the default and the other the fallback** — relation `second`.
- **Methods written into the row** — relation `method`.
- **To look into** — reading `Araştır` / `İzle`.
One bullet per record: **name** (workbook id `old_id`; the link or repo with stars / version / last push
when the report gives them) — what it is in one sentence; what stands in the row today for the same job
(or "nothing"); how it is used here; the first trial (what is run, against what of ours, what decides);
what stops at the CEO (money out, an account or identity step, a contract, an Islamic ruling) or nothing.
A row-level record whose `use` only points to its item records ("see item lines") is the frame — write the
items, not a duplicate bullet.

Rules for the content:
- **Do not repeat what the row already says.** Many records say "already placed at <file>:<line>; what it
  still lacks is …". Open that line. Write only what is lacking. Where a record shows an existing line of the
  row is factually wrong or out of date (a version, "not on disk", "never used"), check the fact yourself
  with the command or path the report gives; if it holds, correct that line in place and say in the leg, in
  one bullet, what was corrected and how it was measured. If you cannot confirm it, leave the line and say so.
- A record whose `board_row` begins "no row" is NOT written unless it carries `lead_place` — then follow
  `lead_place`. List the unwritten ones in your reply.
- Nothing is written as "approved", "accepted", "decided by him" beyond the marker above. A licence
  (AGPL, non-commercial) is not written as a blocker. "Unfiltered" is not a reason. A forbidden subject
  (alcohol, gambling, nudity, stock exchange, crypto, financial trading, tobacco, banking) is one line.
- A paid product is written as the paid twin / fallback beside the free road, with its price as read and
  the date it was read.
- A figure a video's speaker gives is written as his figure, with the video and minute.
- Touch only the files named with your packet. Not the board (`00-BOARD-OPEN-WORK.md`), not STATE, not a
  skill, not code. Use the Edit tool; never rewrite a whole row file.

## Before you say it's done
Run `git -C "$R" diff --stat -- <your files>` and a check that every record's name (or its repo slug) now
appears in its owner row file; show both outputs. If a record could not be written or a fact could not be
confirmed, tell me instead of working around it. Do not stop while a record of your packet is unwritten.

Reply with only: the files changed with lines added; per row file the count of bullets by group; the
corrections made to existing lines (file:line, old → new, how measured); the records not written and why.
