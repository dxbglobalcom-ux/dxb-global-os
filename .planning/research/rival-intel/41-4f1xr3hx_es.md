# Source 41 — Mert Durmazer, "MCP Çok Daha İyi Hale Geldi"

> **WHO THIS FILE IS FOR, AND WHAT IT ASKS.** Handed over live by the CEO, **2026-09-19**:
> *"sana bir link vericem onu öğren dinle. ve onunla ilgili baş mühendiste okuması için md dosyası
> ver. ve o konuda açılışla ilgili bir şey yapabilir miyiz diye sor plan hazırlasın. planı ben
> görmeden kimse bir şey yapmasın."*
>
> So this file has **one addressee — the chief engineer (the Fable 5.1 session)** — and **one
> question**, written out in §5: *can we do something about the OPENING?*
>
> **NOTHING IN THIS FILE IS AN INSTRUCTION TO BUILD.** The CEO's sentence is explicit: *"planı ben
> görmeden kimse bir şey yapmasın"* — **no line of code, no setting, no file is changed until the
> CEO has seen the plan with his own eye.** What is asked for is a plan. Only a plan.
>
> **Read mode:** LISTENED WHOLE, on his word *"onu öğren dinle"*. The author-provided Turkish
> subtitle track was taken in full (363 timed blocks, 6 831 characters) and is on disk at
> `transcripts/41.json`. The picture was **not** read frame by frame — this is a talking-head
> technical explainer, and the payload is what the man says. An exception granted to this source
> on his own reading instruction, not a change to ledger law 4.

## 1. Source identity

| Field | Value | How it was measured |
|---|---|---|
| URL | `https://www.youtube.com/watch?v=4F1Xr3HX_es` | handed over by the CEO |
| Title | **MCP Çok Daha İyi Hale Geldi** | `yt-dlp --skip-download --print` |
| Channel | **Mert Durmazer \| Digital Academy** | same |
| Uploaded | **2026-09-16** (three days before this reading) | same |
| Duration | **439 s (7 min 19 s)** | same |
| View count at the minute it was read | **6 279** | same |
| Language | Turkish, author-provided subtitles | `yt-dlp --write-subs --sub-langs tr` |
| Media on disk | `media/41-4f1xr3hx_es.mp4`, 11 045 067 bytes | `ls -la` |
| sha256 (media) | `63a3fb2d4c98afe0919e3918cf953e9ba18d18b13676844f28690f626e8e466d` | `sha256sum` |
| sha256 (transcript) | `0ebb1caeda328faca2889c4234209b2771e6637aca34aa6f037eb977bcf114d9` | `sha256sum` |
| Commercial interest | **None declared, and the speaker says so out loud** about the vendor he demonstrates: *"burada epify sponsor değil örnek olsun. Herkesin erişip bakabildiği bir yer olsun diye verdim."* The vendor is **Apify** (the transcript's auto-captions render it "Epify"/"Happify"), and its MCP server is open source | transcript |

**What the film is, in one line:** no product demo, no screen recording of a system — **an
architecture lecture**. One man, slides, seven minutes, on a single claim: *the division of labour
inside MCP has moved, and if you build your tools for the old division you pay for it in tokens and
in wrong tool choices.*

## 2. What it says — the five claims, in his order

**Claim 1 — the first MCP pattern was one tool per API endpoint, and it broke twice.**
> *"API'ın her endpointini bir araca işle. Böylece ajan API'ın tamamına erişiyordu. Bu çalıştı ama
> iki büyük sorun çıkardı."*

- **Break one, the context bill.** Hundreds of endpoints became hundreds of tools, **all loaded into
  the context window at the start of the session** — *"sen daha ilk mesajını yazmadan pencere araç
  tanımlarıyla şişmiş olabiliyordu."* He cites MCP's own documentation for the size: **≈150 000
  tokens for the definitions alone.**
- **Break two, the wrong tool.** Many near-identical endpoints → the agent picks the wrong one.

**Claim 2 — servers answered with a layer: search → inspect → run.**
Instead of listing hundreds of tools, three: one to search the available endpoints, one to fetch a
single endpoint's detail, one to execute. *"Ara, incele, çalıştır. Bu kalıp çok benimsendi."*
Apify's MCP server is his worked example: `search-actors`, `fetch-actor-details`, then run.

**Claim 3 — and then the CLIENTS took that pattern over. This is the shift the film is named for.**
> *"Son dönemde istemciler, özellikle popüler kodlama ajanları, aynı kalıbı kendi taraflarında
> uyguluyorlar. Adı Progressive Tool Discovery ve artık MCP'nin resmî dokümanında istemciler için
> önerilen kalıp bu."*

- **Claude Code: tool search on by default.** **Codex: made tool search the default for MCP tools.**
- So even when a server lists hundreds of tools, **the agent does not take them all into context —
  it searches as it needs.**
- **And the threshold belongs to the client, not the server.** The documentation's rule, as he
  states it: **when tool definitions pass 1–5 % of the context, switch to discovery.** His reasoning
  is the part worth keeping: *"Bu eşiği sunucu bilemez. Bağlam penceresi kimdeyse o bilir."*

**Claim 4 — "code mode": the agent writes a script, and the intermediate results never enter the context.**
> *"Normalde ajan araçları tek tek çağırır. Her çağrının sonucu modele döner… Kod modda ajan bir
> script yazıyor. Script araçları sandbox'ta zincirliyor ve nihai sonuç modele döndürülüyor. Ara
> sonuçlar bağlama hiç girmiyor. Bu artık Anthropic API'da var."*

His summary of the two together: **"Keşif seçimi çözüyor, kod mod birleştirmeyi çözüyor."**
Discovery solves *selection*; code mode solves *combination*.

**Claim 5 — but do NOT go back to one-tool-per-endpoint. Build an ergonomic layer.**
This is the part most people would drop, and it is the useful half.
> *"Her API'da sık yapılan işler var ve bunlar birden fazla çağrıyı zincirlemeyi gerektiriyor. Ajan
> bu zinciri her seferinde sıfırdan çözmek zorunda kalırsa bu çok fazla boşa giden token anlamına
> geliyor."*

His concrete example — Apify's `rag-web-browser`: **one tool, three steps inside it** (search
Google → open the result pages in a real browser → clean the content into Markdown). Each step
exists separately as its own actor. They were wrapped into one **because the agent doing it in
pieces means every intermediate page lands in the context.**

