# agent-reach — does any command fetch a web page? The full command surface

Research run `20260916-170526` · class `capability` · 2026-09-16 · gate: **all HARD checks pass**
Question, verbatim: *"Does the agent-reach CLI have any command that fetches a web page? List its full command surface."*

**Answer — stated precisely, because the loose version is false:**
**No subcommand of the agent-reach installed on this machine takes a URL and returns that page's content.**

> **Corrected by the third run, 2026-09-16 21:17 (§11.7):** the scope in that sentence is not decoration.
> **Two different CLIs answer to the name `agent-reach`.** The one here is Panniantong's, installed from
> `main.zip`. The package literally named `agent-reach` on PyPI is a different tool by a different author,
> and that one **does** fetch — but through a named channel (`agent-reach get rss.feed <url>`), and only
> `rss` and `youtube` ship. **Neither tool hands you an arbitrary HTML page.** A second adversary round
> narrowed this in both directions; the measured version is §11.7.
 `agent-reach read <url>`
existed until 2026-02-26 and the author deleted it in a commit titled *"remove read/search wrapper layer"*.
**But three of the eleven surviving commands do make HTTP requests**, and one of them —
`transcribe <url>` — hands an arbitrary user-supplied URL to `yt-dlp`, which downloads that page while
hunting for media. Whoever asks "does it fetch a web page" must be told both halves.

> An adversary in a separate context **broke** the first wording of this answer and the wording above
> is what survived re-measurement. Its verdicts are in §8.

---

## 1. The build that was measured

| | |
|---|---|
| binary | `/home/dxb/.local/bin/agent-reach` → `…/uv/tools/agent-reach/bin/agent-reach` |
| version string | `Agent Reach v1.5.0` · `check-update` → `✅ 已是最新版本` |
| installed from | `https://github.com/Panniantong/agent-reach/archive/main.zip` (`dist-info/direct_url.json`) |
| **which commit is actually installed** | **`da5044d2`** — `cli.py` md5 `782a5398e1175e6e44a9f267f9adf1c0`, 87 606 bytes, **byte-identical** to `raw.githubusercontent.com/…/da5044d2/agent_reach/cli.py` |
| vs upstream `main` today | md5 `4a07c3a99…`, 89 749 bytes — 49 lines newer; **command-name surface diff is empty** |
| console scripts | exactly one: `agent-reach = agent_reach.cli:main` |

**Three different things answer to "v1.5.0":** the release tag `f65526cb` (2026-06-11), the build on this
machine `da5044d2`, and HEAD `a19a171f` (2026-09-15). The eleven command *names* are the same in all
three. **The flags are not:** upstream HEAD's `install --channels` accepts `boss`; the installed build's
does not. The flag table in §2 is the **installed build**.

> **Trap:** `pypi.org/project/agent-reach/` is a **different project** — Jean Galea,
> `github.com/jgalea/agent-reach`. The real README says so outright: *"不要从 PyPI 安装同名包，它不是本项目"*.

## 2. The full command surface — eleven subcommands

Eleven `sub.add_parser(...)` calls, no aliases, no `SUPPRESS`, and an exhaustive `if/elif args.command`
dispatch that handles those eleven and nothing else. Proven at runtime — argparse enumerates them itself:

```
$ agent-reach read https://example.com
agent-reach: error: argument command: invalid choice: 'read'
  (choose from 'setup', 'install', 'configure', 'doctor', 'uninstall',
   'skill', 'format', 'transcribe', 'check-update', 'watch', 'version')
```
Identical rejection for `fetch`, `search`, `get`.

**Global flags** (before the subcommand): `-h/--help` · `-v/--verbose` · `--version`

| # | command | arguments and flags | what it does | HTTP? |
|---|---|---|---|---|
| 1 | `setup` | — | interactive configuration wizard | via the channels it probes |
| 2 | `install` | `--env {local,server,auto}` · `--proxy URL` · `--system` \| `--safe` · `--dry-run` · `--channels twitter,xiaoyuzhou,xueqiu,xiaohongshu,reddit,facebook,instagram,bilibili,linkedin,all` | installs the upstream tools | package installs |
| 3 | `configure` | `[proxy\|github-token\|groq-key\|openai-key\|twitter-cookies\|youtube-cookies\|xhs-cookies] [value…]` · `--stdin` · `--from-browser {chrome,firefox,edge,brave,opera}` · `--platform {twitter,xiaohongshu,bilibili,xueqiu}` · `--profile P` · `--sync-legacy-twitter` | stores credentials, extracts cookies | no |
| 4 | `doctor` | `--json` | probes each channel's backends, names the active one | **yes** — health probes |
| 5 | `uninstall` | `--dry-run` · `--keep-config` | removes config, tokens, skill files | no |
| 6 | `skill` | `--install` \| `--uninstall` (one required) | writes/removes `SKILL.md` in agent skill dirs | no |
| 7 | `format` | `xhs` (only choice) | cleans XiaoHongShu API output | no |
| 8 | `transcribe` | `source` (URL or file) · `--provider {auto,groq,openai}` · `--allow-provider-fallback` · `-o/--output FILE` | **`yt-dlp` downloads the URL**, ffmpeg compresses, Whisper transcribes | **yes — arbitrary user URL** |
| 9 | `check-update` | — | GETs `api.github.com/…/releases/latest` and `/commits/main`, prints the remote text | **yes** |
| 10 | `watch` | — | health check + update check, for cron | **yes** |
| 11 | `version` | — | prints the version | no |

**Where `--help` and reality diverge:** `--help` is the list of *names*; the honest answer about *fetching*
needs the HTTP column. `doctor`/`watch` reach live third-party endpoints in their probes (measured:
`v2ex.com/api/topics/show.json`, `stock.xueqiu.com/v5/stock/quote.json` — the latter returned
`HTTP Error 400` in a live `watch` run, proving the request went out). `check-update`/`watch` GET the
GitHub API and print the release body. **None of these takes a URL from the user; `transcribe` does.**

