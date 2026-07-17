# Study Card: playwright-mcp

- **Tool:** Playwright MCP server (browser automation over MCP)
- **Slug:** playwright-mcp
- **Category:** Ops MCPs (core)
- **Status:** STUDY
- **Target Phase:** 3
- **Owner (dept/tier):** Eng/QA + browser automation
- **Trigger Type:** mcp-profile (core)
- **Source:** github.com/microsoft/playwright-mcp (npm `@playwright/mcp`)
- **Pinned Version:** current at install day (record exact version + tool-description hash at install — Phase 7 pin table)
- **Purpose:** Browser automation for QA gates, dashboard smoke tests, and later research-department browsing — exposed per-department via MCP profiles, never globally.
- **Official Docs URL:** https://github.com/microsoft/playwright-mcp#readme

## Key API / Usage Notes
- Standard MCP server; snapshot/act tool surface (navigate, click, fill, screenshot, network/console read).
- Already present in this session's plugin ecosystem (`mcp__plugin_playwright_playwright__*`) — formal DXB-side install is what Phase 3 records.
- Headless on VPS; browser binaries are heavy — install browsers only where a consumer runs (laptop dev / CI), not in every container.

## Known Pitfalls
- Browser output (page content) is UNTRUSTED input — never let scraped text trigger gated actions or memory writes directly (project Pitfall 6/7 discipline; quarantine tier applies when wired to memory).
- Chromium download on constrained machines: use `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` where only the MCP client side is needed.

## Install Command (recorded — NOT run in Phase 2)
```bash
claude mcp add playwright -- npx @playwright/mcp@latest
# version + description-hash recorded in tool_pins at Phase 7 gateway
```

- **Legitimacy Verdict:** OK — official Microsoft org repo

## Lifecycle Checklist
- [x] STUDY
- [x] INSTALL (2026-07-18 R4.3 — @playwright/mcp@0.0.78 workspace dep; catalog+pins 24 tools; run_code_unsafe/file_upload policy-denied)
- [x] ADOPT (granted engineering+quality; live browser_navigate proof example.com)
- [ ] EMBED
