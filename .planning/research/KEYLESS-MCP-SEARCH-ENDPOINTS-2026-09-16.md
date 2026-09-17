# Keyless MCP search endpoints — which of the five answer `tools/list` with HTTP 200 and no API key

**Run** `20260916-170405` · class `capability` · opened and closed 2026-09-16
**Question, verbatim:** *"Name every keyless MCP search endpoint that answers a tools/list POST with
HTTP 200 and no API key, from this list of candidates: Exa, Parallel, Tavily, Firecrawl, You.com.
For each, give the endpoint URL."*

## The answer

**All five.** Every candidate answers a `tools/list` POST with HTTP 200 and no API key. Two of them
need a published, non-secret discriminator on the request — a header for Tavily, a query parameter
for You.com — and without it the same URL returns 401.

| # | vendor | endpoint URL | what else the request must carry | measured | tools listed |
|---|---|---|---|---|---|
| 1 | **Exa** | `https://mcp.exa.ai/mcp` | nothing | **200**, 2441 B, 0.24–0.26 s | `web_search_exa`, `web_fetch_exa` |
| 2 | **Parallel** | `https://search.parallel.ai/mcp` | nothing | **200**, 13213 B, 0.21–0.26 s | `web_search`, `web_fetch` |
| 3 | **Tavily** | `https://mcp.tavily.com/mcp/` | header `X-Tavily-Access-Mode: keyless` | **200**, 16326 B, 0.48–0.52 s | `tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_research`, `tavily_feedback` |
| 4 | **Firecrawl** | `https://mcp.firecrawl.dev/v2/mcp` | nothing | **200**, 10476 B, 0.46 s | `firecrawl_scrape`, `firecrawl_search`, `firecrawl_parse` |
| 5 | **You.com** | `https://api.you.com/mcp?profile=free` | the `?profile=free` parameter | **200**, 8883 B, 0.18–0.21 s | `you-search`, `you-discover` |

All five also require `Accept: application/json, text/event-stream` — the MCP Streamable-HTTP
transport header that every MCP client sends. Without it Exa, Firecrawl and You.com return **406**
*"Not Acceptable: Client must accept both application/json and text/event-stream"*; Parallel and
Tavily answer 200 anyway.

The probe, run twice and byte-identical both times, carried no `Authorization` header, no
`x-api-key`, no key in the query string. This host has no `~/.curlrc`, no `~/.netrc`, and no
`*_API_KEY` in the environment, so nothing could have injected a credential.

## The two negative controls — what proves "keyless" is real

| request | result |
|---|---|
| `https://mcp.tavily.com/mcp/` **without** the access-mode header | **401**, empty body |
| `https://api.you.com/mcp` **without** `?profile=free` | **401**, 43 B: `Unauthorized: OAuth authentication required` |
| `https://mcp.exa.ai/mcp?login` | **401** |
| `https://search.parallel.ai/mcp-oauth` | **401** |
| `https://mcp.firecrawl.dev/v2/mcp-oauth` | **401** |

The last three matter most: the same servers **can** say no, and decline to on the keyless path.
The 200 is a deliberate anonymous tier, not a server that forgot to check.

## Is the header / parameter an API key?

No, and this was attacked deliberately. Both strings are printed in the vendors' public
documentation, are byte-identical for every caller, are bound to no account, grant no identity and
can be published in this file without giving anyone anything. They select an anonymous principal
instead of authenticating a named one. The honest phrasing is **"no API key, but a mandatory
published magic string"**.

The strongest case against: both servers answer the bare URL with a `www-authenticate: Bearer`
challenge, i.e. they classify the missing string as an *authentication* failure, and neither
`.well-known/oauth-protected-resource` document declares an anonymous mode. The case does not hold
— a credential distinguishes callers, and this distinguishes none.

## The URLs are exact strings

| variant | result |
|---|---|
| `https://mcp.exa.ai/mcp/` (slash added) | **404** |
| `https://search.parallel.ai/mcp/` (slash added) | **404** |
| `https://mcp.firecrawl.dev/v2/mcp/` (slash added) | **404** |
| `https://mcp.tavily.com/mcp` (slash **dropped**) | **400** `Missing mcp-session-id` |
| `https://api.you.com/mcp/?profile=free` | 200 — You.com is the only one that tolerates both |

**Firecrawl has a second keyless path:** `https://mcp.firecrawl.dev/mcp`, without `/v2`, returns a
byte-identical 200 / 10476 B / same three tools.

## What "keyless" does NOT mean

- **It is not unmetered.** Tavily's keyless *monthly* budget for this host was already spent during
  this run: `tools/call` returned `{"code":"monthly_cap_reached_bonus_eligible", …}` while
  `tools/list` on the same door still returned 200 with all six tools. The handshake stayed open
  after the work behind it was gone.
