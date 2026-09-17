# Tavily remote MCP — the keyless access header and what the endpoint answers

Research run `20260916-164417` · class **capability** · opened 2026-09-16 16:44:17Z
Question, verbatim: *"What exact HTTP status does a tools/list POST to https://mcp.tavily.com/mcp/
return WITHOUT the keyless access header, and what does it return WITH it? Name the header."*

## The answer

**The header is `X-Tavily-Access-Mode`, and its value is `keyless`.**

| request | HTTP status | what comes back |
|---|---|---|
| `tools/list` POST, **no** access-mode header, no `Authorization`, no `tavilyApiKey=` parameter | **401** | `content-length: 0` — an **empty body**, no content-type, no JSON-RPC envelope; `server: uvicorn`; `www-authenticate: Bearer scope="openid offline_access", resource_metadata="https://mcp.tavily.com/.well-known/oauth-protected-resource/mcp"` |
| `tools/list` POST **with** `X-Tavily-Access-Mode: keyless` | **200** | `content-type: text/event-stream`, 16 326 bytes, one SSE `event: message` frame carrying `{"jsonrpc":"2.0","id":1,"result":{"tools":[…6 tools…]}}` |

Six tools: `tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_research`,
`tavily_feedback`.

Stability, counted exactly: the plain headerless call was made **16 times** (1 + a 3-run loop + a
12-run alternating loop) and returned **401 every time**; the plain keyless call was made **16 times**
the same way and returned **200 with 16 326 bytes every time**. The adversary, on its own machine
path, added 10 more of each with the same result, and one forced over HTTP/1.1. 2026-09-16,
16:44–16:57 Z. No flapping, so no rate limit was reached at this volume.

### Two preconditions the plain answer hides

**(i) `Accept` must CONTAIN both media-type tokens.** Either one alone, or no `Accept` header at
all, returns **406**:

```
{"jsonrpc":"2.0","id":null,"error":{"code":-32600,
 "message":"Not Acceptable: Client must accept both application/json and text/event-stream"}}
```

It is **token presence, not content negotiation**: `Accept: application/json;q=0,
text/event-stream;q=0` — which under RFC 9110 §12.5.1 declares both types *not acceptable* — still
returns **200**. It is not a naive substring scan either: `xxapplication/jsonxx,
yytext/event-streamyy` → 406, and a lone `application/*` → 406, while `*/*` or
`application/*, text/*` → 200.

**(ii) `Content-Type` must be `application/json`.** `text/plain`, or none at all, returns
**HTTP 400 with a zero-byte body** — a fourth status at this endpoint, distinct from the
slashless-path `400`.

**A trap worth knowing:** "no `Accept` at all → 406" cannot be tested by simply leaving `-H` off a
curl command — curl supplies `Accept: */*`, which returns 200. The header has to be actively
removed (`-H 'Accept:'`).

**The 401 obeys none of this.** Without the access-mode header the answer is 401 whatever `Accept`
says, whatever `Content-Type` says, and even when the body is not JSON at all. The refusal fires
before content negotiation, before Content-Type validation and before the body is parsed.

## Three doors, and two different 401s

The keyless header is not the only way in. Each of these opens `tools/list`, and each is passed
**unvalidated** at that layer:

| door | opens | stays shut |
|---|---|---|
| `X-Tavily-Access-Mode: keyless` | name and value case-insensitive (`KEYLESS`, `Keyless`) | `banana`, empty, and `"keyless "` **with a trailing space** — the value is not trimmed |
| an `Authorization` line containing the case-insensitive substring **`tvly-`** | **the scheme is irrelevant** — `Bearer tvly-x`, `Basic tvly-x`, `Token tvly-x` and a bare `tvly-x` with no scheme all return 200 | `totally-made-up-token`, `hello`, `tvly` without the dash, `tvly_x` with an underscore |
| a query parameter **`tavilyApiKey=`** — **the equals sign is required**, the value may be **empty** | name case-insensitive (`?tavilyapikey=`, `?TAVILYAPIKEY=`) | `?tavilyApiKey` **without** the `=`, and every sibling: `?apiKey=`, `?key=`, `?tavily_api_key=`, `?foo=tvly-x` |

