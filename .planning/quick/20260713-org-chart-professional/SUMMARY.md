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

## Explicitly out of scope (CEO-visible notes)

- **Reporting lines untouched** — persona canon (dossier field 6) puts every specialist directly under the department director; senior specialists are senior ICs, not team leads. Inventing a team-lead layer would contradict the persona files. If the CEO wants mid-management clusters (e.g. the China cluster in marketing), that is an org-design decision → persona edits first, then DB.
- Directors show "No manager (root)" in the detail panel (view parents them to the department node). Graph v2 (`v_org_node_detail`) fixes this properly.
- Turkish titles on pre-directive personas stay until the optional translation pass (language directive follow-up).
