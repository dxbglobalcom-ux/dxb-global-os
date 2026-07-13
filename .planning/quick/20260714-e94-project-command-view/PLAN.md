# E9.4 — Project OS: Command View (§23 19 fields) + health fn

**Execution ticket only — zero new design decisions.** Plan lives ONCE in `HOLDING-OS-MASTER-PLAN/` (CEO ruling 2026-07-13). Deviations become registered adaptations in the SPEC, never invented here.

## Spec pointers (read THESE sections, nothing broader)

| Source | Section | Binding content |
|--------|---------|-----------------|
| `PROJECT_OPERATING_SYSTEM_SPEC.md` | whole file (153 lines) | data model §4 (0023x-b SHIPPED — tables live), fns §5/6, Command View §7, API §8, events §9, **health formula §10 (binding)**, authz §13, security §16 (links credential regex gate), errors §17, tests §20/21 (dogfood acceptance), §24 verification commands, edges §27 |
| `00-CEO-DIRECTIVE-BEKLENTILER.md` | §23 (line 899) | the 19 fields; "Gantt-like allowed, classic PM tool look FORBIDDEN; premium + operations-focused" |
| `API_CONTRACTS.md` | 8b projects row | ops: create, update, set_status, add_milestone, set_dependency, add_member, log_risk |
| `EVENT_MODEL.md` | §9b projects channel | project.created, project.status_changed, milestone.reached, dependency.blocked |
| `DESIGN_SYSTEM.md` | header + "Registered directive — design source hierarchy" | Iron Man/JARVIS primary; RULE #0 pass |
| `CEO_COMMAND_CENTER_SPEC.md` | ProjectCommandView row (§23 pointer) | screen 7 of §37 ten |

## Base already live (verified against DB 2026-07-14)

- 0023x-b migration `20260711002350_project_os_ext.sql`: project_members / project_milestones / task_dependencies (+acyclic trigger) / project_risks / projects.links / workflows.project_id — ALL present in DB.
- `v_project_command` (list-level counts, `20260711002500_api_support.sql`) — E9.4 REPLACES it with health + breakdown + blockers + tokens.
- Dogfood row `dxb-global-os` exists with real purpose/strategy/links; `hr-sandbox` second row.
- `/ops/projects` = ModuleWaiting stub (pageKey projects, step E9.4); nav entry exists (command-nav.ts:102).
- NO project_health fn, NO control_project fn, NO projects-channel triggers yet.

## Interpretations (to be REGISTERED in PROJECT_OPERATING_SYSTEM_SPEC as adaptations at close)

1. **A1 control seam**: single `control_project_action(p_payload, p_idempotency_key)` with op ∈ {create, update, set_status, add_milestone, set_dependency, add_member, log_risk} — established E9.1/E9.3 idiom; satisfies API_CONTRACTS 8b op list (spec §5 wrote `control_project_{...}` family).
2. **A2 route**: spec §7 `/projects/[slug]` maps to `/ops/projects` (list) + `/ops/projects/[slug]` (Command View) inside the (command) shell — nav has pointed at /ops/projects since E2.
3. **A3 milestone automation**: spec §9 milestone.reached needs a task↔milestone link absent from §4 → add `tasks.milestone_id uuid NULL REFERENCES project_milestones(id)` (registered addition); DB trigger on task status→done marks reached_at when ALL milestone tasks closed + broadcasts.
4. **A4 health**: `project_health(project_id)` computes live per §10; `v_project_command` exposes score + per-component breakdown columns; `projects.health_score` stays as last-known cache for §17 stale fallback.
5. **A5 tokens**: token usage = agent_runs sums correlated via tasks.project_id (single-source corr chain, §11 "no column duplication").
6. **A6 blockers**: computed (never stored, §6): project tasks with unfinished depends_on + pending project-scoped approvals.

## Deliverables

1. Migration `20260714*_project_command.sql` (ONE file, idempotent 2×): project_health fn (§10 formula verbatim, components as separate returns), v_project_command replace (19-field single round-trip + breakdown), control_project_action (7 ops; CEO wall; idempotency twin; links credential regex `://.*:.*@` reject §16; archive-with-running-workflow reject §27; dependency cycle → VALIDATION_FAILED with path §17; milestone seq conflict → CONFLICT_STALE), tasks.milestone_id, milestone-reached trigger, projects-channel broadcast triggers (4 event types, fn_opslive_notify pattern), grants/RLS per E9.3 pattern.
2. `/api/control/projects` route (Zod, Idempotency-Key header — E9.3 route idiom).
3. `/ops/projects` real list (ModuleWaiting DIES) + `/ops/projects/[slug]` Command View — §7 composition: top strip (purpose, strategic importance, health+breakdown, phase) · center time axis (phase blocks + milestone markers + today line — NO task-bar forest) · left staff/departments (labels "core staff" vs "actually worked" §27) · right rail risks/decisions/approvals/blockers · bottom cost+token trend + links. Every number drills down (G2). EN+TR.
4. Dogfood: dxb-global-os enriched with REAL milestones (roadmap E-blocks, real ✓ dates) + real recorded risks via control fn (audit trail) — records PERSIST (acceptance data, not demo residue).
5. Tests `tests/e9/project-command.test.ts`: health formula per-component unit scenarios, cycle rejection, milestone reached automation, control fn battery (idempotency twin, CEO wall, links regex reject, archive reject, seq conflict), B7b untouched regression.

## Evidence contract (Evidence-Before-Done)

- vitest tests/e9 green + full approval/workflow regression green
- §24 probes: `\dt project_*` → 4 tables; `SELECT project_health(id) FROM projects` → 0-100; v_project_command slug=dxb-global-os → health + breakdown columns non-null
- migration idempotent 2× proof
- RULE #0: EN+TR × 1280+1920 both routes, CHECKLIST walk, i18n-purity-check.sh PASS, design-bank baselines (PENDING CEO eye), acceptance audit: "19 fields on screen, every number clickable, no classic-PM look"
- mutation hygiene: demo probe mutations reverted; dogfood records stay (acceptance data)
- adaptations A1-A6 written into PROJECT_OPERATING_SYSTEM_SPEC; roadmap E9.4 row ✓; STATE.md updated
- commit `feat(E9.4): ...` (Fable, K1)