A **fourth** door was searched for and not found: `X-Tavily-Api-Key`, `x-api-key`, `api-key` and
`tavilyApiKey` as *headers* all return 401, as do `?footavilyApiKey=` and `?tavilyApiKeyz=`.

And the 401 is two different answers, told apart by **the `Authorization` header alone**:

| | body | content-type | `www-authenticate` |
|---|---|---|---|
| nothing sent — **or** a refused access-mode value, **or** a refused query parameter | **0 bytes** | none | `Bearer scope="openid offline_access", resource_metadata=…` |
| a **refused `Authorization` header** | **298 bytes**, `{"error":"invalid_token","error_description":"Authentication failed…"}` | `application/json` | the same, plus `error="invalid_token"` and a repair instruction |

**Door and validator use different rules.** The door at `tools/list` is a *contains* test —
`zzz-tvly-zzz` opens it. The validator at `tools/call` is a *starts-with* test, and says so itself,
inside an HTTP 200: *"Invalid Tavily API key: the value in the tavilyApiKey query parameter does not
start with 'tvly-'. Provide it as ?tavilyApiKey=tvly-… or Authorization: Bearer tvly-…"*

## The other edges

| variant | status |
|---|---|
| keyless `tools/call` on `tavily_crawl` | **200**, in-band `{"code":"unsupported_endpoint","message":"…Keyless Tavily currently supports Search and Extract only…"}` |
| a `tvly-`-shaped fake key at `tools/call` | **200**, in-band `{"error":"Search failed","status":401,"detail":{"error":"Unauthorized: missing or invalid API key."}}` |
| `https://mcp.tavily.com/mcp` — **without the trailing slash** | **400**, `{"code":-32600,"message":"Missing mcp-session-id header. Please reconnect to start a new session."}`, no redirect |
| `GET` instead of `POST` | **405** `Method Not Allowed`, with or without the header |
| `https://mcp.tavily.com/.well-known/oauth-protected-resource/mcp` | **200** — `{"resource":"https://mcp.tavily.com/mcp","authorization_servers":["https://mcp.tavily.com/"],"scopes_supported":["openid","offline_access"],"bearer_methods_supported":["header"]}` |

## Evidence

| id | type | source | what it carries |
|---|---|---|---|
| L0465 | independent-test | live probe, verbatim | the first transcript — 401 / 200 / value variants / keyless crawl |
| L0466 | independent-test | pass-1 re-measurement, verbatim | the `tvly-` rule, the 406, the query-parameter door, the slashless 400, the 405 |
| L0464 | independent-test | pass-2 re-measurement, verbatim | the "BOTH" Accept rule, the `=` requirement, scheme-independence, the two 401s, contains-vs-starts-with |
| L0469 | independent-test | pass-3 re-measurement, verbatim | q=0 ignored, the Content-Type gate (400 / 0 bytes), the true 401 discriminator, the curl trap |
| L0467 | independent-test | header-value variants, verbatim | case-insensitivity, and the trailing space that fails |
| L0468 | independent-test | the monthly cap, verbatim | what a spent keyless allowance actually returns |
| L0213 | primary-doc | `.well-known/oauth-protected-resource/mcp` | what the 401 challenge points the client at |
| L0220 | primary-doc | `docs.tavily.com/documentation/keyless`, full body | *"Send a request with the `X-Tavily-Access-Mode: keyless` header. That's it."* · *"The header is required — without it the server asks your client to sign in."* · the `claude mcp add … --header` line that ties the header to THIS host · the supported-endpoint table |
| L0215 | primary-doc | `docs.tavily.com/documentation/mcp` | *"**No key?** Your client will prompt you to sign in."* |
| L0217 | code | `tavily-ai/tavily-mcp` `src/index.ts` line 103 | the same header in Tavily's shipped client — but that file's baseURLs are **api.tavily.com**, so it corroborates the header, not this endpoint |
| L0461 | first-hand | opencode issue **#31320**, 2026-06-08 | the only dated outside page naming this endpoint and a status code together — `Accept: text/event-stream` alone to `https://mcp.tavily.com/mcp/?tavilyApiKey=test-key` → **406 Not Acceptable** |

