# Study Card: codebase-memory-mcp

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü second item 12: "çalıştığın localde terminal başlat, claude'a 'index this project' de").

- **Tool:** codebase-memory-mcp (DeusData) — code-intelligence MCP server: indexes a codebase into a persistent knowledge graph (functions, classes, call chains, HTTP routes, cross-service links)
- **Slug:** codebase-memory-mcp
- **Category:** Ops MCPs / Engineering
- **Status:** STUDY
- **Target Phase:** engineering dept tooling wave (10) — overlap decision vs graphify first
- **Owner (dept/tier):** Engineering agents
- **Trigger Type:** mcp-profile
- **Source:** https://github.com/DeusData/codebase-memory-mcp — MIT, ~31.9k★ ecosystem listing
- **Pinned Version:** latest static binary at INSTALL (single C binary, zero dependencies)
- **Purpose:** Structural code questions at ~120× fewer tokens (measured upstream: 5 questions ≈ 412k tokens file-search vs ≈ 3.4k graph); 14 MCP tools: indexing, call-path tracing, dead-code detection, git-diff impact analysis, ADR management, Cypher-like graph queries; 158 languages via tree-sitter + hybrid LSP type resolution; average repo indexed in seconds.
- **Official Docs URL:** https://deusdata.github.io/codebase-memory-mcp/

## Key API / Usage Notes

- `claude mcp add` a local stdio server over the static binary; then "index this project" per CEO's described flow.
- Token-discipline fit is direct (compression constitution): structural questions stop burning repo-read tokens.

## Known Pitfalls

1. **Overlap gate:** we already run graphify (EMBED) + `.planning/graphs/` graph-first read rule. Before ADOPT, run both on this repo and measure answer quality/token cost — one graph tool wins, two would double index maintenance. Decision recorded then; no silent parallel adoption.
2. Index freshness: same staleness discipline as graphify (rebuild after phase completion) must apply or answers rot.
3. C binary from a young project: sha256-inspect release artifact before running (hermes-agent installer precedent).

- **Install Command:** (deferred to ADOPT decision) download release binary → sha256 check → `claude mcp add codebase-memory -- <binary> serve` → index run measured.
- **Legitimacy Verdict:** OK — MIT OSS, free, local-only (no data egress) → D1 + privacy compliant; overlap decision is the only blocker.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL (after graphify-overlap measurement)
- [ ] ADOPT
- [ ] EMBED
