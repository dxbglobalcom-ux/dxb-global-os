# EVIDENCE — W4b: his auditor's three findings on the W4 report verified and corrected; his cast addition registered (2026-09-15)

His words: "önce bak gerçekten doğru mu bu SS'teki hususlar" — measured, all three true.

| Claim (his auditor) | Measured 2026-09-15 | Correction |
|---|---|---|
| "7 commits" wrong — 6 | `git rev-list --count master..HEAD` → 6 | chat slip; noted in EVIDENCE-W4 and STATE; no file carried 7 |
| "+1 → 115" is a key count; real entries 112 | `jq 'keys|length'` → 115; non-object keys `_doc _fields _null_verbatim`; object entries → 112 | count notes appended to EVIDENCE-W1 / W2 / W4 (their bodies kept) |
| "16 seats" hides the gap: the two assigned seats cannot work the road | `design.mcp.json` / `marketing.mcp.json` → 0 `media_*` tools (`media-studio.mcp.json` → 5); `queue.ts:87` (`queue_create_task`) and `:213` (`queue_dispatch`) refuse `belongs to '<dept>', not '<author dept>'`; ledger `media-studio-department-and-16-experts-2026-09-03` "2 existing experts assigned"; `library_grants.grantee_kind` allows `employee` (0 rows use it); `agents.mcp_profile` is per employee | the truth written on B43's BUILT block and STATE; remedy = W9, planned below for his approval, built only after it |

## W9 — the assigned seats, the plan put to him (nothing built)

1. **The assignment becomes a record**, not persona text: one row per assigned seat (seat, studio department, seat title, since 2026-09-03, the ledger id) — a small `agent_assignments` table by migration on both engines, registered in DATA_MODEL as an adaptation.
2. **The drawer grant per employee**: the `mcp/dxb-mcp/media` library item granted with `grantee_kind='employee'` to the two seats (the mechanism exists, unused); the profile compiler emits a per-employee profile = the home department's kit + the media group, and `agents.mcp_profile` of the two seats points at it. Nobody else in design or marketing gains a media tool.
3. **The dispatcher accepts an assigned seat**: `queue_create_task` and `queue_dispatch` accept a seat whose department differs from the author's when an assignment row binds it to the author's department; a stranger stays refused (the existing test keeps passing; two new tests: a sheet naming `design-image-prompt-engineer` dispatches; the seat's run mounts the media group).
4. **Records**: A19 registered adaptation (one task per named seat of the author's department OR a seat assigned to it), CAPABILITY_ARSENAL §9 media row, B43's BUILT block, STATE; the battery; scheduler restart when in-flight = 0.
Blast radius named: `queue.ts` (both doors), the profile compiler and the two profile files, `agents.mcp_profile` for two rows, the worker's staffing (staffed tasks run the named seat — unchanged), A19. Rollback: drop the two grants and the assignment rows, regenerate profiles, revert the two door checks.

## His cast addition, registered

`cast-law-client-may-order-female-content-2026-09-15` — the holding's own cast stays men and elderly women; a client's brief may ask for female-presenter content and it is produced, on the client's responsibility. Written on B43 (g) and STATE; the casting seats carry it in W5 in exactly that scope.

Gates: `pnpm verify:ledger` and `bash scripts/i18n-purity-check.sh` — see the commit.