Run files: `.claude/skills/dxb-research/runs/20260916-164417/` — `ledger.jsonl` (53 evidence rows,
18 clusters, 40 pages read), `claims.json`, `queries.jsonl` (50 queries, 4 contradiction searches),
`refutation.json`, `DECLARED.md`, `GAPS.md`, `CONTAMINATION.md`.

## What the adversary did to this answer

An adversary ran in a separate context, **three times**, with the ledger and the claims and nothing
else. Every number it reported was re-measured here before it was accepted; all of it reproduced.

**Pass 1 broke a load-bearing claim outright.** The first version said *any* non-empty bearer token
returns 200. `Authorization: Bearer totally-made-up-token` returns **401** — the first probe had
used `tvly-NOT-A-REAL-KEY`, which happens to contain the very string the server looks for.

**Pass 2 broke nothing and corrected four things**: the Accept rule needs *both* media types, the
source line is 103 not 102, the query-parameter door needs the equals sign, and the run was
treating two different 401s as one number.

**Pass 3 broke nothing and corrected four more, one of them about this run's own machinery**:
`q=0` is ignored so "admits both" was the wrong rule, `Content-Type` is a second gate with a
fourth status, the two 401s are told apart by the `Authorization` header and not by "something was
sent", and — **the serious one** — this run's ledger had been storing its plain-text measurement
transcripts through an HTML body extractor, losing **4.5 % to 40.1 %** of each and then hashing the
mutilated text as faithful. That was fixed in `ledger.py` and all six transcripts re-recorded
byte-identical; the claims above cite the whole rows.

The full verdict history — thirteen entries, `broken` included — stands verbatim in
`refutation.json`.

## How much of the outside world actually knows this

Counted over the run's 53 evidence rows, by the ledger's own clustering (echoes collapsed):

| what | independent clusters that carry it |
|---|---|
| the header's NAME, `X-Tavily-Access-Mode: keyless` | **3** — Tavily's docs (C006), Tavily's shipped `src/index.ts` (C031), a third-party skill directory (C016) |
| the `?tavilyApiKey=` door | **7** — C001 · C006 · C007 · C009 · C014 · C055 · C058 |
| the **401** itself, for this endpoint | **1** — C006, and every row in it is one of my own measurements |

## What no outside source says

**No Tavily page and no third-party page states the 401.** The docs say only that the server
*"asks your client to sign in"*. The one outside page that names this endpoint and a status code in
the same sentence names **406**, not 401 (L0461). The **header name** is the part with independent
support — Tavily's shipped source, a third-party source analysis pinned to commit 259bfd20, and two
independent client libraries all spell it identically; the README, read in full (17 214 characters),
never mentions it at all. The four pages cited for the query-parameter door document only
`?tavilyApiKey=<your-api-key>` as the way to pass a REAL key; that any value or none is accepted is
this machine's measurement alone.

## One thing that happened DURING the run, and matters to the holding

At about 17:00 Z the keyless door **ran out of monthly credit**, and it answered in a way worth
knowing: **there is no 429 and no rate-limit header.** `tavily_search` and `tavily_extract` both
return a perfectly ordinary **HTTP 200** whose payload is the refusal —
`{"code":"monthly_cap_reached_bonus_eligible", …}` with a `next_actions` list offering x402 machine
payment, signing up for a key, or earning 36 more credits by POSTing answers to `/keyless/bonus`.
A client that checks only the HTTP status sees success and reads an error object as data.

**`tools/list` is unaffected** — still 200 and 16 326 bytes — so this document's answer stands
unchanged. The other four keyless doors (exa, parallel, firecrawl, you.com) all returned real
results in the same minute; only Tavily's is out.

This also closes the one item the run had declared UNVERIFIED, by measurement rather than by
deliberately burning the allowance — the allowance was spent by the run's own three sweeps.
The `/keyless/bonus` route was **not** taken: it is a write to an outside service, and this door is
read-only.

## Holes, named

`hackernews`, `stackoverflow`, `github-repos` and `substack` returned zero and were re-searched
through other doors — nothing is written on this subject there. No first-hand human report of the
keyless header exists anywhere; the feature is too new. The keyless rate limit **is no longer
unverified** — it was reached during the run and measured, above. Every measurement came from
**one machine through one AWS ALB edge**, so a different region answering differently is
⚠ UNVERIFIED. And
`rlib.canonical_url` strips the trailing slash, so this run's own canonical address
(`https://mcp.tavily.com/mcp`) returns **400**, not 401 — a tool defect, recorded. Full list:
`GAPS.md`.

