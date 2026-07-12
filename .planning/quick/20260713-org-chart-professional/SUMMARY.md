---
type: quick
slug: org-chart-professional
status: complete
completed: 2026-07-13
author: fable-5 (inline)
commit: pending (this wave's single atomic commit)
---

# Summary — Professional Org Chart (E6.3 fix wave 3)

## What changed

| # | Change | File(s) |
|---|--------|---------|
| 1 | `agents.title` column + `v_org_graph` v1.3 (employee label = COALESCE(title, slug); `slug` exposed as own column for every kind) | `supabase/migrations/20260713003000_org_title_v13.sql` |
| 2 | 199/199 live agents backfilled with the human title from their persona file H1 | one-off SQL (generated from `personas/*/*.md`, applied to live DB) |
| 3 | Sync script also flows H1 title → `agents.title` on submit (file-first) | `scripts/sync-personas-to-db.sh` |
| 4 | Holding chart order (Leadership → Corporate → Revenue → Product & Technology), badge diet (dormant = muted text, badge only draft/probation/suspended), detail panel: department display name, director title, Agent ID row; employees link queries by slug | `apps/dashboard/src/components/org/org-tree.tsx`, `apps/dashboard/src/app/(command)/org/page.tsx` |
| 5 | i18n `command.orgTree.idLabel` EN+TR | `apps/dashboard/messages/en.json`, `tr.json` |
| 6 | Roadmap E6.3 row: fix wave 3 recorded | `HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md` |

## Evidence (executed)

- Migration + backfill: `ALTER TABLE / CREATE VIEW` ok; backfill `grep -c "UPDATE 1"` → **199**; coverage query → `titled=199 / live=199`.
- View labels: platform subtree returns "Platform Direktörü (Platform Head)", "SRE (Site Reliability Engineer — …)" etc. with slug column intact.
- Archived leak: `SELECT count(*) FROM v_org_graph WHERE label IN (study-abroad-advisor, …)` → **0**; rendered page text contains **0** archived slugs → CEO screenshot was a stale render (pre-v1.2).
- `tsc --noEmit` → 0; `eslint` org files → 0; i18n parity en **599** = tr **599**, diff none.
- Playwright authed render of `/org`: human titles, holding order (CEO Office → Strategy → Finance → Legal …), no dormant badge wall; node click → detail panel shows "Platform, Infrastructure & Reliability", Agent ID `platform-head`, Draft badge.

## Wave 3b (same night, two further CEO RETs)

- **TR titles on the EN locale** (A2 violation) → `agents.title_tr` + `v_org_graph` v1.4; backfill language-split from persona H1s (TR-char/word detection, six TR-only titles given mechanical English equivalents, full 199-row list reviewed by Fable personally); RSC picks label by locale. Evidence: EN render 0 Turkish-title tokens (`grep -c` on page snapshot), TR render shows "Finans Direktörü" etc.; DB check `title ~ TR chars` → 0; `with_tr=67`. Sync script now flows title only from the dossier EN `Title` field so a resync cannot re-pollute the EN column.
- **Detail panel a full workforce away** (fully-expanded tree ≈220 rows pushed the panel off-screen; below @3xl container width it even stacked UNDER the tree) → tree scrolls inside its own `max-h-[70vh]` box, detail panel `order-first` on narrow layouts and sticky at @3xl. Evidence: Playwright — deep node click (Social Media director), screenshot shows detail panel fully visible at top of viewport with the clicked row still in view.

## Wave 3c (CEO order: "do what the spec says — madde 5.3, now")

The spec's `v_org_node_detail` contract (ORGANIZATION_ENGINE_SPEC §12) had never been implemented — the v1 panel echoed the tree. Closed tonight:

- **Migration `20260713013000`** — `v_org_node_detail`: full madde 5.3 field set per live employee (identity EN/TR, assignment incl. TRUE manager resolved cross-department, runtime counters: brain/model status/autonomy/MCP profile/active tasks/active runs/30d cost/memory count, governance: persona FK + version + quality gate + author, sicil flag + KPI count, capability: skills + grants). Persona content stays LAZY per spec.
- **Route `GET /api/org/node?id=`** — session-guarded read seam; `?include=persona` returns latest `body_md`.
- **Panel v2** — Governance section (persona version + gate badge + author, sicil state), Runtime section (all counters, honest zeros + Phase-7 hint), clickable manager (jumps selection — fixes the "No manager (root)" lie for directors), **in-panel persona reader** (first place in the whole UI where the CEO can read a persona).
- i18n +24 keys EN+TR (623 = 623).

Evidence: view 199 rows / 0 without persona; CMO row shows manager "Holding Orchestrator", persona v1 gate passed, 32 reports; Playwright: CMO click → all sections filled, "Personayı oku" loads the full dossier text in-panel; tsc 0, eslint 0.

**Found gap (recorded, not silently fixed):** `employee_records` (sicil) has ZERO rows — the HR wave never populated the record layer (spec HR_OPERATING_SYSTEM). Panel shows "No employment record yet" honestly. Separate data task; belongs to the HR/E-step owner.

## Post-ship trust audit (CEO challenge: "is any of this actually wired?")

Executed 2026-07-13 ~01:20, all on the live stack:

1. **Live-wiring probe (transactional, zero residue):** inside one transaction injected a €1.23 `cost_ledger` row + 1 `running` task + 1 `memory_index` row for `cmo`, read `v_org_node_detail` → `cost_30d_eur=1.23, active_tasks=1, memory_count=1`; ROLLBACK → all three back to 0. Counters are live SQL against real tables, not decoration. (The three failed first attempts also prove schema CHECK constraints enforce enum discipline.)
2. **Route guard:** unauthenticated `GET /api/org/node?id=…` → 307 to /login (middleware wall in front of the route's own 401).
3. **Header counter:** "6 active tasks" = tasks table `queued 5 + running 1` — real DB, not hard-coded.
4. **Manager click-through:** Playwright — CMO panel → click "Holding Orkestratörü" → panel re-fetches and shows the orchestrator (employees link flips to `q=agents-orchestrator`).
5. **Mutation seam history:** `audit_log` holds `org.employee.suspended/reactivated/moved` ×2 each from the E6.3 fn-layer battery.

## Explicitly out of scope (CEO-visible notes)

- **Reporting lines untouched** — persona canon (dossier field 6) puts every specialist directly under the department director; senior specialists are senior ICs, not team leads. Inventing a team-lead layer would contradict the persona files. If the CEO wants mid-management clusters (e.g. the China cluster in marketing), that is an org-design decision → persona edits first, then DB.
- Directors show "No manager (root)" in the detail panel (view parents them to the department node). Graph v2 (`v_org_node_detail`) fixes this properly.
- Turkish titles on pre-directive personas stay until the optional translation pass (language directive follow-up).
