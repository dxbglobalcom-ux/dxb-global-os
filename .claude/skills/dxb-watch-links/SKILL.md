---
name: dxb-watch-links
description: Use when the CEO sends links to look at — his WhatsApp group of saved links ("WhatsApp'a attığım linkler", the "Claude Code" group), one video, reel, repo or post ("şunu izle", "bunu incele") — to watch each one from its real content and judge it as the holding's engineer — is it real, is it useful for the holding or for our sessions, where would it go, how would we apply it. Rival systems studied for the Ferrari go through dxb-rival-intel instead.
---

# Watch the links he sends, and judge them as his engineer

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

Many links → `python3 -I $K/xlsx.py $J <file.xlsx>` (needs openpyxl in a venv) → `SendUserFile`, and
two or three lines in Turkish: how many, which few are worth acting on, what waits on his yes.
A few links → answer in the conversation, plainly. Nothing is installed or started without his word.