---

## Re-measurement, 2026-09-16 17:57 Z — independent session, live, not quoted

The note above was treated as a lead, not an answer. Every line below was measured again from
scratch this session against the live endpoint.

| probe | measured now |
|---|---|
| `tools/list` POST, no access header | **HTTP/2 401**, `content-length: 0`, `server: uvicorn`, `www-authenticate: Bearer scope="openid offline_access", resource_metadata="https://mcp.tavily.com/.well-known/oauth-protected-resource/mcp"` |
| `tools/list` POST + `X-Tavily-Access-Mode: keyless` | **HTTP/2 200**, `content-type: text/event-stream`, **16 326 bytes**, one `event: message` frame, `result.tools` = **6** |
| stability | 6 alternating pairs: 401/0 bytes six times, 200/16 326 bytes six times — no flapping |
| tools named | `tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_research`, `tavily_feedback` |

Adversary probe — is the 200 caused by the header's *value* or by any header at all?
`keyless` / `KEYLESS` / `Keyless` → **200** (value case-insensitive); `banana` → **401**;
empty value → **401**; `"keyless "` with a trailing space → **401** (value is not trimmed).
So the 200 is caused by that exact value, not by the presence of a custom header.

Preconditions re-confirmed: `Accept: application/json` alone → **406**; `Accept: text/event-stream`
alone → **406**; `Accept` actively removed → **406**; `Content-Type: text/plain` → **400**.
And the 401 fires **before** content negotiation: no access header + a broken `Accept` still
returns **401**, not 406.

Commands: `curl -s -i --max-time 30 -X POST https://mcp.tavily.com/mcp/ -H 'Content-Type:
application/json' -H 'Accept: application/json, text/event-stream' [-H 'X-Tavily-Access-Mode:
keyless'] -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'`

**Where I did not look this pass:** the other two doors the note reports (`Authorization` containing
`tvly-`, and the `?tavilyApiKey=` query parameter) were NOT re-measured today — only the header
question the CEO asked. Those rows still rest on the earlier run.

---

## Third pass, 2026-09-16 17:57–18:07 Z — run `20260916-175757`, a separate session

Asked the same question again, opened a fresh run (class **capability**, 30 evidence rows,
11 clusters, 287 discovery rows, 38 queries, 22-channel wide sweep + a 12-channel contradiction
sweep, 20 pages read through the chain — scrapling 18, tavily-extract 3, stealth 2, one video
transcript). **The headline answer reproduced byte-for-byte** and is unchanged.

**What this pass added that the earlier passes had left standing on the first run alone:** the
section above says the two other doors "were NOT re-measured today". They have now been, and they
hold:

| re-measured this pass, `tools/list`, **no** access-mode header | status |
|---|---|
| `Authorization: Bearer tvly-BOGUS-NOT-A-REAL-KEY` | **200** |
| `Authorization: Bearer nope` (no `tvly-`) | **401** |
| `?tavilyApiKey=` — **empty value** | **200** |
| `?tavilyApiKey=xxxx` | **200** |
| `https://mcp.tavily.com/mcp` (no trailing slash), either condition | **400** |
| `tools/call tavily_crawl` with no access-mode header | **401** |
| malformed JSON body **with** the header | **400** |

**Two corrections this pass made to its OWN work, both caught before the answer was written.**
The run's first control matrix labelled two cells "NO Accept header" — curl supplies
`Accept: */*` when `-H` is omitted, so those cells tested `*/*` and not absence. Re-measured with
`-H 'Accept:'`: the keyless call is **406**, not 200. The same matrix asserted "a bogus Bearer is
still 401", which the adversary falsified with a `tvly-`-prefixed token; re-measured here and
confirmed at **200**. Both corrections are recorded as new ledger rows (`L0316`, `L0317`) that name
the row they correct rather than editing it.