> *"Ajanları yavaşlatan, sizin daha çok para harcamanıza sebep olan şeyler, daha çok token
> tüketmenize sebep olan şeyler."*

**And a fourth device, almost in passing: categories.** Apify's server is joined with the category
appended to the address — `?tools=actors,runs,storage,tasks` — *"Ajana sadece şunları ver
diyorsun."* He says he does this on his own server too.

**His closing picture — three layers:**

| Layer | What it holds |
|---|---|
| bottom | the raw API — every endpoint separately |
| middle | **the ergonomic layer** — frequent multi-step jobs wrapped into one operation |
| top | the MCP server — exposing those as tools, in categories |

**And the sentence that is the whole film:**
> *"Sunucu hangi araçların mevcut olduğunu kontrol ediyor… İstemci, yani ajanlarımız, o araçları
> nasıl keşfedip nasıl çalıştıracağına kendi karar veriyor. Keşif, birleştirme, çalıştırma ajanın işi."*

**The server owns WHICH tools exist. The client owns HOW they are found and run.**

## 3. Measured against this holding — taken 2026-09-19, before any judgement below

Nothing in this section is quoted from memory or from a previous session's report. Every row was
measured in this session with the command printed beside it.

### 3.1 What we already own — and the answer is: the main thing, yes

| Question | Measured answer | Command |
|---|---|---|
| Is progressive tool discovery ON in this repository's sessions? | **YES, and it is live right now.** This session received **126 tools as names only**, with the instruction that their schemas must be fetched before use. That *is* the pattern the film names | counted from this session's own deferred-tool listing, written to `deferred.txt`, `wc -l` = **126** |
| What does that name-only listing cost? | **4 603 bytes ≈ 1 150 tokens** for 126 tools — roughly **36 bytes a tool** instead of a full JSON schema | `wc -c < deferred.txt` |
| Split | **104 MCP tools + 22 built-in tools** | `grep -c '^mcp__'` |

