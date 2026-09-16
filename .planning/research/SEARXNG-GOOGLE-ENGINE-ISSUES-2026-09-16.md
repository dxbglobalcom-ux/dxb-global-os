# SearXNG issue tracker — the Google engine in 2026

Measured 2026-09-16, ~21:35–21:50 UTC. Question: *"What does SearXNG's own issue tracker say
about the Google engine in 2026? Give the issue number, its title and the date it was opened."*
Run mode: LIGHT (no money out, no contract, nothing leaves the house).

## The tracker (the roster is closed on it)

| fact | value | door |
|---|---|---|
| tracker | github.com/searxng/searxng — `has_issues: true`, `archived: false`, `disabled: false` | GitHub API |
| last push | 2026-09-16T14:49:17Z (alive today) | GitHub API |
| issues opened in 2026 | **174** (PRs the same period: 696) | GitHub search API |
| issues with **google** in the title, 2026 | **21** — 3 open, 18 closed | search API `total_count` |
| same number, independent path | **21** — all 174 issues enumerated, `grep -ic google` on titles | list enumeration + local grep |
| issues carrying the label **`google-engine`**, 2026 | **6** | search API + local awk |
| union (title ∪ label) | **22** — #6359 is labelled but has no "google" in its title | local awk |
| any mention of google (title+body), 2026 | 39 | search API |
| `google-engine` label, all time | 25 issues; 7 currently open, **all opened 2022–2025** | search API |
| commits to `searx/engines/google.py` in 2026 | **14** | GitHub commits API |

The GitHub page header reads "Issues 170" while the API reports `open_issues_count: 218`; the
difference is the 48 open pull requests the API counts as issues. Not a contradiction.

## The single decisive 2026 issue

**#6359 — "GSA for iPhone useragent do no longer work" — opened 2026-07-03.**
Author `emirhansrchggl-cmd` · labels `bug`, `google-engine` · **51 comments** (the most-discussed
issue of any kind opened in 2026) · closed **2026-08-22** as `completed` by PR **#6546**
*"[fix] google: use Nokia UA"* (merged 2026-08-22).

Its own words: *"Google released a new update on July 1st. Now, when I perform a search using any
keyword while logged out, the request returns an 'enable JS' error. Before July 1st, we could
bypass this issue by adding 'NSTNWV' to the User-Agent string, but that method no longer works."*

Confirmed through three independent doors: GitHub REST API, GitHub search API, and a plain
scrapling HTML fetch of the page (which renders "opened on Jul 3, 2026", labels bug/google-engine,
"Closed #6546").

## The full 2026 roster — 21 by title, in the order they were opened

| # | opened | state | comments | title |
|---|---|---|---|---|
| 5673 | 2026-01-17 | closed | 2 | Google search result URLs are always percent-encoded, messing up URL parameters |
| 5768 | 2026-02-22 | closed | 1 | Google stopped responding |
| 5838 | 2026-03-10 | closed | 1 | Google's search operator isn't working |
| 5843 | 2026-03-11 | closed | 7 | Regressions in Google engine |
| 5852 | 2026-03-12 | closed | 6 | [Bug] Google News Engine returns 0 results — HTML Structure & Protobuf URL Encoding Changes |
| 5867 | 2026-03-17 | closed | 14 | Bug: google engine - HTTP 403 |
| 5958 | 2026-04-09 | closed | 1 | [bug] google broken again |
| 6005 | 2026-04-23 | **open** | 0 | Google Dataset Search |
| 6171 | 2026-05-29 | closed | 2 | [Google engine] Successful responses can produce no parsed results without diagnostics |
| 6226 | 2026-06-09 | closed | 1 | Google News not returning proper content and thumbnail |
| 6256 | 2026-06-13 | **open** | 3 | Google News: content field returns timestamp instead of snippet. |
| 6374 | 2026-07-07 | closed | 1 | Google autocomplete doesnt works anymore |
| 6380 | 2026-07-08 | closed | 9 | Google CSE Unnecessary Images |
| 6441 | 2026-07-23 | closed | 1 | Google CSE Unexpected Regional Results |
| 6453 | 2026-07-26 | closed | 9 | google engine has no reuslts |
| 6518 | 2026-08-13 | closed | 3 | Google CSE failing |
| 6524 | 2026-08-14 | closed | 2 | Google CSE returning terrible results |
| 6567 | 2026-08-22 | **open** | 1 | Voluntary client-side google solver to fix google forever? |
| 6570 | 2026-08-23 | closed | 1 | Google fully blocks requests with Nokia User-Agent |
| 6729 | 2026-09-15 | closed | 1 | Bug: google engine |
| 6732 | 2026-09-16 | closed | 1 | Bug: google engine |