### `transcribe` — measured live, 2026-09-16

`transcribe.py:250-272` runs `yt-dlp -x --audio-format m4a --audio-quality 0 --no-playlist --max-filesize … -o … -- <url>` after an SSRF guard that rejects private IPs.

```
$ GROQ_API_KEY=dummy agent-reach transcribe https://example.com
❌ yt-dlp failed (exit 1): WARNING: [generic] Falling back on generic information extractor
ERROR: Unsupported URL: https://example.com/

$ yt-dlp -x --audio-format m4a --no-playlist -o … -- https://example.com
[generic] Extracting URL: https://example.com
[generic] example: Downloading webpage            ← the page WAS fetched
[redirect] Following redirect to https://example.com/
[generic] example: Downloading webpage
```
It downloads the page to look for media in it, and returns a transcript — never the page's text.

## 3. Why there is no fetch verb — the author's own words

`GET api.github.com/repos/Panniantong/Agent-Reach/commits/a37e9aa1` (ledger `L0229`), 2026-02-26T07:15:56Z:

> **refactor: strip to installer + doctor + docs, remove read/search wrapper layer**
>
> **BREAKING CHANGE: Remove all `agent-reach read` and `agent-reach search-*` commands.**
>
> Agent Reach is now an installer, configuration tool, and doctor — not a wrapper layer.
> After installation, agents call upstream tools directly (bird CLI, yt-dlp, mcporter, gh CLI, Jina Reader, etc.).
>
> What's kept: `install` · `doctor` · `configure` · `setup` · SKILL.md
> What's removed: `agent-reach read URL` (and all channel `read()` methods) · `agent-reach search-*`
> (and all channel `search()` methods) · ReadResult / SearchResult · URL routing (`get_channel_for_url`) ·
> all parsing logic · **MCP server read/search tools (kept only `get_status`)**
>
> Net change: **-1790 lines. Less code = fewer bugs.**

API stats confirm the arithmetic: 392 additions, 2 182 deletions → −1 790. Shipped in **v1.2.0**, 2026-02-26T12:34:58Z.

**The CEO's question is the project's own known confusion.** Issue #58 → PR/commit `1a61a2cc`,
2026-03-04 (ledger `L0232`):