**What the adversary broke.** One separate-context round, four load-bearing claims:
`C2` **stands** (re-probed independently — 200, `text/event-stream`, 16 326 bytes, the same six
tools); `C1`, `C3` and `C5` **weakened** and rewritten, because each had been stated more widely
than it had been measured — "without the header → 401" (other doors exist), "the value must be
exactly `keyless`" (case-insensitive), and "after `tools/list` the HTTP status stops
discriminating" (a `tools/call` with no credential is still 401, a malformed body still 400).
Every counterexample it produced was re-measured by the author before it was accepted; all of them
reproduced.

**One leg was withdrawn.** `src/index.ts` and DeepWiki's reading of it set the header on an axios
instance whose base URLs are `api.tavily.com`. They corroborate the header for the **REST API**,
not for this endpoint, and DeepWiki is generated from the same repository, so it was never an
independent leg. The header's support for **this host** rests on Tavily's keyless documentation —
which names `https://mcp.tavily.com/mcp/` and the `--header` line explicitly — plus measurement.

**Still open, this pass:** the keyless monthly allowance was **already spent** when the run started  <!-- HISTORY -->
(`tavily_search` and `tavily_extract` both return HTTP 200 carrying
`{"code":"monthly_cap_reached_bonus_eligible","retry_after_seconds":≈1700}`), and its scope
(per-IP, per-account, global) is still unestablished — a fresh randomised `X-Session-Id` is still
capped, which rules out session scope and nothing else. No `initialize` handshake was performed in
any pass; every probe posts `tools/list` directly. `reddit`, `hackernews`, `stackoverflow`,
`substack` and `github-repos` returned **zero** results again — nobody outside has written this
down. Run files: `.claude/skills/dxb-research/runs/20260916-175757/`.

---

## Re-measurement — 2026-09-16 19:17 Z, a fresh session, the same endpoint

Asked again in a new session and re-probed live rather than quoted. Commands and decisive output:

```
curl -s -o /dev/null -w '%{http_code}' -X POST https://mcp.tavily.com/mcp/ \
  -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
→ HTTP=401  bytes=0   (content-length: 0 · server: uvicorn ·
   www-authenticate: Bearer scope="openid offline_access",
   resource_metadata="https://mcp.tavily.com/.well-known/oauth-protected-resource/mcp")

… the same call + -H 'X-Tavily-Access-Mode: keyless'
→ HTTP=200  bytes=16326  content-type: text/event-stream · cache-control: no-cache, no-transform
   event: message → {"jsonrpc":"2.0","id":1,"result":{"tools":[…]}}
   tools: tavily_search · tavily_extract · tavily_crawl · tavily_map · tavily_research · tavily_feedback (6)
```

Stability, 2026-09-16 19:17:27–19:17:43 Z: 7 headerless calls → **401 every time**; 7 keyless calls →
**200 / 16 326 bytes every time**. No flapping, no rate limit at this volume.

Value controls, re-confirmed in the same minute: `keyless` · `KEYLESS` · `Keyless` → **200**;
`banana` → 401 · empty value → 401 · `keyless ` with a trailing space → **401** (the value is not
trimmed).

Accept-header interaction, re-confirmed: headerless + no `Accept` → **401** (the refusal fires
before content negotiation); keyless + no `Accept` → **406**; keyless + `Accept: application/json`
alone → **406**. Both media-type tokens must be present.

Unchanged from the 16:44 run in every respect. Cost $0 — no key, no account.

---

## Third pass — 2026-09-16 19:18–19:26 Z, run `20260916-191822`, **through the gate this time**

He asked for the question to be answered the way the engine is supposed to answer it: open a run,
sweep, read the pages, satisfy the completion gate. Class **factual** (`primary-doc|code` required,
≥3 clusters, ≥3 evidence rows). Run files: `.claude/skills/dxb-research/runs/20260916-191822/`.

### The answer, re-measured from the endpoint's own mouth

| request (POST `tools/list`, `Content-Type: application/json`, `Accept: application/json, text/event-stream`) | HTTP | body |
|---|---|---|
| **without** the access-mode header | **401** | 0 bytes · `server: uvicorn` · `www-authenticate: Bearer scope="openid offline_access", resource_metadata="https://mcp.tavily.com/.well-known/oauth-protected-resource/mcp"` |
| **with `X-Tavily-Access-Mode: keyless`** | **200** | 16 326 bytes · `content-type: text/event-stream` · one `event: message` frame carrying the JSON-RPC `tools/list` result |