Plus **#6359** (2026-07-03) — labelled `google-engine`, no "google" in the title.

## What the tracker actually SAYS, in its own dates

- **2026-03-17, #5867** (14 comments, `google-engine`+`bug`, closed completed): *"Google appears to
  have changed its bot protection today; all requests to Google are being rejected with an HTTP 403
  error."* Technical report: `SearxEngineAccessDeniedException`, `HTTP error 403 (suspended_time=180)`,
  percentage 100.
- **2026-07-03, #6359**: the July 1st Google update kills the GSA-for-iPhone User-Agent.
- **2026-08-22**: PR #6546 lands the Nokia User-Agent workaround; #6359 is closed the same day.
- **2026-08-23, #6570** — *one day later*: *"This worked for a while, but today it stopped working
  again. Google seems to be completely blocking requests with the Nokia User-Agent."* Closed
  2026-09-04, the day after the `[mod] network: migrate to curl_cffi` commit (2026-09-03).
- **2026-08-22, #6567** (open, `new feature`): a maintainer-unresolved proposal for a *"voluntary
  client-side google solver"*, whose own justification is *"Google is notoriously difficult nowadays
  and every method gets patched quickly… We could keep playing the cat and mouse game."*
- **2026-09-15 / 2026-09-16, #6729 and #6732**: identical title "Bug: google engine", body is the
  untouched bug template with every field blank. Both closed `not_planned`, label **`invalid:slop`**.
  These are the two newest Google entries on the tracker and the project threw both out.

The 14 commits to `searx/engines/google.py` in 2026, in date order: GSA-for-iPhone UA (01-11),
URL decoding (01-19), remove arc/async params (03-07), mobile XPaths (03-10), image thumbnails
(03-15), Google App Android UA (03-23), drop `__Secure-ENID` header (03-24), CAPTCHA detection
(05-15), language traits (06-15), google CSE engine added (07-04), remove obsolete GSA UAs (07-05),
Nokia UA (08-20/22), curl_cffi migration (09-03).

## Where I did not look

- Only the GitHub tracker was counted. SearXNG's Discussions, Matrix room and mailing list were
  not searched — the question named the issue tracker.
- Issue **comments** were read only on #6359 (last 8 of 51) and the bodies of #5867, #6567, #6570,
  #6729, #6732. The other 16 titles were counted, not read in full.
- No live probe of a running SearXNG instance's Google engine, and no reading of searx.space's
  "Google response" column — so "is it broken right now" is UNVERIFIED here; the tracker's own
  answer is "no open Google-breakage bug as of 2026-09-16".
- `scrapling extract` (CLI form) returned zero bytes; the scrapling **MCP** door returned the page.
  One door of eleven failed, the next opened.

## What would flip this

If GitHub's search index lags, the 21 could be low. It was checked against a full enumeration of
all 174 2026 issues, which agreed exactly. A new Google-breakage issue opened after 21:50 UTC on
2026-09-16 would not be in this count.

---

## Re-measured independently — run `20260916-213702`, 2026-09-16 21:37–21:45 UTC

A second session was asked the same question with no sight of this file until after its own
measurement. It re-ran the tracker from scratch (GitHub REST + search API, then a scrapling HTML
fetch of five issue pages and the `google-engine` label page). Every load-bearing number above
reproduced exactly: **174** issues opened in 2026 · **21** with "google" in the title · **6**
carrying the `google-engine` label · **25** on that label all time · **39** mentioning google in
title or body · **14** commits to `searx/engines/google.py` · #6359 opened 2026-07-03, closed
2026-08-22, 51 comments · #5867 opened 2026-03-17 (page HTML renders *"opened on Mar 17, 2026"*).

Two things this run adds:

- **#5867 carries 21 reactions — the most of any 2026 Google issue** (#6359 has 3). By comments
  #6359 leads; by the number of people who pressed a button to say "me too", #5867 does. Both are
  named in the answer rather than one being presented as *the* issue.
- **#5867 was opened by the maintainer `return42` himself**, not by a user — which is why it reads
  as a status report rather than a bug report, and why it is the cleanest single sentence the
  tracker has on the Google engine in 2026.

Ledger: `.claude/skills/dxb-research/runs/20260916-213702/ledger.jsonl` — 6 evidence rows
(all six opened at the `scrapling` door — the first door in the chain of eleven that applies to an HTML page; no stealth, no fallback needed), 33 discovery rows, 1 cluster. One cluster is
inherent here: the question names a single tracker, so github.com is 100 % of the evidence share.