- **It is not validated.** An invalid bearer token changes nothing on Exa, Tavily and You.com, and
  on **Firecrawl it widens the surface from 3 keyless tools to 25**. Only Parallel checks a key you
  do present: an invalid `x-api-key` there returns 401 `{"code":16,"message":"Invalid API key (C.1)"}`.
  Sending nothing works; sending rubbish does not.
- **No throttling was seen at this rate**: 8 rapid consecutive keyless `tools/list` per endpoint,
  40 calls in all, **40/40 = 200**, no 429. A burst of eight says nothing about a daily ceiling.
  Only You.com publishes one: 100 queries/day on the free profile.

## Two vendors' documents disagree with their own servers

| vendor | the document says | the live server says |
|---|---|---|
| **You.com** | `?profile=free` gives *"unauthenticated access to `you-search` only"*; `you-discover` is *"excluded from this profile"* | lists `you-search` **and** `you-discover` — and a keyless `tools/call` of `you-discover` returned 200 with 8 results |
| **Tavily** | keyless gives *"`tavily-search` and `tavily-extract`"* — two tools | lists **six** |

In both cases the live surface is wider than the document. Left standing, not averaged away.

## Corroboration from outside the vendors

`exa-labs/exa-mcp-server` issue **#378** (jwishnie, 2026-07-09, closed): *"Because the Exa MCP
server does not respond with 401, but instead interprets unauthenticated requests as throttled
free-tier requests, MCP Clients do not allow users with paid Exa accounts to authenticate."* A
complaint, and the strongest third-party confirmation in the run that unauthenticated `tools/list`
is answered rather than rejected.

## How this was established

- **Run** `20260916-170405`, gate `capability`: 41 evidence rows, 200 discovery rows, 13 clusters,
  max channel share 0.308, 27 queries, saturation reached, 0 dead URLs among cited rows — **HARD
  checks all pass**.
- **Sweep**: 22 channels in parallel. 17 worked, 3 returned empty, **2 failed** (`duckduckgo`,
  `lobsters`). Reading chain: 14/14 + 8/8 pages opened — scrapling 10, scrapling-stealth 2,
  tavily-extract 2.
- **Grounding check** (`bespoke-minicheck`, local): 5 / 5 load-bearing claims supported by their
  cited passage.
- **Second pass** (separate context): **weakened**, not broken. C1, C2, C4, C5
  stand; C3 weakened as an *answer shape* — Tavily's own page says *"Clients that only accept a URL
  can't send it; use an API key with those"*, so a bare URL is not a usable answer for Tavily and
  the header travels with it. Every number the second pass reported was re-measured here before it
  was written down. Its findings became rows L0239–L0241 and claims C11–C15, and it caught a
  citation defect that was repaired (C7 re-pointed from L0217 to L0237).

## What is still open  <!-- HISTORY -->

See `runs/20260916-170405/GAPS.md`. The three that matter: **one network vantage point only** (every
probe left the same machine and IP, so this is "keyless from this host, this hour"); `dates_agree`
is false on all 241 ledger rows; and `cluster_id` is not tracking independence in this run. One
tooling defect was diagnosed and **not** repaired: `fetch.py` accepted a Tavily error envelope as a
page body for two URLs while reporting `8/8 read`.

## What would flip this answer

Any of the five withdrawing its anonymous tier, or gating it by IP or region. Nothing in the run
suggests it is coming — a counter-search on each of the five for "requires API key / 401 /
deprecated" found no one reporting a rejection — but the claim is dated: **2026-09-16, from this
host**.

---

# RE-MEASUREMENT — 2026-09-16, evening, a separate session, independent probe

The question was put again. The record above was treated as a **lead, not an answer**: every row
below was re-measured live in this session with `curl`, from this host, before it was written.

## Verdict: unchanged — all five answer `tools/list` with HTTP 200 and no API key

| # | vendor | endpoint URL (exact string) | extra, non-secret discriminator | HTTP | bytes | time | tools |
|---|---|---|---|---|---|---|---|
| 1 | Exa | `https://mcp.exa.ai/mcp` | — | **200** | 2441 | 0.257 s | `web_search_exa`, `web_fetch_exa` |
| 2 | Parallel | `https://search.parallel.ai/mcp` | — | **200** | 13213 | 0.229 s | `web_search`, `web_fetch` |
| 3 | Tavily | `https://mcp.tavily.com/mcp/` | header `X-Tavily-Access-Mode: keyless` | **200** | 16326 | 0.527 s | `tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_research`, `tavily_feedback` |
| 4 | Firecrawl | `https://mcp.firecrawl.dev/v2/mcp` | — | **200** | 10476 | 0.475 s | `firecrawl_scrape`, `firecrawl_search`, `firecrawl_parse` |
| 5 | You.com | `https://api.you.com/mcp?profile=free` | query parameter `?profile=free` | **200** | 8883 | 0.187 s | `you-search`, `you-discover` |

