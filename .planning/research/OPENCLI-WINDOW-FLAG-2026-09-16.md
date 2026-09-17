# `opencli … --window background` — the refusal, the cause, the fix

Measured 2026-09-16 on DXB-Center. opencli **1.8.7** (`/home/dxb/.npm-global/lib/node_modules/@jackwener/opencli`).
Question: *on a machine where `opencli hackernews search "x" --window background` fails, what is the error and what is the fix?*
Class: **DECISION** — a recommendation is owed, plus what would flip it. Everything below is a
command run in this session; nothing is quoted from memory.

## 1. The error

| command | output | exit |
|---|---|---|
| `opencli hackernews search "x" --window background` | `error: unknown option '--window'` | **1** |
| `opencli stackoverflow search "rust" --window background` | `error: unknown option '--window'` | **1** |
| `opencli bluesky search "rust" --window background` | `error: unknown option '--window'` | **1** |
| `opencli substack search "rust" --window background` | `error: unknown option '--window'` | **1** |

It is a **Commander argument-parse refusal**, raised before any network call: the refused
invocation returns in **0.17 s** (3 runs, identical). No login, no Chrome, no rate limit.

## 2. The cause — measured in the source, not inferred

`--window` is a **browser-adapter** option. opencli attaches it to a command only if that
command declares itself browser-backed:

```
dist/src/commanderAdapter.js:51    if (cmd.browser) {
dist/src/commanderAdapter.js:53        .option('--window <mode>', 'Browser window mode: foreground or background')
```

`hackernews search` does not:

```
$ opencli hackernews search "x" --help -f yaml
site: hackernews   name: search   access: read   browser: false   domain: news.ycombinator.com
$ opencli reddit search "x" --help -f yaml | grep browser
browser: true
```

and the adapter file says why — it is a plain HTTP call to the Algolia API, so no window exists:

```
clis/hackernews/search.js:9   browser: false,
clis/hackernews/search.js:23  url: `https://hn.algolia.com/api/v1/${… 'search_by_date' : 'search'}`
```

The same distinction drives the help text: `help.js:494` prints the "Browser common options"
block only `if (unique.some(cmd => cmd.browser))` — which is why `opencli reddit --help` lists
`--window` and `opencli hackernews --help` does not.

**It is documented upstream, so it is design and not a bug** — the package's own README:

> `OPENCLI_WINDOW` … Set to `foreground` or `background` to override Browser Bridge window
> placement. **Browser-backed** commands also accept `--window <foreground|background>`.
> — `README.md:173`

## 3. How wide the refusal is (the roster, closed)

From the shipped `cli-manifest.json` — **1332 commands over 176 sites**:

| | count |
|---|---|
| commands with `browser: true` (accept `--window`) | **1011** |
| commands with `browser: false` (**refuse** `--window`) | **321** (24 %) |
| sites where every command accepts it | 94 |
| sites where **no** command accepts it | **57** |
| sites that are mixed | 25 |

Of the 26 `opencli` channels in this repo's own `scripts/sweep.sh`, exactly three carry the flag
into an adapter that refuses it: **stackoverflow (line 71) · bluesky (75) · substack (76)**.
All four refusing commands measured above return live results the moment the flag is dropped
(exit 0: HN xz-backdoor story 4549 points · SO id 24158114 · Bluesky `rusty.todayintabs.com` ·
Substack "🦀 Rust Debugging Survey Findings").

## 4. The fix

**Drop the flag. There is no syntax that makes it work on a non-browser adapter** — all three
alternatives were tried and all three fail:

| attempt | result |
|---|---|
| `opencli hackernews search "x" --window=background` | `error: unknown option '--window=background'` · exit 1 |
| `opencli --window background hackernews search "x"` | `error: unknown option '--window'` · exit 1 |
| `opencli hackernews search "x" -f yaml -- --window background` | `error: too many arguments for 'search'` · exit 1 |

**Dropping it costs no privacy**, which is the only reason the flag was ever written: a
`browser: false` command opens no browser at all, and for the browser-backed ones **background is
already the default** —

```
dist/src/execution.js:230  resolveBrowserWindowMode(cmd.defaultWindowMode ?? 'background', opts.windowMode)
dist/src/execution.js:574  function resolveBrowserWindowMode(defaultMode = 'background', rawOption) {
dist/src/execution.js:575      return normalizeWindowMode('--window', rawOption)
dist/src/execution.js:576          ?? normalizeWindowMode('OPENCLI_WINDOW', process.env.OPENCLI_WINDOW)
dist/src/execution.js:577          ?? defaultMode;
```

So the one form that is safe on **every** adapter, browser-backed or not, is the environment
variable — honoured by the browser ones, silently ignored by the rest:

```bash
export OPENCLI_WINDOW=background      # machine-wide, no flag in any command line
opencli hackernews search "x" -f yaml      # exit 0  (measured)
opencli reddit     search "rust" -f yaml   # exit 0  (measured)
```

And to know before writing a command line: `opencli <site> <cmd> --help -f yaml` prints
`browser: true|false` on its own line.

## 5. What this repo did — CORRECTED 2026-09-16 21:07 by running it

The earlier version of this section, written at 20:59 from the source alone, concluded
**"No change recommended"**: `scripts/sweep.sh:123-126` kept the flag and fired a flagless retry
on the refusal, at a measured cost of 0.17 s. **Running the sweep falsified that conclusion, so
it is replaced rather than footnoted.** The retry did not fire correctly:

```sh
timeout "$TMO" bash -c "${run/ --window background/}"     # the defect
```

`${var/pat/}` replaces the **first** occurrence only, and `$run` is the command **after** the
query has been interpolated into it. When the query itself contains those words — this
investigation's own query was `opencli hackernews --window background flag error` — the
substitution eats the copy inside the query and the real flag is re-sent unchanged. The retry
then fails exactly as the first call did, and the channel is lost.

Measured on the live sweep of 19:00, tier `wide`, 22 channels:

| | before the repair | after, identical query and tier |
|---|---|---|
| channels that errored | **4** | **1** (`quora-forums`, an unrelated DuckDuckGo `EMPTY_RESULT`) |
| channels that answered | 14 | **15** |
| `stackoverflow` · `substack` | `exit 1 — unknown option '--window'` | answered |
| `bluesky` | `exit 1 — unknown option '--window'` | **10 results, 2 787 bytes** |

**The repair, applied:** `sweep.sh` now `export OPENCLI_WINDOW=background` once at the top and
carries **no `--window` flag on any of its 21 opencli channel lines** — which is this note's own
§4 recommendation, applied to the script that was not yet taking it. The flagless retry is kept
as a safety net for a hand-edited line, and its substitution now runs on the **template** before
the query is interpolated (`cmd_nw` / `run_nw`), so a query containing the words can no longer
eat it. Documents re-aligned in the same turn: `.claude/skills/dxb-research/SKILL.md`
(the screen table and the paragraph under it) and `references/channels.md` (the adapter section,
which had named only `hackernews`).

**The blast radius, swept rather than assumed.** Three more places in this skill carried the
same flag, and two of them were doing damage:

| file | what it was doing | after |
|---|---|---|
| `scripts/probe.sh` — its own inline `P[…]` map, 11 opencli probes | reported **bluesky and stackoverflow as FAIL** (33 bytes = the refusal text) — the health probe was calling two working channels broken | flag removed, env var exported: **8 of 8 LIVE**, browser-backed adapters included (reddit 24 365 B, twitter 9 712 B) |
| `config/registry.yaml` — 10 `probe:` lines | a second, drifting copy of the same commands | flag removed |
| `scripts/fetch.py:114` — the `opencli` reading door | burned one failed call on every hackernews/stackoverflow page before retrying | flag removed, `OPENCLI_WINDOW` set at import |

Two observations that came out of the sweep and are **not** repaired, because neither changes
behaviour: `config/registry.yaml` is not valid YAML at HEAD (line 12, an unquoted `:` inside
the exa probe) and never was — every consumer reads it with `grep`, not a parser; and
`probe.sh` keeps its command map inline instead of reading `registry.yaml`, which is why the
two copies could drift apart in the first place.

## 6. What would flip this answer

*If a later opencli gave the HTTP adapters a no-op `--window`*, the flag would stop failing and
the retry would become dead code. Checked, and it does not: **installed 1.8.7 = latest on npm
1.8.7**, the behaviour is written into the upstream README as intended, and a search of the
upstream tracker (`gh search issues --repo jackwener/opencli "window"`, 8 hits) found **no issue
about non-browser adapters refusing the flag** — the open window bugs there are all about the
browser bridge itself (orphaned `about:blank` containers #2202, focus stealing #2167, tab
hijacking #2364).

## 7. Holes

- **Live-tested 4 of the 321 refusing commands** (hackernews · stackoverflow · bluesky ·
  substack). The other 317 are read from the shipped manifest, not executed.
- **⚠ UNVERIFIED — requires human-eye confirmation:** that no window appears on the CEO's screen.
  `wmctrl -l` printed 0 lines both before and after the reddit run — it cannot enumerate windows
  on this GNOME **Wayland** session, so the screen claim rests on `browser: false` plus
  `execution.js:574-577`, not on a screenshot.
- The 20:59 version of this note swept no search channel. The 21:00 run did: 22 channels, 14 pages
  read through the fetch chain (scrapling 12, stealth 2), and the sweep found **one source that
  contradicts §2** — the third-party skill `mxyhi/ok-skills` calls `--window` one of opencli's
  *"Universal flags (work on every adapter command)"*. It is wrong, and the vendor's own README
  (`README.md:173`, *"Browser-backed commands also accept `--window`"*) plus the 4-of-4 exit-1
  measurement above settle it against them.
- Upstream issue **#1850** (opened 4 June 2026 against 1.8.2) is the same error string from a
  **different** cause — the flag placed after the leaf subcommand on `opencli browser <session>
  open <url> --window background`. It is **Closed** by PR #1963 and 1.8.7 carries the argv fix
  (`hoistBrowserWindowOption`), so it is not what this machine hit.
- Evidence ledger for the 21:00 run: `.claude/skills/dxb-research/runs/20260916-185948/`
  (28 evidence rows, 46 clusters, 22 queries, 4 contradiction searches logged).

## 8. What the second pass broke — every item re-measured by the author before it was accepted

A second pass was run in a separate context against the ledger and the claims, and it did break
things. RULE #0-A: none of its numbers were taken on trust; each was re-run here first.

**It broke the remedy as it was stated.** The claim had been *"the fix is
`OPENCLI_WINDOW=background`, measured: four non-browser adapters go from exit 1 to exit 0"*.
That evidence is **vacuous**, and the poison-value test shows why:

| command | exit |
|---|---|
| `OPENCLI_WINDOW=bogus opencli hackernews search "opencli"` | **0** — 385 bytes of real Hacker News rows |
| `OPENCLI_WINDOW=bogus opencli reddit search "opencli"` | **2** — `ARGUMENT · OPENCLI_WINDOW must be one of: foreground, background. Received: "bogus"` |

A non-browser command **never reads the variable at all**, so its exit 0 proves nothing about
it. The honest fix for the command in the question is **drop the flag**. The environment
variable is the right shape for a *script* that calls both kinds — because the browser-backed
ones do read it, and validate it, before any browser work.

**It broke the word "only" in the cause.** `homebrew popular` is `Browser: no` and yet owns an
option spelled `--window` — its own **time** window:

```
$ opencli homebrew popular --help     ->  --window [value]  Time window (30d / 90d / 365d)  default: 30d
                                          Access: read | Browser: no
$ opencli homebrew popular --window background
ok: false   code: ARGUMENT   message: homebrew window "background" is not supported
help: 'Allowed: 30d, 90d, 365d.'   exitCode: 2
```

One command in 1 332, and the only one — but "only browser-backed commands have `--window`" is
false as written. The second pass's first probe of all 1 332 left ten undecided (Commander's
missing-required-option check fires before its unknown-option check), so the author re-probed
every command by parsing its own `--help`: **1 011 register the browser `--window <mode>` · 320
have no `--window` at all · 1 owns its own** = 1 332, **zero probe errors, zero mismatches**
against `cli-manifest.json`. The ten were `12306 price/train/trains`, `confluence
create/update`, `mercury reimbursement-plan`, `osv query`, `paperreview feedback/submit`,
`trip package` — all `browser: false`, all refusing.

**It corrected a count.** 69 commands declare `defaultWindowMode: foreground`; **66 are
`login`, not all 69**. The other three are `mercury check-login` (access **read**),
`mercury reimbursement-draft` and `midjourney action` — each will open a **foreground** window
on the CEO's screen unless `OPENCLI_WINDOW` is set.

**It collapsed this run's one "contradicting source".** The run had recorded that
`mxyhi/ok-skills` calls `--window` a *"universal flag"*. Re-measured: that file is
**byte-identical** (`diff -q`, 10 599 B) to `skills/opencli-usage/SKILL.md` **shipped inside the
installed package**, and its Universal-flags table holds exactly two rows — `-f, --format` and
`-v, --verbose`. `--window` is not in it. The run had read a search snippet, not the table. The
page corroborates the finding; there is no contradicting source.

**It added a risk worth the CEO's attention.** Upstream **#2167**, *"Background window steals
focus on initial creation on macOS"*, opened 2026-07-23 against 1.8.6, is **still open**  <!-- HISTORY -->
(`gh api` this session). macOS-scoped and no Linux equivalent found — but `background` is a
request, not a guarantee, and this machine is his own screen.

**And it settled what would flip the answer.** `registry.npmjs.org` dist-tag `latest` for
`@jackwener/opencli` is **1.8.7** — exactly what is installed. There is no upgrade that fixes
this, because it is not broken. `gh search issues --repo jackwener/OpenCLI '"unknown option"
window'` returns **one** hit, #1850: nobody has ever reported expecting `--window` to work on a
non-browser adapter.

## 9. Two engine defects that fell out of the second pass's second round

**The export's sharp edge.** Precedence is `--window` > `OPENCLI_WINDOW` > per-command default,
so the blanket export **overrides a deliberate foreground default**: a `login` command, which
exists to be seen by the human, would be forced into a background window. Measured —
`OPENCLI_WINDOW=bogus opencli mercury check-login` exits 2 with `OPENCLI_WINDOW must be one of:
foreground, background`, proving the variable reaches those commands. `sweep.sh` and `probe.sh`
now **refuse to start** if any channel line calls a `login` verb (exit 3). Neither calls one
today; the guard is there so a future edit cannot quietly add one.

**Four of the seven doors in the reading chain were dead.** `fetch.py`'s `PLATFORM_READERS`
named `twitter read`, `v2ex read`, `youtube read` and `zhihu read` — **none of those commands
exists**: `opencli v2ex read 123` answers `error: unknown command 'read'`, exit 1. Only
`reddit`, `hackernews` and `stackoverflow` ship a `read`. Worth recording *how* it hid: testing
a door with `--help` says all seven exist, because opencli falls back to the *site* help when
the subcommand is unknown. The detector had to be validated before it could be trusted. Repaired
to the verbs those sites actually ship, and measured live:

| door | before | after |
|---|---|---|
| `youtube` | `read` — does not exist | **`transcript` → 16 206 bytes**, the words actually spoken |
| `v2ex` | `read` — does not exist | `topic` → 676 bytes |
| `zhihu` | `read` — does not exist | `question` → the verb is right; the SITE refuses navigation on this machine (same family as weibo) |
| `twitter` | `read` — does not exist | `thread` — ⚠ **UNVERIFIED**: no live tweet id could be extracted to exercise it; the verb and its one-positional signature were read from its own `--help` |

---

## Appendix — second independent measurement, 2026-09-16 (fresh session, Opus 5)

The same question was put again in a new session with no access to this file's numbers. Every
figure below was re-measured from the installed binary; all of them agree with the run above.

| check | command | decisive output |
|---|---|---|
| the refusal | `opencli hackernews search "x" --window background` | `error: unknown option '--window'` · stdout empty · **exit 1** |
| same class, second adapter | `opencli stackoverflow search "x" --limit 2 --window background` | `error: unknown option '--window'` · **exit 1** |
| the cause | `dist/src/commanderAdapter.js:51-56` | `if (cmd.browser) { .option('--window <mode>', …) .option('--site-session …') .option('--keep-tab …') }` |
| the adapter's own label | `opencli hackernews search --help` | `Access: read \| Browser: no` |
| the roster, closed | `opencli list -f json` → 1 387 181 bytes | **1332 commands · 176 sites · 321 commands (24.1 %) carry `browser:false`, spread over 82 sites** |
| per-adapter | same manifest | hackernews 9/9 · stackoverflow 8/8 · bluesky 9/9 · npm 3/3 browserless; reddit 0/21 · twitter 0/46 · youtube 0/16 · substack 1/3 |
| the fix works | `OPENCLI_WINDOW=background opencli hackernews search "x" --limit 3 -f json` | **exit 0**, 3 live rows (rank 1 = "Backdoor in upstream xz/liblzma…", score 4549) |
| the env var is IGNORED by a browserless command | `OPENCLI_WINDOW=bogus opencli hackernews search "x" --limit 1` | **exit 0** with real results — no validation, so it can never be refused |
| …and DOES reach a browser command | `OPENCLI_WINDOW=bogus opencli reddit search "x" --limit 1` | **exit 2** · `OPENCLI_WINDOW must be one of: foreground, background` |
| the env var on the working browser path | `OPENCLI_WINDOW=background opencli reddit search "opencli" --limit 2` | **exit 0**, live rows, no window on screen |
| background is already the default | `dist/src/execution.js:230` | `resolveBrowserWindowMode(cmd.defaultWindowMode ?? 'background', opts.windowMode)` — and **no shipped command declares `defaultWindowMode`** (manifest scan: `{}`) |
| precedence | `dist/src/execution.js:574-578` | `--window` > `OPENCLI_WINDOW` > command default |
| no version fix pending | `npm view @jackwener/opencli version` → `1.8.7` · `opencli --version` → `1.8.7` | installed **is** latest; behaviour is documented in `README.md:173`, so it is design |
| upstream tracker | `gh search issues --repo jackwener/opencli "window" --limit 10` | 10 open window-related issues, **none** asking for `--window` on browserless commands |

**Channel failure to report, not hide:** `opencli duckduckgo search` fails on this machine with
`COMMAND_EXEC: duckduckgo search navigation failed: Navigation rejected.` **both with and without**
the flag — unrelated to `--window`, same family as upstream #2515. `opencli reddit search` and
`opencli hackernews search` both returned live data in the same minutes.

**Our own engine is already immune:** `scripts/sweep.sh:139-154` strips ` --window background`
from the template and retries when it sees `unknown option '--window'`, and `probe.sh:21` /
`sweep.sh` export `OPENCLI_WINDOW=background` once instead of passing a flag. Re-measured this
session — no repo script passes the flag to a browserless adapter.

---

## Appendix B — third independent measurement, 2026-09-16 22:26–22:48 (fresh session, Opus 5)

The CEO put the question a third time with the explicit order to run the research engine end to
end: *"open a research run, sweep, read the pages, satisfy the completion gate, then give the
answer."* Run id **20260916-202625**, class DECISION. Nothing below is quoted from this file's
earlier sections — every number was re-measured from the installed binary, and two of them are
new.

### What the run actually did

| | |
|---|---|
| sweeps | 2 × `wide`, 22 channels each · sweep A on the error string, sweep B on the environment variable |
| channels | A: 16 answered · 5 empty · **1 FAIL** (`quora-forums`, `EMPTY_RESULT` from DuckDuckGo). B: 17 answered · 5 empty · 0 FAIL |
| queries | 51 logged, including 7 contradiction searches |
| pages read | **27 of 28** through the eleven-door chain (scrapling 21 · stealth 4 · firecrawl 1 · jina 1) |
| evidence rows | 43, in 26 independent clusters, max channel share **0.29** |
| gate | `gate.py` — all HARD checks green before the answer was written |

### The decisive evidence, all of it run in this session on opencli 1.8.7

| what | command | decisive output |
|---|---|---|
| the error | `opencli hackernews search "x" --window background` | `error: unknown option '--window'` · stdout empty · **exit 1** |
| …and no rearrangement helps | `--window=background` / flag before the site / after `--` | `unknown option '--window=background'` · `unknown option '--window'` · `too many arguments for 'search'. Expected 1 argument but got 3.` — **exit 1 all three** |
| the cause | `dist/src/commanderAdapter.js` | `if (cmd.browser) { .option('--window <mode>', 'Browser window mode: foreground or background') … }` |
| the adapter's own label | `opencli hackernews search --help` | `Access: read \| Browser: no \| Domain: news.ycombinator.com` |
| the contrast | `opencli reddit search --help` | a `Browser common options:` block carrying `--window <mode>` · `Access: read \| Browser: yes` |
| **NEW — the roster EXECUTED, not just read** | **all 321** browserless commands, each run as `opencli <site> <cmd> x --window background` | **310** answered `error: unknown option '--window'` at exit 1 outright · **10** stop earlier because Commander checks a missing REQUIRED option before an unknown one (12306 price/train/trains · confluence create/update · mercury reimbursement-plan · osv query · paperreview feedback/submit · trip package) and `--window` is absent from each of their own `--help` · **1** is the homebrew exception below. **320 of 321.** |
| the roster, closed | `cli-manifest.json` of 1.8.7 | **1332 commands · 176 sites · 1011 browser:true · 321 browser:false (24.1 %)** · 94 sites accept it everywhere, **57 nowhere**, 25 mixed · hackernews **0 of 9** browser-backed |
| the fix | `opencli hackernews search "x" --limit 3 -f json` | **exit 0**, live rows (rank 1 = *Backdoor in upstream xz/liblzma…*, score 4549) |
| the env var is never read by a browserless command | `OPENCLI_WINDOW=bogus opencli hackernews search "x" --limit 1` | **exit 0** with real results — no validation, so it can never be refused |
| …and IS read by a browser-backed one | `OPENCLI_WINDOW=bogus opencli reddit search "x" --limit 1` | **exit 2** · `OPENCLI_WINDOW must be one of: foreground, background` |
| background is already the default | `dist/src/execution.js:230` · `:574-578` | `resolveBrowserWindowMode(cmd.defaultWindowMode ?? 'background', opts.windowMode)` · precedence `--window` > `OPENCLI_WINDOW` > command default |
| the one counter-example | `opencli homebrew popular --window background` | `Browser: no`, yet owns its own **time** `--window [value]`: `ARGUMENT / homebrew window "background" is not supported`, **exit 2** — not `unknown option` |
| no upgrade pending | `npm view @jackwener/opencli version` · `opencli --version` | **1.8.7 = 1.8.7**; `README.md:173` documents the split, so it is design |
| **NEW — it was never otherwise** | `gh api repos/.../commits?path=clis/hackernews/search.js` | three commits ever; at the oldest (`d2974a9f`, 2026-04-10) the file already reads `browser: false`, exactly as 1.8.7 does. **No version of opencli exists in which this flag worked here.** |
| nobody upstream expects it to work | `gh search issues --repo jackwener/opencli "unknown option window"` | **one** hit, #1850, a *different* cause (flag after the leaf subcommand of `opencli browser <session> open <url>`), **closed completed 2026-06-17**, and its argv fix `hoistBrowserWindowOption` is present in the installed build |
| **NEW — nothing on this machine teaches the flag** | grep across `~/.claude/skills/` and the vendor's own shipped agent skill | `--window` appears **0 times** in `skills/opencli-usage/SKILL.md`, whose *"Universal flags (work on every adapter command)"* table holds exactly two rows: `-f/--format` and `-v/--verbose` |
| **NEW — a third-party doc that is wrong and will waste an hour** | deepwiki's OpenCLI configuration reference names `OPENCLI_WINDOW_FOCUSED` and `--focus` | neither exists: grep finds `OPENCLI_WINDOW_FOCUSED` in **zero** files of the installed package, and `opencli hackernews search "x" --focus` / `opencli reddit search "x" --focus` both answer `error: unknown option '--focus'`, exit 1 |

### The grounding checker disagreed, and it is recorded rather than smoothed over

`verify.py` (bespoke-minicheck, local, advisory) marked **3 of 15** cited passages as supporting
their claim. The not-supported rows are terminal transcripts — JSON payloads and `exit=1` lines —
put to a checker trained on prose. It is not evidence that the claims are wrong, and it is not
evidence that they are right either: what carries them is that every command in the table above
is printed in full and re-runs in under a second on this machine.

### Two engine defects the run exposed, repaired at source AFTER the run was closed

The gate refused the first attempt to repair them mid-run — **H18: *the enforcement surface
CHANGED while this run was open… a gate that can be rewritten mid-run is not a gate.*** The hook
was restored to its pre-run bytes, the run was finished and closed, and only then were both
repairs applied.

| defect | what it did | repair | measured |
|---|---|---|---|
| `sweep.sh` URL extraction | a Google snippet printed `…open https://creator.`; `rstrip(".,);")` turned it into the host `creator`, which cannot exist. All **eleven** doors of the reading chain were spent on it and it was then reported to the CEO as a page that could not be read | a url whose host has no `dot + TLD` never enters the queue | on the same 237 urls of sweep A: 1 invalid before, 0 after; the queue still returns 14 pages and the only line that changed is the dead host being replaced by a real one |
| `hooks/ledger-capture.py` channel naming | `r"opencli\s+([a-z0-9-]+)"` matched the word anywhere in a compound command, so `npm view @jackwener/opencli version` became the channel `opencli:version`, `opencli --version` became `opencli:--version`, the string `opencli 1.8.7` inside an argument became `opencli:1`, and the query text `opencli unknown option` became `opencli:unknown` — four channels that never ran, surfaced by `coverage.py` as **HOLES reported to the CEO** | `opencli` must sit where a command sits (line start, after `;` `\|` `&&` `\|\|` `(` or a backtick, optionally behind `VAR=value`), and the next token must start with a letter | on this session's own 183 bash rows: **4 invented channels before, 0 after**, both real ones (`opencli:hackernews`, `opencli:homebrew`) kept |

Blast radius swept in the same turn: `bash -n sweep.sh` OK · the patched extractor run end-to-end
against sweep A's real raws · the hook re-imported and six naming cases checked · `gate.py`,
`coverage.py`, `urlcheck.py` all still run on this run · `probe.sh` re-run afterwards: **12 LIVE**
(hackernews 810 ms/4 442 B · reddit 4 111 ms/24 365 B · twitter 11 858 B), `linux-do` AUTH,
`linkedin` TIMEOUT 20 s. Both files were mode `555` and were returned to `555`.

### Holes, unchanged from `runs/20260916-202625/GAPS.md`

- The manifest hole is **closed**: all 321 browserless commands were executed, not sampled.
- **Independence is thin by construction** and is said rather than implied away: the five load-bearing
  claims rest on one kind of source — first-hand local measurement on this machine — with three external
  rows (vendor README, #1850, deepwiki). The 44-query, 22-channel web fan-out found the pages that framed
  the question; it contributed nothing to any load-bearing claim.
- **The one route that exists**, found by the second pass: no *syntax* makes the flag work here, but
  `opencli adapter eject hackernews` copies the adapter to `~/.opencli/clis/` for local editing and
  flipping its `browser` flag would register the option — at the price of making a command that needs no
  browser try to drive one. `~/.opencli/clis/` is empty here, so the shipped manifest is what runs.
- ⚠ **UNVERIFIED — requires human-eye confirmation:** that no window appears on the CEO's screen.
  `wmctrl` cannot enumerate windows on this GNOME **Wayland** session.
- Upstream **#2167** — *"Background window steals focus on initial creation on macOS"*, opened
  2026-07-23, **still open**: `background` is a request, not a guarantee. macOS-scoped; no Linux  <!-- HISTORY -->
  equivalent found.

### The second pass, run in a separate context — and every correction re-measured before acceptance

RULE #0-A: not one of its numbers was taken on trust.

| claim | verdict | what it found, after the author re-ran it |
|---|---|---|
| **C1** the error | **stands** | all four syntaxes re-run: byte-identical stderr and exit codes |
| **C2** the cause | **weakened → repaired** | the word *"only"* was false. `--window` is registered in **two** places, not one: `commanderAdapter.js:53` behind `if (cmd.browser)`, and **`cli.js:863` UNCONDITIONALLY on the `browser` namespace** — which is why `opencli browser --help` lists it. A third `if (cmd.browser)` gate sits at `cli-argv-preprocess.js:176-180`. Both re-read by the author. The roster reproduces three independent ways (python over the manifest · `jq` · the runtime `opencli list -f json`) |
| **C3** the fix | **weakened → repaired** | a poison value proves the variable is never **validated**, not that it is never **read**. The proof it pointed at, re-measured here: `OPENCLI_WINDOW` is read in exactly three files (`cli.js:533`, `execution.js:576`, `browser/daemon-client.js:204`) and `capabilityRouting.js` → `shouldUseBrowserSession` returns false the moment `!cmd.browser` |
| **C4** the consequence | **stands** | census re-counted: 69 foreground / 4 background / 1259 null; **67** commands named `login`, of which **66** are foreground; the other three are all `browser:true` |
| **C5** design, not a bug | **stands, strengthened** | `npm dist-tags` is exactly `{latest: 1.8.7}` — no `next`, no prerelease. And it caught this run stopping early: searching only `"unknown option window"` gave one hit; searching **`OPENCLI_WINDOW` gives five**, and **#2284** — *"OPENCLI_WINDOW=background (headless) is undocumented"*, closed completed **2026-08-17** — is the issue that put `README:173` there |

**Broken: nothing.** Counter-searches that found nothing are evidence too: `"window non-browser"` (0 hits),
`"hackernews window"` (0), `"universal flag window"` (0), `OPENCLI_WINDOW_FOCUSED` across the whole package
(0 files), and the attack that a **local override** was quietly changing the roster on this box —
`~/.opencli/clis/` is empty.

---

## Appendix C — fourth independent measurement, 2026-09-16 23:2x (fresh session, Opus 5, run `20260916-212148`, LIGHT)

Asked again, from a clean session, through `dxb-research` at its default (LIGHT) standard.
Class `troubleshooting` — which owes *the code or the doc, plus someone who actually hit it*.
Everything below was run on this machine in that run; nothing is carried over from Appendices A–B.

### The error, reproduced

```
$ opencli hackernews search "x" --window background
error: unknown option '--window'
exit=1        # stdout empty — the command never reaches the network
```

### The cause, in the installed source (opencli 1.8.7, `~/.npm-global/lib/node_modules/@jackwener/opencli`)

| file:line | what it says |
|---|---|
| `dist/src/commanderAdapter.js:51-56` | `if (cmd.browser) { subCmd.option('--window <mode>', …) }` — the option is registered **only** for browser-backed commands |
| `clis/hackernews/search.js:9` | `browser: false` |
| `dist/src/execution.js:230` | `resolveBrowserWindowMode(cmd.defaultWindowMode ?? 'background', opts.windowMode)` — reached only on the browser execution path |
| `dist/src/execution.js:574-577` | precedence: `--window` → `OPENCLI_WINDOW` → the command's own default |
| `README.md:173` (vendor primary-doc) | "`OPENCLI_WINDOW` … **Browser-backed commands also accept** `--window`" — browser-only is the documented design |

### Placement cannot rescue it — all five forms measured

| form | result |
|---|---|
| `… search "x" --window background` | `error: unknown option '--window'` |
| `… search "x" --window=background` | `error: unknown option '--window=background'` |
| `opencli hackernews --window background search "x"` | `error: unknown option '--window'` |
| `opencli --window background hackernews search "x"` | `error: unknown option '--window'` |
| `… search "x" -- --window background` | `error: too many arguments for 'search'` |

The argv hoist that closed upstream issue #1850 (`dist/src/cli-argv-preprocess.js:128` `hoistBrowserWindowOption`)
fires only inside `rewriteBrowserArgv` — the `opencli browser …` family. It can never reach a site adapter.

### The fix, verified

```
$ opencli hackernews search "x" --limit 3 -f json            → exit 0, live rows (xz backdoor / 4549)
$ OPENCLI_WINDOW=background opencli hackernews search "x"    → exit 0, same rows
```

### The poison test — why the env var is the right shape for a mixed script

| command | result | what it proves |
|---|---|---|
| `OPENCLI_WINDOW=bogus opencli hackernews search "x"` | **exit 0**, real results | a non-browser command never reads the variable, so it can never refuse it |
| `OPENCLI_WINDOW=bogus opencli reddit search "x"` | **exit 2**, `ok:false code: ARGUMENT` | a browser command does read and validate it |

### The roster, closed (`opencli list -f json`, counted this session)

| | |
|---|---|
| commands total / sites total | **1332 / 176** |
| commands that ACCEPT `--window` (`browser: true`) | **1011 — 75.9 %** |
| commands that REJECT it (`browser: false`) | **321 — 24.1 %** |
| sites where every command rejects it | **57** (hackernews 9/9 · stackoverflow 8/8 · bluesky 9/9 · npm, pypi, arxiv, wikipedia, …) |
| sites that are **MIXED** — the real trap | **25** (e.g. `substack feed` = `Browser: yes`, `substack search` = `Browser: no`) |

### The default is already `background` — except where an adapter says otherwise

`execution.js:230` defaults site adapters to `background`. Nine adapter files override it, plus the
shared login factory: `clis/_shared/site-auth.js:82 defaultWindowMode: 'foreground'`, which **68 site
`login` commands** are built on, and `mercury/check-login`, `mercury/reimbursement-draft`,
`midjourney/login`, `midjourney/action`. Those are the commands `OPENCLI_WINDOW=background`
actually changes; for an ordinary read command it changes nothing. (`dist/src/cli.js:512` is a
separate default — the `opencli browser …` family defaults to **foreground**.)

### Someone who actually hit it — and the contradiction inside the evidence

* **#1850** (closed, 2026-06-04, on 1.8.2) — a user reporting **the same error string for a different
  cause**: `--window` placed after the leaf on a `browser` command. Fixed upstream by the argv hoist.
  A session that reads only the error string will apply that issue's fix and stay broken.
* **#2415** (OPEN, 2026-08-28) — the sibling defect in the same family: *"TIMEOUT hint tells users to
  pass `--timeout`, which adapter commands do not accept."* The maintainers know the class.
* Of 11 upstream issues carrying an unknown-option error, **none** asks for `--window` on non-browser
  commands. The refusal is design, not a pending bug.

### What would flip the answer — measured, not assumed

Installed version **1.8.7**; `npm view @jackwener/opencli version` → **1.8.7**. There is no newer
release to upgrade into. Ejecting the adapter (`opencli adapter eject hackernews`) and setting
`browser: true` would create the option — and force a browser for a command that needs none.

### Holes in this run

* **No crowd exists.** `stackoverflow search` → 0 rows; `reddit search` and `hackernews search` for the
  error string returned unrelated posts. Outside the issue tracker, nobody has written about this in
  public. That is the measured answer, not a skipped channel.
* **321 refusing commands, 6 run live** (hackernews ×5 placements, substack/reddit help); the other 315
  are counted from opencli's own manifest, not executed.
* ⚠ **UNVERIFIED — requires human-eye confirmation:** the claim that no window appears on screen rests
  on `browser: false` and exit codes, not on a screenshot (Wayland).
* The gate's `first-hand` advisory is left **standing**: every human report found lives on GitHub and is
  typed `code` by the ledger. No row was manufactured to clear it.