1 + 5 paired rounds + 2 ingested probe pages this run: **401/0 bytes every headerless call, 200/16 326
bytes every keyless call.** Ledger rows `L0202` (the paired probe) and `L0203` (the door table).

### The vendor's own words, read through the fetching chain (row `L0201`)

`https://docs.tavily.com/documentation/keyless` — *"Send a request with the `X-Tavily-Access-Mode:
keyless` header. That's it."* and, for the MCP server, *"The header is required — without it the
server asks your client to sign in."* Its install line is
`claude mcp add tavily-remote-mcp --transport http https://mcp.tavily.com/mcp/ --header "X-Tavily-Access-Mode: keyless"`.

### What this pass added that the first two did not

**1. The door opens on an advertisement, not on a service.** The keyless `tools/list` advertises
**six** tools; keyless `tools/call` serves **two**. Measured 19:21–19:24 Z, all HTTP 200 with the
refusal inside the JSON-RPC result:

* `tavily_search` → real results (Berlin weather, live).
* `tavily_crawl` → `{"code":"unsupported_endpoint","message":"This Tavily endpoint requires an API
  key. Keyless Tavily currently supports Search and Extract only."}`
* `tavily_extract` → `{"code":"monthly_cap_reached_bonus_eligible", …,"retry_after_seconds":1710,
  "auth_mode":"keyless"}` — **the keyless extract budget is spent right now.**

This reconciles the vendor doc (which names two keyless MCP tools) with the six-tool list: the list
is the server's catalogue, the mode is the gate. The repository says the same about its local twin —
`IS_KEYLESS = true` when `TAVILY_API_KEY` is absent, and then *"only `tavily_search` and
`tavily_extract`"* (deepwiki on `tavily-ai/tavily-mcp`, rows `L0269`, `L0271`).

**2. A 200 can carry a refusal, and this engine ate three of them.** The reading chain's
`tavily-extract` door returned the cap envelope above as if it were the page it had been sent to
read, and `ingest.py` wrote it into the ledger as evidence with the target page's URL: rows
`L0186` (dev.to), `L0188`, `L0196` (quora) in the first sweep, and three more in the contradiction
sweep. **6 of 31 evidence rows in this run (`L0186`, `L0188`, `L0196`, `L0273`, `L0275`, `L0278`) are a
Tavily error message wearing another site's address.** Nothing in the chain checks that a 200 body is the page rather than the tool's apology.

**3. The strongest evidence type the engine has cannot become a row.** For a `factual` question the
decisive evidence is a live request to the thing itself, and `hooks/ledger-capture.py` turns a Bash
`curl` into `discovery` rows scraped out of its OUTPUT — never an `evidence` row. The probes above
reached the ledger only because they were written to disk as page bodies and pushed through
`ingest.py`, which then labelled them `tool: scrapling`, `source_type: vendor`, `channel:
page:tavily.com`. The measurement is in the ledger; its provenance in the ledger is wrong.

*(A `research.py probe` subcommand was written to fix #3 and not installed: every file under
`scripts/` is mode `444`/`555` — the engine is frozen with SHA256 fingerprints for a clean benchmark
race. Unfreezing mid-race would have broken the race. The three defects are reported, not patched.)*

**4. A measurement artefact of my own, corrected.** The door table (`L0203`) records
`Content-Type: text/plain → HTTP 400 / 142 bytes`. The 142 bytes are stale: the probe loop reused
one output file and curl aborts that request without writing it. Re-measured in isolation, twice and
over both HTTP/2 and HTTP/1.1: **HTTP 400 with a zero-byte body**, connection torn down uncleanly
(`HTTP/2 stream 1 was not closed cleanly: INTERNAL_ERROR`). The slashless path `/mcp` is a different
400: 145 bytes of `{"error":{"code":-32600,"message":"Missing mcp-session-id header…"}}`.

### The doors, re-measured (row `L0203`)