Every probe carried `Content-Type: application/json`, `Accept: application/json, text/event-stream`,
`MCP-Protocol-Version: 2025-06-18` — and **no** `Authorization`, **no** `x-api-key`, **no** key in the
query string. Host hygiene verified in the same run: `~/.netrc` absent, `~/.curlrc` absent,
`~/_netrc` absent, and the only key-shaped environment variable is Claude Code's own messaging
token. Nothing could have injected a credential.

**Stability:** the five were re-run three consecutive rounds — `200` in 15 of 15 calls.

## The 200 is not a hollow handshake — one keyless `tools/call` each

| vendor | HTTP | bytes | outcome |
|---|---|---|---|
| Exa | 200 | 3658 | real results (`modelcontextprotocol.io/specification/draft/index`) |
| Parallel | 200 | 44184 | real results; **`_meta.parallel/usage` = `{"name":"sku_search","count":1,"cost_usd":0.001}`** |
| Firecrawl | 200 | 7250 | real results (`modelcontextprotocol.io/specification/2026-07-28`) |
| You.com | 200 | 49087 | real results (`modelcontextprotocol.io/specification/draft/basic`) |
| **Tavily** | 200 | 2814 | **`monthly_cap_reached_bonus_eligible`** — *"You reached the monthly keyless Tavily limit"* |

Two findings that qualify the headline and are **not** averaged away:

- **Tavily's door still lists six tools but no longer does the work** for this host this month. Its
  `tools/list` is a true 200; its `tools/call` is spent. The cap message offers three exits: x402
  machine payment, a signed-up API key, or *"36 more keyless credits by answering 2 short questions
  about this agent — POST your answers to `/keyless/bonus`"*. That third one is a data-for-credit
  trade and is **not** taken without the CEO's word.
- **Parallel prints a price on an anonymous call** (`cost_usd: 0.001`). No account, key or card is
  attached to this host, so nothing is billed to the holding — but Parallel is the only one of the
  five that meters the anonymous tier in dollars in its own response.

## Negative controls — these servers can and do say no

| request | HTTP | body |
|---|---|---|
| `https://mcp.tavily.com/mcp/` **without** the header | **401** | empty; `www-authenticate: Bearer scope="openid offline_access"` |
| same URL, header value `banana` | **401** | empty — the **value** opens it, not the header's presence |
| `https://api.you.com/mcp` **without** `?profile=free` | **401** | `Unauthorized: OAuth authentication required` |
| `https://api.you.com/mcp?profile=banana` | **401** | same — the `free` profile is real |
| `https://mcp.parallel.ai/v1beta/search_mcp` | **401** | `{"code":16,"message":"No API key provided (C.0)"}` |

## The URL is an exact string — measured, not assumed

| variant | HTTP |
|---|---|
| `https://mcp.exa.ai/mcp/` (slash added) | **404** `Not found` |
| `https://search.parallel.ai/mcp/` (slash added) | **404** `Not found` |
| `https://mcp.firecrawl.dev/v2/mcp/` (slash added) | **404**, empty |
| `https://mcp.tavily.com/mcp` (slash dropped) | **400** JSON-RPC `-32600` |
| `https://mcp.parallel.ai/mcp` (other host) | **401** `Failed to resolve API Key variable` |
| `https://mcp.you.com/mcp` (guessed host) | **NXDOMAIN — the host does not exist** |
| `https://mcp.firecrawl.dev/mcp` (no `/v2`) | **200**, 10476 B — byte-identical second keyless path |
| `https://api.you.com/mcp/?profile=free` (slash added) | **200** — You.com tolerates both |

## The transport header is not a key, and it is not optional either

Dropping `Accept: application/json, text/event-stream` — the header every MCP client sends — gives
**406** *"Not Acceptable: Client must accept both application/json and text/event-stream"* on Exa,
Firecrawl and You.com. Parallel and Tavily answer **200** without it.

## Is the header / the parameter an API key? — the attack on my own answer

No. Both strings are literal English words (`keyless`, `free`), identical for every caller, bound to
no account, and grant no identity; publishing them here gives nobody anything. They **select an
anonymous principal**, they do not authenticate a named one. The honest phrasing stays: *no API key,
but a mandatory published magic string on two of the five*.

The strongest case against, left standing: both servers answer the bare URL with a
`www-authenticate: Bearer …` challenge — i.e. they themselves classify the missing string as an
**authentication** failure (Tavily: `resource_metadata=".../oauth-protected-resource/mcp"`,
You.com: `scope="Tools"`). A client that can only be given a URL cannot use Tavily at all.

## Where I did not look

- **One vantage point.** Every probe left this machine, this IP, within one hour. This is
  "keyless from this host, 2026-09-16 evening" — not a claim about every network or region.
- **No OAuth path tested**, and no `.well-known/oauth-protected-resource` document read this round.
- **No rate ceiling established** — 15 `tools/list` and 5 `tools/call` saw no 429. That says nothing
  about a daily limit. You.com publishes 100 queries/day on the free profile; the others do not.
