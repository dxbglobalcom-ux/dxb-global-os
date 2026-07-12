---
type: quick
slug: org-chart-professional
created: 2026-07-13
author: fable-5 (inline — recorded adaptation: no planner/executor subagents per construction governance)
trigger: CEO eye-test RET wave 3 (2026-07-13 ~00:20) — org tree on /org reads as raw, unprofessional
---

# Quick Task — Professional Org Chart (E6.3 fix wave 3)

## Problem (CEO eye-test, screenshots 2026-07-13 00:20)

1. Tree rows show raw kebab slugs (`marketing-tiktok-strategist`) — no human titles anywhere in the DB even though every persona file carries one.
2. A "Dormant" status badge on ~198/199 rows = badge wall; the pre-launch default state screams "broken".
3. Departments render alphabetically — no holding logic (leadership / corporate / revenue / technology).
4. Detail panel shows raw slugs for department and director.
5. Archived `_library` agents appeared inside People/HR in the CEO's screenshot — verified stale render: `v_org_graph` v1.2 already excludes them (query returned 0). Needs render evidence only.

Diagnosis facts (verified against live DB + persona corpus):
- `agents` has no title column; `v_org_graph` label = `a.slug`.
- 199/199 live agents have a persona file H1 of the form `# <Title> — `slug` (<dept>)`.
- Reporting chain is CORRECT per persona canon (specialists → director; senior specialists are senior ICs, not team leads). No manager rewiring.

## Tasks

1. **Migration `20260713003000_org_title_v13.sql`** — `ALTER TABLE agents ADD COLUMN title text`; recreate `v_org_graph` (v1.3): employee label = `COALESCE(a.title, a.slug)`, new `slug` column exposed for every kind (company NULL, department d.slug, employee a.slug); director label for departments stays `director_slug` (component resolves title client-side).
2. **Backfill** — generate `UPDATE agents SET title=…` from persona H1s (escape quotes), apply, assert 199 rows titled.
3. **`scripts/sync-personas-to-db.sh`** — submit path also syncs H1 title into `agents.title` (file-first: title flows file→DB).
4. **Frontend** — `org/page.tsx`: select + map `slug`; `org-tree.tsx`: department professional ordering (Leadership → Corporate → Revenue → Product & Technology rank map by slug), status dot instead of badge (badge only draft/probation/suspended), detail panel: department display name, director resolved to title, slug shown as data row.
5. **i18n** — new keys EN+TR as needed (slug label), parity check.
6. **Evidence + close** — view queries, `tsc`, `eslint`, i18n parity, Playwright screenshot of /org (render evidence for archive-leak + new look); roadmap note; STATE quick table; atomic commit.

## Out of scope (recorded)

- Manager-chain team clustering (contradicts persona canon field 6 "Manager: CMO") — org-design decision, CEO-visible note instead.
- Graph v2 (interactive canvas, 7 overlay modes, drag-drop) — separate roadmap line, ⛔ graph-library decision stays open.
- EN canonical titles for pre-directive Turkish personas — existing listed follow-up (language directive).
