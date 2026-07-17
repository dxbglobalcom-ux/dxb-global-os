# Study Card: Context7

- **Tool:** Context7 MCP (live, version-correct library documentation)
- **Slug:** context7
- **Category:** Ops MCPs
- **Status:** STUDY
- **Target Phase:** 3
- **Owner (dept/tier):** Eng — reduces worker-model hallucination on library APIs
- **Trigger Type:** mcp-profile
- **Source:** github.com/upstash/context7 (hosted MCP; also bundled as a GSD-integrated plugin in this session)
- **Pinned Version:** hosted service — pin the MCP endpoint + tool-description hash at install (Phase 7 pin table)
- **Purpose:** On-demand, current library docs (`resolve-library-id` → `query-docs`) so engineering agents code against real APIs instead of trained memory — directly serves the "no guessing" rule.
- **Official Docs URL:** https://context7.com

## Key API / Usage Notes
- Two-tool surface: `resolve-library-id(name)` → `query-docs(id, query)`; cheap to call, safe default for eng profiles.
- Already available in this session via GSD integration — formal study card + tracker row is what makes it INTEG-01-auditable; DXB-side EMBED happens when eng department profiles are generated (Phase 7/10).

## Known Pitfalls
- Hosted third-party: returned doc content is external input — fine as reference context, but never a source of secrets/config; tool-description hash-pinning applies (anti rug-pull, MCP-03).
- Availability dependency: agents must degrade gracefully (fall back to official docs URL fetch) if the service is down — no hard build-time dependency.

## Install Command (recorded — NOT run in Phase 2)
```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
# or hosted HTTP endpoint per docs; hash-pinned at Phase 7
```

- **Legitimacy Verdict:** OK — Upstash org, widely adopted; treat output as untrusted reference input

## Lifecycle Checklist
- [x] STUDY
- [x] INSTALL (2026-07-18 R4.3 — @upstash/context7-mcp@3.2.4 workspace dep; catalog+pins 2 tools)
- [x] ADOPT (granted engineering; live resolve-library-id proof → /reactjs/react.dev)
- [ ] EMBED
