---
name: dxb-watch-links
description: Use when the CEO sends links to look at — his WhatsApp group of saved links ("WhatsApp'a attığım linkler", the "Claude Code" group), one video, reel, repo or post ("şunu izle", "bunu incele") — to watch each one from its real content and judge it as the holding's engineer — is it real, is it useful for the holding or for our sessions, where would it go, how would we apply it. Rival systems studied for the Ferrari go through dxb-rival-intel instead.
---

# Watch the links he sends, and judge them as his engineer

**The yardstick is the holding's purpose — `.claude/CLAUDE.md`, its first section; know it before the
first link.** Its founding purposes are technological advancement and revenue generation, and its target
is a digital holding that earns continuously, Ferrari-level, a candidate for first place. "Useful to the
holding" means it advances the machine or makes the holding earn, in any halal way. A money road is never
dropped for a fixable risk; a hollow claim is never let through. <!-- CEO-OK: holding-purpose-tech-and-revenue-2026-10-08 -->

He is the CEO; you are the engineer beside him. For each link the question is his: *what is this, is it
real, is it useful to us — the holding or our sessions — and if so, where would it go and how?* The
caption is bait; the content decides. Every link is opened; nothing is skipped.

`K="/home/dxb/DxB Global OS/.claude/skills/dxb-watch-links"` · a job folder `J` in your scratchpad.

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

**Many links:** split them into groups and give each to an Opus · medium reader (`Agent`,
`general-purpose`, `model: opus`, `effort: medium`) with `$K/reader.md` filled ({IDS}, {JOB}, {OUTFILE});
each writes `$J/rows/<n>.jsonl`. A handful you read yourself, same steps, same row keys.

## 3. Judge them yourself, and say how we would use the good ones

The readers bring the content; **the judgement is yours**. Know the holding and the board before you
judge (`context.md`; the board row itself when one is named). For every row: is it real, is it useful —
for the holding, for the sessions — do we already have it, which board row it belongs to. For each one
worth acting on, write the plan in `$J/plan.jsonl`, one line per id:
`{"id","sira","plan" (what we would do),"nerede" (where in the holding or the construction),"tahta",
"kim","onay" (what needs his yes — money out, identity, install),"risk"}` — and you may correct the
reader's `holding_puan`, `oturum_puan`, `oneri`, `ne_bu`, `izlendi`, `okundu` there (your `tahta` replaces theirs).

## 4. Give it to him

Many links → a new tab in his ONE workbook, never a new file <!-- CEO-OK: new-links-a-dated-tab-in-his-one-workbook-2026-10-19 -->:
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

## 5. An important review — two blind readers and a referee at max

When he marks links as important ("önemli repo ve skiller var", "bu da önemli") or asks for them to be reviewed
deeply, the review runs this way <!-- CEO-OK: watch-links-important-review-2026-10-14 -->:

- **His exclusions go into the brief verbatim** ("these are not wanted") and are listed once, never evaluated.
- **Watching follows the content, not one rule:** a short reel, a Short or a carousel carries its content on
  the screen — `watchall.sh` (one frame a second plus every scene cut) and every sheet read, every carousel
  slide read (`carousel.py`); where words or a name flash shorter than a second, that span is stepped through
  densely with `frames.sh` at the seconds that matter. A long talk video carries it in the speech — the whole
  transcript is read, and a frame is taken only where a repo name, code or a table is on the screen. A long
  demonstration whose screen carries the content keeps §2's step 3 (topic map, one sharp frame per screen).
- **Two readers, blind to each other, at high:** Opus 5.5 and Fable 5.1 (`Agent`, `general-purpose`,
  `model: opus` / `model: fable`, `effort: high`), one shared brief in the job folder; each writes only
  `reader-<name>.md` and never opens the other's. Each opens every named repo or tool at its real source and
  places it in the holding (board rank or row) and says whether the construction team should install it.
- **The lead is the referee, at max:** when both are done the lead switches itself to `/effort max` through
  `operator`, as `~/.claude/skills/operator/SKILL.md` says (a fresh `operator shot` after every action; this
  session's own terminal holding the keyboard and his prompt box empty before any key), and reads the live
  level as dxb-team2 §2 does (the newest, by timestamp, of `$XDG_RUNTIME_DIR/claude-ctx/<this session id>.json`
  field `effort` and this session's transcript). It merges only once fresh evidence for THIS session says
  `max`; while the level is unknown or different it does not merge and tells him. The merge goes into
  `MERGE.md`, naming every split and its call.
- **Cheap work goes to the cheap hand when Sonnet can do it:** a Sonnet agent (`model: sonnet`) moves the
  referee's merge into his Excel — a new dated tab in his one workbook (§4) — keeping every call of the
  referee.
- Nothing is installed or started without his word.
