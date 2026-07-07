# Study Card: Zod

- **Tool:** zod (TypeScript schema validation)
- **Slug:** zod
- **Category:** Locked stack (runtime lib)
- **Status:** STUDY
- **Target Phase:** 3
- **Owner (dept/tier):** All boundary payloads (MCP tool inputs, queue envelopes, approval payloads)
- **Trigger Type:** lib
- **Source:** npm registry (`zod`); github.com/colinhacks/zod
- **Pinned Version:** 4.4.3 (npm-verified 2026-07-06; CLAUDE.md locks the 4.x line)
- **Purpose:** Schema validation everywhere a payload crosses a boundary: TaskEnvelope, ClassifiedIntent, memory Recall/Commit inputs, approval payloads. MCP SDK uses it natively for tool input schemas.
- **Official Docs URL:** https://zod.dev

## Key API / Usage Notes
- `z.object/enum/array` + `.default()` + `z.infer<typeof X>` — MASTER-PLAN embeds the exact TaskEnvelope/ClassifiedIntent schemas (PHASE-03/05 files); those are LOCKED, transcribe don't redesign.
- v4 line required: MCP SDK 1.29 takes zod v4 as peer dependency (github.com/modelcontextprotocol/typescript-sdk #925/#1429 resolved — cited in 02-RESEARCH).
- Shared schemas live once in `@dxb/shared` — no per-package redefinition.

## Known Pitfalls
- Version-mismatch trap: mixing zod v3 types with v4 consumers breaks peer resolution — single catalog-pinned version workspace-wide (pnpm catalog protocol).

## Install Command (recorded — NOT run in Phase 2)
```bash
pnpm add zod@4.4.3 --filter @dxb/shared
```

- **Legitimacy Verdict:** OK — established (211.6M weekly downloads; audited in 02-RESEARCH legitimacy table)

## Lifecycle Checklist
- [x] STUDY
- [x] INSTALL
- [ ] ADOPT
- [ ] EMBED
