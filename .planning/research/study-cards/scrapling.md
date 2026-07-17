# Study Card: Scrapling

> FILLED 2026-07-12 (quick task 260712-mno). RETROACTIVE — installed this session before the card existed; INTEG-01 study-before-install order was not followed (recorded deviation, not silent; same debt class as the superpowers/GSD/caveman rows).
> REFRESHED 2026-07-17 (R4.1 Library research pass — D8 item 5, D4 priority trio): installed version measured 0.4.10 (`pip show`); upstream now ships a **built-in MCP server** for AI-assisted scraping — this dissolves Pitfall 3's "no TS/Node bridge" problem: the DXB bridge path is an MCP profile entry, no subprocess/HTTP wrapper needed. MEASURED gap: the venv lacks the `camoufox` package (browserforge+playwright only) → `StealthyFetcher` is not yet runnable; fix at ADOPT together with [[camoufox]] card step. ADOPT target: Revenue Engine research chain (REVENUE_ENGINE_SPEC G7).

- **Tool:** Scrapling — Python web scraping library (stealthy fetchers, adaptive selectors)
- **Slug:** scrapling
- **Category:** Research
- **Status:** INSTALL (retroactive: studied + installed, NOT wired into any DXB code path — not ADOPT)
- **Target Phase:** 10
- **Owner (dept/tier):** Research/Data scraping
- **Trigger Type:** skill; note mcp-profile as a possible future wrapping pattern — Scrapling is Python and DXB's stack is TS/Node, so no native MCP/skill bridge exists yet (would need a subprocess or HTTP wrapper)
- **Source:** https://github.com/D4Vinci/Scrapling — MIT license, active project
- **Pinned Version:** 0.4.10 (installed via pip with the `"scrapling[all]"` extras spec into an isolated venv at `~/scrapling-env`, because the OS's system Python is externally-managed per PEP 668)
- **Purpose:** TBD — no concrete DXB use case identified yet; installed ahead of a specific consuming feature, deviating from the dual-role principle (tools install at the START of the phase that uses them). Deviation recorded, not silent.
- **Official Docs URL:** https://scrapling.readthedocs.io/en/latest/

## Key API / Usage Notes

- Import path: `from scrapling.fetchers import Fetcher` — `Fetcher.get(url)` returns a Response exposing `.status` and `.css(selector)`
- `StealthyFetcher` for anti-bot bypass (Camoufox-based)
- `scrapling shell` — interactive CLI
- Extras are REQUIRED: only the `"scrapling[all]"` install unlocks Shell/fetchers — a bare `pip install scrapling` raises ModuleNotFoundError on CLI use

## Known Pitfalls

1. Debian/Ubuntu system Python is externally-managed (PEP 668) — a venv is mandatory; never use the pip break-system-packages escape hatch.
2. `scrapling install` (browser dependency installer) needs sudo for OS-level Playwright deps (libnss3 etc.) — this required an interactive sudo password prompt run by the CEO directly in their own terminal, never passed through an automated command string (credential hygiene: mid-session, the harness's own safety classifier blocked a password from being embedded in a shell command).
3. Python library with zero native bridge into DXB's TS/Node monorepo — needs a subprocess call or a small HTTP wrapper service to be reachable from any DXB agent/MCP.

- **Install Command:** `python3 -m venv ~/scrapling-env && ~/scrapling-env/bin/pip install "scrapling[all]"` — then `~/scrapling-env/bin/scrapling install` (Playwright browser binaries + OS deps; the latter needs manual sudo).
- **Legitimacy Verdict:** OK — active MIT-licensed project (D4Vinci/Scrapling), no install-time secrets, standard PyPI distribution; verified working with a live fetch test against example.com (200 status, correct DOM parse) both from $HOME and from inside the DxB Global OS repo directory.

## Lifecycle Checklist
- [x] STUDY (2026-07-12 — this retroactive fill)
- [x] INSTALL (2026-07-12 session — ~/scrapling-env venv + browser deps, live fetch verified)
- [ ] ADOPT
- [ ] EMBED
