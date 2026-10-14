# Sources — rival source 41 (`~/Desktop/RAKIP-41-RAPOR.md`)

Reader for step 2b, 2026-10-14. Source: Mert Durmazer, "MCP Çok Daha İyi Hale Geldi" (YouTube `4F1Xr3HX_es`,
2026-09-16), report written 2026-09-19. Its repository copy is `.planning/research/rival-intel/41-4f1xr3hx-es.md`
(+ `transcripts/41.json`).

**Headline:** the report was acted on the same day. The chief engineer's plan he asked for is
`.planning/quick/20260919-the-opening/PLAN.md`; he saw it and ordered it built
(`opening-discipline-ordered-for-construction-and-holding-2026-09-19`). The construction side became **B47 — closed and
accepted by his eye 2026-09-19** ("göz tmm.", Section 5, board line 381). The holding side was registered on **B41**
(open, Section 1, board line 127) as four parts: categories done, discovery = B41's own links, code mode and the
ergonomic layer "registered, not built". B52 (closed 2026-09-22) cut the opening further.

Measured today (2026-10-14):
- `.claude/settings.json` `enabledPlugins` → 10 project switches, all `false` (playwright plugin, skill-creator plugin,
  caveman, impeccable, taste-skill, ui-ux-pro-max, frontend-design, obsidian, claude-md-management,
  andrej-karpathy-skills).
- `.mcp.json` servers → `['scrapling', 'playwright']`.
- `.claude/CUPBOARD.md` 1,437 bytes.
- `node --no-warnings tests/hooks/opening-budget.ts` → `core 12313 · project skills 3855 · position block 4275 · total
  20443 · cupboard 1437 (bytes)` … `6/6 PASS, 0 failures`; wired into `scripts/hooks/pre-commit:92`.
- Company, SELECT only: `agents` active by `mcp_profile` → `inherit|211`, two `.employee` overlays; `tool_calls` →
  `537|219|2026-09-05` (count, runs, latest date).
- `scripts/governance/ceo-approvals.json`: the five B47 entries are there (opening-discipline-ordered, dead-twins-closed,
  eight-plugins-closed, b47-accepted, memory-index-stays).

---

### M-1 — Progressive tool discovery in our own sessions (tools arrive as names, schemas fetched on need)
- Says: "Claude Code: tool search on by default" · report §3.1: "claim 3 of the film is not news to us — it is already running."
- Done already: yes — measured in the report itself (126 tools as names, 4,603 bytes); this reader's session also receives tools deferred by name.
- On the board: B47 (closed): "progressive tool discovery is live — 126 tools arrive as names, 4,603 bytes"
- Would integrate into the holding: nothing new; the construction harness already does it.
- Layer: L2
- Board: nothing to write (built by the harness, recorded on closed B47)

### M-2 — The threshold: a budget for skills and context at the opening, enforced by a ruler
- Says: "Is a budget the right shape for the rest of the opening, or is that the wrong tool?"
- Done already: yes — B47 L1 `tests/hooks/opening-budget.ts` (6/6 PASS today, pre-commit wired); B52 `scripts/measure/startup-budget.sh` gates MEMORY.md ≤ 3,600 and the basket ≤ 11,000. The film's 1–5 % was rejected as a rule on purpose (plan: "sizin 'kanun olsun' demediğiniz hiçbir şey kanun olmaz").
- On the board: B47 (closed) L1 · B52 (closed)
- Would integrate into the holding: stops the opening regrowing in silence.
- Layer: L2
- Board: nothing to write (built and accepted). See Reader notes for B52's own unfinished follow-up.

### M-3 — Playwright mounted twice (49 tools for one capability), 71 browser tools across three servers
- Says: "Playwright is mounted TWICE … 49 tools for one capability."
- Done already: yes — plugin mount switched off at project scope on his word (`dead-twins-closed-…-2026-09-19`); today `enabledPlugins['playwright@claude-plugins-official'] = False`, `.mcp.json` keeps `playwright`; claude-in-chrome kept (128 calls, the eye tests run on it). Measured wrong-tool choices: 0.
- On the board: B47 (closed) L2
- Would integrate into the holding: one browser mount, no confusion.
- Layer: L2
- Board: nothing to write (done on his word, accepted)

