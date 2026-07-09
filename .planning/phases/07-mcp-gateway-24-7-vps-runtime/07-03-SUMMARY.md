---
phase: 07-mcp-gateway-24-7-vps-runtime
plan: 03
status: complete
completed: 2026-07-09
duration: ~30min
tasks_completed: 3/3
requirements: [MCP-02]
commits:
  - "(this commit) feat(07-03): least-privilege profiles — denials.json + grants.json policy, generate-profiles, 14 dept profiles emitted, doc reds grep-proven"
---

# 07-03 SUMMARY — denials.json + generate-profiles (MCP-02 least-privilege)

**Executed inline by Fable 5 (governance v5 — no subagent).**

## What closed

Master PHASE-07 step 3: per-department `.mcp.json` profiles are COMPILED from registry departments + policy (grants/denials) + tool_pins — never hand-written. Default-deny (absence = denied), denials as hard overrides on top of grants, quarantined pins excluded at generation (MCP-03's two halves meet here). 14 production profiles emitted with `_generated_at` + `_source_hash` headers.

## Evidence (✓ VERIFIED)

| Claim | Executed evidence |
|---|---|
| denials.json parses, ceo+research present, ⛔ note in-file | `node -e require(...)` → `DENIALS_OK 14` (14 dept keys; every worker dept denies stripe+docusign) |
| Build + export | `pnpm build` exit 0; `import()` → `GENERATE_OK` |
| Registry rows for ceo/research | migration 20260709000012 applied → `SELECT` → `ceo dormant / research dormant` (idempotent ON CONFLICT DO NOTHING) |
| Master step-3 grep proof | `grep -c stripe profiles/research.mcp.json` → **0**; `grep -cE 'github|"git"' profiles/ceo.mcp.json` → **0** |
| Production emission | `generateProfilesFromPolicy` → sourceHash `df8ea178af2ec687…`, **14 profiles**; engineering `_tools["dxb-mcp"]` = 21 tools (wildcard expanded to explicit pinned list); pending_install correctly reported (engineering: context7,git,github; finance: stripe; legal-de: docusign — not installed until Phase 10/11, NOT emitted so profiles stay loadable) |
| Doc reds + positive control + quarantine exclusion + determinism | `pnpm vitest run tests/phase7/profile-denial.test.ts` → **4 passed (4)**: research no stripe/docusign; ceo no github; worker neither; benign server present in all (positive control); quarantined `create_charge` excluded even from a dept that ALLOWS the server (explicit-grant path); unknown policy slug throws; re-run byte-identical |
| No regression | `pnpm vitest run` → **25 files passed, 115 passed / 14 skipped** |

## Design decisions (in-code, commented)

- **Denials beat grants** (T-07-10): a denial entry removes a server/tool even when granted — a future grant mistake cannot resurface a doc red.
- **`"*"` grant on a PINNED server expands to the explicit non-quarantined tool list** — tighter than a wildcard, byte-stable, and quarantine-aware. On an unpinned server `"*"` stays (quarantine unknowable pre-install); dot-denials surface as `_denied_tools` for the 07-04 runtime layer.
- **Only catalogued servers emit**: granted-but-uncatalogued → `pendingInstall` in the manifest, never in the profile (emitted `.mcp.json` always loadable).
- **Policy/registry drift = hard error**: a grants/denials key absent from the registry throws (stale policy is visible, not silently skipped).
- **Determinism**: `generatedAt` injected; `sortKeysDeep` before stringify; test asserts byte-identical re-run. `_source_hash` = sha256(canonicalJson(departments+pins+denials+policy)) — hand-edits/staleness detectable (T-07-08).

## Deviations ([ADAPT] — CEO confirmation items marked)

| # | Deviation | Why |
|---|---|---|
| 1 | **NEW `policy/grants.json`** (allowlist + server catalog) beyond plan's file list | Registry carries NO tool-grant surface (departments/agents only, 07-02 verified). Default-deny needs a positive grant source; per LOCKED decision ("registry + policy dosyası") it lives as policy data keyed by registry slugs. ⛔ FABLE-ONLY widening note in-file, same as denials. |
| 2 | **Registry seeded with `ceo` + `research`** (migration 20260709000012) | Master step 3 demands profiles/ceo + profiles/research; persona import seeded only the 12 on-disk departments. Doc itself mandates Research dept creation + a CEO map row. Both dormant. |
| 3 | **Denial assumption: finance denies docusign, legal-de denies stripe** — ⚠ CEO CONFIRM | Doc line 39 says "Stripe/DocuSign visible only to the finance/legal specialist's .mcp.json" without splitting. Least-privilege reading applied: Stripe→finance only, DocuSign→legal-de only. Widening = ⛔ Fable change. |
| 4 | **Marketing/sales deny WHOLE `github` server in v1** (doc red is "no GitHub write" / "no prod code") | Write-only dot-entries need the real github MCP tool names — guessing them violates "no guessing". Tighter-than-doc is safe; relaxation to write-only dot-denials lands at Phase-10 github install from live tools/list (⛔ Fable). |
| 5 | **Research denies whole `postgres` server** (doc red: "no prod-DB write") | Same no-guessing rule pre-install; research data access flows through dxb-mcp memory tools anyway. |
| 6 | v1 grants MINIMAL (dxb-mcp for all; stripe→finance; docusign→legal-de; github/git/context7→engineering) | Doc's full ~10 per-dept tables aren't in the extract; they land wave-by-wave at Phase 10 department activation. Every addition = ⛔ Fable. |

## Key links honored

- 07-02 `tool_pins.quarantined` → generation-time exclusion asserted (quarantine cross-check test).
- Emitted default-deny profiles → 07-04 runtime "tool not found" proof reads these same files.
- `generateProfilesFromPolicy` exported for 07-04/06 (regeneration after registry/policy change; study-card staleness rule).

## For downstream plans

- 07-04: load `packages/gateway/profiles/<dept>.mcp.json` in a session; assert Stripe call → "tool not found" (master step 4). Profiles regenerate via `generateProfilesFromPolicy(db)`.
- Phase 10: department activation adds grants (⛔ Fable each) + installs external servers → catalog entries → pending_install drains.
