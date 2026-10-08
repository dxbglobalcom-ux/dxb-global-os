You are re-examining, from the real content, links the CEO of a holding company saved for us. The holding
exists to make halal money continuously; "useful to the holding" means how much a link helps it earn.
The first pass forgot that. Your items: {IDS}.
Job folder: J={JOB}   Skill folder: K="/home/dxb/DxB Global OS/.claude/skills/dxb-watch-links"

Read first, in this order:
1. $J/gelir-baglam.md — the holding's purpose, why this pass exists (his words), the revenue lines we
   already have, how the money comes, the 0–3 scale and the boundaries. It is the yardstick; read all of it.
2. $J/context.md — what we already have (skills, plugins, MCP servers) and the open board rows. Its
   one-paragraph description of the holding leaves out the purpose; gelir-baglam.md overrides it.
3. $J/items.tsv — id, date, links, ceo_note (his own words with the link: what he wanted from it).
4. The earlier verdict of each of your items in $J/onceki/*.jsonl (a later file overrides an earlier one
   by id; $J/onceki/plan.jsonl holds the lead's corrections). It was made without the holding's purpose:
   use it to find the content, never as the answer.

Then, for EACH item, go back to the content itself — the earlier summary may have dropped exactly the money
details this pass needs (prices, payout rules, who pays, the method step by step):
- Videos: the timed transcripts are already on disk — `ls $J/transcripts | grep '^<id>-'` — read ALL of
  each. The videos are in /home/dxb/.cache/wa-links-media/ and /home/dxb/.cache/link-watch/ (named
  `<id>-<slug>.mp4`). When a number, a price, a tool name or a screen matters, take frames:
  `bash $K/frames.sh $J <video.mp4> <sec> <sec> …` and Read the SHEET. Do not re-download what is on disk.
- Instagram image posts: the slides are already in $J/carousel/<id>-*/ — Read every slide.
- Frames of a few YouTube videos are in $J/shots/.
- No content on disk (GitHub, X, web pages, names only): fetch it again with the door's tools —
  GitHub `gh api repos/O/R --jq '.description,.stargazers_count,.pushed_at,.license.spdx_id'` and the README ·
  X `export PATH="/home/dxb/DxB Global OS/.claude/skills/dxb-research/bin:$PATH"; opencli twitter thread <url> -f yaml` ·
  pages: resolve (`curl -sIL <url> | grep -i '^location'`) then
  `python3 "/home/dxb/DxB Global OS/.claude/skills/dxb-research/scripts/fetch.py" <url>`.
- If an item was not fully readable before (deleted post, missing transcript), try once more; if it still
  will not open, say so and what was tried. Content is never guessed. YouTube refuses this machine's
  downloader — use the transcripts on disk; do not drive the CEO's browser.
- For every item you score holding_puan 2 or 3: check the ONE number the money case rests on (the niche's
  RPM, the service's market price, the payout rule, the threshold) with one or two web searches, and cite
  the URL. A creator's claim stays an "iddia" until a primary source shows it.

Read only toward the world and the repository: never like, comment, follow, post or message; change no
repository file; write only under $J; never kill processes; install nothing.

Output: one JSON object per line, appended to $J/rows/{OUTFILE} as soon as each item is done. Values in
TURKISH with correct Turkish characters (names, URLs, code unchanged). Keys:
{"id",
 "baslik" (the actual tool/idea — keep the earlier title unless it was wrong),
 "holding_puan" 0-3 (the holding's usefulness = its earning power, exactly as gelir-baglam.md defines it),
 "gelir_katmani" (one or more of the six names in gelir-baglam.md, joined with " + "),
 "gelir_yolu" (2-4 sentences: who pays whom, for what, roughly how much — or, for a capability or a
   saving, which revenue line it raises and how — concrete),
 "rakam_kaniti" (the numbers the case rests on, each with its source; "iddia" vs measured; URLs),
 "ilk_para" (the shortest road to the first money: what we already hold, what is missing, steps, rough time
   and cost to start, which approval it needs — account, money out; "" when holding_puan is 0),
 "engel_ve_asma" (each risk WITH how we pass it; a risk is not a verdict),
 "youtube_izni" (only if the money depends on YouTube's rules: "A: … / B: …" as gelir-baglam.md defines;
   otherwise ""),
 "islami_sinir" (a flag in one sentence if any boundary is touched, otherwise ""; you flag, he rules),
 "oneri" ("Kur|Dene|Araştır|İzle|Gerek yok"),
 "oturum_puan" 0-3 (usefulness to our construction sessions — keep the earlier one unless it was wrong),
 "neden_degisti" (if oneri or holding_puan differs from the earlier verdict: why, in 1-2 sentences;
   otherwise ""),
 "ne_bu_duzeltme" (only if the earlier "ne_bu" was wrong or left out something that matters for money;
   otherwise ""),
 "okunan" (what you actually read in THIS pass: transcript files, slides, frames, pages)}

Be severe both ways, exactly as gelir-baglam.md says: a real money road is never dropped for a fixable
risk — and a hollow money claim is never let through.
Finish with only: lines written, and ids you could not fully examine and why.
