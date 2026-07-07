# Study Card: @modelcontextprotocol/sdk

- **Tool:** @modelcontextprotocol/sdk (TypeScript MCP framework)
- **Slug:** mcp-sdk
- **Category:** Locked stack (runtime lib)
- **Status:** STUDY
- **Target Phase:** 3
- **Owner (dept/tier):** State Layer / dxb-mcp
- **Trigger Type:** lib
- **Source:** npm registry (`@modelcontextprotocol/sdk`); github.com/modelcontextprotocol/typescript-sdk
- **Pinned Version:** 1.29.0 (npm-verified 2026-07-06)
- **Purpose:** Framework for dxb-mcp — the ONE custom MCP server exposing 8 tool groups (registry, queue, memory-router, dashboard, CRM, approval-gate, cost, audit) over the shared Postgres schema (MCP-01).
- **Official Docs URL:** https://modelcontextprotocol.io + SDK README

## Key API / Usage Notes
- `McpServer` + `registerTool(name, {inputSchema}, handler)`; stdio transport for local agents, **Streamable HTTP** for remote — SSE transport is legacy, do NOT build new servers on it (CLAUDE.md compatibility table).
- Zod-native input validation: SDK 1.29 supports **zod v4 as peer dependency** (resolved per typescript-sdk issues #925/#1429 — cited in 02-RESEARCH).
- One server process, 8 tool groups — 8 separate servers is a rejected anti-pattern (duplicated db logic; isolation is the gateway profile's job).

## Known Pitfalls
- Tool descriptions/schemas are supply-chain surface (project Pitfall 6 — tool poisoning): dxb-mcp's own descriptions get hash-pinned by the Phase 7 gateway like every other server.
- Keep tool handlers thin CRUD/state-machine adapters — no business logic in the MCP layer (architecture boundary).

## Install Command (recorded — NOT run in Phase 2)
```bash
pnpm add @modelcontextprotocol/sdk@1.29.0 --filter @dxb/dxb-mcp
```

- **Legitimacy Verdict:** OK — official modelcontextprotocol org SDK

## Lifecycle Checklist
- [x] STUDY
- [x] INSTALL
- [x] ADOPT
- [x] EMBED