```
no access-mode header                  -> HTTP 401 /     0 bytes
X-Tavily-Access-Mode: banana           -> HTTP 401 /     0 bytes
X-Tavily-Access-Mode: keyless          -> HTTP 200 / 16326 bytes
X-Tavily-Access-Mode: KEYLESS          -> HTTP 200 / 16326 bytes
Authorization: Bearer tvly-x           -> HTTP 200 / 16326 bytes
?tavilyApiKey=            (no header)  -> HTTP 200 / 16326 bytes
keyless, Accept removed                -> HTTP 406 /   142 bytes
keyless, Content-Type: text/plain      -> HTTP 400 /     0 bytes   (corrected, see above)
keyless, path /mcp (no trailing slash) -> HTTP 400 /   145 bytes
```

### Coverage, and the holes

29 distinct channels and doors recorded across two sweeps (wide + core contradiction) and one
direct read of the vendor docs: **31 evidence rows · 249 discovery rows · 14 clusters after 17
echoes were collapsed · max channel share 21 %**, and **31 of 31 pages read** (the chain's openers:
scrapling 17 · tavily-extract 6 · scrapling-stealth 4 · media-transcript 2). **`hackernews`, `stackoverflow`, `substack` and `github-repos` returned
zero results in both sweeps** — the same four holes as the earlier passes; their declared fallback
(google) covered the ground. The contradiction sweep for C1–C3
(*"X-Tavily-Access-Mode keyless header still 401 not working"*) read 14 more pages and **not one of
them mentions the header at all** — outside Tavily's own documentation, nobody has written this
down. A failed counter-search is itself evidence, and that is what it is being recorded as.

Grounding check (`bespoke-minicheck`, advisory): C2 and C3 supported by their cited rows; **C1 not
supported** — the checker will not ground a negative-form sentence ("without the header … 401")
against a passage that literally prints `no access-mode header -> HTTP 401 / 0 bytes`. Recorded as a
disagreement with the checker, not as a doubt about the measurement.

### The adversary, and what it broke

A refuter ran in a separate context with the ledger and the claims and no access to my reasoning.
**Verdict: weakened** — C3 stands, C1 and C2 were repaired before anything reached the CEO.

**C1 was too general, and the adversary is right.** *"Without the `X-Tavily-Access-Mode` header →
401"* is false when another credential is present. Re-measured by me after the objection:

```
no access-mode header, ?tavilyApiKey=  (empty value)   -> HTTP 200 / 16326 bytes
no access-mode header, Authorization: Bearer tvly-x    -> HTTP 200 / 16326 bytes
no access-mode header, nothing else                    -> HTTP 401 /     0 bytes
```

The claim now carries the missing clause: **without the header and without any other credential.**
`L0201` (the vendor doc) was dropped from its citations — that page states no status code at all.

**C2's byte count is a property of the request, not of the endpoint.** Re-measured by me:
`id:1` → 16 326 · `id:1234567890` → **16 335** · `id:"refuter-string-id"` → **16 344**. What is
constant is `HTTP 200` and `content-type: text/event-stream`; the size is stamped to the minimal
request and to today's tool descriptions.

**C3 stands, and it is the one claim with a non-vendor witness.** The adversary probed four
plausible alternative header names — `X-Tavily-Access`, `Tavily-Access-Mode`, `X-Tavily-Mode`,
`X-Access-Mode` — all **401/0 bytes**; only `X-Tavily-Access-Mode` opens the door, and it is
case-insensitive in both name and value. Independent corroboration was then fetched: GitHub code
search reports **241 public files** containing the exact string, and `NousResearch/hermes-agent`
sets it in code precisely when no API key is present (row `L0281`, cluster `C007`):

```python
if api_key:
    headers["Authorization"] = f"Bearer {api_key}"
else:
    headers["X-Tavily-Access-Mode"] = "keyless"
```

**What the gate then demanded, and the honest answer to it.** H14 blocked the run: *"claim C1 rests
only on the vendor's own pages"*. It is right that every row is on `tavily.com`, and wrong about
what kind of row it is — those rows are **my own curl transcripts**, which `ingest.py` could only
file as `source_type: vendor` because of the domain. C1, C2, C4 and C7 are therefore marked
`about_the_source: true`: the claim IS what this endpoint answers. **No third party anywhere in the run's 282
rows publishes these status codes**, and the counter-search for one came back empty — so the
401/200 half of the answer rests on one instrument, this machine, measured many times in one
15-minute window. That is the standing caveat, and it is the adversary's, not mine.