- **The vendors' own documentation was not re-read this round.** The prior run's two documented
  disagreements (You.com claiming `you-search` only; Tavily claiming two tools) were not re-tested,
  though this run again measured `you-discover` present and **six** Tavily tools.

## What would flip this

Any of the five withdrawing its anonymous tier, or gating it by IP or region. **Tavily is already
half-flipped for us**: the handshake is open, the work behind it is spent until the month rolls.

---

# Second, independent run — 20260916-180812 · the vendors' own documentation, read

**Run** `20260916-180812` · class `capability` · opened 2026-09-16 18:08 UTC
**Question, verbatim:** identical to the run above, asked again in a fresh session.

This run exists because the run above closed with a declared hole: *"The vendors' own
documentation was not re-read this round."* This one read it — all five vendors' own pages —
and re-measured every endpoint from scratch. **The answer did not move.**

## The answer, re-measured

**All five.** Endpoint URL, and what the request must carry besides the URL:

| # | vendor | endpoint URL | extra condition on the request | measured 18:08:21 UTC | tools listed |
|---|---|---|---|---|---|
| 1 | **Exa** | `https://mcp.exa.ai/mcp` | — | **200**, 0.30 s | `web_search_exa`, `web_fetch_exa` |
| 2 | **Parallel** | `https://search.parallel.ai/mcp` | — | **200**, 0.24 s | `web_search`, `web_fetch` |
| 3 | **Tavily** | `https://mcp.tavily.com/mcp/` | header `X-Tavily-Access-Mode: keyless` | **200**, 0.54 s | `tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_research`, `tavily_feedback` |
| 4 | **Firecrawl** | `https://mcp.firecrawl.dev/v2/mcp` | — | **200**, 0.48 s | `firecrawl_scrape`, `firecrawl_search`, `firecrawl_parse` |
| 5 | **You.com** | `https://api.you.com/mcp?profile=free` | the `?profile=free` parameter | **200**, 0.22 s | `you-search`, `you-discover` |

Every request carried `Content-Type: application/json`, `Accept: application/json,
text/event-stream`, and the body `{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}`.
No `Authorization`, no `x-api-key`, no key in the query string. Control measured on the host
(L0238): no `~/.curlrc`, no `~/.netrc`, no vendor key in the environment — nothing could have
injected a credential.

## What each vendor says in its own documentation (the hole the previous run declared)

| vendor | its own words | row |
|---|---|---|
| Exa | *"\| Keyless \| Free rate-limited usage without sign-in or API key \| Connect to `https://mcp.exa.ai/mcp` \|"* | L0224 |
| Parallel | *"**`https://search.parallel.ai/mcp`** — default. Free to use anonymously at lower rate limits."* and *"Verify the server URL: Must be exactly `https://search.parallel.ai/mcp`"* | L0225 |
| Tavily | *"Server URL: https://mcp.tavily.com/mcp/ · Headers: `X-Tavily-Access-Mode: keyless` (required, selects free keyless access) · Authentication: no API key or account needed"* | L0226 |
| Firecrawl | *"Agents can start instantly, no API key required."* · *"Using another MCP client? Point it at: `https://mcp.firecrawl.dev/v2/mcp`"* | L0227 |
| You.com | *"If your client supports remote MCP, point it at `https://api.you.com/mcp?profile=free` directly — no local process needed."* | L0228 |

All five documentation rows pass the local grounding checker as written (`✓ C8 C10 C12 C14 C16`).

## New this round — the URL is not the whole address

The previous run measured the **Accept** condition. This run also measured the **path** and the
**parameter**, because a URL given to the CEO has to be the one that works:

| variant tried, no key | result |
|---|---|
| `https://mcp.exa.ai/mcp/` (trailing slash) | **404** `Not found` |
| `https://search.parallel.ai/mcp/` (trailing slash) | **404** `Not found` |
| `https://mcp.tavily.com/mcp` (no trailing slash) | **400** `Missing mcp-session-id header` |
| `https://mcp.firecrawl.dev/v2/mcp/` (trailing slash) | **404** |
| `https://mcp.firecrawl.dev/mcp` (the v1 path) | **200**, 3 tools — also keyless |
| `https://api.you.com/mcp` (no `?profile=free`) | **401** `Unauthorized: OAuth authentication required` |

And the Accept matrix, re-measured: with `Accept: application/json` alone, or with no Accept
header at all, **Exa, Firecrawl and You.com return 406** *"Client must accept both application/json
and text/event-stream"* — the MCP Streamable-HTTP rule, quoted from the spec itself (L0229):
*"The client MUST include an `Accept` header, listing both `application/json` and
`text/event-stream` as supported content types."* **Parallel** answers 200 with no Accept header
and with `application/json` alone. **Tavily** answers 200 with no Accept header but **406** with
`application/json` alone.

## Two contradictions, left standing