**So claim 3 of the film is not news to us — it is already running.** Written down here so that no
plan proposes building a thing we already have. (The rule that made this check mandatory:
`part-already-owned-check` — the CEO had a report deleted for recommending a part the holding
already owned.)

### 3.2 Where the film points at something we have NOT done — the tool surface itself

`grep '^mcp__' deferred.txt | sed 's/^mcp__//; s/__.*//' | sort | uniq -c | sort -rn`

| MCP server | Tools exposed to this session |
|---|---|
| `plugin_playwright_playwright` | **25** |
| `playwright` | **24** |
| `claude-in-chrome` | **22** |
| `plugin_claude-mem_mcp-search` | **14** |
| `scrapling` | **10** |
| `claude_ai_Claude_Docs` | **5** deferred + 3 already loaded = 8 |
| `plugin_context7_context7` | **2** |
| `claude_ai_Kiwi_com` | **2** |

**Two findings a plan should start from:**

1. **Playwright is mounted TWICE.** `.mcp.json` declares a `playwright` server
   (`python3 -c "json.load(...)['mcpServers']"` → `['scrapling', 'playwright']`) **and** the
   `playwright@claude-plugins-official` plugin ships its own. Both arrived in this session:
   **49 tools for one capability.**
2. **Browser capability in total: 71 tools across three servers** (playwright 24 + plugin playwright
   25 + claude-in-chrome 22) — for what is, from an agent's point of view, **one job: drive a page.**
   This is precisely the confusion the film's claim 1 names: *"birbirine benzeyen çok endpoint varsa
   ajan kafasını karıştırıp yanlış aracı seçebiliyordu."*

**Also measured:** `ide` and `plugin:open-design:open-design` **failed to connect** in this session —
a connection failure, not a missing capability, and named here so it is not mistaken for either.

### 3.3 The opening, weighed — what arrives before the CEO's first sentence is read

This is the CEO's actual question, so it is measured item by item.

| What arrives at the opening | Bytes | ≈ tokens | Command |
|---|---|---|---|
| The position block (`spec-bootstrap.sh`, the session-start hook) | **7 825** | **1 956** | `bash .claude/hooks/spec-bootstrap.sh \| wc -c` |
| **Plugin skill descriptions — 91 skills across 10 plugins** | **27 434** | **6 858** | frontmatter `name:`+`description:` of every `SKILL.md` under `~/.claude/plugins/cache` |
| Project + global skill descriptions — 17 skills | **6 700** | **1 675** | same, over `.claude/skills` and `~/.claude/skills` |
| `.claude/CLAUDE.md` (project) | **12 058** | **3 014** | `wc -c` |
| `~/.claude/CLAUDE.md` (global) | **2 802** | **700** | `wc -c` |
| `MEMORY.md` (the memory index) | **11 951** | **2 987** | `wc -c` |
| The 126 deferred tool names | **4 603** | **1 150** | `wc -c` |
| **MEASURED TOTAL** | **73 373** | **≈ 18 340** | sum of the rows above |

⚠ **UNVERIFIED — not measured this session:** the claude-mem context injection and the MCP servers'
own instruction blocks are also part of the opening, and no command was run on them here. They are
**additional** to the 18 340 above. A plan that quotes a total must measure them first.

**The single heaviest item in the opening is not ours: 6 858 tokens of plugin skill descriptions,
91 skills, every session, before a word is spoken.** Its breakdown:

| Plugin | ≈ tokens at every opening |
|---|---|
| `caveman` | 1 615 |
| `claude-mem` | 1 260 |
| `taste-skill` | 1 187 |
| `skill-creator` | 1 162 |
| `frontend-design` | 766 |
| `obsidian` | 404 |
| `impeccable` | 226 |
| `claude-md-management` | 89 |
| `codex` | 87 |
| `andrej-karpathy-skills` | 59 |

**15 plugins are installed and all 15 are enabled** (`installed_plugins.json`). Note for the record:
the CEO's standing ruling of **2026-08-27** is *18/18 AÇIK* — **plugins being on is his order, and no
plan may propose turning them off without asking him.** What the film suggests is a different move
entirely: not turning things off, but **making them arrive when they are needed instead of at the
opening** — the same treatment the tools already receive.