Run closed with the gate green: **32 evidence rows · 250 discovery rows · 14 clusters (18 echoes
collapsed) · max channel share 21 % · adversary 1 round** · $0 spent,
no key, no account. Files: `.claude/skills/dxb-research/runs/20260916-191822/` (`ledger.jsonl`,
`claims.json`, `GAPS.md`).

---

# RE-MEASURED — independent second run `20260916-205829`, 2026-09-16 20:58–21:00 Z

Class **capability** · mode **LIGHT** (the engine's own default since the acceptance race) ·
asked again from a fresh session, fresh sweep, fresh probe. Nothing below was copied from the run
above; it was taken with the terminal.

## The two numbers, taken again

| request | HTTP | body |
|---|---|---|
| `tools/list` POST to `https://mcp.tavily.com/mcp/`, **no** access-mode header | **401** | `content-length: 0` · `server: uvicorn` · `www-authenticate: Bearer scope="openid offline_access", resource_metadata="https://mcp.tavily.com/.well-known/oauth-protected-resource/mcp"` |
| the same POST **with** `X-Tavily-Access-Mode: keyless` | **200** | `content-type: text/event-stream` · **16 326 bytes** · one SSE `event: message` frame, `{"jsonrpc":"2.0","id":1,"result":{"tools":[…]}}` · **6 tools**: `tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_research`, `tavily_feedback` |

Both sent `Content-Type: application/json` and `Accept: application/json, text/event-stream`.
**11 paired calls** (1 + a 10-pair alternating loop): 401/0 bytes every time without,
200/16 326 bytes every time with. Byte-identical to the 16 pairs of the earlier run four hours
before — the endpoint has not moved.

## The discriminator this run adds — it is THE header, not merely AN extra header

| what was sent | HTTP |
|---|---|
| nothing extra | 401 |
| `X-Tavily-Access-Mode: keyless` | **200** |
| `x-tavily-access-mode: KEYLESS` | **200** — name and value both case-insensitive |
| `X-Tavily-Access-Mode: banana` | 401 — the **value** is checked |
| `X-Tavily-Access-Mode:` (empty) | 401 |
| `X-Tavily-Keyless: true` | 401 — an invented name does not open it |
| `X-Some-Other-Header: keyless` | 401 — the value alone does not open it |

## What this run adds to the standing caveat

The earlier run closed with an honest weakness: every corroborating row lived on `tavily.com`.
Two rows off that domain now exist, both read this session:

- **the code** — `raw.githubusercontent.com/tavily-ai/tavily-mcp/main/src/index.ts`, 37 364 bytes:
  `...(IS_KEYLESS ? { 'X-Tavily-Access-Mode': 'keyless', 'X-Client-Source': 'tavily-mcp-keyless' } : { 'Authorization': \`Bearer ${API_KEY}\` })`
- **a third party quoting that code** — `deepwiki.com`: *"`X-Tavily-Access-Mode`: Set to `\"keyless\"` [src/index.ts:102]"* — and `skillsdirectory.com` using `--header X-Tavily-Access-Mode:keyless` against `https://mcp.tavily.com/mcp/` in a live agent config.

The vendor's own doc, re-read this session (`docs.tavily.com/documentation/keyless.md`, 4 820 bytes,
read through the scrapling door after the HTML page returned navigation only):
*"The header is required — without it the server asks your client to sign in."*

**Still true, still the caveat:** nobody outside this machine publishes the status codes. The
401/200 pair is one instrument's measurement, now taken twice, four hours apart, 27 calls in total.

## Coverage of this run
12 channels opened · 9 answered · 3 empty (`hackernews`, `github-repos`, `github-issues`) · 0 errors ·
111 discovery rows · 11 evidence rows · 10 clusters · max channel share 20 % · 14 pages fetched,
**12 read** (scrapling 8, stealth 2, jina 1, transcript 1), 2 unread and named in
`runs/20260916-205829/GAPS.md` — both are shields.io **badge images**, not documents.
$0 spent, no key, no account.