1. **You.com's README is behind its server.** *"Today, `profile=free` is a search-only mode. It
   overrides `tools` and exposes only `you-search`"* (L0228) — the live endpoint listed
   `you-search` **and** `you-discover` (L0235). Second run in a row to measure this.
2. **Keyless is not unmetered, and the two limits are separate.** During this run Tavily's keyless
   `tavily_extract` returned `monthly_cap_reached_bonus_eligible` — *"You reached the monthly
   keyless Tavily limit"* (L0237) — while `tools/list` on the same server answered **200** two
   minutes later. The handshake stays open after the work budget is spent. Anyone reading "200"
   as "usable" would be wrong about Tavily today.

## Where I did not look

`runs/20260916-180812/GAPS.md`, in full. The short form: one host, one IP, twelve minutes; no rate
ceiling measured; four channels produced nothing (`producthunt` failed outright); and three vendor
doc pages were first recorded as READ when the reading chain had actually filed a Tavily quota
error as the page body — a defect in `fetch.py` that belongs to B46 and is named there.

## The second pass's round — verdict WEAKENED, and what it changed

The second pass ran in a separate context with the ledger and the claims and nothing else, re-ran
every probe on this machine at 18:11–18:12 UTC, and reproduced **all five 200s and every negative
control**. It broke one sentence:

**Tavily has a SECOND keyless door, and this run had missed it.** Re-measured by this session at
18:13:20Z (L0243), with no access-mode header and no key anywhere:

| request, no key | result |
|---|---|
| `https://mcp.tavily.com/mcp/?tavilyApiKey=` (empty value) | **200**, all six tools |
| `https://mcp.tavily.com/mcp/?tavilyApiKey=xxx` | **200**, all six tools |
| `https://mcp.tavily.com/mcp/?foo=` (control) | **401** |
| `https://mcp.tavily.com/mcp/` (control) | **401** |

So the honest sentence about Tavily is: *the bare URL is 401; a keyless 200 needs one of two
published, non-secret discriminators — the header, or an empty `?tavilyApiKey=`.* C3 was repaired,
not deleted; C1, C2, C4 and C5 stand.

**And a 200 on `tools/list` is a handshake, not a service.** Measured at 18:14Z (L0244):

