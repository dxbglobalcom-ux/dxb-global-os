---
phase: 07-mcp-gateway-24-7-vps-runtime
plan: 02
status: complete
completed: 2026-07-09
duration: ~35min
tasks_completed: 3/3
requirements: [MCP-03]
commits:
  - "(this commit) feat(07-02): anti rug-pull layer — tool_pins migration, pin-check hash/quarantine/audit, 21 tools pinned, cron 04:00"
---

# 07-02 SUMMARY — tool_pins + pin-check (MCP-03 anti rug-pull)

**Executed inline by Fable 5 (governance v5 — no subagent).**

## What closed

Master PHASE-07 step 2, first half: every currently-known MCP tool is hash-pinned; a live description change flips `quarantined=true` + audit row in the SAME transaction; quarantine is sticky (no self-heal); the check runs unattended on the existing scheduler. (Second half — quarantined tools excluded from generated profiles — is 07-03's assertion.)

## Evidence (✓ VERIFIED)

| Claim | Executed evidence |
|---|---|
| tool_pins exists, UNIQUE(server,tool), RLS on | `docker exec supabase_db psql -c "\d tool_pins"` → columns id/server/tool/schema_hash/quarantined(default false)/pinned_at/last_checked; `"tool_pins_server_tool_key" UNIQUE CONSTRAINT, btree (server, tool)`; `Policies (row security enabled): (none)` |
| Root build compiles new package | `pnpm build` → tsc --build exit 0 (after @types/node fix, deviation 4) |
| Exports live | `node -e import(...)` → `GATEWAY_EXPORTS_OK` |
| Scheduler registered | grep scheduler.ts → `22: pinCheck: "tool-pin-check"`, `43: pinCheckCron: "0 4 * * *"` (daily 04:00, after 03:00 compaction; same pg-boss per-job error isolation) |
| Fake rug-pull detected+audited+sticky | `pnpm vitest run tests/phase7/pin-quarantine.test.ts` → **5 passed (5)**: (1) pinAll idempotent, mutated re-pin does NOT overwrite hash; (2) description mutation → quarantined=true + audit `tool_quarantined` payload {old_hash,new_hash}, tool B untouched, last_checked both; (3) re-run → no duplicate audit (alreadyQuarantined=1); (4) restored description → hash matches again but **quarantined stays true**; (5) key-order canonicalization (shuffled keys = same hash) |
| No regression | `pnpm vitest run` → **24 files passed, 111 passed / 14 skipped** (skips pre-existing live-SDK/env gates) |
| First production pinAll | `readDxbMcpInventory()` → **21 tools**; `pinAll` → 21 newly pinned, 0 existing; table lists all 21 dxb-mcp tools q=false (approval_*, audit_*, cost_*, crm_get, dashboard_feed, memory_*, queue_*, registry_*) |

## Design decisions (in-code, commented)

- **Hash surface** = `{description, inputSchema}` canonical JSON (recursive key-sort, no whitespace; arrays keep order — JSON-Schema list order is position-stable as served). `title` excluded (master formula: description + inputSchema).
- **Inventory reader** = real MCP `tools/list` over `InMemoryTransport` linked pair against `createDxbMcpServer()` — hashed shape is byte-identical to what an external server serves, so external servers join the same corpus with zero new hashing code. In-process, no child process, no socket (pin-check "no network egress" rule).
- **pinAll** = `onConflict(server,tool) doNothing` — a pin is immutable until human re-approval; a drifted tool cannot re-legitimize itself via re-pin.
- **checkPins** never un-quarantines, never rewrites schema_hash; missing-from-live tools audit `tool_missing` without quarantine flip (disappearance ≠ mutation); live-but-unpinned tools are REPORTED in the result, never auto-pinned by the cron (pinning stays a human-initiated pinAll).
- **actor_type='system'** on audit rows (house CHECK constraint; registry precedent for unattended writers).

## Deviations ([ADAPT])

| # | Deviation | Why |
|---|---|---|
| 1 | Migration filename `20260709000011_tool_pins.sql` (master says "0010") | House timestamp numbering; seq 000010 already taken by `20260709000010_memory_embeddings.sql` (06-06 renumber precedent). SQL body is master §3 byte-for-byte. |
| 2 | Inventory source: registry carries NO MCP-server inventory (verified: `20260707000002_registry.sql` = departments + agents only) | Plan's fallback clause applied — v1 corpus = in-repo dxb-mcp declarations; external-server enumeration lands with 07-03's generator config surface (same registry+policy inputs). |
| 3 | `packages/gateway` skeleton pre-existed (Phase 2 monorepo scaffold; root tsconfig already referenced it) | Task 1 became "wire deps/references" (added @dxb/dxb-mcp, @modelcontextprotocol/sdk, kysely; tsconfig ref ../dxb-mcp) instead of scaffold-from-scratch. |
| 4 | gateway needed `@types/node` + `"types":["node"]` | First `pnpm build` failed TS2591 on `node:crypto`; outbox-executor precedent applied. |
| 5 | Migration applied via `docker exec supabase_db_DxB_Global_OS psql` | Control terminal has no psql binary; container psql is the house method (Phase 3 onward). |

## Key links honored

- `tool_pins.quarantined` ↔ 07-03 `generate-profiles.ts` MUST exclude quarantined tools (test asserted there).
- `checkPins` audit rows (`tool_quarantined`, `tool_missing`) ↔ 07-06 morning review queue anomaly surface; Phase-8 CEO alarm UI reads the same rows.

## For downstream plans

- 07-03: import `computeToolHash`/`checkPins` result shape as-is; exclusion filter = `quarantined=true` rows; external servers enter the corpus via the generator's config read.
- 07-05/06: scheduler now carries 5 routines (tick/reaper/breaker/compaction/memSync) + pin-check — VPS deploy inherits the 04:00 cron unchanged.
