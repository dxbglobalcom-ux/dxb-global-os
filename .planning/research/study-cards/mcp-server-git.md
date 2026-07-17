# Study Card: mcp-server-git

> FILLED 2026-07-18 (R4.3 Capability Arsenal wave — written WITH the install, same session; closes the would-be blind-install gap the moment it appeared).

- **Tool:** mcp-server-git — official MCP reference server for local git repositories
- **Slug:** mcp-server-git
- **Category:** Ops MCPs (core)
- **Status:** ADOPT
- **Target Phase:** 3 (declared in gateway policy since E9.5 as engineering's `git` grant — catalogued R4.3)
- **Owner (dept/tier):** Engineering
- **Trigger Type:** mcp-profile
- **Source:** https://github.com/modelcontextprotocol/servers (Anthropic-maintained reference servers, PyPI `mcp-server-git`)
- **Pinned Version:** 2026.7.10 (uvx spec `mcp-server-git==2026.7.10` in the catalog entry — measured via importlib.metadata at install)
- **Purpose:** Local repository READ hand for engineering workers: status, diff, log, show, branch — verification-grade evidence for code tasks without shelling out.
- **Official Docs URL:** https://github.com/modelcontextprotocol/servers/tree/main/src/git

## Key API / Usage Notes

- 12 tools served; DXB emits only the 7 READ tools — write tools (`git_commit`, `git_add`, `git_reset`, `git_checkout`, `git_create_branch`) are policy-denied for engineering (construction-phase K1: repo authorship is Fable-only; `policy/denials.json` R4.3 note).
- Catalog entry pins the repository: `uvx mcp-server-git==2026.7.10 --repository ./` (repo-root anchored by the gateway's arg-resolution rule).
- Tools take `repo_path` — the `--repository` flag scopes the server.

## Known Pitfalls

1. Python/uvx runtime: first spawn resolves the package into the uv cache (~1s warm, longer cold). The pin-check missing-sweep scope guard (R4.3) prevents a cold-start hiccup from auditing tools as missing.
2. Version pin is the supply-chain control — never use an unpinned `mcp-server-git` spec in the catalog.
3. On VPS placement, uv must exist on the host (placement checklist, doctrine §10).

- **Install Command:** catalogued in `packages/gateway/policy/grants.json` (`git` server entry); pinned via `scripts/gateway/pin-arsenal.mjs`.
- **Legitimacy Verdict:** OK — official modelcontextprotocol reference server, MIT, no install-time secrets.

## Lifecycle Checklist
- [x] STUDY (2026-07-18 — this card)
- [x] INSTALL (2026-07-18 R4.3 — catalog + 12 tools pinned)
- [x] ADOPT (granted engineering READ set; live git_status proof "On branch master")
- [ ] EMBED
