# Study Card: Camoufox

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü items 9+18, listed twice, deduplicated here; D4 priority trio member).

- **Tool:** Camoufox — anti-detect Firefox fork for scraping/AI agents (C++-level fingerprint injection, not JS patching)
- **Slug:** camoufox
- **Category:** Research
- **Status:** STUDY
- **Target Phase:** 10 (Revenue Engine research architecture, D4 — consumed via Scrapling first)
- **Owner (dept/tier):** Research/Data scraping
- **Trigger Type:** lib (Python; reached through Scrapling's StealthyFetcher in our stack — no direct DXB TS bridge)
- **Source:** https://github.com/daijro/camoufox — MPL-2.0, 10.2k★, 866 forks
- **Pinned Version:** v152.0.4-beta.27 (2026-07-16 release; PyPI `camoufox`, dev builds `cloverlabs-camoufox`)
- **Purpose:** Stealth browser layer for anti-bot-protected targets in the opportunity-scan research chain (REVENUE_ENGINE_SPEC G7). Fingerprint spoofing (navigator, screen, WebGL, WebRTC IP, geolocation/timezone, fonts), human-like mouse movement, uBlock built in, ~200MB debloated runtime, Playwright-compatible sync/async Python API via BrowserForge fingerprints.
- **Official Docs URL:** https://camoufox.com/python/usage/

## Key API / Usage Notes

- `from camoufox.sync_api import Camoufox` → context manager yields a Playwright-compatible browser; `browser.new_page()`, `page.goto(...)`.
- In DXB the primary consumption path is **Scrapling's `StealthyFetcher`** (Camoufox-based) — one venv, one API surface, no separate integration.
- Standalone install only if an agent needs raw browser control beyond what Scrapling exposes.

## Known Pitfalls

1. **MEASURED 2026-07-17:** `~/scrapling-env` does NOT contain the `camoufox` package (`pip list` → browserforge 1.2.4 + playwright 1.61.0 only) — Scrapling's `[all]` extras did not pull it. `StealthyFetcher` will fail at first use until `pip install "scrapling[fetchers]"`/`camoufox` is added — do this at ADOPT, verify with a live StealthyFetcher fetch.
2. Beta line (v152 beta): upstream itself says not stable-production-grade; maintainer had a year maintenance gap (personal), now active again via CloverLabs/VulpineOS partner repos. Pin exact version; keep a plain-Fetcher fallback path.
3. Firefox engine: WAFs that fingerprint Spidermonkey behavior can still classify it — cannot impersonate Chromium. Sites that hard-require Chrome fingerprints need a different tool.
4. Browser binary download at install time (~hundreds of MB) — VPS disk + RAM budget check before Phase-10/VPS placement; X230 is control-terminal only.

- **Install Command:** (deferred to ADOPT, dual-role principle) `~/scrapling-env/bin/pip install camoufox && ~/scrapling-env/bin/python -m camoufox fetch` (downloads the browser build); then live-verify `StealthyFetcher.fetch(...)`.
- **Legitimacy Verdict:** OK — MPL-2.0, large community (10.2k★), standard PyPI, no install-time secrets. Use bounded by our robots/ToS research policy and approval gates; stealth capability is for anti-bot resilience in halal research, not access violations.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [x] INSTALL (2026-07-18 R4.3 — v152.0.4-beta.27 into ~/scrapling-env + browser build fetched)
- [x] ADOPT (consumed via Scrapling StealthyFetcher — live fetch verified STATUS 200)
- [ ] EMBED
