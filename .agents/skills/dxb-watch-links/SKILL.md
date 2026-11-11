---
name: dxb-watch-links
description: Use when the CEO sends links to look at — his WhatsApp group of saved links ("WhatsApp'a attığım linkler", the "Claude Code" group), one video, reel, repo or post ("şunu izle", "bunu incele") — to watch each one from its real content and judge it as the holding's engineer — is it real, is it useful for the holding or for our sessions, where would it go, how would we apply it. Rival systems studied for the Ferrari go through dxb-rival-intel instead.
---

# Watch the links he sends, and judge them as his engineer

**The yardstick is the holding's purpose — `AGENTS.md`, its first section; know it before the
first link.** Its founding purposes are technological advancement and revenue generation, and its target
is a digital holding that earns continuously, Ferrari-level, a candidate for first place. "Useful to the
holding" means it advances the machine or makes the holding earn, in any halal way. A money road is never
dropped for a fixable risk; a hollow claim is never let through. <!-- CEO-OK: holding-purpose-tech-and-revenue-2026-10-08 -->

He is the CEO; you are the engineer beside him. For each link the question is his: *what is this, is it
real, is it useful to us — the holding or our sessions — and if so, where would it go and how?* The
caption is bait; the content decides. Every link is opened; nothing is skipped.

`K="/home/dxb/DxB Global OS/.agents/skills/dxb-watch-links"` · a job folder `J` in your scratchpad.

## 1. Gather the links

- **One or a few links in the conversation** → write them to `$J/items.tsv` yourself.
- **His WhatsApp group** → his Chrome's WhatsApp Web (claude-in-chrome), the chat opened by click.
  Paste `$K/collect.js` (set `SINCE`) into `javascript_tool`; poll `window.__st`; read `window.__m` out in
  ~850-character slices (the tool cuts longer output). Never type keys into WhatsApp — a key lands in his
  message box; scroll only with the script or the wheel. Image-only messages: ask him whether they matter.
- `$J/items.tsv` columns: `id date links ceo_note` (tab-separated; `ceo_note` = his own words with the link).
- `bash $K/context.sh $J` → `$J/context.md`: the holding, what we already have, the open board rows.

## 2. Watch each one — three steps for a video

1. **Transcript** — `bash $K/watch.sh $J <id> <url>`. YouTube gives its own subtitles; anything else is
   downloaded (720p) and transcribed on this machine. Read all of it: it decides whether the video matters.
2. **Frames at the moments that matter** — `bash $K/frames.sh $J <video.mp4> <sec> …`, read the sheet.
   (YouTube: `watch.sh … <url> video` fetches the picture.)
3. **The whole video**, only when it is truly valuable or the screen is the point — without waste: from
   the transcript make a topic map (second → topic → what is on screen), then take one sharp frame of every
   distinct screen and another only when the screen really changes; zoom where the text is small. A screen
   that stands still for two minutes is one frame. For a short reel, `bash $K/watchall.sh $J <video.mp4>`
   (one frame a second plus every scene cut) is cheaper than choosing; read every sheet.

Other links: Instagram image posts → `python3 $K/carousel.py <url> $J/carousel/<id>` and read every
slide · GitHub → `gh api repos/O/R` and the README · X → `opencli twitter thread` · pages → the
dxb-research `fetch.py`. A tool a video names is looked up for real; the creator's hype is not repeated.
**When YouTube refuses the downloader** ("confirm you're not a bot" — it comes after many downloads in a
row, and the hidden Chrome gets the same wall): open it like a person, in HIS Chrome (claude-in-chrome),
your own new tab — pause the video, click "Transkripti göster", and `get_page_text` returns the whole timed
transcript (measured 2026-10-08). Frames the same way: pause, set `video.currentTime`, screenshot.
A link that still will not open (deleted, private) — the row says so and what was tried. Its content is
never guessed.

**Who reads** <!-- CEO-OK: watch-links-opus-reads-fable-judges-2026-11-11 -->. The reading is a hand's
work, never a second judge's: a reader fetches, reads and writes the content down; it does not decide.
- **The links he gives — one or a few:** an Opus 5.5 · medium reader (`Agent`, `general-purpose`,
  `model: opus`, `effort: medium`) with `$K/reader.md` filled ({IDS}, {JOB}, {OUTFILE}); it writes
  `$J/rows/<n>.jsonl`. It reads the whole transcript and picks the frames itself: no moment where a name, a
  repo, code, a number or a table stands on the screen may be missed. Nobody watches the same video twice.
