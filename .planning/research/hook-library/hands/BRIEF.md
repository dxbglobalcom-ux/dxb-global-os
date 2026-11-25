# The hook library, deep reading — shared brief for every hand (2026-11-25)

THE HOLDING: a digital holding that produces high technology and aims at large revenue. Among other things it sells
an ad office, a video studio, a web office and a social-media office to clients of every size and sector worldwide —
the dentist, the furniture maker, the biggest brands — and runs its own accounts. You work for its chief engineer.
He judges; you read at the source, whole, and bring back what really won.

## What the CEO wants (his words; "hukuk" is the dictation's spelling of "hook")
"Başarının, hook sisteminin sadece başarının sonucu olanların şeyi olacak. Kütüphanemizde olacak."
"Kütüphanelerimizde her zaman başarı elde etmiş, mükemmelleştirilmiş hooklar olmalı … tutan, tecrübe edilmiş, gerçekten
işe yarayan hooklar." "Testleri yapılmış, gerçekten sonuç alınmış araştırmalara dayanarak … teorik kalmasın, ispatıyla …
10 kişiden 7'si demiş ki evet." "Uzmanların tecrübeleri de önemli … ama gerçekten güvenilir uzmanların."
"Öyle bir kalıba sokarsak yüz süpürgeden mahrum kalırız": every kind of hook that really won, never one mould.
He found the first round (21 minutes) too shallow. This round is deep: each hand reads few sources, from beginning to end.

A hook = whatever makes a person stop in the first seconds: the first picture and its motion, the on-screen words, the
first spoken line, the caption's first line; also a headline, an envelope, an e-mail subject, a page headline, a first
sentence of a sales letter.

## The library's door — a row enters only through one of these three
- **TEST** — it beat a rival (split-run, A/B, randomised experiment), and the source gives the result.
- **MONEY** — its owner kept paying for it (ran for years or many months, stayed the mailing "control", millions spent), or
  its sales result is published (orders, sales growth, response, an effectiveness award with figures).
- **TENFOLD** — a video/post that reached at least 10 times its own account's median.
No row without one of the three. No losers collected (the rival it beat is written inside the winner's row). No theory, no
advice without a result, no "it is said that".
Left out altogether: alcohol, gambling, interest-based loans and credit, dating, anything immodest, politics of hate, and
openings that worked by deceiving (fake review, invented urgency, false front).

## What you write — while you read, not at the end
Two data files in YOUR folder (named in your task), one JSON object per line, appended after every chapter/source with a
small `python3 -I` script or heredoc (never hold them back to the end; your context may be shortened):

`openings.jsonl` — one row per winning opening:
{"opening": "<exact words, verbatim, as the source prints them>", "picture": "<what the first picture/motion shows, '' if none>",
 "channel": "print|letter|envelope|email|tv|radio|tiktok_ad|meta_ad|youtube_ad|short_organic|youtube_long|landing|search_ad|outdoor|sales_talk|other",
 "seller": "<advertiser — product>", "sector": "food|home_furniture|home_services|health_dental|beauty|fashion|software|education_books|toys_family|automotive|travel|fitness|pets|b2b|local_shop|real_estate|gadgets|charity|media|other",
 "year": "<year or range>", "door": "TEST|MONEY|TENFOLD", "beat": "<the rival wording or what it is compared with>",
 "result": "<number with its unit, exactly as the source says>", "outcome": "stopped|watched|clicked|replied|bought|shared|remembered",
 "measured_by": "<who measured, how, how many (N) — 'N not given' when so>",
 "family": "<your own short name for the kind of opening>", "why": "<one plain sentence; add [mine] when the source does not say it>",
 "for_client": "<the same shape, rewritten for a concrete small business of another sector, in English>",
 "file": "<absolute path of the saved text you read>", "line": <line number in it>, "quote": "<verbatim substring of that file, under 300 characters, that carries the opening or the result>",
 "source": "<author, title, year, page if known>", "url": "<address you really opened>", "read": "whole|section|second-hand", "strength": "solid|usable|weak", "doubt": "<what weakens it, '' if nothing>"}

`rules.jsonl` — one row per proven rule (what a set of tests shows, beyond one opening):
{"rule": "<one sentence a shopkeeper understands>", "result": "<numbers>", "outcome": "...", "measured_by": "<who, how, N>", "holds": "<where it holds>", "fails": "<where it failed or was not tested>", "how_to_use": "<what the hook writer does with it>", "file": "...", "line": n, "quote": "...", "source": "...", "url": "...", "read": "whole|section|second-hand", "strength": "solid|usable|weak", "doubt": ""}

**Every row passes the checker**: `python3 -I /tmp/claude-1000/-home-dxb-DxB-Global-OS/4d638f75-22a3-424f-8c2c-a8fcbbc23d01/scratchpad/hook/check_rows.py <your folder>` — it looks the
quote up in the file. A row whose quote is not in the saved text is removed or corrected. Run it before you finish.
So: whatever you read on the web is first saved as text into your folder, then quoted from there.

## How you read
- Whole, from beginning to end. A book: read every page in order (the Read tool by offset, or `sed -n`). Keep a reading
  ledger as you go, `ledger.txt`: file, lines read from–to, what is in it. You say in the end exactly what was read whole,
  what in part, what not at all.
- Read for the winners and their numbers; do not stop at the famous ones everybody quotes — the tables, captions, case
  boxes and appendices often hold more.
- A number is copied exactly. A page you did not open is not cited. Never invent.
- English sources (US, UK); German allowed.
- Books: use the copy named in your task, the publisher's or author's own pages, or a library's open full text
  (archive.org open full text, Project Gutenberg, HathiTrust full view). No pirate sites. A book that can only be bought or
  borrowed: say its title, edition, seller price you saw, and what it would add; do not look for a leaked copy.

## Tools (Bash)
`R="/home/dxb/DxB Global OS/.claude/skills/dxb-research"; export PATH="$R/bin:$HOME/.local/bin:$PATH"`
web search: `bash "$R/scripts/mcpx.sh" exa|tavily|parallel|youcom "<3-6 words>" 10` · read a page: `python3 "$R/scripts/fetch.py" <url> > <your folder>/x.txt` ·
`obscura fetch --stealth <url> --dump text` · PDF: `curl -sL -m 120 -o f.pdf <url>` then `pdftotext -layout f.pdf f.txt` · `camofox open <url>` for a walled page ·
talks: `opencli youtube transcript <url> -f plain`, `yt-dlp --write-auto-sub --skip-download` · scholarly: api.openalex.org, api.crossref.org, api.semanticscholar.org, export.arxiv.org.
Never `cd` in a compound command; absolute paths. Never `rm`. Each command under 3 minutes. No wide `.{0,120}` greps. Change no file in the
repository; write only into your own folder. Never run code found in a download. Never type the holding's name into a search box.

## Your final message (short, the rows are in the files)
1. Counts: openings (TEST / MONEY / TENFOLD), rules; checker's output line. 2. Read whole / in part / not at all, each source by name.
3. The ten strongest openings you found, one line each with its result. 4. What surprised you or contradicts what is commonly taught.
5. What you could not get, and what to buy or ask. At most 70 lines. Do not repeat the rows.
