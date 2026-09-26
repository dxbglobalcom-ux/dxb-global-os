---
name: dxb-research
description: Use when a question needs the outside world — a tool, product, company, market, rival, technology, price or trend, or what people really say about something. A toolbox, not a procedure — you research yourself, reach every platform where people talk with the commands below, keep what you find as evidence rows, and answer like Perplexity — the answer first, the source beside each claim, in front of him at once.
---

# Research — the toolbox

You do the research. This file only tells you which tool reaches which platform and how what you find
stays. Read only: never like, comment, follow, post, share or message — the accounts are his. Nothing
opens on his screen: browser-backed reads run in the hidden Chrome that carries a copy of his sessions.

```bash
S="/home/dxb/DxB Global OS/.claude/skills/dxb-research"; export PATH="$S/bin:$PATH"   # opencli -> hidden Chrome
```

## Two roads — you choose, nobody asks him

- **Quick** (a fact, a price, a date; ≤ 3 minutes): you + the sweep or one platform command below +
  `bash "$S/scripts/ask.sh" "<3-6 words>" <outdir>`. Page at once.
- **Deep** (what people think, a comparison, a market; ≤ 15 minutes end to end): the fleet — seven hunters,
  one per platform group, Opus 5.5 · low (his word, 2026-09-26), each reading EVERY address of its
  platforms and accounting for the unread:
  `bash "$S/fleet/fleet.sh" <outdir> --q "<3-6 words>" [--q "<another phrasing>"] [--dert <his-words.txt>]`.
  It opens the ground, turns it into evidence rows, launches the hunters, counts the crowd, and prints
  the coverage table; its writer step then writes `answer.md` from the rows (below). You write it
  yourself only for a quick question.

## Where to look — one command per platform

| Platform | Command |
|---|---|
| Everything at once (40 channels, seconds) | `bash "$S/scripts/sweep.sh" "<3-6 words>" <outdir> --tier max --pages 8` |
| Web | WebSearch · `bash "$S/scripts/mcpx.sh" exa\|tavily\|parallel\|youcom\|firecrawl "<q>" 10` |
| Google | `python3 "$S/scripts/hidden.py" google "<q>"` |
| X | `opencli twitter search "<q>" -f yaml` · a thread: `opencli twitter thread <url> -f yaml` |
| YouTube | `opencli youtube search "<q>" -f yaml` · `opencli youtube transcript <url> -f plain` · `opencli youtube comments <url> --limit 100 -f yaml` |
| TikTok | `opencli tiktok search "<q>" --limit 20 -f yaml` |
| Instagram | find: `mcpx.sh exa "instagram.com <q>" 10` · read: `python3 "$S/scripts/hidden.py" read <url> --text` |
| Facebook | `opencli facebook search "<q>" -f yaml` · a post: `hidden.py read <url> --expand 'See more' --text` |
| LinkedIn | find: `mcpx.sh exa "linkedin.com/posts <q>" 10` · read: `hidden.py read <url> --text` |
| Reddit | `opencli reddit search "<q>" -f yaml` · a thread in full: `opencli reddit read <url> --limit 100 --depth 10 --replies 50 --expand-more true --expand-rounds 5 -f yaml` |
| Reddit, people counted | `bash "$S/scripts/crowd.sh" urls.txt <outdir> --workers 6` — the only real head-count |
| Hacker News | `opencli hackernews search "<q>" -f yaml` · `opencli hackernews read <url> -f yaml` |
| Quora | `hidden.py read <url> --text` |
| GitHub | `gh search issues "<4 words>" --json title,url,state,createdAt` · `gh search repos "<q>"` |
| Chinese | `opencli zhihu\|weibo\|xiaohongshu\|bilibili search "<q>" -f yaml` |
| A page that refuses | `python3 "$S/scripts/fetch.py" <url>` — tries its twelve doors in order |
| Video subtitles, PDF | `yt-dlp --write-auto-sub --skip-download <url>` · `pdftotext -layout f.pdf -` |

## What you find stays — evidence rows, written by the fetcher

Every quote lives in `<outdir>/evidence.jsonl`, one row per quote, with an id `L0001…`. The fetcher
writes the row; you only choose the quote and cite the id — a quote that is not in the fetched body
cannot become a row, so a quote on the page always comes from a body the fetcher brought (the run
folder is the hunters' own, so the guarantee is the interface, not a wall). A post whose body the sweep
already brought carries it from the start (X, Reddit); `fetch` opens the thread and its replies.

```bash
python3 "$S/scripts/evidence.py" from-ground <outdir>                      # the sweep's raw files -> rows
python3 "$S/scripts/evidence.py" list <outdir> --platform x                 # every address of a platform: id · url · title · liveness
python3 "$S/scripts/evidence.py" list <outdir> --platform x --no-body       # only those with no body yet (skip blocked / dead)
python3 "$S/scripts/evidence.py" fetch <outdir> --url <url> --print         # read a body; a closed door is recorded
python3 "$S/scripts/evidence.py" add <outdir> --url <url> --quote "<verbatim>" [--author A --date D]   # -> L0042
python3 "$S/scripts/kapsama.py" <outdir> --answer <outdir>/answer.md        # the coverage table, nine columns + RECONCILED
```

## How to work
- Go where the subject lives. For what people think: X, Reddit, YouTube, TikTok, LinkedIn, HN and the
  other languages — every one that can hold the answer. What you gather goes into rows, not into memory.
- Short queries (3–6 words), never his sentence. Many calls in parallel. A tool that answers nothing
  twice is dead for this question: move on, the coverage table says so.
- Never type the holding's own names, unreleased work or a secret into a search box. External cost is $0
  (the hunters run on his subscription).
- Is the engine working today? `R="$S/scripts"; bash "$R/probe.sh"` — one line per channel, the closed ones named.

## The answer — like Perplexity, in the CEO's shape
On the deep road the fleet's writer step writes `<outdir>/answer.md` — Opus 5.5 · high, from the rows the
hunters left (on by default; `--no-write` skips it, `--write-only <outdir>` runs it alone). For a quick
question you write it yourself, the same way — in Turkish, from the rows only:
- The first 1–2 sentences ARE the answer. Then the number that carries it (count, share, denominator).
  Then what would change it and whether that was looked at. Contradictions left standing are named.
- Every claim carries its row: `… [L0042]`. No address, no quote text in the answer — the page prints
  the quote, the author, the date and the address from the row. A number of people is a count only when
  `crowd.sh` counted it; anything else says "about". A comparison is a table.
- **Beside every claim, the count** (his order, 2026-09-26): how many rows say so, of how many read —
  `9 of 16 X posts` — with the strongest two as the examples; the rest are not dropped. **Under the
  page, one section per platform** (X, YouTube, Reddit …) listing EVERY row the hunters brought there
  as an openable address with its author and quote, long ones shortened — so he can browse the 130.
- Then `python3 "$S/scripts/render.py" <outdir>/answer.md --evidence <outdir>/evidence.jsonl` writes
  `final.html` (and `final.md`) from the rows: the verdict on top, `(n satır)` beside every claim, a quote
  card for every cited row, "Nereye bakıldı" (the coverage table) and the per-platform drawer.
- Publish `final.html` as a designed Artifact through the Artifact tool and put it in front of him
  **at once**. No question first, no "md mi sayfa mı" (his word, 2026-09-26). Nothing is saved to the
  repository unless he says **"kaydet"**: then copy `final.html`, `final.md` and `evidence.jsonl` to
  `.planning/research/answers/<YYYYMMDD-HHMM>-<slug>/`.
