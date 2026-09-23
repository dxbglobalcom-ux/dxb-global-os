# The ground — what is reachable from this machine, and what each place is good for

Measured 2026-09-16: `opencli list` reports **1332 commands across 167 sites**, plus 13
external CLIs. The sweep script opens a slice of it. This file is the rest of the map, so a
hunter picks a territory because the subject lives there — not because it was the first
thing that came to mind.

All of it is read-only here. Commands take `-f yaml` (also `json`, `md`, `csv`).

## Health check before a sweep — PROBE, do not ask

```bash
bash scripts/probe.sh   # one live call per channel, 20 s ceiling, in parallel
```

**Do not trust `agent-reach doctor` as health.** Measured 2026-09-16: it reported `reddit`
and `twitter` as `warn` while both returned real results in 16.9 s and 19.0 s, and reported
`github` as `warn` while `gh api rate_limit` answered 5 000/hr. Its own message says why —
it never executes the platform command, it only checks that a binary and a credential exist.
A router that trusted it would silently avoid channels that work, which is under-search by
another name. `doctor` is the MAP; `probe.sh` is the TRUTH.

```bash
opencli doctor          # is the Browser Bridge attached?
agent-reach doctor --json   # the map: channel -> tier -> backends -> what is missing
```

## The five keyless search doors — measured HTTP 200, no key, no account, no card

| door | endpoint | tools |
|---|---|---|
| Exa | `https://mcp.exa.ai/mcp` | `web_search_exa`, `web_fetch_exa` |
| Parallel | `https://search.parallel.ai/mcp` | `web_search`, `web_fetch` |
| Tavily | `https://mcp.tavily.com/mcp/` **+ header `X-Tavily-Access-Mode: keyless`** | `tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_research`, `tavily_feedback` |
| Firecrawl | `https://mcp.firecrawl.dev/v2/mcp` | `firecrawl_scrape`, `firecrawl_search`, `firecrawl_parse` |
| You.com | `https://api.you.com/mcp?profile=free` | `you-search`, `you-discover` |

```bash
bash scripts/mcpx.sh exa|parallel|tavily|firecrawl|youcom "<query>" [n]
bash scripts/mcpx.sh fetch-tavily "<url>"
```

Without the Tavily header the same endpoint returns **401** — a keyless claim is tested, never
believed. None of the five publishes its rate limit and none owes us anything; that is why
there are five and why every one has a fallback chain in `config/registry.yaml`.

## The reading chain — twelve doors, and a page is unread only when all twelve fail

```bash
python3 scripts/fetch.py <url>                        # shows every door it tried
python3 scripts/fetch.py --batch urls.txt --outdir D  # in parallel, writes FETCH-LOG.json
```

**the video's own subtitles** (`yt-dlp --write-auto-subs`, else `agent-reach transcribe`) →
**the PDF's text** (`pdftotext -layout`) → `scrapling` → `scrapling stealthy-fetch` →
**the platform's own reader** (`opencli reddit read`,
`hackernews read`, `twitter read`, `v2ex`, `youtube`, `zhihu`, `stackoverflow`) →
**his own signed-in browser** (`opencli browser`, his Chrome session) → `tavily_extract` →
`firecrawl_scrape` → `exa web_fetch` → headless Playwright →
`r.jina.ai` (**a cached snapshot**, labelled as one) → `curl` with a browser agent.

Measured 2026-09-16: 14 of 14 pages read — scrapling 10, tavily-extract 3, stealth 1. Four
pages needed between two and four doors; the ones that beat Scrapling twice were opened by
`tavily_extract` in about 400 ms.

## Adapters that REJECT `--window background` — and the one door that none of them reject

`--window`, `--site-session` and `--keep-tab` are registered only inside `if (cmd.browser)`
(`commanderAdapter.js`), so an adapter whose `--help` footer says **`Browser: no`** does not
have the option at all, and Commander exits 1 with `error: unknown option '--window'` before
the command runs. Measured 2026-09-16 on opencli 1.8.7, eight adapters, no exceptions:

| adapter | `Browser:` | `--window` accepted |
|---|---|---|
| hackernews · stackoverflow · bluesky · substack | no | **no — exit 1** |
| reddit · google · twitter · youtube | yes | yes |

**For one `Browser: no` command the fix is simply to DROP the flag** — not to set the
environment variable. `OPENCLI_WINDOW` is never read on a command that has no browser, proved
with a poison value: `OPENCLI_WINDOW=bogus opencli hackernews search` exits **0** with real
results, while `OPENCLI_WINDOW=bogus opencli reddit search` exits **2** with
`OPENCLI_WINDOW must be one of: foreground, background`.

**For a SCRIPT that calls both kinds, one `export OPENCLI_WINDOW=background` and no flag
anywhere is the right shape** — opencli's own adapter-independent override (README: *"Set to
foreground or background to override Browser Bridge window placement. Browser-backed commands
also accept `--window <foreground|background>`"*), read on both code paths
(`resolveBrowserWindowMode` for adapters, `getBrowserWindowMode` for `opencli browser *`) and
never readable, therefore never rejectable, by the rest. `sweep.sh`, `probe.sh` and `fetch.py`
all carry that shape now.

Nothing is lost by dropping the flag on a search command: the README states that
*"browser-backed adapters use a background adapter window ... by default"*, and **no search
command in the shipped `cli-manifest.json` declares a foreground default.** Do not turn that
into "every foreground default is a login command" — measured, **66 of the 69 are**; the other
three are `mercury check-login` (access read), `mercury reimbursement-draft` and
`midjourney action`, which WILL open a foreground window unless `OPENCLI_WINDOW` is set.

**One command in 1332 breaks the word "only".** `homebrew popular` is `Browser: no` and yet
owns an option spelled `--window` — its own **time** window (`30d / 90d / 365d`). It answers
`--window background` with `ARGUMENT / homebrew window "background" is not supported`, exit 2,
not with `unknown option`. Probed across **all 1332 commands**, each by parsing its own
`--help`: **1011 register the browser `--window <mode>` · 320 have no `--window` at all · 1
owns its own** — 1011 + 320 + 1 = 1332, zero probe errors, zero mismatches against the
manifest. (Do not copy the figure "310": that was a first pass whose probe left ten commands
undecided, because Commander's missing-required-option check fires before its unknown-option
check.)

**The export has one edge a per-call flag does not, and it cuts.** Precedence is
`--window` > `OPENCLI_WINDOW` > the command's own default, so a blanket export **overrides a
deliberate foreground default** — and a `login` command exists to be seen by the human.
Measured: `OPENCLI_WINDOW=bogus opencli mercury check-login` exits 2 with
`OPENCLI_WINDOW must be one of: foreground, background`, which proves the variable reaches
them. `sweep.sh` and `probe.sh` therefore both refuse to run if any channel line ever calls a
`login` verb.

**`background` is a request, not a guarantee.** Upstream issue **#2167** — *"Background window
steals focus on initial creation on macOS"*, opened 2026-07-23 against 1.8.6 — is still open.
macOS-scoped, no Linux equivalent found, but it is why nothing here promises the CEO's screen
stays clean.

A second, different cause of the same error string was upstream issue #1850 — the flag placed
*after* the leaf subcommand on `opencli browser <session> open <url> --window background`.
It is closed by PR #1963 and 1.8.7 carries the argv fix, so it is not what a sweep hits.

The logged-in sessions live in Chrome's **Profile 5 (dxb)**. If the bridge is down:
`opencli daemon restart`, then confirm Chrome is open. The `rdt` and `twitter` standalone
CLIs cannot read the keyring on this machine — always go through `opencli`.

For XiaoHongShu use **`opencli rednote`**, never `opencli xiaohongshu`: the account is on
the international side, and the mainland adapter returns a misleading `AUTH_REQUIRED`.

## Reading the page, not the headline

A search returns titles. The body is fetched with Scrapling (installed at
`/home/dxb/scrapling-env/`, v0.4.10, wired as an MCP server in the project):

