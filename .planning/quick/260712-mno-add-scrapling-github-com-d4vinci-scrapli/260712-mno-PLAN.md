---
phase: quick-260712-mno
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/research/study-cards/scrapling.md
  - .planning/research/INTEGRATION-TRACKER.md
autonomous: true
requirements: [INTEG-01]

must_haves:
  truths:
    - "INTEGRATION-TRACKER.md Main Tracking Table has exactly one Scrapling row: Category=Research, Status=INSTALL, Target Phase=10, Owner=Research/Data scraping, Trigger=skill, Study Card=study-cards/scrapling.md"
    - "study-cards/scrapling.md exists as a FILLED retroactive card (not a STUB) with STUDY and INSTALL checked, ADOPT and EMBED unchecked"
    - "No other tracker row is modified (tracker diff = 1 insertion, 0 deletions)"
    - "All new content is in English per the project language rule"
  artifacts:
    - ".planning/research/study-cards/scrapling.md"
    - ".planning/research/INTEGRATION-TRACKER.md (one new row in Main Tracking Table)"
  key_links:
    - "Tracker row Study Card column 'study-cards/scrapling.md' resolves to the new card file on disk"
---

<objective>
Record Scrapling (github.com/D4Vinci/Scrapling) in the DXB integration lifecycle system: one new row in the INTEGRATION-TRACKER.md Main Tracking Table plus the matching retroactive study card at study-cards/scrapling.md.

Purpose: Scrapling was installed this session on the CEO's machine (isolated venv at ~/scrapling-env, outside this repo) BEFORE a study card existed — the same "Already installed — retroactive study card owed" debt class as the superpowers/GSD/caveman/moneyprinterturbo rows, plus a dual-role-principle deviation (installed ahead of any consuming feature). INTEG-01 requires the tracker to hold every item until EMBED and forbids blind installs; this task pays the card debt and records the deviation, not silently.

Output: Two docs-only changes — a new filled study card and a single new tracker row. No source code changes.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/research/INTEGRATION-TRACKER.md
@.planning/research/study-cards/yt-dlp-video-use.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create the retroactive Scrapling study card</name>
  <files>.planning/research/study-cards/scrapling.md</files>
  <action>
Create .planning/research/study-cards/scrapling.md as a FILLED retroactive study card. Match the structure and tone of study-cards/yt-dlp-video-use.md (full card, not the STUB shape of apify.md): H1 title, provenance blockquote, bulleted field list, "## Key API / Usage Notes" section, "## Known Pitfalls" section, Install Command + Legitimacy Verdict bullets, "## Lifecycle Checklist". Write everything in English (binding project language rule). All facts below were verified this session — copy them faithfully, do not invent or embellish.

Title: "# Study Card: Scrapling".