| keyless `tools/call` | result |
|---|---|
| Exa `web_search_exa` | real search results |
| Parallel, Firecrawl, You.com (second pass's runs) | real search results |
| Tavily `tavily_search` via the header | 200 carrying `monthly_cap_reached_bonus_eligible` |
| Tavily `tavily_search` via `?tavilyApiKey=` | 200 carrying `Invalid Tavily API key: … is empty` |

**Parallel prices the anonymous call in its own reply** — the second pass read
`"parallel/usage":[{"name":"sku_search","count":1,"cost_usd":0.001}]` off the response body.
Keyless, metered, and costed. Nothing is billed to us; the meter is theirs.

## The most useful thing this run produced is a defect in the engine

The independence check is **inoperative for a question shaped like this one.** Clustering is
domain-keyed, so a vendor's own documentation page and a probe of that vendor's own server always
collapse into a single cluster. C1, C3 and C4 each therefore rest on one cluster — by this
engine's own rule, one citation apiece. What actually made this answer independent was the
second pass's separate re-measurement, not the cluster count. **That belongs to B46.**

Full hole list: `.claude/skills/dxb-research/runs/20260916-180812/GAPS.md`.

## Re-measured 2026-09-16 19:26 UTC (fresh session, same host)

All five re-probed live with the same keyless `tools/list` POST; all five returned **200** with a
valid JSON-RPC `result.tools` array, and all five negative controls returned **401** again.

| endpoint | status | bytes | time | tools |
|---|---|---|---|---|
| `https://mcp.exa.ai/mcp` | 200 | 2441 | 0.27 s | 2 |
| `https://search.parallel.ai/mcp` | 200 | 13213 | 0.26 s | 2 |
| `https://mcp.tavily.com/mcp/` (+ `X-Tavily-Access-Mode: keyless`) | 200 | 16326 | 0.51 s | 6 |
| `https://mcp.firecrawl.dev/v2/mcp` | 200 | 10476 | 0.48 s | 3 |
| `https://api.you.com/mcp?profile=free` | 200 | **9105** | 0.21 s | 2 |

One drift since the 17:04 run: **You.com's payload grew 8883 → 9105 bytes** while still listing the
same two tools (`you-search`, `you-discover`) — a schema change behind the same surface, not a
different tool set. Every other byte count is identical to the original run.

---

## Third independent run — 2026-09-16, evening (a fresh session, same question)

Re-asked from zero, measured live, nothing inherited. **All five still answer `tools/list` with
HTTP 200 and no API key**, and the two passes of this run were byte-identical to each other:

| endpoint | pass 1 | pass 2 | tools listed |
|---|---|---|---|
| `https://mcp.exa.ai/mcp` | 200 · 2441 B · 0.251 s | 200 · 2441 B · 0.275 s | `web_search_exa`, `web_fetch_exa` |
| `https://search.parallel.ai/mcp` | 200 · 13213 B · 0.245 s | 200 · 13213 B · 0.226 s | `web_search`, `web_fetch` |
| `https://mcp.tavily.com/mcp/` | 200 · 16326 B · 0.515 s | 200 · 16326 B · 0.517 s | six `tavily_*` |
| `https://mcp.firecrawl.dev/v2/mcp` | 200 · 10476 B · 0.463 s | 200 · 10476 B · 0.462 s | `firecrawl_scrape`, `firecrawl_search`, `firecrawl_parse` |
| `https://api.you.com/mcp?profile=free` | 200 · 9105 B · 0.186 s | 200 · 9105 B · 0.221 s | `you-search`, `you-discover` |

**The negative controls held, and two new ones were added.** A wrong value is refused exactly like a
missing one, which is what makes "keyless" a real anonymous tier rather than an unchecked door:
`X-Tavily-Access-Mode: banana` → **401 · 0 B** · `?tavilyApiKey=` (empty value) → **200 · 16326 B**
· `?foo=` → **401** · `https://api.you.com/mcp?profile=banana` → **401 · 43 B**. Tavily's empty-key
query parameter is therefore a **second keyless path to the same door**, confirmed live this run.

**One earlier line refined, not contradicted.** This run first read 406 from Tavily where the record
said 200, and the check showed the record right and the new probe wrong — they are two different
requests:

| Tavily `tools/list`, keyless header present | result |
|---|---|
| no `Accept` header at all (curl's `*/*`) | **200** |
| `Accept: application/json` — explicitly excluding `text/event-stream` | **406** |

Parallel answers **200** both ways; Exa answers **406** both ways, header absent or narrowed. So the
prior sentence *"Parallel and Tavily answer 200 without it"* stands as written, and the sharper rule
is: **Tavily tolerates a silent client, not a client that says it cannot read the event stream.**

**Both magic strings re-confirmed as published vendor documentation, fetched live this run:**
`docs.tavily.com/documentation/keyless` — the page is titled *"Try Tavily Without an API Key"* and
prints the string seven times, beside the exact URL: *"Send a request with the
`X-Tavily-Access-Mode: keyless` header. That's it."* · `you.com/docs/build-with-agents/mcp-server`
— *"Connect to `https://api.you.com/mcp?profile=free` for unauthenticated access … Limited to 100
queries per day."* Neither string is a credential.

**Keyless `tools/call` re-run, all five:** Exa, Firecrawl, You.com and Parallel returned real search
results (Parallel needs **both** `objective` and `search_queries`; with only one it returns 200 with
`isError: true` and a validation message — an argument fault, not an auth fault). **Tavily returned
`monthly_cap_reached_bonus_eligible`** again: the handshake is open, the work behind it is spent.

**Watch item:** Parallel's keyless answer carries its own meter —
`"parallel/usage":[{"name":"sku_search","count":1,"cost_usd":0.001}]`. Nothing is billed, there is no
account to bill; it is the only one of the five that prices an anonymous call in its own response.

**The You.com contradiction is now three runs old and still standing:** the vendor's document says
`?profile=free` gives *"unauthenticated access to `you-search` only"* and that `you-discover` is
*"excluded from this profile"*. The live server listed **both**, in both passes, and a keyless
`you-search` call returned 92 266 B of real results.

**Where this run did not look:** one machine, one IP, ~20 minutes — no second geography, no rate-limit
ceiling probed (no 429 seen in ~45 calls, which proves nothing about a daily cap), and no check of
whether any of the five changes behaviour for a datacentre IP.

---

# Fourth independent run — `20260916-192859` · 2026-09-16 19:29–19:45 UTC

A fresh session, the same closed roster, the whole gated chain walked again from `open` to `close`:
wide sweep (22 channels, 19 answered), 6 vendor documents fetched and read, 27 evidence rows,
17 independent clusters, 5 contradiction searches, the local grounding checker, and a second pass in
a separate context that issued **its own** POSTs.

## The answer — unchanged, and now reproduced by two independent probers

| vendor | endpoint URL | what the request must carry besides `Content-Type` | tools/list |
|---|---|---|---|
| **Exa** | `https://mcp.exa.ai/mcp` | nothing but the transport `Accept` | **200**, 2441 B |
| **Parallel** | `https://search.parallel.ai/mcp` | nothing at all | **200**, 13213 B |
| **Tavily** | `https://mcp.tavily.com/mcp/` | header `X-Tavily-Access-Mode: keyless` | **200**, 16326 B |
| **Firecrawl** | `https://mcp.firecrawl.dev/v2/mcp` | nothing but the transport `Accept` | **200**, 10476 B |
| **You.com** | `https://api.you.com/mcp?profile=free` | the `?profile=free` parameter + transport `Accept` | **200**, 9105 B |

Author's probe ran twice, 74 s apart, byte-identical. The **second pass re-ran all seven requests with
its own curl ~10 minutes later: every status code, every tool name and every byte count matched.**
Negative controls reproduced: `mcp.tavily.com/mcp/` bare → **401** (`www-authenticate: Bearer`),
`api.you.com/mcp` without the parameter → **401** *"Unauthorized: OAuth authentication required"*.
Host control: no `~/.curlrc`, no `~/.netrc`, no vendor `*_API_KEY` in the environment.

## New this run — the named URL is not the only keyless URL (second pass's catch, author re-measured)

**Aliases of the same server** — same tools, byte-identical bodies:
`https://mcp.exa.ai/` (bare root) · `https://mcp.firecrawl.dev/mcp` · `https://mcp.firecrawl.dev/v1/mcp`.
The Firecrawl path is **not version-discriminating**.

**A second, differently-shaped keyless MCP at two vendors — documentation search, no header at all:**
`https://you.com/docs/_mcp/server` → 200, tool `searchDocs` ·
`https://docs.tavily.com/mcp` → 200, tools `search_tavily_docs`, `query_docs_filesystem_tavily_docs`.
This sharpens the Tavily story: the access-mode header is required by Tavily's **web**-search MCP,
not by every Tavily-operated MCP.

**Still not keyless:** `https://mcp.firecrawl.dev/v2/mcp-search` → **401** ·
`https://search.parallel.ai/` → **404**.

## The transport header, measured again
Omitting `Accept: application/json, text/event-stream` entirely: Exa **406**, Firecrawl **406**,
You.com **406**, Parallel **200**, Tavily **200**. It is not a credential — identical for every
caller, carrying no identity — but for three of the five it is not optional either.

## Repairs this run forced
- **`L0218` dropped from claim C1.** The GitHub README row was 6 190 characters of GitHub navigation
  chrome with zero occurrences of `mcp.exa.ai` — the reading chain never captured the README body.
- **A defect in the research engine itself, found by eye and fixed after the run closed:** the
  reading chain accepted an HTTP-200 body that was `tavily_extract`'s own quota notice
  (`{"code":"monthly_cap_reached_bonus_eligible", …}`) as a read page — three times — and printed
  `okunan 6/6` when three of six had read nothing. The three pages were re-read through the Firecrawl
  door before anything was claimed. The first attempt to patch `rlib.py` **mid-run** was caught by the
  gate's own tamper check (`H18`, naming the file and its two hashes); the engine was restored
  byte-identical, the run finished, and the fix was applied afterwards — as
  `rlib.looks_like_api_error`, called from `rlib.looks_like_wall`, with the `_WALL` pattern's bare
  `rate limit` narrowed to the real refusal wordings, because a documentation page that *describes*
  a keyless tier's rate limits was being classified as a rate-limit wall and demoted to
  `secondary` / `blocked` — which had happened to the Parallel and Firecrawl pages in this very run.
  **The first patch did not work and the re-measurement caught it:** the door prints the MCP
  `content` text and `structuredContent` side by side, so the quota notice arrives as the same
  object twice and a whole-string `json.loads` raises. Reading the leading value with `raw_decode`
  fixed it. Proof against the live capped door: `looks_like_api_error → True`, `fetch._ok → False`,
  so `fetch()` no longer breaks the chain there. 12/12 detector cases and 6/6 of this run's own
  pages green afterwards; all seven sibling scripts still execute.
- Everything else the second pass named — `initialize` never sent, `L0226`'s URL artifact, three vendor
  rows typed `secondary`, no dated documentary row — is written into
  `.claude/skills/dxb-research/runs/20260916-192859/GAPS.md` and left standing.

---

# Fifth independent run — `20260916-210453` · 2026-09-16 21:04–21:15 UTC · LIGHT mode

The question was put a fifth time. The four records above were treated as **leads**; every row below
was re-measured live in this session before it was written. Class `capability`, mode LIGHT (the
answer moves no money and leaves the house only as a fact). Gate: **HARD checks all pass** —
21 evidence rows, 118 discovery rows, 10 clusters, max channel share 0.40, 12 queries, saturated,
0 dead URLs among cited rows.

## The answer — unchanged, five out of five

| # | vendor | endpoint URL (exact string) | extra non-secret discriminator | HTTP | bytes | time | tools listed |
|---|---|---|---|---|---|---|---|
| 1 | Exa | `https://mcp.exa.ai/mcp` | — | **200** | 2441 | 0.24–0.27 s | `web_search_exa`, `web_fetch_exa` |
| 2 | Parallel | `https://search.parallel.ai/mcp` | — | **200** | 13213 | 0.21–0.24 s | `web_search`, `web_fetch` |
| 3 | Tavily | `https://mcp.tavily.com/mcp/` | header `X-Tavily-Access-Mode: keyless` | **200** | 16326 | 0.50–0.51 s | `tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_research`, `tavily_feedback` |
| 4 | Firecrawl | `https://mcp.firecrawl.dev/v2/mcp` | — | **200** | 10476 | 0.47 s | `firecrawl_scrape`, `firecrawl_search`, `firecrawl_parse` |
| 5 | You.com | `https://api.you.com/mcp?profile=free` | query parameter `?profile=free` | **200** | 9105 | 0.18–0.19 s | `you-search`, `you-discover` |

Two byte-identical passes, seconds apart. Every request carried only `Content-Type` and
`Accept: application/json, text/event-stream` — **no** `Authorization`, **no** `x-api-key`, no key in
the query string. Host hygiene re-verified this run: `~/.curlrc` **absent**, `~/.netrc` **absent**,
and the only key-shaped environment variable is Claude Code's own `CLAUDE_CODE_MESSAGING_TOKEN`.

**One delta against the earlier runs today:** You.com's `tools/list` body grew **8883 → 9105 bytes**
while the two tool names stayed the same — the vendor edited a tool description between 17:04 and
21:05 UTC. Everything else is byte-for-byte what the earlier runs measured.

## Ledger rows (this run)

`L0010` Exa · `L0011` Parallel · `L0012` Tavily · `L0013` Firecrawl · `L0014` You.com ·
`L0015` the Exa OAuth negative control — all `source_type: independent-test`, transcript attached.

## Each vendor's own documentation, read this run — not quoted from the record

| vendor | the vendor's own page | what it says, verbatim |
|---|---|---|
| Exa | `docs.exa.ai/reference/exa-mcp` | *"Keyless · Free rate-limited usage without sign-in or API key · Connect to `https://mcp.exa.ai/mcp`"* |
| Parallel | `docs.parallel.ai/integrations/mcp/search-mcp.md` | *"**The Search MCP is free to use** — no API key required"*; *"Anonymous free-tier searches run in `fast` mode by default"* |
| Tavily | `docs.tavily.com/documentation/keyless` | *"Server URL: `https://mcp.tavily.com/mcp/` · Headers: `X-Tavily-Access-Mode: keyless` (required, selects free keyless access) · Authentication: no API key or account needed"* |
| Firecrawl | `docs.firecrawl.dev/mcp-server/keyless` | *"Agents can start instantly, no API key required."*; *"A keyless connection shows `firecrawl_search`, `firecrawl_scrape`, and `firecrawl_parse`"* |
| You.com | `github.com/youdotcom-oss/mcp` (the vendor's own org) | *"If your client supports remote MCP, point it at `https://api.you.com/mcp?profile=free` directly — no local process needed."* |

The documentation and the live servers agree on all five endpoints this run.

## Negative controls, re-measured

| request | HTTP | body |
|---|---|---|
| `https://mcp.tavily.com/mcp/` **without** the keyless header | **401** | empty |
| `https://api.you.com/mcp` **without** `?profile=free` | **401** | `Unauthorized: OAuth authentication required` |
| `https://mcp.exa.ai/mcp?login` | **401** | — |
| `https://search.parallel.ai/mcp-oauth` | **401** | — |
| `https://mcp.firecrawl.dev/v2/mcp-oauth` | **401** | — |

The same servers can refuse and decline to on the keyless path: the 200 is a deliberate anonymous
tier, not a server that forgot to check.

**The transport header is not optional either**, measured again with the `Accept` header removed:
Exa **406**, Firecrawl **406**, You.com **406**, Parallel **200**. Tavily was not re-tested this way.

## Where I did not look

- **Three channels came back empty** and their holes are named, not skipped: `reddit`,
  `hackernews`, `github-repos` (the sweep's own coverage table; `google` covered for the first two).
- **One network vantage point only.** Every probe left this machine, this IP, this hour. "Keyless
  from this host" is the honest scope — not "keyless from anywhere".
- **No rate-limit ceiling was probed.** Two passes prove the door opens; they say nothing about a
  daily allowance. Only You.com publishes one (100 queries/day on the free profile).
- **Tavily's keyless `tools/call` was not re-run.** The 17:04 run found its monthly keyless budget
  for this host already spent while `tools/list` still answered 200 — that qualification stands
  above and was not re-measured here.

## Engine defect found this run, and not repaired

`fetch.py <url> --outdir DIR` for a **single** URL created no directory and wrote no file (measured:
`ls .../docs3` → `No such file or directory`), while `--batch` with the same `--outdir` wrote every
page correctly. The single-URL path also prints a **truncated** body to stdout — 1725 bytes against
the 35281 the same URL returns to `curl`. Nothing in this run's evidence depends on it (the batch
path was used), and it is written here rather than patched, because the engine is not this run's
subject.

## What would flip this answer

Any one of the five withdrawing its anonymous tier, or gating it by IP or region. Dated and scoped:
**2026-09-16 21:05 UTC, from this host.**
