---
phase: 03-state-layer-dxb-mcp-core
plan: 04
subtitle: "dxb-mcp server — 8 tool groups (4 full + 4 stub), redaction, lifecycle tests"
status: complete
executed_by: "Claude Fable 5 — inline, personally (governance v4)"
completed: 2026-07-07
duration: ~25min
commits:
  - ce820ac: "feat(03-04): dxb-mcp bootstrap + queue group — full LOCKED lifecycle drivable via MCP tools"
  - e3ef711: "feat(03-04): registry + audit + cost groups with recursive secret redaction"
  - (this commit): "feat(03-04): 4 stub faces + 8-group surface proof — MCP-01 complete"
requirements: [MCP-01, QUEUE-01, QUEUE-03, REG-01, REG-02, REG-03]
---

# Plan 03-04 Summary

## What was built

1. **One MCP server** (`createDxbMcpServer()` factory + stdio entrypoint) registering all 8 groups — MCP-01. Tool names underscore-mapped (`queue_create_task` ⇄ logical `queue.create_task`; MCP name grammar).
2. **queue group (6 tools):** create (TaskEnvelope.parse, atomic inbox→queued birth + event + audit in one transaction), claim (claim_next_task SKIP LOCKED + event), transition (LOCKED map via `transitions.ts`, returned requires feedback), return (review→returned wrapper), get, list.
3. **registry group (4):** get_agent (persona_path only — body never crosses, REG-02), list, create_department (REG-03), activate (department-or-agent by slug, audited).
4. **audit group (2):** append with recursive `redact()` (password/token/key/secret/authorization → [REDACTED]) BEFORE insert; trace (task_events + audit_log merged chronologically).
5. **cost group (2):** record (mode-tagged), summary (SUM per dept+model+mode, since filter).
6. **4 stub faces** (memory/dashboard/crm/approval — per-file per master-plan spec): introspectable Zod surfaces, clean "not yet active in this phase" tool error, zero DB touch.

## Verification evidence (executed)

- `pnpm build` → exit 0 (workspace-wide)
- `pnpm test` → `Test Files 5 passed (5)`, `Tests 17 passed (17)` — run TWICE, identical (flake check)
- Lifecycle (real MCP protocol over InMemoryTransport, live local stack): happy chain events ≥4 with correct from/to; returned path stores feedback + re-claim by new worker; illegal `queued→done` rejected naming claim-only rule; feedbackless return rejected
- 8-group surface: tools/list ≥17 spanning all prefixes; stub call → isError + exact message
- Redaction proven by DB READ-BACK: `{api_key, nested.authorization, list[0].token}` all `[REDACTED]`, sibling values intact
- audit_trace merged + chronological (sorted invariant asserted); cost_summary aggregates 400 tokens / €0.04

## Deviations from plan

1. **kysely + @types/node added to dxb-mcp deps** (imports `sql` tag + Node types) + explicit `types: ["node"]` in its tsconfig — @types auto-inclusion didn't fire in the composite child project.
2. **@modelcontextprotocol/sdk added to ROOT devDependencies** — root-level tests import Client/InMemoryTransport directly; catalog-pinned, same version.
3. **vitest `fileParallelism: false`** — two integration files share one Postgres; parallel files cross-claimed each other's queued tasks. Sequential at DXB scale is correct, recorded.
4. Stub helper factored to `groups/stub-error.ts`; stubs kept one-file-per-group per master-plan file spec.

## Fable verdict

**APPROVED — authored and verified personally.** All five must-have truths hold with executed evidence: single server/8 faces, full lifecycle + returned path drivable purely through tools, illegal transitions rejected with allowed-next lists, redaction DB-proven, department create+activate audited with persona bodies provably absent.

## Next

Wave 4: 03-05 — crash test (kill -9 + reaper), 10/10 lifecycle battery, tracker EMBED, 03-VERIFICATION.md.