> **docs: clarify agent-reach has no read/search commands (#59)**
> *"Users confuse `agent-reach` (installer/config tool) with a content-fetching CLI, expecting
> `agent-reach read <url>` to work."* · *"Reword SKILL.md to explicitly state agent-reach is an
> installer/config tool with **no** read/search/content-fetching commands."*

`docs/README_en.md`, §Design Philosophy (ledger `L0227`):

> **Agent Reach is a capability layer, not yet another tool.** It handles **selection, installation,
> health checks, and routing**, not the reading itself. Reading is done by your Agent calling upstream
> tools directly; **there is no wrapper layer**.

And its own instruction for reading a page: `"Read this link"` → `curl https://r.jina.ai/URL`.

## 4. What the history shows

| ref | date | subcommands | `read` / `search*`? |
|---|---|---|---|
| `5c62a21f` "rename: Agent Eyes → Agent Reach" | 2026-02-24 | 10 | **yes** — `read`, `search`, `search-github/-reddit/-twitter` |
| `c642e18e` = **v1.1.0** | 2026-02-25 | 18 | **yes** — `read`, `search` + 9 × `search-*` |
| **`a37e9aa1` the strip** | **2026-02-26 07:15** | — | **removed here** |
| `37b4cded` = v1.2.0 | 2026-02-26 12:34 | 7 | no |
| `ca29c4fe` = v1.3.0 | — | 8 | no |
| `da5044d2` = **the build installed here** | 2026-09 | **11** | no |
| `main` HEAD `a19a171f` | 2026-09-15 | **11** | no |

## 5. The counter-search — run, not assumed

The adversary's sharpest hit was that the first counter-searches were three zero-hit keyword queries.
Redone against the repository itself:

- **67 commits touched `agent_reach/cli.py` after the strip.** 16 mention read/search/fetch; reading each,
  **none re-adds a command.** Two matter: `1a61a2cc` (2026-03-04) removes a dead `# ── read ──` placeholder
  comment *because users kept expecting a command behind it*, and `0f9cfe66` (2026-03-31) adds
  `WebChannel.read()` back **to the library**, not to the CLI (its `cli.py` hunk touches only skill-install code).
- **3 branches** total: `main`, `codex/p0-p1-hardening-20260725`, `codex/xhs-wsl-cookie-import`.
- **61 open pull requests.** The ones touching `web` (#596 Firecrawl backend, #630/#654 reader refusals,
  #686 really probe Jina in `check()`) all work on the **library's** reader. None adds a subcommand.
- HEAD `cli.py`: 11 `add_parser`, zero `_cmd_read` / `_cmd_search`.

## 6. The contradiction, named and left standing

**DeepWiki's "CLI Reference"** (`deepwiki.com/Panniantong/Agent-Reach/2-cli-reference`, `L0226`) publishes a
table headed *"the complete set of subcommands"* containing `read <url>` → `_cmd_read()` and ten `search-*`
→ `_cmd_search()`, with a sibling page documenting every `search-*` flag and default.

It states `Last indexed: 4 September 2026 (da5044d2)` — **the exact commit installed on this machine.**
That file contains **zero** occurrences of `_cmd_read` or `_cmd_search` and its eleven `add_parser` names
diff empty against `main`. Its table lists the 10 removed commands *and* `skill`/`format`/`transcribe`/
`uninstall` — twenty in total, **a union that has never existed in any commit**. It is machine-written text
that merged the pre- and post-removal surfaces. `README.md`, `docs/README_en.md`, `CLAUDE.md` and
`docs/update.md` on main contain **zero** occurrences of `agent-reach read` or `agent-reach search`.

**It is the most authoritative-looking document on this question on the open web, and it is wrong.**

## 7. The library still fetches — and no command reaches it

This is the half a `--help` dump hides.

- **`channels/web.py` → `WebChannel.read(url)`** — Jina Reader, 5 MiB cap, Cloudflare-challenge detection.
  **Not a vestige:** deleted by the strip, then deliberately re-added on 2026-03-31 by `0f9cfe66` —
  *"WebChannel.read(): reads any URL via Jina Reader (r.jina.ai), returns Markdown"* (ledger `L0233`).
  Run live against the installed interpreter today: **367 chars, first line `Title: Example Domain`.**
  Nothing in the package calls it; `check()` deliberately does **not** touch the network.
- **`channels/v2ex.py`, `channels/xueqiu.py`** carry `get_hot_topics()`, `get_topic()`, `search()`,
  `get_stock_quote()`, `search_stock()`, `get_hot_posts()` … `cli.py` imports only `format_xhs_result`
  and installer helpers from `channels/`, never a content method.
- **`core.py`** is 42 lines: `AgentReach` with `doctor()` and `doctor_report()` only.
- **`integrations/mcp_server.py`** exposes exactly one tool, `get_status` → `doctor_report()`, and has no
  CLI entry point.

**Gone from the CLI; alive in the library; reachable from Python in one line.**

## 8. The adversary's verdict, and what it changed

Run in a separate context with the ledger and the claims only. Overall verdict: **broken** — and it was right.

| claim | verdict | what it changed |
|---|---|---|
| **C1** no fetch command | **weakened** | the absolute wording was false; `transcribe` fetches an arbitrary URL. Reworded to *"no subcommand takes a URL and returns that page's content"*, which survives re-measurement |
| **C2** the removal commit | **stands** | it re-verified −1790 from the API's own stats; its currency objection was closed by the md5 identity and the 67-commit sweep |
| **C6** the eleven commands | **stands** | it independently audited completeness (no aliases, no SUPPRESS, no hidden dispatch) and found the real defect: the **flags** are not version-stable across the three things called v1.5.0 |

It also found what this run had genuinely not done: never running the installed binary's fetch path, and
three zero-hit keyword queries standing in for a counter-search. Both were done afterwards; §2 and §5 are the result.

## 9. Coverage, holes, and where the machine disagreed with me

22 channels swept · 16 returned · 4 empty · 2 failed · 40 clusters · **233 ledger rows** ·
25 pages fetched, **0 unread** (scrapling 17 · tavily-extract 3 · scrapling-stealth 2) · 26 queries.

Holes: `github-repos`, `github-issues` (FAIL), `hackernews`, `stackoverflow` (empty), `lobsters`, `devto`
(FAIL). The two GitHub holes were covered by going straight to the GitHub REST API and
`raw.githubusercontent.com` — a stronger source than a repo search. Full list: `runs/20260916-170526/GAPS.md`.

**Grounding (`bespoke-minicheck`), reported rather than buried:** C1, C2, C3, C3b and C7 are entailed by the
author's own commit messages. **C6 — the list of eleven — is entailed by no stored passage**, because no page
on the internet states it; it rests on this machine's own `cli.py` and argparse output, and is declared as a
measurement, not as a quotation. C2b, C4 and C5 are likewise read directly from code and from the DeepWiki
page in this session rather than quoted from a stored passage.

⚠ **UNVERIFIED — requires human-eye confirmation:** none. Every statement above was produced by a command
whose output is printed in the session transcript.

---

## 10. Independent re-measurement — 2026-09-16 evening, a second session, no ledger inherited

The question was asked again in a fresh session (Opus 5). Nothing above was taken on trust: every
load-bearing fact was re-measured from the machine and from upstream, and the two runs agree.
Commands and their decisive output:

| # | command run this session | decisive output |
|---|---|---|
| R1 | `readlink -f $(which agent-reach)` · `agent-reach --version` | `…/uv/tools/agent-reach/bin/agent-reach` · `Agent Reach v1.5.0` |
| R2 | `cat …/agent_reach-1.5.0.dist-info/entry_points.txt` | **one** console script: `agent-reach = agent_reach.cli:main` — no second binary, and no `__main__.py` (`ls` → *No such file*) |
| R3 | `agent-reach --help` | the eleven names: `setup install configure doctor uninstall skill format transcribe check-update watch version` |
| R4 | `agent-reach <each of the 11> --help` | every flag captured — the table in §2 re-verified against the installed build |
| R5 | `grep -rn "add_parser(" …/agent_reach` | exactly **11** `sub.add_parser(...)`, all in `cli.py:71-177`; `grep -rn SUPPRESS` → **empty** (no hidden command) |
| R6 | `agent-reach {fetch,read,get,browse,open,page,url,scrape,search,curl} https://example.com` | **10/10 rejected**, exit 2: `invalid choice: 'fetch' (choose from 'setup', … 'version')` |
| R7 | `grep -rln "def read(" …/channels/` | **one file only** — `channels/web.py` |
| R8 | `grep -rn "from …channels" …` outside `channels/` | only `doctor.py` (`get_all_channels`, for `check()`) and `cli.py`'s `format_xhs_result` / installer helpers — **no code path from any command to `read()`** |
| R9 | `python -c "from agent_reach.channels.web import WebChannel; print(len(WebChannel().read('https://example.com')))"` | **367** bytes, `Title: Example Domain` — the reader works, and only Python can reach it (the body even labels itself *"a cached snapshot"*, r.jina.ai) |
| R10 | `yt-dlp -x --audio-format m4a --no-playlist -o … -- https://example.com` (the argv `transcribe.py:250-272` builds) | `[generic] example: Downloading webpage` ×2 → `ERROR: Unsupported URL` — **the page is fetched**, then discarded for want of media |
| R11 | `GROQ_API_KEY=dummy agent-reach transcribe https://example.com` | `❌ yt-dlp failed (exit 1): … Unsupported URL` — same path, through the CLI |
| R12 | `GET api.github.com/repos/Panniantong/agent-reach/commits/a37e9aa1` | 2026-02-26T07:15:56Z · stats `+392 −2182` (= −1790) · *"BREAKING CHANGE: Remove all `agent-reach read` and `agent-reach search-*` commands … MCP server read/search tools (kept only get_status)"* |
| R13 | `GET raw.githubusercontent.com/…/main/agent_reach/cli.py` | upstream `main` today: **11** `add_parser`, the same eleven names — no `read`, no `search*` |
| R14 | `GET raw.githubusercontent.com/…/main/docs/README_en.md` | L257 *"it handles selection, installation, health checks, and routing, not the reading itself … there is no wrapper layer"* · L187 *"Read this link" → `curl https://r.jina.ai/URL` for any web page* |
| R15 | `integrations/mcp_server.py` | one tool, `get_status`; its own docstring: *"Agent Reach is an installer + doctor tool. For actual reading/searching, agents should call upstream tools directly (twitter-cli, yt-dlp, mcporter, etc.)"* — **no CLI entry point reaches it** |
| R16 | `curl https://r.jina.ai/https://deepwiki.com/Panniantong/Agent-Reach/2-cli-reference` | the contradiction of §6 **still stands today**: line 54 `| read <url> | _cmd_read() | Read content from any URL |`, line 82 `agent-reach read <url> [--json]`, line 85 *"calls AgentReach.read(url) … get_channel_for_url()"* — all of it removed from the code 2026-02-26. ⚠ read through a **cached** reader snapshot, labelled as one. |

**Where the two runs differ:** none of the eleven names, none of the flags, none of the conclusions.
The second run adds R7-R9 as a code-path proof (the reader is unreachable from the CLI *by import graph*,
not merely by absence of a verb) and re-confirms R16 live, hours after the first run read it.

**Holes in this second run, stated rather than hidden:** it swept no social channel and no forum — the
question is answerable from the binary, its source and its upstream, and all three were read directly.
`scrapling` is not on PATH as a CLI on this machine (`which scrapling` → empty), so R16 went through
`r.jina.ai`; a live, uncached read of that DeepWiki page was not obtained.

---

## 11. Third run — the same question through the full gate, 2026-09-16 21:17

Run `20260916-181735` · class `capability` · gate clock: opened 21:17, all expedition checks green at 46 s.
**Nothing in §§1-10 was inherited**: no ledger, no claims, no wording. Everything below was measured again
from the binary, its source, its git history and its upstream, and then attacked.

**What this run adds that the first two did not have:** the sweep. Run 2 deliberately swept no social channel
and no forum. This one swept **22 channels twice** — 19 returned in sweep 1, 18 in sweep 2 — and then read the
pages rather than the snippets.

| | run 3 |
|---|---|
| ledger rows | **469** (45 evidence · 424 discovery) · 26 independent clusters · 52 queries |
| channels | 22 swept ×2 · holes: `github-repos`, `hackernews`, `stackoverflow` (empty both rounds), `producthunt` (FAIL, sweep 2) |
| pages read | **28 · 0 unread** — scrapling 20, tavily-extract 4, scrapling-stealth 2 |
| largest single channel | 23 % of clusters (the gate's ceiling is 50 %) |
| external cost | **$0** |

### 11.1 The eleven, re-measured — and the completeness proof

`agent-reach --help` on the installed v1.5.0 prints the same eleven:
`setup · install · configure · doctor · uninstall · skill · format · transcribe · check-update · watch · version`,
and `grep -rn "add_parser(" agent_reach/` returns exactly eleven, all in `cli.py:71-177`.

**Completeness, not just presence** (`L0468`): `grep -rn "aliases=\|SUPPRESS\|add_subparsers"` over the whole
package returns **one line** — the single `add_subparsers` at `cli.py:68`. No alias, no suppressed verb. The
dispatch is an exhaustive `if/elif args.command ==` over those eleven names and nothing else. Ten plausible
verbs (`fetch get read search page url web browse crawl scrape`) were run against the binary: **10/10 rejected**.

### 11.2 The nuance that survives, measured a third time

`agent-reach transcribe <url>` **does** put an HTTP GET for an arbitrary URL on the wire (`L0467`):

```
$ yt-dlp -x --audio-format m4a --no-playlist -o … -- https://example.com
[generic] example: Downloading webpage
[redirect] Following redirect to https://example.com/
[generic] example: Downloading webpage
ERROR: Unsupported URL: https://example.com/
```

and through the CLI itself: `GROQ_API_KEY=dummy agent-reach transcribe https://example.com` →
`❌ yt-dlp failed (exit 1): … Unsupported URL`. The page is fetched, then thrown away for want of media.
So "it never fetches a web page" is false; **"no subcommand hands you that page's content" is true** — and true *of this build*, which §11.7 shows is not the only thing called `agent-reach`.

`check-update` and `watch` also make HTTP GETs, but only to hard-coded `api.github.com` addresses — never to a URL the caller names.

The library reader still answers, and only Python reaches it: `WebChannel().read('https://example.com')` →
**367 chars, first line `Title: Example Domain`**, with zero callers anywhere in the package
(`doctor.py` calls only `ch.check(config)`).

### 11.3 The history, verified from the source rather than from §4

- `GET api.github.com/…/commits/a37e9aa1` (`L0463`) → 2026-02-26T07:15:56Z, **+392 −2182**:
  *"BREAKING CHANGE: Remove all `agent-reach read` and `agent-reach search-*` commands … After installation,
  agents call upstream tools directly."*
- `raw.githubusercontent.com/…/c642e18e/agent_reach/cli.py` (`L0464`) → the pre-strip surface: **eighteen**
  verbs, including `read` *("Read content from a URL")*, `search`, and nine `search-*`.
- **Flip test** (`L0469`): main HEAD `a19a171f` (2026-09-15) still has eleven; three branches; the only open PR
  whose title matches `subcommand|add_parser|fetch|read|command` is **#667**, a Xueqiu token fix. Nothing
  pending re-adds a verb.

### 11.4 What the crowd shows — the half a code read cannot see

- **Issue #685** (open, `L0455`), a user's own reproduction: *"`WebChannel.check()` returns `ok`
  unconditionally, so `agent-reach doctor` advertises the tier-0 catch-all `web` channel as available on
  networks where `r.jina.ai` cannot be reached at all."* The doctor line it quotes is the tool naming its own
  command — **and the command is `curl`**: `✅ 任意网页 — 通过 Jina Reader 读取任意网页（curl https://r.jina.ai/URL）`.
  Reproduced live on this machine (`L0453`).
- **Issue #566** (open, `L0456`), a 15-channel field test of v1.5.0, asks for subcommands that do **not**
  exist — `doctor --probe`, an `agent-reach env` — which is what a closed surface looks like from outside.
- **Issue #288** (open, `L0457`) is the question itself, in Chinese, with no body: *"读任意网页不行，请求超时"*.
- **DeepWiki's "CLI Reference"** was fetched again in this run (`L0229`, HTTP 200) and **still** contains
  `read <url>` and `_cmd_read`. The contradiction of §6 stands.

### 11.5 Two defects this run found outside the question

1. **The engine's own URL checker was wrong, and it is fixed at source.** `scripts/urlcheck.py` rejected every
   non-`http` address as *dead*, so eleven `file://` rows carrying the CLI's own source were written `dead`
   and gate check **H11** blocked a run whose evidence was the code itself. A `file://` row is now checked on
   the filesystem (fragment stripped, percent-decoded). Repaired: 11 rows re-checked **alive**; dependants
   re-measured — H11 cleared, `coverage.py` runs, all ten scripts import clean; no other run carried the damage.
2. **The engine's own benchmark scorer punished the honest answer, and it is fixed at source.**
   This exact question is benchmark task **T03** in `benchmarks/tasks.json`, and its `forbidden`
   list is `["agent-reach fetch", "agent-reach search"]` — a hallucination marker. The scorer tested
   it with a bare substring match (`run.py:99`), so the only answer that had actually *measured* the
   absence — by running the verb and quoting `argparse: invalid choice` — was scored **unclean** for
   quoting the command it disproved. A forbidden phrase now counts only where it is **asserted**:
   present with no refutation within 220 characters. Tested both ways:
   honest answer → `clean=True, forbidden_present=[]`; hallucinated answer → `clean=False,
   forbidden_present=['agent-reach fetch', 'agent-reach search']`. Dependants re-measured: both
   stored result files re-score without error (`--score-only`), arm 1 still 80 % clean, arm 3 still
   100 % — the fix did not whitewash a past run.
3. **The agent-reach skill file registered in Claude on this machine is older than the installed CLI**
   (`L0462`): it advertises **13 platforms** where the shipped v1.5.0 skill says **15**, 108 diff lines apart.
   Not repaired here — `agent-reach skill --install` would overwrite `~/.claude/skills/agent-reach/SKILL.md`,
   which carries a local `openclaw:` metadata block the shipped file does not have. **The CEO's call.**

### 11.6 Where the machine disagreed with me

`verify.py` (`bespoke-minicheck`, local, $0) marked **13 of 17** cited rows *not supported*. Read honestly:
it is a prose-entailment model, and the rows it rejected are **argparse output, `grep` results and terminal
transcripts** — text it cannot parse as a sentence. It confirmed the two claims whose evidence is prose
(C2 combined, C5 combined, and issue #685 on its own). Those thirteen rows are declared as **measurements,
reproducible in one command each**, not as quotations. Recorded, not buried.

Holes: `runs/20260916-181735/GAPS.md`.

### 11.7 THE FLIP — there are two CLIs called `agent-reach`, and the other one fetches

The adversary broke the unscoped wording, and it was right. Measured, not repeated (`L0472`):

`pip download agent-reach==0.1.0 --no-deps` → `agent_reach-0.1.0-py3-none-any.whl`, whose `cli.py` declares
**seven** verbs — `list · install · remove · doctor · get · skill · cache` — and one of them is a fetch:

```
p = sub.add_parser("get", help="read from a channel")
p.add_argument("target", help="channel or channel.command")
p.add_argument("query", nargs="?", default="")
p.add_argument("--max-tokens", type=int, default=0) … --limit … --lang … --no-cache … --json
```

**But the second adversary round narrowed it, and re-measurement agreed** (`L0480`):

- **`get` does not take a URL.** `cmd_get` does `args.target.partition(".")` — the target is
  `channel[.command]`, and the URL goes in the *optional* `query` positional. A bare URL becomes a
  channel name and fails.
- **Only two channels ship**: `index/rss.toml`, `index/youtube.toml` · `channels/rss.py`,
  `channels/youtube.py`. So it fetches a **feed** URL or a **yt-dlp-supported video** URL through a
  named channel — **never an arbitrary HTML page.** Its own README line
  `agent-reach get wporg.reviews akismet --json` names a channel that is not in the bundled index.
- **The collision is wider than two.** A third distribution installs the same console script and is
  not a fork: **`xiaoou-waou/agent-reach`** (pushed 2026-08-18) — **nine** verbs, no `format`, no
  `transcribe` — **and it also calls itself `1.5.0`.** So the version string is not a safe way to
  identify which `agent-reach` a machine has.

`jgalea/agent-reach` is likewise not a fork (`L0474`): created 2026-08-02, 2 stars, its own
description. **`uv tool install agent-reach` gets you that one, not this one.** The machine here has
Panniantong's, from `main.zip` (`L0459`).

**So: the answer depends on which `agent-reach` is meant — and NONE of the three hands you the
contents of an arbitrary web page you name.**

### 11.8 The second half of the question, which the first draft had not actually recorded

The adversary's sharpest procedural hit: eleven verb *names* had been ledgered, and not one row carried an
argument or a flag — while the CEO asked for the **surface**. `L0473` now holds every verb's own `--help`.
The installed build, complete:

| verb | positional | flags |
|---|---|---|
| `setup` | — | — |
| `install` | — | `--env {local,server,auto}` (default `auto`) · `--proxy URL` (default `""`) · `--system` \| `--safe` — mutually exclusive but **not required** · `--dry-run` · `--channels` (a free-form list with **no** `choices=`: twitter,xiaoyuzhou,xueqiu,xiaohongshu,reddit,facebook,instagram,bilibili,linkedin,all) |
| `configure` | `[key] [value …]` — key `nargs="?"` from `{proxy, github-token, groq-key, openai-key, twitter-cookies, youtube-cookies, xhs-cookies}`, value `nargs="*"` | `--stdin` · **`--from-browser {chrome,firefox,edge,brave,opera}`** · `--platform {twitter,xiaohongshu,bilibili,xueqiu}` · `--profile P` · `--sync-legacy-twitter` |
| `doctor` | — | `--json` |
| `uninstall` | — | `--dry-run` · `--keep-config` |
| `skill` | — | `--install` \| `--uninstall` — mutually exclusive **and** `required=True`; the only group in the CLI that is |
| `format` | `xhs` (the only choice) | — |
| `transcribe` | `source` — **required** (audio/video URL or local path) | `--provider {auto,groq,openai}` (argparse default `auto`, though its own help text says *"first configured provider"* — the tool contradicts itself here) · `--allow-provider-fallback` (valid only with `--provider auto`) · `-o, --output OUTPUT` |
| `check-update` | — | — |
| `watch` | — | — |
| `version` | — | — |

| `format` | `xhs` — **required**, the only choice | — |

Global, before the verb: `-h/--help` · `-v/--verbose` · `--version`.

**Three things a `--help` dump will never show you, all re-measured** (`L0479`):

1. **The subcommand itself is optional** — `add_subparsers` has no `required=True`. Bare `agent-reach`
   prints help and exits **0**.
2. **One choice set is hidden from the help by a `metavar`.** `--from-browser` prints as
   `--from-browser BROWSER`, but argparse enforces five values:
   `configure --from-browser safari --platform twitter` →
   `error: argument --from-browser: invalid choice: 'safari' (choose from 'chrome', 'firefox', 'edge', 'brave', 'opera')`.
   It is the one place where the source and the help disagree.
3. **Ten cross-flag rules are enforced after parsing** (`cli.py:181-215`) and appear in no usage line —
   e.g. `--platform is required with --from-browser` · `--stdin cannot be combined with --from-browser` ·
   `--profile is supported only for Chrome/Edge/Brave` · `--sync-legacy-twitter is only valid with
   twitter-cookies` · `--allow-provider-fallback requires --provider auto`.

**One flag is not version-stable** (`L0475`): every `add_argument` name and every `choices=` list is
byte-identical between this build and upstream `main` HEAD — but `--channels` has **no** `choices=`, so
argparse cannot police it, and HEAD accepts a twelfth value **`boss`** that this build does not
(`grep -c boss`: installed **0**, HEAD **13**). The table above is the installed build.

---

## 12. Fourth run — independent re-measurement, 2026-09-16 21:40–21:55

A fresh session, no ledger inherited, §§1-11 read only AFTER its own measurements were taken. Every
line below is a command run this evening and the output it printed.

### 12.1 The surface, re-measured — identical to §§2 and 11.1

| measurement | command | decisive output |
|---|---|---|
| binary | `which -a agent-reach` | `/home/dxb/.local/bin/agent-reach` (uv tool venv) |
| build | `agent-reach --version` | `Agent Reach v1.5.0` |
| surface | `agent-reach --help` | `{setup,install,configure,doctor,uninstall,skill,format,transcribe,check-update,watch,version}` |
| per-verb flags | `agent-reach <verb> --help` × 11 | all 11 captured; see §11.8 table — byte-identical |
| completeness | `grep -rn "add_parser(" …/agent_reach/` | **11 hits, 11 verbs — no hidden command** |
| entry points | `…/dist-info/entry_points.txt` | `agent-reach = agent_reach.cli:main` — one console script only |
| negative control | 10 guessed verbs | `fetch·read·get·browse·open·page·url·scrape·search·curl` → **10/10 `invalid choice`** |

### 12.2 The two nuances, re-measured

1. **`transcribe` never reaches the network on THIS machine.** `agent-reach transcribe https://example.com`
   → `❌ no provider key configured (need one of: groq_api_key, openai_api_key)`. The key gate is
   `transcribe.py:432`, the yt-dlp download is `transcribe.py:452` — the gate fires **first**. §11's
   "it downloads the page" is true of the code path, **not of this installation as configured**.
2. **The library page-reader is live and still unreachable from the CLI.**
   `WebChannel.read('https://example.com')` via the tool's own interpreter → **367 bytes**, first line
   `Title: Example Domain`, body carrying `Warning: This is a cached snapshot`. Callers of that method
   in the whole package: `grep -rn "\.read(" --include=*.py` → **0** (only `resp.read`, `sys.stdin.read`,
   `os.read`). `WebChannel` is imported in `channels/__init__.py` for the doctor registry and nothing else.
   `agent-reach doctor` still advertises it: `✅ 任意网页 — 通过 Jina Reader 读取任意网页 (curl https://r.jina.ai/URL)`.

### 12.3 What would flip the answer — checked today, not assumed

- **Upstream re-adding it:** `curl raw.githubusercontent.com/Panniantong/Agent-Reach/main/agent_reach/cli.py`
  → the same 11 `add_parser` calls, no `read`, no `fetch`. Not re-added as of today.
- **The removal, from the source:** GitHub commit API, `a37e9aa1`, `2026-02-26T07:15:56Z`,
  **+392 / −2182 lines**, message: *"BREAKING CHANGE: Remove all `agent-reach read` and
  `agent-reach search-*` commands. Agent Reach is now an installer, configuration tool, and doctor —
  not a wrapper layer. After installation, agents call upstream tools directly."* Commit search also
  returns `1a61a2cc` (2026-03-04) *"docs: clarify agent-reach has no read/search commands (#59)"* — the
  author had to write a documentation commit because people kept expecting the verb.
- **The name collision, verified from PyPI itself, not repeated from §11.7:**
  `pypi.org/pypi/agent-reach/json` → name `agent-reach`, version **0.1.0**, author **Jean Galea**,
  homepage `github.com/jgalea/agent-reach` — **a different project from the installed one.** Its wheel
  downloaded and opened: `cli.py` declares **7** verbs — `list · install · remove · doctor · get · skill ·
  cache` — and `get` is `add_parser("get", help="read from a channel")` with
  `target = "channel or channel.command"` (`channel, _, command = args.target.partition(".")`) and the URL
  as the *optional* second positional. Bundled channels: **rss + youtube only**. So `pip install agent-reach`
  gets a CLI that fetches a **feed or a video**, never an arbitrary HTML page.

### 12.4 The contradiction, named and left standing

The installed build's own PyPI metadata reads `Summary: Give your AI Agent eyes to see the entire
internet. Search + Read 10+ platforms.` — **the vendor's own one-line description still promises "Read"
seven months after the read verb was deleted.** Not reconciled here; reported as it stands.

### 12.5 Where this run did not look

Community/forum channels were not swept: the question is answerable from the binary, its source, its
upstream HEAD and PyPI, and all four were read directly. The GitHub commit API was used unauthenticated
(no rate-limit hit observed). `transcribe`'s network path was not forced by configuring a provider key —
a key would be an outward-facing configuration change and is not made to answer a question.

---

## 13. Fifth run — the full gated chain, 2026-09-16 21:49–22:05

Run `20260916-194905` · class `capability` · **gate: HARD checks all pass** · adversary: 1 round, 3 of 5
load-bearing claims **broken and repaired** before anything was reported. No ledger inherited from §§10–12;
every number below was measured in this run. The ledger is
`.claude/skills/dxb-research/runs/20260916-194905/ledger.jsonl` (255 rows, 29 evidence) and the holes are in
that run's `GAPS.md`.

### 13.1 The answer, in the only wording that survived the adversary

**No command fetches a URL you supply.** The first wording of this run's own claim — *"not one of them
fetches a web page"* — was **broken** by the adversary as over-strong, because six of the eleven do touch
the network. The surviving sentence separates the two things:

| subcommand | touches the network? | what it does with it |
|---|---|---|
| `setup`, `install` | yes | downloads and installs OTHER tools (opencli, yt-dlp, gh, mcporter, platform CLIs) |
| `check-update`, `watch` | yes | reads this project's own release feed on `api.github.com` |
| `doctor` | yes | probes whether each channel's backend is reachable |
| `transcribe` | yes | pulls **audio** with `yt-dlp -x`, posts it to Whisper |
| `configure`, `uninstall`, `skill`, `format`, `version` | no | local only |

**Six make HTTP requests. Zero hand back the content of a page you named.**

### 13.2 The completeness proof, strengthened by the adversary

`--help` can hide a subcommand (`help=SUPPRESS`) and cannot show aliases, so the adversary introspected the
live parser instead of reading help text:

```
_name_parser_map keys = ['setup','install','configure','doctor','uninstall','skill',
                         'format','transcribe','check-update','watch','version']
count = 11 · parser defaults (set_defaults): {}
```

No aliases · no suppressed entries · no `set_defaults` · one `console_scripts`
(`agent-reach = agent_reach.cli:main`) · no `agent_reach/__main__.py` · `cli.py` is the only module importing
`argparse`. **28 guessed fetch verbs** (`fetch get read url web scrape browse open crawl search page text view
show dump cat curl http jina md markdown extract summarize reach serve mcp read-url search-x search-reddit`)
**all exit 2 with argparse `invalid choice`.** The full flag surface is ledger row **L0255**.

### 13.3 What this run got wrong, and how it was caught

Two errors, both caught inside the run and both corrected before the answer was written:

- **"No release ever carried a page-fetching verb."** False. The run sampled five points and guessed at a
  `v1.0.0` that does not exist. **`v1.1.0` (2026-02-25) shipped eighteen subcommands including
  `read <url>` — help text *"Read content from a URL"* — and ten `search*` commands.** Commit
  **`a37e9aa1`, 2026-02-26T07:15:56Z**, *"refactor: strip to installer + doctor + docs, remove read/search
  wrapper layer"*, `cli.py +4/−156`, body *"BREAKING CHANGE: Remove all `agent-reach read` and
  `agent-reach search-*` commands."*
- **"DeepWiki fabricated `agent-reach read`."** False. DeepWiki documents a real, since-deleted surface.
  It is **stale, not invented** — and it is mislabelled, pinning its pages to `da5044d2`, a commit dated
  **2026-09-01** (*"fix(readme): update sponsor link"*) that carries the eleven modern verbs.

The adversary then closed the hole properly: **all 7 tags, 3 branches and all 67 commits touching `cli.py`
after the removal** → `COMMITS AFTER REMOVAL THAT RE-ADDED A FETCH/READ/SEARCH VERB: NONE`.

### 13.4 The trap is the whole ecosystem, not one wiki

Three counter-searches of the negation, run by the adversary in a separate context:

| what was searched | what came back |
|---|---|
| `"agent-reach fetch" OR "agent-reach read" url command CLI` | 8 results; **every substantive one asserts the command exists** — DeepWiki, allclaw.org, lifehubber.com, addrom.com, toknow.ai, lobehub. The engine's own synthesis: *"The `agent-reach read <url> [--json]` command dispatches to `_cmd_read(args)`"* — present tense |
| `agent-reach CLI "read <url>" Panniantong command removed` | 7 results, **none** mentioning the removal |
| `"agent-reach" CLI does not have read or search commands installer doctor only` | surfaced the repo's own `CLAUDE.md` (*"NOT a wrapper"*) — and still concluded *"agent-reach actually does support read and search commands"* |

**And the vendor is part of the trap.** Measured on this machine today:

```
agent_reach-1.5.0.dist-info/METADATA
Summary: Give your AI Agent eyes to see the entire internet. Search + Read 10+ platforms.
```

The package's own one-line description still sells "Read" **6 months and 21 days** after the verb was
deleted. That, not DeepWiki, is where the confusion starts.

### 13.5 Where the project tells you what to do instead

`README.md:125` — *"帮我看看这个链接" → `curl https://r.jina.ai/URL` 读任意网页* · `docs/README_en.md:187` —
*"Read this link" → `curl https://r.jina.ai/URL` for any web page* · `integrations/mcp_server.py:7-8` —
*"Agent Reach is an installer + doctor tool. For actual reading/searching, agents should call upstream tools
directly (twitter-cli, yt-dlp, mcporter, etc.)"* · its MCP server exposes exactly one tool, `get_status`.

The library still contains a page reader — `channels/web.py` `WebChannel.read()` pulls any URL through Jina
Reader — and **nothing reaches it**: the channel registry's only consumer is `doctor.py`, which calls
`check()` alone, and there is no call site of `read()` anywhere in the installed package.

### 13.6 Coverage, and what this run did not do

22 channels swept, **18 returned results, 4 returned empty** (`hackernews`, `github-repos`, `github-issues`,
`stackoverflow` — the declared `google` fallback fired for two of them). 14 pages read through the eleven-door
chain, **13 opened** (scrapling 10 · stealth 2 · tavily-extract 1); the one that stayed shut,
`http://user:pass@ip:port`, is not a page — it is a fragment the URL extractor lifted out of
`agent-reach install --help`. The Chinese tier was never opened, on a Chinese-first project. Full list, plus
five engine defects the adversary named, in that run's `GAPS.md`.

**Where the grounding checker disagreed with me and I left it standing:** `verify.py` supports the combined
evidence for C1, C2 and C3 and marks C4 and C6 NOT SUPPORTED even combined. Those two join a code fact to a
marketing fact; no single passage entails the whole sentence. They are my reading of several sources together,
not any one source's statement, and are written as such rather than re-cited to make the light go green.

---

## 14. Sixth run — a LIGHT-mode re-measurement that inherited nothing, 2026-09-16 23:07–23:25

Run `20260916-210748` · class `capability` · mode **light** (the engine's own default standard since the
acceptance race of the same day) · ledger `L0001–L0009`. The question was asked again from a fresh session;
this file was not read until every measurement below had already been taken, so the agreement is between two
independent runs and not an echo of this page.

**Measured here, from zero:** `agent-reach --version` → v1.5.0 · `--help` → the same eleven names ·
each of the eleven `<cmd> --help` in full · `grep add_parser` in the installed `cli.py` → 11 calls,
`grep -c SUPPRESS` → **0** · `entry_points.txt` → one console script, `agent_reach.cli:main` ·
`grep -rn "def read("` → **one** definition, `channels/web.py:48`, and `grep -rn "\.read(url"` → **no call
site anywhere in the package** · `integrations/mcp_server.py` → a single tool, `get_status`, over a module
docstring that says *"Agent Reach is an installer + doctor tool. For actual reading/searching, agents should
call upstream tools directly"* · upstream `main` today, fetched fresh → the same eleven `add_parser` names ·
`api.github.com/search/commits` → `a37e9aa1`, 2026-02-26, *"remove read/search wrapper layer"* ·
`pypi.org/pypi/agent-reach/json` → Jean Galea's different tool, whose README does carry
`agent-reach get rss.feed <url>` · the vendor's own current skill doc (`agent_reach/skill/references/web.md`)
whose instruction for reading a page is `curl -s "https://r.jina.ai/URL"` — not an `agent-reach` command.

**Result: no correction to make.** Every load-bearing statement in §§1–13 survived an independent
re-measurement, including the two that most invite error — the namesake CLI on PyPI, and `transcribe`
handing a user URL to `yt-dlp`.

**What this run did NOT do, and what it therefore cannot claim:** it ran no search sweep, it opened no
human channel, and it did not repeat the adversary round — in light mode there is none. Where this answer
rests on a human being's opinion rather than on code, it rests on §§5–13, not on this section.

**The ledger this run leaves behind, counted rather than asserted:** 10 rows — **6 evidence**
(`L0001` the upstream README through the chain · `L0002` `--help` · `L0003` the argparse/`SUPPRESS`/call-site
greps · `L0004` `check-update` · `L0008` the GitHub commit search · `L0009` the PyPI namesake) and **4
discovery** leads the capture hook lifted out of Bash output, three of which are not addresses at all
(`https://{url`, and two API endpoints with a trailing `\` — string literals my grep printed out of
`transcribe.py`). `urlcheck.py` duly calls those three dead. They are leads, not citations, and nothing in
this file rests on them.

**An engine defect this run found by being run — reported, not fixed:** the four upstream pages read with
`fetch.py --batch` (`README_en.md`, upstream `cli.py`, `SKILL_en.md`, `references/web.md`) produced **no
ledger row at all**. `fetch.py:293` passes `ledger_evidence=False` for every batch on purpose — inside
`sweep.sh` the rows are written afterwards by `ingest.py` (`sweep.sh:315` then `:350`), which keeps each
page's *discovering* channel instead of stamping them all `fetch:scrapling`. But a batch run **by hand** has
no `ingest.py` behind it, so the pages simply vanish, while `SKILL.md` promises *"every fetch you make by
hand is also captured into the ledger automatically"*. The repair is small and contained — a `--no-ledger`
flag that `sweep.sh` passes, batch defaulting to writing otherwise — and it was **not applied**: the engine's
own files are write-protected on disk (`scripts/*.py` and `sweep.sh` mode `555`, `SKILL.md` `444`, set
2026-09-16 22:30–23:03, a local lock that is not in git, which tracks them `100755`). Unlocking the
enforcement surface is not something this run does on its own.