### M-4 — skill-creator installed twice (repository copy and plugin copy byte-identical)
- Says (plan, from the report's discipline): "filmin 1. iddiasındaki hastalık bizim evde"
- Done already: yes — plugin twin off at project scope (`skill-creator@claude-plugins-official: False`); `Skill("skill-creator")` opens the repository copy.
- On the board: B47 (closed) L2b
- Would integrate into the holding: one copy.
- Layer: L2
- Board: nothing to write

### M-5 — Plugin skill descriptions arrive whole at every opening (91 skills, ≈6,858 tokens); make them arrive when needed
- Says: "not turning things off, but making them arrive when they are needed instead of at the opening"
- Done already: yes — the cupboard page `.claude/CUPBOARD.md` (1,437 bytes) delivered by `spec-bootstrap.sh`, and the eight unused plugins closed for this project on his word ("hepsini kapat.", `eight-plugins-closed-for-this-project-2026-09-19`); measured first request 48,184 → 45,679 tokens; drawer-open path proven (session `74c0c987`).
- On the board: B47 (closed) L3
- Would integrate into the holding: the warrior knows where every tool lives without loading it.
- Layer: L2
- Board: nothing to write

### M-6 — Code mode: the agent writes a script that chains tools, intermediate results never enter the context
- Says: "Ara sonuçlar bağlama hiç girmiyor. Bu artık Anthropic API'da var." · §5 thread 3: "Where in this holding do agents chain tools and pay for every intermediate step?"
- Done already: partly — construction side: the research fleet already works this way (plan: "Araştırma filosu zaten kod modu"). Holding side: not built; first candidate named (`queue_get`, 300 of 537 calls), its context cost not yet measured.
- On the board: B41: "Code mode and an ergonomic layer are registered, not built" (row file line 16, "(iii) CODE MODE — planned, not built"; listed in B41's "what is missing")
- Would integrate into the holding: employees spend fewer tokens chaining the holding's own MCP tools.
- Layer: L3 (B41's home: employees' tools) — touches L2 cost
- Board: note for row B41 — already carried; the only addition is that `tool_calls` still holds 537 rows / 219 runs ending 2026-09-05 (measured today), so the measurement the candidate waits on has no newer data.

### M-7 — The ergonomic layer: frequent multi-step jobs wrapped into one operation (rag-web-browser pattern)
- Says: "Ajan bu zinciri her seferinde sıfırdan çözmek zorunda kalırsa bu çok fazla boşa giden token anlamına geliyor."
- Done already: partly — construction side: `fleet/fleet.sh` (report §3.4: "already the design of the research fleet"). Holding side: `packages/dxb-mcp` (9 groups) has no such wrapping (plan, measured 2026-09-19); not built.
- On the board: B41: "(iv) ERGONOMIC LAYER — planned, not built"
- Would integrate into the holding: the holding's MCP offers whole jobs, not raw calls.
- Layer: L3
- Board: note for row B41 — already carried; nothing new to write.

### M-8 — Categories: give each employee only its own tool category ("Ajana sadece şunları ver")
- Says: "We have written employees with very different jobs. Does each one need the whole arsenal at its opening, or its own category?"
- Done already: yes — the gateway compiles department + rank kits (`packages/gateway/src/library-profiles.ts`, `generate-profiles.ts`); company today `inherit|211` plus two `.employee` overlays.
- On the board: B41: "(i) CATEGORIES — DONE"
- Would integrate into the holding: already integrated.
- Layer: L3
- Board: nothing to write

### M-9 — Discovery for employees: a worker finds a tool it does not hold, on need
- Says: "İstemci … o araçları nasıl keşfedip nasıl çalıştıracağına kendi karar veriyor."
- Done already: partly — B41 first slice (2026-10-13): dxb-design granted to the design seats, "waits for his eye"; the five links (request → search → customs → grant → card) not built.
- On the board: B41: "None of the five links is built"; C29 names the same mechanism for the Skills page ("progressive disclosure, the same idea as B41's capability cards")
- Would integrate into the holding: employees get tools mid-task without the author.
- Layer: L3
- Board: nothing to write (B41 owns it)

### M-10 — MEMORY.md (11,951 bytes) loaded at every opening
- Says: report §3.3 row "MEMORY.md (the memory index) 11 951 · 2 987"
- Done already: yes — B47 L4 closed on his word, unchanged ("gerek yok. kalsın.", `memory-index-stays-l4-closed-2026-09-19`); then B52 on his order made it an index (5,334 → 3,294 tokens, all 96 files identical).
- On the board: B47 L4 (closed) · B52 (closed)
- Would integrate into the holding: done.
- Layer: L6
- Board: nothing to write

### M-11 — claude-mem context injection and MCP servers' instruction blocks: unmeasured part of the opening
- Says: "⚠ UNVERIFIED — not measured this session … A plan that quotes a total must measure them first."
- Done already: partly — claude-mem measured and closed "NO DEFECT" (B47 L5: one copy reaches the model, ≈400 tokens). The MCP servers' instruction blocks: no measurement found in B47 or B52 (B47 measured the whole `skill_listing`, 30,072 → 22,950 bytes, and the first-request total instead).
- On the board: B47 L5 (closed); MCP instruction blocks NONE
- Would integrate into the holding: a complete opening ledger.
- Layer: L2
- Board: nothing to write — the first-request total (B47/B52 ruler) already contains them; separating them is not ordered work.

### M-12 — `ide` and `plugin:open-design` failed to connect in the 2026-09-19 session
- Says: "a connection failure, not a missing capability, and named here so it is not mistaken for either."
- Done already: no — not re-measured by this reader (open-design is not among the project switches; whether it connects today is ⚠ UNVERIFIED).
- On the board: NONE
- Would integrate into the holding: a working design MCP for the construction seat, if it is used.
- Layer: L2
- Board: nothing to write — the report names it as a fact, not as work; plan B47 recorded open-design as "0 use". If the lead wants it, R2 measures it.

### M-13 — Disk: plugin cache 529 MB (473 MB claude-mem), skill-creator 14 old versions
- Says (plan, "Ayrı konu"): "Temizlik bir gün iş olursa 5 Eylül kuralınız uygulanır"
- Done already: no
- On the board: NONE
- Would integrate into the holding: disk only, no token effect.
- Layer: L2
- Board: nothing to write — not ordered; the plan itself parked it "bir gün iş olursa", and deleting needs his list-and-look (2026-09-05).

---

## Reader notes

**His words in the report (verbatim):**
- *"sana bir link vericem onu öğren dinle. ve onunla ilgili baş mühendiste okuması için md dosyası ver. ve o konuda açılışla ilgili bir şey yapabilir miyiz diye sor plan hazırlasın. planı ben görmeden kimse bir şey yapmasın."* (2026-09-19)
- *"planı ben görmeden kimse bir şey yapmasın."*
- *"o konuda açılışla ilgili bir şey yapabilir miyiz diye sor, plan hazırlasın."*
- The speaker (not the CEO), on Apify: *"burada epify sponsor değil örnek olsun. Herkesin erişip bakabildiği bir yer olsun diye verdim."*

**His boundary was honoured:** the plan was put to him first, and he then ordered it built
("Bunu inşaata kuralım …", registered). Nothing in this source is still waiting on "planı ben görmeden".

**Contradiction inside the report, already resolved by him:** the report says "The plugins stay on unless the CEO
himself reopens his ruling of 2026-08-27" (*18/18 AÇIK*). He did reopen it, the same night: "hepsini kapat."
(`eight-plugins-closed-for-this-project-2026-09-19`) and "1-ölüleri kapat …" for the twins. The report file on his
Desktop still carries the old line — it is a dated source, not a record; no action.

**No contradiction with `.claude/CLAUDE.md`** found: the film's 1–5 % threshold was deliberately not made a law
(his "kanun olsun" rule); STACK.md governs packages and the report proposes none.

**For the lead (outside this source, not written anywhere):**
- B52's own named follow-up — "add `scripts/measure/startup-budget.sh` to the battery so the index cannot regrow in
  silence" — still not done: `grep -rln startup-budget scripts package.json tests` finds only the script itself and the
  ledger. B52 is closed, so this has no open owner row. It is a candidate only if the lead judges it ordered work.
- `tool_calls` in the company ends 2026-09-05 (537 rows). B41's first slice ran design seats on 2026-10-13; whether
  those calls should have landed in `tool_calls` is ⚠ UNVERIFIED — a question for R2/R4, not a finding from this source.

**Needs his word:** nothing. The holding-side remainder (code mode, ergonomic layer, discovery) is already ordered and
sits on B41; it gets its rank with B41.

**Candidate new rows from this source: none.**