Provenance blockquote (directly under the title, matching the yt-dlp card's blockquote style): FILLED 2026-07-12 (quick task 260712-mno). RETROACTIVE — installed this session before the card existed; INTEG-01 study-before-install order was not followed (recorded deviation, not silent; same debt class as the superpowers/GSD/caveman rows).

Field bullets (same bold-label bullet format as the yt-dlp card):
- Tool: Scrapling — Python web scraping library (stealthy fetchers, adaptive selectors)
- Slug: scrapling
- Category: Research
- Status: INSTALL (retroactive: studied + installed, NOT wired into any DXB code path — not ADOPT)
- Target Phase: 10
- Owner (dept/tier): Research/Data scraping
- Trigger Type: skill; note mcp-profile as a possible future wrapping pattern — Scrapling is Python and DXB's stack is TS/Node, so no native MCP/skill bridge exists yet (would need a subprocess or HTTP wrapper)
- Source: https://github.com/D4Vinci/Scrapling — MIT license, active project
- Pinned Version: 0.4.10 (installed via pip with the "scrapling[all]" extras spec into an isolated venv at ~/scrapling-env, because the OS's system Python is externally-managed per PEP 668)
- Purpose: TBD — no concrete DXB use case identified yet; installed ahead of a specific consuming feature, deviating from the dual-role principle (tools install at the START of the phase that uses them). Deviation recorded, not silent.
- Official Docs URL: https://scrapling.readthedocs.io/en/latest/

Key API / Usage Notes section content:
- Import path: from scrapling.fetchers import Fetcher — Fetcher.get(url) returns a Response exposing .status and .css(selector)
- StealthyFetcher for anti-bot bypass (Camoufox-based)
- scrapling shell — interactive CLI
- Extras are REQUIRED: only the "scrapling[all]" install unlocks Shell/fetchers — a bare "pip install scrapling" raises ModuleNotFoundError on CLI use

Known Pitfalls section content (three numbered/bulleted pitfalls):
1. Debian/Ubuntu system Python is externally-managed (PEP 668) — a venv is mandatory; never use the pip break-system-packages escape hatch.
2. "scrapling install" (browser dependency installer) needs sudo for OS-level Playwright deps (libnss3 etc.) — this required an interactive sudo password prompt run by the CEO directly in their own terminal, never passed through an automated command string (credential hygiene: mid-session, the harness's own safety classifier blocked a password from being embedded in a shell command).
3. Python library with zero native bridge into DXB's TS/Node monorepo — needs a subprocess call or a small HTTP wrapper service to be reachable from any DXB agent/MCP.

Install Command bullet (verbatim): python3 -m venv ~/scrapling-env && ~/scrapling-env/bin/pip install "scrapling[all]" — then ~/scrapling-env/bin/scrapling install (Playwright browser binaries + OS deps; the latter needs manual sudo).

Legitimacy Verdict bullet: OK — active MIT-licensed project (D4Vinci/Scrapling), no install-time secrets, standard PyPI distribution; verified working with a live fetch test against example.com (200 status, correct DOM parse) both from $HOME and from inside the DxB Global OS repo directory.

Lifecycle Checklist (exact checkbox states):
- [x] STUDY (2026-07-12 — this retroactive fill)
- [x] INSTALL (2026-07-12 session — ~/scrapling-env venv + browser deps, live fetch verified)
- [ ] ADOPT
- [ ] EMBED
  </action>
  <verify>
    <automated>test -f "/home/ghost/DxB Global OS/.planning/research/study-cards/scrapling.md" && grep -c '0\.4\.10' "/home/ghost/DxB Global OS/.planning/research/study-cards/scrapling.md" && grep -c '\[x\] STUDY' "/home/ghost/DxB Global OS/.planning/research/study-cards/scrapling.md" && grep -c '\[x\] INSTALL' "/home/ghost/DxB Global OS/.planning/research/study-cards/scrapling.md" && grep -c '\[ \] ADOPT' "/home/ghost/DxB Global OS/.planning/research/study-cards/scrapling.md"</automated>
  </verify>
  <done>study-cards/scrapling.md exists as a filled English-language retroactive card: pinned version 0.4.10, source/docs URLs, Key API notes (Fetcher/StealthyFetcher/shell/extras), 3 known pitfalls (PEP 668 venv, sudo browser deps + credential hygiene, no TS/Node bridge), verbatim install command, OK legitimacy verdict with live-fetch evidence, and Lifecycle Checklist showing STUDY+INSTALL checked, ADOPT+EMBED unchecked.</done>
</task>

<task type="auto">
  <name>Task 2: Insert the Scrapling row into the INTEGRATION-TRACKER Main Tracking Table</name>
  <files>.planning/research/INTEGRATION-TRACKER.md</files>
  <action>
Use the Edit tool (scoped single-line insertion — NEVER rewrite the whole file with Write) on .planning/research/INTEGRATION-TRACKER.md. Insert exactly ONE new row into the Main Tracking Table, in the Research category block, immediately AFTER the existing Apify row and BEFORE the MiroFish row. Do not touch any other row, the legend, the Excluded Items section, or the Re-admission Log.

The new row, matching the column schema (Item, Category, Status, Target Phase, Owner (dept/tier), Trigger, Study Card, Notes) and the Notes tone of the other "already installed, retroactive card owed" rows — insert this exact line:

| Scrapling | Research | INSTALL | 10 | Research/Data scraping | skill | study-cards/scrapling.md | Already installed (CEO machine, ~/scrapling-env venv, outside repo) — retroactive card filled 2026-07-12; process deviation recorded: installed ahead of any consuming feature (dual-role principle: install at START of the using phase); no DXB code path yet, so INSTALL not ADOPT; Python lib with no native TS/Node bridge — future wrapping likely mcp-profile via subprocess/HTTP wrapper |

Anchor the Edit on the Apify row line (the line starting with "| Apify |") as old_string context, replacing it with itself plus a newline plus the new Scrapling row. Status token is the bare word INSTALL per the tracker's status legend (qualifiers live in Notes only).
  </action>
  <verify>
    <automated>cd "/home/ghost/DxB Global OS" && [ "$(grep -c '^| Scrapling |' .planning/research/INTEGRATION-TRACKER.md)" = "1" ] && [ "$(git diff --numstat -- .planning/research/INTEGRATION-TRACKER.md | awk '{print $1"-"$2}')" = "1-0" ]</automated>
  </verify>
  <done>Exactly one Scrapling row exists in the Main Tracking Table (Research block, after Apify, before MiroFish) with Status INSTALL, Target Phase 10, Trigger skill, Study Card study-cards/scrapling.md, and a Notes cell covering: already installed on CEO machine outside repo, retroactive card filled 2026-07-12, dual-role-principle deviation recorded, INSTALL-not-ADOPT rationale, and the mcp-profile future-wrapping note. Tracker diff is exactly 1 insertion / 0 deletions — no other row touched.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| (none) | Docs-only change inside .planning/ — no untrusted input crosses any boundary; no code, no installs, no secrets |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-quick-mno-01 | Information Disclosure | study-cards/scrapling.md pitfall 2 (sudo/credential note) | low | mitigate | Record the credential-hygiene event descriptively only — no password, no command transcript containing secrets; content states the password was blocked from embedding, never the value |
| T-quick-mno-02 | Tampering | INTEGRATION-TRACKER.md rows outside the new insertion | low | mitigate | Edit-tool scoped single-line insertion anchored on the Apify row; automated gate proves diff = 1 insertion / 0 deletions |

Note: this plan performs NO package-manager installs — Scrapling was installed outside the repo prior to this task; its legitimacy verdict (OK, MIT, live-fetch verified) is recorded inside the card itself.
</threat_model>

<verification>
1. Card exists and is filled: `test -f .planning/research/study-cards/scrapling.md` and it contains pinned version 0.4.10, both URLs (github.com/D4Vinci/Scrapling, scrapling.readthedocs.io), and a Lifecycle Checklist with STUDY+INSTALL checked, ADOPT+EMBED unchecked.
2. Tracker row exists exactly once: `grep -c '^| Scrapling |' .planning/research/INTEGRATION-TRACKER.md` returns 1.
3. No collateral tracker edits: `git diff --numstat -- .planning/research/INTEGRATION-TRACKER.md` reports 1 added / 0 deleted lines.
4. Key link intact: the tracker row's Study Card cell reads `study-cards/scrapling.md` and that path exists on disk.
5. Language rule: both new content blocks are English.
</verification>

<success_criteria>
- Scrapling appears in the INTEGRATION-TRACKER Main Tracking Table as one row: Research / INSTALL / 10 / Research/Data scraping / skill / study-cards/scrapling.md, with Notes matching the retroactive-debt tone and flagging the dual-role deviation.
- .planning/research/study-cards/scrapling.md is a complete retroactive study card (yt-dlp card structure) recording all session-verified facts: version pin, install path, API notes, three pitfalls, install command, OK legitimacy verdict, lifecycle state STUDY+INSTALL done / ADOPT+EMBED open.
- Zero changes to any other tracker row or any source code file.
</success_criteria>

<output>
Create `.planning/quick/260712-mno-add-scrapling-github-com-d4vinci-scrapli/260712-mno-SUMMARY.md` when done.
</output>