### 3.4 The one place we already built the film's claim 5 — and it should be said out loud

The **ergonomic layer** the film argues for is **already the design of the research fleet**:
`.planning/research/` · `fleet/fleet.sh` sends seven hunters out at once, each carrying the whole
arsenal, and the agent does not re-derive the chain of *search → open → clean → count* on every
question. That is Apify's `rag-web-browser` argument, built here, before this video existed.
**The plan should measure what else in this holding deserves the same wrapping — not re-invent it.**

## 4. What this film is NOT

- **It is not a rival product.** There is no system here to out-build. It is a lecture about a
  protocol we already use.
- **It does not name a tool to install.** Apify is named as an open-source example, explicitly not a
  sponsor and not a recommendation. **Nothing in this file proposes adding Apify, or any package.**
  `.planning/research/STACK.md` governs that, as always.
- **It carries no claim about design, revenue, or the CEO's surfaces.** Its whole subject is the
  economics of an agent's context window.

## 5. THE QUESTION PUT TO THE CHIEF ENGINEER — this is the reason the file exists

The CEO's own sentence: ***"o konuda açılışla ilgili bir şey yapabilir miyiz diye sor, plan hazırlasın."***

**The question:** this film says the opening of a session is where the waste lives, and that the
cure is to let things arrive when they are needed rather than all at once. **Our tools already work
that way — 126 of them arrived as names. Our opening does not: ≈18 340 measured tokens arrive whole,
before the CEO has said anything.**

**Can we do something about the opening?** And if we can, **what exactly, in what order, and what
does each step cost and save — measured, not estimated?**

Four threads the film hands us. The plan may accept, reject or replace any of them — a reasoned
rejection is a deliverable exactly as an acceptance is:

1. **The threshold.** The documentation's rule is *1–5 % of context for tool definitions, then
   discover*. What is our equivalent number for **skills and context**, and who enforces it? We
   proved this week we can hold a hook to a byte budget (52 329 → 7 825 bytes, commits `93a59c68`,
   `11b952c3`). **Is a budget the right shape for the rest of the opening, or is that the wrong tool?**
2. **The duplicate tool surface.** 71 browser tools from three servers, Playwright mounted twice.
   **Is this costing us anything measurable — wrong tool choices, or only bytes?** Measure before
   proposing; the film's claim about confusion is a claim, not our measurement.
3. **Code mode.** Intermediate results never entering the context. **Where in this holding do agents
   chain tools and pay for every intermediate step?** The employee agents and the research fleet are
   the obvious candidates. Is this worth building, or does the fleet already have it by another name?
4. **Categories.** *"Ajana sadece şunları ver."* We have written employees with very different jobs.
   **Does each one need the whole arsenal at its opening, or its own category?**

## 6. THE BOUNDARY ON THIS WORK — the CEO wrote it himself

> ***"planı ben görmeden kimse bir şey yapmasın."***

- **A plan, and nothing else.** No setting changed, no plugin disabled, no `.mcp.json` edited, no
  file moved, no package installed, no hook rewritten — **until the CEO has read the plan and said
  his word.**
- **Measure, never guess.** Every number in the plan cites the command that produced it and the
  date. A number carried over from this file is re-measured or cited to this file by name.
- **Before/after, both measured.** Any proposed step names what it costs today and what it would
  cost after — and the second number is a measurement or is labelled a prediction. A prediction is
  never written in the past tense.
- **Name the blast radius.** His order of 2026-08-17: a change must repair its target and break
  nothing around it. The opening is what every session stands on; a plan that touches it names, in
  the same breath, what stands on it and how that will be re-measured.
- **The plugins stay on** unless the CEO himself reopens his ruling of 2026-08-27.
- **Nothing here becomes a law.** This file records one source and one question. It is not a spec,
  not a plan, and not a standing order.

---

**Material on disk:** `media/41-4f1xr3hx_es.mp4` · `transcripts/41.json` (full text + 363 timed blocks)
**Written:** 2026-09-19, by the Opus 5 session, on the CEO's live order of the same day.