| tool | when |
|---|---|
| `mcp__scrapling__get` | an ordinary page — returns markdown/text/html |
| `mcp__scrapling__stealthy_fetch` | the site blocks robots or needs JS |
| `mcp__scrapling__bulk_get` | a list of URLs the sweep produced |
| `mcp__scrapling__screenshot` | the layout itself is the evidence |
| `curl -s https://r.jina.ai/<URL>` | quick fallback, no session needed |

## Territories

**What the crowd says — English**
`reddit` · `hackernews` · `lobsters` · `twitter` · `bluesky` · `stackoverflow` ·
`producthunt` · `devto` · `medium` · `substack` · `lesswrong` · `linkedin`

Reddit carries the most honest complaint volume for software. Two commands matter beyond
search: `opencli reddit subreddit <name>` for a community's own posts, and
`opencli reddit subreddit-info <name>` for **subscriber count** — which is the single most
useful number for "which do people actually prefer", and the one the 2026-09-16 sweep
missed. `opencli reddit read <post-id>` opens the comment tree, where the disagreement is.

**What the crowd says — Chinese** (a genuinely different read on AI tooling; worth opening
whenever the subject is a model, an agent tool, or hardware)
`zhihu` · `v2ex` · `linux-do` · `juejin` · `weibo` · `tieba` · `rednote` · `bilibili` ·
`douban` · `36kr` · `1point3acres` · `hupu` · `xiaoyuzhou`

**The code and its wounds** — the most first-hand material that exists for software
`gh search repos|issues|prs|code` · `gh issue list -R owner/repo` ·
`gh repo view owner/repo --json stargazerCount,forkCount,pushedAt,isArchived` ·
`github-trending` · `npm` · `pypi` · `crates` · `maven` · `nuget` · `packagist` ·
`rubygems` · `homebrew` · `dockerhub` · `hf` · `nvd` · `osv` (security advisories)

An issue tracker is where a product tells the truth about itself. Stars measure attention,
not use — when a star count and a community size disagree, both go in the report.

**Web search** — `exa` (via `mcporter call 'exa.web_search_exa(...)'`) · `google` ·
`duckduckgo` · `brave` · `baidu` · `yahoo` · `quark`

Run more than one. They rank differently and each hides what the others surface.

**Video and spoken** — `youtube` · `bilibili` (use `bili search`, never yt-dlp for it) ·
`douyin` · `apple-podcasts` · `xiaoyuzhou`
Transcript: `yt-dlp --write-sub --skip-download -o "/tmp/%(id)s" "<URL>"`.

**Money, market, company** — `producthunt` · `crunchbase`-like via web · `linkedin` ·
`boss` / `51job` / `indeed` / `upwork` (hiring signals say what a company is really doing) ·
`yahoo-finance` · `xueqiu` · `eastmoney` · `binance` · `coingecko` · `defillama`

**Papers and standards** — `arxiv` · `openreview` · `semanticscholar` · `openalex` ·
`pubmed` · `google-scholar` · `dblp` · `wanfang` · `cnki` · `rfc` · `mdn` · `wikipedia` ·
`wikidata` · `gov-law` · `gov-policy` · `openfda`

**Shopping and price** — `amazon` · `taobao` · `jd` · `1688` · `coupang` · `smzdm` ·
`xianyu` · `steam` · `imdb`

## Counting a community

For a "which do people prefer" question these are the numbers that carry the answer, and
each says something different:

| number | command | what it actually measures |
|---|---|---|
| subreddit members | `opencli reddit subreddit-info <name>` | people who chose to follow it |
| posts per month | `opencli reddit subreddit <name> -f yaml` + dates | living use, not past hype |
| GitHub stars | `gh repo view --json stargazerCount` | attention at some point in time |
| forks / recent pushes | `--json forkCount,pushedAt` | whether anyone still builds on it |
| open vs closed issues | `gh issue list --state all` | whether complaints get answered |
| package downloads | `npm` / `pypi` adapters | actual installs |
| HN points + comments | `opencli hackernews search` | how hard developers argued about it |

Report them side by side. A tool with 96,516 stars and an 11-member community is telling
you something precise, and smoothing it into one verdict throws the finding away.