- **A channel, or any large group:** the lead splits the links between Opus 5.5 · medium readers and
  Sonnet 5.5 · high readers (`model: sonnet`, `effort: high`), about half each, the same `reader.md` — what
  the screen carries (reels, demonstrations, carousels) to Opus, what the speech or the text carries (talks,
  repositories, pages) to Sonnet.
- A small thing — one post, a short page — you may read yourself, same row keys.

## 3. Judge them yourself, and say how we would use the good ones

The readers bring the content; **the judgement is yours alone** — the Fable 5.2 lead, at `high`: opening
`Skill("dxb-effort-high")` is the first action of the turn you judge in (dxb-team3 §2). No second judge, no
referee round <!-- CEO-OK: watch-links-opus-reads-fable-judges-2026-11-11 -->. A reader's scores are its first
reading; every row is gone through and the score that stands is yours. Know the holding and the board before you
judge (`context.md`; the board row itself when one is named). For every row: is it real, is it useful —
for the holding, for the sessions — do we already have it, which board row it belongs to. For each one
worth acting on, write the plan in `$J/plan.jsonl`, one line per id:
`{"id","sira","plan" (what we would do),"nerede" (where in the holding or the construction),"tahta",
"kim","onay" (what needs his yes — money out, identity, install),"risk"}` — and you may correct the
reader's `holding_puan`, `teknoloji_puan`, `teknoloji_katki`, `gelir_puan`, `gelir_katki`, `oturum_puan`, `oneri`,
`ne_bu`, `izlendi`, `okundu` there (your `tahta` replaces theirs).

## 4. Give it to him

Many links → a new tab in his ONE workbook, never a new file <!-- CEO-OK: new-links-a-dated-tab-in-his-one-workbook-2026-10-19 -->,
every link scored and explained for technology and for revenue <!-- CEO-OK: link-tabs-carry-technology-and-revenue-2026-10-19 -->:
the master is `.planning/research/watch-links/2026-10-08-whatsapp/turbo/Excel-turbo.xlsx` (committed), his
copy `~/Desktop/İNCELEMELER/Excel-turbo.xlsx`. In this order — his unsaved edits are never overwritten:
(1) while `~/Desktop/İNCELEMELER/.~lock.Excel-turbo.xlsx#` exists his LibreOffice holds the file — ask him to save
and close it, and wait; (2) compare the two (`sha256sum`): if his copy differs it holds his edits — stop and ask
him; (3) note his copy's hash, then `<venv>/bin/python -I "$K/xlsx.py" "$J" <master> "<dates> <title>"` (the tab
named like "Ekim 9-15 linkleri", ≤ 31 characters) and commit; (4) right before copying the master over his copy,
check again that no lock file exists and his copy's hash is the one noted — if not, stop and ask him; then copy,
`SendUserFile`, and two or three lines in Turkish: how many, which few are worth acting on, what waits on his
yes. A new file (`xlsx.py "$J" <file.xlsx>`, no tab name) only when he asks for one.
A few links → answer in the conversation, plainly. Nothing is installed or started without his word.

## 5. How closely a link is watched

The links he gives are important ones — he chose them. Each is read this way
<!-- CEO-OK: watch-links-important-review-2026-10-14 -->:

- **His exclusions go into the brief verbatim** ("these are not wanted") and are listed once, never evaluated.
- **Watching follows the content, not one rule:** a short reel, a Short or a carousel carries its content on
  the screen — `watchall.sh` (one frame a second plus every scene cut) and every sheet read, every carousel
  slide read (`carousel.py`); where words or a name flash shorter than a second, that span is stepped through
  densely with `frames.sh` at the seconds that matter. A long talk video carries it in the speech — the whole
  transcript is read, and a frame is taken only where a repo name, code or a table is on the screen. A long
  demonstration whose screen carries the content keeps §2's step 3 (topic map, one sharp frame per screen).
- **One reading, one judge:** the reader of §2 reads it once; the lead judges alone at `high` (§3) — where it
  goes in the holding (board rank or row), how it would be applied, whether the construction team should
  install it. The two blind readers and the referee round of 2026-10-14 are gone
  <!-- CEO-OK: watch-links-opus-reads-fable-judges-2026-11-11 -->.
- **Cheap work goes to the cheap hand when Sonnet can do it:** a Sonnet agent (`model: sonnet`) moves the
  lead's judgement into his Excel — a new dated tab in his one workbook (§4) — keeping every call of the
  lead.
- Nothing is installed or started without his word.
