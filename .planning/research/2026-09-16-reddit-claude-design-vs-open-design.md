# Reddit community size — Claude Design vs Open Design

**This file holds ONE record: the live measurement.** Run `20260916-211134`
(`.claude/skills/dxb-research`, LIGHT mode), measured 2026-09-16 21:11–21:22 UTC from this
machine. Nothing below was quoted from the four earlier runs of the same question the same
day — every figure was taken again from the instruments in this session, and the roster was
closed again before anything was counted. The earlier runs are compressed into one history
block at the bottom, so the record cannot disagree with itself (LAW A).

Question, verbatim: *"Which has the larger live community on Reddit: Claude Design or Open
Design? Answer with the measure you used and BOTH numbers."* Class: **counting**.

---

## The answer

**Claude Design — by about 1,700 ×.**

| The measure | Claude Design | Open Design |
|---|---:|---:|
| **Members (`subscribers`) — the measure the answer is given on** | **23,798** | **14** |
| Weekly visitors (Reddit's own liveness counter) | 26,450 | 9 |
| Weekly contributions (posts + comments written this week) | 101 | 0 |
| Posts in the last 24 h / 7 d / 30 d | 3 / 13 / 71 | 0 / 0 / 0 |
| Comments on the last 100 posts | 1,021 | 0 |
| Distinct people who posted (last 100 posts) | 89 | 1 |
| Newest post | **2026-09-16, today** (`created_utc` 1789573292) | 2026-06-19 — its founding post, the only one it has ever had |

Counted **symmetrically**: every Reddit community belonging to each tool, summed — not one
community on one side against two on the other. The totals are arithmetic performed by this
session over the roster below; no single page states a total. Ratio on the answer's measure:
**23,798 / 14 ≈ 1,699.9 : 1**.

---

## The roster, closed before the count

| Community | Side | Members | Existence door |
|---|---|---:|---|
| **r/ClaudeDesign** (`t5_hh3fbt`) | Claude Design | **23,795** | opencli ×2 (21:14, 21:18 — identical) + served HTML header |
| r/ClaudeDesigns | Claude Design | 1 | opencli |
| r/ClaudeDesigners | Claude Design | 1 | opencli |
| r/claude_design | Claude Design | 1 | opencli |
| **CLAUDE DESIGN TOTAL** | | **23,798** | arithmetic by this session |
| **r/opendesignCLI** (`t5_ii7kwx`) | Open Design | **11** | opencli + Reddit's community directory |
| r/OpenDesignAI (`t5_hn3dvr`) | Open Design | 3 | opencli + served page |
| **OPEN DESIGN TOTAL** | | **14** | arithmetic by this session |
| r/OpenDesign · r/opendesign | Open Design | **banned — 0** | opencli `HTTP 404`; browser: *"r/OpenDesign is banned. This subreddit was banned due to being unmoderated."* |
| r/OpenDesignHQ · r/nexulabs | Open Design | do not exist | opencli, no subscriber row |
| r/ClaudeAI (the parent house) | context | 1,134,293 | opencli |

**The detector was calibrated before its negatives were believed.** A control name that cannot
exist, `r/qwzxmvbn7731`, returns the identical *"malformed"* answer that `r/OpenDesignHQ` and
`r/nexulabs` return — so that string means "no such community", not "the tool failed". Reddit's
own community directory was read for `claude design` and `open design` and returns **no further
community belonging to either tool**.

**Neither side is official.** r/ClaudeDesign's own description: *"This subreddit is not an
official Anthropic subreddit."* r/OpenDesignAI's own: *"We are not affiliated with or endorsed
by Nexu Labs."*

---

## The doors — and the ones that failed

| Measure | Door 1 | Door 2 | Door 3 |
|---|---|---|---|
| **Members** | `OPENCLI_WINDOW=background opencli reddit subreddit-info <name> -f json` (real Chrome, invisible to the CEO), run twice 4 minutes apart | *(no second member instrument exists on this machine)* | third-party stats sites, for r/ClaudeDesign only: freesubstats **23,737**, subriff **23,672** |
| Weekly visitors / contributions | the `weekly-active-users` / `weekly-contributions` attributes on `<shreddit-subreddit-header>` (scrapling `stealthy_fetch`, HTTP 200) | Reddit's own community directory (`/search/?q=…&type=communities`) — *"26K weekly visitors · 101 weekly contributions"* vs *"8 weekly visitors · 0 weekly contributions"* | — |
| Posts / comments / authors | `opencli reddit subreddit <name> --sort new --limit 100 -f json` | — | — |
| Existence / non-existence | opencli (`HTTP 404` or *"malformed"*) + the calibrated control | the served HTML (`<shreddit-subreddit-header>` present or the banned page) | the community directory |

**Failed, in the order the chain walks them:** `about.json` over curl with a browser UA →
**HTTP 403** on all five URLs · `api.reddit.com` and `oauth.reddit.com` → **HTTP 403** ·
`old.reddit.com` → **302 to a login wall**, empty body, and through the reading chain a
*"Welcome to Reddit"* wall that the chain counted as READ · `/subreddits/search.json` →
**blocked on all eleven doors** · scrapling's plain `fetch` → the Playwright Chromium binary is
**not installed** (`chromium-1223/chrome-linux64/chrome` missing; `stealthy_fetch` carried the
work) · freesubstats and subriff have **no page at all** for either Open Design community.

**So the member figure has ONE door, not two,** and that is said out loud. The second and third
doors confirm the DIRECTION on a different measure (26,450 vs 9 weekly visitors), not the number.

---

## Contradictions, left standing rather than averaged

1. **The two bare numbers on a rendered subreddit page are not members.** r/ClaudeDesign shows
   "26K / 101"; the HTML attributes prove these are `weekly-active-users="26450"` and
   `weekly-contributions="101"`. 26,450 is LARGER than the 23,795 membership because a visitor
   need not be a member. Anyone reading the page instead of the attribute would report 26K
   members and be wrong.
2. **The third-party stats sites lag and their growth claim does not reproduce.**
   freesubstats says r/ClaudeDesign has 23,737 members and grew *"+272 today (+1.16%)"*;
   subriff says 23,672. The live count is 23,795, and across today's runs it moved
   23,790 (20:01 UTC) → 23,795 (21:18 UTC), i.e. ≈ +90/day, not +272.
3. **r/OpenDesign answers two different stories** — `HTTP 404` to opencli, *"is banned … due to
   being unmoderated"* in a browser. Two doors, one conclusion: no live community there.

---

## What would flip the answer, and whether I went looking

Only a larger Open Design community on Reddit under a name nobody probed. This session probed
nine names plus a calibrated control and read Reddit's own directory for both terms; the four
earlier runs today probed twenty more. Nothing turned up. **A gap of 23,784 members cannot be
closed by a missed spelling.**

**The contradiction that matters to the CEO:** Open Design *is* discussed on Reddit — inside
other people's subreddits — and its own project sends its users to Discord, X and GitHub, not
to Reddit. So this measures **where each tool's own crowd gathers on Reddit**. It is not a
popularity verdict on the two tools. Measured in an earlier run today (`gh api
repos/nexu-io/open-design`): **96,560 stars · 11,218 forks · last push 2026-09-16** — the tool
is busy; it simply does not live on Reddit.

## Where this session did not look

Off-Reddit homes (Discord, GitHub Discussions, X) — a different question, not asked here · the
weekly-visitor counters of the three 1-member Claude satellites · the sweep's `producthunt`
channel **FAILED** (duckduckgo navigation error) and `hackernews`, `github-repos`,
`github-issues`, `stackoverflow` returned **empty** (17 of 22 channels worked) · LIGHT mode, so
**no second pass in this run** — the 18:42 and 20:08 runs were gated and each ran one.

---

## Earlier runs the same day — the numbers, compressed

Four runs measured the same thing before this one and none of them disagrees with it:
r/ClaudeDesign **23,779 → 23,781 → 23,781 → 23,790 → 23,795 (this run)** members;
r/opendesignCLI **11** in all five; r/OpenDesignAI **3** in all five; the three Claude
satellites **1 · 1 · 1**; weekly visitors **26,450 vs 8**; weekly contributions **101 vs 0**;
r/ClaudeAI 1,134,087 → 1,134,202 → 1,134,206 → **1,134,293**. **The Open Design side has not
moved at all today.** The roster grew 3 → 5 → 6 communities as successive second passes found
misspelled variants, and has been stable at six across the last three runs. Two engine defects
those runs found belong to **B46**, not here: `ingest.py:classify()` stamping every
`reddit.com` row *vendor*, and H18 not watching `ingest.py`.

---

*Evidence ledger: `.claude/skills/dxb-research/runs/20260916-211134/ledger.jsonl` — 22 evidence
rows, 190 discovery rows, 22 queries, 13 independent clusters, max channel share 0.154, gate
HARD checks all pass. The six decisive measurements are rows L0209–L0215 with their verbatim
transcripts. Earlier runs: `runs/20260916-184206/` and `runs/20260916-200833/` (each with
`claims.json`, `refutation.json`, `GAPS.md`).*
