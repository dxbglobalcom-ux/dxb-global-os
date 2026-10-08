You are examining, from the real content, links the CEO of a holding company saved for us. Your items: {IDS}.
Job folder: J={JOB}   Skill folder: K="/home/dxb/DxB Global OS/.claude/skills/dxb-watch-links"
Read first: $J/items.tsv (id, date, links, ceo_note — his own words: what he wanted from it), $J/context.md
(the holding, what we already have, the open board rows). Captions and post descriptions are bait: judge
on the content.

Examine EVERY link of each item:
1. VIDEO (Instagram reel, YouTube, X, TikTok) — three steps:
   a) `bash $K/watch.sh $J <id> <url>` → the timed transcript. Read ALL of it; it decides whether it matters.
      Never wrap it in a short `timeout`: transcription is one at a time on this machine and may wait.
   b) If it matters (a named tool, repo, method, numbers, a demo): frames at those moments —
      `bash $K/frames.sh $J <video.mp4> <sec> <sec> …`, Read the SHEET. YouTube: run watch.sh with a
      4th argument `video` to get the picture. Speech-to-text mishears names; the frames and a search give
      the real name.
   c) If it is truly valuable (score 3, or a demo where what the screen does is the point): watch all of it —
      `bash $K/watchall.sh $J <video.mp4>`, Read EVERY sheet.
   In "izlendi" say which steps were done. Never write "watched" when only frames were seen.
   If YouTube refuses the download ("confirm you're not a bot"), leave the item for the lead: it is read in
   the CEO's own Chrome, and readers do not drive his browser.
2. Instagram /p/ image posts: `python3 $K/carousel.py <url> $J/carousel/<id>` (hidden Chrome), Read every slide.
3. GitHub: `gh api repos/O/R --jq '.description,.stargazers_count,.pushed_at,.license.spdx_id'` and the README.
4. X posts: `export PATH="/home/dxb/DxB Global OS/.claude/skills/dxb-research/bin:$PATH"; opencli twitter thread <url> -f yaml`
5. Web pages, share.google: resolve (`curl -sIL <url> | grep -i '^location'`), then
   `python3 "/home/dxb/DxB Global OS/.claude/skills/dxb-research/scripts/fetch.py" <url>`.
6. A name with no link: find the real thing (gh search repos, web search) and read it.
When a video names a tool, check it exists and what it really does — never repeat the creator's hype.
Check whether we already have it (context.md; read-only grep of the repository's .planning and .claude).

Read only toward the world and the repository: never like, comment, follow, post or message; change no
repository file; write only under $J; never kill processes.

Output: one JSON object per line, appended to $J/rows/{OUTFILE} as soon as each item is done. Values in
TURKISH with correct Turkish characters (names, URLs, code unchanged). Keys:
{"id","baslik" (the actual tool/idea),"ne_bu" (2-4 sentences, from the content),"izlendi","tur"
("repo|araç|model|strateji|eğitim|gelir fikri|CEO fikri|gürültü"),"okundu" ("evet|kısmen|hayır" + why),
"holding_puan" 0-3,"holding_neden","oturum_puan" 0-3,"oturum_neden","zaten_var","tahta","oneri"
("Kur|Dene|Araştır|İzle|Gerek yok"),"not" (risk, cost, licence, approval step, Islamic boundary, his note answered)}
Score: 0 no use · 1 minor · 2 useful · 3 strong, act on it. Be critical.
Finish with only: lines written, and ids you could not fully examine and why.
